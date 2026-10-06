// Program content for the site. Edit copy, prices, dates and schedules here.
// Image fields are keys into src/assets/images (see src/lib/images.ts).
// Extracted from the original Claude Design prototype (docs/design-reference).

export type ProgramKey = 'academy' | 'club' | 'rec' | 'futures';

export const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'];
const WEEK = rows => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, items: rows[i] || [] }));
const T = (t, label) => ({ t, label, k: 't' }), M = (t, label) => ({ t, label, k: 'm' });
export const PYRAMID_POINTS = {
  academy: [[300,0],[393.75,150],[206.25,150],[300,0]],
  club: [[196.9,165],[403.1,165],[496.9,315],[103.1,315]],
  rec: [[93.75,330],[297,330],[297,480],[0,480]],
  futures: [[303,330],[506.25,330],[600,480],[303,480]]
};
export const PROGRAMS: Record<ProgramKey, any> = {
  academy: {
    num: '01', name: 'Academy', tier: 'Tier 01 · Elite platform', ages: 'U9–U18', kicker: 'Elite', lx: '50%', ly: '22%', fs: '24px',
    groups: [
      { glabel: 'U9–U11', ages: 'U9–U11', line: 'Highest Tier RED X-League Divisions', cost: 2700, commit: '3× / week', installs: 10 },
      { glabel: 'U12–U18', ages: 'U12–U18', line: 'ECNL · Elite Academy League', cost: 3400, commit: '4–5× / week', installs: 10 }],
    img: 'hero-academy', line: 'ECNL · Elite Academy League',
    tagline: "A professional training environment for the state's most elite young players. We don't play local leagues. We compete on national platforms.",
    forHead: 'Built for the few who want it most.',
    intro: 'The best players in Utah train together daily, compete on national platforms, and are measured against the top clubs in the country. Every session, fixture and review is designed around one outcome: the next level.',
    forWho: [{ t: 'Elite, committed players', d: 'Ready to train like professionals four to five days a week.' }, { t: 'National ambition', d: 'Targeting college recruitment and professional pathways.' }, { t: 'Selection by trial', d: 'Tryout or invitation only. Request a private trial with staff.' }, { t: 'Boys & girls, U13–U19', d: 'Squads formed by birth year.' }],
    leagues: [{ name: 'ECNL', logo: 'badge-ecnl', lw: 50, lh: 72, level: 'National platform', d: 'National competition, showcase events and direct college scouting exposure.' }, { name: 'Elite Academy League', logo: 'badge-ea', lw: 58, lh: 72, level: 'National platform · EA', d: 'Academy-model league built around development and high-level match play.' }, { name: 'Premier events', level: 'Invitational', d: 'High-level friendlies and national showcase tournaments year-round.' }],
    cost: 3400, unit: 'per year', installs: 10, installLabel: '10 payments',
    costNote: 'Travel, hotels and event entry billed separately. Need-based financial aid available.',
    includes: ['Year-round coaching, 4–5 sessions a week', 'League and national platform fees', 'Full training and match kit', 'Strength, conditioning and mental performance', 'Film review and individual development plans'],
    commit: '4–5× / week', commitNote: 'Eleven-month season with regional and national travel. Expect 3–5 travel weekends per year.',
    phases: [{ a: 0, b: 1, label: 'Preseason', d: 'Squad formation, fitness testing and preseason friendlies against top regional opposition.' }, { a: 1, b: 4, label: 'Fall season', d: 'League play begins, regional events and the first national showcase.' }, { a: 4, b: 6, label: 'Winter block', d: 'Technical work, strength and conditioning, film study and winter showcases.' }, { a: 6, b: 9, label: 'Spring season', d: 'Remaining league fixtures and national showcase events in front of college scouts.' }, { a: 9, b: 11, label: 'Playoffs', d: 'Conference playoffs and national finals for qualifying teams.' }, { a: 11, b: 12, label: 'Tryouts', d: 'Evaluations for next season, then an active-rest window.' }],
    week: WEEK([[T('6:00–7:30P', 'Team training')], [T('6:00–7:30P', 'Team training'), T('7:30–8:15P', 'Strength')], [T('6:00–7:30P', 'Team training')], [T('6:00–7:30P', 'Team training'), T('7:30P', 'Film session')], [], [M('TBD', 'League match')], [M('TBD', 'Match / rest')]]),
    directors: [{ name: 'Director Name', role: 'Academy Director', bio: 'Leads the Academy curriculum and the national-platform program across every age group.' }, { name: 'Director Name', role: 'Head of Player Development', bio: 'Owns individual development plans, college placement and the pro pathway.' }],
    coaches: [{ name: 'Coach Name', role: 'U17/U19 Boys · ECNL' }, { name: 'Coach Name', role: 'U15/U16 Girls · ECNL' }, { name: 'Coach Name', role: 'U13/U14 Boys · EA' }, { name: 'Coach Name', role: 'Goalkeeping' }],
    playersHead: 'Player spotlight', teams: true,
    players: [{ num: '10', pos: 'Midfield', meta: 'Class of 2027 · committed' }, { num: '9', pos: 'Forward', meta: 'Class of 2026' }, { num: '4', pos: 'Center back', meta: 'Class of 2028' }, { num: '1', pos: 'Goalkeeper', meta: 'Class of 2027' }, { num: '7', pos: 'Winger', meta: 'Class of 2029' }, { num: '6', pos: 'Holding mid', meta: 'Class of 2026' }],
    joinHead: 'Earn your place.', joinCopy: 'Book a 2026 tryout session, or request an invitation for a private trial with Academy staff.',
    cta: 'Book a tryout', tabLabel: 'Tryouts', sessionLabel: 'Choose a tryout session',
    sessions: [{ date: 'Mon Jun 1', time: '6:00–7:30 PM', ages: 'U13–U15', loc: 'Field 1' }, { date: 'Tue Jun 2', time: '6:00–7:30 PM', ages: 'U16–U19', loc: 'Field 1' }, { date: 'Thu Jun 4', time: '6:00–8:00 PM', ages: 'Callbacks', loc: 'Stadium' }],
    years: ['2008', '2009', '2010', '2011', '2012', '2013', '2014']
  },
  club: {
    num: '02', name: 'Club', tier: 'Tier 02 · Competitive', ages: 'U9–U19', kicker: 'Competitive', lx: '50%', ly: '50%', fs: '34px',
    img: 'hero-club', line: 'USYS · State Cup',
    tagline: 'Competitive club soccer coached to the Academy standard. The proving ground between grassroots and the national platforms.',
    forHead: 'Compete. Develop. Climb.',
    intro: 'Club teams compete in USYS leagues and state cups, coached on the same game model as the Academy, so the best players can step up the moment they are ready.',
    forWho: [{ t: 'Competitive players', d: 'Structured, high-quality training three times a week.' }, { t: 'A route to Academy', d: 'Standouts are invited to train up and trial for Academy squads.' }, { t: 'Balanced commitment', d: 'Mostly local fixtures with a few in-state tournaments.' }, { t: 'Boys & girls, U9–U19', d: 'Multiple levels per birth year.' }],
    leagues: [{ name: 'USYS', level: 'Utah Youth Soccer', d: 'Competitive league play across Utah with divisions matched to team level.' }, { name: 'State Cup', level: 'State tournament', d: "Utah's premier knockout competition for top club teams." }, { name: 'Presidents Cup', level: 'State tournament', d: 'Competitive cup pathway with regional advancement.' }],
    cost: 1650, unit: 'per year', installs: 10, installLabel: '10 payments',
    costNote: 'Tournament entry shared across the team. Need-based financial aid available.',
    includes: ['Licensed coaching, 3 sessions a week', 'USYS league and registration fees', 'Training and match kit', 'Seasonal player evaluations', 'Pathway reviews for Academy trials'],
    commit: '3× / week', commitNote: 'Ten-month season. Mostly local fixtures with 2–3 in-state tournaments.',
    phases: [{ a: 0, b: 1, label: 'Preseason', d: 'Team formation and preseason camp.' }, { a: 1, b: 4, label: 'Fall league', d: 'USYS fall fixtures and early-season tournaments.' }, { a: 4, b: 7, label: 'Winter futsal', d: 'Futsal and indoor training to sharpen technique through the cold months.' }, { a: 7, b: 10, label: 'Spring league', d: 'USYS spring fixtures, State Cup and Presidents Cup.' }, { a: 10, b: 12, label: 'Tryouts & camps', d: 'Evaluations for next season and optional summer camps.' }],
    week: WEEK([[T('5:30–7:00P', 'Team training')], [], [T('5:30–7:00P', 'Team training')], [], [T('5:30–7:00P', 'Team training')], [M('TBD', 'League match')], []]),
    directors: [{ name: 'Director Name', role: 'Club Director', bio: 'Leads the Club program and the curriculum that links Club to Academy.' }, { name: 'Director Name', role: 'Coaching Coordinator', bio: 'Supports coaches, evaluations and team placement across age groups.' }],
    coaches: [{ name: 'Coach Name', role: 'U9–U11 Boys' }, { name: 'Coach Name', role: 'U9–U11 Girls' }, { name: 'Coach Name', role: 'U12–U14 Boys' }, { name: 'Coach Name', role: 'U12–U14 Girls' }],
    playersHead: 'Club standouts',
    players: [{ num: '8', pos: 'Midfield', meta: 'U12 · Moved up to Academy' }, { num: '11', pos: 'Forward', meta: 'U11 · State Cup finalist' }, { num: '3', pos: 'Defender', meta: 'U13' }, { num: '1', pos: 'Goalkeeper', meta: 'U12' }, { num: '14', pos: 'Winger', meta: 'U10' }, { num: '5', pos: 'Center back', meta: 'U14' }],
    joinHead: 'Find your level.', joinCopy: 'Club tryouts place every player on the right team for their level. Book a session below.',
    cta: 'Book a tryout', tabLabel: 'Tryouts', sessionLabel: 'Choose a tryout session',
    sessions: [{ date: 'Mon Jun 8', time: '5:30–7:00 PM', ages: 'U9–U12', loc: 'Fields 2–3' }, { date: 'Tue Jun 9', time: '5:30–7:00 PM', ages: 'U13–U19', loc: 'Fields 2–3' }, { date: 'Sat Jun 13', time: '9:00–11:00 AM', ages: 'Makeup', loc: 'Field 2' }],
    years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017']
  },
  rec: {
    num: '03', name: 'Recreation', tier: 'Tier 03 · Community', ages: 'U5–U14', kicker: 'Community', lx: '28%', ly: '84%', fs: '26px',
    img: 'hero-rec', line: 'UA Rec League',
    tagline: 'Local, well-coached and built for fun. One practice and one game a week. Where every player starts.',
    forHead: 'Everyone plays.',
    intro: 'Community soccer done properly: volunteer coaches backed by our staff, short-sided games, and sessions designed around enjoyment and fundamentals.',
    forWho: [{ t: 'New and returning players', d: 'No experience needed. Boots and shin guards.' }, { t: 'Flexible families', d: 'A light weekly commitment that fits around other sports.' }, { t: 'Fundamentals first', d: 'Staff-designed sessions on touch, fun and confidence.' }, { t: 'Boys & girls, U5–U14', d: 'Teams formed by age and neighborhood.' }],
    leagues: [{ name: 'UA Rec League', level: 'Community league', d: 'Local Saturday games in short-sided formats by age.' }, { name: 'Jamboree days', level: 'Season festival', d: 'End-of-season festival with games, skills challenges and awards.' }],
    cost: 165, unit: 'per season', installs: 3, installLabel: '3 payments',
    costNote: 'Sibling discount available. Scholarships on request.',
    includes: ['1 practice + 1 game a week', 'Team jersey and socks', 'Coach training and session plans', 'End-of-season jamboree'],
    commit: '1× + game', commitNote: 'Two 10-week seasons, fall and spring. Saturday games are local.',
    phases: [{ a: 0, b: 3, label: 'Fall season', d: 'Ten weeks of practices and Saturday games, ending with a jamboree.' }, { a: 3, b: 7, label: 'Off season', d: 'Optional winter skills clinics.' }, { a: 7, b: 10, label: 'Spring season', d: 'Ten weeks of practices and Saturday games.' }, { a: 10, b: 12, label: 'Summer camps', d: 'Optional week-long day camps run by our staff.' }],
    week: WEEK([[], [], [T('5:30–6:30P', 'Team practice')], [], [], [M('AM', 'Rec game')], []]),
    directors: [{ name: 'Director Name', role: 'Recreation Director', bio: 'Runs the rec league, coach education and the community program.' }],
    coaches: [{ name: 'Coach Name', role: 'Coach educator' }, { name: 'Coach Name', role: 'Field coordinator' }, { name: 'Volunteer coaches', role: '40+ parent coaches' }],
    playersHead: 'Rec teams',
    players: [{ num: '2', pos: 'U6 Thunder', meta: 'Fall 2026' }, { num: '7', pos: 'U8 Comets', meta: 'Fall 2026' }, { num: '12', pos: 'U10 Rapids', meta: 'Spring 2026' }, { num: '5', pos: 'U12 Storm', meta: 'Spring 2026' }],
    joinHead: 'Sign up for fall.', joinCopy: 'Registration is open. Pick a season, add your player, done in two minutes.',
    cta: 'Register', tabLabel: 'Register', sessionLabel: 'Choose a season',
    sessions: [{ date: 'Fall 2026', time: 'Aug 22 – Oct 31', ages: 'U5–U14', loc: 'Local fields' }, { date: 'Spring 2027', time: 'Mar 13 – May 22', ages: 'U5–U14', loc: 'Local fields' }],
    years: ['U5', 'U6', 'U8', 'U10', 'U12', 'U14']
  },
  futures: {
    num: '04', name: 'Futures', tier: 'Tier 03 · Elevated rec', ages: 'U5–U8', kicker: 'Elevated rec', lx: '72%', ly: '84%', fs: '26px',
    img: 'hero-futures', imgNote: '', line: 'Rec League + 2× training',
    tagline: 'An elevated rec experience for our youngest players: two staff-led trainings a week, plus Saturday rec games.',
    forHead: 'First touches, done right.',
    intro: 'Futures pairs the fun and flexibility of rec with two weekly sessions led by Utah Athletic coaches, building the habits, coordination and love of the game every great player starts with.',
    forWho: [{ t: 'Ages 4–8', d: 'U5–U8 players who love the ball and want more of it.' }, { t: 'More than rec', d: 'Two professional sessions on top of Saturday rec games.' }, { t: 'Play-based learning', d: 'Games-first sessions built on ball mastery and confidence.' }, { t: 'A head start', d: 'The natural on-ramp to Club and, one day, the Academy.' }],
    leagues: [{ name: 'UA Rec League', level: 'Saturday games', d: 'Futures players play their Saturday games in our rec program.' }, { name: 'Futures curriculum', level: '2× weekly training', d: 'Staff-led sessions on ball mastery, 1v1 and small-sided play.' }],
    cost: 395, unit: 'per season', installs: 3, installLabel: '3 payments',
    costNote: 'Includes rec registration. Sibling discount available.',
    includes: ['2 staff-led trainings a week', 'Saturday rec games (registration included)', 'Futures training kit', 'Progress card each season'],
    commit: '2× + game', commitNote: 'Sessions are 60 minutes. Two 10-week seasons, fall and spring.',
    phases: [{ a: 0, b: 3, label: 'Fall season', d: 'Two trainings a week plus Saturday rec games.' }, { a: 3, b: 7, label: 'Winter skills', d: 'Optional indoor ball-mastery sessions.' }, { a: 7, b: 10, label: 'Spring season', d: 'Two trainings a week plus Saturday rec games.' }, { a: 10, b: 12, label: 'Summer camps', d: 'Futures day camps with Academy players as helpers.' }],
    week: WEEK([[], [T('5:00–6:00P', 'Futures training')], [], [T('5:00–6:00P', 'Futures training')], [], [M('AM', 'Rec game')], []]),
    directors: [{ name: 'Director Name', role: 'Futures Director', bio: 'Designs the Futures curriculum and leads our youngest-player program.' }],
    coaches: [{ name: 'Coach Name', role: 'U5–U6 lead' }, { name: 'Coach Name', role: 'U7–U8 lead' }, { name: 'Coach Name', role: 'Futures coach' }],
    playersHead: 'Futures players',
    players: [{ num: '3', pos: 'U6', meta: 'Fall 2026' }, { num: '9', pos: 'U7', meta: 'Fall 2026' }, { num: '11', pos: 'U8', meta: 'Spring 2026' }, { num: '6', pos: 'U5', meta: 'Spring 2026' }],
    joinHead: 'Start the journey.', joinCopy: 'Spots are limited per age group. Register for a season or ask us a question.',
    cta: 'Register', tabLabel: 'Register', sessionLabel: 'Choose a season',
    sessions: [{ date: 'Fall 2026', time: 'Aug 18 – Oct 31', ages: 'U5–U8', loc: 'Main complex' }, { date: 'Spring 2027', time: 'Mar 9 – May 22', ages: 'U5–U8', loc: 'Main complex' }],
    years: ['U5', 'U6', 'U7', 'U8']
  }
};
export const VIDEOS = [
  { title: 'Inside Utah Athletic: Episode 2', len: '05:56', img: 'video-t9Se3i_CBwo', url: 'https://www.youtube.com/watch?v=t9Se3i_CBwo' },
  { title: 'Inside Utah Athletic: Episode 1', len: '07:36', img: 'video-jJI_pFfA_xI', url: 'https://www.youtube.com/watch?v=jJI_pFfA_xI' },
  { title: 'Utah Athletic Docuseries: Teaser', len: '00:28', img: 'video-47JdWoQT9Lo', url: 'https://www.youtube.com/watch?v=47JdWoQT9Lo' }];
export const ORDER: ProgramKey[] = ['academy', 'club', 'rec', 'futures'];
