import { defineField, defineType } from 'sanity';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { str } from './helpers';
import { Note } from '../components/Note';

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
  ],
  preview: { select: { title: 'label', subtitle: 'area' } },
});
