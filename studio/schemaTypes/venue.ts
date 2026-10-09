import { defineType } from 'sanity';
import { PinIcon } from '@sanity/icons/Pin';
import { str } from './helpers';

export const venue = defineType({
  name: 'venue',
  title: 'Venue',
  type: 'document',
  icon: PinIcon,
  fields: [
    str('name', 'Field name', { required: true, description: 'As families will see it, e.g. "Murray Park, Field 3".' }),
    str('address', 'Address', { required: true, description: 'The map link searches for "name, address", so keep it specific.' }),
  ],
  preview: { select: { title: 'name', subtitle: 'address' } },
});
