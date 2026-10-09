// Loads all site content from Sanity into one plain object the pages and client islands share.
// Content is edited in the Studio (studio/); this file reshapes it into what components expect,
// so components never deal with Sanity documents or image references directly.
import { buildAssets } from './assets';
import { fetchContent, imageUrl, useLocalAssets } from './sanity';
import { fmtRange, mapUrl } from './schedule';

// Image widths, matching the sizes the design uses.
const W = { hero: 2000, section: 760, logo: 320, video: 960 } as const;

const DAYS = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']] as const;
const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

/**
 * Image as components use it: { src, pos?, alt? }.
 * - src: CDN URL at `width`, with the editor's crop applied (see imageUrl in sanity.ts).
 * - pos: CSS object-position from the editor's hotspot, only when one is set. Components fall back
 *   to their own position when it's missing, so images without a hotspot render as before.
 * - alt: the editor's description, only when filled in. Components keep their own alt otherwise.
 */
export type Pic = { src: string; pos?: string; alt?: string };
type SanityImage = Parameters<typeof imageUrl>[0];

const pct = (n: number) => `${Math.round(Math.min(1, Math.max(0, n)) * 1000) / 10}%`;
/** Hotspot as object-position. Sanity stores it relative to the original image, but the URL is
 *  already cropped, so it's re-expressed relative to the crop. Offline fixture builds serve
 *  uncropped local files, so they use the hotspot as is. */
function focus(im: NonNullable<SanityImage>): string | undefined {
  const h = im.hotspot as { x?: number; y?: number } | undefined;
  if (typeof h?.x !== 'number' || typeof h?.y !== 'number') return undefined;
  const c = im.asset._ref.startsWith('image-dryrun-') ? undefined : (im.crop as { left?: number; right?: number; top?: number; bottom?: number } | undefined);
  const l = c?.left ?? 0, r = c?.right ?? 0, t = c?.top ?? 0, b = c?.bottom ?? 0;
  return `${pct((h.x - l) / (1 - l - r || 1))} ${pct((h.y - t) / (1 - t - b || 1))}`;
}

function pic(im: SanityImage, width: number, quality?: number): Pic | undefined {
  const src = imageUrl(im, width, quality);
  if (!src || !im) return undefined;
  const out: Pic = { src };
  const pos = focus(im);
  if (pos) out.pos = pos;
  const alt = im.alt?.trim();
  if (alt) out.alt = alt;
  return out;
}

/** "venue.lehi" -> "lehi" */
const idOf = (_id: string) => _id.replace(/^[a-zA-Z]+\./, '');

/** "19:30" -> { h: "7:30", ap: "PM" } */
const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return { h: `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`, ap: h < 12 ? 'AM' : 'PM' };
};
/** "7:30–9:00 PM", or "11:30 AM–1:00 PM" when it crosses noon. */
export const fmtTimeRange = (start: string, end: string) => {
  const a = clock(start), b = clock(end);
  return a.ap === b.ap ? `${a.h}–${b.h} ${b.ap}` : `${a.h} ${a.ap}–${b.h} ${b.ap}`;
};
/** U15 to U18, or U12 for a single age group. */
export const fmtAges = (min: number, max: number) => (min === max ? `U${min}` : `U${min} to U${max}`);

let cache: ReturnType<typeof build> | undefined;
export function loadSite() {
  cache ??= build();
  return cache;
}

async function build() {
  const A = await buildAssets();
  useLocalAssets(A);
  const c = await fetchContent();
  const settings = c.siteSettings[0];
  const img = pic;

  const venues = c.venue.map((v) => ({ id: idOf(v._id), name: v.name, address: v.address, mapUrl: mapUrl(v.name, v.address) }));
  const venue = (_ref: string) => {
    const v = venues.find((x) => x.id === idOf(_ref));
    if (!v) throw new Error(`A document points to venue "${_ref}", which isn't published.`);
    return v;
  };

  const regions = [...c.region].sort((a, b) => a.order - b.order).map((r) => ({
    id: r.key, label: r.label, area: r.area,
    managingDirector: r.managingDirector, directorOfCoaching: r.directorOfCoaching,
    seasonVenue: venue(r.seasonVenue._ref),
  }));

  const programs = [...c.program].sort((a, b) => a.order - b.order).map((p) => ({
    id: p.key,
    order: p.order, num: p.num, name: p.name, tier: p.tier, ages: p.ages, kicker: p.kicker, line: p.line,
    kind: p.kind, invite: p.invite, registerUrl: p.registerUrl, enrollment: p.enrollment,
    nextTryout: p.nextTryout, registrationOpens: p.registrationOpens,
    img: img(p.img, W.hero)!,
    photos: { who: img(p.photos.who, W.section)!, cta: img(p.photos.cta, W.section)!, core: img(p.photos.core, W.section)!, dev: p.photos.dev.map((x) => img(x, W.section)!) },
    groups: p.groups,
    tagline: p.tagline, forHead: p.forHead, intro: p.intro,
    leagues: p.leagues.map(({ logo, ...l }) => ({ ...l, logo: img(logo, W.logo, 80) })),
    cost: p.cost, unit: p.unit, costNote: p.costNote, includes: p.includes, commit: p.commit, commitNote: p.commitNote,
    // The timeline axis runs Aug (0) to Jul (11); `to` is the end of the last month.
    phases: p.phases.map((ph) => ({ from: ph.startMonth, to: ph.endMonth + 1, label: ph.label, d: ph.d })),
    week: DAYS.map(([k, day]) => ({ day, items: p.week[k] ?? [] })),
    // This program's summary for each pillar, plus the shared detail from Site settings.
    development: PILLARS.map(([k, t]) => ({ t, d: p.development[k], ...settings.development[k] })),
    compare: {
      training: p.compare.training, coaching: p.compare.coaching, competition: p.compare.competition,
      yearRound: p.compare.yearRound ?? null, evaluations: p.compare.evaluations ?? null, strength: p.compare.strength ?? null,
      film: p.compare.film ?? null, mental: p.compare.mental ?? null, next: p.compare.next,
    },
    directors: p.directors.map(({ headshot, ...d }) => ({ ...d, headshot: img(headshot, W.logo) })),
    coaches: p.coaches.map(({ headshot, ...d }) => ({ ...d, headshot: img(headshot, W.logo) })),
    joinCopy: p.joinCopy, cta: p.cta, sessionLabel: p.sessionLabel, years: p.years,
    regions: { north: p.north, south: p.south, west: p.west },
  }));

  const tryouts = c.tryoutSession
    .map((t) => {
      const v = venue(t.venue._ref);
      return {
        id: idOf(t._id), program: t.program, region: t.region, venue: v.id, venueName: v.name, mapUrl: v.mapUrl,
        date: t.date, time: fmtTimeRange(t.startTime, t.endTime), startTime: t.startTime,
        age: fmtAges(t.minAge, t.maxAge), minAge: t.minAge, gender: t.gender,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.minAge - b.minAge || a.gender.localeCompare(b.gender) || a.startTime.localeCompare(b.startTime));

  const seasons = [...c.season].sort((a, b) => a.start.localeCompare(b.start)).map((s) => ({ id: idOf(s._id), name: s.name, span: s.span, start: s.start, signupOpens: s.signupOpens }));

  const events = c.event.map(({ _id, logo, ...e }) => ({ id: idOf(_id), ...e, logo: img(logo, W.logo, 80), dates: fmtRange(e.start, e.end) }));

  return {
    programs, regions, venues, tryouts, seasons, events,
    collage: settings.collage.map((x) => img(x, W.section, 66)!),
    videos: settings.videos.map((v) => ({ title: v.title, len: v.len, url: v.url, img: img(v.thumbnail, W.video)! })),
    settings: {
      mainEmail: settings.mainEmail,
      tryoutsLabel: settings.tryoutsLabel,
      social: settings.social,
      tryoutBring: settings.tryoutBring,
      eventReel: settings.eventReel.map((r) => ({ photo: img(r.photo, W.section, 66)!, event: r.event, caption: r.caption })),
    },
    logo: A.logo,
    // Today at build time. Islands swap in the visitor's date after they load.
    builtOn: new Date().toISOString().slice(0, 10),
  };
}
