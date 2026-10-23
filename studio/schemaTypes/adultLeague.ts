// One document per adult league (UPSL, Adult Recreation). Fixed like programs: each has its own
// page (/adult/upsl/, /adult/recreation/) and a box under the home pyramid, so editors edit them
// but can't add or delete leagues.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { UsersIcon } from '@sanity/icons/Users';
import { link, photo, placeholderNote, seo, str, txt } from './helpers';
import { DAYS, daySessions, people, phasesField } from './program';

// Keep in step with ADULT in src/data/site.ts.
export const ADULT_LEAGUES = [
  ['upsl', 'UPSL'],
  ['rec', 'Adult Recreation'],
] as const;

export const adultLeague = defineType({
  name: 'adultLeague',
  title: 'Adult league',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'join', title: 'Joining' },
    { name: 'season', title: 'Season and week' },
    { name: 'cost', title: 'Cost' },
    { name: 'people', title: 'Staff and fields' },
    { name: 'faq', title: 'Questions' },
    { name: 'photos', title: 'Photos' },
  ],
  fields: [
    defineField({ name: 'key', title: 'Key', type: 'string', readOnly: true, hidden: true }),

    // Overview
    str('name', 'Name', { required: true, group: 'overview' }),
    str('tier', 'Small heading', { required: true, group: 'overview', description: 'Above the name, e.g. "Adult · Semi-pro".' }),
    str('ages', 'Who can play', { required: true, group: 'overview', description: 'Short, e.g. "18+" or "Men 18+".' }),
    str('homeLine', 'Home page line', { required: true, group: 'overview', description: 'Under the name in its box below the home pyramid, e.g. "UA West · Tooele".' }),
    txt('tagline', 'Tagline', { required: true, group: 'overview', rows: 2 }),
    defineField({
      name: 'stats', title: 'Quick facts', type: 'array', group: 'overview',
      description: 'The strip under the tagline. Up to 4, e.g. Level: "Semi-pro", Season: "Spring and Fall".',
      of: [defineArrayMember({ type: 'object', name: 'stat', fields: [str('label', 'Label', { required: true }), str('value', 'Value', { required: true })], preview: { select: { title: 'value', subtitle: 'label' } } })],
      validation: (r) => r.max(4),
    }),
    str('forHead', 'Who it\'s for (heading)', { required: true, group: 'overview' }),
    txt('intro', 'Who it\'s for (text)', { required: true, group: 'overview' }),
    defineField({
      name: 'expect', title: 'What to expect', type: 'array', group: 'overview',
      description: 'Short cards under "Who it\'s for", e.g. "Competitive games", "Flexible commitment".',
      of: [defineArrayMember({ type: 'object', name: 'expectCard', fields: [str('title', 'Title', { required: true }), txt('body', 'Text', { required: true, rows: 2 })], preview: { select: { title: 'title', subtitle: 'body' } } })],
    }),
    defineField({
      name: 'leagues', title: 'Where we play', type: 'array', group: 'overview',
      of: [defineArrayMember({
        type: 'object', name: 'league',
        fields: [str('name', 'Name', { required: true }), str('level', 'Level', { required: true }), txt('d', 'Description', { required: true, rows: 2 }), photo('logo', 'Logo')],
        preview: { select: { title: 'name', subtitle: 'level', media: 'logo' } },
      })],
    }),
    placeholderNote(),
    seo('seo', 'overview'),

    // Joining
    defineField({
      name: 'join', title: 'How to join', type: 'object', group: 'join', options: { collapsible: false },
      fields: [
        str('status', 'Status', { required: true, description: 'Shown in the hero and the join section, e.g. "Spring 2027 tryouts open" or "Registration opens January".' }),
        str('heading', 'Heading', { required: true, description: 'e.g. "Think you can play at this level?"' }),
        str('headingAccent', 'Heading, teal part', { description: 'Optional, shown after the heading in teal.' }),
        txt('body', 'Text', { required: true, rows: 3 }),
        str('button', 'Button label', { required: true, description: 'e.g. "Register for tryouts". The arrow is added for you.' }),
        link('url', 'Button link', { description: 'Optional, e.g. an Ollie registration page. Leave empty and the button opens the question form below.' }),
        str('formHeading', 'Form heading', { required: true, description: 'e.g. "Ask about joining".' }),
      ],
    }),

    // Season and week
    phasesField('season'),
    defineField({ name: 'week', title: 'Typical week', type: 'object', group: 'season', fields: DAYS.map(([k, t]) => daySessions(k, t)) }),
    txt('commitNote', 'Commitment note', { group: 'season', rows: 2, description: 'Under the week, e.g. "Games are on Sunday afternoons; training is optional."' }),

    // Cost
    defineField({ name: 'cost', title: 'Cost ($)', type: 'number', group: 'cost', description: 'Leave empty to show "To be announced".', validation: (r) => r.min(0) }),
    str('unit', 'Cost is', { group: 'cost', description: 'e.g. "per player, per season" or "per team".' }),
    txt('costNote', 'Cost note', { group: 'cost', rows: 2 }),
    defineField({ name: 'includes', title: 'What\'s included', type: 'array', group: 'cost', of: [{ type: 'string' }] }),

    // Staff and fields
    people('leadership', 'Staff', { group: 'people', titleHint: 'e.g. "Head Coach".', description: 'Shown on the page; their emails get this league\'s form messages. Pick people from Staff.' }),
    defineField({ name: 'venues', title: 'Home fields', type: 'array', group: 'people', of: [{ type: 'reference', to: [{ type: 'venue' }] }], validation: (r) => r.unique() }),

    // Questions
    defineField({
      name: 'faqs', title: 'Questions and answers', type: 'array', group: 'faq',
      of: [defineArrayMember({ type: 'object', name: 'faq', fields: [str('q', 'Question', { required: true }), txt('a', 'Answer', { required: true, rows: 3 })], preview: { select: { title: 'q', subtitle: 'a' } } })],
    }),

    // Photos (optional: club photos from the home collage stand in until these are set)
    photo('img', 'Hero photo', { group: 'photos', description: 'Optional. Wide photo at the top of the page.' }),
    photo('who', 'Who it\'s for photo', { group: 'photos' }),
    photo('cta', 'Join banner photo', { group: 'photos' }),
  ],
  preview: { select: { title: 'name', subtitle: 'homeLine' } },
});
