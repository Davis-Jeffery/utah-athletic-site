// Loads all site content from Sanity into one plain object the pages and client islands share.
// Content is edited in the Studio (studio/); this file reshapes it into what components expect,
// so components never deal with Sanity documents or image references directly.
import { buildAssets } from './assets';
import { fetchContent, iconUrl, imageUrl, logoUrl, shareImageUrl, useLocalAssets } from './sanity';
import { fmtRange, mapUrl } from './schedule';
import { ADULT, NO_COACH_LIST, NO_PRICE_LIST } from '../data/site';
import { CITIES } from '../data/locations';

// Image widths, matching the sizes the design uses.
const W = { hero: 2000, section: 760, logo: 320, headshot: 400, video: 960 } as const;

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
/** "U10 to U19" -> ['U10', 'U11', ... 'U19'] (also "U12" alone). Age group choices on the forms. */
export const ageGroupsFrom = (ages: string) => {
  const m = ages.match(/U(\d+)(?:\s*to\s*U(\d+))?/i);
  if (!m) return [];
  const a = Number(m[1]), b = Number(m[2] ?? m[1]);
  return Array.from({ length: Math.max(0, b - a) + 1 }, (_, i) => `U${a + i}`);
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

  // Search and sharing: an editor's title (with " | Utah Athletic" added), description and share
  // image, each falling back to the page's default. Titles default to what families search for.
  type Seo = { title?: string; description?: string; image?: Parameters<typeof shareImageUrl>[0] } | undefined;
  const shareDefault = shareImageUrl(settings.shareImage) ?? shareImageUrl(settings.collage[0]);
  const seoOf = (s: Seo, d: { title: string; description: string; image?: string }) => ({
    title: s?.title?.trim() ? `${s.title.trim()} | Utah Athletic` : d.title,
    description: s?.description?.trim() || d.description,
    image: shareImageUrl(s?.image) ?? d.image ?? shareDefault,
  });

  const venues = c.venue.map((v) => ({ id: idOf(v._id), name: v.name, address: v.address, mapUrl: mapUrl(v.name, v.address) }));
  const venue = (_ref: string) => {
    const v = venues.find((x) => x.id === idOf(_ref));
    if (!v) throw new Error(`A document points to venue "${_ref}", which isn't published.`);
    return v;
  };

  // Staff, by id. Program lists point at these; the person's details live only here.
  const people = new Map(c.staff.map(({ _id, title, headshot, ...x }) => [idOf(_id), { id: idOf(_id), ...x, title, headshot: img(headshot, W.headshot), headshotLg: img(headshot, W.section) }]));
  type Person = { id: string; name: string; role: string; bio?: string; email?: string; headshot?: Pic; headshotLg?: Pic };
  /** A program list (leadership, a region's leaders or coaches) as people. `role` is the title for
   *  this spot, or the person's own title. A pick of someone whose Staff entry isn't published is skipped. */
  const staff = (list: { person: { _ref: string }; title?: string }[]): Person[] =>
    list.flatMap(({ person, title }) => {
      const s = people.get(idOf(person._ref));
      // headshotLg: a sharper copy for the profile pop-up (StaffBio.jsx); only people with a bio need it.
      return s ? [{ id: s.id, name: s.name, role: title || s.title, bio: s.bio, email: s.email, headshot: s.headshot, ...(s.bio ? { headshotLg: s.headshotLg } : {}) }] : [];
    });
  const regionFor = (p: (typeof c.program)[number], k: 'north' | 'south' | 'west') => {
    const { leaders, coaches, feeDelta, fees, ages, ...r } = p[k];
    // `price`: the lowest price a family pays in this region ("from" when prices differ). From the
    // region's Fees by age group when set, else its sessions (Rec, Futures) or the program cost.
    // Null when no price is posted yet.
    const hide = NO_PRICE_LIST.includes(p.key);
    const price = hide ? null : fees.length ? priceOf(fees)
      : p.kind === 'season' ? sessionPrice(p.key, k) : { cost: p.cost + (feeDelta || 0), from: false };
    return { ...r, ages: ages || p.ages, fees: hide ? [] : fees, price, leaders: staff(leaders), coaches: NO_COACH_LIST.includes(p.key) ? [] : staff(coaches) };
  };

  // Recreation and Futures sessions, each in one region at its own venue and price. Status is the
  // editor's override ('auto' = work it out from the dates, done on the visitor's date by sessionStatus).
  const builtOn = new Date().toISOString().slice(0, 10);
  const programDoc = (k: string) => c.program.find((p) => p.key === k)!;
  const sessions = [
    ...c.recSession.map((s) => ({ ...s, program: 'rec' as const, classes: [] as { date: string; startTime: string; endTime: string; note?: string }[] })),
    ...c.futuresSession.map((s) => ({ ...s, program: 'futures' as const })),
  ]
    .map((s) => {
      const v = venue(s.venue._ref), p = programDoc(s.program);
      return {
        id: idOf(s._id), program: s.program, region: s.region, name: s.name,
        ages: s.minAge != null && s.maxAge != null ? fmtAges(s.minAge, s.maxAge) : p.ages,
        cost: s.cost, venueName: v.name, mapUrl: v.mapUrl,
        opens: s.registrationOpens, closes: s.registrationCloses, start: s.start, end: s.end, dates: fmtRange(s.start, s.end),
        // Futures registers on the site (Stripe); Recreation uses its own link or the program's Ollie link.
        status: s.status, url: s.program === 'futures' ? `/futures/register/?session=${idOf(s._id)}` : s.registerUrl ?? p.registerUrl,
        classes: [...s.classes].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
          .map((x) => ({ date: x.date, time: fmtTimeRange(x.startTime, x.endTime), note: x.note })),
      };
    })
    .sort((a, b) => a.start.localeCompare(b.start) || a.name.localeCompare(b.name));

  // Prices for programs priced by session: the lowest price among sessions still running when the
  // site was built ("from" when they differ), for the program and for each region.
  const priceOf = (list: { cost: number }[]) => {
    if (!list.length) return null;
    const costs = list.map((x) => x.cost);
    return { cost: Math.min(...costs), from: new Set(costs).size > 1 };
  };
  const sessionPrice = (program: string, region?: string) =>
    priceOf(sessions.filter((s) => s.program === program && (!region || s.region === region) && s.end >= builtOn));

  const programs = [...c.program].sort((a, b) => a.order - b.order).map((p) => ({
    id: p.key,
    order: p.order, num: p.num, name: p.name, tier: p.tier, ages: p.ages, kicker: p.kicker, line: p.line,
    kind: p.kind, invite: p.invite, registerUrl: p.registerUrl, enrollment: p.enrollment,
    nextTryout: p.nextTryout, registrationOpens: p.registrationOpens,
    img: img(p.img, W.hero)!,
    photos: { who: img(p.photos.who, W.section)!, cta: img(p.photos.cta, W.section)!, core: img(p.photos.core, W.section)! },
    tagline: p.tagline, forHead: p.forHead, intro: p.intro,
    leagues: p.leagues.map(({ logo, ...l }) => ({ ...l, logo: img(logo, W.logo, 80) })),
    // Session programs: the lowest current session price, falling back to the program's own cost.
    // The lowest price across running regions ("from" when prices differ), falling back to the program's own cost.
    ...(() => {
      const keys = (['north', 'south', 'west'] as const).filter((k) => p[k].status === 'active');
      const prices = keys.map((k) => regionFor(p, k).price).filter((x): x is { cost: number; from: boolean } => !!x);
      const low = prices.length ? Math.min(...prices.map((x) => x.cost)) : null;
      if (NO_PRICE_LIST.includes(p.key)) return { cost: null, costFrom: false };
      return { cost: low ?? p.cost, costFrom: low != null && (prices.some((x) => x.from) || new Set(prices.map((x) => x.cost)).size > 1) };
    })(),
    ...(NO_PRICE_LIST.includes(p.key) ? { unit: null, costNote: '', includes: [] } : { unit: p.unit, costNote: p.costNote, includes: p.includes }),
    commit: p.commit, commitNote: p.commitNote,
    // Fee breakdown: when `included` has items, it replaces the Compare programs table.
    fees: p.included.length ? { intro: p.includedIntro, included: p.included, notIncluded: p.notIncluded } : null,
    showSeason: p.showSeason, showWeek: p.showWeek,
    // The timeline axis runs Aug (0) to Jul (11); `to` is the end of the last month.
    phases: p.phases.map((ph) => ({ from: ph.startMonth, to: ph.endMonth + 1, label: ph.label, d: ph.d })),
    week: DAYS.map(([k, day]) => ({ day, items: p.week[k] ?? [] })),
    // This program's summary for each pillar, plus the shared detail from Site settings.
    // Development model: each pillar's summary and photo, with its label, detail and focus areas
    // from the program where set, else the shared text (Site-wide components > Development model). Falls back to the old fields.
    development: PILLARS.map(([k, t], i) => {
      const own = p.devPillars?.[k], shared = settings.development[k];
      return {
        t, d: own?.summary ?? p.development?.[k] ?? '',
        tag: own?.tag?.trim() || shared.tag, deep: own?.deep?.trim() || shared.deep,
        focus: own?.focus?.length ? own.focus : shared.focus,
        photo: img(own?.photo ?? p.photos.dev?.[i], W.section),
      };
    }),
    devCopy: {
      heading: p.devPillars?.heading?.trim() || settings.development.heading || 'We develop the',
      headingAccent: p.devPillars?.headingAccent?.trim() || settings.development.headingAccent || 'complete player.',
      intro: p.devPillars?.intro?.trim() || settings.development.intro || 'Four principles, developed together. Every session, at every level and in every region, is planned around building a complete player, not just a good one.',
    },
    compare: {
      training: p.compare.training, coaching: p.compare.coaching, competition: p.compare.competition,
      yearRound: p.compare.yearRound ?? null, evaluations: p.compare.evaluations ?? null, strength: p.compare.strength ?? null,
      film: p.compare.film ?? null, mental: p.compare.mental ?? null, next: p.compare.next,
    },
    // Map pins: each town picked in the Studio placed at its coordinates (src/data/locations.ts).
    mapHubs: p.mapHubs.flatMap((h) => {
      const town = CITIES.find(([name]) => name === h.town);
      return town ? [{ id: h._key, label: h.label, city: h.shownAs || h.town, ll: [town[1], town[2]] as [number, number], side: h.side === 'left' ? -1 : 1 }] : [];
    }),
    formats: p.formats?.divisions.length ? p.formats : null,
    seo: seoOf(p.seo, {
      title: `${p.name}: ${p.kicker} Youth Soccer in Utah | Utah Athletic`,
      description: p.tagline, image: shareImageUrl(p.img),
    }),
    leadership: staff(p.leadership), leadershipHeading: p.leadershipHeading || 'Program leadership', leadershipIntro: p.leadershipIntro,
    joinCopy: p.joinCopy, cta: p.cta, sessionLabel: p.sessionLabel,
    // Age group choices on the forms, from the program's ages (US Soccer's Aug 1 age groups).
    ageGroups: ageGroupsFrom(p.ages),
    regions: { north: regionFor(p, 'north'), south: regionFor(p, 'south'), west: regionFor(p, 'west') },
  }));

  // Adult leagues (UPSL, Adult Recreation): one page each under /adult/. Photos are optional and
  // fall back to club photos from the home collage.
  const adult = ADULT.flatMap(({ key, slug, form }, i) => {
    const a = c.adultLeague.find((x) => x.key === key);
    if (!a) return [];
    const stand = (n: number) => img(settings.collage[(i * 3 + n) % settings.collage.length], W.section)!;
    return [{
      id: key, slug, form, href: `/adult/${slug}/`,
      name: a.name, tier: a.tier, ages: a.ages, homeLine: a.homeLine, tagline: a.tagline, stats: a.stats,
      forHead: a.forHead, intro: a.intro, expect: a.expect, placeholderNote: a.placeholderNote?.trim() || undefined,
      leagues: a.leagues.map(({ logo, ...l }) => ({ ...l, logo: img(logo, W.logo, 80) })),
      join: a.join,
      phases: a.phases.map((ph) => ({ from: ph.startMonth, to: ph.endMonth + 1, label: ph.label, d: ph.d })),
      week: DAYS.map(([k, day]) => ({ day, items: (a.week as Record<string, { time: string; label: string; kind: string }[]>)[k] ?? [] })),
      commitNote: a.commitNote,
      cost: a.cost ?? null, unit: a.unit, costNote: a.costNote, includes: a.includes,
      leadership: staff(a.leadership),
      venues: a.venues.map((v) => venue(v._ref)),
      faqs: a.faqs,
      img: img(a.img, W.hero) ?? img(settings.collage[(i * 3) % settings.collage.length], W.hero)!,
      seo: seoOf(a.seo, { title: `${a.name}: Adult Soccer in Utah | Utah Athletic`, description: a.tagline, image: shareImageUrl(a.img) }),
      photos: { who: img(a.who, W.section) ?? stand(1), cta: img(a.cta, W.section) ?? stand(2) },
    }];
  });

  // Each region's leaders across every program that runs there (each person once, program order,
  // with their Staff title), for /contact and /tryouts.
  const regions = [...c.region].sort((a, b) => a.order - b.order).map((r) => {
    const leaders = new Map<string, Person>();
    for (const p of programs) if (p.regions[r.key].status !== 'none') for (const l of p.regions[r.key].leaders) if (!leaders.has(l.id)) leaders.set(l.id, { ...l, role: people.get(l.id)!.title });
    return { id: r.key, label: r.label, area: r.area, leaders: [...leaders.values()] };
  });

  const tryouts = c.tryoutSession
    .map((t) => {
      const v = venue(t.venue._ref);
      return {
        id: idOf(t._id), program: t.program, region: t.region, venue: v.id, venueName: v.name, mapUrl: v.mapUrl,
        date: t.date, time: fmtTimeRange(t.startTime, t.endTime), startTime: t.startTime,
        age: fmtAges(t.minAge, t.maxAge), minAge: t.minAge, gender: t.gender,
        // This session's Ollie link, else the program's default.
        url: t.registerUrl ?? programDoc(t.program).registerUrl,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.minAge - b.minAge || a.gender.localeCompare(b.gender) || a.startTime.localeCompare(b.startTime));

  const events = c.event.map(({ _id, logo, ...e }) => ({ id: idOf(_id), ...e, logo: img(logo, W.section, 80), dates: fmtRange(e.start, e.end) }));

  // "{count}" / "{Count}" in tournament copy become the number of events as a word ("three" / "Three"),
  // so headings like "Four events." can't go stale when an event is added or removed.
  const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const word = WORDS[events.length] ?? String(events.length);
  const counted = <T,>(v: T): T => (typeof v === 'string' ? v.replaceAll('{count}', word).replaceAll('{Count}', word[0].toUpperCase() + word.slice(1))
    : Array.isArray(v) ? v.map(counted) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, counted(x)])) : v) as T;

  // Home page and Professional tier copy (Site settings), and the Network page.
  const note = (s?: string) => s?.trim() || undefined;
  const { homeHero, homeAdult, homeTryouts, homeEvents, homePathway, homeInside, homePlay, proTier } = settings;
  const home = {
    hero: homeHero, adult: adult.length ? { kicker: homeAdult?.kicker ?? 'Adult pathways', items: adult.map((a) => ({ name: a.name, details: a.homeLine, href: a.href })) } : null, tryouts: homeTryouts, events: counted(homeEvents), inside: homeInside, play: homePlay,
    pathway: {
      ...homePathway, placeholderNote: note(homePathway.placeholderNote),
      cards: homePathway.cards.map(({ crest, ...card }) => ({ ...card, crest: card.useClubLogo ? undefined : img(crest, W.logo) })),
    },
  };
  const n = c.networkPage[0];
  const network = {
    hero: { ...n.hero, placeholderNote: note(n.hero.placeholderNote) },
    network: n.network,
    means: { ...n.means, placeholderNote: note(n.means.placeholderNote) },
    club: { ...n.club, placeholderNote: note(n.club.placeholderNote), crest: img(n.club.crest, W.logo), photo: img(n.club.photo, W.section) },
    closing: n.closing,
  };

  return {
    home, pro: proTier, network,
    // Search and sharing for the main pages (programs, regions and adult leagues carry their own).
    seo: {
      shareDefault,
      home: seoOf(settings.homeSeo, { title: 'Utah Athletic | Youth Soccer Academy, Club and Rec in Utah', description: `${homeHero.heading} ${homeHero.headingAccent} ${homeHero.intro}` }),
      tryouts: seoOf(settings.tryoutsSeo, { title: `${settings.tryoutsLabel}: Youth Soccer Tryouts in Utah | Utah Athletic`, description: settings.tryoutsPage.intro }),
      // Empty description: the Events page lists the current events instead.
      events: seoOf(settings.eventsSeo, { title: 'Youth Soccer Tournaments in Utah | Utah Athletic', description: '' }),
      contact: seoOf(settings.contactSeo, { title: 'Contact Utah Athletic Soccer Club', description: settings.contactPage.intro }),
      network: seoOf(c.networkPage[0].seo, { title: 'Athletic Global Network | Utah Athletic', description: 'Utah Athletic is part of Athletic Global, a network of affiliate academies and professional clubs with a route to the professional game.' }),
    },
    // Page copy for /tryouts, /events, /contact and the Futures registration pages.
    pages: { tryouts: settings.tryoutsPage, events: counted(settings.eventsPage), contact: settings.contactPage, futures: settings.futuresPages },
    programs, adult, regions, venues, tryouts, sessions, events,
    collage: settings.collage.map((x) => img(x, W.section, 66)!),
    videos: settings.videos.map((v) => ({ title: v.title, len: v.len, url: v.url, img: img(v.thumbnail, W.video)! })),
    settings: {
      mainEmail: settings.mainEmail,
      siteName: 'Utah Athletic',
      tryoutsLabel: settings.tryoutsLabel,
      social: settings.social,
      tryoutBring: settings.tryoutBring,
      eventReel: settings.eventReel.map((r) => ({ photo: img(r.photo, W.section, 66)!, event: r.event, caption: r.caption })),
    },
    // Only the Futures registration page uses this.
    futuresWaiver: settings.futuresWaiver?.trim() || '',
    // Tracking (Site settings > Marketing). Each ID must match its format exactly, since it goes into
    // a script: anything else is ignored rather than risk breaking (or injecting into) the page.
    marketing: (() => {
      const m = settings.marketing ?? {};
      const ok = (v: string | undefined, re: RegExp) => (v && re.test(v.trim()) ? v.trim() : null);
      const label = (v?: string) => ok(v, /^[\w-]{4,40}$/);
      const out = {
        ga4: ok(m.ga4, /^G-[A-Z0-9]{4,20}$/), pixel: ok(m.metaPixel, /^\d{10,20}$/), ads: ok(m.googleAds, /^AW-\d{6,15}$/), gtm: ok(m.gtm, /^GTM-[A-Z0-9]{4,12}$/),
        labels: { futures: label(m.adsLabels?.futures), trial: label(m.adsLabels?.trial), interest: label(m.adsLabels?.interest), contact: label(m.adsLabels?.contact), ollie: label(m.adsLabels?.ollie) },
        // Sites a "Register" click leaves for (Ollie): every outside registration link in the content.
        registerHosts: [...new Set([...c.program.map((p) => p.registerUrl), ...c.recSession.map((s) => s.registerUrl), ...c.tryoutSession.map((t) => t.registerUrl)]
          .filter((u): u is string => !!u && /^https?:/.test(u)).map((u) => new URL(u).hostname))],
      };
      return out.ga4 || out.pixel || out.ads || out.gtm ? out : null;
    })(),
    // The header logo (Site settings > Logo and icon), else the logo file in public/.
    logo: logoUrl(settings.logo, 80) ?? A.logo,
    // A PNG logo for structured data, and the favicon sizes; null keeps public/ files (Base.astro).
    brand: {
      logoPng: logoUrl(settings.logo, 160, true) ?? 'https://cdn.sanity.io/images/03wnsd9x/production/7136068a606a4a8c18b238e508f4eda1a27b6a96-166x77.png',
      icons: settings.favicon ? { icon32: iconUrl(settings.favicon, 32)!, icon192: iconUrl(settings.favicon, 192)!, apple: iconUrl(settings.favicon, 180)! } : null,
    },
    // Today at build time. Islands swap in the visitor's date after they load.
    builtOn,
  };
}
