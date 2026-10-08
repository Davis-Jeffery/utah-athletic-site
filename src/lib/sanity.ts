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

export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID || '03wnsd9x',
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2025-10-01',
  useCdn: false, // builds always read the latest published content
  perspective: 'published',
});

const builder = createImageUrlBuilder(sanity);

// ---------- schemas for the raw documents ----------

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const ref = z.object({ _ref: z.string() });
export const image = z.object({ asset: ref, crop: z.any().optional(), hotspot: z.any().optional(), alt: z.string().optional() });
const keyedImage = image.extend({ _key: z.string() });
const regionStatus = z.object({ status: z.enum(['active', 'soon', 'none']), hub: z.string().optional(), season: z.string().optional(), feeDelta: z.number().optional() });
const session = z.object({ time: z.string(), label: z.string(), kind: z.enum(['training', 'match']) });
const opt = z.string().optional();

const venue = z.object({ _id: z.string(), name: z.string(), address: z.string() });
const person = z.object({ name: z.string(), email: z.string().email() });
const region = z.object({ _id: z.string(), key: z.enum(['north', 'south', 'west']), order: z.number(), label: z.string(), area: z.string(), managingDirector: person, directorOfCoaching: person, seasonVenue: ref });

const program = z.object({
  _id: z.string(), key: z.enum(['academy', 'club', 'rec', 'futures']), order: z.number(), num: z.string(), kind: z.enum(['tryout', 'season']), invite: z.boolean().default(false),
  name: z.string(), tier: z.string(), ages: z.string(), kicker: z.string(), line: z.string(), tagline: z.string(), forHead: z.string(), intro: z.string(),
  leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), logo: image.optional(), lw: z.number().optional(), lh: z.number().optional() })).default([]),
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
  directors: z.array(z.object({ name: z.string(), role: z.string(), bio: z.string(), headshot: image.optional() })).default([]),
  coaches: z.array(z.object({ name: z.string(), role: z.string(), headshot: image.optional() })).default([]),
  north: regionStatus, south: regionStatus, west: regionStatus,
});

const tryout = z.object({
  _id: z.string(), program: z.enum(['academy', 'club']), region: z.enum(['north', 'south', 'west']), venue: ref, date: isoDate,
  startTime: z.string().regex(/^\d{2}:\d{2}$/), endTime: z.string().regex(/^\d{2}:\d{2}$/), minAge: z.number(), maxAge: z.number(), gender: z.enum(['Boys', 'Girls', 'Coed']),
});
const season = z.object({ _id: z.string(), name: z.string(), span: z.string(), start: isoDate, signupOpens: isoDate.optional() });
const hex = z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
const event = z.object({
  _id: z.string(), name: z.string(), tagline: z.string(), start: isoDate, end: isoDate, regOpen: isoDate, regClose: isoDate,
  location: z.string(), format: z.string(), ages: z.string(), url: z.string().url(), logo: image.optional(),
  brand: z.object({ bg: hex, bg2: hex, ink: hex, accent: hex, mono: z.string() }),
});
const pillar = z.object({ tag: z.string(), deep: z.string(), focus: z.array(z.string()).default([]) });
const settings = z.object({
  mainEmail: z.string().email(), tryoutsLabel: z.string(),
  social: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  collage: z.array(keyedImage).min(11),
  videos: z.array(z.object({ title: z.string(), len: z.string(), thumbnail: image, url: z.string().url() })).default([]),
  tryoutBring: z.array(z.string()).default([]),
  eventReel: z.array(z.object({ photo: image, event: z.string(), caption: z.string() })).default([]),
  development: z.object({ technical: pillar, tactical: pillar, physical: pillar, mental: pillar }),
});

const SCHEMAS = { venue, region, program, tryoutSession: tryout, season, event, siteSettings: settings } as const;
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
  for (const t of ['program', 'region', 'siteSettings'] as const) {
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
