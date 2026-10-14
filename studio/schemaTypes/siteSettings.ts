// Site-wide copy and lists that aren't tied to one program. One fixed document.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { headingPair, link, photo, placeholderNote, section, str, txt } from './helpers';

const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'home', title: 'Home page' },
    { name: 'pro', title: 'Professional tier' },
    { name: 'tryouts', title: 'Tryouts page' },
    { name: 'events', title: 'Events page' },
    { name: 'futures', title: 'Futures registration' },
    { name: 'dev', title: 'Development model' },
  ],
  fields: [
    defineField({ name: 'mainEmail', title: 'Main contact email', type: 'email', group: 'general', validation: (r) => r.required() }),
    txt('futuresWaiver', 'Waiver', {
      group: 'futures', rows: 14,
      description: 'Families must accept this to register for Futures. Each registration keeps a copy of the text they accepted, so editing it later doesn\'t change past registrations.',
    }),
    str('tryoutsLabel', 'Header Tryouts button', { required: true, group: 'general', description: 'e.g. "Tryouts 2027".' }),
    defineField({
      name: 'social', title: 'Social links', type: 'array', group: 'general',
      of: [defineArrayMember({ type: 'object', name: 'socialLink', fields: [str('label', 'Network', { required: true }), link('href', 'Link', { required: true })], preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),

    // Home page, in the order sections appear on the page.
    section('homeHero', 'Hero', 'home', [
      str('kicker', 'Small heading', { required: true, description: 'Above the big heading, e.g. "The Utah Athletic pathway".' }),
      str('heading', 'Heading, first line', { required: true }),
      str('headingAccent', 'Heading, second line (teal)', { required: true }),
      txt('intro', 'Intro', { required: true, rows: 3 }),
    ]),
    defineField({
      name: 'collage', title: 'Hero collage photos', type: 'array', group: 'home',
      description: 'Club photos for the home page collage. Drag to reorder. At least 11.',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      options: { layout: 'grid' },
      validation: (r) => r.required().min(11),
    }),
    section('homeTryouts', 'Tryouts near you', 'home', [
      str('kicker', 'Small heading', { required: true, description: 'The region name is added after it, e.g. "Tryouts near you · North region".' }),
      ...headingPair(),
    ], 'The cards come from Tryout sessions and Rec and Futures sessions.'),
    section('homeEvents', 'Tournaments', 'home', [
      str('kicker', 'Small heading', { required: true }),
      ...headingPair(),
    ], 'The cards come from Tournaments and events.'),
    section('homePathway', 'Where the pathway leads', 'home', [
      str('kicker', 'Small heading', { required: true }),
      str('heading', 'Heading', { required: true }),
      txt('body', 'Text', { required: true, rows: 4 }),
      placeholderNote(),
      str('button', 'Button label', { required: true, description: 'Opens the Network page. The arrow is added for you.' }),
      defineField({
        name: 'cards', title: 'Club cards', type: 'array',
        of: [defineArrayMember({
          type: 'object', name: 'pathwayCard',
          fields: [
            str('name', 'Name', { required: true }),
            str('details', 'Details', { required: true, description: 'e.g. "Vichy, France · Professional club".' }),
            str('tag', 'Tag', { required: true, description: 'e.g. "Today" or "In development".' }),
            defineField({ name: 'look', title: 'Style', type: 'string', options: { list: [{ title: 'Solid (exists today)', value: 'today' }, { title: 'Dashed (in development)', value: 'development' }], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
            defineField({ name: 'useClubLogo', title: 'Use the Utah Athletic logo', type: 'boolean', initialValue: false }),
            photo('crest', 'Crest', { description: 'Optional. Shown in the circle.', hidden: ({ parent }: any) => parent?.useClubLogo }),
            str('crestLabel', 'Text in the empty circle', { description: 'Shown until a crest is uploaded, e.g. "RC Vichy crest". Leave empty for a blank circle.', hidden: ({ parent }: any) => parent?.useClubLogo || parent?.crest }),
          ],
          preview: { select: { title: 'name', subtitle: 'tag', media: 'crest' } },
        })],
      }),
    ]),
    section('homeInside', 'Inside Utah Athletic', 'home', [
      str('heading', 'Heading', { required: true }),
      str('kicker', 'Small heading', { required: true, description: 'Right of the heading, e.g. "The docuseries".' }),
    ], 'The videos are below.'),
    defineField({
      name: 'videos', title: 'Inside Utah Athletic videos', type: 'array', group: 'home',
      of: [defineArrayMember({
        type: 'object', name: 'video',
        fields: [str('title', 'Title', { required: true }), str('len', 'Length', { required: true, description: 'e.g. "05:56".' }), photo('thumbnail', 'Thumbnail', { required: true }), link('url', 'YouTube link', { required: true })],
        preview: { select: { title: 'title', subtitle: 'len', media: 'thumbnail' } },
      })],
    }),
    section('homePlay', 'Closing call to action', 'home', [
      str('heading', 'Heading', { required: true }),
      txt('body', 'Text', { required: true, rows: 2 }),
      str('primaryButton', 'Main button label', { required: true, description: 'Opens the Academy page. The arrow is added for you.' }),
      str('secondaryButton', 'Second button label', { required: true, description: 'Scrolls up to the programs.' }),
    ]),

    // Professional tier: the top of the pyramid, which leads to the Network page.
    section('proTier', 'Professional tier', 'pro', [
      str('rowName', 'Program list: name', { required: true, description: 'In the list under the home page heading.' }),
      str('rowLine', 'Program list: details', { required: true }),
      str('rowLink', 'Program list: link text', { required: true, description: 'The arrow is added for you.' }),
      str('pyramidKicker', 'Pyramid label: small heading', { required: true }),
      str('pyramidName', 'Pyramid label: name', { required: true }),
      str('pyramidSub', 'Pyramid label: line under the name', { required: true, description: 'The arrow is added for you.' }),
      str('hint', 'Pyramid hover hint', { required: true, description: 'Shown under the pyramid when someone points at the top tier.' }),
    ], 'Both places open the Network page.'),

    defineField({ name: 'tryoutBring', title: 'What to bring', type: 'array', group: 'tryouts', of: [{ type: 'string' }] }),

    defineField({
      name: 'eventReel', title: 'Highlight reel', type: 'array', group: 'events',
      of: [defineArrayMember({
        type: 'object', name: 'reelItem',
        fields: [photo('photo', 'Photo', { required: true }), str('event', 'Event', { required: true }), str('caption', 'Caption', { required: true })],
        preview: { select: { title: 'event', subtitle: 'caption', media: 'photo' } },
      })],
    }),

    defineField({
      name: 'development', title: 'Development pillars (shared across programs)', type: 'object', group: 'dev',
      fields: PILLARS.map(([k, t]) =>
        defineField({
          name: k, title: t, type: 'object',
          fields: [str('tag', 'Tag', { required: true }), txt('deep', 'Detail', { required: true }), defineField({ name: 'focus', title: 'Focus points', type: 'array', of: [{ type: 'string' }] })],
        }),
      ),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
