// One document per program (Academy, Club, Rec, Futures). These are fixed: the page addresses,
// home pyramid and compare table are built around the four program ids, so editors edit them
// but can't add or delete programs.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { MONTH_OPTIONS, link, photo, str, txt } from './helpers';

const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']] as const;
const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

const daySessions = (name: string, title: string) =>
  defineField({
    name, title, type: 'array',
    of: [defineArrayMember({
      type: 'object', name: 'session',
      fields: [
        str('time', 'Time', { required: true, description: 'Short, e.g. "5:30 to 7:00P" or "TBD".' }),
        str('label', 'What', { required: true, description: 'e.g. "Team training".' }),
        defineField({ name: 'kind', title: 'Type', type: 'string', options: { list: [{ title: 'Training', value: 'training' }, { title: 'Match', value: 'match' }], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
      ],
      preview: { select: { title: 'label', subtitle: 'time' } },
    })],
  });

const regionStatus = (name: string, title: string) =>
  defineField({
    name, title, type: 'object', group: 'regions',
    fields: [
      defineField({
        name: 'status', title: 'Status', type: 'string', validation: (r) => r.required(),
        options: { list: [{ title: 'Running', value: 'active' }, { title: 'Coming soon', value: 'soon' }, { title: 'Not offered', value: 'none' }], layout: 'radio', direction: 'horizontal' },
      }),
      str('hub', 'Hub', { description: 'Where it runs, e.g. "Draper / Sandy".', hidden: ({ parent }: any) => parent?.status === 'none' }),
      str('season', 'Launching', { description: 'e.g. "Fall 2027".', hidden: ({ parent }: any) => parent?.status !== 'soon' }),
      defineField({ name: 'feeDelta', title: 'Price difference in this region ($)', type: 'number', description: 'Added to the program cost. Use a negative number for a discount, 0 for none.', hidden: ({ parent }) => parent?.status === 'none' }),
    ],
  });

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'photos', title: 'Photos' },
    { name: 'join', title: 'Registration' },
    { name: 'cost', title: 'Cost' },
    { name: 'season', title: 'Season and week' },
    { name: 'dev', title: 'Development and compare' },
    { name: 'staff', title: 'Staff' },
    { name: 'regions', title: 'Regions' },
    { name: 'dev-only', title: 'Developer' },
  ],
  fields: [
    // Overview
    str('name', 'Name', { required: true, group: 'overview' }),
    str('tier', 'Tier label', { required: true, group: 'overview', description: 'e.g. "Tier 02 · Competitive".' }),
    str('ages', 'Ages', { required: true, group: 'overview', description: 'Write ranges as "U9 to U19".' }),
    str('kicker', 'Kicker', { required: true, group: 'overview', description: 'The small word above the name, e.g. "Competitive".' }),
    str('line', 'Leagues line', { required: true, group: 'overview', description: 'e.g. "USYS · State Cup".' }),
    txt('tagline', 'Tagline', { required: true, group: 'overview', rows: 2 }),
    str('forHead', 'Who it\'s for (heading)', { required: true, group: 'overview' }),
    txt('intro', 'Intro', { required: true, group: 'overview' }),
    defineField({
      name: 'leagues', title: 'Leagues and competitions', type: 'array', group: 'overview',
      of: [defineArrayMember({
        type: 'object', name: 'league',
        fields: [
          str('name', 'Name', { required: true }), str('level', 'Level', { required: true }), txt('d', 'Description', { required: true, rows: 2 }),
          photo('logo', 'Logo'),
          defineField({ name: 'lw', title: 'Logo width (px)', type: 'number' }),
          defineField({ name: 'lh', title: 'Logo height (px)', type: 'number' }),
        ],
        preview: { select: { title: 'name', subtitle: 'level', media: 'logo' } },
      })],
    }),

    // Photos
    photo('img', 'Hero photo', { required: true, group: 'photos', description: 'Full-width photo at the top of the program page. Use a wide, high-quality shot.' }),
    defineField({
      name: 'photos', title: 'Section photos', type: 'object', group: 'photos',
      fields: [
        photo('who', 'Who it\'s for', { required: true }),
        photo('core', 'Core section', { required: true }),
        photo('cta', 'Join section', { required: true }),
        defineField({ name: 'dev', title: 'Development (4 photos, Technical, Tactical, Physical, Mental)', type: 'array', of: [defineArrayMember({ type: 'image', options: { hotspot: true } })], validation: (r) => r.required().length(4) }),
      ],
    }),

    // Registration
    link('registerUrl', 'Ollie registration link', { required: true, group: 'join', description: 'Every Register button for this program uses this link.' }),
    defineField({
      name: 'enrollment', title: 'Enrollment', type: 'string', group: 'join',
      options: { list: [{ title: 'Accepting trial applications', value: 'trial' }, { title: 'Open tryout registration', value: 'tryouts' }], layout: 'radio' },
    }),
    str('nextTryout', 'Next tryout (text)', { group: 'join', description: 'e.g. "To be announced".' }),
    str('registrationOpens', 'Registration opens (text)', { group: 'join', description: 'e.g. "May 2027".' }),
    txt('joinCopy', 'Join section copy', { required: true, group: 'join', rows: 2 }),
    str('cta', 'Button label', { required: true, group: 'join', description: 'e.g. "Book a tryout".' }),
    str('sessionLabel', 'Session picker label', { required: true, group: 'join' }),
    defineField({ name: 'years', title: 'Birth years accepted', type: 'array', group: 'join', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      name: 'groups', title: 'Age groups (optional)', type: 'array', group: 'join',
      description: 'Shown in the hero and home program list when a program prices age groups differently.',
      of: [defineArrayMember({
        type: 'object', name: 'group',
        fields: [str('label', 'Ages', { required: true }), str('line', 'Leagues', { required: true }), defineField({ name: 'cost', title: 'Cost ($)', type: 'number', validation: (r) => r.required().min(0) }), str('commit', 'Commitment', { required: true })],
        preview: { select: { title: 'label', subtitle: 'line' } },
      })],
    }),

    // Cost
    defineField({ name: 'cost', title: 'Cost ($)', type: 'number', group: 'cost', validation: (r) => r.required().min(0) }),
    defineField({ name: 'unit', title: 'Billed', type: 'string', group: 'cost', options: { list: ['per year', 'per season'], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    txt('costNote', 'Cost note', { required: true, group: 'cost', rows: 2 }),
    defineField({ name: 'includes', title: 'What\'s included', type: 'array', group: 'cost', of: [{ type: 'string' }] }),
    str('commit', 'Commitment', { required: true, group: 'cost', description: 'e.g. "3× / week".' }),
    txt('commitNote', 'Commitment note', { required: true, group: 'cost', rows: 2 }),

    // Season and week
    defineField({
      name: 'phases', title: 'Season timeline', type: 'array', group: 'season',
      of: [defineArrayMember({
        type: 'object', name: 'phase',
        fields: [
          str('label', 'Phase', { required: true }),
          defineField({ name: 'startMonth', title: 'From', type: 'number', options: { list: MONTH_OPTIONS }, validation: (r) => r.required() }),
          defineField({ name: 'endMonth', title: 'Through', type: 'number', options: { list: MONTH_OPTIONS }, validation: (r) => r.required().min(r.valueOfField('startMonth')) }),
          txt('d', 'Description', { required: true, rows: 2 }),
        ],
        preview: { select: { title: 'label', subtitle: 'd' } },
      })],
    }),
    defineField({ name: 'week', title: 'Typical week', type: 'object', group: 'season', fields: DAYS.map(([k, t]) => daySessions(k, t)) }),

    // Development and compare
    defineField({
      name: 'development', title: 'Development model (this program\'s summary for each pillar)', type: 'object', group: 'dev',
      fields: PILLARS.map(([k, t]) => txt(k, t, { required: true, rows: 2 })),
    }),
    defineField({
      name: 'compare', title: 'Compare programs table (this program\'s column)', type: 'object', group: 'dev',
      description: 'Leave a row empty to show it as not included.',
      fields: [
        str('training', 'Training sessions / week', { required: true }),
        str('coaching', 'Licensed professional coaching', { required: true }),
        str('competition', 'Competition', { required: true }),
        str('yearRound', 'Year-round program'),
        str('evaluations', 'Player evaluations'),
        str('strength', 'Strength and conditioning'),
        str('film', 'Film and video review'),
        str('mental', 'Mental performance seminars'),
        str('next', 'Next step on the pathway', { required: true }),
      ],
    }),

    // Staff
    defineField({
      name: 'directors', title: 'Directors', type: 'array', group: 'staff',
      of: [defineArrayMember({
        type: 'object', name: 'director',
        fields: [str('name', 'Name', { required: true }), str('role', 'Role', { required: true }), txt('bio', 'Short bio', { required: true, rows: 2 }), photo('headshot', 'Headshot')],
        preview: { select: { title: 'name', subtitle: 'role', media: 'headshot' } },
      })],
    }),
    defineField({
      name: 'coaches', title: 'Coaches', type: 'array', group: 'staff',
      of: [defineArrayMember({
        type: 'object', name: 'coach',
        fields: [str('name', 'Name', { required: true }), str('role', 'Team', { required: true, description: 'e.g. "U9 to U11 Boys".' }), photo('headshot', 'Headshot')],
        preview: { select: { title: 'name', subtitle: 'role', media: 'headshot' } },
      })],
    }),

    // Regions
    regionStatus('north', 'North'),
    regionStatus('south', 'South'),
    regionStatus('west', 'West'),

    // Developer only: these change how pages behave, so they're locked.
    defineField({ name: 'key', title: 'Program id', type: 'string', group: 'dev-only', readOnly: true }),
    defineField({ name: 'order', title: 'Order', type: 'number', group: 'dev-only', readOnly: true }),
    defineField({ name: 'num', title: 'Number label', type: 'string', group: 'dev-only', readOnly: true }),
    defineField({ name: 'kind', title: 'Kind', type: 'string', group: 'dev-only', readOnly: true, description: 'tryout: teams picked at tryouts. season: everyone who signs up plays.' }),
    defineField({ name: 'invite', title: 'Invitation only', type: 'boolean', group: 'dev-only', readOnly: true }),
  ],
  preview: { select: { title: 'name', subtitle: 'tier', media: 'img' } },
});
