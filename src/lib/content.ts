// Loads every content collection into one plain object the pages and client islands share.
// Image keys are swapped for optimized URLs here, so components never deal with keys.
import { getCollection } from 'astro:content';
import { buildAssets } from './assets';
import { fmtRange, mapUrl } from './schedule';
import { COLLAGE_PHOTOS, VIDEOS } from '../data/site';

const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;
const ageNum = (age: string) => parseInt(age.replace(/\D+/, ''), 10) || 0;

let cache: ReturnType<typeof build> | undefined;
export function loadSite() {
  cache ??= build();
  return cache;
}

async function build() {
  const A = await buildAssets();
  const img = (k?: string) => (k ? A[k] ?? k : undefined);

  const venues = (await getCollection('venues')).map((e) => ({ id: e.id, ...e.data, mapUrl: mapUrl(e.data.name, e.data.address) }));
  const venue = (id: string) => {
    const v = venues.find((x) => x.id === id);
    if (!v) throw new Error(`Unknown venue "${id}" (add it to src/content/venues.yaml)`);
    return v;
  };

  const regions = (await getCollection('regions')).sort(byOrder).map((e) => ({
    id: e.id, label: e.data.label, area: e.data.area,
    managingDirector: e.data.managingDirector, directorOfCoaching: e.data.directorOfCoaching,
    seasonVenue: venue(e.data.seasonVenue.id),
  }));

  const programs = (await getCollection('programs')).sort(byOrder).map((e) => {
    const d = e.data;
    return {
      id: e.id as 'academy' | 'club' | 'rec' | 'futures',
      ...d,
      img: img(d.img)!,
      photos: { who: img(d.photos.who)!, cta: img(d.photos.cta)!, core: img(d.photos.core)!, dev: d.photos.dev.map((k) => img(k)!) },
      leagues: d.leagues.map((l) => ({ ...l, logo: img(l.logo) })),
    };
  });

  const tryouts = (await getCollection('tryouts'))
    .map((e) => {
      const v = venue(e.data.venue.id);
      return { id: e.id, ...e.data, venue: v.id, venueName: v.name, mapUrl: v.mapUrl };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || ageNum(a.age) - ageNum(b.age) || a.gender.localeCompare(b.gender));

  const seasons = (await getCollection('seasons')).sort(byOrder).map((e) => ({ id: e.id, ...e.data }));
  const events = (await getCollection('events')).map((e) => ({ id: e.id, ...e.data, logo: img(e.data.logo), dates: fmtRange(e.data.start, e.data.end) }));

  return {
    programs, regions, venues, tryouts, seasons, events,
    collage: COLLAGE_PHOTOS.map((k) => A[k]),
    videos: VIDEOS.map((v) => ({ ...v, img: img(v.img)! })),
    logo: A.logo,
    // Today at build time. Islands swap in the visitor's date after they load.
    builtOn: new Date().toISOString().slice(0, 10),
  };
}
