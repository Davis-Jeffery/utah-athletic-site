import { defineField, defineType } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { str } from './helpers';

const person = (name: string, title: string) =>
  defineField({
    name, title, type: 'object', options: { columns: 2 },
    fields: [
      str('name', 'Name', { required: true }),
      defineField({ name: 'email', title: 'Email', type: 'email', validation: (r) => r.required() }),
    ],
  });

export const region = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({ name: 'key', title: 'Region id', type: 'string', readOnly: true, description: 'Used in page addresses. Set by a developer.' }),
    defineField({ name: 'order', title: 'Order', type: 'number', readOnly: true, hidden: true }),
    str('label', 'Name', { required: true }),
    str('area', 'Area covered', { required: true, description: 'e.g. "Salt Lake County".' }),
    person('managingDirector', 'Managing director'),
    person('directorOfCoaching', 'Director of coaching'),
    defineField({ name: 'seasonVenue', title: 'Rec and Futures venue', type: 'reference', to: [{ type: 'venue' }], description: 'Where Rec and Futures sessions run for families in this region.', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'area' } },
});
