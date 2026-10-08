// Site-wide copy and layout constants that aren't per-program content.
// Program, region, tryout, season, venue and event content lives in src/content (see content.config.ts).

export type ProgramKey = 'academy' | 'club' | 'rec' | 'futures';
export type RegionKey = 'north' | 'south' | 'west';

export const ORDER: ProgramKey[] = ['academy', 'club', 'rec', 'futures'];
export const REGION_ORDER: RegionKey[] = ['north', 'south', 'west'];

export const MAIN_EMAIL = 'info@utahathletic.com';

// Header button on every page.
export const TRYOUTS_LABEL = 'Tryouts 2027';

export const NAV = [
  { key: 'programs', label: 'Programs', href: '/#programs' },
  { key: 'network', label: 'Network', href: '/network/' },
  { key: 'tryouts', label: 'Tryouts', href: '/tryouts/' },
  { key: 'events', label: 'Tournaments & Events', href: '/events/' },
  { key: 'contact', label: 'Contact', href: '/contact/' },
];

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/utahathletic.soccer/' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/utahathletic/' },
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
export const COLLAGE_PHOTOS = Array.from({ length: 20 }, (_, i) => 'collage-c' + String(i + 1).padStart(2, '0'));

// "Inside Utah Athletic" docuseries. img is an image key in src/assets/images.
export const VIDEOS = [
  { title: 'Inside Utah Athletic: Episode 2', len: '05:56', img: 'video-t9Se3i_CBwo', url: 'https://www.youtube.com/watch?v=t9Se3i_CBwo' },
  { title: 'Inside Utah Athletic: Episode 1', len: '07:36', img: 'video-jJI_pFfA_xI', url: 'https://www.youtube.com/watch?v=jJI_pFfA_xI' },
  { title: 'Utah Athletic Docuseries: Teaser', len: '00:28', img: 'video-47JdWoQT9Lo', url: 'https://www.youtube.com/watch?v=47JdWoQT9Lo' },
];

// "We develop the complete player": shared detail for each principle (per-program summaries
// are in each program's `development` list). icon is a Phosphor icon name.
export const DEVELOPMENT = {
  Technical: { icon: 'SoccerBall', tag: 'The foundation', deep: 'Technique is the base everything else is built on. Every session starts with the ball, and every drill is run at game speed with an opponent close by.', focus: ['First touch and receiving on the half-turn', 'Passing range with both feet', '1v1 attacking and defending'] },
  Tactical: { icon: 'Strategy', tag: 'Reading the game', deep: 'Players learn one shared game model, so moving up an age group, or a level, means more detail, not a new system.', focus: ['Positional play and support angles', 'Pressing triggers and compactness', 'Transitions in both directions'] },
  Physical: { icon: 'Lightning', tag: 'The engine', deep: 'Physical work is planned around age and growth stage, so players get faster and stronger without overload.', focus: ['Speed, agility and change of direction', 'Age-appropriate strength', 'Load monitoring and injury prevention'] },
  Mental: { icon: 'Brain', tag: 'The finishing layer', deep: 'The top layer turns ability into performance: decisions under pressure, resilience after mistakes and the habits of a professional.', focus: ['Decision-making under pressure', 'Resilience and composure', 'Ownership of an individual development plan'] },
} as const;

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

// /tryouts "What to bring" card.
export const TRYOUT_BRING = ['Cleats and shin guards', 'Water bottle', 'Ball (size by age group)', 'Light and dark shirt', 'Completed Ollie registration'];

// /events highlight reel: [photo, event, caption].
export const EVENT_REEL = [['collage-c03', 'Copa Athletic', 'Final-day nerves'], ['collage-c13', 'Pioneer Cup', 'U12 semifinal'], ['collage-c15', 'Summer Night Lights', 'Lights on, game on'], ['collage-c19', 'Chaos Cup', 'Small-sided, all action'], ['collage-c08', 'Copa Athletic', 'Trophy lift']];

// /network: the Athletic Global network. Copy is placeholder until Athletic Global supplies it.
export const NETWORK_NODES = [
  { name: 'Utah Athletic', sub: 'Utah, USA · Academy pathway', ll: [-111.89, 40.76] as [number, number], side: -1 },
  { name: 'RC Vichy Athletic', sub: 'Vichy, France · Professional club', ll: [3.426, 46.128] as [number, number], side: 1 },
];
export const NETWORK_AFFILIATE_SLOTS = 3;
