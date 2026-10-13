import { defineField, defineType } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { str } from './helpers';
import { Note } from '../components/Note';

// Retired: regional leaders are now picked from Staff per program (Programs > Regions tab).
// Hidden until the old values are cleared from the dataset, then these can be deleted.
const retired = (name: string, title: string) =>
  defineField({ name, title, type: 'object', hidden: true, fields: [str('name', 'Name'), defineField({ name: 'email', title: 'Email', type: 'email' })] });

export const region = defineType({
  name: 'region',
  title: 'Region',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'note', title: ' ', type: 'string', readOnly: true, components: { input: Note },
      options: { text: 'Name and area for this region, shared by every program. Staff are set in Programs, on each program\'s Regions tab. Recreation and Futures venues are set on each session.' } as object,
    }),
    defineField({ name: 'key', title: 'Region id', type: 'string', readOnly: true, description: 'Used in page addresses. Set by a developer.' }),
    defineField({ name: 'order', title: 'Order', type: 'number', readOnly: true, hidden: true }),
    str('label', 'Name', { required: true }),
    str('area', 'Area covered', { required: true, description: 'e.g. "Salt Lake County".' }),
    retired('managingDirector', 'Managing director (old)'),
    retired('directorOfCoaching', 'Director of coaching (old)'),
    // Retired: each Recreation and Futures session now has its own venue. Hidden until cleared from the dataset.
    defineField({ name: 'seasonVenue', title: 'Rec and Futures venue (old)', type: 'reference', to: [{ type: 'venue' }], hidden: true }),
  ],
  preview: { select: { title: 'label', subtitle: 'area' } },
});
