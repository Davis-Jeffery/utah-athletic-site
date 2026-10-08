
const MONTHS = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul'];
const R = (id, url) => (window.__resources && window.__resources[id]) || url;
const YT = id => R('yt-' + id, 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg');
const WEEK = rows => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => ({ day: d, items: rows[i] || [] }));
const T = (t, label) => ({ t, label, k: 't' }), M = (t, label) => ({ t, label, k: 'm' });
const PTS = {
  pro: [[300,0],[362.5,100],[237.5,100],[300,0]],
  academy: [[230,112],[370,112],[437.5,220],[162.5,220]],
  club: [[155,232],[445,232],[515,344],[85,344]],
  rec: [[77.5,356],[297,356],[297,480],[0,480]],
  futures: [[303,356],[522.5,356],[600,480],[303,480]]
};
const P = {
  academy: {
    num: '01', name: 'Academy', tier: 'Tier 01 · Elite platform', ages: 'U9–U18', kicker: 'Elite', lx: '50%', ly: '34.6%', fs: '22px',
    groups: [
      { glabel: 'U9–U11', ages: 'U9–U11', line: 'Highest Tier RED X-League Divisions', cost: 2700, commit: '3× / week', installs: 10 },
      { glabel: 'U12–U18', ages: 'U12–U18', line: 'ECNL · Elite Academy League', cost: 3400, commit: '4–5× / week', installs: 10 }],
    img: 'assets/academy-hero-team.png', line: 'ECNL · Elite Academy League',
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
    num: '02', name: 'Club', tier: 'Tier 02 · Competitive', ages: 'U9–U19', kicker: 'Competitive', lx: '50%', ly: '60%', fs: '30px',
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
    num: '03', name: 'Recreation', tier: 'Tier 03 · Community', ages: 'U5–U14', kicker: 'Community', lx: '28%', ly: '87.5%', fs: '24px',
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
    num: '04', name: 'Futures', tier: 'Tier 03 · Elevated rec', ages: 'U5–U8', kicker: 'Elevated rec', lx: '72%', ly: '87.5%', fs: '24px',
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
const SECS = [['overview', "Who it's for"], ['leagues', 'Leagues'], ['locations', 'Locations'], ['season', 'Season'], ['schedule', 'Schedule'], ['cost', 'Cost'], ['staff', 'Staff'], ['join', 'Join']];
const REGIONS = [['north', 'North', 'Salt Lake County'], ['south', 'South', 'Utah County'], ['west', 'West', 'West Utah County']];
const LEADS = (r, lbl) => [
  { role: 'Managing Director', name: 'Director Name', scope: lbl + ' region · all programs', email: r + '@utahathletic.com' },
  { role: 'Director of Coaching', name: 'Director Name', scope: lbl + ' region · coaching & curriculum', email: 'coaching.' + r + '@utahathletic.com' }].map(l => ({ ...l, mail: 'mailto:' + l.email }));
const REC_RG = { north: { status: 'soon', season: 'Spring 2027', hub: 'Draper / Sandy' }, south: { status: 'none' }, west: { status: 'active', hub: 'Saratoga Springs / Lehi', fee: 0 } };
const RG = {
  academy: { north: { status: 'active', hub: 'Murray' }, south: { status: 'active', hub: 'Orem' }, west: { status: 'soon', season: 'Fall 2027', hub: 'Saratoga Springs' } },
  club: { north: { status: 'active', hub: 'Draper / Sandy', fee: 100 }, south: { status: 'active', hub: 'Orem', fee: 0 }, west: { status: 'active', hub: 'Saratoga Springs', fee: -50 } },
  rec: REC_RG, futures: REC_RG
};
const DEV = {
  academy: [['Technical', 'Speed of execution under pressure — first touch, passing range and 1v1 mastery.'], ['Tactical', 'One game model from U9 to U18: positional play, pressing and transitions.'], ['Physical', 'Periodized strength, speed and load monitoring, managed by age and stage.'], ['Mental', 'Competitive habits, resilience and decision-making, reviewed in individual plans.']],
  club: [['Technical', 'Ball mastery and passing quality built in every session.'], ['Tactical', 'The Academy game model, introduced at the right pace for each age.'], ['Physical', 'Age-appropriate athleticism, coordination and injury prevention.'], ['Mental', 'Confidence, effort and team habits that carry into Academy trials.']],
  rec: [['Technical', 'Lots of touches: dribbling, striking and receiving through games.'], ['Tactical', 'Simple principles — space, support and teamwork — in small-sided play.'], ['Physical', 'Agility, balance and coordination through fun movement.'], ['Mental', 'Enjoyment, confidence and good sporting behaviour.']],
  futures: [['Technical', 'Ball mastery first: hundreds of touches every session.'], ['Tactical', 'Play-based learning of space, direction and teammates.'], ['Physical', 'Fundamental movement — run, jump, balance, coordinate.'], ['Mental', 'Love of the game, focus and listening in a team setting.']]
};
const UPH = n => 'https://images.unsplash.com/photo-' + n + '?w=1200&q=70&auto=format&fit=crop';
const SP = { night: '1431324155629-1a6deb1dec8d', dribble: '1574629810360-7efbbe195018', youth: '1517466787929-bc90951d0974', strike: '1560272564-c83b66b1ad12', duel: '1606925797300-0b35e9d1794e', kids: '1526232761682-d26e03ac148e', train: '1600679472829-3044539ce8ed', tackle: '1553778263-73a83bab9b0c', rec: '1680024436315-fb06267264b2', fut: '1622659097509-4d56de14539e' };
const PICS = {
  academy: { who: ['youth', 'tackle', 'duel'], dev: ['dribble', 'night', 'strike', 'train'] },
  club: { who: ['tackle', 'train', 'dribble'], dev: ['duel', 'night', 'strike', 'youth'] },
  rec: { who: ['kids', 'rec', 'train'], dev: ['fut', 'dribble', 'kids', 'rec'] },
  futures: { who: ['fut', 'kids', 'rec'], dev: ['train', 'dribble', 'kids', 'fut'] }
};
const DEEP = {
  Technical: { icon: 'ph ph-soccer-ball', tag: 'The foundation', w: '100%', deep: 'Technique is the base everything else is built on. Every session starts with the ball, and every drill is run at game speed with an opponent close by.', focus: ['First touch and receiving on the half-turn', 'Passing range with both feet', '1v1 attacking and defending'] },
  Tactical: { icon: 'ph ph-strategy', tag: 'Reading the game', w: '86%', deep: 'Players learn one shared game model, so moving up an age group — or a level — means more detail, not a new system.', focus: ['Positional play and support angles', 'Pressing triggers and compactness', 'Transitions in both directions'] },
  Physical: { icon: 'ph ph-lightning', tag: 'The engine', w: '72%', deep: 'Physical work is planned around age and growth stage, so players get faster and stronger without overload.', focus: ['Speed, agility and change of direction', 'Age-appropriate strength', 'Load monitoring and injury prevention'] },
  Mental: { icon: 'ph ph-brain', tag: 'The finishing layer', w: '58%', deep: 'The top layer turns ability into performance: decisions under pressure, resilience after mistakes and the habits of a professional.', focus: ['Decision-making under pressure', 'Resilience and composure', 'Ownership of an individual development plan'] }
};
const FOR_ICONS = {
  academy: ['ph ph-fire', 'ph ph-trophy', 'ph ph-clipboard-text', 'ph ph-users-three'],
  club: ['ph ph-soccer-ball', 'ph ph-trend-up', 'ph ph-scales', 'ph ph-users-three'],
  rec: ['ph ph-hand-waving', 'ph ph-calendar-check', 'ph ph-sneaker-move', 'ph ph-users-three'],
  futures: ['ph ph-baby', 'ph ph-plus-circle', 'ph ph-puzzle-piece', 'ph ph-rocket-launch']
};
const CMP_COLS = ['futures', 'rec', 'club', 'academy'];
const CMP = [
  ['Training sessions / week', '2×', '1×', '3×', '4–5×'],
  ['Licensed professional coaching', 'Licensed UA coaches', 'Volunteer coaches', 'Licensed UA coaches', 'Licensed UA coaches'],
  ['Competition', 'UA Rec League', 'UA Rec League', 'USYS · State Cup', 'ECNL · EA · X-League'],
  ['Year-round program', 'n', 'n', 'Tryouts & team placement every May', 'Tryouts & team placement every May'],
  ['Player evaluations', 'Progress card', 'n', 'Seasonal', 'Individual plan'],
  ['Strength & conditioning', 'n', 'n', 'n', '1× / week, year-round'],
  ['Film & video review', 'n', 'n', 'n', '2× / month'],
  ['Mental performance seminars', 'n', 'n', 'n', '2× / month'],
  ['Next step on the pathway', 'Club', 'Club', 'Academy trials', 'Athletic Global']
];
const COLLAGE_IMGS = Array.from({ length: 20 }, (_, i) => 'assets/collage/c' + String(i + 1).padStart(2, '0') + '.jpg');
const COLLAGE_TILES = [['1 / 3', '1 / 3'], ['3 / 4', '1 / 2'], ['4 / 6', '1 / 2'], ['6 / 7', '1 / 3'], ['3 / 4', '2 / 4'], ['4 / 5', '2 / 3'], ['5 / 6', '2 / 4'], ['1 / 2', '3 / 4'], ['2 / 3', '3 / 4'], ['4 / 5', '3 / 4'], ['6 / 7', '3 / 4']];
const PATH = [['futures', 'Futures'], ['rec', 'Recreation'], ['club', 'Club'], ['academy', 'Academy'], ['pro', 'Professional']];
const EMPTY_RG = { label: '', area: '', title: '', kicker: '', hub: '', season: '', path: '', mapSrc: 'about:blank', leads: [], venues: [], line: '', fee: '', feeUnit: '', feeNote: '', contactNum: '', alts: [], toLine: '', msgHead: '', msgCopy: '' };
const PSTAT = {
  trial: { label: 'Accepting player trial applications', cta: 'Apply for a player trial' },
  tryouts: { label: 'Open tryouts', cta: 'Register for tryouts' }
};
const TRY_DATES = { academy: { next: 'May 2027', reg: 'Opens, Jan. 1, 2027', regShort: 'Jan. 1, 2027' }, club: { next: 'To be announced', reg: 'Opens May 2027', regShort: 'May 2027' } };
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
    if (!window.UA_TRYOUTS || !window.UA_EVENTS) this.tPoll = setInterval(() => { if (window.UA_TRYOUTS && window.UA_EVENTS) { clearInterval(this.tPoll); this.forceUpdate(); } }, 80);
    this.collageOrder = COLLAGE_TILES.map((_, i) => i).sort(() => Math.random() - .5); this.collageStep = 0;
    this.collageTimer = setInterval(() => { if (document.hidden) return; const t = this.collageOrder[this.collageStep++ % this.collageOrder.length]; this.setState(s => { const c = (s.collage || COLLAGE_TILES.map(() => 0)).slice(); c[t] = (c[t] + 1) % 3; return { collage: c }; }); }, 1700);
    setTimeout(() => this.setState({ intro: true }), 100);
    setTimeout(() => this.setState({ introDone: true }), 1400);
    const OK = ['north', 'south', 'west'];
    const q = new URLSearchParams(location.search).get('region'), ck = (document.cookie.match(/(?:^|; )ua_region=(\w+)/) || [])[1];
    const m = location.hash.match(/^#\/(academy|club|rec|futures)(?:\/(north|south|west))?/);
    const my = m && m[2] ? m[2] : OK.includes(q) ? q : OK.includes(ck) ? ck : null;
    if (my) this.remember(my);
    if (m) setTimeout(() => { this.open(m[1]); this.setState({ region: m[2] || null }); this.setHash(m[1], m[2] || null); }, 450);
    this.onKey = e => {
      if (this.state.devModal != null) { if (e.key === 'Escape') this.closeDev(); else if (e.key === 'ArrowRight') this.stepDev(1); else if (e.key === 'ArrowLeft') this.stepDev(-1); return; }
      if (this.state.player != null) { if (e.key === 'Escape') this.closePlayer(); else if (e.key === 'ArrowRight') this.stepPlayer(1); else if (e.key === 'ArrowLeft') this.stepPlayer(-1); return; }
      if (e.key === 'Escape' && this.state.active && !this.state.busy) this.close();
    };
    window.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() { clearInterval(this.tPoll); clearInterval(this.collageTimer); window.removeEventListener('keydown', this.onKey); document.body.style.overflow = ''; }
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
  openDev(i) {
    this.setState(st => ({ devModal: i, dIn: false, devHover: null, devBuilt: (st.devBuilt || []).includes(i) ? st.devBuilt : [...(st.devBuilt || []), i] }), () => requestAnimationFrame(() => requestAnimationFrame(() => this.setState({ dIn: true }))));
  }
  closeDev() { this.setState({ dIn: false }); setTimeout(() => this.setState({ devModal: null }), 240); }
  stepDev(dir) { const i = ((this.state.devModal || 0) + dir + 4) % 4; this.setState(st => ({ devModal: i, devBuilt: (st.devBuilt || []).includes(i) ? st.devBuilt : [...(st.devBuilt || []), i] })); }
  openPlayer(i) { this.setState({ player: i, mIn: false }, () => requestAnimationFrame(() => requestAnimationFrame(() => this.setState({ mIn: true })))); }
  closePlayer() { this.setState({ mIn: false }); setTimeout(() => this.setState({ player: null }), 220); }
  stepPlayer(dir) { const n = TEAMS[this.state.team || 0].players.length; this.setState(s => ({ player: (s.player + dir + n) % n })); }
  pickTeam(i) { if (i === this.state.team) return; this.setState({ rosterFade: true }); setTimeout(() => this.setState({ team: i, rosterFade: false }), 180); }
  reset(id) { return { devOpen: null, devBuilt: [], devModal: null, devHover: null, region: this.state.myRegion || null, regMenu: false, msgSent: false, copied: false, rFade: false, team: 0, player: null, rosterFade: false, grp: 0, active: id, focus: id, hover: null, phase: 0, sess: 0, tab: 'a', sent: false, bill: 'full', sec: 'overview', tilt: { x: 0, y: 0 } }; }
  remember(r) {
    try { document.cookie = 'ua_region=' + (r || '') + ';path=/;max-age=' + (r ? 31536000 : 0); } catch (e) {}
    this.setState({ myRegion: r });
  }
  setHash(id, r) { try { history.replaceState(null, '', location.pathname + location.search + (id ? '#/' + id + (r ? '/' + r : '') : '')); } catch (e) {} }
  setRegion(r) {
    if (r === this.state.region) { this.setState({ regMenu: false }); return; }
    this.setState({ region: r, sent: false, msgSent: false, sess: 0, tab: 'a', regMenu: false, rFade: true });
    if (r) this.remember(r);
    this.setHash(this.state.active, r);
    requestAnimationFrame(() => {
      const c = this.scrollRef.current, hero = c && c.querySelector('#ovhero');
      if (hero) { const top = hero.getBoundingClientRect().bottom - c.getBoundingClientRect().top + c.scrollTop - 57; if (c.scrollTop > top) c.scrollTo({ top, behavior: 'smooth' }); }
      setTimeout(() => this.setState({ rFade: false }), 60);
    });
  }
  goNetwork() {
    if (this.state.busy) return;
    const origin = this.homeOriginFor('pro');
    window.addEventListener('pageshow', () => this.setState({ home: IDLE, busy: false, hover: null }), { once: true });
    this.setState({ busy: true, home: { tf: 'none', origin, op: 1, filter: 'none', trans: 'none' } }, () => requestAnimationFrame(() => requestAnimationFrame(() => {
      this.setState({ home: { tf: 'scale(4.5)', origin, op: 0, filter: 'blur(6px)', trans: 'transform 700ms cubic-bezier(.6,0,.3,1), opacity 500ms ease 200ms, filter 700ms' } });
      setTimeout(() => { location.href = 'Athletic Network.dc.html'; }, 660);
    })));
  }
  open(id) {
    if (this.state.active || this.state.busy) return;
    this.setHash(id, this.state.myRegion || null);
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
    const finish = () => { document.body.style.overflow = ''; this.setHash(null); this.setState({ active: null, ov: null, busy: false, home: IDLE, hover: null }); };
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
      this.setHash(id, this.state.myRegion || null);
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
    const pOn = hv === 'pro', pDim = hv && !pOn, pDelay = s.introDone ? 0 : 0.42;
    const proSl = {
      fill: pOn ? 'url(#uaFill)' : 'url(#uaPro)', stroke: pOn ? ACC : 'rgba(120,183,179,.85)',
      op: !s.intro ? 0 : pDim ? 0.45 : 1, tf: !s.intro ? 'translateY(40px)' : pOn ? 'translateY(-8px)' : 'none',
      trans: 'transform .55s cubic-bezier(.2,.8,.2,1) ' + pDelay + 's, opacity .5s ' + pDelay + 's, fill .25s, stroke .25s',
      enter: () => this.setState({ hover: 'pro', focus: 'pro' }), leave: () => this.setState({ hover: null }), open: () => this.goNetwork()
    };
    const proLab = { op: !s.intro ? 0 : pDim ? 0.45 : 1, lift: pOn ? 'translateY(-8px)' : '', kc: pOn ? ACC : 'var(--color-accent-300)' };
    const pf = s.focus === 'pro';
    const proRow = { bg: pf ? 'rgba(120,183,179,.08)' : 'transparent', numColor: pf ? ACC : 'var(--color-neutral-500)', arrowColor: pf ? ACC : 'var(--color-neutral-500)', arrowTf: pf ? 'translateX(4px)' : 'none' };
    const rows = ORDER.map(id => {
      const pr = P[id], f = s.focus === id;
      return { num: pr.num, name: pr.name, line: id === 'academy' ? pr.line : pr.line + ' · ' + money(pr.cost) + (pr.unit === 'per year' ? '/yr' : '/season'), ages: pr.ages, bg: f ? 'rgba(120,183,179,.08)' : 'transparent', numColor: f ? ACC : 'var(--color-neutral-500)', arrowColor: f ? ACC : 'var(--color-neutral-500)', arrowTf: f ? 'translateX(4px)' : 'none', enter: () => this.setState({ hover: id, focus: id }), leave: () => this.setState({ hover: null }), open: () => this.open(id) };
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
      forWho: pr.forWho.map((f, i) => ({ ...f, n: '0' + (i + 1), icon: (FOR_ICONS[id] || [])[i] || 'ph ph-star' })),
      week: pr.week.map(d => ({ day: d.day, items: d.items.length ? d.items.map(it => ({ ...it, bg: it.k === 'm' ? 'var(--color-accent-700)' : 'rgba(120,183,179,.06)', fg: it.k === 'm' ? 'var(--color-accent-100)' : 'var(--color-text)', ring: it.k === 't' ? 'rgba(120,183,179,.55)' : 'transparent' })) : [{ t: '', label: 'Rest', bg: 'transparent', fg: 'var(--color-neutral-600)', ring: 'rgba(233,233,237,.06)' }] }))
    };
    const rng = ph => MONTHS[ph.a] + (ph.b - ph.a > 1 ? ' – ' + MONTHS[ph.b - 1] : '');
    const phases = pr.phases.map((ph, i) => ({ ...ph, range: rng(ph), left: (ph.a / 12 * 100) + '%', width: ((ph.b - ph.a) / 12 * 100) + '%', bg: s.phase === i ? 'rgba(120,183,179,.18)' : 'var(--color-surface)', border: s.phase === i ? ACC : 'transparent', fg: s.phase === i ? 'var(--color-accent-200)' : 'var(--color-neutral-300)', pick: () => this.setState({ phase: i }) }));
    const sel = pr.phases[s.phase] || pr.phases[0];
    const regHub = s.region && RG[id][s.region] && RG[id][s.region].hub;
    const sessions = pr.sessions.map((t, i) => ({ ...t, loc: regHub ? regHub : t.loc, bg: s.sess === i ? 'rgba(120,183,179,.1)' : 'var(--color-bg)', ring: s.sess === i ? ACC : 'var(--color-divider)', fg: s.sess === i ? 'var(--color-accent-300)' : 'var(--color-text)', pick: () => this.setState({ sess: i }) }));
    const split = s.bill === 'split';
    const ovOn = !!s.ov;
    const regKey = s.region, rd = regKey ? RG[id][regKey] : null, rm = regKey ? REGIONS.find(x => x[0] === regKey) : null;
    const stSub = r => r.status === 'active' ? r.hub : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered';
    const regionTabs = [[null, 'Overview', 'All regions'], ...REGIONS].map(([k, l, a]) => {
      const on = s.region === k, r = k ? RG[id][k] : null;
      return { label: l, sub: r ? stSub(r) : 'Every region', fg: on ? 'var(--color-text)' : 'var(--color-neutral-400)', subFg: on ? 'var(--color-neutral-300)' : 'var(--color-neutral-500)', bar: on ? ACC : 'transparent',
        dot: !r ? 'transparent' : r.status === 'active' ? ACC : 'transparent', ring: !r ? 'var(--color-neutral-500)' : r.status === 'none' ? 'var(--color-neutral-600)' : ACC, go: () => this.setRegion(k) };
    });
    const rg = rd ? {
      label: rm[1], area: rm[2], title: rm[1] + ' ' + base.name, kicker: rm[1] + ' region · ' + rm[2], hub: rd.hub || '', season: rd.season || '',
      path: '/' + id + '/' + regKey, mapSrc: 'Utah Map.html?p=' + id + '&r=' + regKey, leads: LEADS(regKey, rm[1]),
      venues: rd.hub ? [{ k: 'Training', name: rd.hub + ' Training Complex', city: rd.hub + ', UT', addr: 'Venue name and address to be supplied' }, { k: 'Tryouts', name: rd.hub + ' — Main Field', city: rd.hub + ', UT', addr: 'Venue name and address to be supplied' }] : [],
      line: rd.status === 'active' ? 'The same ' + base.name + ' program and standard, run locally from ' + rd.hub + '. Staff, venues, tryouts' + (id === 'academy' ? '' : ', fees') + ' and contacts below are specific to the ' + rm[1] + ' region.' : rd.status === 'soon' ? base.name + ' launches in the ' + rm[1] + ' region in ' + rd.season + '.' : 'This program does not run in the ' + rm[1] + ' region.',
      fee: base.cost ? money(base.cost + (rd.fee || 0)) : '', feeUnit: base.unit || 'per season', feeNote: base.costNote || '', contactNum: id === 'academy' ? '04' : '05',
      alts: REGIONS.filter(x => RG[id][x[0]].status === 'active').map(x => ({ label: x[1] + ' ' + base.name, hub: RG[id][x[0]].hub, go: () => this.setRegion(x[0]) })),
      toLine: 'Managing Director, ' + rm[1] + ' region · ' + regKey + '@utahathletic.com',
      msgHead: rd.status === 'soon' ? "You're on the list." : 'Message sent.', msgCopy: rd.status === 'soon' ? 'The ' + rm[1] + ' team will contact you first when ' + base.name + ' tryouts open.' : 'The ' + rm[1] + ' regional team will reply within 48 hours.'
    } : EMPTY_RG;
    const regionCards = REGIONS.map(([k, l, a]) => { const r = RG[id][k]; return {
      label: l, area: a, hub: r.hub || 'No hub in this region', statusLabel: r.status === 'active' ? 'Active' : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered',
      tagBg: r.status === 'active' ? 'rgba(120,183,179,.14)' : 'transparent', tagFg: r.status === 'none' ? 'var(--color-neutral-400)' : 'var(--color-accent-300)', tagRing: r.status === 'active' ? 'transparent' : r.status === 'soon' ? 'rgba(120,183,179,.5)' : 'var(--color-divider)',
      border: r.status === 'active' ? '1px solid var(--color-accent-800)' : r.status === 'soon' ? '1px dashed rgba(120,183,179,.6)' : '1px dashed var(--color-neutral-600)',
      cta: r.status === 'active' ? 'Open ' + l + ' ' + base.name + ' →' : r.status === 'soon' ? 'Register interest →' : 'See nearest hub →', go: () => this.setRegion(k) }; });
    const feeCards = REGIONS.map(([k, l, a]) => { const r = RG[id][k], act = r.status === 'active'; return { label: l, hub: r.hub || a, fee: act ? money(base.cost + (r.fee || 0)) : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered', unit: act ? (base.unit || 'per season') : '', feeFg: act ? ACC : 'var(--color-neutral-400)', fs: act ? '44px' : '22px', go: () => this.setRegion(k) }; });
    const myR = REGIONS.find(x => x[0] === s.myRegion);
    const stKey = id === 'academy' ? (this.props.academyStatus ?? 'trial') : id === 'club' ? (this.props.clubStatus ?? 'trial') : null;
    const isTrial = stKey === 'trial';
    const pstat = stKey ? { ...PSTAT[stKey], next: isTrial ? TRY_DATES[id].next : pr.sessions[0].date + ' · ' + pr.sessions[0].time, reg: isTrial ? TRY_DATES[id].reg : 'Open now' } : { label: '', cta: '', next: '', reg: '' };
    const mini = {}; ORDER.forEach(k => { mini[k] = k === id ? ACC : 'rgba(233,233,237,.22)'; });
    const glowId = hv || null;
    return {
      sl, labels, rows, proSl, proLab, proRow, p, phases, sessions, mini, groupTabs, hasGroups: groupTabs.length > 0, statRows, heroAges: base.ages, isAcademy: id === 'academy',
      glowPts: (glowId ? PTS[glowId] : PTS.academy).map(q => q.join(',')).join(' '), glowOp: glowId ? 0.35 : 0,
      pyrHint: hv === 'pro' ? 'Click to see where the pathway leads' : hv ? 'Click to open ' + P[hv].name : 'Hover a level · click to explore',
      tiltTf: tiltOn ? 'perspective(1400px) rotateY(' + (s.tilt.x * 14).toFixed(2) + 'deg) rotateX(' + (-s.tilt.y * 10).toFixed(2) + 'deg)' : 'none',
      collage: COLLAGE_TILES.map(([col, row], t) => { const cur = (s.collage || [])[t] || 0; return { col, row, layers: [0, 1, 2].map(k => { const on = k === cur; return { bg: 'url("' + COLLAGE_IMGS[(t + k * COLLAGE_TILES.length) % COLLAGE_IMGS.length] + '")', pos: 'center ' + (30 + (t * 7) % 30) + '%', op: on ? 1 : 0, tf: on ? 'scale(1.0)' : 'scale(1.08)' }; }) }; }),
      homeEvents: window.UA_EVENTS ? window.UA_EVENTS.all().map(e => { const k2 = e.status.key; return { name: e.name, dates: e.dates, location: e.location, url: e.url, mono: e.brand.mono, accent: e.brand.accent,
        panel: 'radial-gradient(ellipse at 30% 20%,' + e.brand.bg2 + ',' + e.brand.bg + ' 70%)', status: e.status.label,
        dot: k2 === 'open' ? '#78b7b3' : k2 === 'past' ? '#5f616b' : '#e9e9ed', badgeFg: k2 === 'open' ? '#d6f0ee' : k2 === 'past' ? '#8b8d98' : '#e9e9ed', ring: k2 === 'open' ? 'inset 0 0 0 1px #78b7b3' : 'inset 0 0 0 1px rgba(233,233,237,.25)' }; }) : [],
      tryoutsHref: 'Tryouts.dc.html?region=' + (s.region || 'north'),
      nearLabel: window.UA_TRYOUTS ? window.UA_TRYOUTS.REGIONS[s.region || 'north'].label + ' region' : '',
      nearYou: window.UA_TRYOUTS ? ['academy', 'club', 'rec', 'futures'].map(lv => { const T = window.UA_TRYOUTS, rk = s.region || 'north', n = T.nextFor(lv, rk);
        return { level: T.PROGRAMS[lv].name, kind: n.kind === 'season' ? 'Season sign-up' : n.kind === 'tryout' ? 'Next tryout' : 'Not yet posted', title: n.title, when: n.when, where: n.where, cta: n.kind === 'tryout' ? 'Register' : n.kind === 'season' ? 'Sign up' : n.cta, href: n.register || ('Tryouts.dc.html?region=' + rk + '&level=' + lv) }; }) : [],
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
      goJoin: () => { const r = s.region || s.myRegion || 'north', st = RG[id][r].status; if (s.region !== r) this.setRegion(r); setTimeout(() => this.goSec(st === 'active' ? 'rtry' : st === 'soon' ? 'rsoon' : 'rnone'), 380); },
      pstat, statusOn: !!stKey, statsOn: !stKey, agesNote: base.groups ? base.groups.map(g => g.glabel).join('  ·  ') : (base.line || ''),
      ctaLabel: stKey ? pstat.cta : p.cta,
      tryHead: isTrial ? 'Player trial application' : 'Next tryouts in ' + (rg.label || ''),
      tryCopy: isTrial ? 'Tryout registration opens ' + TRY_DATES[id].regShort + '. Until then, apply for a private trial with ' + (rg.label || '') + ' staff — we review every application.' : p.joinCopy,
      showTrial: !s.sent && isTrial, showRegForm: !s.sent && s.tab === 'a' && !isTrial,
      regionTabs, rg, regionCards, feeCards, inOverview: !regKey, inRegion: !!regKey,
      rActive: !!rd && rd.status === 'active', rSoon: !!rd && rd.status === 'soon', rNone: !!rd && rd.status === 'none', rFees: !!rd && rd.status === 'active' && id !== 'academy',
      academyFees: id === 'academy', regionalFees: id !== 'academy',
      dev: DEV[id].map(([t, d], i) => { const on = s.devOpen === i, built = (s.devBuilt || []).includes(i), dp = DEEP[t]; return { n: '0' + (i + 1), t, d, ...dp, id: 'ph-' + id + '-dev-' + i, src: UPH(SP[PICS[id].dev[i]]), ph: t + ' training photo',
        toggle: () => this.setState(st => ({ devOpen: st.devOpen === i ? null : i, devBuilt: (st.devBuilt || []).includes(i) ? st.devBuilt : [...(st.devBuilt || []), i] })),
        rows: on ? '1fr' : '0fr', op: on ? 1 : 0, tf: on ? 'none' : 'translateY(-10px)', chev: on ? 'rotate(45deg)' : 'none',
        ring: on ? '0 0 0 1px #78b7b3,0 16px 40px rgba(0,0,0,.4)' : 'var(--shadow-sm)', iconBg: built ? 'rgba(120,183,179,.18)' : 'transparent', iconFg: built ? ACC : 'var(--color-neutral-300)',
        blockBg: built ? 'linear-gradient(180deg,rgba(120,183,179,' + (on ? '.5' : '.32') + '),rgba(120,183,179,.12))' : 'transparent', blockRing: built ? 'inset 0 0 0 1px #78b7b3' + (on ? ',0 0 24px rgba(120,183,179,.35)' : '') : 'inset 0 0 0 1px rgba(233,233,237,.14)',
        blockFg: built ? 'var(--color-text)' : 'var(--color-neutral-500)', blockOp: built ? 1 : 0.55, blockTf: built ? 'none' : 'translateY(-18px) scale(.96)',
        ...(() => { const hv = s.devHover === i, ang = [-135, -45, 45, 135][i] * Math.PI / 180, cx = 50 + 43 * Math.cos(ang), cy = 50 + 43 * Math.sin(ang); return {
          cx: cx.toFixed(2), cy: cy.toFixed(2), x: cx.toFixed(2) + '%', y: cy.toFixed(2) + '%', lw: hv ? 1.6 : 1, lo: hv ? 0.9 : built ? 0.45 : 0.22,
          open: () => this.openDev(i), enter: () => this.setState({ devHover: i }), leave: () => this.setState({ devHover: null }),
          labOp: hv ? 1 : 0, labTy: hv ? '0' : '6px', chkOp: built ? 1 : 0,
          nodeBg: hv ? 'rgba(120,183,179,.28)' : built ? 'rgba(120,183,179,.16)' : 'rgba(27,29,36,.9)', nodeFg: hv || built ? '#b5e1dd' : 'var(--color-neutral-300)',
          nodeRing: hv ? '0 0 0 1px #78b7b3,0 0 0 8px rgba(120,183,179,.12),0 0 32px rgba(120,183,179,.45)' : '0 0 0 1px ' + (built ? '#78b7b3' : 'rgba(120,183,179,.45)') + ',0 12px 28px rgba(0,0,0,.45)',
          nodeTf: hv ? 'scale(1.14)' : 'none',
          legRing: hv || built ? '#78b7b3' : 'rgba(120,183,179,.35)', legFg: hv ? ACC : 'var(--color-text)', legArr: hv ? ACC : 'var(--color-neutral-500)', seen: built ? 'Explored ✓' : 'Explore →' }; })() }; }),
      build: (() => { const n = (s.devBuilt || []).length, done = n === 4; return { count: String(n), glow: String(0.06 + n * 0.05), headFg: done ? ACC : 'var(--color-text)',
        core: done ? 'A complete player' : 'The complete player', head: done ? 'A complete player.' : n === 0 ? 'Start with the foundation.' : (4 - n) + ' layer' + (n === 3 ? '' : 's') + ' to go.',
        sub: done ? 'Technical, tactical, physical and mental — developed together, at every level and in every region.' : 'Open each principle to add its layer. Together they build the complete player.' }; })(),
      whoPics: PICS[id].who.map((k, i) => ({ id: 'ph-' + id + '-who-' + i, src: UPH(SP[k]), flex: i === 0 ? '2 1 420px' : '1 1 240px', ph: 'Player action photo' })),
      pathSteps: PATH.map(([k, l], i) => { const on = k === id; return { label: l, arr: i ? '→' : '', bg: on ? 'rgba(120,183,179,.14)' : 'transparent', ring: on ? ACC : 'var(--color-divider)', fg: on ? ACC : 'var(--color-neutral-300)', sub: on ? 'You are here' : k === 'pro' ? 'Athletic Global' : '' }; }),
      ...(() => { const ci = CMP_COLS.indexOf(id), last = CMP.length - 1;
        const inc = CMP.filter(r => r[ci + 1] !== 'n').length;
        return {
          cmpGrid: 'minmax(200px,1.3fr) ' + CMP_COLS.map(k => k === id ? 'minmax(0,1.6fr)' : 'minmax(0,1fr)').join(' '),
          cmpCount: inc + ' of ' + CMP.length + ' included in ' + base.name,
          cmpCols: CMP_COLS.map(k => { const cur = k === id; return { name: P[k].name, ages: P[k].ages, tag: cur ? 'Viewing' : 'View →', cursor: cur ? 'default' : 'pointer',
            pad: cur ? '18px 16px 16px' : '12px 16px 14px', fs: cur ? '28px' : '18px', fg: cur ? 'var(--color-text)' : 'var(--color-neutral-300)',
            bg: cur ? 'linear-gradient(180deg,rgba(120,183,179,.22),rgba(120,183,179,.1))' : 'transparent', ring: cur ? 'inset 1px 0 0 #78b7b3,inset -1px 0 0 #78b7b3,inset 0 1px 0 #78b7b3' : 'none',
            tagBg: cur ? '#78b7b3' : 'transparent', tagFg: cur ? '#111318' : 'var(--color-accent-300)', go: () => { if (!cur) this.switchTo(k); } }; }),
          cmpRows: CMP.map((r, ri) => ({ label: r[0], cells: CMP_COLS.map((k, j) => { const v = r[j + 1], cur = k === id;
            return { txt: v === 'y' ? (cur ? 'Included' : '') : v === 'n' ? '—' : v, icon: v === 'y' ? 'ph ph-check-circle' : v === 'n' ? '' : (cur ? 'ph ph-check-circle' : ''),
              iconFg: cur ? '#78b7b3' : 'var(--color-accent-500)', fg: v === 'n' ? 'var(--color-neutral-600)' : cur ? 'var(--color-text)' : 'var(--color-neutral-400)', fs: cur ? '15px' : '13px',
              bg: cur ? 'rgba(120,183,179,.08)' : 'transparent', ring: cur ? 'inset 1px 0 0 #78b7b3,inset -1px 0 0 #78b7b3' + (ri === last ? ',inset 0 -1px 0 #78b7b3' : '') : 'none',
              rad: cur && ri === last ? '0 0 12px 12px' : '0' }; }) }))
        }; })(),
      contactHref: 'Contact Us.dc.html?region=' + (s.region || '') + '&program=' + id,
      whoImg: { id: 'ph-' + id + '-who-main', src: UPH(SP[PICS[id].who[0]]) },
      ...(() => { const T = window.UA_TRYOUTS, rk = regKey || s.region || 'north'; if (!T) return { rTryHas: false, rTryRows: [] };
        const P = T.PROGRAMS[id];
        let rows = [];
        if (P.kind === 'season') { const v = T.SEASON_VENUE[rk]; rows = T.SESSIONS.map(x => ({ title: x.name + ' · ' + x.span, when: 'Starts ' + T.fmtDate(x.start) + ' · ' + x.signup, where: T.VENUES[v].name, mapUrl: T.mapUrl(v), register: P.register, cta: 'Sign up' })); }
        else rows = T.events({ level: id, region: rk }).slice(0, 4).map(e => ({ title: e.age + ' · ' + e.gender, when: T.fmtDate(e.date) + ' · ' + e.time, where: e.venueName, mapUrl: e.mapUrl, register: e.register, cta: 'Register' }));
        return { rTryHas: rows.length > 0, rTryRows: rows, rTryLabel: P.kind === 'season' ? 'Season sign-up' : 'Posted tryout dates', rTryAll: 'Tryouts.dc.html?region=' + rk + '&level=' + id };
      })(),
      ctaImg: { id: 'ph-' + id + '-cta', src: UPH(SP[PICS[id].who[1]]) },
      core: { id: 'ph-' + id + '-core', src: UPH(SP[PICS[id].who[0]]) },
      dmOn: s.devModal != null, dmOp: s.dIn ? 1 : 0, dmTf: s.dIn ? 'none' : 'scale(.9) translateY(20px)', dmOrigin: '50% 60%',
      dm: (() => { const i = s.devModal || 0, row = DEV[id][i], t = row[0], dp = DEEP[t], pv = DEV[id][(i + 3) % 4][0], nx = DEV[id][(i + 1) % 4][0];
        return { n: '0' + (i + 1), t, d: row[1], ...dp, id: 'ph-' + id + '-dev-' + i, src: UPH(SP[PICS[id].dev[i]]), ph: t + ' training photo', prevT: pv, nextT: nx }; })(),
      dmClose: () => this.closeDev(), dmPrev: () => this.stepDev(-1), dmNext: () => this.stepDev(1),
      msgSent: !!s.msgSent, msgOpen: !s.msgSent,
      submitMsg: e => { e.preventDefault(); this.setState({ msgSent: true }); }, resetMsg: () => this.setState({ msgSent: false }),
      copyLabel: s.copied ? 'Copied ✓' : 'Copy link',
      copyLink: () => { try { navigator.clipboard.writeText(location.href).catch(() => {}); } catch (e) {} this.setState({ copied: true }); setTimeout(() => this.setState({ copied: false }), 1600); },
      myRegionLabel: myR ? myR[1] : 'Choose', myRegionDot: myR ? ACC : 'transparent', regMenuOn: !!s.regMenu,
      toggleRegMenu: () => this.setState(st => ({ regMenu: !st.regMenu })),
      regOpts: [...REGIONS.map(([k, l, a]) => ({ k, label: l, sub: a })), { k: null, label: 'All regions', sub: 'Clear my region' }].map(o => ({ ...o, fg: s.myRegion === o.k ? ACC : 'var(--color-text)', bg: s.myRegion === o.k ? 'rgba(120,183,179,.08)' : 'transparent', check: s.myRegion === o.k && o.k ? '✓' : '',
        pick: () => { if (o.k) this.remember(o.k); else this.remember(null); if (s.active) this.setRegion(o.k); else this.setState({ regMenu: false }); } })),
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
      successHead: isTrial ? 'Application received.' : s.tab === 'a' ? (pr.cta === 'Register' ? "You're registered." : "You're on the list.") : 'Message received.',
      successCopy: isTrial ? 'The ' + (rg.label || '') + ' Director of Coaching will review it and contact you to schedule a trial.' : s.tab === 'a' ? 'Confirmation for ' + (pr.sessions[s.sess] || pr.sessions[0]).date + ' is on its way to your inbox.' : 'A ' + pr.name + ' director will reply within 48 hours.',
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
