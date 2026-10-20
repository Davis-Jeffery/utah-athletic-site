// POST /api/submit: every site form except Futures registration (which pays through Stripe).
// Saves a Submission in Sanity (Studio > Submissions) and emails the leaders it's addressed to.
import type { APIRoute } from 'astro';
import { ADULT_PROGRAMS, FORMS, env, isEmail, json, lines, privateId, recipients, s, sanity, sendEmail, spamCheck } from '../../lib/server';

export const prerender = false;

type Form = keyof typeof FORMS;

const PROGRAMS = ['academy', 'club', 'rec', 'futures', ...Object.keys(ADULT_PROGRAMS)];
const REGIONS = ['north', 'south', 'west'];

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

  const to = await recipients({ program, region, leader: s(body.leader, 100) || undefined });
  const doc = {
    _id: privateId('submission'), _type: 'submission', form, receivedAt: new Date().toISOString(), status: 'new',
    program, region, sentTo: to, page: s(body.page, 300),
    ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)),
  };
  try {
    await sanity().create(doc);
  } catch (e) {
    console.error('submission', e);
    return json({ error: 'We couldn\'t send that just now. Please try again, or email us directly.' }, 500);
  }

  const where = [program && (ADULT_PROGRAMS[program]?.name ?? program[0].toUpperCase() + program.slice(1)), region && region[0].toUpperCase() + region.slice(1)].filter(Boolean).join(' · ');
  await sendEmail({
    to, replyTo: f.email,
    subject: `${FORMS[form]}${where ? ` · ${where}` : ''}${f.player ? `: ${f.player}` : f.name ? `: ${f.name}` : ''}`,
    text: `${lines([
      ['Form', FORMS[form]], ['Program and region', where], ['Session', f.session], ['Name', f.name], ['Player', f.player],
      ['Birth year or age group', f.birthYear], ['Email', f.email], ['Phone', f.phone], ['Club', f.club], ['Position', f.position],
      ['Video', f.video], ['Topic', f.topic],
    ])}${f.message ? `\n\n${f.message}` : ''}\n\nReply to this email to answer them. Track it in the Studio under Submissions: ${env('PUBLIC_STUDIO_URL') || 'https://utah-athletic.sanity.studio'}`,
  });
  return json({ ok: true });
};
