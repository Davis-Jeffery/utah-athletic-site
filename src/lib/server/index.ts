// Server-only helpers for the API routes (/api/*): Sanity writes, spam checks, routing and email.
// Never import this from a page or island: it reads secret keys.
//
// Environment (.env locally, Vercel > Settings > Environment Variables):
//   SANITY_WRITE_TOKEN       Editor token; creates submissions and registrations.
//   TURNSTILE_SECRET_KEY     Optional. With PUBLIC_TURNSTILE_SITE_KEY, forms must pass Cloudflare Turnstile.
//   RESEND_API_KEY, EMAIL_FROM  Optional. Without them nothing is emailed; everything still lands in the Studio.
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET  Futures registration payments.
import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';
import type { Person } from './email';

export * from './email';

export const env = (k: string) => process.env[k] || (import.meta.env as Record<string, string | undefined>)[k] || '';

let client: ReturnType<typeof createClient> | undefined;
export function sanity() {
  const token = env('SANITY_WRITE_TOKEN');
  if (!token) throw new Error('Missing SANITY_WRITE_TOKEN');
  client ??= createClient({ projectId: '03wnsd9x', dataset: 'production', apiVersion: '2025-10-01', token, useCdn: false, perspective: 'published' });
  return client;
}

/** Ids with a dot are hidden from anonymous reads of the dataset, so families' details never are. */
export const privateId = (prefix: string) => `${prefix}.${randomUUID()}`;

/** The forms that save to Submissions, with the names staff see. Keep in step with studio/schemaTypes/submission.ts. */
export const FORMS = {
  contact: 'Contact message',
  trial: 'Player trial application',
  invite: 'Academy invitation request',
  interest: 'Register interest',
  register: 'Registration request',
  adult: 'Adult league question',
} as const;

/** Adult leagues' form program values (see ADULT in src/data/site.ts) and their Studio documents. */
export const ADULT_PROGRAMS: Record<string, { doc: string; name: string }> = {
  upsl: { doc: 'adultLeague.upsl', name: 'UPSL' },
  adultrec: { doc: 'adultLeague.rec', name: 'Adult Recreation' },
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/** Honeypot and Turnstile. Returns an error message, or null when the request looks human. */
export async function spamCheck(body: Record<string, unknown>, ip: string | null): Promise<string | null> {
  if (typeof body.website === 'string' && body.website.trim()) return 'Rejected.';
  const secret = env('TURNSTILE_SECRET_KEY');
  if (!secret) return null;
  const token = body['cf-turnstile-response'];
  if (typeof token !== 'string' || !token) return 'Please complete the check above the button.';
  const form = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = (await r.json()) as { success?: boolean };
  return out.success ? null : 'The check didn\'t pass. Please try again.';
}

/** Trimmed string field, capped so nobody can store a novel. */
export const s = (v: unknown, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

type Leader = { id: string; name?: string; role?: string; email?: string };
const MAIN: Person = { name: 'Utah Athletic', role: 'Main office', email: '' };
const person = (l: Leader): Person => ({ name: l.name || 'Utah Athletic', role: l.role, email: l.email! });
const leaders = (k: string) => `select(${k}.status != "none" => ${k}.leaders[]{ "id": person->_id, "name": person->name, "email": person->email, "role": coalesce(title, person->title) })`;

/**
 * Who a form goes to, worked out the same way the page shows it: the program's leaders in the
 * region, else every leader in the region, else the main office. `leader` narrows it to one person.
 * `main` sends it to the main contact email only (the /contact form).
 * Returns people with name and title, so the auto-reply can say who will be in touch.
 */
export async function recipients(o: { program?: string; region?: string; leader?: string; main?: boolean }): Promise<Person[]> {
  const main = async () => [{ ...MAIN, email: await sanity().fetch<string>('*[_id == "siteSettings"][0].mainEmail') }];
  if (o.main) return main();
  // Adult leagues: their own staff, else the main email.
  const adult = o.program ? ADULT_PROGRAMS[o.program] : undefined;
  if (adult) {
    const staff = await sanity().fetch<Leader[] | null>(
      '*[_id == $doc][0].leadership[]{ "id": person->_id, "name": person->name, "email": person->email, "role": coalesce(title, person->title) }', { doc: adult.doc });
    const list = (staff ?? []).filter((l) => l?.email);
    return list.length ? unique(list).map(person) : main();
  }
  const d = await sanity().fetch<{ programs: ({ key: string } & Record<string, Leader[] | null>)[] }>(
    `{ "programs": *[_type == "program"]{ key, "north": ${leaders('north')}, "south": ${leaders('south')}, "west": ${leaders('west')} } }`);
  const region = o.region && ['north', 'south', 'west'].includes(o.region) ? o.region : undefined;
  let list: Leader[] = [];
  if (region) {
    const own = (d.programs.find((p) => p.key === o.program)?.[region] ?? []).filter((l) => l?.email);
    list = own.length ? own : d.programs.flatMap((p) => p[region] ?? []).filter((l) => l?.email);
  }
  const picked = o.leader ? list.filter((l) => l.id === o.leader) : [];
  const out = unique(picked.length ? picked : list).map(person);
  return out.length ? out : main();
}
const unique = (list: Leader[]) => list.filter((l, i) => list.findIndex((x) => x.email === l.email) === i);

/** Sends an email through Resend when it's configured. Never throws: email is a bonus, the Studio is the record. */
export async function sendEmail(m: { to: string[]; subject: string; text: string; html?: string; replyTo?: string }) {
  const key = env('RESEND_API_KEY'), from = env('EMAIL_FROM');
  if (!key || !from || !m.to.length) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: m.to, subject: m.subject, text: m.text, ...(m.html ? { html: m.html } : {}), ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
    });
    if (!r.ok) console.error('Resend', r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error('Resend', e);
    return false;
  }
}

/** Today in Utah, so registration opens and closes on the club's calendar day. */
export const utahToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Denver' }).format(new Date());

export const lines = (rows: [string, string | undefined | null][]) => rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
