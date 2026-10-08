import { defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons/Star';
import { link, photo, str } from './helpers';

const hex = (name: string, title: string) =>
  defineField({
    name, title, type: 'string', description: 'Hex color, e.g. #3b0d12',
    validation: (r) => r.required().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { name: 'hex color' }),
  });

export const event = defineType({
  name: 'event',
  title: 'Tournament or event',
  type: 'document',
  icon: StarIcon,
  description: 'Status (Coming, Registration open, Closed, Past) is worked out from the dates.',
  groups: [{ name: 'details', title: 'Details', default: true }, { name: 'look', title: 'Card look' }],
  fieldsets: [
    { name: 'dates', title: 'Event dates', options: { columns: 2 } },
    { name: 'reg', title: 'Registration window', options: { columns: 2 } },
  ],
  fields: [
    str('name', 'Name', { required: true, group: 'details' }),
    str('tagline', 'Tagline', { required: true, group: 'details' }),
    defineField({ name: 'start', title: 'Starts', type: 'date', group: 'details', fieldset: 'dates', validation: (r) => r.required() }),
    defineField({ name: 'end', title: 'Ends', type: 'date', group: 'details', fieldset: 'dates', validation: (r) => r.required().min(r.valueOfField('start')) }),
    defineField({ name: 'regOpen', title: 'Opens', type: 'date', group: 'details', fieldset: 'reg', validation: (r) => r.required() }),
    defineField({ name: 'regClose', title: 'Closes', type: 'date', group: 'details', fieldset: 'reg', validation: (r) => r.required().min(r.valueOfField('regOpen')) }),
    str('location', 'Location', { required: true, group: 'details' }),
    str('format', 'Format', { required: true, group: 'details', description: 'e.g. "7v7 · 9v9 · 11v11".' }),
    str('ages', 'Ages', { required: true, group: 'details', description: 'e.g. "U9 to U19 · Boys and Girls".' }),
    link('url', 'Registration or info link', { required: true, group: 'details' }),
    photo('logo', 'Logo', { group: 'look', description: 'Optional. Shown in the card\'s logo slot.' }),
    defineField({
      name: 'brand', title: 'Card colors', type: 'object', group: 'look', options: { columns: 2 },
      fields: [hex('bg', 'Background'), hex('bg2', 'Background 2'), hex('ink', 'Text'), hex('accent', 'Accent'), defineField({ name: 'mono', title: 'Monogram', type: 'string', description: '2 or 3 letters, e.g. CA.', validation: (r) => r.required().max(3) })],
    }),
  ],
  orderings: [{ title: 'Start date', name: 'start', by: [{ field: 'start', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'start', media: 'logo' } },
});
