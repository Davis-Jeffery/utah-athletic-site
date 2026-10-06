// Utah Athletic site app: pyramid home, program overlays and page transitions.
// Ported from the Claude Design prototype (docs/design-reference). Content lives in src/data.
import React from 'react';
import { PROGRAMS as RAW_PROGRAMS, ORDER, MONTHS, PYRAMID_POINTS as PTS, VIDEOS as RAW_VIDEOS } from '../data/programs';
import RecFormats from './RecFormats.jsx';

let P = RAW_PROGRAMS;
let VIDS = RAW_VIDEOS;

// Swap image keys in the content files for optimized URLs passed in from Astro.
function resolveContent(assets = {}) {
  const u = (k) => (k && assets[k]) || k;
  P = Object.fromEntries(Object.entries(RAW_PROGRAMS).map(([k, v]) => [k, {
    ...v, img: u(v.img), leagues: v.leagues.map((l) => (l.logo ? { ...l, logo: u(l.logo) } : l))
  }]));
  VIDS = RAW_VIDEOS.map((v) => ({ ...v, img: u(v.img) }));
}

const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const FIRST = ['Mateo','Liam','Noah','Diego','Ethan','Lucas','Owen','Gabriel','Leo','Caleb','Isaac','Julian','Adrian','Eli','Miles','Santiago','Kai','Rowan','Jonah','Theo','Marco','Felix','Andrés','Sami','Tyler','Jude','Nico','Ezra','Bennett','Hugo'];
const LAST = ['Alvarez','Brooks','Castillo','Dawson','Ellis','Fuentes','Grant','Hale','Ibarra','Jensen','Kimura','Larsen','Morales','Nakamura','Okafor','Park','Quinn','Reyes','Sorensen','Torres','Vance','Walker','Young','Zamora'];
const LINES = [['GK', 'Goalkeepers'], ['DEF', 'Defenders'], ['MID', 'Midfielders'], ['FWD', 'Forwards']];
const POSN = { GK: ['Goalkeeper'], DEF: ['Center back', 'Right back', 'Left back', 'Center back'], MID: ['Holding mid', 'Central mid', 'Attacking mid'], FWD: ['Striker', 'Winger', 'Winger'] };
const OPP = ['Real Colorado', 'Utah Royals', 'Sporting AZ', 'Colorado Rapids', 'Las Vegas Sports', 'Albion SC', 'Phoenix Rising', 'Denver Surf'];
const TOWNS = ['Salt Lake City, UT', 'Sandy, UT', 'Draper, UT', 'Lehi, UT', 'Park City, UT', 'Provo, UT', 'Ogden, UT', 'Herriman, UT'];
const ASP_OLD = { GK: 'Command my box, earn a D1 scholarship, and one day keep goal in the pros.', DEF: 'Become the defender nobody wants to play against and earn a Youth National Team call-up.', MID: 'Control games from the middle and play college soccer at a top program.', FWD: 'Lead the ECNL in goals and sign a professional contract.' };
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
const SECS = [['overview', "Who it's for"], ['leagues', 'Leagues'], ['season', 'Season'], ['schedule', 'Schedule'], ['cost', 'Cost'], ['staff', 'Staff'], ['players', 'Players'], ['join', 'Join']];
const MODES = [['expand', 'Expand'], ['zoom', 'Zoom'], ['curtain', 'Curtain']];
const money = n => '$' + Math.round(n).toLocaleString('en-US');
const EASE = 'cubic-bezier(.76,0,.24,1)';
const ACC = '#78b7b3';
const IDLE = { tf: 'none', origin: '50% 50%', op: 1, filter: 'none', trans: 'none' };

export default class UAApp extends React.Component {
  static defaultProps = { transition: 'expand', speed: 1, tilt: true, initial: null, assets: {} };
  state = { hover: null, focus: 'academy', active: null, ov: null, home: IDLE, mode: null, busy: false, phase: 0, sess: 0, tab: 'a', sent: false, bill: 'full', sec: 'overview', tilt: { x: 0, y: 0 }, intro: false, introDone: false, swap: false };
  homeRef = React.createRef();
  scrollRef = React.createRef();
  constructor(props) {
    super(props);
    resolveContent(props.assets);
    if (props.initial && P[props.initial]) {
      Object.assign(this.state, this.reset(props.initial), {
        ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'none' }, intro: true, introDone: true
      });
    }
  }
  nav(path, replace) {
    if (this._silent || typeof history === 'undefined') return;
    if (location.pathname === path) return;
    history[replace ? 'replaceState' : 'pushState']({ ua: path }, '', path);
    const id = (path.match(/^\/programs\/(\w+)\/$/) || [])[1];
    document.title = id ? P[id].name + ' | Utah Athletic' : 'Utah Athletic Soccer Club';
  }
  silently(fn) { this._silent = true; try { fn(); } finally { this._silent = false; } }
  componentDidMount() {
    if (this.state.active) document.body.style.overflow = 'hidden';
    this.onPop = () => {
      const id = (location.pathname.match(/^\/programs\/(\w+)\/?$/) || [])[1];
      this.silently(() => {
        if (id && P[id]) { this.state.active ? this.switchTo(id) : this.open(id); }
        else if (this.state.active) this.close();
      });
    };
    window.addEventListener('popstate', this.onPop);
    setTimeout(() => this.setState({ intro: true }), 100);
    setTimeout(() => this.setState({ introDone: true }), 1400);
    this.onKey = e => {
      if (this.state.player != null) { if (e.key === 'Escape') this.closePlayer(); else if (e.key === 'ArrowRight') this.stepPlayer(1); else if (e.key === 'ArrowLeft') this.stepPlayer(-1); return; }
      if (e.key === 'Escape' && this.state.active && !this.state.busy) this.close();
    };
    window.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() { window.removeEventListener('keydown', this.onKey); window.removeEventListener('popstate', this.onPop); document.body.style.overflow = ''; }
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
    this.nav('/programs/' + id + '/');
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
    this.nav('/');
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
    this.nav('/programs/' + id + '/', true);
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
      sl, labels, rows, p, phases, sessions, mini, groupTabs, hasGroups: groupTabs.length > 0, statRows, heroAges: base.ages, isAcademy: id === 'academy', isRec: id === 'rec',
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

  render() {
    const A = this.props.assets;
    const V = this.renderVals();
    const { billFull, billFullFg, billFullRing, billSplit, billSplitFg, billSplitRing, close, contentOp, contentTf, dockOp, dockPe, glowOp, glowPts, glowTf, goJoin, groupTabs, hasGroups, hasTeams, heroAges, heroBgTf, heroLeave, heroMove, homeFilter, homeOp, homeOrigin, homeRef, homeTf, homeTrans, isAcademy, labels, mClose, mNext, mOn, mOp, mPrev, mTf, mini, modes, months, noTeams, onOvScroll, openAcademy, others, ov, ovOn, p, phaseSel, phases, posGroups, price, priceUnit, pyrHint, resetForm, rosterOp, rosterTf, rows, scrollRef, secs, sessionPick, sessions, showInfo, showReg, showSuccess, sl, statRows, stop, submit, successCopy, successHead, switcher, tabA, tabABar, tabAFg, tabB, tabBBar, tabBFg, team, teamTabs, tiltTf, videos } = V;
    return (
      <>
      <div style={{position: "relative", overflowX: "hidden", background: "var(--color-bg)", color: "var(--color-text)", fontFamily: "var(--font-body)"}}>
        <div ref={(homeRef)} style={{transform: (homeTf), transformOrigin: (homeOrigin), opacity: (homeOp), filter: (homeFilter), transition: (homeTrans)}}>
          <header style={{position: "sticky", top: "0", zIndex: "20", display: "flex", alignItems: "center", gap: "32px", padding: "14px clamp(20px,4vw,56px)", background: "rgba(17,19,24,.8)", backdropFilter: "blur(14px)"}}>
            <a href="#" style={{marginRight: "auto", display: "flex", alignItems: "center"}}>
              <img src={(A.logo)} alt="Utah Athletic" style={{height: "40px", width: "auto"}} />
            </a>
            <nav style={{display: "flex", gap: "26px", fontSize: "14px", flexWrap: "wrap"}}>
              <a href="#programs" style={{color: "var(--color-text)"}}>
                Programs
              </a>
              <a href="#inside" style={{color: "var(--color-neutral-400)"}}>
                Inside UA
              </a>
              <a href="#" style={{color: "var(--color-neutral-400)"}}>
                Staff
              </a>
              <a href="#" style={{color: "var(--color-neutral-400)"}}>
                Copa Athletic
              </a>
              <a href="#" style={{color: "var(--color-neutral-400)"}}>
                News
              </a>
            </nav>
            <button onClick={(openAcademy)} style={{cursor: "pointer", background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)", font: "500 14px/1 var(--font-body)", padding: "11px 16px", borderRadius: "8px"}} className="dc0">
              Tryouts 2026 →
            </button>
          </header>
          <div style={{height: "1px", background: "linear-gradient(to right,transparent,var(--color-divider) 48px,var(--color-divider) calc(100% - 48px),transparent)"}}>
          </div>
          <div style={{position: "relative", overflow: "hidden"}}>
            <div style={{position: "absolute", inset: "0", pointerEvents: "none"}}>
              <div style={{position: "absolute", inset: "-4%", backgroundImage: `url("${A.heroHome}")`, backgroundSize: "cover", backgroundPosition: "center 55%", filter: "grayscale(1) contrast(1.3) brightness(.85)", transform: (heroBgTf), transition: "transform .6s ease"}}>
              </div>
              <div style={{position: "absolute", inset: "0", background: "#78b7b3", mixBlendMode: "color", opacity: ".5"}}>
              </div>
              <div style={{position: "absolute", inset: "0", background: "linear-gradient(90deg,#111318 0%,rgba(17,19,24,.88) 30%,rgba(17,19,24,.35) 62%,rgba(17,19,24,.55) 100%)"}}>
              </div>
              <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(17,19,24,.6) 0%,transparent 25%,transparent 70%,#111318 100%)"}}>
              </div>
            </div>
            <section id="programs" onMouseMove={(heroMove)} onMouseLeave={(heroLeave)} style={{position: "relative", maxWidth: "1440px", margin: "0 auto", padding: "clamp(48px,7vw,104px) clamp(20px,4vw,56px) 72px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: "56px", alignItems: "center"}}>
              <div style={{position: "absolute", right: "8%", top: "18%", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle,rgba(120,183,179,.16),transparent 65%)", pointerEvents: "none", transform: (glowTf), transition: "transform .5s ease"}}>
              </div>
              <div style={{position: "relative", display: "flex", flexDirection: "column", gap: "26px"}}>
                <div style={{display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                  <span style={{width: "28px", height: "1px", background: "var(--color-accent)"}}>
                  </span>
                  The Utah Athletic pathway
                </div>
                <h1 style={{margin: "0", font: "500 clamp(54px,7.2vw,112px)/.94 var(--font-heading)", letterSpacing: "-.045em", textWrap: "balance"}}>
                  Every level.
                  <br />
                  <span style={{color: "#78b7b3"}}>
                    One standard.
                  </span>
                </h1>
                <p style={{margin: "0", maxWidth: "470px", fontSize: "17px", lineHeight: "1.6", color: "var(--color-neutral-300)", textWrap: "pretty"}}>
                  From a four-year-old's first touch to national-platform football. Choose a level to see who it's for, where it competes, what it costs, and how to join.
                </p>
                <div style={{display: "flex", flexDirection: "column", maxWidth: "520px"}}>
                  {(rows).map((r, r__i) => (
                    <React.Fragment key={r__i}>
                    <button onMouseEnter={(r.enter)} onMouseLeave={(r.leave)} onClick={(r.open)} style={{all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "36px 1fr auto", alignItems: "center", gap: "12px", padding: "15px 14px", borderRadius: "8px", background: (r.bg), transition: "background .25s"}}>
                      <span style={{fontSize: "12px", color: (r.numColor), fontVariantNumeric: "tabular-nums"}}>
                        {r.num}
                      </span>
                      <span style={{display: "flex", flexDirection: "column", gap: "3px"}}>
                        <span style={{font: "500 21px/1.1 var(--font-heading)", letterSpacing: "-.02em"}}>
                          {r.name}
                        </span>
                        <span style={{fontSize: "13px", color: "var(--color-neutral-500)"}}>
                          {r.line}
                        </span>
                      </span>
                      <span style={{fontSize: "13px", color: (r.arrowColor), transform: (r.arrowTf), transition: "all .25s"}}>
                        {r.ages} →
                      </span>
                    </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div style={{position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px"}}>
                <div style={{position: "absolute", left: "50%", top: "50%", width: "120%", height: "120%", transform: "translate(-50%,-50%)", background: "radial-gradient(ellipse at center,rgba(17,19,24,.85) 0%,rgba(17,19,24,.55) 40%,transparent 70%)", pointerEvents: "none"}}>
                </div>
                <div data-pyr="1" style={{position: "relative", width: "min(100%,600px)", aspectRatio: "600 / 480", filter: "drop-shadow(0 24px 48px rgba(0,0,0,.6))", transform: (tiltTf), transition: "transform .45s cubic-bezier(.2,.8,.2,1)"}}>
                  <svg viewBox={"0 0 600 480"} style={{position: "absolute", inset: "0", width: "100%", height: "100%", overflow: "visible"}}>
                    <defs>
                      <linearGradient id="uaFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#78b7b3" stopOpacity=".42" />
                        <stop offset="1" stopColor="#78b7b3" stopOpacity=".08" />
                      </linearGradient>
                      <linearGradient id="uaRest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#1b1d24" stopOpacity=".88" />
                        <stop offset="1" stopColor="#111318" stopOpacity=".82" />
                      </linearGradient>
                      <filter id="uaGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation={"9"} />
                      </filter>
                    </defs>
                    <polygon points="300,0 600,480 0,480" fill="#78b7b3" opacity=".22" filter="url(#uaGlow)" />
                    <polygon points={(glowPts)} fill="#78b7b3" opacity={(glowOp)} filter="url(#uaGlow)" style={{transition: "opacity .3s"}} />
                    <polygon points="300,0 393.75,150 206.25,150" onMouseEnter={(sl.academy.enter)} onMouseLeave={(sl.academy.leave)} onClick={(sl.academy.open)} fill={(sl.academy.fill)} stroke={(sl.academy.stroke)} strokeWidth="1.5" style={{cursor: "pointer", opacity: (sl.academy.op), transform: (sl.academy.tf), transition: (sl.academy.trans)}} />
                    <polygon points="196.9,165 403.1,165 496.9,315 103.1,315" onMouseEnter={(sl.club.enter)} onMouseLeave={(sl.club.leave)} onClick={(sl.club.open)} fill={(sl.club.fill)} stroke={(sl.club.stroke)} strokeWidth="1.5" style={{cursor: "pointer", opacity: (sl.club.op), transform: (sl.club.tf), transition: (sl.club.trans)}} />
                    <polygon points="93.75,330 297,330 297,480 0,480" onMouseEnter={(sl.rec.enter)} onMouseLeave={(sl.rec.leave)} onClick={(sl.rec.open)} fill={(sl.rec.fill)} stroke={(sl.rec.stroke)} strokeWidth="1.5" style={{cursor: "pointer", opacity: (sl.rec.op), transform: (sl.rec.tf), transition: (sl.rec.trans)}} />
                    <polygon points="303,330 506.25,330 600,480 303,480" onMouseEnter={(sl.futures.enter)} onMouseLeave={(sl.futures.leave)} onClick={(sl.futures.open)} fill={(sl.futures.fill)} stroke={(sl.futures.stroke)} strokeWidth="1.5" style={{cursor: "pointer", opacity: (sl.futures.op), transform: (sl.futures.tf), transition: (sl.futures.trans)}} />
                  </svg>
                  {(labels).map((l, l__i) => (
                    <React.Fragment key={l__i}>
                    <div style={{position: "absolute", left: (l.x), top: (l.y), transform: `translate(-50%,-50%) ${l.lift}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", pointerEvents: "none", textAlign: "center", whiteSpace: "nowrap", opacity: (l.op), transition: "transform .35s cubic-bezier(.2,.8,.2,1),opacity .5s"}}>
                      <span style={{fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: (l.kickerColor)}}>
                        {l.kicker}
                      </span>
                      <span style={{font: `500 ${l.fs}/1 var(--font-heading)`, letterSpacing: "-.03em", color: "var(--color-text)"}}>
                        {l.name}
                      </span>
                      <span style={{fontSize: "11px", color: "var(--color-neutral-300)"}}>
                        {l.ages}
                      </span>
                    </div>
                    </React.Fragment>
                  ))}
                </div>
                <div style={{position: "relative", fontSize: "12px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-300)"}}>
                  {pyrHint}
                </div>
              </div>
            </section>
          </div>
          <section id="inside" style={{maxWidth: "1440px", margin: "0 auto", padding: "48px clamp(20px,4vw,56px) 88px", display: "flex", flexDirection: "column", gap: "28px"}}>
            <div style={{height: "1px", background: "linear-gradient(to right,transparent,var(--color-divider) 48px,var(--color-divider) calc(100% - 48px),transparent)"}}>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: "20px", flexWrap: "wrap"}}>
              <h2 style={{margin: "0", font: "500 clamp(34px,4vw,56px)/1 var(--font-heading)", letterSpacing: "-.035em"}}>
                Inside Utah Athletic
              </h2>
              <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                The docuseries
              </span>
            </div>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "20px"}}>
              {(videos).map((v, v__i) => (
                <React.Fragment key={v__i}>
                <a href={(v.url)} target="_blank" style={{display: "flex", flexDirection: "column", gap: "12px", color: "var(--color-text)"}} className="dc1">
                  <div style={{position: "relative", aspectRatio: "16 / 9", borderRadius: "8px", overflow: "hidden", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)"}}>
                    <div style={{width: "100%", height: "100%", backgroundImage: (v.bgImg), backgroundSize: "cover", backgroundPosition: "center", filter: "saturate(.5) brightness(.85)", mixBlendMode: "lighten"}}>
                    </div>
                    <span style={{position: "absolute", left: "12px", bottom: "12px", fontSize: "12px", padding: "5px 9px", borderRadius: "6px", background: "rgba(17,19,24,.8)", color: "var(--color-text)"}}>
                      ▶ {v.len}
                    </span>
                  </div>
                  <span style={{font: "500 18px/1.25 var(--font-heading)", letterSpacing: "-.015em"}}>
                    {v.title}
                  </span>
                </a>
                </React.Fragment>
              ))}
            </div>
          </section>
          <section style={{maxWidth: "1440px", margin: "0 auto", padding: "0 clamp(20px,4vw,56px) 96px"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "20px", padding: "clamp(32px,5vw,64px)", borderRadius: "14px", background: "radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.18),transparent 60%),var(--color-surface)", boxShadow: "var(--shadow-sm)"}}>
              <h2 style={{margin: "0", font: "500 clamp(40px,6vw,88px)/.95 var(--font-heading)", letterSpacing: "-.045em"}}>
                Want to play for us?
              </h2>
              <p style={{margin: "0", maxWidth: "520px", fontSize: "17px", color: "var(--color-neutral-300)"}}>
                Request an invitation for a trial with Academy staff, or find the right level for your player.
              </p>
              <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                <button onClick={(openAcademy)} style={{cursor: "pointer", background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)", font: "500 15px/1 var(--font-body)", padding: "14px 20px", borderRadius: "8px"}} className="dc2">
                  Apply to Academy →
                </button>
                <a href="#programs" style={{border: "1px solid var(--color-divider)", color: "var(--color-text)", font: "500 15px/1 var(--font-body)", padding: "14px 20px", borderRadius: "8px"}}>
                  Explore all programs
                </a>
              </div>
            </div>
          </section>
          <footer style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap", padding: "28px clamp(20px,4vw,56px)", fontSize: "13px", color: "var(--color-neutral-500)"}}>
            <span>
              © 2026 Utah Athletic
            </span>
            <div style={{display: "flex", gap: "20px"}}>
              <a href="https://www.instagram.com/utahathletic.soccer/" style={{color: "var(--color-neutral-400)"}}>
                Instagram
              </a>
              <a href="https://www.linkedin.com/company/utahathletic/" style={{color: "var(--color-neutral-400)"}}>
                LinkedIn
              </a>
              <a href="#" style={{color: "var(--color-neutral-400)"}}>
                Facebook
              </a>
            </div>
          </footer>
        </div>
        <div style={{position: "fixed", left: "20px", bottom: "20px", zIndex: "50", display: "flex", alignItems: "center", gap: "4px", padding: "5px", borderRadius: "10px", background: "rgba(27,29,36,.92)", backdropFilter: "blur(10px)", boxShadow: "var(--shadow-md)", opacity: (dockOp), pointerEvents: (dockPe), transition: "opacity .3s", display: this.props.showModes ? "flex" : "none"}}>
          <span style={{fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-500)", padding: "0 8px"}}>
            Transition
          </span>
          {(modes).map((m, m__i) => (
            <React.Fragment key={m__i}>
            <button onClick={(m.pick)} style={{cursor: "pointer", border: `1px solid ${m.border}`, background: (m.bg), color: (m.fg), font: "500 13px/1 var(--font-body)", padding: "8px 12px", borderRadius: "7px"}}>
              {m.label}
            </button>
            </React.Fragment>
          ))}
        </div>
        {(ovOn) ? (
          <>
          <div style={{position: "fixed", inset: "0", zIndex: "100", background: "var(--color-accent-800)", clipPath: (ov.clip), transform: (ov.tf), opacity: (ov.op), transition: (ov.trans)}}>
            <div ref={(scrollRef)} onScroll={(onOvScroll)} style={{position: "absolute", inset: "0", overflowY: "auto", background: "var(--color-bg)", opacity: (ov.cop), transition: "opacity .35s ease"}}>
              <div style={{position: "sticky", top: "0", zIndex: "10", display: "flex", alignItems: "center", gap: "16px", padding: "10px clamp(16px,3vw,40px)", background: "rgba(17,19,24,.88)", backdropFilter: "blur(14px)", flexWrap: "wrap"}}>
                <button onClick={(close)} style={{display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: "transparent", border: "1px solid var(--color-divider)", color: "var(--color-text)", padding: "6px 14px 6px 8px", borderRadius: "8px", font: "500 14px/1 var(--font-body)"}} className="dc3">
                  <svg viewBox={"0 0 600 480"} width="34" height="27">
                    <polygon points="300,0 393.75,150 206.25,150" fill={(mini.academy)} />
                    <polygon points="196.9,165 403.1,165 496.9,315 103.1,315" fill={(mini.club)} />
                    <polygon points="93.75,330 297,330 297,480 0,480" fill={(mini.rec)} />
                    <polygon points="303,330 506.25,330 600,480 303,480" fill={(mini.futures)} />
                  </svg>
                  {" "}← All programs{" "}
                  <span style={{fontSize: "10px", color: "var(--color-neutral-500)", border: "1px solid var(--color-divider)", borderRadius: "4px", padding: "3px 5px"}}>
                    ESC
                  </span>
                </button>
                <div style={{display: "flex", gap: "4px", flexWrap: "wrap", marginRight: "auto"}}>
                  {(switcher).map((w, w__i) => (
                    <React.Fragment key={w__i}>
                    <button onClick={(w.go)} style={{cursor: "pointer", border: `1px solid ${w.border}`, background: (w.bg), color: (w.fg), padding: "8px 12px", borderRadius: "7px", font: "500 13px/1 var(--font-body)", transition: "all .2s"}}>
                      {w.name}
                    </button>
                    </React.Fragment>
                  ))}
                </div>
                <button onClick={(goJoin)} style={{cursor: "pointer", background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)", font: "500 14px/1 var(--font-body)", padding: "10px 16px", borderRadius: "8px"}} className="dc4">
                  {p.cta} →
                </button>
              </div>
              <div style={{transform: (contentTf), opacity: (contentOp), transition: "transform .5s cubic-bezier(.2,.8,.2,1),opacity .3s"}}>
                <section style={{position: "relative", minHeight: "min(80vh,760px)", display: "flex", alignItems: "flex-end", overflow: "hidden"}}>
                  {(p.hasImg) ? (
                    <>
                    <div style={{position: "absolute", inset: "0", backgroundImage: (p.bgImg), backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(1) contrast(1.15) brightness(.62)", mixBlendMode: "lighten"}}>
                    </div>
                    <div style={{position: "absolute", inset: "0", background: "#78b7b3", mixBlendMode: "color", opacity: ".55"}}>
                    </div>
                    </>
                  ) : null}
                  {(p.noImg) ? (
                    <>
                    <div style={{position: "absolute", inset: "0", background: "repeating-linear-gradient(135deg,#171a20 0 14px,#1b1e25 14px 28px)", display: "flex", justifyContent: "center", paddingTop: "22vh"}}>
                      <span style={{font: "500 12px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", letterSpacing: ".08em", textTransform: "uppercase"}}>
                        {p.imgNote}
                      </span>
                    </div>
                    </>
                  ) : null}
                  <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(17,19,24,.25),rgba(17,19,24,.6) 50%,#111318),radial-gradient(ellipse at 15% 100%,rgba(120,183,179,.22),transparent 55%)"}}>
                  </div>
                  <div style={{position: "relative", width: "100%", maxWidth: "1360px", margin: "0 auto", padding: "0 clamp(20px,4vw,56px) 44px", display: "flex", flexDirection: "column", gap: "20px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                      <span>
                        {p.tier}
                      </span>
                      <span style={{width: "36px", height: "1px", background: "var(--color-accent)"}}>
                      </span>
                      <span style={{color: "var(--color-neutral-300)"}}>
                        {heroAges}
                      </span>
                    </div>
                    <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", flexWrap: "wrap"}}>
                      <h1 style={{margin: "0", font: "500 clamp(60px,14vw,220px)/.86 var(--font-heading)", letterSpacing: "-.06em"}}>
                        {p.name}
                      </h1>
                      {(isAcademy) ? (
                        <>
                        <div style={{display: "flex", gap: "12px", paddingBottom: "12px"}}>
                          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "12px 12px 10px", borderRadius: "14px", background: "rgba(27,29,36,.85)", backdropFilter: "blur(10px)", boxShadow: "0 0 0 1px var(--color-accent-800),0 10px 30px rgba(0,0,0,.4)"}}>
                            <img src={(A.badgeA)} alt="ECNL logo" style={{width: "88px", height: "88px", borderRadius: "10px", objectFit: "contain"}} />
                            <span style={{fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent-300)"}}>
                              ECNL
                            </span>
                          </div>
                          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "12px 12px 10px", borderRadius: "14px", background: "rgba(27,29,36,.85)", backdropFilter: "blur(10px)", boxShadow: "0 0 0 1px var(--color-accent-800),0 10px 30px rgba(0,0,0,.4)"}}>
                            <img src={(A.badgeB)} alt="EA logo" style={{width: "88px", height: "88px", borderRadius: "10px", objectFit: "contain"}} />
                            <span style={{fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent-300)"}}>
                              Elite Academy
                            </span>
                          </div>
                        </div>
                        </>
                      ) : null}
                    </div>
                    <p style={{margin: "0", maxWidth: "640px", fontSize: "clamp(17px,1.5vw,21px)", lineHeight: "1.5", color: "var(--color-neutral-200)", textWrap: "pretty"}}>
                      {p.tagline}
                    </p>
                    <div style={{display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px"}}>
                      {(statRows).map((sr, sr__i) => (
                        <React.Fragment key={sr__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          {(sr.hasLabel) ? (
                            <>
                            <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                              {sr.label}
                            </span>
                            </>
                          ) : null}
                          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "1px", borderRadius: "10px", overflow: "hidden", background: "var(--color-divider)"}}>
                            {(sr.stats).map((st, st__i) => (
                              <React.Fragment key={st__i}>
                              <div style={{display: "flex", flexDirection: "column", gap: "6px", padding: "16px 18px", background: "rgba(27,29,36,.92)"}}>
                                <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                                  {st.k}
                                </span>
                                <span style={{font: "500 20px/1.2 var(--font-heading)", letterSpacing: "-.02em"}}>
                                  {st.v}
                                </span>
                              </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </section>
                <nav style={{position: "sticky", top: "57px", zIndex: "9", background: "rgba(17,19,24,.92)", backdropFilter: "blur(12px)"}}>
                  <div style={{maxWidth: "1360px", margin: "0 auto", padding: "0 clamp(20px,4vw,56px)", display: "flex", gap: "2px", overflowX: "auto"}}>
                    {(secs).map((sc, sc__i) => (
                      <React.Fragment key={sc__i}>
                      <button onClick={(sc.go)} style={{all: "unset", cursor: "pointer", padding: "15px 12px 13px", fontSize: "13px", whiteSpace: "nowrap", color: (sc.fg), boxShadow: `inset 0 -2px 0 ${sc.bar}`, transition: "color .2s,box-shadow .2s"}}>
                        {sc.label}
                      </button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{height: "1px", background: "linear-gradient(to right,transparent,var(--color-divider) 48px,var(--color-divider) calc(100% - 48px),transparent)"}}>
                  </div>
                </nav>
                <div style={{maxWidth: "1360px", margin: "0 auto", padding: "0 clamp(20px,4vw,56px)"}}>
                  <section id="sec-overview" style={{padding: "88px 0 64px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "56px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "18px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        01 · Who it's for
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                        {p.forHead}
                      </h2>
                      <p style={{margin: "0", fontSize: "17px", lineHeight: "1.65", color: "var(--color-neutral-300)", maxWidth: "520px", textWrap: "pretty"}}>
                        {p.intro}
                      </p>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px"}}>
                      {(p.forWho).map((f, f__i) => (
                        <React.Fragment key={f__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "10px", padding: "20px", borderRadius: "8px", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s,transform .25s"}} className="dc5">
                          <span style={{fontSize: "12px", color: "var(--color-accent)"}}>
                            {f.n}
                          </span>
                          <span style={{font: "500 17px/1.3 var(--font-heading)"}}>
                            {f.t}
                          </span>
                          <span style={{fontSize: "14px", lineHeight: "1.55", color: "var(--color-neutral-400)"}}>
                            {f.d}
                          </span>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                  <section id="sec-leagues" style={{padding: "64px 0", display: "flex", flexDirection: "column", gap: "32px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        02 · Competition
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                        Where we play
                      </h2>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: "12px"}}>
                      {(p.leagues).map((lg, lg__i) => (
                        <React.Fragment key={lg__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "12px", minHeight: "220px", padding: "26px", borderRadius: "8px", background: "linear-gradient(160deg,rgba(120,183,179,.1),transparent 50%),var(--color-surface)", boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s,transform .25s"}} className="dc6">
                          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px"}}>
                            <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                              {lg.level}
                            </span>
                            {(lg.hasLogo) ? (
                              <>
                              <div role="img" aria-label={`${lg.name} logo`} style={{flex: "none", width: (lg.lwPx), height: (lg.lhPx), backgroundImage: (lg.logoBg), backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center", imageRendering: "-webkit-optimize-contrast", filter: "drop-shadow(0 4px 12px rgba(0,0,0,.45))"}}>
                              </div>
                              </>
                            ) : null}
                          </div>
                          <span style={{font: "500 34px/1 var(--font-heading)", letterSpacing: "-.035em"}}>
                            {lg.name}
                          </span>
                          <span style={{marginTop: "auto", fontSize: "14px", lineHeight: "1.55", color: "var(--color-neutral-400)"}}>
                            {lg.d}
                          </span>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                    {V.isRec ? <RecFormats /> : null}
                  </section>
                  <section id="sec-season" style={{padding: "64px 0", display: "flex", flexDirection: "column", gap: "32px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        03 · The year
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                        Season overview
                      </h2>
                    </div>
                    <div style={{overflowX: "auto"}}>
                      <div style={{minWidth: "760px", display: "flex", flexDirection: "column", gap: "10px"}}>
                        <div style={{display: "grid", gridTemplateColumns: "repeat(12,1fr)"}}>
                          {(months).map((m, m__i) => (
                            <React.Fragment key={m__i}>
                            <span style={{fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-500)", padding: "0 0 8px 8px", borderLeft: "1px solid var(--color-divider)"}}>
                              {m}
                            </span>
                            </React.Fragment>
                          ))}
                        </div>
                        <div style={{position: "relative", height: "72px"}}>
                          {(phases).map((ph, ph__i) => (
                            <React.Fragment key={ph__i}>
                            <button onClick={(ph.pick)} onMouseEnter={(ph.pick)} style={{position: "absolute", top: "0", bottom: "0", left: (ph.left), width: (ph.width), cursor: "pointer", border: `1px solid ${ph.border}`, borderRadius: "8px", background: (ph.bg), color: (ph.fg), padding: "0 12px", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center", gap: "5px", overflow: "hidden", boxShadow: "0 0 0 2px var(--color-bg)", transition: "all .25s"}}>
                              <span style={{fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase", opacity: ".75"}}>
                                {ph.range}
                              </span>
                              <span style={{font: "500 15px/1 var(--font-heading)", whiteSpace: "nowrap"}}>
                                {ph.label}
                              </span>
                            </button>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "28px", padding: "24px 26px", borderRadius: "8px", background: "var(--color-surface)", boxShadow: "0 0 0 1px var(--color-accent-800)"}}>
                      <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                        <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                          {phaseSel.range}
                        </span>
                        <span style={{font: "500 30px/1 var(--font-heading)", letterSpacing: "-.03em"}}>
                          {phaseSel.label}
                        </span>
                      </div>
                      <p style={{margin: "0", alignSelf: "center", fontSize: "16px", lineHeight: "1.6", color: "var(--color-neutral-300)"}}>
                        {phaseSel.d}
                      </p>
                    </div>
                  </section>
                  <section id="sec-schedule" style={{padding: "64px 0", display: "flex", flexDirection: "column", gap: "32px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: "20px", flexWrap: "wrap"}}>
                      <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                        <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                          04 · Commitment
                        </span>
                        <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                          A typical week
                        </h2>
                      </div>
                      <div style={{display: "flex", gap: "18px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                        <span style={{display: "flex", alignItems: "center", gap: "8px"}}>
                          <span style={{width: "10px", height: "10px", borderRadius: "3px", border: "1px solid var(--color-accent)"}}>
                          </span>
                          Training
                        </span>
                        <span style={{display: "flex", alignItems: "center", gap: "8px"}}>
                          <span style={{width: "10px", height: "10px", borderRadius: "3px", background: "var(--color-accent-700)"}}>
                          </span>
                          Match
                        </span>
                      </div>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "8px"}}>
                      {(p.week).map((dy, dy__i) => (
                        <React.Fragment key={dy__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "8px", minHeight: "170px", padding: "12px", borderRadius: "8px", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)"}}>
                          <span style={{font: "500 15px/1 var(--font-heading)", color: "var(--color-neutral-300)"}}>
                            {dy.day}
                          </span>
                          {(dy.items).map((it, it__i) => (
                            <React.Fragment key={it__i}>
                            <div style={{display: "flex", flexDirection: "column", gap: "4px", padding: "9px 10px", borderRadius: "6px", background: (it.bg), color: (it.fg), boxShadow: `inset 0 0 0 1px ${it.ring}`}}>
                              <span style={{fontSize: "10px", letterSpacing: ".04em", opacity: ".8"}}>
                                {it.t}
                              </span>
                              <span style={{font: "500 13px/1.25 var(--font-body)"}}>
                                {it.label}
                              </span>
                            </div>
                            </React.Fragment>
                          ))}
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <p style={{margin: "0", fontSize: "15px", color: "var(--color-neutral-400)"}}>
                      {p.commitNote}
                    </p>
                  </section>
                  <section id="sec-cost" style={{padding: "64px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "48px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        05 · Investment
                      </span>
                      {(hasGroups) ? (
                        <>
                        <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                          {(groupTabs).map((g, g__i) => (
                            <React.Fragment key={g__i}>
                            <button onClick={(g.pick)} style={{cursor: "pointer", border: `1px solid ${g.border}`, background: (g.bg), color: (g.fg), font: "500 13px/1 var(--font-body)", padding: "8px 12px", borderRadius: "8px", transition: "all .2s"}}>
                              {g.label}
                            </button>
                            </React.Fragment>
                          ))}
                        </div>
                        </>
                      ) : null}
                      <div style={{display: "inline-flex", alignSelf: "flex-start", border: "1px solid var(--color-divider)", borderRadius: "8px", overflow: "hidden"}}>
                        <button onClick={(billFull)} style={{cursor: "pointer", border: "0", padding: "9px 14px", font: "500 13px/1 var(--font-body)", background: "transparent", color: (billFullFg), boxShadow: `inset 0 0 0 1px ${billFullRing}`}}>
                          Pay in full
                        </button>
                        <button onClick={(billSplit)} style={{cursor: "pointer", border: "0", padding: "9px 14px", font: "500 13px/1 var(--font-body)", background: "transparent", color: (billSplitFg), boxShadow: `inset 0 0 0 1px ${billSplitRing}`}}>
                          {p.installLabel}
                        </button>
                      </div>
                      <div style={{display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap"}}>
                        <span style={{font: "500 clamp(80px,10vw,144px)/.9 var(--font-heading)", letterSpacing: "-.06em", color: "var(--color-accent)", fontVariantNumeric: "tabular-nums"}}>
                          {price}
                        </span>
                        <span style={{fontSize: "15px", color: "var(--color-neutral-400)"}}>
                          {priceUnit}
                        </span>
                      </div>
                      <p style={{margin: "0", maxWidth: "460px", fontSize: "15px", lineHeight: "1.6", color: "var(--color-neutral-400)"}}>
                        {p.costNote}
                      </p>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}}>
                      <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-500)", paddingBottom: "12px"}}>
                        What's included
                      </span>
                      {(p.includes).map((inc, inc__i) => (
                        <React.Fragment key={inc__i}>
                        <div style={{display: "flex", alignItems: "center", gap: "14px", padding: "15px 0", fontSize: "16px", background: "linear-gradient(to right,var(--color-divider),var(--color-divider) calc(100% - 48px),transparent) no-repeat top / 100% 1px"}}>
                          <span style={{width: "7px", height: "7px", flex: "none", transform: "rotate(45deg)", background: "var(--color-accent)"}}>
                          </span>
                          {inc}
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                  <section id="sec-staff" style={{padding: "64px 0", display: "flex", flexDirection: "column", gap: "32px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        06 · Staff
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                        Directors & coaches
                      </h2>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: "12px"}}>
                      {(p.directors).map((dr, dr__i) => (
                        <React.Fragment key={dr__i}>
                        <div style={{display: "grid", gridTemplateColumns: "140px 1fr", gap: "20px", padding: "14px", borderRadius: "8px", background: "var(--color-surface)", boxShadow: "var(--shadow-sm)"}}>
                          <div style={{aspectRatio: "4 / 5", borderRadius: "6px", background: "repeating-linear-gradient(135deg,#20232b 0 8px,#252830 8px 16px)", display: "flex", alignItems: "flex-end", padding: "8px", font: "500 10px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", textTransform: "uppercase"}}>
                            Headshot
                          </div>
                          <div style={{display: "flex", flexDirection: "column", gap: "8px", padding: "6px 6px 6px 0"}}>
                            <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                              {dr.role}
                            </span>
                            <span style={{font: "500 26px/1.05 var(--font-heading)", letterSpacing: "-.03em"}}>
                              {dr.name}
                            </span>
                            <span style={{fontSize: "14px", lineHeight: "1.55", color: "var(--color-neutral-400)"}}>
                              {dr.bio}
                            </span>
                          </div>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "16px"}}>
                      {(p.coaches).map((co, co__i) => (
                        <React.Fragment key={co__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                          <div style={{aspectRatio: "1", borderRadius: "8px", background: "repeating-linear-gradient(135deg,#1a1d23 0 8px,#1f2229 8px 16px)", display: "flex", alignItems: "flex-end", padding: "10px", font: "500 10px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", textTransform: "uppercase"}}>
                            Coach photo
                          </div>
                          <span style={{font: "500 17px/1.2 var(--font-heading)"}}>
                            {co.name}
                          </span>
                          <span style={{fontSize: "13px", color: "var(--color-neutral-400)"}}>
                            {co.role}
                          </span>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                  <section id="sec-players" style={{padding: "64px 0", display: "flex", flexDirection: "column", gap: "32px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        07 · Players
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(38px,4.4vw,64px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                        {p.playersHead}
                      </h2>
                    </div>
                    {(noTeams) ? (
                      <>
                      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "12px"}}>
                        {(p.players).map((pl, pl__i) => (
                          <React.Fragment key={pl__i}>
                          <div style={{position: "relative", aspectRatio: "3 / 4", borderRadius: "8px", overflow: "hidden", background: "repeating-linear-gradient(135deg,#1a1d23 0 10px,#1f2229 10px 20px)", boxShadow: "var(--shadow-sm)", transition: "transform .3s,box-shadow .3s"}} className="dc7">
                            <span style={{position: "absolute", top: "12px", left: "12px", font: "500 10px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", textTransform: "uppercase"}}>
                              Player photo
                            </span>
                            <span style={{position: "absolute", right: "12px", top: "6px", font: "500 64px/1 var(--font-heading)", letterSpacing: "-.05em", color: "var(--color-accent)", opacity: ".85"}}>
                              {pl.num}
                            </span>
                            <div style={{position: "absolute", left: "0", right: "0", bottom: "0", padding: "14px", background: "linear-gradient(transparent,rgba(17,19,24,.95))", display: "flex", flexDirection: "column", gap: "4px"}}>
                              <span style={{font: "500 17px/1.1 var(--font-heading)"}}>
                                {pl.pos}
                              </span>
                              <span style={{fontSize: "12px", color: "var(--color-neutral-400)"}}>
                                {pl.meta}
                              </span>
                            </div>
                          </div>
                          </React.Fragment>
                        ))}
                      </div>
                      </>
                    ) : null}
                    {(hasTeams) ? (
                      <>
                      <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>
                        <div style={{display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "2px"}}>
                          {(teamTabs).map((tt, tt__i) => (
                            <React.Fragment key={tt__i}>
                            <button onClick={(tt.pick)} style={{flex: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", minWidth: "76px", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${tt.border}`, background: (tt.bg), transition: "all .2s"}} className="dc8">
                              <span style={{font: "500 18px/1 var(--font-heading)", letterSpacing: "-.02em", color: (tt.fg)}}>
                                {tt.label}
                              </span>
                              <span style={{fontSize: "10px", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                                {tt.sub}
                              </span>
                            </button>
                            </React.Fragment>
                          ))}
                        </div>
                        <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", flexWrap: "wrap", padding: "20px 22px", borderRadius: "10px", background: "linear-gradient(120deg,rgba(120,183,179,.12),transparent 55%),var(--color-surface)", boxShadow: "var(--shadow-sm)"}}>
                          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                            <span style={{fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                              {team.league} · {team.format}
                            </span>
                            <span style={{font: "500 clamp(30px,3.4vw,44px)/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                              {team.label} Academy
                            </span>
                          </div>
                          <div style={{display: "flex", gap: "28px", flexWrap: "wrap"}}>
                            {(team.facts).map((tf, tf__i) => (
                              <React.Fragment key={tf__i}>
                              <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
                                <span style={{fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                                  {tf.k}
                                </span>
                                <span style={{font: "500 17px/1 var(--font-heading)"}}>
                                  {tf.v}
                                </span>
                              </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        <div style={{display: "flex", flexDirection: "column", gap: "28px", opacity: (rosterOp), transform: (rosterTf), transition: "opacity .3s,transform .4s cubic-bezier(.2,.8,.2,1)"}}>
                          {(posGroups).map((pg, pg__i) => (
                            <React.Fragment key={pg__i}>
                            <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                                <span style={{font: "500 15px/1 var(--font-heading)"}}>
                                  {pg.label}
                                </span>
                                <span style={{fontSize: "12px", color: "var(--color-neutral-500)"}}>
                                  {pg.count}
                                </span>
                                <span style={{flex: "1", height: "1px", background: "linear-gradient(to right,var(--color-divider),var(--color-divider) calc(100% - 48px),transparent)"}}>
                                </span>
                              </div>
                              <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "10px"}}>
                                {(pg.players).map((pl, pl__i) => (
                                  <React.Fragment key={pl__i}>
                                  <button onClick={(pl.open)} style={{all: "unset", cursor: "pointer", position: "relative", aspectRatio: "3 / 4", borderRadius: "8px", overflow: "hidden", background: "repeating-linear-gradient(135deg,#1a1d23 0 10px,#1f2229 10px 20px)", boxShadow: "var(--shadow-sm)", transition: "transform .3s,box-shadow .3s"}} className="dc9">
                                    <span style={{position: "absolute", top: "10px", left: "10px", font: "500 10px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", textTransform: "uppercase"}}>
                                      Photo
                                    </span>
                                    <span style={{position: "absolute", right: "10px", top: "4px", font: "500 54px/1 var(--font-heading)", letterSpacing: "-.05em", color: "var(--color-accent)", opacity: ".85"}}>
                                      {pl.num}
                                    </span>
                                    <div style={{position: "absolute", left: "0", right: "0", bottom: "0", padding: "12px", background: "linear-gradient(transparent,rgba(17,19,24,.96) 40%)", display: "flex", flexDirection: "column", gap: "4px"}}>
                                      <span style={{font: "500 16px/1.1 var(--font-heading)"}}>
                                        {pl.name}
                                      </span>
                                      <span style={{display: "flex", justifyContent: "space-between", gap: "6px", fontSize: "11px", color: "var(--color-neutral-400)"}}>
                                        <span>
                                          {pl.pos}
                                        </span>
                                        <span style={{color: "var(--color-accent-300)"}}>
                                          View →
                                        </span>
                                      </span>
                                    </div>
                                  </button>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      </>
                    ) : null}
                  </section>
                  <section id="sec-join" style={{padding: "64px 0 96px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: "48px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                      <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        08 · Join
                      </span>
                      <h2 style={{margin: "0", font: "500 clamp(48px,6vw,96px)/.95 var(--font-heading)", letterSpacing: "-.05em"}}>
                        {p.joinHead}
                      </h2>
                      <p style={{margin: "0", maxWidth: "460px", fontSize: "17px", lineHeight: "1.6", color: "var(--color-neutral-300)"}}>
                        {p.joinCopy}
                      </p>
                    </div>
                    <div style={{borderRadius: "14px", background: "var(--color-surface)", boxShadow: "var(--shadow-md)", overflow: "hidden"}}>
                      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
                        <button onClick={(tabA)} style={{all: "unset", cursor: "pointer", textAlign: "center", padding: "16px", fontSize: "14px", color: (tabAFg), boxShadow: `inset 0 -2px 0 ${tabABar}`}}>
                          {p.tabLabel}
                        </button>
                        <button onClick={(tabB)} style={{all: "unset", cursor: "pointer", textAlign: "center", padding: "16px", fontSize: "14px", color: (tabBFg), boxShadow: `inset 0 -2px 0 ${tabBBar}`}}>
                          Request info
                        </button>
                      </div>
                      {(showSuccess) ? (
                        <>
                        <div style={{padding: "52px 28px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "14px"}}>
                          <span style={{width: "44px", height: "44px", borderRadius: "50%", border: "1px solid var(--color-accent)", color: "var(--color-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"}}>
                            ✓
                          </span>
                          <span style={{font: "500 32px/1.05 var(--font-heading)", letterSpacing: "-.03em"}}>
                            {successHead}
                          </span>
                          <span style={{fontSize: "15px", lineHeight: "1.6", color: "var(--color-neutral-400)"}}>
                            {successCopy}
                          </span>
                          <button onClick={(resetForm)} style={{cursor: "pointer", marginTop: "6px", background: "transparent", border: "1px solid var(--color-divider)", color: "var(--color-text)", padding: "10px 16px", borderRadius: "8px", font: "500 14px/1 var(--font-body)"}}>
                            Submit another
                          </button>
                        </div>
                        </>
                      ) : null}
                      {(showReg) ? (
                        <>
                        <form onSubmit={(submit)} style={{padding: "24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                          <span style={{fontSize: "12px", color: "var(--color-neutral-400)"}}>
                            {p.sessionLabel}
                          </span>
                          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "8px"}}>
                            {(sessions).map((tr, tr__i) => (
                              <React.Fragment key={tr__i}>
                              <button type="button" onClick={(tr.pick)} style={{all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "13px", borderRadius: "8px", background: (tr.bg), boxShadow: `inset 0 0 0 1px ${tr.ring}`, transition: "all .2s"}}>
                                <span style={{font: "500 16px/1.1 var(--font-heading)", color: (tr.fg)}}>
                                  {tr.date}
                                </span>
                                <span style={{fontSize: "12px", color: "var(--color-neutral-300)"}}>
                                  {tr.time}
                                </span>
                                <span style={{fontSize: "12px", color: "var(--color-neutral-500)"}}>
                                  {tr.ages} · {tr.loc}
                                </span>
                              </button>
                              </React.Fragment>
                            ))}
                          </div>
                          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px"}}>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Player name
                              <input required placeholder="First and last" style={{minHeight: "40px", padding: "8px 12px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none"}} className="dc10" />
                            </label>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Birth year / age
                              <select style={{minHeight: "40px", padding: "8px 10px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px"}}>
                                {(p.years).map((yr, yr__i) => (
                                  <React.Fragment key={yr__i}>
                                  <option>
                                    {yr}
                                  </option>
                                  </React.Fragment>
                                ))}
                              </select>
                            </label>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Parent email
                              <input required type="email" placeholder="you@email.com" style={{minHeight: "40px", padding: "8px 12px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none"}} className="dc11" />
                            </label>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Current club
                              <input placeholder="Optional" style={{minHeight: "40px", padding: "8px 12px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none"}} className="dc12" />
                            </label>
                          </div>
                          <button type="submit" style={{cursor: "pointer", background: "rgba(120,183,179,.08)", border: "1px solid var(--color-accent)", color: "var(--color-accent)", font: "500 15px/1 var(--font-body)", padding: "15px", borderRadius: "8px"}} className="dc13">
                            {p.cta} · {sessionPick}
                          </button>
                        </form>
                        </>
                      ) : null}
                      {(showInfo) ? (
                        <>
                        <form onSubmit={(submit)} style={{padding: "24px", display: "flex", flexDirection: "column", gap: "12px"}}>
                          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px"}}>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Your name
                              <input required style={{minHeight: "40px", padding: "8px 12px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none"}} className="dc14" />
                            </label>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                              Email
                              <input required type="email" style={{minHeight: "40px", padding: "8px 12px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none"}} className="dc15" />
                            </label>
                          </div>
                          <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                            Player birth year / age
                            <select style={{minHeight: "40px", padding: "8px 10px", font: "400 14px var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px"}}>
                              {(p.years).map((yr, yr__i) => (
                                <React.Fragment key={yr__i}>
                                <option>
                                  {yr}
                                </option>
                                </React.Fragment>
                              ))}
                            </select>
                          </label>
                          <label style={{display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", color: "var(--color-neutral-400)"}}>
                            Questions
                            <textarea rows="4" placeholder="Tell us about your player" style={{padding: "10px 12px", font: "400 14px/1.5 var(--font-body)", color: "var(--color-text)", background: "var(--color-bg)", border: "1px solid var(--color-divider)", borderRadius: "8px", outline: "none", resize: "vertical"}} className="dc16" />
                          </label>
                          <button type="submit" style={{cursor: "pointer", background: "transparent", border: "1px solid var(--color-divider)", color: "var(--color-text)", font: "500 15px/1 var(--font-body)", padding: "15px", borderRadius: "8px"}} className="dc17">
                            Send · we reply within 48 hours
                          </button>
                        </form>
                        </>
                      ) : null}
                    </div>
                  </section>
                </div>
                <section style={{background: "var(--color-surface)", padding: "64px clamp(20px,4vw,56px) 88px"}}>
                  <div style={{maxWidth: "1360px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "end", gap: "16px", flexWrap: "wrap"}}>
                      <h3 style={{margin: "0", font: "500 clamp(30px,3.4vw,46px)/1 var(--font-heading)", letterSpacing: "-.035em"}}>
                        Explore the pathway
                      </h3>
                      <button onClick={(close)} style={{cursor: "pointer", background: "transparent", border: "0", color: "var(--color-accent)", font: "500 14px/1 var(--font-body)"}}>
                        ↑ Back to the pyramid
                      </button>
                    </div>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px"}}>
                      {(others).map((o, o__i) => (
                        <React.Fragment key={o__i}>
                        <button onClick={(o.go)} style={{all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: "12px", padding: "22px", borderRadius: "8px", background: "var(--color-bg)", boxShadow: "var(--shadow-sm)", transition: "box-shadow .25s,transform .25s"}} className="dc18">
                          <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                            {o.num} · {o.ages}
                          </span>
                          <span style={{font: "500 38px/1 var(--font-heading)", letterSpacing: "-.04em"}}>
                            {o.name}
                          </span>
                          <span style={{fontSize: "14px", color: "var(--color-neutral-400)"}}>
                            {o.line}
                          </span>
                          <span style={{fontSize: "14px", color: "var(--color-accent)"}}>
                            View program →
                          </span>
                        </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            </div>
            {(mOn) ? (
              <>
              <div onClick={(mClose)} style={{position: "absolute", inset: "0", zIndex: "40", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px,3vw,40px)", background: "rgba(10,11,16,.74)", backdropFilter: "blur(8px)", opacity: (mOp), transition: "opacity .25s ease"}}>
                <div onClick={(stop)} style={{position: "relative", width: "100%", maxWidth: "1080px", maxHeight: "100%", overflowY: "auto", borderRadius: "14px", background: "var(--color-surface)", boxShadow: "var(--shadow-lg),0 0 0 1px var(--color-accent-800)", transform: (mTf), transition: "transform .4s cubic-bezier(.2,.8,.2,1)"}}>
                  <div style={{position: "sticky", top: "0", zIndex: "2", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "rgba(27,29,36,.92)", backdropFilter: "blur(10px)"}}>
                    <span style={{marginRight: "auto", fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-neutral-400)"}}>
                      {m.teamLabel} · Player profile
                    </span>
                    <button onClick={(mPrev)} aria-label="Previous player" style={{cursor: "pointer", width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--color-divider)", background: "transparent", color: "var(--color-text)", fontSize: "15px"}} className="dc19">
                      ←
                    </button>
                    <button onClick={(mNext)} aria-label="Next player" style={{cursor: "pointer", width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--color-divider)", background: "transparent", color: "var(--color-text)", fontSize: "15px"}} className="dc20">
                      →
                    </button>
                    <button onClick={(mClose)} aria-label="Close" style={{cursor: "pointer", width: "36px", height: "36px", borderRadius: "8px", border: "1px solid var(--color-divider)", background: "transparent", color: "var(--color-text)", fontSize: "17px"}} className="dc21">
                      ×
                    </button>
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "28px", padding: "8px clamp(16px,3vw,32px) 28px"}}>
                    <div style={{position: "relative", aspectRatio: "4 / 5", maxHeight: "440px", borderRadius: "10px", overflow: "hidden", background: "repeating-linear-gradient(135deg,#1a1d23 0 12px,#1f2229 12px 24px)"}}>
                      <span style={{position: "absolute", top: "14px", left: "14px", font: "500 10px/1 ui-monospace,Menlo,monospace", color: "var(--color-neutral-600)", textTransform: "uppercase"}}>
                        Player portrait
                      </span>
                      <span style={{position: "absolute", right: "16px", bottom: "6px", font: "500 140px/1 var(--font-heading)", letterSpacing: "-.06em", color: "var(--color-accent)", opacity: ".9"}}>
                        {m.num}
                      </span>
                      <div style={{position: "absolute", inset: "0", background: "radial-gradient(ellipse at 20% 100%,rgba(120,183,179,.25),transparent 60%)"}}>
                      </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px", justifyContent: "flex-end"}}>
                      <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                        <span style={{fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                          #{m.num} · {m.pos}
                        </span>
                        <span style={{font: "500 clamp(40px,5vw,64px)/.95 var(--font-heading)", letterSpacing: "-.05em"}}>
                          {m.name}
                        </span>
                      </div>
                      <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                        {(m.chips).map((c, c__i) => (
                          <React.Fragment key={c__i}>
                          <span style={{display: "flex", gap: "6px", padding: "7px 10px", borderRadius: "7px", background: "var(--color-bg)", fontSize: "12px"}}>
                            <span style={{color: "var(--color-neutral-500)"}}>
                              {c.k}
                            </span>
                            <span>
                              {c.v}
                            </span>
                          </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                        <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                          2025–26 season
                        </span>
                        <div style={{display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "1px", borderRadius: "10px", overflow: "hidden", background: "var(--color-divider)"}}>
                          {(m.stats).map((st, st__i) => (
                            <React.Fragment key={st__i}>
                            <div style={{display: "flex", flexDirection: "column", gap: "6px", padding: "14px 16px", background: "var(--color-bg)"}}>
                              <span style={{font: "500 30px/1 var(--font-heading)", letterSpacing: "-.04em", color: (st.color), fontVariantNumeric: "tabular-nums"}}>
                                {st.v}
                              </span>
                              <span style={{fontSize: "11px", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                                {st.k}
                              </span>
                            </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "16px", padding: "0 clamp(16px,3vw,32px) 28px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "16px", padding: "20px", borderRadius: "10px", background: "var(--color-bg)"}}>
                      <span style={{fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        Aspirations
                      </span>
                      <p style={{margin: "0", font: "500 19px/1.4 var(--font-heading)", letterSpacing: "-.015em", color: "var(--color-neutral-200)", textWrap: "pretty"}}>
                        “{m.quote}”
                      </p>
                      <div style={{display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px"}}>
                        <span style={{fontSize: "11px", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--color-neutral-500)"}}>
                          Season goals
                        </span>
                        {(m.goals).map((g, g__i) => (
                          <React.Fragment key={g__i}>
                          <div style={{display: "flex", flexDirection: "column", gap: "7px"}}>
                            <div style={{display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "13px"}}>
                              <span>
                                {g.t}
                              </span>
                              <span style={{color: "var(--color-accent-300)", fontVariantNumeric: "tabular-nums"}}>
                                {g.label}
                              </span>
                            </div>
                            <div style={{height: "4px", borderRadius: "4px", background: "rgba(233,233,237,.08)", overflow: "hidden"}}>
                              <div style={{height: "100%", width: (g.pct), borderRadius: "4px", background: "#78b7b3", boxShadow: "0 0 10px rgba(120,183,179,.6)", transition: "width .6s cubic-bezier(.2,.8,.2,1)"}}>
                              </div>
                            </div>
                          </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "14px", padding: "20px", borderRadius: "10px", background: "var(--color-bg)"}}>
                      <span style={{fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                        Player attributes
                      </span>
                      {(m.attrs).map((a, a__i) => (
                        <React.Fragment key={a__i}>
                        <div style={{display: "grid", gridTemplateColumns: "96px 1fr 32px", alignItems: "center", gap: "12px", fontSize: "13px"}}>
                          <span style={{color: "var(--color-neutral-300)"}}>
                            {a.k}
                          </span>
                          <div style={{height: "6px", borderRadius: "6px", background: "rgba(233,233,237,.08)", overflow: "hidden"}}>
                            <div style={{height: "100%", width: (a.pct), borderRadius: "6px", background: "linear-gradient(to right,var(--color-accent-700),#78b7b3)", transition: "width .6s cubic-bezier(.2,.8,.2,1)"}}>
                            </div>
                          </div>
                          <span style={{textAlign: "right", fontVariantNumeric: "tabular-nums"}}>
                            {a.v}
                          </span>
                        </div>
                        </React.Fragment>
                      ))}
                      <span style={{marginTop: "auto", fontSize: "12px", color: "var(--color-neutral-500)"}}>
                        Staff-rated each quarter in the individual development plan.
                      </span>
                    </div>
                  </div>
                  <div style={{display: "flex", flexDirection: "column", gap: "12px", padding: "0 clamp(16px,3vw,32px) 32px"}}>
                    <span style={{fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent)"}}>
                      Highlights
                    </span>
                    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "10px"}}>
                      {(m.highlights).map((hl, hl__i) => (
                        <React.Fragment key={hl__i}>
                        <div style={{display: "flex", flexDirection: "column", gap: "8px", cursor: "pointer"}} className="dc22">
                          <div style={{position: "relative", aspectRatio: "16 / 9", borderRadius: "8px", overflow: "hidden", background: "repeating-linear-gradient(135deg,#1a1d23 0 10px,#1f2229 10px 20px)", display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <span style={{width: "44px", height: "44px", borderRadius: "50%", border: "1px solid #78b7b3", color: "#78b7b3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", background: "rgba(17,19,24,.6)"}}>
                              ▶
                            </span>
                            <span style={{position: "absolute", left: "10px", bottom: "10px", fontSize: "11px", padding: "4px 7px", borderRadius: "5px", background: "rgba(17,19,24,.85)"}}>
                              {hl.len}
                            </span>
                            <span style={{position: "absolute", right: "10px", top: "10px", fontSize: "10px", letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 7px", borderRadius: "5px", background: "rgba(120,183,179,.18)", color: "#b5e1dd"}}>
                              {hl.type}
                            </span>
                          </div>
                          <span style={{fontSize: "13px"}}>
                            {hl.title}
                          </span>
                        </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </>
            ) : null}
          </div>
          </>
        ) : null}
      </div>
      </>
    );
  }
}
