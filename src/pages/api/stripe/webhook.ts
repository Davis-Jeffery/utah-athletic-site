// POST /api/stripe/webhook: Stripe tells us how a Futures payment went.
// Paid: mark the registration paid, email the family and the Futures leaders, and set the session
// to Full when its spots are taken. Expired: free the held spot. Refunded: mark it refunded.
// Set up in Stripe > Developers > Webhooks with these events: checkout.session.completed,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
// checkout.session.expired, charge.refunded.
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { env, futuresConfirmation, futuresStaffNotice, json, recipients, sanity, sendEmail } from '../../../lib/server';
import { fmtDate, fmtRange } from '../../../lib/schedule';

export const prerender = false;

type Registration = {
  _id: string; _rev: string; payment: string; playerFirst: string; playerLast: string; birthDate: string; gender: string;
  parentName: string; email: string; phone: string; medical?: string; emergencyName: string; emergencyPhone: string; amount: number;
  session?: { _id: string; name: string; region: string; start: string; end: string; capacity?: number; venue?: string; address?: string; classes?: { date: string; startTime: string; note?: string }[] };
};

export const POST: APIRoute = async ({ request }) => {
  const key = env('STRIPE_SECRET_KEY'), secret = env('STRIPE_WEBHOOK_SECRET');
  if (!key || !secret) return json({ error: 'Not configured' }, 503);
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), request.headers.get('stripe-signature') ?? '', secret);
  } catch {
    return json({ error: 'Bad signature' }, 400);
  }

  const db = sanity();
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const c = event.data.object;
      if (c.payment_status !== 'paid') break; // a delayed method; async_payment_succeeded follows
      await markPaid(c.metadata?.registrationId ?? c.client_reference_id ?? '', c);
      break;
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': {
      // Only a registration still pending changes, so a late event never undoes a payment.
      const id = event.data.object.metadata?.registrationId;
      const r = id && (await db.fetch<string | null>(`*[_id == $id && payment == "pending"][0]._rev`, { id }));
      if (id && r) await db.patch(id).ifRevisionId(r).set({ payment: event.type.endsWith('expired') ? 'expired' : 'failed' }).commit().catch(() => {});
      break;
    }
    case 'charge.refunded': {
      const ch = event.data.object;
      const pi = typeof ch.payment_intent === 'string' ? ch.payment_intent : ch.payment_intent?.id;
      const id = await db.fetch<string | null>(`*[_type == "futuresRegistration" && stripePaymentIntent == $pi][0]._id`, { pi });
      if (id) await db.patch(id).set({ payment: ch.amount_refunded >= ch.amount ? 'refunded' : 'partiallyRefunded', refundedAt: new Date().toISOString() }).commit();
      break;
    }
  }
  return json({ received: true });

  async function markPaid(id: string, c: Stripe.Checkout.Session) {
    const reg = await db.fetch<Registration | null>(
      `*[_id == $id][0]{ ..., "session": session->{ _id, name, region, start, end, capacity, "venue": venue->name, "address": venue->address, classes } }`,
      { id },
    );
    if (!reg || reg.payment === 'paid') return; // unknown, or already handled (Stripe retries)
    // ifRevisionId: if two deliveries of this event race, only one marks it paid and sends the emails.
    const ok = await db.patch(id).ifRevisionId(reg._rev).set({
      payment: 'paid', paidAt: new Date().toISOString(), amountPaid: (c.amount_total ?? 0) / 100,
      stripePaymentIntent: typeof c.payment_intent === 'string' ? c.payment_intent : c.payment_intent?.id,
    }).commit().then(() => true, () => false);
    if (!ok) return;

    const s = reg.session;
    const region = s ? s.region[0].toUpperCase() + s.region.slice(1) : '';
    const leads = s ? await recipients({ program: 'futures', region: s.region }) : [];
    const r = {
      parentName: reg.parentName, player: `${reg.playerFirst} ${reg.playerLast}`,
      session: s ? `${s.name} · ${region}` : 'Futures', dates: s && fmtRange(s.start, s.end),
      where: s?.venue && `${s.venue}${s.address ? `, ${s.address}` : ''}`, paid: `$${(c.amount_total ?? 0) / 100}`,
      classes: (s?.classes ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)).map((x) => `${fmtDate(x.date)}, ${clock(x.startTime)}${x.note ? ` (${x.note})` : ''}`),
      contact: leads[0]?.role === 'Main office' ? undefined : leads[0],
      birthDate: reg.birthDate, gender: reg.gender, email: reg.email, phone: reg.phone, medical: reg.medical,
      emergency: `${reg.emergencyName}, ${reg.emergencyPhone}`,
    };

    await sendEmail({ to: [reg.email], replyTo: leads[0]?.email, ...futuresConfirmation(r) });
    if (s) {
      await sendEmail({ to: leads.map((p) => p.email), replyTo: reg.email, ...futuresStaffNotice(r) });

      // Full once paid registrations reach the session's spots. Patches the draft too, if one is open.
      if (s.capacity) {
        const paid = await db.fetch<number>(`count(*[_type == "futuresRegistration" && session._ref == $sid && payment == "paid"])`, { sid: s._id });
        if (paid >= s.capacity) {
          const draft = `drafts.${s._id}`;
          const tx = db.transaction().patch(s._id, (p) => p.set({ status: 'full' }));
          if (await db.fetch(`defined(*[_id == $draft][0]._id)`, { draft }, { perspective: 'raw' })) tx.patch(draft, (p) => p.set({ status: 'full' }));
          await tx.commit();
        }
      }
    }
  }
};

const clock = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
