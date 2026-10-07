
const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'];
const R = (id, url) => (window.__resources && window.__resources[id]) || url;
const YT = id => R('yt-' + id, 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg');
const WEEK = rows => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, items: rows[i] || [] }));
const T = (t, label) => ({ t, label, k: 't' }), M = (t, label) => ({ t, label, k: 'm' });
const PTS = {
  academy: [[300,0],[393.75,150],[206.25,150],[300,0]],
  club: [[196.9,165],[403.1,165],[496.9,315],[103.1,315]],
  rec: [[93.75,330],[297,330],[297,480],[0,480]],
  futures: [[303,330],[506.25,330],[600,480],[303,480]]
};
const P = {
  academy: {
    num: '01', name: 'Academy', tier: 'Tier 01 · Elite platform', ages: 'U9–U18', kicker: 'Elite', lx: '50%', ly: '22%', fs: '24px',
    groups: [
      { glabel: 'U9–U11', ages: 'U9–U11', line: 'Highest Tier RED X-League Divisions', cost: 2700, commit: '3× / week', installs: 10 },
      { glabel: 'U12–U18', ages: 'U12–U18', line: 'ECNL · Elite Academy League', cost: 3400, commit: '4–5× / week', installs: 10 }],
    img: R('hero-academy', 'https://images.unsplash.com/photo-1745997645080-941f962f1392?fm=jpg&q=70&w=2400&auto=format&fit=crop'), line: 'ECNL · Elite Academy League',
    tagline: "A professional training environment for the state's most elite young players. We don't play local leagues — we compete on national platforms.",
    forHead: 'Built for the few who want it most.',
    intro: 'The best players in Utah train together daily, compete on national platforms, and are measured against the top clubs in the country. Every session, fixture and review is designed around one outcome: the next level.',
    forWho: [{ t: 'Elite, committed players', d: 'Ready to train like professionals four to five days a week.' }, { t: 'National ambition', d: 'Targeting college recruitment and professional pathways.' }, { t: 'Selection by trial', d: 'Tryout or invitation only. Request a private trial with staff.' }, { t: 'Boys & girls, U13–U19', d: 'Squads formed by birth year.' }],
    leagues: [{ name: 'ECNL', logo: R('logo-ecnl', 'assets/badge-ecnl.png'), lw: 50, lh: 72, level: 'National platform', d: 'National competition, showcase events and direct college scouting exposure.' }, { name: 'Elite Academy League', logo: R('logo-ea', 'assets/badge-ea-crop.png'), lw: 58, lh: 72, level: 'National platform · EA', d: 'Academy-model league built around development and high-level match play.' }, { name: 'Premier events', level: 'Invitational', d: 'High-level friendlies and national showcase tournaments year-round.' }],
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
    img: R('hero-club', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?fm=jpg&q=70&w=2400&auto=format&fit=crop'), line: 'USYS · State Cup',
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
    img: R('hero-rec', 'https://images.unsplash.com/photo-1680024436315-fb06267264b2?fm=jpg&q=70&w=2400&auto=format&fit=crop'), line: 'UA Rec League',
    tagline: 'Local, well-coached and built for fun. One practice and one game a week — where every player starts.',
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
    img: R('hero-futures', 'https://images.unsplash.com/photo-1622659097509-4d56de14539e?fm=jpg&q=70&w=2400&auto=format&fit=crop'), imgNote: '', line: 'Rec League + 2× training',
    tagline: 'An elevated rec experience for our youngest players: two staff-led trainings a week, plus Saturday rec games.',
    forHead: 'First touches, done right.',
    intro: 'Futures pairs the fun and flexibility of rec with two weekly sessions led by Utah Athletic coaches — building the habits, coordination and love of the game every great player starts with.',
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
const VIDS = [
  { title: 'Inside Utah Athletic — Episode 2', len: '05:56', img: YT('t9Se3i_CBwo'), url: 'https://www.youtube.com/watch?v=t9Se3i_CBwo' },
  { title: 'Inside Utah Athletic — Episode 1', len: '07:36', img: YT('jJI_pFfA_xI'), url: 'https://www.youtube.com/watch?v=jJI_pFfA_xI' },
  { title: 'Utah Athletic Docuseries — Teaser', len: '00:28', img: YT('47JdWoQT9Lo'), url: 'https://www.youtube.com/watch?v=47JdWoQT9Lo' }];
const ORDER = ['academy', 'club', 'rec', 'futures'];
const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const FIRST = ['Mateo','Liam','Noah','Diego','Ethan','Lucas','Owen','Gabriel','Leo','Caleb','Isaac','Julian','Adrian','Eli','Miles','Santiago','Kai','Rowan','Jonah','Theo','Marco','Felix','Andrés','Sami','Tyler','Jude','Nico','Ezra','Bennett','Hugo'];
const LAST = ['Alvarez','Brooks','Castillo','Dawson','Ellis','Fuentes','Grant','Hale','Ibarra','Jensen','Kimura','Larsen','Morales','Nakamura','Okafor','Park','Quinn','Reyes','Sorensen','Torres','Vance','Walker','Young','Zamora'];
const LINES = [['GK', 'Goalkeepers'], ['DEF', 'Defenders'], ['MID', 'Midfielders'], ['FWD', 'Forwards']];
const POSN = { GK: ['Goalkeeper'], DEF: ['Center back', 'Right back', 'Left back', 'Center back'], MID: ['Holding mid', 'Central mid', 'Attacking mid'], FWD: ['Striker', 'Winger', 'Winger'] };
const OPP = ['Real Colorado', 'Utah Royals', 'Sporting AZ', 'Colorado Rapids', 'Las Vegas Sports', 'Albion SC', 'Phoenix Rising', 'Denver Surf'];
const TOWNS = ['Salt Lake City, UT', 'Sandy, UT', 'Draper, UT', 'Lehi, UT', 'Park City, UT', 'Provo, UT', 'Ogden, UT', 'Herriman, UT'];
const ASP_OLD = { GK: 'Command my box, earn a D1 scholarship, and one day keep goal in the pros.', DEF: 'Become the defender nobody wants to play against — and earn a Youth National Team call-up.', MID: 'Control games from the middle and play college soccer at a top program.', FWD: 'Lead the ECNL in goals and sign a professional contract.' };
const ASP_YOUNG = { GK: 'Get better with my feet and earn a spot in the Elite Academy squad.', DEF: 'Win every 1v1 and move up to the Elite Academy team.', MID: 'Master both feet and make the U13 Elite Academy squad.', FWD: 'Score with both feet and make the Elite Academy team.' };
const TEAMS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(age => {
  const r = rng(age * 7919), pick = a => a[Math.floor(r() * a.length)];
  const size = age <= 10 ? 12 : age <= 12 ? 14 : 18;
  const shape = size === 12 ? { GK: 2, DEF: 3, MID: 4, FWD: 3 } : size === 14 ? { GK: 2, DEF: 4, MID: 5, FWD: 3 } : { GK: 2, DEF: 6, MID: 6, FWD: 4 };
  const league = age <= 11 ? 'RED X-League' : age <= 13 ? 'Elite Academy League' : 'ECNL';
  const format = age <= 10 ? '7v7' : age <= 12 ? '9v9' : '11v11';
  const birth = 2027 - age, games = age <= 11 ? 16 : 22, mins = age <= 10 ? 50 : age <= 12 ? 60 : 80;
  const pool = []; for (let n = 2; n <= 30; n++) if (n !== 12) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const names = new Set(), players = [];
  LINES.forEach(([L]) => { for (let i = 0; i < shape[L]; i++) {
    let name; do { name = pick(FIRST) + ' ' + pick(LAST); } while (names.has(name)); names.add(name);
    const num = L === 'GK' ? [1, 12][i] : pool.pop();
    const rr = (a, b) => Math.round(a + r() * (b - a));
    const apps = rr(games - 8, games), minutes = Math.round(apps * mins * (0.55 + r() * 0.4));
    const goals = L === 'FWD' ? rr(5, 18) : L === 'MID' ? rr(1, 9) : L === 'DEF' ? rr(0, 3) : 0;
    const assists = L === 'MID' ? rr(3, 12) : L === 'FWD' ? rr(2, 9) : L === 'DEF' ? rr(0, 4) : rr(0, 1);
    const tackles = L === 'DEF' ? rr(28, 64) : L === 'MID' ? rr(18, 46) : L === 'FWD' ? rr(4, 15) : rr(1, 5);
    const pass = rr(L === 'FWD' ? 66 : 72, 91), saves = rr(30, 84), cs = rr(2, 9), savePct = rr(68, 84);
    const at = (base) => Math.min(96, Math.max(42, Math.round(base + (age - 9) * 2 + (r() - 0.5) * 16)));
    const attrs = L === 'GK' ? [['Reflexes', 72], ['Handling', 70], ['Distribution', 64], ['Positioning', 68], ['Command', 62], ['Footwork', 58]] : [['Pace', L === 'FWD' ? 72 : 64], ['Technique', L === 'MID' ? 72 : 64], ['Vision', L === 'MID' ? 70 : 58], ['Finishing', L === 'FWD' ? 72 : L === 'MID' ? 60 : 44], ['Defending', L === 'DEF' ? 72 : L === 'MID' ? 60 : 44], ['Physical', L === 'DEF' ? 68 : 62]];
    const goalsList = L === 'GK' ? [['Keep 10 clean sheets', cs, 10], ['Hit 80% save rate', savePct, 80], ['Start every league match', apps, games]]
      : L === 'DEF' ? [['Win 60 tackles', tackles, 60], ['Complete 88% of passes', pass, 88], ['Score 3 set-piece goals', goals, 3]]
      : L === 'MID' ? [['Create 12 assists', assists, 12], ['Complete 90% of passes', pass, 90], ['Score 8 goals', goals, 8]]
      : [['Score 15 goals', goals, 15], ['Register 8 assists', assists, 8], ['Finish 50% of big chances', rr(30, 55), 50]];
    const hiType = L === 'GK' ? ['Save', 'Save', 'Distribution'] : L === 'DEF' ? ['Tackle', 'Goal', 'Interception'] : L === 'MID' ? ['Assist', 'Goal', 'Through ball'] : ['Goal', 'Goal', 'Assist'];
    const inches = Math.round(50 + (age - 9) * 2.4 + r() * 6), ft = Math.floor(inches / 12) + "'" + (inches % 12) + '"';
    players.push({ idx: players.length, line: L, num: String(num), name, pos: POSN[L][i % POSN[L].length],
      chips: [['Born', birth], ['Height', ft], ['Foot', r() < 0.25 ? 'Left' : 'Right'], ['Hometown', pick(TOWNS)], ['Class of', birth + 18]].map(([k, v]) => ({ k, v: String(v) })),
      stats: L === 'GK' ? [['Apps', apps], ['Minutes', minutes.toLocaleString('en-US')], ['Clean sheets', cs], ['Saves', saves], ['Save %', savePct + '%'], ['Pass %', pass + '%']] : [['Apps', apps], ['Minutes', minutes.toLocaleString('en-US')], ['Goals', goals], ['Assists', assists], ['Tackles', tackles], ['Pass %', pass + '%']],
      quote: (age <= 12 ? ASP_YOUNG : ASP_OLD)[L],
      goals: goalsList.map(([t, v, mx]) => ({ t, label: v + ' / ' + mx, pct: Math.min(100, Math.round(v / mx * 100)) + '%' })),
      attrs: attrs.map(([k, b]) => { const v = at(b); return { k, v: String(v), pct: v + '%' }; }),
      highlights: hiType.map(t => ({ type: t, title: 'vs. ' + pick(OPP) + ' · ' + (r() < 0.5 ? 'Fall' : 'Spring') + ' 2025', len: '0:' + String(rr(12, 58)).padStart(2, '0') }))
    });
  } });
  const w = Math.round(games * (0.45 + r() * 0.25)), d = Math.round((games - w) * 0.4), l = games - w - d;
  return { age, label: 'U' + age, league, format, players, facts: [{ k: 'Birth year', v: String(birth) }, { k: 'Squad', v: players.length + ' players' }, { k: 'Head coach', v: 'Coach Name' }, { k: '2025–26 record', v: w + 'W ' + d + 'D ' + l + 'L' }] };
});
const SECS = [['overview', "Who it's for"], ['leagues', 'Leagues'], ['locations', 'Locations'], ['season', 'Season'], ['schedule', 'Schedule'], ['cost', 'Cost'], ['staff', 'Staff'], ['players', 'Players'], ['join', 'Join']];
const MODES = [['expand', 'Expand'], ['zoom', 'Zoom'], ['curtain', 'Curtain']];
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const EASE = 'cubic-bezier(.76,0,.24,1)';
const ACC = '#78b7b3';
const IDLE = { tf: 'none', origin: '50% 50%', op: 1, filter: 'none', trans: 'none' };

class Component extends DCLogic {
  state = { hover: null, focus: 'academy', active: null, ov: null, home: IDLE, mode: null, busy: false, phase: 0, sess: 0, tab: 'a', sent: false, bill: 'full', sec: 'overview', tilt: { x: 0, y: 0 }, intro: false, introDone: false, swap: false };
  homeRef = React.createRef();
  scrollRef = React.createRef();
  componentDidMount() {
    setTimeout(() => this.setState({ intro: true }), 100);
    setTimeout(() => this.setState({ introDone: true }), 1400);
    this.onKey = e => {
      if (this.state.player != null) { if (e.key === 'Escape') this.closePlayer(); else if (e.key === 'ArrowRight') this.stepPlayer(1); else if (e.key === 'ArrowLeft') this.stepPlayer(-1); return; }
      if (e.key === 'Escape' && this.state.active && !this.state.busy) this.close();
    };
    window.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() { window.removeEventListener('keydown', this.onKey); document.body.style.overflow = ''; }
  mode() { return this.state.mode || this.props.transition || 'expand'; }
  dur() { return Math.round(760 * (this.props.speed ?? 1)); }
  pyrRect() { const el = document.querySelector('[data-pyr]'); return el && el.getBoundingClientRect(); }
  poly(pts) { return 'polygon(' + pts.map(p => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')'; }
  slicePoly(id) {
    const r = this.pyrRect(); if (!r || r.bottom < 0 || r.top > innerHeight) return null;
    const s = r.width / 600;
    return this.poly(PTS[id].map(([x, y]) => [r.left + x * s, r.top + y * s]));
  }
  sliceCenter(id) {
    const r = this.pyrRect(); if (!r) return [innerWidth / 2, innerHeight / 2];
    const s = r.width / 600, pts = PTS[id];
    return [r.left + pts.reduce((a, p) => a + p[0], 0) / 4 * s, r.top + pts.reduce((a, p) => a + p[1], 0) / 4 * s];
  }
  full() { return this.poly([[0, 0], [innerWidth, 0], [innerWidth, innerHeight], [0, innerHeight]]); }
  dot() { const x = innerWidth / 2, y = innerHeight / 2; return this.poly([[x, y - 2], [x + 2, y], [x, y + 2], [x - 2, y]]); }
  ensurePyrVisible() {
    const r = this.pyrRect(); if (!r) return;
    if (r.top < 60 || r.bottom > innerHeight) window.scrollTo(0, Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2));
  }
  homeOriginFor(id) {
    const [cx, cy] = this.sliceCenter(id); const w = this.homeRef.current.getBoundingClientRect();
    return (cx - w.left) + 'px ' + (cy - w.top) + 'px';
  }
  openPlayer(i) { this.setState({ player: i, mIn: false }, () => requestAnimationFrame(() => requestAnimationFrame(() => this.setState({ mIn: true })))); }
  closePlayer() { this.setState({ mIn: false }); setTimeout(() => this.setState({ player: null }), 220); }
  stepPlayer(dir) { const n = TEAMS[this.state.team || 0].players.length; this.setState(s => ({ player: (s.player + dir + n) % n })); }
  pickTeam(i) { if (i === this.state.team) return; this.setState({ rosterFade: true }); setTimeout(() => this.setState({ team: i, rosterFade: false }), 180); }
  reset(id) { return { team: 0, player: null, rosterFade: false, grp: 0, active: id, focus: id, hover: null, phase: 0, sess: 0, tab: 'a', sent: false, bill: 'full', sec: 'overview', tilt: { x: 0, y: 0 } }; }
  open(id) {
    if (this.state.active || this.state.busy) return;
    const d = this.dur(), mode = this.mode(), raf = f => requestAnimationFrame(() => requestAnimationFrame(f));
    document.body.style.overflow = 'hidden';
    const done = () => this.setState({ busy: false });
    if (mode === 'expand') {
      this.setState({ ...this.reset(id), busy: true, ov: { clip: this.slicePoly(id) || this.dot(), tf: 'none', op: 1, cop: 0, trans: 'none' } }, () => raf(() => {
        this.setState({ ov: { clip: this.full(), tf: 'none', op: 1, cop: 0, trans: 'clip-path ' + d + 'ms ' + EASE } });
        setTimeout(() => this.setState(s => ({ ov: { ...s.ov, cop: 1 } })), d * 0.75);
        setTimeout(() => { this.setState(s => ({ ov: { ...s.ov, clip: 'none', trans: 'none' } })); done(); }, d + 60);
      }));
    } else if (mode === 'zoom') {
      const origin = this.homeOriginFor(id);
      this.setState({ ...this.reset(id), busy: true, home: { tf: 'none', origin, op: 1, filter: 'none', trans: 'none' }, ov: { clip: 'none', tf: 'scale(1.06)', op: 0, cop: 1, trans: 'none' } }, () => raf(() => {
        this.setState({ home: { tf: 'scale(4.5)', origin, op: 0, filter: 'blur(6px)', trans: 'transform ' + d + 'ms cubic-bezier(.6,0,.3,1), opacity ' + d * 0.7 + 'ms ease ' + d * 0.3 + 'ms, filter ' + d + 'ms' } });
        setTimeout(() => this.setState({ ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'opacity ' + d * 0.5 + 'ms ease, transform ' + d * 0.6 + 'ms cubic-bezier(.2,.8,.2,1)' } }), d * 0.55);
        setTimeout(done, d * 1.2);
      }));
    } else {
      const origin = '50% ' + (scrollY + innerHeight / 2) + 'px';
      this.setState({ ...this.reset(id), busy: true, home: { ...IDLE, origin }, ov: { clip: 'none', tf: 'translateY(100%)', op: 1, cop: 1, trans: 'none' } }, () => raf(() => {
        this.setState({ home: { tf: 'scale(.93)', origin, op: 1, filter: 'brightness(.4)', trans: 'transform ' + d + 'ms ' + EASE + ', filter ' + d + 'ms' }, ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'transform ' + d + 'ms ' + EASE } });
        setTimeout(done, d + 40);
      }));
    }
  }
  close() {
    const id = this.state.active; if (!id || this.state.busy) return;
    const d = this.dur(), mode = this.mode();
    const finish = () => { document.body.style.overflow = ''; this.setState({ active: null, ov: null, busy: false, home: IDLE, hover: null }); };
    this.setState({ busy: true });
    if (mode === 'expand') {
      this.setState(s => ({ home: IDLE, ov: { ...s.ov, clip: this.full(), cop: 0, trans: 'none' } }));
      setTimeout(() => {
        this.ensurePyrVisible();
        requestAnimationFrame(() => {
          this.setState(s => ({ ov: { ...s.ov, clip: this.slicePoly(id) || this.dot(), trans: 'clip-path ' + d + 'ms ' + EASE } }));
          setTimeout(finish, d + 60);
        });
      }, 300);
    } else if (mode === 'zoom') {
      this.setState(s => ({ ov: { ...s.ov, op: 0, tf: 'scale(1.06)', trans: 'opacity ' + d * 0.4 + 'ms ease, transform ' + d * 0.4 + 'ms ease' } }));
      setTimeout(() => {
        this.ensurePyrVisible();
        requestAnimationFrame(() => {
          const origin = this.homeOriginFor(id);
          this.setState({ home: { tf: 'scale(4.5)', origin, op: 0, filter: 'blur(6px)', trans: 'none' } }, () => requestAnimationFrame(() => requestAnimationFrame(() => {
            this.setState({ home: { tf: 'none', origin, op: 1, filter: 'none', trans: 'transform ' + d + 'ms cubic-bezier(.2,.7,.2,1), opacity ' + d * 0.5 + 'ms ease, filter ' + d + 'ms' } });
            setTimeout(finish, d + 40);
          })));
        });
      }, d * 0.4);
    } else {
      this.setState(s => ({ home: { ...s.home, tf: 'none', filter: 'none' }, ov: { ...s.ov, tf: 'translateY(100%)', trans: 'transform ' + d + 'ms ' + EASE } }));
      setTimeout(finish, d + 40);
    }
  }
  switchTo(id) {
    if (id === this.state.active || this.state.swap) return;
    this.setState({ swap: true });
    setTimeout(() => {
      this.setState({ ...this.reset(id) });
      if (this.scrollRef.current) this.scrollRef.current.scrollTop = 0;
      requestAnimationFrame(() => this.setState({ swap: false }));
    }, 300);
  }
  goSec(k) {
    const c = this.scrollRef.current, el = c && c.querySelector('#sec-' + k);
    if (el) c.scrollTo({ top: el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 104, behavior: 'smooth' });
  }
  onScroll = () => {
    const c = this.scrollRef.current; if (!c) return;
    const top = c.getBoundingClientRect().top; let cur = 'overview';
    for (const [k] of SECS) { const el = c.querySelector('#sec-' + k); if (el && el.getBoundingClientRect().top - top < 220) cur = k; }
    if (cur !== this.state.sec) this.setState({ sec: cur });
  };
  renderVals() {
    const s = this.state, tiltOn = this.props.tilt ?? true, hv = s.hover;
    const sl = {}, labels = [];
    ORDER.forEach((id, i) => {
      const pr = P[id], on = hv === id, dim = hv && !on;
      const row = id === 'academy' ? 0 : id === 'club' ? 1 : 2, delay = s.introDone ? 0 : (2 - row) * 0.14 + (id === 'futures' ? 0.06 : 0);
      sl[id] = {
        fill: on ? 'url(#uaFill)' : 'url(#uaRest)',
        stroke: on ? ACC : s.focus === id ? 'rgba(120,183,179,.75)' : 'rgba(120,183,179,.5)',
        op: !s.intro ? 0 : dim ? 0.45 : 1,
        tf: !s.intro ? 'translateY(40px)' : on ? 'translateY(-8px)' : 'none',
        trans: 'transform .55s cubic-bezier(.2,.8,.2,1) ' + delay + 's, opacity .5s ' + delay + 's, fill .25s, stroke .25s',
        enter: () => this.setState({ hover: id, focus: id }),
        leave: () => this.setState({ hover: null }),
        open: () => this.open(id)
      };
      labels.push({ name: pr.name, ages: pr.ages, kicker: pr.kicker, x: pr.lx, y: pr.ly, fs: pr.fs, kickerColor: on ? ACC : 'var(--color-accent-300)', lift: on ? 'translateY(-8px)' : '', op: !s.intro ? 0 : dim ? 0.45 : 1 });
    });
    const rows = ORDER.map(id => {
      const pr = P[id], f = s.focus === id;
      return { num: pr.num, name: pr.name, line: pr.line + ' · ' + money(pr.cost) + (pr.unit === 'per year' ? '/yr' : '/season'), ages: pr.ages, bg: f ? 'rgba(120,183,179,.08)' : 'transparent', numColor: f ? ACC : 'var(--color-neutral-500)', arrowColor: f ? ACC : 'var(--color-neutral-500)', arrowTf: f ? 'translateX(4px)' : 'none', enter: () => this.setState({ hover: id, focus: id }), leave: () => this.setState({ hover: null }), open: () => this.open(id) };
    });
    const id = s.active || 'academy', base = P[id];
    const grp = base.groups ? (base.groups[s.grp] || base.groups[0]) : null;
    const pr = grp ? { ...base, ...grp } : base;
    const stat = g => [{ k: 'Ages', v: g.ages }, { k: 'Competes in', v: g.line }, { k: 'Investment', v: money(g.cost) + (base.unit === 'per year' ? ' / year' : ' / season') }, { k: 'Training', v: g.commit }];
    const statRows = base.groups ? base.groups.map(g => ({ label: g.glabel, hasLabel: true, stats: stat(g) })) : [{ label: '', hasLabel: false, stats: stat(base) }];
    const groupTabs = (base.groups || []).map((g, i) => { const on = (s.grp || 0) === i; return { label: g.glabel, border: on ? ACC : 'var(--color-divider)', bg: on ? 'rgba(120,183,179,.12)' : 'rgba(27,29,36,.7)', fg: on ? ACC : 'var(--color-neutral-300)', pick: () => this.setState({ grp: i }) }; });
    const p = {
      ...pr, hasImg: !!pr.img, noImg: !pr.img, bgImg: pr.img ? 'url("' + pr.img + '")' : 'none',
      stats: [{ k: 'Ages', v: pr.ages }, { k: 'Competes in', v: pr.line }, { k: 'Investment', v: money(pr.cost) + (pr.unit === 'per year' ? ' / year' : ' / season') }, { k: 'Training', v: pr.commit }],
      leagues: pr.leagues.map(l => ({ ...l, hasLogo: !!l.logo, logoBg: l.logo ? 'url("' + l.logo + '")' : 'none', lwPx: (l.lw || 0) + 'px', lhPx: (l.lh || 0) + 'px' })),
      forWho: pr.forWho.map((f, i) => ({ ...f, n: '0' + (i + 1) })),
      week: pr.week.map(d => ({ day: d.day, items: d.items.length ? d.items.map(it => ({ ...it, bg: it.k === 'm' ? 'var(--color-accent-700)' : 'rgba(120,183,179,.06)', fg: it.k === 'm' ? 'var(--color-accent-100)' : 'var(--color-text)', ring: it.k === 't' ? 'rgba(120,183,179,.55)' : 'transparent' })) : [{ t: '', label: 'Rest', bg: 'transparent', fg: 'var(--color-neutral-600)', ring: 'rgba(233,233,237,.06)' }] }))
    };
    const rng = ph => MONTHS[ph.a] + (ph.b - ph.a > 1 ? ' – ' + MONTHS[ph.b - 1] : '');
    const phases = pr.phases.map((ph, i) => ({ ...ph, range: rng(ph), left: (ph.a / 12 * 100) + '%', width: ((ph.b - ph.a) / 12 * 100) + '%', bg: s.phase === i ? 'rgba(120,183,179,.18)' : 'var(--color-surface)', border: s.phase === i ? ACC : 'transparent', fg: s.phase === i ? 'var(--color-accent-200)' : 'var(--color-neutral-300)', pick: () => this.setState({ phase: i }) }));
    const sel = pr.phases[s.phase] || pr.phases[0];
    const sessions = pr.sessions.map((t, i) => ({ ...t, bg: s.sess === i ? 'rgba(120,183,179,.1)' : 'var(--color-bg)', ring: s.sess === i ? ACC : 'var(--color-divider)', fg: s.sess === i ? 'var(--color-accent-300)' : 'var(--color-text)', pick: () => this.setState({ sess: i }) }));
    const split = s.bill === 'split';
    const ovOn = !!s.ov;
    const mini = {}; ORDER.forEach(k => { mini[k] = k === id ? ACC : 'rgba(233,233,237,.22)'; });
    const glowId = hv || null;
    return {
      sl, labels, rows, p, phases, sessions, mini, groupTabs, hasGroups: groupTabs.length > 0, statRows, heroAges: base.ages, isAcademy: id === 'academy',
      glowPts: (glowId ? PTS[glowId] : PTS.academy).map(q => q.join(',')).join(' '), glowOp: glowId ? 0.35 : 0,
      pyrHint: hv ? 'Click to open ' + P[hv].name : 'Hover a level · click to explore',
      tiltTf: tiltOn ? 'perspective(1400px) rotateY(' + (s.tilt.x * 14).toFixed(2) + 'deg) rotateX(' + (-s.tilt.y * 10).toFixed(2) + 'deg)' : 'none',
      heroBgTf: 'scale(1.04) translate(' + (s.tilt.x * -14).toFixed(1) + 'px,' + (s.tilt.y * -10).toFixed(1) + 'px)',
      glowTf: 'translate(' + (s.tilt.x * 40).toFixed(1) + 'px,' + (s.tilt.y * 40).toFixed(1) + 'px)',
      heroMove: e => { if (!tiltOn || s.active) return; const r = e.currentTarget.getBoundingClientRect(); this.setState({ tilt: { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 } }); },
      heroLeave: () => this.setState({ tilt: { x: 0, y: 0 }, hover: null }),
      homeRef: this.homeRef, homeTf: s.home.tf, homeOrigin: s.home.origin, homeOp: s.home.op, homeFilter: s.home.filter, homeTrans: s.home.trans,
      openAcademy: () => this.open('academy'),
      videos: VIDS.map(v => ({ ...v, bgImg: 'url("' + v.img + '")' })),
      _videosOld: [
        { title: 'Inside Utah Athletic — Episode 2', len: '05:56', img: YT('t9Se3i_CBwo'), url: 'https://www.youtube.com/watch?v=t9Se3i_CBwo' },
        { title: 'Inside Utah Athletic — Episode 1', len: '07:36', img: YT('jJI_pFfA_xI'), url: 'https://www.youtube.com/watch?v=jJI_pFfA_xI' },
        { title: 'Utah Athletic Docuseries — Teaser', len: '00:28', img: YT('47JdWoQT9Lo'), url: 'https://www.youtube.com/watch?v=47JdWoQT9Lo' }],
      modes: MODES.map(([k, label]) => { const on = this.mode() === k; return { label, border: on ? ACC : 'transparent', bg: on ? 'rgba(120,183,179,.1)' : 'transparent', fg: on ? ACC : 'var(--color-neutral-300)', pick: () => this.setState({ mode: k }) }; }),
      dockOp: ovOn ? 0 : 1, dockPe: ovOn ? 'none' : 'auto',
      ovOn, ov: s.ov || { clip: 'none', tf: 'none', op: 0, cop: 0, trans: 'none' },
      scrollRef: this.scrollRef, onOvScroll: this.onScroll,
      close: () => this.close(),
      switcher: ORDER.map(k => { const on = k === id; return { name: P[k].name, border: on ? ACC : 'transparent', bg: on ? 'rgba(120,183,179,.1)' : 'transparent', fg: on ? ACC : 'var(--color-neutral-300)', go: () => this.switchTo(k) }; }),
      goJoin: () => this.goSec('join'),
      contentTf: s.swap ? 'translateY(24px)' : 'none', contentOp: s.swap ? 0 : 1,
      secs: SECS.map(([k, label]) => ({ label, fg: s.sec === k ? 'var(--color-text)' : 'var(--color-neutral-500)', bar: s.sec === k ? ACC : 'transparent', go: () => this.goSec(k) })),
      months: MONTHS,
      phaseSel: { ...sel, range: rng(sel) },
      billFull: () => this.setState({ bill: 'full' }), billSplit: () => this.setState({ bill: 'split' }),
      billFullFg: split ? 'var(--color-neutral-400)' : ACC, billFullRing: split ? 'transparent' : ACC,
      billSplitFg: split ? ACC : 'var(--color-neutral-400)', billSplitRing: split ? ACC : 'transparent',
      price: split ? money(pr.cost / pr.installs) : money(pr.cost),
      priceUnit: split ? '× ' + pr.installs + ' payments' : pr.unit,
      tabA: () => this.setState({ tab: 'a', sent: false }), tabB: () => this.setState({ tab: 'b', sent: false }),
      tabAFg: s.tab === 'a' ? 'var(--color-text)' : 'var(--color-neutral-500)', tabABar: s.tab === 'a' ? ACC : 'var(--color-divider)',
      tabBFg: s.tab === 'b' ? 'var(--color-text)' : 'var(--color-neutral-500)', tabBBar: s.tab === 'b' ? ACC : 'var(--color-divider)',
      showSuccess: s.sent, showReg: !s.sent && s.tab === 'a', showInfo: !s.sent && s.tab === 'b',
      sessionPick: (pr.sessions[s.sess] || pr.sessions[0]).date,
      submit: e => { e.preventDefault(); this.setState({ sent: true }); },
      resetForm: () => this.setState({ sent: false }),
      successHead: s.tab === 'a' ? (pr.cta === 'Register' ? "You're registered." : "You're on the list.") : 'Message received.',
      successCopy: s.tab === 'a' ? 'Confirmation for ' + (pr.sessions[s.sess] || pr.sessions[0]).date + ' is on its way to your inbox.' : 'A ' + pr.name + ' director will reply within 48 hours.',
      mapSrc: 'Utah Map.html?p=' + id,
      hasTeams: !!base.teams, noTeams: !base.teams,
      teamTabs: TEAMS.map((t, i) => { const on = (s.team || 0) === i; return { label: t.label, sub: t.league === 'Elite Academy League' ? 'EA' : t.league === 'RED X-League' ? 'X-League' : 'ECNL', border: on ? ACC : 'var(--color-divider)', bg: on ? 'rgba(120,183,179,.12)' : 'transparent', fg: on ? ACC : 'var(--color-text)', pick: () => this.pickTeam(i) }; }),
      team: TEAMS[s.team || 0],
      rosterOp: s.rosterFade ? 0 : 1, rosterTf: s.rosterFade ? 'translateY(10px)' : 'none',
      posGroups: LINES.map(([k, label]) => { const ps = TEAMS[s.team || 0].players.filter(q => q.line === k); return { label, count: String(ps.length), players: ps.map(q => ({ ...q, open: () => this.openPlayer(q.idx) })) }; }),
      mOn: !!base.teams && s.player != null,
      m: (() => { const t = TEAMS[s.team || 0], q = t.players[s.player || 0]; return { ...q, teamLabel: t.label + ' · ' + t.league, stats: q.stats.map(([k, v], i) => ({ k, v: String(v), color: i >= 2 && i <= 3 ? ACC : 'var(--color-text)' })) }; })(),
      mOp: s.mIn ? 1 : 0, mTf: s.mIn ? 'none' : 'translateY(24px) scale(.98)',
      mClose: () => this.closePlayer(), mPrev: () => this.stepPlayer(-1), mNext: () => this.stepPlayer(1), stop: e => e.stopPropagation(),
      others: ORDER.filter(k => k !== id).map(k => ({ num: P[k].num, name: P[k].name, ages: P[k].ages, line: P[k].line, go: () => this.switchTo(k) }))
    };
  }
}
