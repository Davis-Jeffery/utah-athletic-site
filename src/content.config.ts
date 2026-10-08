// Content collections: the single source of truth for programs, regions, venues,
// tryouts, seasons and events. Edit the YAML files in src/content/, not page markup.
// Every collection is checked against its schema at build time, so a typo fails the
// build with a clear message instead of shipping a broken page.
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { file, glob } from 'astro/loaders';

const regionId = z.enum(['north', 'south', 'west']);
const programId = z.enum(['academy', 'club', 'rec', 'futures']);
// Dates are written as YYYY-MM-DD and kept as strings so they mean the same day everywhere.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const regionStatus = z.object({
  status: z.enum(['active', 'soon', 'none']),
  hub: z.string().optional(),
  season: z.string().optional(), // when status is soon, e.g. "Fall 2027"
  feeDelta: z.number().optional(), // added to the program cost in this region (Club and Rec)
});

const programs = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/programs' }),
  schema: z.object({
    order: z.number(),
    num: z.string(),
    name: z.string(),
    tier: z.string(),
    ages: z.string(),
    kicker: z.string(),
    line: z.string(),
    // tryout: teams are picked at tryouts. season: everyone who signs up plays.
    kind: z.enum(['tryout', 'season']),
    invite: z.boolean().default(false),
    // Ollie registration link. Lives here only; every Register button reads it.
    registerUrl: z.string().url(),
    // trial: accepting player trial applications. tryouts: open tryout registration.
    enrollment: z.enum(['trial', 'tryouts']).optional(),
    nextTryout: z.string().optional(),
    registrationOpens: z.string().optional(),
    img: z.string(),
    photos: z.object({ who: z.string(), cta: z.string(), core: z.string(), dev: z.array(z.string()).length(4) }),
    groups: z.array(z.object({ label: z.string(), line: z.string(), cost: z.number(), commit: z.string() })).optional(),
    tagline: z.string(),
    forHead: z.string(),
    intro: z.string(),
    leagues: z.array(z.object({ name: z.string(), level: z.string(), d: z.string(), logo: z.string().optional(), lw: z.number().optional(), lh: z.number().optional() })),
    cost: z.number(),
    unit: z.enum(['per year', 'per season']),
    costNote: z.string(),
    includes: z.array(z.string()),
    commit: z.string(),
    commitNote: z.string(),
    phases: z.array(z.object({ from: z.number(), to: z.number(), label: z.string(), d: z.string() })),
    week: z.array(z.object({ day: z.string(), items: z.array(z.object({ time: z.string(), label: z.string(), kind: z.enum(['training', 'match']) })) })).length(7),
    development: z.array(z.object({ t: z.enum(['Technical', 'Tactical', 'Physical', 'Mental']), d: z.string() })).length(4),
    compare: z.object({
      training: z.string(), coaching: z.string(), competition: z.string(),
      yearRound: z.string().nullable(), evaluations: z.string().nullable(), strength: z.string().nullable(),
      film: z.string().nullable(), mental: z.string().nullable(), next: z.string(),
    }),
    directors: z.array(z.object({ name: z.string(), role: z.string(), bio: z.string() })),
    coaches: z.array(z.object({ name: z.string(), role: z.string() })),
    joinCopy: z.string(),
    cta: z.string(),
    sessionLabel: z.string(),
    years: z.array(z.string()),
    regions: z.object({ north: regionStatus, south: regionStatus, west: regionStatus }),
  }),
});

const person = z.object({ name: z.string(), email: z.string().email() });

const regions = defineCollection({
  loader: file('src/content/regions.yaml'),
  schema: z.object({
    order: z.number(),
    label: z.string(),
    area: z.string(),
    managingDirector: person,
    directorOfCoaching: person,
    seasonVenue: reference('venues'), // where Rec and Futures sessions run for this region
  }),
});

const venues = defineCollection({
  loader: file('src/content/venues.yaml'),
  schema: z.object({ name: z.string(), address: z.string() }),
});

const tryouts = defineCollection({
  loader: file('src/content/tryouts.yaml'),
  schema: z.object({
    program: programId,
    region: regionId,
    venue: reference('venues'),
    date: isoDate,
    time: z.string(),
    age: z.string(),
    gender: z.enum(['Boys', 'Girls', 'Coed']),
  }),
});

const seasons = defineCollection({
  loader: file('src/content/seasons.yaml'),
  schema: z.object({ order: z.number(), name: z.string(), span: z.string(), start: isoDate, signup: z.string() }),
});

const events = defineCollection({
  loader: file('src/content/events.yaml'),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    start: isoDate,
    end: isoDate,
    regOpen: isoDate,
    regClose: isoDate,
    location: z.string(),
    format: z.string(),
    ages: z.string(),
    url: z.string().url(),
    logo: z.string().optional(), // image key in src/assets/images
    brand: z.object({ bg: z.string(), bg2: z.string(), ink: z.string(), accent: z.string(), mono: z.string() }),
  }),
});

export const collections = { programs, regions, venues, tryouts, seasons, events };
