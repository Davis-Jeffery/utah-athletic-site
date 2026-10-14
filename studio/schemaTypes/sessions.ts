// Recreation and Futures sessions: one document per session in one region. Everyone who signs up
// plays (no tryouts). The two programs are separate, so each has its own type and sidebar list.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { ClockIcon } from '@sanity/icons/Clock';
import { SunIcon } from '@sanity/icons/Sun';
import { AGE_OPTIONS, REGION_OPTIONS, TIME_OPTIONS, fmtTime, link, str } from './helpers';

const label = (opts: { title: string; value: unknown }[], v: unknown) => opts.find((o) => o.value === v)?.title ?? '';
const date = (name: string, title: string, description?: string, after?: [string, string]) =>
  defineField({
    name, title, type: 'date', description, options: { dateFormat: 'MMM D, YYYY' },
    validation: (r) => r.required().custom((v, ctx) => {
      if (!after || typeof v !== 'string') return true;
      const prev = (ctx.document as Record<string, unknown>)?.[after[0]];
      return typeof prev === 'string' && v < prev ? `Must be on or after the ${after[1]}.` : true;
    }),
  });
// A class's end time must be after its start time (both on the same class).
const afterStart = (end: unknown, ctx: { parent?: unknown }) => {
  const start = (ctx.parent as { startTime?: string } | undefined)?.startTime;
  return start && typeof end === 'string' && end <= start ? 'Must be after the start time.' : true;
};

const STATUS_HELP = 'Leave on Automatic and the site works it out from the dates: "Registration opens …" before the open date, open until the close date, then closed, "In season" from the start date, and the session drops off after the end date. Pick another option only to override that.';

function sessionType(o: { name: string; title: string; program: string; icon: typeof ClockIcon; statuses: { title: string; value: string }[]; classes?: boolean }) {
  return defineType({
    name: o.name,
    title: o.title,
    type: 'document',
    icon: o.icon,
    fields: [
      str('name', 'Name', { required: true, description: o.classes ? 'e.g. "Spring 2027, Saturday mornings".' : 'e.g. "Spring 2027".' }),
      defineField({ name: 'region', title: 'Region', type: 'string', options: { list: REGION_OPTIONS, layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
      defineField({ name: 'venue', title: 'Venue', type: 'reference', to: [{ type: 'venue' }], description: 'Not listed? Add it under Venues first.', validation: (r) => r.required() }),
      defineField({ name: 'minAge', title: 'Youngest age group', type: 'number', options: { list: AGE_OPTIONS }, description: `Optional. Leave both empty to show the program's ages.` }),
      defineField({
        name: 'maxAge', title: 'Oldest age group', type: 'number', options: { list: AGE_OPTIONS },
        validation: (r) => r.custom((max, ctx) => {
          const min = (ctx.document as { minAge?: number })?.minAge;
          if (typeof min === 'number' && typeof max !== 'number') return 'Pick the oldest age group too (the same as the youngest for one age group).';
          return typeof min === 'number' && typeof max === 'number' && max < min ? 'Must be the same as or older than the youngest.' : true;
        }),
      }),
      defineField({ name: 'cost', title: 'Cost ($)', type: 'number', validation: (r) => r.required().min(0) }),
      date('registrationOpens', 'Registration opens'),
      date('registrationCloses', 'Registration closes', undefined, ['registrationOpens', 'open date']),
      date('start', o.classes ? 'First class' : 'Season starts'),
      date('end', o.classes ? 'Last class' : 'Season ends', 'The session drops off the site after this day.', ['start', 'start date']),
      defineField({
        name: 'status', title: 'Registration status', type: 'string', initialValue: 'auto', description: STATUS_HELP,
        options: { list: [{ title: 'Automatic', value: 'auto' }, ...o.statuses], layout: 'radio', direction: 'horizontal' },
        validation: (r) => r.required(),
      }),
      ...(o.classes
        ? [defineField({ name: 'capacity', title: 'Spots', type: 'number', description: 'Optional. When this many families have paid, the session switches to Full by itself. Leave empty for no limit.', validation: (r) => r.min(1).integer() })]
        // Futures registers on the site with Stripe; Recreation still uses Ollie.
        : [link('registerUrl', 'Registration link', { description: `Optional. Leave empty to use the ${o.program} program's Ollie link.` })]),
      ...(o.classes
        ? [defineField({
          name: 'classes', title: 'Classes', type: 'array',
          description: 'Each class in this session. Add as many as you need; they show in date order.',
          of: [defineArrayMember({
            type: 'object', name: 'class',
            fields: [
              defineField({ name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'ddd, MMM D, YYYY' }, validation: (r) => r.required() }),
              defineField({ name: 'startTime', title: 'Starts', type: 'string', options: { list: TIME_OPTIONS }, validation: (r) => r.required() }),
              defineField({ name: 'endTime', title: 'Ends', type: 'string', options: { list: TIME_OPTIONS }, validation: (r) => r.required().custom(afterStart) }),
              str('note', 'Note', { description: 'Optional, e.g. "Picture day" or "No class: Thanksgiving".' }),
            ],
            preview: {
              select: { date: 'date', start: 'startTime', end: 'endTime', note: 'note' },
              prepare: ({ date, start, end, note }) => ({ title: date ?? 'Pick a date', subtitle: [start && `${fmtTime(start)} to ${fmtTime(end)}`, note].filter(Boolean).join(' · ') }),
            },
          })],
        })]
        : []),
    ],
    orderings: [{ title: 'Start date', name: 'start', by: [{ field: 'start', direction: 'asc' }] }],
    preview: {
      select: { name: 'name', region: 'region', start: 'start', end: 'end', cost: 'cost', venue: 'venue.name' },
      prepare: ({ name, region, start, end, cost, venue }) => ({
        title: name,
        subtitle: [label(REGION_OPTIONS, region), start && `${start} to ${end ?? '?'}`, typeof cost === 'number' && `$${cost}`, venue].filter(Boolean).join(' · '),
      }),
    },
  });
}

export const recSession = sessionType({
  name: 'recSession', title: 'Recreation session', program: 'Recreation', icon: ClockIcon,
  statuses: [{ title: 'Open', value: 'open' }, { title: 'Closed', value: 'closed' }, { title: 'Full', value: 'full' }],
});

export const futuresSession = sessionType({
  name: 'futuresSession', title: 'Futures session', program: 'Futures', icon: SunIcon, classes: true,
  statuses: [{ title: 'Open', value: 'open' }, { title: 'In season', value: 'inseason' }, { title: 'Closed', value: 'closed' }, { title: 'Full', value: 'full' }],
});
