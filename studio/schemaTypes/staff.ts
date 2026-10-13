// One document per person on staff. Programs pick people from here (Program leadership, and each
// region's Leaders and Coaches), so a person is entered once and every page that shows them
// stays in sync.
import { defineField, defineType } from 'sanity';
import { UsersIcon } from '@sanity/icons/Users';
import { photo, str, txt } from './helpers';
import { AssignedTo } from '../components/AssignedTo';

export const staff = defineType({
  name: 'staff',
  title: 'Staff member',
  type: 'document',
  icon: UsersIcon,
  fields: [
    str('name', 'Name', { required: true }),
    str('title', 'Title', { required: true, description: 'Their main title, e.g. "Managing Director, North" or "U12 Girls coach". A program can show a different title where it lists them.' }),
    txt('bio', 'Description', { rows: 3, description: 'Optional. A sentence or two about them.' }),
    defineField({ name: 'email', title: 'Email', type: 'email', description: 'Optional. Shown as a link.' }),
    photo('headshot', 'Headshot'),
    defineField({
      name: 'assignedTo', title: 'Assigned to', type: 'string', readOnly: true,
      description: 'Where this person shows on the site. Add or remove them in Programs: the Staff tab for program leadership, the Regions tab for regional leaders and coaches.',
      components: { input: AssignedTo },
    }),
  ],
  preview: { select: { title: 'name', subtitle: 'title', media: 'headshot' } },
  orderings: [{ title: 'Name', name: 'name', by: [{ field: 'name', direction: 'asc' }] }],
});
