// Sections an editor can hide on each kind of page, shared by the Studio's "Hide sections" fields
// (schemaTypes/helpers.ts hideSections) and the site, which checks the saved keys before drawing a
// section. The hero at the top of every page is never in these lists, so a page always has a top.
// Keys are saved in Sanity: rename a label freely, but never a key.

export const SECTIONS = {
  home: [
    ['tryouts', 'Play for us (tryouts near you)'],
    ['events', 'Tournaments'],
    ['pathway', 'Where the pathway leads'],
    ['inside', 'Inside Utah Athletic (videos)'],
    ['play', 'Closing call to action'],
  ],
  program: [
    ['who', 'Who it\'s for'],
    ['cta', '"Do you have what it takes?" banner'],
    ['dev', 'Development model (also set per program in Site-wide components)'],
    ['pathway', 'Pathway position'],
    ['leagues', 'Where we play'],
    ['season', 'Season overview'],
    ['week', 'A typical week'],
    ['cost', 'Compare programs, or What your fee covers'],
    ['staff', 'Leadership'],
    ['regions', 'Choose your region (and the map)'],
    ['explore', 'Explore the pathway (bottom of the page and every region tab)'],
  ],
  region: [
    ['lead', 'Regional leadership'],
    ['coach', 'Coaching staff'],
    ['try', 'Tryouts, or Sign up'],
    ['fee', 'Fees'],
    ['contact', 'Want to contact our leaders?'],
  ],
  adult: [
    ['who', 'Who it\'s for'],
    ['cta', 'Join banner'],
    ['play', 'Where we play'],
    ['season', 'Season overview'],
    ['week', 'A typical week'],
    ['cost', 'What it costs'],
    ['fields', 'Where you\'ll play (home fields)'],
    ['staff', 'Staff'],
    ['faq', 'Good to know (questions)'],
    ['join', 'Join form'],
  ],
  tryouts: [
    ['sessions', 'Tryout dates and sessions (the region and level filters stay)'],
    ['invite', 'Request an invitation to trial (Academy)'],
    ['before', 'Before you come (what to bring, missed your date, contact)'],
  ],
  events: [
    ['list', 'Events'],
    ['cards', 'Cards under the events'],
    ['reel', 'Highlight reel'],
  ],
  contact: [
    ['form', 'Contact form'],
  ],
  network: [
    ['network', 'The network'],
    ['means', 'What it means'],
    ['club', 'Professional club'],
    ['closing', 'Bottom of page'],
  ],
} as const satisfies Record<string, readonly (readonly [string, string])[]>;

export type PageKind = keyof typeof SECTIONS;

/** Program pages that show the shared development model when nothing is picked yet: all of them. */
export const DEV_PROGRAMS = [
  ['academy', 'Academy'],
  ['club', 'Club'],
  ['rec', 'Recreation'],
  ['futures', 'Futures'],
] as const;

/** Sections that stay where they are whatever the order (they can still be hidden). */
export const FIXED_SECTIONS: Partial<Record<PageKind, readonly string[]>> = {
  program: ['explore'],
};

/**
 * A page's sections in the editor's order (Studio > Page layout): the saved keys first, then any
 * section not in the saved order yet (e.g. one added since), placed after the section it follows
 * by default. Unknown keys are dropped. With nothing saved, the default order.
 */
export function orderOf(kind: PageKind, saved?: readonly string[] | null): string[] {
  const all = SECTIONS[kind].map(([k]) => k as string).filter((k) => !FIXED_SECTIONS[kind]?.includes(k));
  const out = (saved ?? []).filter((k, i, a) => all.includes(k) && a.indexOf(k) === i);
  all.forEach((k, i) => {
    if (out.includes(k)) return;
    const before = all.slice(0, i).reverse().find((p) => out.includes(p));
    out.splice(before ? out.indexOf(before) + 1 : 0, 0, k);
  });
  return out;
}
