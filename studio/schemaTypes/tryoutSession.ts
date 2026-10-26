import { defineArrayMember, defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { AGE_OPTIONS, REGION_OPTIONS, TIME_OPTIONS, TRYOUT_PROGRAM_OPTIONS, fmtTime, link } from './helpers';

const label = (opts: { title: string; value: unknown }[], v: unknown) => opts.find((o) => o.value === v)?.title ?? '';

export const tryoutSession = defineType({
  name: 'tryoutSession',
  title: 'Tryout session',
  type: 'document',
  icon: CalendarIcon,
  description: 'A tryout can run over several days, each with its own field and times; families register once (one Ollie link). Days drop off the site as they pass, and the tryout after its last day.',
  fields: [
    defineField({ name: 'program', title: 'Program', type: 'string', options: { list: TRYOUT_PROGRAM_OPTIONS, layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    defineField({ name: 'region', title: 'Region', type: 'string', options: { list: REGION_OPTIONS, layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    defineField({
      name: 'days', title: 'Days', type: 'array', validation: (r) => r.required().min(1),
      description: 'Each day of this tryout: date, field and times. Add another day for a tryout over several days.',
      of: [defineArrayMember({
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
      })],
    }),
    defineField({ name: 'minAge', title: 'Youngest age group', type: 'number', options: { list: AGE_OPTIONS }, validation: (r) => r.required() }),
    defineField({
      name: 'maxAge', title: 'Oldest age group', type: 'number', options: { list: AGE_OPTIONS },
      description: 'Same as the youngest for a single age group.',
      validation: (r) => r.required().custom((max, ctx) => {
        const min = (ctx.document as { minAge?: number })?.minAge;
        return typeof min === 'number' && typeof max === 'number' && max < min ? 'Must be the same as or older than the youngest.' : true;
      }),
    }),
    defineField({ name: 'gender', title: 'Players', type: 'string', options: { list: ['Boys', 'Girls', 'Coed'], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    link('registerUrl', 'Ollie registration link', { description: 'Optional. This session\'s Register button goes here. Leave empty to use the program\'s Default Ollie link (Page content, Registration tab).' }),
  ],
  preview: {
    select: { program: 'program', region: 'region', min: 'minAge', max: 'maxAge', gender: 'gender', date: 'days.0.date', start: 'days.0.startTime', venue: 'days.0.venue.name', d1: 'days.1.date' },
    prepare: ({ program, region, min, max, gender, date, start, venue, d1 }) => ({
      title: `${label(TRYOUT_PROGRAM_OPTIONS, program)} ${label(REGION_OPTIONS, region)}: ${min === max || !max ? `U${min}` : `U${min} to U${max}`} ${gender ?? ''}`.trim(),
      subtitle: [date, fmtTime(start), venue, d1 ? 'and more days' : ''].filter(Boolean).join(' · '),
    }),
  },
});
