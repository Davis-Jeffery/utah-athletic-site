// A family's Futures registration. Created by the site when they start checkout (Payment: Pending)
// and updated by Stripe (Paid, Expired, Refunded). Staff only add notes; refunds are made in Stripe.
// Ids contain a dot, so they're hidden from anonymous reads of the dataset.
import { defineField, defineType } from 'sanity';
import { CreditCardIcon } from '@sanity/icons/CreditCard';

export const PAYMENT_OPTIONS = [
  { title: 'Paid', value: 'paid' },
  { title: 'Pending (checkout started)', value: 'pending' },
  { title: 'Expired (checkout not finished)', value: 'expired' },
  { title: 'Failed', value: 'failed' },
  { title: 'Refunded', value: 'refunded' },
  { title: 'Partly refunded', value: 'partiallyRefunded' },
];
const ro = (name: string, title: string, type = 'string', extra: Record<string, unknown> = {}) =>
  defineField({ name, title, type, readOnly: true, ...extra } as never);

export const futuresRegistration = defineType({
  name: 'futuresRegistration',
  title: 'Futures registration',
  type: 'document',
  // Edits save straight away (no drafts or Publish step): these never appear on the site.
  liveEdit: true,
  icon: CreditCardIcon,
  fieldsets: [
    { name: 'player', title: 'Player' },
    { name: 'parent', title: 'Parent and emergency contact' },
    { name: 'payment', title: 'Payment', options: { collapsible: true, collapsed: true } },
    { name: 'waiver', title: 'Waivers', options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    ro('payment', 'Payment', 'string', { options: { list: PAYMENT_OPTIONS }, description: 'Updated by Stripe. Make refunds in the Stripe dashboard; this updates itself.' }),
    ro('sessionName', 'Session'),
    defineField({ name: 'session', title: 'Session (link)', type: 'reference', to: [{ type: 'futuresSession' }], weak: true, readOnly: true }),
    defineField({ name: 'notes', title: 'Internal notes', type: 'text', rows: 3, description: 'Only staff see these.' }),
    ro('playerFirst', 'First name', 'string', { fieldset: 'player' }),
    ro('playerLast', 'Last name', 'string', { fieldset: 'player' }),
    ro('birthDate', 'Birth date', 'date', { fieldset: 'player' }),
    ro('gender', 'Gender', 'string', { fieldset: 'player' }),
    ro('ageGroup', 'Age group', 'string', { fieldset: 'player', description: 'US Soccer age group for the season (Aug 1 to Jul 31), worked out from the birth date when they registered.' }),
    ro('season', 'Season', 'string', { fieldset: 'player', description: 'e.g. 2026-27.' }),
    ro('ageNumber', 'Age number', 'number', { hidden: true }),
    ro('seasonEnd', 'Season end year', 'number', { hidden: true }),
    ro('medical', 'Allergies or medical notes', 'text', { fieldset: 'player' }),
    ro('parentName', 'Parent name', 'string', { fieldset: 'parent' }),
    ro('email', 'Email', 'string', { fieldset: 'parent' }),
    ro('phone', 'Phone', 'string', { fieldset: 'parent' }),
    ro('emergencyName', 'Emergency contact', 'string', { fieldset: 'parent' }),
    ro('emergencyPhone', 'Emergency phone', 'string', { fieldset: 'parent' }),
    ro('amount', 'Price ($)', 'number', { fieldset: 'payment' }),
    ro('amountPaid', 'Paid ($)', 'number', { fieldset: 'payment' }),
    ro('receivedAt', 'Started', 'datetime', { fieldset: 'payment' }),
    ro('paidAt', 'Paid at', 'datetime', { fieldset: 'payment' }),
    ro('refundedAt', 'Refunded at', 'datetime', { fieldset: 'payment' }),
    ro('stripeCheckoutId', 'Stripe checkout id', 'string', { fieldset: 'payment' }),
    ro('stripePaymentIntent', 'Stripe payment id', 'string', { fieldset: 'payment', description: 'Search for this in the Stripe dashboard to find the payment.' }),
    // Every waiver they accepted, as it read then (Settings > Waivers).
    ro('waivers', 'Waivers they accepted', 'array', {
      fieldset: 'waiver',
      of: [{
        type: 'object', name: 'acceptedWaiver',
        fields: [
          { name: 'title', title: 'Title', type: 'string' },
          { name: 'acceptedAt', title: 'Accepted at', type: 'datetime' },
          { name: 'text', title: 'Text they accepted', type: 'text', rows: 8 },
          { name: 'waiver', title: 'Waiver (link)', type: 'reference', to: [{ type: 'waiver' }], weak: true },
        ],
        preview: { select: { title: 'title', subtitle: 'acceptedAt' } },
      }],
    }),
    // Registrations from before Settings > Waivers: one waiver. Shown only when set.
    ro('waiverAcceptedAt', 'Accepted at', 'datetime', { fieldset: 'waiver', hidden: ({ value }: { value?: unknown }) => !value }),
    ro('waiverText', 'Waiver text they accepted', 'text', { fieldset: 'waiver', hidden: ({ value }: { value?: unknown }) => !value }),
  ],
  orderings: [{ title: 'Newest first', name: 'received', by: [{ field: 'receivedAt', direction: 'desc' }] }],
  preview: {
    select: { first: 'playerFirst', last: 'playerLast', session: 'sessionName', payment: 'payment', age: 'ageGroup', gender: 'gender' },
    prepare: ({ first, last, session, payment, age, gender }) => ({
      title: `${first ?? ''} ${last ?? ''}`.trim() || 'Registration',
      subtitle: [PAYMENT_OPTIONS.find((o) => o.value === payment)?.title.replace(/ \(.*\)/, ''), age && gender ? `${age} ${gender === 'Girl' ? 'Girls' : 'Boys'}` : age, session].filter(Boolean).join(' · '),
    }),
  },
});
