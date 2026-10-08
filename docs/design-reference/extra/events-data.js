// Event records — one per tournament. Add an event by adding a record; status is computed from the dates.
// Dates, venues, formats, colours and URLs are PLACEHOLDERS until the club supplies real details.
(function () {
  const EVENTS = [
    { id: 'copa', name: 'Copa Athletic', tagline: 'The club\'s flagship spring tournament', start: '2027-04-09', end: '2027-04-11', regOpen: '2026-09-15', regClose: '2027-03-15',
      location: 'Saratoga Springs, UT', format: '7v7 · 9v9 · 11v11', ages: 'U9–U19 · Boys & Girls', url: 'https://example.com/copa-athletic',
      brand: { bg: '#3b0d12', bg2: '#8c1c25', ink: '#f5e6c8', accent: '#e3b35a', mono: 'CA' } },
    { id: 'snl', name: 'Summer Night Lights', tagline: 'Evening matches under the lights', start: '2027-07-16', end: '2027-07-18', regOpen: '2027-01-15', regClose: '2027-06-20',
      location: 'Lehi, UT', format: '7v7 · 9v9', ages: 'U9–U14 · Boys & Girls', url: 'https://example.com/summer-night-lights',
      brand: { bg: '#0d1433', bg2: '#22306e', ink: '#f2f4ff', accent: '#f4d35e', mono: 'SNL' } },
    { id: 'pioneer', name: 'Pioneer Cup', tagline: 'A Utah summer tradition', start: '2026-07-24', end: '2026-07-26', regOpen: '2026-02-01', regClose: '2026-07-01',
      location: 'Orem, UT', format: '9v9 · 11v11', ages: 'U11–U19 · Boys & Girls', url: 'https://example.com/pioneer-cup',
      brand: { bg: '#3a1e10', bg2: '#8a4a26', ink: '#f3e6cf', accent: '#e9b77a', mono: 'PC' } },
    { id: 'chaos', name: 'Chaos Cup', tagline: 'Small-sided, fast and loud', start: '2026-11-13', end: '2026-11-15', regOpen: '2026-08-01', regClose: '2026-10-25',
      location: 'Murray, UT', format: '4v4 · 5v5', ages: 'U8–U16 · Boys & Girls', url: 'https://example.com/chaos-cup',
      brand: { bg: '#0b0c0e', bg2: '#1e2412', ink: '#f2ffe0', accent: '#c6f432', mono: 'CC' } }
  ];
  const day = iso => new Date(iso + 'T12:00:00');
  const statusOf = (e, now) => {
    now = now || new Date();
    if (now > day(e.end)) return { key: 'past', label: 'Past' };
    if (now < day(e.regOpen)) return { key: 'coming', label: 'Coming' };
    if (now <= day(e.regClose)) return { key: 'open', label: 'Registration open' };
    return { key: 'closed', label: 'Registration closed' };
  };
  const fmtRange = e => {
    const a = day(e.start), b = day(e.end), m = d => d.toLocaleDateString('en-US', { month: 'short' });
    return (m(a) === m(b) ? m(a) + ' ' + a.getDate() + '–' + b.getDate() : m(a) + ' ' + a.getDate() + ' – ' + m(b) + ' ' + b.getDate()) + ', ' + b.getFullYear();
  };
  const fmtDay = iso => day(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const all = () => EVENTS.map(e => ({ ...e, status: statusOf(e), dates: fmtRange(e) }))
    .sort((a, b) => ({ open: 0, coming: 1, closed: 2, past: 3 }[a.status.key] - { open: 0, coming: 1, closed: 2, past: 3 }[b.status.key]) || a.start.localeCompare(b.start));
  window.UA_EVENTS = { EVENTS, statusOf, fmtRange, fmtDay, all };
})();
