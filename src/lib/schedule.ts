// Date and status helpers shared by Astro pages and the client islands.
// Dates in content are YYYY-MM-DD strings; they're read at local noon so they never
// shift a day across time zones.

export type SiteData = Awaited<ReturnType<typeof import('./content').loadSite>>;

const day = (iso: string) => new Date(iso + 'T12:00:00');

export const fmtDate = (iso: string) => day(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const fmtDay = (iso: string) => day(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export function fmtRange(start: string, end: string) {
  const a = day(start), b = day(end), m = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  return (m(a) === m(b) ? `${m(a)} ${a.getDate()}–${b.getDate()}` : `${m(a)} ${a.getDate()} – ${m(b)} ${b.getDate()}`) + ', ' + b.getFullYear();
}

export const mapUrl = (name: string, address: string) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ', ' + address);

// Today as YYYY-MM-DD in the visitor's time zone.
export const todayIso = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// Event status from its dates: Coming → Registration open → Registration closed → Past.
export type EventStatus = 'coming' | 'open' | 'closed' | 'past';
export const EVENT_STATUS_LABEL: Record<EventStatus, string> = { coming: 'Coming', open: 'Registration open', closed: 'Registration closed', past: 'Past' };
export function eventStatus(e: { regOpen: string; regClose: string; end: string }, today: string): EventStatus {
  if (today > e.end) return 'past';
  if (today < e.regOpen) return 'coming';
  if (today <= e.regClose) return 'open';
  return 'closed';
}
const STATUS_RANK: Record<EventStatus, number> = { open: 0, coming: 1, closed: 2, past: 3 };
export function eventsWithStatus<E extends { start: string; regOpen: string; regClose: string; end: string }>(events: E[], today: string) {
  return events
    .map((e) => ({ ...e, status: eventStatus(e, today) }))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.start.localeCompare(b.start));
}

// Tryout sessions for a program and/or region, upcoming only, in date order.
export function tryoutsFor(data: SiteData, f: { program?: string; region?: string }, today: string) {
  return data.tryouts.filter((t) => (!f.program || t.program === f.program) && (!f.region || t.region === f.region) && t.date >= today);
}

// The next thing a family in `region` can sign up for at `program` (home "Tryouts near you").
export function nextFor(data: SiteData, program: string, region: string, today: string) {
  const p = data.programs.find((x) => x.id === program)!;
  const r = data.regions.find((x) => x.id === region)!;
  if (p.kind === 'season') {
    const s = data.seasons.find((x) => x.start >= today) || data.seasons[data.seasons.length - 1];
    return { kind: 'season', title: `${s.name} · ${s.span}`, when: 'Starts ' + fmtDate(s.start), where: r.seasonVenue.name, href: p.registerUrl, cta: 'Sign up', external: true };
  }
  const t = tryoutsFor(data, { program, region }, today)[0];
  if (!t) return {
    kind: 'none', title: 'No posted dates', when: p.invite ? 'Request an invitation to trial' : 'Dates to be announced', where: `${r.label} region`,
    href: `/tryouts/?region=${region}&level=${program}`, cta: p.invite ? 'Request invitation' : 'Get notified', external: false,
  };
  return { kind: 'tryout', title: `${t.age} ${t.gender}`, when: `${fmtDate(t.date)} · ${t.time}`, where: t.venueName, href: p.registerUrl, cta: 'Register', external: true };
}

// Region choice: ?region= wins, then the ua_region cookie.
export const REGION_KEYS = ['north', 'south', 'west'];
export function readRegion(): string | null {
  if (typeof document === 'undefined') return null;
  const q = new URLSearchParams(location.search).get('region');
  if (q && REGION_KEYS.includes(q)) return q;
  const ck = (document.cookie.match(/(?:^|; )ua_region=(\w+)/) || [])[1];
  return ck && REGION_KEYS.includes(ck) ? ck : null;
}
export function rememberRegion(r: string | null) {
  try { document.cookie = 'ua_region=' + (r || '') + ';path=/;max-age=' + (r ? 31536000 : 0) + ';samesite=lax'; } catch { /* cookies blocked */ }
}

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
