// Site-wide copy and lists that aren't tied to one program. One fixed document.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { headingPair, link, photo, placeholderNote, section, seo, str, txt } from './helpers';

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
    { name: 'contact', title: 'Contact page' },
    { name: 'futures', title: 'Futures registration' },
    { name: 'dev', title: 'Development model' },
  ],
  fields: [
    defineField({ name: 'mainEmail', title: 'Main contact email', type: 'email', group: 'general', validation: (r) => r.required() }),
    section('contactPage', 'Contact page', 'contact', [
      str('kicker', 'Small heading', { required: true, description: 'e.g. "Contact us".' }),
      ...headingPair(),
      txt('intro', 'Intro', { required: true, rows: 2 }),
      defineField({ name: 'topics', title: 'Form topics', type: 'array', of: [{ type: 'string' }], description: 'The Topic choices on the contact form, in order.', validation: (r) => r.required().min(1) }),
    ]),
    section('futuresPages', 'Registration pages', 'futures', [
      ...headingPair(),
      txt('intro', 'Intro', { required: true, rows: 2, description: 'Top of /futures/register/.' }),
      str('thanksHeading', 'Thank-you heading', { required: true, description: 'After paying, e.g. "You\'re".' }),
      str('thanksHeadingAccent', 'Thank-you heading, teal part', { description: 'e.g. "registered."' }),
      txt('thanksBody', 'Thank-you text', { required: true, rows: 3, description: 'The main email is added after it for questions.' }),
    ]),
    txt('futuresWaiver', 'Waiver', {
      group: 'futures', rows: 14,
      description: 'Families must accept this to register for Futures. Each registration keeps a copy of the text they accepted, so editing it later doesn\'t change past registrations.',
    }),
    photo('shareImage', 'Default share image', { group: 'general', description: 'Shown when a page without its own share image is shared (texts, Facebook, iMessage). Landscape; cropped to 1200 x 630 around the hotspot. Until it\'s set, a club photo from the home collage is used.' }),
    seo('homeSeo', 'home', 'Search and sharing: home page'),
    seo('tryoutsSeo', 'tryouts', 'Search and sharing: Tryouts page'),
    seo('eventsSeo', 'events', 'Search and sharing: Events page'),
    seo('contactSeo', 'contact', 'Search and sharing: Contact page'),
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
    section('homeAdult', 'Adult pathways', 'home', [
      str('kicker', 'Small heading', { required: true, description: 'Above the boxes under the pyramid, e.g. "Adult pathways".' }),
    ], 'The boxes come from Adult leagues (name and home page line) and open each league\'s page.'),
    section('homeTryouts', 'Play for us', 'home', [
      str('kicker', 'Small heading', { required: true, description: 'The region name is added after it, e.g. "Near you · North region".' }),
      ...headingPair(),
    ], 'The cards come from Tryout sessions and Rec and Futures sessions. Academy and Club link to tryouts; Recreation and Futures link to registration.'),
    section('homeEvents', 'Tournaments', 'home', [
      str('kicker', 'Small heading', { required: true }),
      ...headingPair(),
    ], 'The cards come from Tournaments and events. Write {Count} or {count} for the number of events as a word, e.g. "{Count} events." shows "Three events."'),
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

    section('tryoutsPage', 'Page intro', 'tryouts', [
      ...headingPair(),
      txt('intro', 'Intro', { required: true, rows: 2 }),
    ], 'The top of /tryouts. The small heading above it is the Header Tryouts button label (General tab).'),
    defineField({ name: 'tryoutBring', title: 'What to bring', type: 'array', group: 'tryouts', of: [{ type: 'string' }] }),
    section('eventsPage', 'Page intro and cards', 'events', [
      str('kicker', 'Small heading', { required: true, description: 'e.g. "Tournaments & Events".' }),
      ...headingPair(),
      txt('intro', 'Intro', { required: true, rows: 2 }),
      defineField({
        name: 'cards', title: 'Cards under the events', type: 'array', validation: (r) => r.max(3),
        of: [defineArrayMember({
          type: 'object', name: 'eventsCard',
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'string', initialValue: 'flag', options: { list: [{ title: 'Flag', value: 'flag' }, { title: 'Handshake', value: 'handshake' }, { title: 'None', value: 'none' }], layout: 'radio', direction: 'horizontal' } }),
            str('kicker', 'Small heading', { required: true, description: 'e.g. "Bring your club".' }),
            str('heading', 'Heading', { required: true }),
            txt('body', 'Text', { required: true, rows: 2 }),
            str('button', 'Button label', { required: true, description: 'The arrow is added for you.' }),
            str('href', 'Button link', { required: true, description: 'A page on this site, e.g. "/contact/", or a full web address.' }),
          ],
          preview: { select: { title: 'heading', subtitle: 'kicker' } },
        })],
      }),
      str('reelKicker', 'Highlight reel small heading', { required: true, description: 'e.g. "Highlights".' }),
      str('reelHeading', 'Highlight reel heading', { required: true, description: 'e.g. "From the touchline".' }),
    ], 'Write {count} or {Count} anywhere here for the number of events as a word, e.g. "across all {count} tournaments" shows "across all three tournaments".'),

    defineField({
      name: 'eventReel', title: 'Highlight reel', type: 'array', group: 'events',
      of: [defineArrayMember({
        type: 'object', name: 'reelItem',
        fields: [photo('photo', 'Photo', { required: true }), str('event', 'Event', { required: true }), str('caption', 'Caption', { required: true })],
        preview: { select: { title: 'event', subtitle: 'caption', media: 'photo' } },
      })],
    }),

    defineField({
      name: 'development', title: 'Development model (shared by all programs)', type: 'object', group: 'dev',
      description: 'The default text for the "We develop the complete player" section and each pillar\'s pop-up. A program can replace any of it on its own Development model.',
      fields: [
        str('heading', 'Heading', { description: 'e.g. "We develop the".' }),
        str('headingAccent', 'Heading, teal part', { description: 'e.g. "complete player."' }),
        txt('intro', 'Intro', { rows: 2 }),
        ...PILLARS.map(([k, t]) =>
        defineField({
          name: k, title: t, type: 'object',
          fields: [str('tag', 'Label', { required: true, description: 'Small label next to the name, e.g. "The foundation".' }), txt('deep', 'Detail', { required: true, description: 'The paragraph in the pop-up.' }), defineField({ name: 'focus', title: 'Focus areas', type: 'array', of: [{ type: 'string' }], description: 'The list in the pop-up.' })],
        }),
      ),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
