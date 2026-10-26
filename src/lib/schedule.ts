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

// Recreation and Futures session status. 'auto' works it out from the dates on the visitor's own
// day, so it never goes stale; any other value is the editor's override. Past sessions are 'past'.
export type SessionStatus = 'upcoming' | 'open' | 'closed' | 'full' | 'inseason' | 'past';
type Sess = { status: string; opens: string; closes: string; start: string; end: string };
export function sessionStatus(s: Sess, today: string): SessionStatus {
  if (today > s.end) return 'past';
  if (s.status !== 'auto') return s.status as SessionStatus;
  if (today < s.opens) return 'upcoming';
  if (today <= s.closes) return 'open';
  return today >= s.start ? 'inseason' : 'closed';
}
export function sessionLabel(s: Sess, today: string) {
  const st = sessionStatus(s, today);
  return {
    status: st,
    canJoin: st === 'open',
    text: st === 'upcoming' ? `Registration opens ${fmtDay(s.opens)}`
      : st === 'open' ? (s.status === 'auto' ? `Registration open until ${fmtDay(s.closes)}` : 'Registration open')
        : st === 'full' ? 'Full' : st === 'inseason' ? 'In season' : 'Registration closed',
  };
}
// A program's sessions in a region that haven't ended, in date order.
export function sessionsFor(data: SiteData, program: string, region: string, today: string) {
  return data.sessions.filter((s) => s.program === program && s.region === region && s.end >= today);
}

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
  const tryoutsPage = `/tryouts/?region=${region}&level=${program}`;
  if (p.kind === 'season') {
    // Rec and Futures link to registration: the open session's sign-up, else the program's.
    const reg = program === 'futures' ? '/futures/register/' : p.registerUrl;
    // The first session families can still join, else the next one coming.
    const list = sessionsFor(data, program, region, today);
    const s = list.find((x) => sessionLabel(x, today).canJoin) || list.find((x) => sessionStatus(x, today) === 'upcoming') || list[0];
    if (!s) return {
      // Nothing posted yet: send families to the region tab's "notify me" form (RegionTab, #notify).
      kind: 'none', title: 'Coming soon!', when: 'Registration dates to be announced', where: `${r.label} region`,
      href: `/${program}/${region}/#notify`, cta: 'Get notified when registration opens', external: false,
    };
    const l = sessionLabel(s, today);
    const href = l.canJoin ? s.url : reg;
    return { kind: 'season', title: s.name, when: `${s.dates} · ${l.text}`, where: s.venueName, href, cta: 'Register', external: /^https?:/.test(href) };
  }
  const t = tryoutsFor(data, { program, region }, today)[0];
  if (!t) return {
    kind: 'none', title: 'No posted dates', when: p.invite ? 'Request an invitation to trial' : 'Dates to be announced', where: `${r.label} region`,
    href: tryoutsPage, cta: p.invite ? 'Request invitation' : 'See tryouts', external: false,
  };
  return { kind: 'tryout', title: `${t.age} ${t.gender}`, when: `${fmtDate(t.date)} · ${t.time}`, where: t.venueName, href: tryoutsPage, cta: 'See tryouts', external: false };
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
