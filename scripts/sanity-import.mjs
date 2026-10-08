// Copies the site's current content (src/content YAML, src/data/site.ts and src/assets/images)
// into Sanity. Safe to run more than once: documents use fixed ids and are replaced, and Sanity
// skips re-uploading images it already has.
//
//   npm run sanity:import            dry run: builds every document, checks it, writes nothing
//   npm run sanity:import -- --write uploads images and writes the documents
//
// Needs SANITY_WRITE_TOKEN in .env (sanity.io/manage > API > Tokens, Editor role) for --write.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { createClient } from '@sanity/client';
import * as site from '../src/data/site.ts';

const WRITE = process.argv.includes('--write');
const PROJECT_ID = process.env.SANITY_PROJECT_ID || '03wnsd9x';
const DATASET = process.env.SANITY_DATASET || 'production';
const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src/content');
const IMAGES = path.join(ROOT, 'src/assets/images');

if (WRITE && !process.env.SANITY_WRITE_TOKEN) {
  console.error('Missing SANITY_WRITE_TOKEN. Add it to .env (see the comment at the top of this script).');
  process.exit(1);
}
const client = createClient({ projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2025-10-01', token: process.env.SANITY_WRITE_TOKEN, useCdn: false });

// ---------- helpers ----------

const yaml = async (file) => parse(await readFile(path.join(CONTENT, file), 'utf8'));
const key = (i) => `k${String(i).padStart(3, '0')}`;
const keyed = (arr = []) => arr.map((x, i) => ({ _key: key(i), ...x }));
const ref = (_ref) => ({ _type: 'reference', _ref });
const notes = [];

// House style: age ranges read "U9 to U12", month spans "Nov to Dec".
const fixRanges = (s) =>
  typeof s !== 'string' ? s : s
    .replace(/\bU(\d+)\s*[–-]\s*U(\d+)\b/g, 'U$1 to U$2')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*–\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, '$1 to $2');
const fixAll = (v) =>
  Array.isArray(v) ? v.map(fixAll)
    : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k.startsWith('_') ? x : fixAll(x)]))
      : fixRanges(v);

// Images: upload once per file name, reuse the asset everywhere it appears.
const imageFiles = Object.fromEntries((await readdir(IMAGES)).map((f) => [f.replace(/\.[^.]+$/, ''), f]));
const uploaded = new Map();
async function image(k, alt) {
  if (!k) return undefined;
  const file = imageFiles[k];
  if (!file) throw new Error(`Image "${k}" not found in src/assets/images`);
  if (!uploaded.has(k)) {
    uploaded.set(k, WRITE
      ? client.assets.upload('image', createReadStream(path.join(IMAGES, file)), { filename: file }).then((a) => a._id)
      : Promise.resolve(`image-dryrun-${k}`));
  }
  return { _type: 'image', asset: ref(await uploaded.get(k)), ...(alt ? { alt } : {}) };
}
const keyedImage = async (k, i) => ({ _key: key(i), ...(await image(k)) });

// "7:30–9:00 PM" -> { startTime: "19:30", endTime: "21:00" }
function parseTimeRange(s, id) {
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Tryout ${id}: can't read time "${s}"`);
  const to24 = (h, min, ap) => `${String((+h % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)).padStart(2, '0')}:${min}`;
  const endTime = to24(m[4], m[5], m[6]);
  let startTime = to24(m[1], m[2], m[3] || m[6]);
  if (!m[3] && startTime > endTime) startTime = to24(m[1], m[2], 'AM'); // e.g. 11:30–1:00 PM
  return { startTime, endTime };
}
// "U15–U18" -> { minAge: 15, maxAge: 18 }, "U12" -> { minAge: 12, maxAge: 12 }
function parseAges(s, id) {
  const m = s.match(/^U(\d+)(?:\s*(?:[–-]|to)\s*U(\d+))?$/);
  if (!m) throw new Error(`Tryout ${id}: can't read age "${s}"`);
  return { minAge: +m[1], maxAge: +(m[2] ?? m[1]) };
}
// "Sign-up opens Nov. 15" -> the next Nov 15 on or before the session start. "open now" -> none.
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
function parseSignup(s, start, id) {
  if (/open now/i.test(s)) return undefined;
  const m = s.match(/opens\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})/i);
  if (!m) { notes.push(`Season ${id}: couldn't read sign-up "${s}", left empty. Set it in the Studio.`); return undefined; }
  const [sy, sm] = start.split('-').map(Number);
  const mo = MONTHS[m[1].toLowerCase()];
  const year = mo > sm ? sy - 1 : sy;
  return `${year}-${String(mo).padStart(2, '0')}-${String(m[2]).padStart(2, '0')}`;
}

// ---------- documents ----------

const docs = [];

const venues = await yaml('venues.yaml');
for (const v of venues) docs.push({ _id: `venue.${v.id}`, _type: 'venue', name: v.name, address: v.address });

const regions = await yaml('regions.yaml');
for (const r of regions) {
  docs.push({
    _id: `region.${r.id}`, _type: 'region', key: r.id, order: r.order, label: r.label, area: r.area,
    managingDirector: r.managingDirector, directorOfCoaching: r.directorOfCoaching, seasonVenue: ref(`venue.${r.seasonVenue}`),
  });
}

const DAY_KEYS = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' };
const PILLAR_KEYS = { Technical: 'technical', Tactical: 'tactical', Physical: 'physical', Mental: 'mental' };
for (const file of (await readdir(path.join(CONTENT, 'programs'))).filter((f) => f.endsWith('.yaml'))) {
  const id = file.replace('.yaml', '');
  const p = await yaml(`programs/${file}`);
  const compare = Object.fromEntries(Object.entries(p.compare).filter(([, v]) => v != null));
  docs.push({
    _id: `program.${id}`, _type: 'program',
    key: id, order: p.order, num: p.num, kind: p.kind, invite: p.invite ?? false,
    name: p.name, tier: p.tier, ages: p.ages, kicker: p.kicker, line: p.line,
    tagline: p.tagline, forHead: p.forHead, intro: p.intro,
    leagues: await Promise.all(keyed(p.leagues).map(async (l) => ({ ...l, _type: 'league', logo: await image(l.logo) }))),
    img: await image(p.img),
    photos: {
      who: await image(p.photos.who), core: await image(p.photos.core), cta: await image(p.photos.cta),
      dev: await Promise.all(p.photos.dev.map(keyedImage)),
    },
    registerUrl: p.registerUrl, enrollment: p.enrollment, nextTryout: p.nextTryout, registrationOpens: p.registrationOpens,
    joinCopy: p.joinCopy, cta: p.cta, sessionLabel: p.sessionLabel, years: p.years,
    groups: p.groups ? keyed(p.groups).map((g) => ({ ...g, _type: 'group' })) : undefined,
    cost: p.cost, unit: p.unit, costNote: p.costNote, includes: p.includes, commit: p.commit, commitNote: p.commitNote,
    phases: keyed(p.phases).map(({ _key, from, to, label, d }) => ({ _key, _type: 'phase', label, d, startMonth: from, endMonth: to - 1 })),
    week: Object.fromEntries(p.week.map((w) => [DAY_KEYS[w.day], keyed(w.items).map((s) => ({ ...s, _type: 'session' }))])),
    development: Object.fromEntries(p.development.map((d) => [PILLAR_KEYS[d.t], d.d])),
    compare,
    directors: keyed(p.directors).map((d) => ({ ...d, _type: 'director' })),
    coaches: keyed(p.coaches).map((c) => ({ ...c, _type: 'coach' })),
    north: p.regions.north, south: p.regions.south, west: p.regions.west,
  });
}

for (const t of await yaml('tryouts.yaml')) {
  docs.push({
    _id: `tryout.${t.id}`, _type: 'tryoutSession', program: t.program, region: t.region, venue: ref(`venue.${t.venue}`),
    date: t.date, ...parseTimeRange(t.time, t.id), ...parseAges(t.age, t.id), gender: t.gender,
  });
}

for (const s of await yaml('seasons.yaml')) {
  docs.push({ _id: `season.${s.id}`, _type: 'season', name: s.name, span: s.span, start: s.start, signupOpens: parseSignup(s.signup, s.start, s.id) });
}

for (const e of await yaml('events.yaml')) {
  const { id, logo, ...rest } = e;
  docs.push({ _id: `event.${id}`, _type: 'event', ...rest, logo: await image(logo) });
}

docs.push({
  _id: 'siteSettings', _type: 'siteSettings',
  mainEmail: site.MAIN_EMAIL,
  tryoutsLabel: site.TRYOUTS_LABEL,
  social: keyed(site.SOCIAL).map((s) => ({ ...s, _type: 'socialLink' })),
  collage: await Promise.all(site.COLLAGE_PHOTOS.map(keyedImage)),
  videos: await Promise.all(keyed(site.VIDEOS).map(async ({ img, ...v }) => ({ ...v, _type: 'video', thumbnail: await image(img) }))),
  tryoutBring: site.TRYOUT_BRING,
  eventReel: await Promise.all(site.EVENT_REEL.map(async ([photo, event, caption], i) => ({ _key: key(i), _type: 'reelItem', photo: await image(photo), event, caption }))),
  development: Object.fromEntries(Object.entries(site.DEVELOPMENT).map(([t, { tag, deep, focus }]) => [PILLAR_KEYS[t], { tag, deep, focus: [...focus] }])),
});

// ---------- checks, then write ----------

const clean = (v) => JSON.parse(JSON.stringify(v)); // drops undefined fields
const final = docs.map((d) => clean(fixAll(d)));

const emDash = final.filter((d) => JSON.stringify(d).includes('—')).map((d) => d._id);
if (emDash.length) { console.error('Em dashes found (the Studio will refuse to publish these):', emDash.join(', ')); process.exit(1); }

const counts = final.reduce((acc, d) => ({ ...acc, [d._type]: (acc[d._type] ?? 0) + 1 }), {});
console.log(`${WRITE ? 'Writing' : 'Dry run'} to ${PROJECT_ID}/${DATASET}`);
console.table(counts);
console.log(`${uploaded.size} images`);
notes.forEach((n) => console.log('Note:', n));

await mkdir(path.join(ROOT, '.sanity-import'), { recursive: true });
await writeFile(path.join(ROOT, '.sanity-import/documents.json'), JSON.stringify(final, null, 2));
console.log('Full output: .sanity-import/documents.json');

if (!WRITE) {
  console.log('\nNothing written. Run again with --write to import.');
} else {
  const tx = client.transaction();
  final.forEach((d) => tx.createOrReplace(d));
  await tx.commit({ visibility: 'async' });
  console.log(`\nImported ${final.length} documents. Open the Studio to check them.`);
}
