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

// Event status from a session's dates: Coming → Registration open (or Sold out, when the editor
// ticks Full) → Registration closed → Live (being played) → Complete.
export type EventStatus = 'coming' | 'open' | 'full' | 'closed' | 'live' | 'complete';
export const EVENT_STATUS_LABEL: Record<EventStatus, string> = { coming: 'Coming', open: 'Registration open', full: 'Sold out', closed: 'Registration closed', live: 'Live now', complete: 'Complete' };
type EventDates = { start: string; end: string; regOpen: string; regClose: string; full?: boolean };
export function eventStatus(s: EventDates, today: string): EventStatus {
  if (today > s.end) return 'complete';
  if (today >= s.start) return 'live';
  if (today < s.regOpen) return 'coming';
  if (today <= s.regClose) return s.full ? 'full' : 'open';
  return 'closed';
}
/** An event's sessions with their status, in date order. */
export const sessionsWithStatus = <S extends EventDates>(sessions: S[], today: string) =>
  [...sessions].sort((a, b) => a.start.localeCompare(b.start)).map((s) => ({ ...s, status: eventStatus(s, today) }));
/**
 * The event as cards and pages show it, on the visitor's date: `session` is the one that matters now
 * (the first not yet complete, else the latest), `status` is its status, and `last` is the latest
 * complete session (for results while the next one is coming). `between` is true when the latest
 * session is over and the next one, if any, hasn't opened registration: the "See you next year" time.
 */
export function eventNow<S extends EventDates, E extends { sessions: S[] }>(e: E, today: string) {
  const all = sessionsWithStatus(e.sessions, today);
  const session = all.find((s) => s.status !== 'complete') ?? all.at(-1)!;
  const last = all.filter((s) => s.status === 'complete').at(-1);
  const between = !!last && (session === last || session.status === 'coming');
  return { ...e, sessions: all, session, status: session.status, last, between };
}
/** Badge look per status on event cards and pages. */
export const EVENT_BADGE: Record<EventStatus, { fg: string; ring: string; dot: string }> = {
  open: { fg: '#d6f0ee', ring: 'inset 0 0 0 1px #78b7b3', dot: '#78b7b3' },
  full: { fg: '#fff', ring: 'inset 0 0 0 1px var(--color-alert)', dot: 'var(--color-alert)' },
  live: { fg: '#fff', ring: 'inset 0 0 0 1px var(--color-alert)', dot: 'var(--color-alert)' },
  coming: { fg: '#e9e9ed', ring: 'inset 0 0 0 1px rgba(233,233,237,.35)', dot: '#e9e9ed' },
  closed: { fg: '#b9bbc4', ring: 'inset 0 0 0 1px rgba(233,233,237,.2)', dot: '#8b8d98' },
  complete: { fg: '#8b8d98', ring: 'inset 0 0 0 1px rgba(233,233,237,.12)', dot: '#5f616b' },
};
type Linked = { href: string; hosted: boolean; session: { status: EventStatus; regOpen: string; regClose: string; registerUrl: string | null; scheduleUrl: string | null; resultsUrl: string | null }; last?: { resultsUrl: string | null } };
/**
 * What an event offers right now: a one-line `note` and the main `action` ({ label, href }), from the
 * session's status. Register while open, Schedule while live (and once registration closes, if
 * posted), Results once complete; else the event's page or site.
 */
export function eventAction(e: Linked) {
  const s = e.session, site = e.hosted ? 'Tournament details' : 'Visit event site';
  const results = s.status === 'complete' ? s.resultsUrl : e.last?.resultsUrl;
  switch (s.status) {
    case 'open': return { note: `Registration closes ${fmtDay(s.regClose)}`, action: { label: 'Register', href: s.registerUrl ?? e.href } };
    case 'full': return { note: 'Every spot is taken', action: { label: site, href: e.href } };
    case 'coming': return { note: `Registration opens ${fmtDay(s.regOpen)}`, action: results ? { label: 'Last results', href: results } : { label: site, href: e.href } };
    case 'closed': return { note: `Registration closed ${fmtDay(s.regClose)}`, action: s.scheduleUrl ? { label: 'View schedule', href: s.scheduleUrl } : { label: site, href: e.href } };
    case 'live': return { note: 'Being played now', action: { label: 'View schedule', href: s.scheduleUrl ?? e.href } };
    default: return { note: results ? 'Final results are in' : 'Thanks to every team that played', action: { label: results ? 'View results' : site, href: results ?? e.href } };
  }
}
export const isExternal = (href: string) => /^https?:/.test(href);

const STATUS_RANK: Record<EventStatus, number> = { live: 0, open: 1, full: 2, coming: 3, closed: 4, complete: 5 };
export function eventsWithStatus<S extends EventDates, E extends { sessions: S[] }>(events: E[], today: string) {
  return events
    .filter((e) => e.sessions.length)
    .map((e) => eventNow(e, today))
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.session.start.localeCompare(b.session.start));
}

// Tryouts for a program and/or region that still have a day to come, soonest first. Each comes
// with only its age groups that still have days (`groups`, each with `left`: its days from today
// on), `next` (the first day still to come) and a summary for short lists: `when` (the remaining
// dates, e.g. "May 26 – 29"), `ages` ("U10 to U13") and `players` ("Boys and Girls").
export function tryoutsFor(data: SiteData, f: { program?: string; region?: string }, today: string) {
  return data.tryouts
    .filter((t) => (!f.program || t.program === f.program) && (!f.region || t.region === f.region) && t.end >= today)
    .map((t) => {
      const groups = t.groups.map((g) => ({ ...g, left: g.days.filter((d) => d.date >= today) })).filter((g) => g.left.length);
      const days = groups.flatMap((g) => g.left).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
      const first = days[0].date, last = days.at(-1)!.date;
      const genders = new Set(groups.map((g) => g.gender));
      return {
        ...t, groups, next: days[0],
        when: first === last ? fmtDate(first) : fmtRange(first, last),
        ages: fmtAgeRange(Math.min(...groups.map((g) => g.minAge)), Math.max(...groups.map((g) => g.maxAge))),
        players: genders.has('Coed') || (genders.has('Boys') && genders.has('Girls')) ? 'Boys and Girls' : [...genders][0],
      };
    })
    .sort((a, b) => a.next.date.localeCompare(b.next.date) || a.name.localeCompare(b.name));
}
const fmtAgeRange = (min: number, max: number) => (min === max ? `U${min}` : `U${min} to U${max}`);

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
  return { kind: 'tryout', title: t.name, when: `${t.when} · ${t.ages}`, where: t.players, href: tryoutsPage, cta: 'See tryouts', external: false };
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
