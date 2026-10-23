// One fixed document per website page that isn't a program: everything shown on that page, in
// page order, so editors find it where they'd expect (Studio sidebar > Website pages).
// The site merges these over Site settings when it builds (src/lib/sanity.ts), so field names
// match the ones Site settings used before; Site settings keeps them hidden until the old values
// are cleaned up.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { HomeIcon } from '@sanity/icons/Home';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { StarIcon } from '@sanity/icons/Star';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { SunIcon } from '@sanity/icons/Sun';
import { headingPair, hideSections, link, photo, placeholderNote, section, seo, str, txt } from './helpers';

// ---------- Home page, in the order sections appear on the page ----------
export const HOME_FIELDS = [
  hideSections('homeHide', 'home'),
  section('homeHero', 'Hero', undefined, [
    str('kicker', 'Small heading', { required: true, description: 'Above the big heading, e.g. "The Utah Athletic pathway".' }),
    str('heading', 'Heading, first line', { required: true }),
    str('headingAccent', 'Heading, second line (teal)', { required: true }),
    txt('intro', 'Intro', { required: true, rows: 3 }),
  ]),
  defineField({
    name: 'collage', title: 'Hero collage photos', type: 'array',
    description: 'Club photos for the home page collage. Drag to reorder. At least 11.',
    of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    options: { layout: 'grid' },
    validation: (r) => r.required().min(11),
  }),
  section('proTier', 'Professional tier (top of the pyramid)', undefined, [
    str('rowName', 'Program list: name', { required: true, description: 'In the list under the home page heading.' }),
    str('rowLine', 'Program list: details', { required: true }),
    str('rowLink', 'Program list: link text', { required: true, description: 'The arrow is added for you.' }),
    str('pyramidKicker', 'Pyramid label: small heading', { required: true }),
    str('pyramidName', 'Pyramid label: name', { required: true }),
    str('pyramidSub', 'Pyramid label: line under the name', { required: true, description: 'The arrow is added for you.' }),
    str('hint', 'Pyramid hover hint', { required: true, description: 'Shown under the pyramid when someone points at the top tier.' }),
  ], 'Both places open the Network page.'),
  section('homeAdult', 'Adult pathways', undefined, [
    str('kicker', 'Small heading', { required: true, description: 'Above the boxes under the pyramid, e.g. "Adult pathways".' }),
  ], 'The boxes come from the adult leagues (their name and home page line) and open each league\'s page.'),
  section('homeTryouts', 'Play for us', undefined, [
    str('kicker', 'Small heading', { required: true, description: 'The region name is added after it, e.g. "Near you · North region".' }),
    ...headingPair(),
  ], 'The cards come from tryout sessions and Recreation and Futures sessions. Academy and Club link to tryouts; Recreation and Futures link to registration.'),
  section('homeEvents', 'Tournaments', undefined, [
    str('kicker', 'Small heading', { required: true }),
    ...headingPair(),
  ], 'The cards come from Tournaments & Events. Write {Count} or {count} for the number of events as a word, e.g. "{Count} events." shows "Three events."'),
  section('homePathway', 'Where the pathway leads', undefined, [
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
  section('homeInside', 'Inside Utah Athletic', undefined, [
    str('heading', 'Heading', { required: true }),
    str('kicker', 'Small heading', { required: true, description: 'Right of the heading, e.g. "The docuseries".' }),
  ], 'The videos are below.'),
  defineField({
    name: 'videos', title: 'Inside Utah Athletic videos', type: 'array',
    of: [defineArrayMember({
      type: 'object', name: 'video',
      fields: [str('title', 'Title', { required: true }), str('len', 'Length', { required: true, description: 'e.g. "05:56".' }), photo('thumbnail', 'Thumbnail', { required: true }), link('url', 'YouTube link', { required: true })],
      preview: { select: { title: 'title', subtitle: 'len', media: 'thumbnail' } },
    })],
  }),
  section('homePlay', 'Closing call to action', undefined, [
    str('heading', 'Heading', { required: true }),
    txt('body', 'Text', { required: true, rows: 2 }),
    str('primaryButton', 'Main button label', { required: true, description: 'Opens the Academy page. The arrow is added for you.' }),
    str('secondaryButton', 'Second button label', { required: true, description: 'Scrolls up to the programs.' }),
  ]),
  seo('homeSeo'),
];

// ---------- Tryouts page ----------
export const TRYOUTS_FIELDS = [
  hideSections('tryoutsHide', 'tryouts'),
  section('tryoutsPage', 'Page intro', undefined, [
    ...headingPair(),
    txt('intro', 'Intro', { required: true, rows: 2 }),
  ], 'The top of /tryouts. The small heading above it is the Header Tryouts button label (Site settings).'),
  defineField({ name: 'tryoutBring', title: 'What to bring', type: 'array', of: [{ type: 'string' }] }),
  seo('tryoutsSeo'),
];

// ---------- Tournaments & Events page ----------
export const EVENTS_FIELDS = [
  hideSections('eventsHide', 'events'),
  section('eventsPage', 'Page intro and cards', undefined, [
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
    name: 'eventReel', title: 'Highlight reel', type: 'array',
    of: [defineArrayMember({
      type: 'object', name: 'reelItem',
      fields: [photo('photo', 'Photo', { required: true }), str('event', 'Event', { required: true }), str('caption', 'Caption', { required: true })],
      preview: { select: { title: 'event', subtitle: 'caption', media: 'photo' } },
    })],
  }),
  seo('eventsSeo'),
];

// ---------- Contact page ----------
export const CONTACT_FIELDS = [
  hideSections('contactHide', 'contact', { description: 'Tick to hide the contact form, e.g. while the inbox isn\'t watched. The top of the page (hero) always shows.' }),
  section('contactPage', 'Page intro and form', undefined, [
    str('kicker', 'Small heading', { required: true, description: 'e.g. "Contact us".' }),
    ...headingPair(),
    txt('intro', 'Intro', { required: true, rows: 2 }),
    defineField({ name: 'topics', title: 'Form topics', type: 'array', of: [{ type: 'string' }], description: 'The Topic choices on the contact form, in order.', validation: (r) => r.required().min(1) }),
  ], 'Messages from the form go to the main contact email (Site settings).'),
  seo('contactSeo'),
];

// ---------- Futures registration and thank-you pages, and the waiver ----------
export const FUTURES_FIELDS = [
  section('futuresPages', 'Registration and thank-you pages', undefined, [
    ...headingPair(),
    txt('intro', 'Intro', { required: true, rows: 2, description: 'Top of /futures/register/.' }),
    str('thanksHeading', 'Thank-you heading', { required: true, description: 'After paying, e.g. "You\'re".' }),
    str('thanksHeadingAccent', 'Thank-you heading, teal part', { description: 'e.g. "registered."' }),
    txt('thanksBody', 'Thank-you text', { required: true, rows: 3, description: 'The main email is added after it for questions.' }),
  ]),
  txt('futuresWaiver', 'Waiver', {
    rows: 14,
    description: 'Families must accept this to register for Futures. Each registration keeps a copy of the text they accepted, so editing it later doesn\'t change past registrations.',
  }),
];

const page = (name: string, title: string, icon: typeof HomeIcon, fields: ReturnType<typeof defineField>[]) =>
  defineType({ name, title, type: 'document', icon, fields, preview: { prepare: () => ({ title }) } });

export const pageHome = page('pageHome', 'Home page', HomeIcon, HOME_FIELDS);
export const pageTryouts = page('pageTryouts', 'Tryouts page', CalendarIcon, TRYOUTS_FIELDS);
export const pageEvents = page('pageEvents', 'Tournaments & Events page', StarIcon, EVENTS_FIELDS);
export const pageContact = page('pageContact', 'Contact page', EnvelopeIcon, CONTACT_FIELDS);
export const pageFutures = page('pageFutures', 'Futures registration page and waiver', SunIcon, FUTURES_FIELDS);

/** Page documents, by id (each one's id is its type). The site merges their fields over Site settings. */
export const PAGE_TYPES = ['pageHome', 'pageTryouts', 'pageEvents', 'pageContact', 'pageFutures'] as const;
