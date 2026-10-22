// POST /api/submit: every site form except Futures registration (which pays through Stripe).
// Saves a Submission in Sanity (Studio > Submissions), emails the people it's addressed to, and
// sends the person who filled it in a confirmation naming who will get back to them
// (src/lib/server/email.ts). The contact form always goes to the main contact email.
import type { APIRoute } from 'astro';
import { ADULT_PROGRAMS, FORMS, autoReply, isEmail, json, privateId, recipients, s, sanity, sendEmail, spamCheck, staffNotice } from '../../lib/server';

export const prerender = false;

type Form = keyof typeof FORMS;

const PROGRAMS = ['academy', 'club', 'rec', 'futures', ...Object.keys(ADULT_PROGRAMS)];
const REGIONS = ['north', 'south', 'west'];
const NAMES: Record<string, string> = { academy: 'Academy', club: 'Club', rec: 'Recreation', futures: 'Futures', north: 'North', south: 'South', west: 'West' };

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 400);
  }
  const spam = await spamCheck(body, clientAddress ?? null);
  if (spam) return json({ error: spam }, 400);

  const form = s(body.form) as Form;
  if (!(form in FORMS)) return json({ error: 'Unknown form.' }, 400);
  const program = PROGRAMS.includes(s(body.program)) ? s(body.program) : undefined;
  const region = REGIONS.includes(s(body.region)) ? s(body.region) : undefined;
  const f = {
    name: s(body.name, 120), email: s(body.email, 200), phone: s(body.phone, 40), player: s(body.player, 120),
    birthYear: s(body.birthYear ?? body.age, 40), club: s(body.club, 200), position: s(body.position, 40),
    video: s(body.video, 400), topic: s(body.topic, 80), message: s(body.message, 5000), session: s(body.session, 200),
  };
  if (!isEmail(f.email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (form === 'adult' && !f.name) return json({ error: 'Please add your name.' }, 400);
  if (form === 'contact' && (!f.name || !f.message)) return json({ error: 'Please add your name and a message.' }, 400);
  if ((form === 'trial' || form === 'invite' || form === 'register') && !f.player) return json({ error: 'Please add the player\'s name.' }, 400);

  const to = await recipients(form === 'contact' ? { main: true } : { program, region, leader: s(body.leader, 100) || undefined });
  const doc = {
    _id: privateId('submission'), _type: 'submission', form, receivedAt: new Date().toISOString(), status: 'new',
    program, region, sentTo: to.map((p) => p.email), page: s(body.page, 300),
    ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)),
  };
  try {
    await sanity().create(doc);
  } catch (e) {
    console.error('submission', e);
    return json({ error: 'We couldn\'t send that just now. Please try again, or email us directly.' }, 500);
  }

  const sent = {
    form, ...f,
    programName: program ? ADULT_PROGRAMS[program]?.name ?? NAMES[program] : undefined,
    regionName: region ? NAMES[region] : undefined,
  };
  const staff = staffNotice(sent, FORMS[form]);
  await sendEmail({ to: to.map((p) => p.email), replyTo: f.email, ...staff });
  // The confirmation goes out only when the message is saved; replies reach whoever will answer.
  const reply = autoReply(sent, to[0]);
  await sendEmail({ to: [f.email], replyTo: to[0].email, ...reply });
  return json({ ok: true });
};
