// A group email sent from the Registrations page (Studio > Registrations). The page saves one of
// these (status Queued) and asks the website to send it; the website works out the recipients
// from `audience` itself, sends through Resend and fills in the result. Kept as a log.
// Ids contain a dot, so they're hidden from anonymous reads of the dataset.
import { defineField, defineType } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons/Envelope';

export const BROADCAST_STATUS = [
  { title: 'Queued', value: 'queued' },
  { title: 'Sending', value: 'sending' },
  { title: 'Sent', value: 'sent' },
  { title: 'Failed', value: 'failed' },
];
const ro = (name: string, title: string, type = 'string', extra: Record<string, unknown> = {}) =>
  defineField({ name, title, type, readOnly: true, ...extra } as never);

export const emailBroadcast = defineType({
  name: 'emailBroadcast',
  title: 'Sent email',
  type: 'document',
  liveEdit: true,
  icon: EnvelopeIcon,
  fields: [
    ro('status', 'Status', 'string', { options: { list: BROADCAST_STATUS } }),
    ro('audienceLabel', 'Sent to'),
    ro('recipientCount', 'Families', 'number'),
    ro('subject', 'Subject'),
    ro('body', 'Message', 'text'),
    ro('sentBy', 'Sent by'),
    ro('createdAt', 'Created', 'datetime'),
    ro('sentAt', 'Sent', 'datetime'),
    ro('error', 'Problem', 'text', { hidden: ({ value }: { value?: string }) => !value }),
    ro('recipients', 'Email addresses', 'array', { of: [{ type: 'string' }] }),
    ro('audience', 'Filter', 'object', {
      hidden: true,
      fields: [
        { name: 'program', type: 'string' }, { name: 'season', type: 'string' },
        { name: 'sessions', type: 'array', of: [{ type: 'string' }] }, { name: 'ages', type: 'array', of: [{ type: 'number' }] },
        { name: 'genders', type: 'array', of: [{ type: 'string' }] }, { name: 'payments', type: 'array', of: [{ type: 'string' }] },
      ],
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'created', by: [{ field: 'createdAt', direction: 'desc' }] }],
  preview: {
    select: { subject: 'subject', to: 'audienceLabel', n: 'recipientCount', status: 'status', at: 'createdAt' },
    prepare: ({ subject, to, n, status, at }) => ({
      title: subject || 'Email',
      subtitle: [status !== 'sent' ? BROADCAST_STATUS.find((s) => s.value === status)?.title : null, n != null ? `${n} families` : null, to, at && new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })].filter(Boolean).join(' · '),
    }),
  },
});
