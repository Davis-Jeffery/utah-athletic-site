// POST /api/futures/checkout: a family registers a player for a Futures session.
// Checks the session is open and has room, saves a pending Futures registration in Sanity, then
// returns a Stripe Checkout link. The price always comes from the session in Sanity, never the browser.
// Payment results arrive at /api/stripe/webhook.
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { env, isEmail, json, privateId, s, sanity, spamCheck, utahToday } from '../../../lib/server';
import { sessionStatus, fmtRange } from '../../../lib/schedule';
import { ageLabel, ageNumber, seasonEnd, seasonLabel } from '../../../../studio/shared/registrants';

export const prerender = false;

/** Checkout links last 30 minutes (Stripe's minimum); a pending spot is held a little longer. */
const HOLD_MINUTES = 35;

type Session = {
  _id: string; name: string; region: string; cost: number; status: string; capacity?: number;
  registrationOpens: string; registrationCloses: string; start: string; end: string; venue?: string;
};

export const POST: APIRoute = async ({ request, clientAddress, url }) => {
  const secret = env('STRIPE_SECRET_KEY');
  if (!secret) return json({ error: 'Online registration isn\'t switched on yet. Please contact us to register.' }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Something went wrong. Please try again.' }, 400);
  }
  const spam = await spamCheck(body, clientAddress ?? null);
  if (spam) return json({ error: spam }, 400);

  const f = {
    playerFirst: s(body.playerFirst, 80), playerLast: s(body.playerLast, 80), birthDate: s(body.birthDate, 10), gender: s(body.gender, 20),
    parentName: s(body.parentName, 120), email: s(body.email, 200), phone: s(body.phone, 40),
    medical: s(body.medical, 2000), emergencyName: s(body.emergencyName, 120), emergencyPhone: s(body.emergencyPhone, 40),
  };
  const missing = Object.entries({ ...f, medical: 'optional' }).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) return json({ error: 'Please fill in every required field.', fields: missing }, 400);
  if (!isEmail(f.email)) return json({ error: 'Please enter a valid email address.' }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.birthDate)) return json({ error: 'Please enter the player\'s birth date.' }, 400);
  if (body.waiver !== true) return json({ error: 'Please read and accept the waiver.' }, 400);

  const id = s(body.session, 120);
  const db = sanity();
  const session = await db.fetch<Session | null>(
    `*[_type == "futuresSession" && (_id == $id || _id == "futuresSession." + $id)][0]{ _id, name, region, cost, status, capacity, registrationOpens, registrationCloses, start, end, "venue": venue->name }`,
    { id },
  );
  if (!session) return json({ error: 'That session is no longer available. Please pick another.' }, 404);
  const today = utahToday();
  const st = sessionStatus({ status: session.status, opens: session.registrationOpens, closes: session.registrationCloses, start: session.start, end: session.end }, today);
  if (st !== 'open') return json({ error: st === 'full' ? 'Sorry, this session is full.' : 'Registration for this session isn\'t open.' }, 409);

  if (session.capacity) {
    const since = new Date(Date.now() - HOLD_MINUTES * 60_000).toISOString();
    const taken = await db.fetch<number>(
      `count(*[_type == "futuresRegistration" && session._ref == $sid && (payment == "paid" || (payment == "pending" && receivedAt > $since))])`,
      { sid: session._id, since },
    );
    if (taken >= session.capacity) return json({ error: 'Sorry, this session is full.' }, 409);
  }

  const waiver = await db.fetch<string | null>(`*[_id == "siteSettings"][0].futuresWaiver`);
  const regId = privateId('futuresRegistration');
  const region = session.region[0].toUpperCase() + session.region.slice(1);
  await db.create({
    _id: regId, _type: 'futuresRegistration', receivedAt: new Date().toISOString(), payment: 'pending',
    session: { _type: 'reference', _ref: session._id, _weak: true }, sessionName: `${session.name} · ${region}`, amount: session.cost,
    // US Soccer age group for the session's season (Aug 1 to Jul 31), for filtering and group emails.
    ...(() => { const end = seasonEnd(session.start); const n = ageNumber(f.birthDate, end); return { season: seasonLabel(end), seasonEnd: end, ageNumber: n, ageGroup: ageLabel(n) }; })(),
    ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)),
    waiverAcceptedAt: new Date().toISOString(), waiverText: waiver ?? '',
  });

  try {
    const stripe = new Stripe(secret);
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: f.email,
      client_reference_id: regId,
      metadata: { registrationId: regId, sessionId: session._id },
      payment_intent_data: { metadata: { registrationId: regId, sessionId: session._id }, description: `Futures · ${session.name} · ${region}: ${f.playerFirst} ${f.playerLast}` },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd', unit_amount: Math.round(session.cost * 100),
          product_data: { name: `Futures · ${session.name} · ${region}`, description: `${f.playerFirst} ${f.playerLast} · ${fmtRange(session.start, session.end)}${session.venue ? ` · ${session.venue}` : ''}` },
        },
      }],
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
      success_url: `${url.origin}/futures/registered/`,
      cancel_url: `${url.origin}/futures/register/?session=${encodeURIComponent(id)}&cancelled=1`,
    });
    await db.patch(regId).set({ stripeCheckoutId: checkout.id }).commit();
    return json({ url: checkout.url });
  } catch (e) {
    console.error('checkout', e);
    await db.patch(regId).set({ payment: 'failed' }).commit().catch(() => {});
    return json({ error: 'We couldn\'t start the payment. Please try again.' }, 502);
  }
};
