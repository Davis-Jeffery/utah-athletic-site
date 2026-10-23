// POST /api/broadcast/ { id }: sends a group email queued from the Studio's Registrations page.
// The page saves an emailBroadcast (status "queued") as the signed-in editor, then calls this with
// its id. Only Studio users can create those documents (their ids are hidden from anonymous reads),
// and the recipients are worked out here from the saved filter, never taken from the request, so
// this can't be used to email arbitrary addresses. Each document sends once.
import type { APIRoute } from 'astro';
import { brandEmails, env, groupMessage, json, sanity } from '../../lib/server';
import { STUDIO_ORIGINS } from '../../lib/server/origins';
import { PROGRAM_LABEL, SOURCES, matches, recipientsOf, type Audience } from '../../../studio/shared/registrants';

export const prerender = false;

// The Studio calls this from its own address, so allow it (and the local Studio) across origins.
const cors = (request: Request) => {
  const origin = request.headers.get('origin') ?? '';
  return STUDIO_ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' } : {};
};
const reply = (request: Request, body: unknown, status = 200) => {
  const r = json(body, status);
  for (const [k, v] of Object.entries(cors(request))) r.headers.set(k, v);
  return r;
};

export const OPTIONS: APIRoute = ({ request }) => new Response(null, { status: 204, headers: cors(request) });

const MAX_FAMILIES = 1000;
type Broadcast = { _id: string; _rev: string; status: string; createdAt: string; subject: string; body: string; audience: Audience; audienceLabel: string; sentBy?: string };

export const POST: APIRoute = async ({ request }) => {
  const key = env('RESEND_API_KEY'), from = env('EMAIL_FROM');
  if (!key || !from) return reply(request, { error: 'Email isn\'t switched on for this website yet (Resend key missing).' }, 503);
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' && /^emailBroadcast\.[0-9a-f-]{36}$/.test(body.id) ? body.id : null;
  if (!id) return reply(request, { error: 'Unknown email.' }, 400);

  const db = sanity();
  const b = await db.fetch<Broadcast | null>('*[_id == $id][0]', { id });
  if (!b) return reply(request, { error: 'Unknown email.' }, 404);
  if (b.status !== 'queued') return reply(request, { error: 'This email has already been sent.' }, 409);
  if (Date.now() - Date.parse(b.createdAt) > 15 * 60_000) return reply(request, { error: 'This email is too old to send. Write it again.' }, 410);
  if (!b.subject?.trim() || !b.body?.trim()) return reply(request, { error: 'Add a subject and a message.' }, 400);
  // Claim it: if two requests race, only one gets past this.
  const claimed = await db.patch(id).ifRevisionId(b._rev).set({ status: 'sending' }).commit().then(() => true, () => false);
  if (!claimed) return reply(request, { error: 'This email is already being sent.' }, 409);

  const fail = async (error: string, status = 500) => {
    await db.patch(id).set({ status: 'failed', error }).commit().catch(() => {});
    return reply(request, { error }, status);
  };

  const source = SOURCES.find((s) => s.program === b.audience?.program);
  if (!source) return fail('Unknown program.', 400);
  const all = (await db.fetch<Record<string, any>[]>(source.query)).map(source.toRegistrant);
  const families = recipientsOf(all.filter((r) => matches(r, b.audience)));
  if (!families.length) return fail('No families match this group.', 400);
  if (families.length > MAX_FAMILIES) return fail(`That's ${families.length} families; the limit is ${MAX_FAMILIES} per email. Pick a smaller group.`, 400);

  // Replies go to whoever sent it, when that's a club address; otherwise to the main email.
  const sender = b.sentBy?.match(/^(.*?)\s*<([^>]+)>$/);
  const main = await db.fetch<string>('*[_id == "siteSettings"][0].mainEmail');
  const replyTo = sender && /@utathletic\.com$/i.test(sender[2]) ? sender[2] : main;
  await brandEmails();
  const emails = families.map((f) => {
    const m = groupMessage({ subject: b.subject.trim(), body: b.body.trim(), audienceLabel: b.audienceLabel, parentName: f.name, players: f.players, programName: PROGRAM_LABEL[source.program], sender: sender?.[1] });
    return { from, to: [f.email], reply_to: replyTo, subject: m.subject, html: m.html, text: m.text };
  });

  // Resend's batch endpoint takes up to 100 emails per request.
  let sent = 0;
  const problems: string[] = [];
  for (let i = 0; i < emails.length; i += 100) {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(emails.slice(i, i + 100)),
    }).catch((e) => ({ ok: false, status: 0, text: async () => String(e) }) as Response);
    if (r.ok) sent += Math.min(100, emails.length - i);
    else problems.push(`Batch ${i / 100 + 1}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  }

  await db.patch(id).set({
    status: sent ? 'sent' : 'failed', sentAt: new Date().toISOString(), recipientCount: sent,
    recipients: families.map((f) => f.email), ...(problems.length ? { error: problems.join('\n') } : {}),
  }).commit();
  if (!sent) return reply(request, { error: 'Sending failed. Details are on the Sent email in the Studio.' }, 502);
  return reply(request, { sent, ...(problems.length ? { warning: 'Some emails may not have sent. See the Sent email in the Studio.' } : {}) });
};
