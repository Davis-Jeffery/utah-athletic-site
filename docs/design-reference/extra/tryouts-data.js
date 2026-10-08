// Single source of tryout + season data. Used by Tryouts page, program region tabs and home "Tryouts near you".
// All dates, venues and Ollie links below are PLACEHOLDERS until the club supplies the real schedule.
(function () {
  const REGIONS = {
    north: { label: 'North', area: 'Salt Lake County', md: 'Director Name', doc: 'Director Name', email: 'north@utahathletic.com' },
    south: { label: 'South', area: 'Utah County', md: 'Director Name', doc: 'Director Name', email: 'south@utahathletic.com' },
    west: { label: 'West', area: 'West Utah County', md: 'Director Name', doc: 'Director Name', email: 'west@utahathletic.com' }
  };
  const PROGRAMS = {
    academy: { name: 'Academy', kind: 'tryout', invite: true, register: 'https://ollie.example/utah-athletic/academy-tryouts', ages: 'U9–U18' },
    club: { name: 'Club', kind: 'tryout', invite: false, register: 'https://ollie.example/utah-athletic/club-tryouts', ages: 'U9–U19' },
    rec: { name: 'Recreation', kind: 'season', register: 'https://ollie.example/utah-athletic/rec-signup', ages: 'U5–U14' },
    futures: { name: 'Futures', kind: 'season', register: 'https://ollie.example/utah-athletic/futures-signup', ages: 'U5–U8' }
  };
  const VENUES = {
    'murray': { name: 'Murray Park — Field 3', addr: '296 E Murray Park Ave, Murray, UT' },
    'orem': { name: 'Orem Community Park — North Fields', addr: '600 S 400 E, Orem, UT' },
    'draper': { name: 'Draper Park — Fields 1–2', addr: '12500 S 1300 E, Draper, UT' },
    'saratoga': { name: 'Neptune Park — Main Field', addr: 'Saratoga Springs, UT' },
    'lehi': { name: 'Lehi Sports Park', addr: 'Lehi, UT' }
  };
  const mapUrl = v => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(VENUES[v].name + ', ' + VENUES[v].addr);
  // [level, region, venue, dayISO, time, ageGroup, gender]
  const RAW = [];
  const plan = [
    ['academy', 'north', 'murray', ['2027-05-10', '2027-05-11', '2027-05-12']],
    ['academy', 'south', 'orem', ['2027-05-13', '2027-05-14', '2027-05-15']],
    ['club', 'north', 'draper', ['2027-05-17', '2027-05-18', '2027-05-19']],
    ['club', 'south', 'orem', ['2027-05-20', '2027-05-21', '2027-05-22']],
    ['club', 'west', 'saratoga', ['2027-05-24', '2027-05-25', '2027-05-26']]
  ];
  const groups = [['U9–U11', '5:30 – 7:00 PM'], ['U12–U14', '6:00 – 7:30 PM'], ['U15–U18', '7:30 – 9:00 PM']];
  plan.forEach(([level, region, venue, days]) => groups.forEach(([age, time], gi) => ['Boys', 'Girls'].forEach((gender, k) => {
    RAW.push({ id: level + '-' + region + '-' + gi + '-' + k, level, region, venue, date: days[(gi + k) % days.length], time, age, gender });
  })));
  const EVENTS = RAW.sort((a, b) => a.date.localeCompare(b.date) || a.age.localeCompare(b.age)).map(e => ({
    ...e, venueName: VENUES[e.venue].name, venueAddr: VENUES[e.venue].addr, mapUrl: mapUrl(e.venue), register: PROGRAMS[e.level].register
  }));
  const SESSIONS = [
    { id: 's1', name: 'Session 1', span: 'Nov – Dec', start: '2026-11-07', signup: 'Sign-up open now' },
    { id: 's2', name: 'Session 2', span: 'Jan – Mar', start: '2027-01-09', signup: 'Sign-up opens Nov. 15' }
  ];
  const SEASON_VENUE = { north: 'lehi', south: 'lehi', west: 'saratoga' };
  const BRING = ['Cleats and shin guards', 'Water bottle', 'Ball (size by age group)', 'Light and dark shirt', 'Completed Ollie registration'];
  const fmtDate = iso => { const d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); };
  const events = (f) => EVENTS.filter(e => (!f.region || e.region === f.region) && (!f.level || e.level === f.level));
  const nextFor = (level, region) => {
    const p = PROGRAMS[level];
    if (p.kind === 'season') { const v = VENUES[SEASON_VENUE[region]]; return { kind: 'season', title: SESSIONS[0].name + ' · ' + SESSIONS[0].span, when: 'Starts ' + fmtDate(SESSIONS[0].start), where: v.name, register: p.register, cta: 'Sign up' }; }
    const e = events({ level, region })[0];
    if (!e) return { kind: 'none', title: 'No posted dates', when: p.invite ? 'Request an invitation to trial' : 'Dates to be announced', where: REGIONS[region].label + ' region', register: null, cta: p.invite ? 'Request invitation' : 'Get notified' };
    return { kind: 'tryout', title: e.age + ' ' + e.gender, when: fmtDate(e.date) + ' · ' + e.time, where: e.venueName, register: e.register, cta: 'Register' };
  };
  window.UA_TRYOUTS = { REGIONS, PROGRAMS, VENUES, EVENTS, SESSIONS, SEASON_VENUE, BRING, fmtDate, mapUrl, events, nextFor };
})();
