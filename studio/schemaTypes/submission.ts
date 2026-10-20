// Form submissions from the site (contact, trial application, invitation, interest, registration
// request). Created only by the site's /api/submit; staff track them with Status, Assigned to and Notes.
// Ids contain a dot, so they're hidden from anonymous reads of the dataset.
import { defineField, defineType } from 'sanity';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { PROGRAM_OPTIONS, REGION_OPTIONS } from './helpers';

// Keep in step with FORMS in src/lib/server/index.ts.
export const FORM_OPTIONS = [
  { title: 'Contact message', value: 'contact' },
  { title: 'Player trial application', value: 'trial' },
  { title: 'Academy invitation request', value: 'invite' },
  { title: 'Register interest', value: 'interest' },
  { title: 'Registration request', value: 'register' },
  { title: 'Adult league question', value: 'adult' },
];
// Programs plus the adult leagues. Keep in step with ADULT_PROGRAMS in src/pages/api/submit.ts.
const SUBMISSION_PROGRAMS = [...PROGRAM_OPTIONS, { title: 'UPSL', value: 'upsl' }, { title: 'Adult Recreation', value: 'adultrec' }];
const label = (opts: { title: string; value: string }[], v?: string) => opts.find((o) => o.value === v)?.title ?? v ?? '';
const ro = (name: string, title: string, type = 'string', extra: Record<string, unknown> = {}) =>
  defineField({ name, title, type, readOnly: true, group: 'submitted', ...extra } as never);

export const submission = defineType({
  name: 'submission',
  title: 'Submission',
  type: 'document',
  // Edits save straight away (no drafts or Publish step): these never appear on the site.
  liveEdit: true,
  icon: EnvelopeIcon,
  groups: [{ name: 'track', title: 'Follow-up', default: true }, { name: 'submitted', title: 'What they sent' }],
  fields: [
    defineField({
      name: 'status', title: 'Status', type: 'string', group: 'track', initialValue: 'new',
      options: { list: [{ title: 'New', value: 'new' }, { title: 'In progress', value: 'inprogress' }, { title: 'Done', value: 'done' }], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({ name: 'assignedTo', title: 'Assigned to', type: 'reference', group: 'track', to: [{ type: 'staff' }], weak: true }),
    defineField({ name: 'notes', title: 'Internal notes', type: 'text', rows: 4, group: 'track', description: 'Only staff see these.' }),
    ro('form', 'Form', 'string', { options: { list: FORM_OPTIONS } }),
    ro('receivedAt', 'Received', 'datetime'),
    ro('program', 'Program', 'string', { options: { list: SUBMISSION_PROGRAMS } }),
    ro('region', 'Region', 'string', { options: { list: REGION_OPTIONS } }),
    ro('session', 'Session'),
    ro('name', 'Name'),
    ro('player', 'Player'),
    ro('birthYear', 'Birth year or age group'),
    ro('email', 'Email'),
    ro('phone', 'Phone'),
    ro('club', 'Current club'),
    ro('position', 'Position'),
    ro('video', 'Video link'),
    ro('topic', 'Topic'),
    ro('message', 'Message', 'text'),
    ro('sentTo', 'Emailed to', 'array', { of: [{ type: 'string' }] }),
    ro('page', 'Sent from page'),
  ],
  orderings: [{ title: 'Newest first', name: 'received', by: [{ field: 'receivedAt', direction: 'desc' }] }],
  preview: {
    select: { form: 'form', name: 'name', player: 'player', email: 'email', program: 'program', region: 'region', at: 'receivedAt', status: 'status' },
    prepare: ({ form, name, player, email, program, region, at, status }) => ({
      title: `${status === 'new' ? '● ' : ''}${player || name || email}`,
      subtitle: [label(FORM_OPTIONS, form), label(SUBMISSION_PROGRAMS, program), label(REGION_OPTIONS, region), at && new Date(at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })].filter(Boolean).join(' · '),
    }),
  },
});
