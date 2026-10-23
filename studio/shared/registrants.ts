// Registrants, age groups and email audiences, shared by the Studio's Registrations page and the
// website's /api/broadcast/ route, so the list staff see is exactly the list that gets the email.
//
// Age groups follow US Soccer's seasonal year from 2026-27: August 1 to July 31 (replacing birth
// year). A season is named by its years ("2026-27") and numbered by the year it ends (2027).
// The age group is that end year minus the year a player's own Aug-Jul birth window ends:
// born Aug 1, 2016 to Jul 31, 2017 is U10 in 2026-27. Check the chart (ageChart) against
// US Soccer's age group calculator if the rules change.

export const AGE_MIN = 3;
export const AGE_MAX = 18;

const ym = (iso: string) => iso.split('-').map(Number) as [number, number, number];

/** The year the Aug-Jul season containing this date ends: 2026-09-01 is in the season ending 2027. */
export const seasonEnd = (iso: string) => { const [y, m] = ym(iso); return m >= 8 ? y + 1 : y; };
/** 2027 -> "2026-27". */
export const seasonLabel = (end: number) => `${end - 1}-${String(end).slice(2)}`;
/** The U-number for a birth date in the season ending `end`. */
export const ageNumber = (birthISO: string, end: number) => end - seasonEnd(birthISO);
export const ageLabel = (n: number) => `U${n}`;

/** Birth date range for each age group U3 to U18 in a season, for staff to check. */
export const ageChart = (end: number) =>
  Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => {
    const n = AGE_MIN + i;
    return { n, label: ageLabel(n), from: `${end - n - 1}-08-01`, to: `${end - n}-07-31` };
  });

export type Gender = 'Boy' | 'Girl';
export const GENDERS: { value: Gender; label: string }[] = [{ value: 'Boy', label: 'Boys' }, { value: 'Girl', label: 'Girls' }];

/** One player as the Registrations page and email audiences see them, whatever program they're from. */
export type Registrant = {
  id: string; program: string; first: string; last: string; birthDate?: string; gender?: string;
  parentName?: string; email?: string; phone?: string; session?: string;
  season?: string; ageNumber?: number; payment?: string; receivedAt?: string;
};

/**
 * Where each program's registrations come from. Futures registers on the site today; another
 * program that starts registering on the site gets an entry here and appears on the page.
 */
export const SOURCES = [
  {
    program: 'futures', label: 'Futures',
    query: `*[_type == "futuresRegistration"]{
      _id, playerFirst, playerLast, birthDate, gender, parentName, email, phone, sessionName,
      season, seasonEnd, ageNumber, payment, receivedAt, "sessionStart": session->start
    }`,
    toRegistrant: (d: Record<string, any>): Registrant => {
      // Age group as saved at registration, or worked out from the session (or registration) date.
      const end: number | undefined = d.seasonEnd ?? (d.sessionStart || d.receivedAt ? seasonEnd(String(d.sessionStart ?? d.receivedAt).slice(0, 10)) : undefined);
      return {
        id: d._id, program: 'futures', first: d.playerFirst ?? '', last: d.playerLast ?? '', birthDate: d.birthDate, gender: d.gender,
        parentName: d.parentName, email: d.email, phone: d.phone, session: d.sessionName, payment: d.payment, receivedAt: d.receivedAt,
        season: d.season ?? (end ? seasonLabel(end) : undefined),
        ageNumber: d.ageNumber ?? (end && d.birthDate ? ageNumber(d.birthDate, end) : undefined),
      };
    },
  },
] as const;
export const PROGRAM_LABEL = Object.fromEntries(SOURCES.map((s) => [s.program, s.label])) as Record<string, string>;

/** Who an email goes to: everything left empty means "all". Payments default to paid only. */
export type Audience = {
  program: string; season?: string; sessions?: string[]; ages?: number[]; genders?: string[]; payments?: string[];
};

export const matches = (r: Registrant, a: Audience) =>
  r.program === a.program &&
  (!a.season || r.season === a.season) &&
  (!a.sessions?.length || (r.session != null && a.sessions.includes(r.session))) &&
  (!a.ages?.length || (r.ageNumber != null && a.ages.includes(r.ageNumber))) &&
  (!a.genders?.length || (r.gender != null && a.genders.includes(r.gender))) &&
  (a.payments?.length ? r.payment != null && a.payments.includes(r.payment) : r.payment === 'paid');

/** "Futures · 2026-27 · U7, U8 · Girls" */
export function describe(a: Audience) {
  const ages = [...(a.ages ?? [])].sort((x, y) => x - y).map(ageLabel);
  const genders = (a.genders ?? []).map((g) => GENDERS.find((x) => x.value === g)?.label ?? g);
  return [
    PROGRAM_LABEL[a.program] ?? a.program, a.season, ...(a.sessions ?? []),
    ages.length ? ages.join(', ') : 'All ages', genders.length ? genders.join(' and ') : 'Boys and girls',
  ].filter(Boolean).join(' · ');
}

/** One entry per parent email (siblings share one email), keeping the first parent name. */
export function recipientsOf(list: Registrant[]) {
  const seen = new Map<string, { email: string; name?: string; players: string[] }>();
  for (const r of list) {
    if (!r.email) continue;
    const k = r.email.trim().toLowerCase();
    const cur = seen.get(k) ?? { email: r.email.trim(), name: r.parentName, players: [] };
    cur.players.push(`${r.first} ${r.last}`.trim());
    seen.set(k, cur);
  }
  return [...seen.values()];
}
