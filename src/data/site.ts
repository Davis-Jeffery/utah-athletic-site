// Layout constants and structure that stay in code. Editable content (programs, tryouts,
// events, contact email, social links, videos and so on) lives in Sanity: see studio/.

export type ProgramKey = 'academy' | 'club' | 'rec' | 'futures';
export type RegionKey = 'north' | 'south' | 'west';

export const ORDER: ProgramKey[] = ['academy', 'club', 'rec', 'futures'];
export const REGION_ORDER: RegionKey[] = ['north', 'south', 'west'];

export const NAV = [
  { key: 'programs', label: 'Programs', href: '/#programs' },
  { key: 'network', label: 'Network', href: '/network/' },
  { key: 'tryouts', label: 'Tryouts', href: '/tryouts/' },
  { key: 'events', label: 'Tournaments & Events', href: '/events/' },
  { key: 'contact', label: 'Contact', href: '/contact/' },
];

// Season timeline axis (program pages, "Season overview").
export const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

// Home pyramid geometry in a 600 x 480 box. `pro` is the Athletic Global tip (links to /network).
export const PYRAMID_POINTS: Record<ProgramKey | 'pro', number[][]> = {
  pro: [[300, 0], [362.5, 100], [237.5, 100], [300, 0]],
  academy: [[230, 112], [370, 112], [437.5, 220], [162.5, 220]],
  club: [[155, 232], [445, 232], [515, 344], [85, 344]],
  rec: [[77.5, 356], [297, 356], [297, 480], [0, 480]],
  futures: [[303, 356], [522.5, 356], [600, 480], [303, 480]],
};
// Where each level's label sits on the pyramid, and its size.
export const PYRAMID_LABELS: Record<ProgramKey, { x: string; y: string; fs: string }> = {
  academy: { x: '50%', y: '34.6%', fs: '22px' },
  club: { x: '50%', y: '60%', fs: '30px' },
  rec: { x: '28%', y: '87.5%', fs: '24px' },
  futures: { x: '72%', y: '87.5%', fs: '24px' },
};

// Home hero collage: 6 x 3 grid, 11 tiles as [grid-column, grid-row]. Photos are collage-c01 to c20.
export const COLLAGE_TILES = [['1 / 3', '1 / 3'], ['3 / 4', '1 / 2'], ['4 / 6', '1 / 2'], ['6 / 7', '1 / 3'], ['3 / 4', '2 / 4'], ['4 / 5', '2 / 3'], ['5 / 6', '2 / 4'], ['1 / 2', '3 / 4'], ['2 / 3', '3 / 4'], ['4 / 5', '3 / 4'], ['6 / 7', '3 / 4']];

// "Compare programs" table: row labels, keyed to each program's `compare` values. Columns run up the pathway.
export const COMPARE_COLUMNS: ProgramKey[] = ['futures', 'rec', 'club', 'academy'];
export const COMPARE_ROWS = [
  ['training', 'Training sessions / week'],
  ['coaching', 'Licensed professional coaching'],
  ['competition', 'Competition'],
  ['yearRound', 'Year-round program'],
  ['evaluations', 'Player evaluations'],
  ['strength', 'Strength & conditioning'],
  ['film', 'Film & video review'],
  ['mental', 'Mental performance seminars'],
  ['next', 'Next step on the pathway'],
] as const;

// "Pathway position" strip on program pages.
export const PATHWAY = [['futures', 'Futures'], ['rec', 'Recreation'], ['club', 'Club'], ['academy', 'Academy'], ['pro', 'Professional']];

// /network: the Athletic Global network. Copy is placeholder until Athletic Global supplies it.
export const NETWORK_NODES = [
  { name: 'Utah Athletic', sub: 'Utah, USA · Academy pathway', ll: [-111.89, 40.76] as [number, number], side: -1 },
  { name: 'RC Vichy Athletic', sub: 'Vichy, France · Professional club', ll: [3.426, 46.128] as [number, number], side: 1 },
];
export const NETWORK_AFFILIATE_SLOTS = 3;
