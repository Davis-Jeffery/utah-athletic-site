import { defineField, defineType } from 'sanity';
import { ClockIcon } from '@sanity/icons/Clock';
import { str } from './helpers';

export const season = defineType({
  name: 'season',
  title: 'Rec and Futures session',
  type: 'document',
  icon: ClockIcon,
  description: 'Everyone who signs up is placed on a team (no tryouts).',
  fields: [
    str('name', 'Name', { required: true, description: 'e.g. "Session 1".' }),
    str('span', 'Months', { required: true, description: 'e.g. "Nov to Dec".' }),
    defineField({ name: 'start', title: 'First day', type: 'date', options: { dateFormat: 'MMM D, YYYY' }, validation: (r) => r.required() }),
    defineField({
      name: 'signupOpens', title: 'Sign-up opens', type: 'date', options: { dateFormat: 'MMM D, YYYY' },
      description: 'The site shows "Sign-up open now" or "Sign-up opens Nov 15" from this date, so it never goes stale. Leave empty if sign-up is already open.',
    }),
  ],
  orderings: [{ title: 'First day', name: 'start', by: [{ field: 'start', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'span' } },
});
