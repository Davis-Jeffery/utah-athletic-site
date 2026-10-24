// A waiver families must accept before registering (Studio > Settings > Waivers). Each one lists
// the registration forms it's required for; a form shows every waiver required for it, each with
// its own checkbox. Every registration keeps a copy of each waiver as it was accepted, so editing
// a waiver later never changes past registrations.
import { defineField, defineType } from 'sanity';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { str, txt } from './helpers';
import { REGISTRATION_FORMS } from '../shared/registrationForms';

export const waiver = defineType({
  name: 'waiver',
  title: 'Waiver',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    str('title', 'Title', { required: true, description: 'Shown above the text on the form, e.g. "Liability waiver" or "Photo release".' }),
    defineField({
      name: 'requiredFor', title: 'Required for', type: 'array',
      description: 'The registration forms that show this waiver. Families must tick it to register. Untick every form to stop using it without deleting it.',
      of: [{ type: 'string' }],
      options: { list: REGISTRATION_FORMS.map(({ value, title }) => ({ value, title })), layout: 'grid' },
    }),
    txt('text', 'Waiver text', { required: true, rows: 16, description: 'The full wording. Families scroll through it on the form.' }),
    str('checkboxLabel', 'Checkbox wording (optional)', { description: 'Next to the tick box. Empty: "I\'m the player\'s parent or guardian, and I\'ve read and accept the [title]."' }),
  ],
  orderings: [{ title: 'Title', name: 'title', by: [{ field: 'title', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', requiredFor: 'requiredFor' },
    prepare: ({ title, requiredFor }: { title?: string; requiredFor?: string[] }) => ({
      title: title || 'New waiver',
      subtitle: requiredFor?.length ? `Required for: ${requiredFor.map((v) => REGISTRATION_FORMS.find((f) => f.value === v)?.title ?? v).join(', ')}` : 'Not required on any form',
    }),
  },
});
