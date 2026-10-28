// Reads published content from Sanity at build time and checks it before any page uses it.
// A document that's missing something the site needs fails the build with its id and the
// problem, so a bad edit never ships; the live site keeps the last good build.
//
// Offline builds: SANITY_FIXTURE=<file.json> npm run build reads a JSON array of documents
// (for example `npx sanity documents query '*' > content.json` run in studio/) instead of the API.
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { z } from 'astro/zod';
import { readFile } from 'node:fs/promises';

// SANITY_READ_TOKEN (a Viewer token) is required: Sanity hides documents whose id contains a
// dot (program.academy, region.north, ...) from anonymous reads, so without it the build sees
// no programs or regions. Set it in .env locally and in Vercel's environment variables.
const token = import.meta.env.SANITY_READ_TOKEN || process.env.SANITY_READ_TOKEN;
if (!token && !process.env.SANITY_FIXTURE) {
  throw new Error('Missing SANITY_READ_TOKEN. Create a Viewer token at sanity.io/manage (API > Tokens) and add it to .env and to Vercel > Settings > Environment Variables.');
}

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID || '03wnsd9x',
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2025-10-01',
  token,
  useCdn: false, // builds always read the latest published content
  perspective: 'published',
});

const builder = createImageUrlBuilder(sanity);

// ---------- schemas for the raw documents ----------

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
// Links from the Studio end up in href attributes, so only web, email and phone links pass
// (webUrl alone also accepts javascript: links). siteHref also allows paths on this site.
const webUrl = z.string().url().regex(/^(https?:\/\/|mailto:|tel:)/i, 'Use a link starting with https://');
const siteHref = z.string().regex(/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i, 'Use a link starting with https:// or /');
const ref = z.object({ _ref: z.string() });
export const image = z.object({ asset: ref, crop: z.any().optional(), hotspot: z.any().optional(), alt: z.string().optional() });
const keyedImage = image.extend({ _key: z.string() });
// Program leadership, a region's leaders and a region's coaches: people picked from Staff, with
// an optional title for that spot.
const people = z.array(z.object({ person: ref, title: z.string().optional() })).default([]);
const staff = z.object({ _id: z.string(), name: z.string(), title: z.string(), bio: z.string().optional(), email: z.string().email().optional(), headshot: image.optional() });
const regionStatus = z.object({
  status: z.enum(['active', 'soon', 'none']), hub: z.string().optional(), season: z.string().optional(),
  ages: z.string().optional(), fees: z.array(z.object({ ages: z.string(), cost: z.number(), note: z.string().optional() })).default([]),
  leaders: people, coaches: people,
});
const session = z.object({ time: z.string(), label: z.string(), kind: z.enum(['training', 'match']) });
const opt = z.string().optional();
/** Hide sections (studio/shared/sections.ts): the keys of the sections an editor ticked. */
const hide = z.array(z.string()).default([]);
/** Page layout: the editor's section order (keys, studio/shared/sections.ts orderOf); empty is the default order. */
const order = z.array(z.string()).default([]);

/** A place picked with the Studio's place search (studio/shared/places.ts). */
const place = z.object({ name: opt, address: opt, location: z.object({ lat: z.number(), lng: z.number() }).optional(), placeId: opt }).optional();
const venue = z.object({ _id: z.string(), name: z.string(), address: z.string(), place });
const region = z.object({ _id: z.string(), key: z.enum(['north', 'south', 'west']), order: z.number(), label: z.string(), area: z.string() });

/** Search and sharing (studio/schemaTypes/helpers.ts seo()): all optional. */
const seo = z.object({ title: z.string().optional(), description: z.string().optional(), image: image.optional() }).optional();
/** One pillar on a program's Development model: its own summary and photo; label, detail and focus override the shared text. */
const devPillar = z.object({ summary: z.string(), photo: image, tag: opt, deep: opt, focus: z.array(z.string()).optional() });
const feeItems = z.array(z.object({ item: z.string(), detail: opt })).default([]);
/** Club's fees by age group: ages, a price per region (empty: to be announced) and what is and isn't included. */
const ageTab = z.object({
  _key: z.string(), minAge: z.number(), maxAge: z.number(), note: opt, included: feeItems, notIncluded: feeItems,
  prices: z.object({ north: z.number().optional(), south: z.number().optional(), west: z.number().optional() }).default({}),
});
const program = z.object({
  _id: z.string(), key: z.enum(['academy', 'club', 'rec', 'futures']), order: z.number(), num: z.string(), kind: z.enum(['tryout', 'season']), invite: z.boolean().default(false),
  name: z.string(), tier: z.string(), ages: z.string(), kicker: z.string(), line: z.string(), tagline: z.string(), forHead: z.string(), intro: z.string(),
  leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), url: webUrl.optional(), logo: image.optional(), lw: z.number().optional(), lh: z.number().optional() })).default([]),
  includedIntro: opt, included: feeItems, notIncluded: feeItems, ageTabs: z.array(ageTab).default([]),
  hide, hideRegion: hide, sectionOrder: order, regionSectionOrder: order,
  leadershipHeading: opt, leadershipIntro: opt, seo,
  mapHubs: z.array(z.object({ _key: z.string(), label: z.string(), town: opt, place, shownAs: opt, side: z.enum(['left', 'right']).default('right') })).default([]),
  formats: z.object({
    intro: opt, combining: opt, rules: z.array(z.string()).default([]),
    divisions: z.array(z.object({ division: z.string(), format: z.string(), keepers: z.boolean().default(false), field: opt, goals: opt, ball: z.number().optional(), roster: opt, referees: opt })).default([]),
  }).optional(),
  img: image,
  photos: z.object({ who: image, cta: image, core: image }),
  registerUrl: webUrl, enrollment: z.enum(['trial', 'tryouts']).optional(), nextTryout: opt, registrationOpens: opt,
  joinCopy: z.string(), cta: z.string(), sessionLabel: z.string(),
  cost: z.number().optional(), unit: z.enum(['per year', 'per season']), costNote: z.string(), includes: z.array(z.string()).default([]), commit: z.string(), commitNote: z.string(),
  phases: z.array(z.object({ label: z.string(), d: z.string(), startMonth: z.number().min(0).max(11), endMonth: z.number().min(0).max(11) })).default([]),
  week: z.object(Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, z.array(session).default([])]))),
  devPillars: z.object({ heading: opt, headingAccent: opt, intro: opt, technical: devPillar, tactical: devPillar, physical: devPillar, mental: devPillar }),
  compare: z.object({ training: z.string(), coaching: z.string(), competition: z.string(), yearRound: opt, evaluations: opt, strength: opt, film: opt, mental: opt, next: z.string() }),
  leadership: people,
  north: regionStatus, south: regionStatus, west: regionStatus,
});

const hhmmTime = z.string().regex(/^\d{2}:\d{2}$/);
const tryoutDay = z.object({ date: isoDate, venue: ref, startTime: hhmmTime, endTime: hhmmTime });
const tryoutGroup = z.object({ minAge: z.number(), maxAge: z.number(), gender: z.enum(['Boys', 'Girls', 'Coed']), days: z.array(tryoutDay).min(1), registerUrl: webUrl.optional() });
/** A tryout and its age groups. Older documents were one age group each (minAge … days at the top). */
const tryout = z.object({
  _id: z.string(), name: opt, program: z.enum(['academy', 'club']), region: z.enum(['north', 'south', 'west']),
  registerUrl: webUrl.optional(), groups: z.array(tryoutGroup).optional(),
  minAge: z.number().optional(), maxAge: z.number().optional(), gender: z.enum(['Boys', 'Girls', 'Coed']).optional(), days: z.array(tryoutDay).optional(),
}).refine((t) => t.groups?.length || t.days?.length, 'Add at least one age group with a day.');
const hhmm = z.string().regex(/^\d{2}:\d{2}$/);
const sessionBase = {
  _id: z.string(), name: z.string(), region: z.enum(['north', 'south', 'west']), venue: ref, minAge: z.number().optional(), maxAge: z.number().optional(),
  cost: z.number(), registrationOpens: isoDate, registrationCloses: isoDate, start: isoDate, end: isoDate, registerUrl: webUrl.optional(),
};
const recSession = z.object({ ...sessionBase, status: z.enum(['auto', 'open', 'closed', 'full']).default('auto') });
const futuresSession = z.object({
  ...sessionBase, capacity: z.number().optional(), status: z.enum(['auto', 'open', 'inseason', 'closed', 'full']).default('auto'),
  classes: z.array(z.object({ date: isoDate, startTime: hhmm, endTime: hhmm, note: z.string().optional() })).default([]),
});
const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
const event = z.object({
  _id: z.string(), name: z.string(), tagline: z.string(), start: isoDate, end: isoDate, regOpen: isoDate, regClose: isoDate,
  location: z.string(), place, format: z.string(), ages: z.string(), url: webUrl, logo: image.optional(),
  brand: z.object({ bg: hex, bg2: hex, ink: hex, accent: hex }),
});
const pillar = z.object({ tag: z.string(), deep: z.string(), focus: z.array(z.string()).default([]) });
const heading = { heading: z.string(), headingAccent: opt };
const settingsHome = {
  homeHero: z.object({ kicker: z.string(), heading: z.string(), headingAccent: z.string(), intro: z.string() }),
  homeAdult: z.object({ kicker: z.string() }).optional(),
  homeTryouts: z.object({ kicker: z.string(), ...heading }),
  tryoutsPage: z.object({ ...heading, intro: z.string() }),
  eventsPage: z.object({
    kicker: z.string(), ...heading, intro: z.string(), reelKicker: z.string(), reelHeading: z.string(),
    cards: z.array(z.object({ icon: z.enum(['flag', 'handshake', 'none']).default('flag'), kicker: z.string(), heading: z.string(), body: z.string(), button: z.string(), href: siteHref })).default([]),
  }),
  contactPage: z.object({ kicker: z.string(), ...heading, intro: z.string(), topics: z.array(z.string()).min(1) }),
  futuresPages: z.object({ ...heading, intro: z.string(), thanksHeading: z.string(), thanksHeadingAccent: opt, thanksBody: z.string() }),
  homeEvents: z.object({ kicker: z.string(), ...heading }),
  homePathway: z.object({
    kicker: z.string(), heading: z.string(), body: z.string(), placeholderNote: opt, button: z.string(),
    cards: z.array(z.object({ name: z.string(), details: z.string(), tag: z.string(), look: z.enum(['today', 'development']), useClubLogo: z.boolean().optional(), crest: image.optional(), crestLabel: opt })).default([]),
  }),
  homeInside: z.object({ heading: z.string(), kicker: z.string() }),
  homePlay: z.object({ heading: z.string(), body: z.string(), primaryButton: z.string(), secondaryButton: z.string() }),
  proTier: z.object({ rowName: z.string(), rowLine: z.string(), rowLink: z.string(), pyramidShort: opt, pyramidKicker: z.string(), pyramidName: z.string(), pyramidSub: z.string(), hint: z.string() }),
};
const networkPage = z.object({
  _id: z.string(), seo, hide, sectionOrder: order,
  hero: z.object({ kicker: z.string(), ...heading, intro: z.string(), placeholderNote: opt }),
  network: z.object({
    kicker: z.string(), heading: z.string(),
    clubs: z.array(z.object({ tag: z.string(), name: z.string(), details: z.string() })).default([]),
    affiliates: z.array(z.object({ name: z.string(), details: z.string() })).default([]),
  }),
  means: z.object({ kicker: z.string(), heading: z.string(), cards: z.array(z.object({ title: z.string(), body: z.string() })).default([]), placeholderNote: opt }),
  club: z.object({
    kicker: z.string(), heading: z.string(), name: z.string(), location: z.string(), crest: image.optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string(), dot: z.boolean().optional() })).default([]),
    description: z.string(), placeholderNote: opt, photo: image.optional(),
  }),
  closing: z.object({ kicker: z.string(), heading: z.string(), button: z.string() }),
});
const settings = z.object({
  mainEmail: z.string().email(), tryoutsLabel: z.string(),
  shareImage: image.optional(), logo: image.optional(), favicon: image.optional(),
  marketing: z.object({
    ga4: opt, metaPixel: opt, googleAds: opt, gtm: opt,
    adsLabels: z.object({ futures: opt, trial: opt, interest: opt, contact: opt, ollie: opt }).optional(),
  }).optional(), homeSeo: seo, tryoutsSeo: seo, eventsSeo: seo, contactSeo: seo,
  social: z.array(z.object({ label: z.string(), href: webUrl })).default([]),
  collage: z.array(keyedImage).min(11),
  videos: z.array(z.object({ title: z.string(), len: z.string(), thumbnail: image, url: webUrl })).default([]),
  tryoutBring: z.array(z.string()).default([]),
  eventReel: z.array(z.object({ photo: image, event: z.string(), caption: z.string() })).default([]),
  development: z.object({ heading: opt, headingAccent: opt, intro: opt, technical: pillar, tactical: pillar, physical: pillar, mental: pillar }),
  // Program pages showing the development model (Site-wide components); missing means all.
  devShowOn: z.array(z.string()).optional(),
  homeHide: hide, tryoutsHide: hide, eventsHide: hide, contactHide: hide, homeSectionOrder: order, tryoutsSectionOrder: order, eventsSectionOrder: order,
  ...settingsHome,
});

/** A waiver families accept on the registration forms listed in requiredFor (studio/shared/registrationForms.ts). */
const waiver = z.object({ _id: z.string(), title: z.string(), text: z.string(), requiredFor: z.array(z.string()).default([]), checkboxLabel: opt });

const adultLeague = z.object({
  _id: z.string(), key: z.enum(['upsl', 'rec']), hide, sectionOrder: order, name: z.string(), tier: z.string(), ages: z.string(), homeLine: z.string(), tagline: z.string(), seo,
  stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  forHead: z.string(), intro: z.string(),
  expect: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), logo: image.optional() })).default([]),
  placeholderNote: opt,
  join: z.object({ status: z.string(), heading: z.string(), headingAccent: opt, body: z.string(), button: z.string(), url: webUrl.optional(), formHeading: z.string() }),
  phases: z.array(z.object({ label: z.string(), d: z.string(), startMonth: z.number().min(0).max(11), endMonth: z.number().min(0).max(11) })).default([]),
  week: z.object(Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, z.array(session).default([])]))).default({}),
  commitNote: opt,
  cost: z.number().optional(), unit: opt, costNote: opt, includes: z.array(z.string()).default([]),
  leadership: people, venues: z.array(ref).default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  img: image.optional(), who: image.optional(), cta: image.optional(),
});

/** Page documents merged into Site settings (see fetchContent). Keep in step with PAGE_TYPES in studio/schemaTypes/pages.ts. */
const PAGE_TYPES = ['pageHome', 'pageTryouts', 'pageEvents', 'pageContact', 'pageFutures', 'componentDevelopment'] as const;

const SCHEMAS = { venue, staff, region, program, adultLeague, tryoutSession: tryout, recSession, futuresSession, event, siteSettings: settings, networkPage, waiver } as const;
type Docs = { [K in keyof typeof SCHEMAS]: z.infer<(typeof SCHEMAS)[K]>[] };

// ---------- fetch ----------

export async function fetchContent(): Promise<Docs> {
  const types = Object.keys(SCHEMAS);
  const fixture = process.env.SANITY_FIXTURE;
  const raw: ({ _id: string; _type: string } & Record<string, unknown>)[] = fixture
    ? JSON.parse(await readFile(fixture, 'utf8'))
    : await sanity.fetch('*[_type in $types && !(_id in path("drafts.**"))]', { types: [...types, ...PAGE_TYPES] });

  // Page documents (Home page, Tryouts page, ...; studio/schemaTypes/pages.ts) hold fields that used
  // to live in Site settings, under the same names. Lay them over Site settings so the rest of the
  // site reads one settings object.
  const settingsDoc = raw.find((d) => d._type === 'siteSettings');
  if (settingsDoc) {
    for (const d of raw.filter((x) => (PAGE_TYPES as readonly string[]).includes(x._type))) {
      for (const [k, v] of Object.entries(d)) if (!k.startsWith('_')) settingsDoc[k] = v;
    }
  }

  const out = Object.fromEntries(types.map((t) => [t, []])) as unknown as Docs;
  const problems: string[] = [];
  for (const doc of raw) {
    const schema = SCHEMAS[doc._type as keyof typeof SCHEMAS];
    if (!schema) continue;
    const r = schema.safeParse(doc);
    if (r.success) (out[doc._type as keyof Docs] as unknown[]).push(r.data);
    else problems.push(...r.error.issues.map((i) => `  ${doc._id} (${doc._type}) > ${i.path.join('.') || '(document)'}: ${i.message}`));
  }
  for (const t of ['program', 'region', 'siteSettings', 'networkPage'] as const) {
    if (!out[t].length) problems.push(`  No published ${t} documents. Run the import or publish them in the Studio.`);
  }
  if (problems.length) throw new Error(`Sanity content doesn't match what the site needs:\n${problems.join('\n')}`);
  return out;
}

// ---------- images ----------

let localAssets: Record<string, string> | undefined;
export function useLocalAssets(map: Record<string, string>) { localAssets = map; }

/** The logo at `height` px (for retina, pass twice the shown height). PNG when asked, e.g. for emails. */
export function logoUrl(img: z.infer<typeof image> | undefined, height: number, png = false): string | undefined {
  if (!img || img.asset._ref.startsWith('image-dryrun-')) return undefined;
  const b = builder.image(img).height(height);
  return (png ? b.format('png') : b.auto('format')).url();
}
/** A square PNG icon cut from the favicon upload around its hotspot (browser tab, home screen). */
export function iconUrl(img: z.infer<typeof image> | undefined, size: number): string | undefined {
  if (!img || img.asset._ref.startsWith('image-dryrun-')) return undefined;
  return builder.image(img).width(size).height(size).fit('crop').format('png').url();
}

/** Link-preview image: 1200 x 630 JPEG, cropped around the editor's hotspot. */
export function shareImageUrl(img: z.infer<typeof image> | undefined): string | undefined {
  if (!img || img.asset._ref.startsWith('image-dryrun-')) return undefined;
  return builder.image(img).width(1200).height(630).fit('crop').format('jpg').quality(80).url();
}

/** Optimized image URL at `width`. Keeps the editor's crop; serves WebP or AVIF to browsers that take it. */
export function imageUrl(img: z.infer<typeof image> | undefined, width: number, quality = 72): string | undefined {
  if (!img) return undefined;
  const r = img.asset._ref;
  // Offline fixture builds point at local files: "image-dryrun-<file key>".
  if (r.startsWith('image-dryrun-')) {
    const k = r.slice('image-dryrun-'.length);
    return localAssets?.[width >= 1800 && localAssets[k + '@lg'] ? k + '@lg' : k] ?? k;
  }
  return builder.image(img).width(width).quality(quality).fit('max').auto('format').url();
}
