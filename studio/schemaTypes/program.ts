// One document per program (Academy, Club, Rec, Futures). These are fixed: the page addresses,
// home pyramid and compare table are built around the four program ids, so editors edit them
// but can't add or delete programs.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { AGE_OPTIONS, MONTH_OPTIONS, hideSections, link, photo, seo, str, txt } from './helpers';
import { TOWN_OPTIONS } from './towns';

export const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']] as const;
const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

export const daySessions = (name: string, title: string) =>
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

// A list of staff picked from Staff (program leadership, a region's leaders, a region's coaches).
// People are entered once under Staff; here editors pick them, in display order, and can give
// them a different title for this spot.
export const people = (name: string, title: string, o: { description?: string; group?: string; hidden?: any; titleHint: string }) =>
  defineField({
    name, title, type: 'array', group: o.group, description: o.description, hidden: o.hidden,
    of: [defineArrayMember({
      type: 'object', name: 'assignment',
      fields: [
        defineField({ name: 'person', title: 'Person', type: 'reference', to: [{ type: 'staff' }], validation: (r) => r.required() }),
        str('title', 'Title here (optional)', { description: `Leave empty to use their title from Staff. ${o.titleHint}` }),
      ],
      preview: {
        select: { name: 'person.name', main: 'person.title', title: 'title', media: 'person.headshot' },
        prepare: ({ name, main, title, media }) => ({ title: name || 'Pick a person', subtitle: title || main, media }),
      },
    })],
    validation: (r) => r.unique(),
  });

// A fee breakdown list: what the fee covers, or what it doesn't.
const feeItems = (name: string, title: string, description: string, o: { group?: string; hidden?: any } = {}) =>
  defineField({
    name, title, type: 'array', group: o.group, hidden: o.hidden, description,
    of: [defineArrayMember({
      type: 'object', name: 'feeItem',
      fields: [str('item', 'Item', { required: true, description: 'e.g. "Technical training sessions".' }), str('detail', 'Detail', { description: 'e.g. "3× per week (U14 and under), year-round".' })],
      preview: { select: { title: 'item', subtitle: 'detail' } },
    })],
  });

// Season timeline on an August to July axis (programs and adult leagues).
export const phasesField = (group: string) =>
  defineField({
    name: 'phases', title: 'Season timeline', type: 'array', group,
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
  });

// The Developer tab (program id, order, number label, kind, invitation only) ties the program to
// the site's code: read-only, and shown to administrators only.
const notAdmin = ({ currentUser }: any) => !currentUser?.roles?.some((r: { name: string }) => r.name === 'administrator');

// Programs whose price is never shown on the site (see NO_PRICE_LIST in src/data/site.ts): their
// Cost tab shows only the What's included breakdown.
const NO_PRICE = ['academy'];
const noPrice = ({ document }: any) => NO_PRICE.includes(document?.key);

// Programs priced and scheduled by their sessions (Recreation sessions, Futures sessions).
const SESSION_PROGRAMS = ['rec', 'futures'];

// Programs priced by age tabs (Club): age groups set once, each with a price per region and what's
// included. They replace the region's Fees by age group, the program cost and What's included.
const AGE_TAB_PROGRAMS = ['club'];
const ageTabs = ({ document }: any) => AGE_TAB_PROGRAMS.includes(document?.key);
const REGION_NAMES = [['north', 'North'], ['south', 'South'], ['west', 'West']] as const;
const usLabel = (min?: number, max?: number) => (min == null ? 'New age group' : min === max || max == null ? `U${min}` : `U${min} to U${max}`);

const ageTabsField = defineField({
  name: 'ageTabs', title: 'Fees by age group', type: 'array', group: 'cost', hidden: (c: any) => !ageTabs(c),
  description: 'One tab per age group in the Fees section of each region\'s page. Set the ages, the price in each region, and what is and isn\'t included. Drag to reorder.',
  of: [defineArrayMember({
    type: 'object', name: 'ageTab',
    fields: [
      defineField({ name: 'minAge', title: 'From', type: 'number', options: { list: AGE_OPTIONS }, validation: (r) => r.required() }),
      defineField({ name: 'maxAge', title: 'Through', type: 'number', options: { list: AGE_OPTIONS }, validation: (r) => r.required().min(r.valueOfField('minAge')) }),
      defineField({
        name: 'prices', title: 'Price in each region ($)', type: 'object', options: { columns: 3 },
        description: 'Leave a region empty if this age group isn\'t offered there: its tab won\'t show on that region\'s page. Only regions where the program is running are shown.',
        fields: REGION_NAMES.map(([k, t]) => defineField({
          name: k, title: t, type: 'number', validation: (r) => r.min(0),
          hidden: ({ document }: any) => document?.[k]?.status !== 'active',
        })),
      }),
      str('note', 'Note (optional)', { description: 'Under the price, e.g. "Includes tournament entry".' }),
      feeItems('included', 'Included', 'What this fee covers.'),
      feeItems('notIncluded', 'Not included', 'e.g. kit package, tournament travel. Shown under Included.'),
    ],
    preview: {
      select: { min: 'minAge', max: 'maxAge', n: 'prices.north', s: 'prices.south', w: 'prices.west' },
      prepare: ({ min, max, n, s, w }: any) => ({
        title: usLabel(min, max),
        subtitle: [['North', n], ['South', s], ['West', w]].filter(([, v]) => v != null).map(([t, v]) => `${t} $${v}`).join(' · ') || 'No prices yet',
      }),
    },
  })],
});

const regionStatus = (name: string, title: string) =>
  defineField({
    name, title, type: 'object', group: 'regions', options: { collapsible: true, collapsed: false },
    fields: [
      defineField({
        name: 'status', title: 'Status', type: 'string', validation: (r) => r.required(),
        options: { list: [{ title: 'Running', value: 'active' }, { title: 'Coming soon', value: 'soon' }, { title: 'Not offered', value: 'none' }], layout: 'radio', direction: 'horizontal' },
      }),
      str('hub', 'Hub', { description: 'Where it runs, e.g. "Draper / Sandy".', hidden: ({ parent }: any) => parent?.status === 'none' }),
      str('season', 'Launching', { description: 'e.g. "Fall 2027".', hidden: ({ parent }: any) => parent?.status !== 'soon' }),
      str('ages', 'Ages in this region', { description: 'Optional, e.g. "U3 to U15". Shown at the top of the page on this region\'s tab; leave empty to use the program\'s ages.', hidden: ({ parent }: any) => parent?.status !== 'active' }),
      defineField({
        name: 'fees', title: 'Fees by age group', type: 'array', hidden: ({ parent, document }: any) => parent?.status !== 'active' || NO_PRICE.includes(document?.key) || AGE_TAB_PROGRAMS.includes(document?.key),
        description: 'This region\'s prices, shown on its tab. Add a row per age group (or one row for everyone). The overview shows "From" the lowest price across regions.',
        of: [defineArrayMember({
          type: 'object', name: 'fee',
          fields: [
            str('ages', 'Age group', { required: true, description: 'e.g. "U9 to U12" or "All ages".' }),
            defineField({ name: 'cost', title: 'Price ($)', type: 'number', validation: (r) => r.required().min(0) }),
            str('note', 'Note', { description: 'Optional, e.g. "Tooele and Stansbury Park" or "Includes uniform".' }),
          ],
          preview: { select: { title: 'ages', cost: 'cost', note: 'note' }, prepare: ({ title, cost, note }: any) => ({ title, subtitle: [cost != null ? `$${cost}` : '', note].filter(Boolean).join(' · ') }) },
        })],
      }),
      people('leaders', 'Leaders', {
        description: 'This program\'s leaders in this region, e.g. a managing director and a director of coaching. Pick people from Staff; add as many as you need and drag to reorder.',
        hidden: ({ parent }: any) => parent?.status === 'none',
        titleHint: 'e.g. "Managing Director".',
      }),
      people('coaches', 'Coaches', {
        description: 'This program\'s coaches in this region. Pick people from Staff; add as many as you need and drag to reorder.',
        // Rec is coached by volunteers, so it has no coaches list (see NO_COACH_LIST in src/data/site.ts).
        hidden: ({ parent, document }: any) => parent?.status !== 'active' || document?.key === 'rec',
        titleHint: 'e.g. their team here, "U9 to U11 Boys".',
      }),
    ],
  });

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: DocumentsIcon,
  groups: [
    { name: 'overview', title: 'Overview', default: true },
    { name: 'sections', title: 'Hide sections' },
    { name: 'photos', title: 'Photos' },
    { name: 'join', title: 'Registration' },
    { name: 'cost', title: 'Cost and what\'s included' },
    { name: 'season', title: 'Season and week' },
    { name: 'dev', title: 'Development and compare' },
    { name: 'staff', title: 'Staff' },
    { name: 'regions', title: 'Regions' },
    { name: 'map', title: 'Map pins' },
    { name: 'formats', title: 'How we play', hidden: ({ document }: any) => document?.key !== 'rec' },
    { name: 'dev-only', title: 'Developer', hidden: notAdmin },
  ],
  fields: [
    hideSections('hide', 'program', { group: 'sections', title: 'Hide sections on the program page', description: 'Tick a section to hide it on this program\'s overview page. Untick it to show it again. The hero always shows. The development model is switched on or off per program in Site-wide components, Development model.' }),
    hideSections('hideRegion', 'region', { group: 'sections', title: 'Hide sections on region tabs', description: 'Applies to this program\'s North, South and West tabs. The region heading always shows.' }),

    // Overview
    str('name', 'Name', { required: true, group: 'overview' }),
    str('tier', 'Tier label', { required: true, group: 'overview', description: 'e.g. "Tier 02 · Competitive".' }),
    str('ages', 'Ages', { required: true, group: 'overview', description: 'Write ranges as "U9 to U19". Also sets the Age group choices on this program\'s forms (U9, U10 … U19).' }),
    str('kicker', 'Kicker', { required: true, group: 'overview', description: 'The small word above the name, e.g. "Competitive".' }),
    str('line', 'Leagues line', { required: true, group: 'overview', description: 'e.g. "USYS · State Cup".' }),
    txt('tagline', 'Tagline', { required: true, group: 'overview', rows: 2 }),
    str('forHead', 'Who it\'s for (heading)', { required: true, group: 'overview' }),
    txt('intro', 'Intro', { required: true, group: 'overview' }),
    seo('seo', 'overview'),
    defineField({
      name: 'leagues', title: 'Leagues and competitions', type: 'array', group: 'overview',
      of: [defineArrayMember({
        type: 'object', name: 'league',
        fields: [
          str('name', 'Name', { required: true }), str('level', 'Level', { required: true }), txt('d', 'Description', { required: true, rows: 2 }),
          link('url', 'League website', { description: 'Optional. The box links here.' }),
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
      ],
    }),

    // Registration
    {
      ...link('registerUrl', 'Default Ollie link', { required: true, group: 'join', description: 'Used by any tryout or session that doesn\'t have its own Ollie link. Each tryout session (and Recreation session) can set its own.' }),
      // Futures registers on the site and pays with Stripe.
      hidden: ({ document }: any) => document?.key === 'futures',
    },
    defineField({
      name: 'enrollment', title: 'Enrollment', type: 'string', group: 'join',
      options: { list: [{ title: 'Accepting trial applications', value: 'trial' }, { title: 'Open tryout registration', value: 'tryouts' }], layout: 'radio' },
    }),
    str('nextTryout', 'Next tryout (text)', { group: 'join', description: 'e.g. "To be announced".' }),
    str('registrationOpens', 'Registration opens (text)', { group: 'join', description: 'e.g. "May 2027".' }),
    txt('joinCopy', 'Join section copy', { required: true, group: 'join', rows: 2 }),
    str('cta', 'Button label', { required: true, group: 'join', description: 'e.g. "Book a tryout".' }),
    str('sessionLabel', 'Session picker label', { required: true, group: 'join' }),

    // Cost
    defineField({
      name: 'cost', title: 'Cost ($)', type: 'number', group: 'cost',
      validation: (r) => r.min(0).custom((v, ctx: any) => v != null || ageTabs({ document: ctx.document }) || 'Required'),
      // Recreation and Futures prices come from their sessions, Club's from its age tabs; Academy's is never shown.
      hidden: ({ document }: any) => SESSION_PROGRAMS.includes(document?.key) || NO_PRICE.includes(document?.key) || ageTabs({ document }),
    }),
    defineField({ name: 'unit', title: 'Billed', type: 'string', group: 'cost', hidden: noPrice, options: { list: ['per year', 'per season'], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    txt('costNote', 'Cost note', { required: true, group: 'cost', rows: 2, hidden: noPrice }),
    ageTabsField,
    defineField({ name: 'includes', title: 'What\'s included', type: 'array', group: 'cost', hidden: (c: any) => noPrice(c) || ageTabs(c), of: [{ type: 'string' }] }),
    txt('includedIntro', 'Fee breakdown intro', { group: 'cost', rows: 2, hidden: ageTabs, description: 'Optional. Shown above the breakdown below.' }),
    feeItems('included', 'Included in the fee', 'When this has items, the program page shows this breakdown in place of the Compare programs table.', { group: 'cost', hidden: ageTabs }),
    feeItems('notIncluded', 'Not included in the fee', 'e.g. kit package, tournament travel.', { group: 'cost', hidden: ageTabs }),
    str('commit', 'Commitment', { required: true, group: 'cost', description: 'e.g. "3× / week".', hidden: noPrice }),
    txt('commitNote', 'Commitment note', { required: true, group: 'cost', rows: 2, hidden: noPrice }),

    // Season and week
    phasesField('season'),
    defineField({ name: 'week', title: 'Typical week', type: 'object', group: 'season', fields: DAYS.map(([k, t]) => daySessions(k, t)) }),

    // Development and compare
    // The "We develop the complete player" section and each pillar's pop-up, all in one place.
    // Optional fields left empty use the shared text (Site-wide components > Development model).
    defineField({
      name: 'devPillars', title: 'Development model', type: 'object', group: 'dev',
      description: 'The "We develop the complete player" section and the pop-up for each pillar. Optional fields left empty use the shared text in Site-wide components, Development model, so set them only where this program differs.',
      fields: [
        str('heading', 'Heading (optional)', { description: 'e.g. "We develop the". Empty uses the shared heading.' }),
        str('headingAccent', 'Heading, teal part (optional)', { description: 'e.g. "complete player."' }),
        txt('intro', 'Intro (optional)', { rows: 2, description: 'Empty uses the shared intro.' }),
        ...PILLARS.map(([k, t]) => defineField({
          name: k, title: t, type: 'object', options: { collapsible: true, collapsed: false },
          fields: [
            txt('summary', 'Summary', { required: true, rows: 2, description: 'Shown in the list and at the top of the pop-up.' }),
            photo('photo', 'Photo', { required: true, description: 'Shown in the pop-up.' }),
            str('tag', 'Label (optional)', { description: 'Small label next to the name, e.g. "The foundation". Empty uses the shared label.' }),
            txt('deep', 'Detail (optional)', { rows: 4, description: 'The paragraph in the pop-up. Empty uses the shared detail.' }),
            defineField({ name: 'focus', title: 'Focus areas (optional)', type: 'array', of: [{ type: 'string' }], description: 'The list in the pop-up. Empty uses the shared focus areas.' }),
          ],
        })),
      ],
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
    str('leadershipHeading', 'Leadership heading', { group: 'staff', description: 'Optional. Defaults to "Program leadership", e.g. "Academy Leadership".' }),
    txt('leadershipIntro', 'Leadership intro', { group: 'staff', rows: 2, description: 'Optional. Under the heading; leave empty for the standard line about regional leaders.' }),
    people('leadership', 'Program leadership', {
      group: 'staff',
      description: 'The "Program leadership" section on the program page: people who lead the whole program. Pick people from Staff; add as many as you need and drag to reorder. Regional leaders and coaches are on the Regions tab.',
      titleHint: 'e.g. "Academy Director".',
    }),

    // Regions
    regionStatus('north', 'North'),
    regionStatus('south', 'South'),
    regionStatus('west', 'West'),

    // Map pins on the program page's locations map.
    defineField({
      name: 'mapHubs', title: 'Map pins', type: 'array', group: 'map',
      description: 'Where this program trains, as pins on the "Choose your region" map. Each town on the map is matched to its nearest pin. Pins with the same label share a color.',
      of: [defineArrayMember({
        type: 'object', name: 'mapHub',
        fields: [
          str('label', 'Label', { required: true, description: 'Small heading on the pin, e.g. "West Club".' }),
          defineField({ name: 'town', title: 'Town', type: 'string', description: 'Places the pin. Missing a town? Ask for it to be added to the map.', options: { list: TOWN_OPTIONS }, validation: (r) => r.required() }),
          str('shownAs', 'Shown as', { description: 'Optional. The place name on the pin if it isn\'t just the town, e.g. "Saratoga Springs / Lehi".' }),
          defineField({ name: 'side', title: 'Label side', type: 'string', initialValue: 'right', options: { list: [{ title: 'Right of the pin', value: 'right' }, { title: 'Left of the pin', value: 'left' }], layout: 'radio', direction: 'horizontal' } }),
        ],
        preview: { select: { title: 'label', town: 'town', shownAs: 'shownAs' }, prepare: ({ title, town, shownAs }: any) => ({ title, subtitle: shownAs || town }) },
      })],
    }),

    // Recreation only: the "How we play" block under Where we play.
    defineField({
      name: 'formats', title: 'How we play', type: 'object', group: 'formats',
      hidden: ({ document }: any) => document?.key !== 'rec',
      fields: [
        txt('intro', 'Intro', { rows: 2 }),
        defineField({
          name: 'divisions', title: 'Divisions', type: 'array',
          of: [defineArrayMember({
            type: 'object', name: 'division',
            fields: [
              str('division', 'Division', { required: true, description: 'e.g. "U7".' }),
              str('format', 'Format', { required: true, description: 'e.g. "4v4".' }),
              defineField({ name: 'keepers', title: 'Goalkeepers', type: 'boolean', initialValue: false }),
              str('field', 'Field (yards)', { description: 'Width x length, e.g. "25 x 35".' }),
              str('goals', 'Goals (feet)', { description: 'Height x width, e.g. "6 x 12".' }),
              defineField({ name: 'ball', title: 'Ball size', type: 'number', options: { list: [3, 4, 5] } }),
              str('roster', 'Roster', { description: 'e.g. "5 to 7".' }),
              str('referees', 'Referees', { description: 'e.g. "None. Coaches guide play on the field."' }),
            ],
            preview: { select: { title: 'division', subtitle: 'format' } },
          })],
        }),
        defineField({ name: 'rules', title: 'Game rules', type: 'array', of: [{ type: 'string' }], description: 'Short cards under the table.' }),
        txt('combining', 'Divisions note', { rows: 3, description: 'Small print under the rules, e.g. how small divisions are combined.' }),
      ],
    }),

    // Developer only: these change how pages behave, so they're locked.
    defineField({ name: 'key', title: 'Program id', type: 'string', group: 'dev-only', readOnly: true, hidden: notAdmin }),
    defineField({ name: 'order', title: 'Order', type: 'number', group: 'dev-only', readOnly: true, hidden: notAdmin }),
    defineField({ name: 'num', title: 'Number label', type: 'string', group: 'dev-only', readOnly: true, hidden: notAdmin }),
    defineField({ name: 'kind', title: 'Kind', type: 'string', group: 'dev-only', readOnly: true, hidden: notAdmin, description: 'tryout: teams picked at tryouts. season: everyone who signs up plays.' }),
    defineField({ name: 'invite', title: 'Invitation only', type: 'boolean', group: 'dev-only', readOnly: true, hidden: notAdmin }),
  ],
  preview: { select: { title: 'name', subtitle: 'tier', media: 'img' } },
});
