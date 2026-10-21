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
const ref = z.object({ _ref: z.string() });
export const image = z.object({ asset: ref, crop: z.any().optional(), hotspot: z.any().optional(), alt: z.string().optional() });
const keyedImage = image.extend({ _key: z.string() });
// Program leadership, a region's leaders and a region's coaches: people picked from Staff, with
// an optional title for that spot.
const people = z.array(z.object({ person: ref, title: z.string().optional() })).default([]);
const staff = z.object({ _id: z.string(), name: z.string(), title: z.string(), bio: z.string().optional(), email: z.string().email().optional(), headshot: image.optional() });
const regionStatus = z.object({
  status: z.enum(['active', 'soon', 'none']), hub: z.string().optional(), season: z.string().optional(), feeDelta: z.number().optional(),
  leaders: people, coaches: people,
});
const session = z.object({ time: z.string(), label: z.string(), kind: z.enum(['training', 'match']) });
const opt = z.string().optional();

const venue = z.object({ _id: z.string(), name: z.string(), address: z.string() });
const region = z.object({ _id: z.string(), key: z.enum(['north', 'south', 'west']), order: z.number(), label: z.string(), area: z.string() });

const feeItems = z.array(z.object({ item: z.string(), detail: opt })).default([]);
const program = z.object({
  _id: z.string(), key: z.enum(['academy', 'club', 'rec', 'futures']), order: z.number(), num: z.string(), kind: z.enum(['tryout', 'season']), invite: z.boolean().default(false),
  name: z.string(), tier: z.string(), ages: z.string(), kicker: z.string(), line: z.string(), tagline: z.string(), forHead: z.string(), intro: z.string(),
  leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), url: z.string().url().optional(), logo: image.optional(), lw: z.number().optional(), lh: z.number().optional() })).default([]),
  includedIntro: opt, included: feeItems, notIncluded: feeItems,
  showSeason: z.boolean().default(true), showWeek: z.boolean().default(true),
  leadershipHeading: opt, leadershipIntro: opt,
  img: image,
  photos: z.object({ who: image, cta: image, core: image, dev: z.array(keyedImage).length(4) }),
  registerUrl: z.string().url(), enrollment: z.enum(['trial', 'tryouts']).optional(), nextTryout: opt, registrationOpens: opt,
  joinCopy: z.string(), cta: z.string(), sessionLabel: z.string(), years: z.array(z.string()).default([]),
  groups: z.array(z.object({ label: z.string(), line: z.string(), cost: z.number(), commit: z.string() })).optional(),
  cost: z.number(), unit: z.enum(['per year', 'per season']), costNote: z.string(), includes: z.array(z.string()).default([]), commit: z.string(), commitNote: z.string(),
  phases: z.array(z.object({ label: z.string(), d: z.string(), startMonth: z.number().min(0).max(11), endMonth: z.number().min(0).max(11) })).default([]),
  week: z.object(Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, z.array(session).default([])]))),
  development: z.object({ technical: z.string(), tactical: z.string(), physical: z.string(), mental: z.string() }),
  compare: z.object({ training: z.string(), coaching: z.string(), competition: z.string(), yearRound: opt, evaluations: opt, strength: opt, film: opt, mental: opt, next: z.string() }),
  leadership: people,
  north: regionStatus, south: regionStatus, west: regionStatus,
});

const tryout = z.object({
  _id: z.string(), program: z.enum(['academy', 'club']), region: z.enum(['north', 'south', 'west']), venue: ref, date: isoDate,
  startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/), minAge: z.number(), maxAge: z.number(), gender: z.enum(['Boys', 'Girls', 'Coed']),
});
const hhmm = z.string().regex(/^\d{2}:\d{2}$/);
const sessionBase = {
  _id: z.string(), name: z.string(), region: z.enum(['north', 'south', 'west']), venue: ref, minAge: z.number().optional(), maxAge: z.number().optional(),
  cost: z.number(), registrationOpens: isoDate, registrationCloses: isoDate, start: isoDate, end: isoDate, registerUrl: z.string().url().optional(),
};
const recSession = z.object({ ...sessionBase, status: z.enum(['auto', 'open', 'closed', 'full']).default('auto') });
const futuresSession = z.object({
  ...sessionBase, capacity: z.number().optional(), status: z.enum(['auto', 'open', 'inseason', 'closed', 'full']).default('auto'),
  classes: z.array(z.object({ date: isoDate, startTime: hhmm, endTime: hhmm, note: z.string().optional() })).default([]),
});
const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
const event = z.object({
  _id: z.string(), name: z.string(), tagline: z.string(), start: isoDate, end: isoDate, regOpen: isoDate, regClose: isoDate,
  location: z.string(), format: z.string(), ages: z.string(), url: z.string().url(), logo: image.optional(),
  brand: z.object({ bg: hex, bg2: hex, ink: hex, accent: hex, mono: z.string() }),
});
const pillar = z.object({ tag: z.string(), deep: z.string(), focus: z.array(z.string()).default([]) });
const heading = { heading: z.string(), headingAccent: opt };
const settingsHome = {
  homeHero: z.object({ kicker: z.string(), heading: z.string(), headingAccent: z.string(), intro: z.string() }),
  homeAdult: z.object({ kicker: z.string() }).optional(),
  homeTryouts: z.object({ kicker: z.string(), ...heading }),
  homeEvents: z.object({ kicker: z.string(), ...heading }),
  homePathway: z.object({
    kicker: z.string(), heading: z.string(), body: z.string(), placeholderNote: opt, button: z.string(),
    cards: z.array(z.object({ name: z.string(), details: z.string(), tag: z.string(), look: z.enum(['today', 'development']), useClubLogo: z.boolean().optional(), crest: image.optional(), crestLabel: opt })).default([]),
  }),
  homeInside: z.object({ heading: z.string(), kicker: z.string() }),
  homePlay: z.object({ heading: z.string(), body: z.string(), primaryButton: z.string(), secondaryButton: z.string() }),
  proTier: z.object({ rowName: z.string(), rowLine: z.string(), rowLink: z.string(), pyramidKicker: z.string(), pyramidName: z.string(), pyramidSub: z.string(), hint: z.string() }),
};
const networkPage = z.object({
  _id: z.string(),
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
  social: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  collage: z.array(keyedImage).min(11),
  videos: z.array(z.object({ title: z.string(), len: z.string(), thumbnail: image, url: z.string().url() })).default([]),
  tryoutBring: z.array(z.string()).default([]),
  futuresWaiver: z.string().optional(),
  eventReel: z.array(z.object({ photo: image, event: z.string(), caption: z.string() })).default([]),
  development: z.object({ technical: pillar, tactical: pillar, physical: pillar, mental: pillar }),
  ...settingsHome,
});

const adultLeague = z.object({
  _id: z.string(), key: z.enum(['upsl', 'rec']), name: z.string(), tier: z.string(), ages: z.string(), homeLine: z.string(), tagline: z.string(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  forHead: z.string(), intro: z.string(),
  expect: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), logo: image.optional() })).default([]),
  placeholderNote: opt,
  join: z.object({ status: z.string(), heading: z.string(), headingAccent: opt, body: z.string(), button: z.string(), url: z.string().url().optional(), formHeading: z.string() }),
  phases: z.array(z.object({ label: z.string(), d: z.string(), startMonth: z.number().min(0).max(11), endMonth: z.number().min(0).max(11) })).default([]),
  week: z.object(Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, z.array(session).default([])]))).default({}),
  commitNote: opt,
  cost: z.number().optional(), unit: opt, costNote: opt, includes: z.array(z.string()).default([]),
  leadership: people, venues: z.array(ref).default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  img: image.optional(), who: image.optional(), cta: image.optional(),
});

const SCHEMAS = { venue, staff, region, program, adultLeague, tryoutSession: tryout, recSession, futuresSession, event, siteSettings: settings, networkPage } as const;
type Docs = { [K in keyof typeof SCHEMAS]: z.infer<(typeof SCHEMAS)[K]>[] };

// ---------- fetch ----------

export async function fetchContent(): Promise<Docs> {
  const types = Object.keys(SCHEMAS);
  const fixture = process.env.SANITY_FIXTURE;
  const raw: { _id: string; _type: string }[] = fixture
    ? JSON.parse(await readFile(fixture, 'utf8'))
    : await sanity.fetch('*[_type in $types && !(_id in path("drafts.**"))]', { types });

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
