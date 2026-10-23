// One document per program (Academy, Club, Rec, Futures). These are fixed: the page addresses,
// home pyramid and compare table are built around the four program ids, so editors edit them
// but can't add or delete programs.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { MONTH_OPTIONS, hideSections, link, photo, seo, str, txt } from './helpers';
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

// A fee breakdown list: what the program fee covers, or what it doesn't.
const feeList = (name: string, title: string, description: string) =>
  defineField({
    name, title, type: 'array', group: 'cost', description,
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
        name: 'fees', title: 'Fees by age group', type: 'array', hidden: ({ parent, document }: any) => parent?.status !== 'active' || NO_PRICE.includes(document?.key),
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
      defineField({ name: 'feeDelta', title: 'Price difference in this region ($)', type: 'number', description: 'Only used when Fees by age group is empty: added to the program cost. Use a negative number for a discount, 0 for none.', hidden: ({ parent, document }: any) => parent?.status === 'none' || parent?.fees?.length || SESSION_PROGRAMS.includes(document?.key) || NO_PRICE.includes(document?.key) }),
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
        // Retired: each pillar's photo now lives in its panel (Development model). Hidden, kept in the dataset.
        defineField({ name: 'dev', title: 'Development (old)', type: 'array', hidden: true, of: [defineArrayMember({ type: 'image', options: { hotspot: true } })] }),
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
    // Retired: forms now offer U-age groups worked out from Ages (Overview tab). Hidden, kept in the dataset.
    defineField({ name: 'years', title: 'Birth years accepted (old)', type: 'array', group: 'join', hidden: true, of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({
      // Retired: never shown on the site (it held a price per age group). Hidden, kept in the dataset.
      name: 'groups', title: 'Age groups (old)', type: 'array', group: 'join', hidden: true,
      of: [defineArrayMember({
        type: 'object', name: 'group',
        fields: [str('label', 'Ages', { required: true }), str('line', 'Leagues', { required: true }), defineField({ name: 'cost', title: 'Cost ($)', type: 'number', validation: (r) => r.required().min(0) }), str('commit', 'Commitment', { required: true })],
        preview: { select: { title: 'label', subtitle: 'line' } },
      })],
    }),

    // Cost
    defineField({
      name: 'cost', title: 'Cost ($)', type: 'number', group: 'cost', validation: (r) => r.required().min(0),
      // Recreation and Futures prices come from their sessions; Academy's is never shown.
      hidden: ({ document }: any) => SESSION_PROGRAMS.includes(document?.key) || NO_PRICE.includes(document?.key),
    }),
    defineField({ name: 'unit', title: 'Billed', type: 'string', group: 'cost', hidden: noPrice, options: { list: ['per year', 'per season'], layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    txt('costNote', 'Cost note', { required: true, group: 'cost', rows: 2, hidden: noPrice }),
    defineField({ name: 'includes', title: 'What\'s included', type: 'array', group: 'cost', hidden: noPrice, of: [{ type: 'string' }] }),
    txt('includedIntro', 'Fee breakdown intro', { group: 'cost', rows: 2, description: 'Optional. Shown above the breakdown below.' }),
    feeList('included', 'Included in the fee', 'When this has items, the program page shows this breakdown in place of the Compare programs table.'),
    feeList('notIncluded', 'Not included in the fee', 'e.g. kit package, tournament travel.'),
    str('commit', 'Commitment', { required: true, group: 'cost', description: 'e.g. "3× / week".', hidden: noPrice }),
    txt('commitNote', 'Commitment note', { required: true, group: 'cost', rows: 2, hidden: noPrice }),

    // Season and week
    phasesField('season'),
    defineField({ name: 'week', title: 'Typical week', type: 'object', group: 'season', fields: DAYS.map(([k, t]) => daySessions(k, t)) }),
    // Replaced by Hide sections. Kept hidden until the old values are cleaned up.
    defineField({ name: 'showSeason', title: 'Show "Season overview" on the program page (old)', type: 'boolean', group: 'season', hidden: true, readOnly: true }),
    defineField({ name: 'showWeek', title: 'Show "A typical week" on the program page (old)', type: 'boolean', group: 'season', hidden: true, readOnly: true }),

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
    // Retired: replaced by Development model above. Hidden, kept in the dataset.
    defineField({ name: 'development', title: 'Development summaries (old)', type: 'object', group: 'dev', hidden: true, fields: PILLARS.map(([k, t]) => txt(k, t, { rows: 2 })) }),
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
    // Retired: replaced by Program leadership above (people from Staff). Hidden until the old
    // values are cleared from the dataset, then this field can be deleted.
    defineField({ name: 'directors', title: 'Directors (old)', type: 'array', group: 'staff', hidden: true, of: [{ type: 'object', name: 'director', fields: [str('name', 'Name'), str('role', 'Role'), txt('bio', 'Bio'), photo('headshot', 'Headshot')] }] }),
    // Retired: coaches now live under each region (Regions tab). Hidden until the old values
    // are cleared from the dataset, then this field can be deleted.
    defineField({ name: 'coaches', title: 'Coaches (old)', type: 'array', group: 'staff', hidden: true, of: [{ type: 'object', name: 'coach', fields: [str('name', 'Name'), str('role', 'Team'), photo('headshot', 'Headshot')] }] }),

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
