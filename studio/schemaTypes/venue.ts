import { defineField, defineType } from 'sanity';
import { PinIcon } from '@sanity/icons/Pin';
import { str } from './helpers';

export const venue = defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'place', title: 'Find the place', type: 'place', options: { fill: { address: 'address', name: 'name' } } as object,
      description: 'Search for the park, school or address. Picking it fills in the address below (and the name, if empty) and saves the exact spot, so directions go straight there.',
    }),
    str('name', 'Field name', { required: true, description: 'As families will see it, e.g. "Murray Park, Field 3".' }),
    str('address', 'Address', { required: true, description: 'Shown to families. Without a place found above, directions search for "name, address", so keep it specific.' }),
  ],
  preview: { select: { title: 'name', subtitle: 'address' } },
});
