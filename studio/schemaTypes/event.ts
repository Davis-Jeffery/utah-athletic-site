// A tournament (later also camps and clinics). Each one is listed on /events and either links to
// its own website (Event page: Link) or has its page hosted here at /events/<slug>/ (Event page:
// Hosted), built from one template: the Page tab's sections, the Rules tab (its own page at
// /events/<slug>/rules/) and the sessions. Status (Coming, Registration open, Sold out, Live,
// Complete) is worked out from each session's dates on the visitor's day (src/lib/schedule.ts).
import { defineArrayMember, defineField, defineType } from 'sanity';
import { StarIcon } from '@sanity/icons/Star';
import { headingPair, link, pageLayout, photo, seo, str, txt } from './helpers';
import { people } from './program';

const hex = (name: string, title: string, o: { optional?: boolean; description?: string } = {}) =>
  defineField({
    name, title, type: 'string', description: o.description ?? 'Hex color, e.g. #3b0d12',
    validation: (r) => (o.optional ? r : r.required()).regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { name: 'hex color' }),
  });

const hosted = ({ document }: { document?: Record<string, unknown> }) => document?.page !== 'hosted';
const isHosted = (ctx: { document?: Record<string, unknown> }) => ctx.document?.page === 'hosted';

/** YouTube or Vimeo, the two the page can play in place (see embedUrl in src/lib/content.ts). */
const VIDEO_LINK = /^https:\/\/(www\.)?(youtube\.com\/(watch\?|shorts\/|embed\/)|youtu\.be\/|vimeo\.com\/\d)/;
const videoLink = (name: string, title: string, description: string) =>
  defineField({
    name, title, type: 'url', description,
    validation: (r) => r.uri({ scheme: ['https'] }).custom((v) => (!v || VIDEO_LINK.test(v) ? true : 'Use a YouTube or Vimeo link.')),
  });

// One running of the event: its dates, place, pricing and links. A new year is a new session.
const session = defineArrayMember({
  type: 'object', name: 'eventSession', title: 'Session',
  fieldsets: [
    { name: 'dates', title: 'Event dates', options: { columns: 2 } },
    { name: 'reg', title: 'Registration window', options: { columns: 2 } },
    { name: 'links', title: 'Links for families and teams' },
  ],
  fields: [
    str('label', 'Name', { description: 'Optional, e.g. "2026" or "5v5 Series". Leave empty to use the year.' }),
    photo('logo', 'Logo', { description: 'Optional. Shown on this session\'s card on the event page, e.g. a series or anniversary logo. Empty uses the event\'s logo. A transparent PNG or SVG works best.' }),
    defineField({ name: 'start', title: 'Starts', type: 'date', fieldset: 'dates', validation: (r) => r.required() }),
    defineField({ name: 'end', title: 'Ends', type: 'date', fieldset: 'dates', validation: (r) => r.required().min(r.valueOfField('start')) }),
    defineField({ name: 'regOpen', title: 'Opens', type: 'date', fieldset: 'reg', validation: (r) => r.required() }),
    defineField({ name: 'regClose', title: 'Closes', type: 'date', fieldset: 'reg', validation: (r) => r.required().min(r.valueOfField('regOpen')) }),
    defineField({
      name: 'full', title: 'Sold out', type: 'boolean', initialValue: false,
      description: 'Tick when every spot is taken. While registration is open, the page and the event card say Sold out and the Register button is replaced.',
    }),
    str('location', 'Location', { required: true, description: 'e.g. "Draper and Provo, Utah".' }),
    defineField({
      name: 'place', title: 'Map location', type: 'place',
      description: 'Optional. Search for where it\'s played, so the location becomes a directions link to that spot.',
    }),
    str('format', 'Format', { description: 'e.g. "5v5". Falls back to the event\'s format.' }),
    str('ages', 'Ages', { description: 'e.g. "U9 to U15 · Boys and Girls". Falls back to the event\'s ages.' }),
    defineField({
      name: 'fees', title: 'Pricing', type: 'array',
      of: [defineArrayMember({
        type: 'object', name: 'fee',
        fields: [
          str('label', 'What it\'s for', { required: true, description: 'e.g. "Per team" or "U9 to U12".' }),
          defineField({ name: 'price', title: 'Price ($)', type: 'number', validation: (r) => r.required().min(0) }),
          str('note', 'Note', { description: 'Optional, e.g. "Includes group play and the knockout rounds".' }),
        ],
        preview: { select: { title: 'label', price: 'price', note: 'note' }, prepare: ({ title, price, note }) => ({ title, subtitle: [price != null && `$${price}`, note].filter(Boolean).join(' · ') }) },
      })],
    }),
    txt('note', 'Good to know', { rows: 2, description: 'Optional, shown with the dates, e.g. "10 teams max per age group. Gold and Silver brackets."' }),
    link('registerUrl', 'Registration link', { fieldset: 'links', description: 'Where teams register (e.g. LeagueApps). Shown while registration is open.' }),
    link('scheduleUrl', 'Schedule link', { fieldset: 'links', description: 'Shown once registration closes and while the event is live.' }),
    link('resultsUrl', 'Results link', { fieldset: 'links', description: 'Shown once the event is complete.' }),
  ],
  preview: {
    select: { label: 'label', start: 'start', end: 'end', location: 'location', full: 'full', media: 'logo' },
    prepare: ({ label, start, end, location, full, media }) => ({ media,
      title: label || (start ? start.slice(0, 4) : 'New session'),
      subtitle: [start && end ? `${start} to ${end}` : '', location, full ? 'Sold out' : ''].filter(Boolean).join(' · '),
    }),
  },
});

/** A list of { name, detail?, link? } rows, e.g. hotels. */
const rows = (name: string, title: string, itemTitle: string) =>
  defineField({
    name, title, type: 'array',
    of: [defineArrayMember({
      type: 'object', name: 'row',
      fields: [str('name', itemTitle, { required: true }), txt('detail', 'Detail', { rows: 2 }), link('url', 'Link')],
      preview: { select: { title: 'name', subtitle: 'detail' } },
    })],
  });

export const event = defineType({
  name: 'event',
  title: 'Tournament or event',
  type: 'document',
  icon: StarIcon,
  description: 'Status (Coming, Registration open, Sold out, Live, Complete) is worked out from each session\'s dates.',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'sessions', title: 'Sessions' },
    { name: 'page', title: 'Page', hidden: hosted },
    { name: 'rules', title: 'Rules', hidden: hosted },
    { name: 'people', title: 'Directors' },
    { name: 'look', title: 'Card look' },
  ],
  fields: [
    str('name', 'Name', { required: true, group: 'details' }),
    str('tagline', 'Tagline', { required: true, group: 'details' }),
    defineField({
      name: 'page', title: 'Event page', type: 'string', group: 'details', initialValue: 'link',
      options: { list: [{ title: 'Link to its own website', value: 'link' }, { title: 'Host its page on this site', value: 'hosted' }], layout: 'radio' },
      description: 'Hosted pages are built from the Page and Rules tabs, at utathletic.com/events/<web address>/.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url', title: 'Event website', type: 'url', group: 'details', hidden: ({ document }) => document?.page === 'hosted',
      description: 'The event\'s own site. The event card links here.',
      validation: (r) => r.uri({ scheme: ['http', 'https'] }).custom((v, ctx) => (v || isHosted(ctx) ? true : 'Add the event\'s website, or host its page here.')),
    }),
    defineField({
      name: 'slug', title: 'Web address', type: 'slug', group: 'details', hidden: hosted,
      options: { source: 'name', maxLength: 60 },
      description: 'The end of the page\'s address, e.g. "copa-athletic" for utathletic.com/events/copa-athletic/. Changing it breaks old links.',
      validation: (r) => r.custom((v: { current?: string } | undefined, ctx) => (!isHosted(ctx) || v?.current ? true : 'Generate a web address for the hosted page.')),
    }),
    str('format', 'Format', { group: 'details', description: 'e.g. "5v5" or "7v7 · 9v9 · 11v11". Sessions can set their own.' }),
    str('ages', 'Ages', { group: 'details', description: 'e.g. "U9 to U15 · Boys and Girls". Sessions can set their own.' }),

    defineField({
      name: 'sessions', title: 'Sessions', type: 'array', group: 'sessions', of: [session],
      description: 'Each running of the event, e.g. one per year. Add next year\'s session as soon as its dates are set: the page then shows them and when registration opens.',
      validation: (r) => r.required().min(1),
    }),

    // ---------- hosted page ----------
    pageLayout('sectionOrder', 'eventPage', 'hide', { group: 'page' }),
    defineField({ name: 'hide', title: 'Hidden sections', type: 'array', of: [{ type: 'string' }], hidden: true }),
    defineField({
      name: 'hero', title: 'Top of the page', type: 'object', group: 'page', options: { collapsible: true },
      fields: [
        photo('logo', 'Page logo', { description: 'Shown large at the top, the first thing visitors see. Use a PNG or SVG with a transparent background, trimmed close to the logo. Empty uses the card logo.' }),
        ...headingPair(),
        txt('intro', 'Intro', { rows: 2 }),
        photo('photo', 'Background photo', { description: 'Behind the heading. Also the video\'s first frame while it loads.' }),
        defineField({
          name: 'video', title: 'Background video', type: 'file', options: { accept: 'video/mp4,video/webm' },
          description: 'Optional. A short, silent loop (MP4, under about 15 MB) that plays behind the heading. Phones that save data show the photo instead.',
        }),
      ],
    }),
    defineField({
      name: 'stats', title: 'Quick facts', type: 'array', group: 'page',
      description: 'A row of small cards at the bottom of the top section: the event at a glance, e.g. "U9 to U15" over "Boys and girls divisions". Up to 6. Turn it off in Page layout.',
      validation: (r) => r.max(6),
      of: [defineArrayMember({
        type: 'object', name: 'stat',
        fields: [str('value', 'Big text', { required: true, description: 'Short, e.g. "4 games" or "$1,000".' }), str('label', 'Small text', { description: 'e.g. "Guaranteed, plus a title game".' })],
        preview: { select: { title: 'value', subtitle: 'label' } },
      })],
    }),
    str('sessionsHeading', 'Dates and pricing heading', { group: 'page', description: 'The heading over the session cards. Empty shows "Upcoming events".' }),
    defineField({
      name: 'about', title: 'About the event', type: 'object', group: 'page', options: { collapsible: true },
      fields: [
        str('heading', 'Heading', { description: 'e.g. "New formats. Higher stakes."' }),
        txt('body', 'Text', { rows: 4 }),
        photo('photo', 'Photo', { description: 'Optional. Shown to the right of the text. Also the video\'s first frame while it loads.' }),
        defineField({
          name: 'video', title: 'Video', type: 'file', options: { accept: 'video/mp4,video/webm' },
          description: 'Optional, instead of the photo: a short, silent loop (MP4, under about 15 MB). For a video with sound, use the Video section.',
        }),
      ],
    }),
    defineField({
      name: 'video', title: 'Video', type: 'object', group: 'page', options: { collapsible: true },
      fields: [
        str('heading', 'Heading', { description: 'e.g. "Watch last year\'s final".' }),
        videoLink('url', 'Video link', 'A YouTube or Vimeo link. It plays on the page.'),
        str('caption', 'Caption'),
      ],
    }),
    defineField({
      name: 'highlights', title: 'Highlights', type: 'object', group: 'page', options: { collapsible: true },
      fields: [
        str('heading', 'Heading', { description: 'e.g. "Last year\'s best moments".' }),
        defineField({
          name: 'photos', title: 'Photos', type: 'array',
          of: [defineArrayMember({
            type: 'image', options: { hotspot: true },
            fields: [str('caption', 'Caption'), defineField({ name: 'alt', title: 'Describe the photo', type: 'string' })],
          })],
          options: { layout: 'grid' },
        }),
      ],
    }),
    defineField({
      name: 'sponsors', title: 'Sponsors', type: 'object', group: 'page', options: { collapsible: true },
      fields: [
        str('heading', 'Heading', { description: 'Defaults to "Our sponsors".' }),
        txt('intro', 'Intro', { rows: 2 }),
        defineField({
          name: 'list', title: 'Sponsors', type: 'array',
          of: [defineArrayMember({
            type: 'object', name: 'sponsor',
            fields: [str('name', 'Name', { required: true }), photo('logo', 'Logo', { description: 'A logo on a transparent or dark background works best.' }), link('url', 'Website')],
            preview: { select: { title: 'name', media: 'logo' } },
          })],
        }),
        str('pitch', 'Become a sponsor line', { description: 'Optional, e.g. "Want your business in front of 2,000 families?". Shows with a button to the contact form.' }),
      ],
    }),
    defineField({
      name: 'travel', title: 'Where to stay', type: 'object', group: 'page', options: { collapsible: true },
      fields: [str('heading', 'Heading', { description: 'Defaults to "Where to stay".' }), txt('intro', 'Intro', { rows: 2 }), rows('list', 'Hotels and places', 'Name')],
    }),
    defineField({
      name: 'faqs', title: 'Questions', type: 'array', group: 'page',
      of: [defineArrayMember({ type: 'object', name: 'faq', fields: [str('q', 'Question', { required: true }), txt('a', 'Answer', { required: true, rows: 3 })], preview: { select: { title: 'q', subtitle: 'a' } } })],
    }),
    defineField({
      name: 'after', title: 'After the event', type: 'object', group: 'page', options: { collapsible: true },
      description: 'Shown at the top of the page once the latest session is complete, until next year\'s registration opens. Next year\'s dates and opening day are added for you once its session is in.',
      fields: [
        str('heading', 'Heading', { description: 'e.g. "Thank you. See you next year."' }),
        txt('body', 'Text', { rows: 3 }),
      ],
    }),
    seo('seo', 'page'),

    // ---------- rules page ----------
    txt('rulesIntro', 'Intro', { group: 'rules', rows: 2, description: 'Top of the rules page, e.g. who the rules apply to.' }),
    defineField({
      name: 'rules', title: 'Rules', type: 'array', group: 'rules',
      description: 'One block per topic, e.g. "Format", "Fouls", "Goalkeepers". Each line is one rule.',
      of: [defineArrayMember({
        type: 'object', name: 'ruleBlock',
        fields: [str('heading', 'Heading', { required: true }), defineField({ name: 'items', title: 'Rules', type: 'array', of: [{ type: 'text', rows: 2 }] })],
        preview: { select: { title: 'heading', items: 'items' }, prepare: ({ title, items }) => ({ title, subtitle: `${items?.length ?? 0} rules` }) },
      })],
    }),
    defineField({ name: 'rulesFile', title: 'Rules as a PDF', type: 'file', group: 'rules', options: { accept: 'application/pdf' }, description: 'Optional. Offered as a download on the rules page.' }),

    people('directors', 'Tournament directors and admins', {
      group: 'people', titleHint: 'e.g. "Tournament Director".',
      description: 'Not shown on the site. When someone picks this event on the contact form, these people get the message by email. Leave empty to send it to the main contact email. Pick people from Staff.',
    }),

    photo('logo', 'Logo', { group: 'look', description: 'Fills the top of the event card, edge to edge. Use a wide image (about 16 by 10); set the hotspot to keep the logo centered.' }),
    defineField({
      name: 'brand', title: 'Colors', type: 'object', group: 'look', options: { columns: 2 },
      description: 'Used on the event card and, for hosted events, throughout its page.',
      fields: [hex('bg', 'Background'), hex('bg2', 'Background 2'), hex('ink', 'Text'), hex('accent', 'Accent'), hex('accent2', 'Second accent', { optional: true, description: 'Optional, e.g. a second color from the logo. Colors the big text in the quick facts bar; empty uses Accent.' })],
    }),
  ],
  orderings: [{ title: 'Name', name: 'name', by: [{ field: 'name', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', page: 'page', start: 'sessions.0.start', media: 'logo' },
    prepare: ({ title, page, start, media }) => ({ title, subtitle: [page === 'hosted' ? 'Hosted page' : 'Links out', start].filter(Boolean).join(' · '), media }),
  },
});
