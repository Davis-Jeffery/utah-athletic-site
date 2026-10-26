// A tryout, e.g. "2027 Academy Tryouts" for Academy North: one name, program, region and Ollie
// link, with its age groups. Each age group (ages and players) has its own days, and each day its
// own date, venue and times. Easiest to edit from Studio > Tryouts. The site works out the date
// range, ages and players from the groups; days drop off as they pass, and the tryout after its
// last day.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { AGE_OPTIONS, REGION_OPTIONS, TIME_OPTIONS, TRYOUT_PROGRAM_OPTIONS, fmtTime, link, str } from './helpers';

const label = (opts: { title: string; value: unknown }[], v: unknown) => opts.find((o) => o.value === v)?.title ?? '';
const ages = (min?: number, max?: number) => (min == null ? '' : min === max || max == null ? `U${min}` : `U${min} to U${max}`);

const day = defineArrayMember({
  type: 'object', name: 'tryoutDay',
  fields: [
    defineField({ name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'ddd, MMM D, YYYY' }, validation: (r) => r.required() }),
    defineField({ name: 'venue', title: 'Venue', type: 'reference', to: [{ type: 'venue' }], description: 'Not listed? Add it under Venues first.', validation: (r) => r.required() }),
    defineField({ name: 'startTime', title: 'Starts', type: 'string', options: { list: TIME_OPTIONS }, validation: (r) => r.required() }),
    defineField({
      name: 'endTime', title: 'Ends', type: 'string', options: { list: TIME_OPTIONS },
      validation: (r) => r.required().custom((end, ctx) => {
        const start = (ctx.parent as { startTime?: string })?.startTime;
        return start && typeof end === 'string' && end <= start ? 'Must be after the start time.' : true;
      }),
    }),
  ],
  preview: {
    select: { date: 'date', start: 'startTime', end: 'endTime', venue: 'venue.name' },
    prepare: ({ date, start, end, venue }) => ({ title: date ?? 'Pick a date', subtitle: [start && `${fmtTime(start)} to ${fmtTime(end)}`, venue].filter(Boolean).join(' · ') }),
  },
});

const group = defineArrayMember({
  type: 'object', name: 'tryoutGroup',
  fields: [
    defineField({ name: 'minAge', title: 'Youngest age group', type: 'number', options: { list: AGE_OPTIONS }, validation: (r) => r.required() }),
    defineField({
      name: 'maxAge', title: 'Oldest age group', type: 'number', options: { list: AGE_OPTIONS }, description: 'Same as the youngest for a single age group.',
      validation: (r) => r.required().custom((max, ctx) => {
        const min = (ctx.parent as { minAge?: number })?.minAge;
        return typeof min === 'number' && typeof max === 'number' && max < min ? 'Must be the same as or older than the youngest.' : true;
      }),
    }),
    defineField({ name: 'gender', title: 'Players', type: 'string', options: { list: ['Boys', 'Girls', 'Coed'], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    defineField({ name: 'days', title: 'Days', type: 'array', of: [day], validation: (r) => r.required().min(1), description: 'Each day this group tries out: date, field and times.' }),
    link('registerUrl', 'Ollie link for this group (optional)', { description: 'Only if this group registers somewhere else. Empty uses the tryout\'s link.' }),
  ],
  preview: {
    select: { min: 'minAge', max: 'maxAge', gender: 'gender', date: 'days.0.date', d1: 'days.1.date' },
    prepare: ({ min, max, gender, date, d1 }) => ({ title: `${ages(min, max)} ${gender ?? ''}`.trim() || 'New age group', subtitle: [date, d1 ? 'and more days' : ''].filter(Boolean).join(' · ') }),
  },
});

// Before tryouts had age groups, each age group was its own document with these fields. Kept
// hidden so older documents still open; Studio > Tryouts saves the grouped shape.
const legacy = [
  defineField({ name: 'minAge', title: 'Youngest (old)', type: 'number', hidden: true, readOnly: true }),
  defineField({ name: 'maxAge', title: 'Oldest (old)', type: 'number', hidden: true, readOnly: true }),
  defineField({ name: 'gender', title: 'Players (old)', type: 'string', hidden: true, readOnly: true }),
  defineField({ name: 'days', title: 'Days (old)', type: 'array', of: [day], hidden: true, readOnly: true }),
];

export const tryoutSession = defineType({
  name: 'tryoutSession',
  title: 'Tryout',
  type: 'document',
  icon: CalendarIcon,
  description: 'A tryout and its age groups, each with its own days. Easiest to edit from Tryouts at the top of the Studio.',
  fields: [
    str('name', 'Name', { required: true, description: 'e.g. "2027 Academy Tryouts". The site adds the dates, ages and players.' }),
    defineField({ name: 'program', title: 'Program', type: 'string', options: { list: TRYOUT_PROGRAM_OPTIONS, layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    defineField({ name: 'region', title: 'Region', type: 'string', options: { list: REGION_OPTIONS, layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    link('registerUrl', 'Ollie registration link', { description: 'Optional. Every age group\'s Register button goes here, unless the group has its own. Empty uses the program\'s Default Ollie link (Page content, Registration tab).' }),
    defineField({ name: 'groups', title: 'Age groups', type: 'array', of: [group], validation: (r) => r.required().min(1), description: 'Each age group and players, with its own days.' }),
    ...legacy,
  ],
  preview: {
    select: { name: 'name', program: 'program', region: 'region', date: 'groups.0.days.0.date' },
    prepare: ({ name, program, region, date }) => ({
      title: name || 'Tryout',
      subtitle: [`${label(TRYOUT_PROGRAM_OPTIONS, program)} ${label(REGION_OPTIONS, region)}`.trim(), date].filter(Boolean).join(' · '),
    }),
  },
});
