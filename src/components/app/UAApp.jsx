// The home page and program pages as one app, so a program can open from its pyramid
// slice with a full-screen transition. Every state has a real URL:
//   /                 home
//   /academy/         program overview
//   /academy/north/   program region tab
// Back/forward, Escape and shared links all work. Ported from the Claude Design prototype
// (docs/design-reference); content comes in as the `data` prop (src/lib/content.ts).
import React from 'react';
import { PYRAMID_POINTS as PTS } from '../../data/site';
import { readRegion, rememberRegion, todayIso } from '../../lib/schedule';
import SiteHeader from '../SiteHeader.jsx';
import Home from './Home.jsx';
import ProgramPage from './ProgramPage.jsx';

const MODES = [['expand', 'Expand'], ['zoom', 'Zoom'], ['curtain', 'Curtain']];
const EASE = 'cubic-bezier(.76,0,.24,1)';
const ACC = '#78b7b3';
const IDLE = { tf: 'none', origin: '50% 50%', op: 1, filter: 'none', trans: 'none' };
const ROUTE = /^\/(academy|club|rec|futures)\/(?:(north|south|west)\/?)?$/;
// Programs that open straight onto the visitor's remembered region.
const OPENS_ON_REGION = ['club', 'rec'];

export default class UAApp extends React.Component {
  static defaultProps = { transition: 'expand', speed: 1, tilt: true, initial: null, showModes: false };

  constructor(props) {
    super(props);
    const init = props.initial;
    this.state = {
      hover: null, focus: init ? init.program : 'academy', intro: !!init, introDone: !!init,
      active: init ? init.program : null, region: init ? init.region || null : null,
      ov: init ? { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'none' } : null,
      home: IDLE, mode: null, busy: false, swap: false,
      myRegion: null, regMenu: false, copied: false, mounted: false, today: props.data.builtOn,
    };
    this.homeRef = React.createRef();
    this.scrollRef = React.createRef();
  }

  program(id) { return this.props.data.programs.find((p) => p.id === id); }

  componentDidMount() {
    this.setState({ mounted: true, today: todayIso(), myRegion: readRegion() });
    if (this.state.active) document.body.style.overflow = 'hidden';
    else {
      setTimeout(() => this.setState({ intro: true }), 100);
      setTimeout(() => this.setState({ introDone: true }), 1400);
    }
    this.onPop = () => {
      const m = location.pathname.match(ROUTE);
      this.silently(() => {
        if (m) {
          if (!this.state.active) this.open(m[1], m[2] || null);
          else if (this.state.active !== m[1]) this.switchTo(m[1], m[2] || null);
          else this.setRegion(m[2] || null);
        } else if (this.state.active) this.close();
      });
    };
    window.addEventListener('popstate', this.onPop);
    this.onKey = (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (this.state.active && !this.state.busy) this.close();
    };
    window.addEventListener('keydown', this.onKey);
    // Coming back to the home page after the zoom into /network/ (back/forward cache).
    this.onShow = (e) => { if (e.persisted) this.setState({ home: IDLE, busy: false, hover: null }); };
    window.addEventListener('pageshow', this.onShow);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.onPop);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('pageshow', this.onShow);
    document.body.style.overflow = '';
  }

  // ── URLs ────────────────────────────────────────────────────────────────
  path(id, region) { return id ? `/${id}/${region ? region + '/' : ''}` : '/'; }
  nav(path, replace) {
    if (this._silent || location.pathname === path) return;
    history[replace ? 'replaceState' : 'pushState']({ ua: path }, '', path);
    const m = path.match(ROUTE);
    const r = m && m[2] && this.props.data.regions.find((x) => x.id === m[2]);
    document.title = m ? `${r ? r.label + ' ' : ''}${this.program(m[1]).name} | Utah Athletic` : 'Utah Athletic Soccer Club';
  }
  silently(fn) { this._silent = true; try { fn(); } finally { this._silent = false; } }
  startRegion(id) { return OPENS_ON_REGION.includes(id) ? this.state.myRegion : null; }

  // ── Transition geometry ─────────────────────────────────────────────────
  mode() { return this.state.mode || this.props.transition || 'expand'; }
  dur() { return Math.round(760 * (this.props.speed ?? 1)); }
  pyrRect() { const el = document.querySelector('[data-pyr]'); return el && el.getBoundingClientRect(); }
  poly(pts) { return 'polygon(' + pts.map((p) => p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px').join(',') + ')'; }
  slicePoly(id) {
    const r = this.pyrRect(); if (!r || r.bottom < 0 || r.top > innerHeight) return null;
    const s = r.width / 600;
    return this.poly(PTS[id].map(([x, y]) => [r.left + x * s, r.top + y * s]));
  }
  sliceCenter(id) {
    const r = this.pyrRect(); if (!r) return [innerWidth / 2, innerHeight / 2];
    const s = r.width / 600, pts = PTS[id];
    return [r.left + (pts.reduce((a, p) => a + p[0], 0) / 4) * s, r.top + (pts.reduce((a, p) => a + p[1], 0) / 4) * s];
  }
  full() { return this.poly([[0, 0], [innerWidth, 0], [innerWidth, innerHeight], [0, innerHeight]]); }
  dot() { const x = innerWidth / 2, y = innerHeight / 2; return this.poly([[x, y - 2], [x + 2, y], [x, y + 2], [x - 2, y]]); }
  ensurePyrVisible() {
    const r = this.pyrRect(); if (!r) return;
    if (r.top < 60 || r.bottom > innerHeight) window.scrollTo(0, Math.max(0, scrollY + r.top - (innerHeight - r.height) / 2));
  }
  homeOriginFor(id) {
    const [cx, cy] = this.sliceCenter(id), w = this.homeRef.current.getBoundingClientRect();
    return (cx - w.left) + 'px ' + (cy - w.top) + 'px';
  }

  // ── Open, close, switch ─────────────────────────────────────────────────
  open(id, region = this.startRegion(id)) {
    if (this.state.active || this.state.busy) return;
    this.nav(this.path(id, region));
    const d = this.dur(), mode = this.mode(), raf = (f) => requestAnimationFrame(() => requestAnimationFrame(f));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.style.overflow = 'hidden';
    const base = { active: id, focus: id, region, hover: null, regMenu: false, busy: true };
    const done = () => this.setState({ busy: false });
    if (reduce) {
      this.setState({ ...base, busy: false, ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'none' } });
    } else if (mode === 'expand') {
      this.setState({ ...base, ov: { clip: this.slicePoly(id) || this.dot(), tf: 'none', op: 1, cop: 0, trans: 'none' } }, () => raf(() => {
        this.setState({ ov: { clip: this.full(), tf: 'none', op: 1, cop: 0, trans: 'clip-path ' + d + 'ms ' + EASE } });
        setTimeout(() => this.setState((s) => ({ ov: { ...s.ov, cop: 1 } })), d * 0.75);
        setTimeout(() => { this.setState((s) => ({ ov: { ...s.ov, clip: 'none', trans: 'none' } })); done(); }, d + 60);
      }));
    } else if (mode === 'zoom') {
      const origin = this.homeOriginFor(id);
      this.setState({ ...base, home: { tf: 'none', origin, op: 1, filter: 'none', trans: 'none' }, ov: { clip: 'none', tf: 'scale(1.06)', op: 0, cop: 1, trans: 'none' } }, () => raf(() => {
        this.setState({ home: { tf: 'scale(4.5)', origin, op: 0, filter: 'blur(6px)', trans: 'transform ' + d + 'ms cubic-bezier(.6,0,.3,1), opacity ' + d * 0.7 + 'ms ease ' + d * 0.3 + 'ms, filter ' + d + 'ms' } });
        setTimeout(() => this.setState({ ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'opacity ' + d * 0.5 + 'ms ease, transform ' + d * 0.6 + 'ms cubic-bezier(.2,.8,.2,1)' } }), d * 0.55);
        setTimeout(done, d * 1.2);
      }));
    } else {
      const origin = '50% ' + (scrollY + innerHeight / 2) + 'px';
      this.setState({ ...base, home: { ...IDLE, origin }, ov: { clip: 'none', tf: 'translateY(100%)', op: 1, cop: 1, trans: 'none' } }, () => raf(() => {
        this.setState({ home: { tf: 'scale(.93)', origin, op: 1, filter: 'brightness(.4)', trans: 'transform ' + d + 'ms ' + EASE + ', filter ' + d + 'ms' }, ov: { clip: 'none', tf: 'none', op: 1, cop: 1, trans: 'transform ' + d + 'ms ' + EASE } });
        setTimeout(done, d + 40);
      }));
    }
  }

  close() {
    const id = this.state.active; if (!id || this.state.busy) return;
    this.nav('/');
    const d = this.dur(), mode = this.mode();
    const finish = () => { document.body.style.overflow = ''; this.setState({ active: null, region: null, ov: null, busy: false, home: IDLE, hover: null, regMenu: false }); };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    this.setState({ busy: true });
    if (mode === 'expand') {
      this.setState((s) => ({ home: IDLE, ov: { ...s.ov, clip: this.full(), cop: 0, trans: 'none' } }));
      setTimeout(() => {
        this.ensurePyrVisible();
        requestAnimationFrame(() => {
          this.setState((s) => ({ ov: { ...s.ov, clip: this.slicePoly(id) || this.dot(), trans: 'clip-path ' + d + 'ms ' + EASE } }));
          setTimeout(finish, d + 60);
        });
      }, 300);
    } else if (mode === 'zoom') {
      this.setState((s) => ({ ov: { ...s.ov, op: 0, tf: 'scale(1.06)', trans: 'opacity ' + d * 0.4 + 'ms ease, transform ' + d * 0.4 + 'ms ease' } }));
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
      this.setState((s) => ({ home: { ...s.home, tf: 'none', filter: 'none' }, ov: { ...s.ov, tf: 'translateY(100%)', trans: 'transform ' + d + 'ms ' + EASE } }));
      setTimeout(finish, d + 40);
    }
  }

  switchTo(id, region = this.startRegion(id)) {
    if (id === this.state.active || this.state.swap) return;
    this.nav(this.path(id, region), true);
    this.setState({ swap: true, regMenu: false });
    setTimeout(() => {
      this.setState({ active: id, focus: id, region });
      if (this.scrollRef.current) this.scrollRef.current.scrollTop = 0;
      requestAnimationFrame(() => this.setState({ swap: false }));
    }, 300);
  }

  // Pick a region tab. Scrolls back up to the tabs if the visitor is further down the page.
  setRegion(r) {
    if (r === this.state.region) { this.setState({ regMenu: false }); return; }
    this.setState({ region: r, regMenu: false });
    if (r) { rememberRegion(r); this.setState({ myRegion: r }); }
    this.nav(this.path(this.state.active, r), true);
    requestAnimationFrame(() => {
      const c = this.scrollRef.current, hero = c && c.querySelector('#ovhero');
      if (!hero) return;
      const top = hero.getBoundingClientRect().bottom - c.getBoundingClientRect().top + c.scrollTop - 57;
      if (c.scrollTop > top) c.scrollTo({ top, behavior: 'smooth' });
    });
  }

  goSec(k) {
    const c = this.scrollRef.current, el = c && c.querySelector('#sec-' + k);
    if (el) c.scrollTo({ top: el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - 136, behavior: 'smooth' });
  }

  // Header CTA, hero status button and the "what it takes" band: go to the tryout or trial form.
  goJoin = () => {
    const p = this.program(this.state.active);
    const r = this.state.region || this.state.myRegion || 'north';
    const st = p.regions[r].status;
    if (this.state.region !== r) this.setRegion(r);
    setTimeout(() => this.goSec(st === 'active' ? 'rtry' : st === 'soon' ? 'rsoon' : 'rnone'), 380);
  };

  // The pyramid's Professional tier zooms into the Athletic Network page.
  goNetwork = () => {
    if (this.state.busy) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { location.href = '/network/'; return; }
    const origin = this.homeOriginFor('pro');
    this.setState({ busy: true, home: { tf: 'none', origin, op: 1, filter: 'none', trans: 'none' } }, () => requestAnimationFrame(() => requestAnimationFrame(() => {
      this.setState({ home: { tf: 'scale(4.5)', origin, op: 0, filter: 'blur(6px)', trans: 'transform 700ms cubic-bezier(.6,0,.3,1), opacity 500ms ease 200ms, filter 700ms' } });
      setTimeout(() => { location.href = '/network/'; }, 660);
    })));
  };

  // Header region menu.
  regionMenu() {
    return {
      regions: this.props.data.regions, myRegion: this.state.myRegion, open: this.state.regMenu,
      onToggle: () => this.setState((s) => ({ regMenu: !s.regMenu })),
      onClose: this.closeMenu,
      onPick: (k) => {
        rememberRegion(k);
        this.setState({ myRegion: k, regMenu: false });
        if (this.state.active) this.setRegion(k);
      },
    };
  }
  closeMenu = () => this.setState({ regMenu: false });

  copyLink = () => {
    try { navigator.clipboard.writeText(location.href).catch(() => {}); } catch { /* no clipboard */ }
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 1600);
  };

  render() {
    const { data, tilt, showModes } = this.props;
    const s = this.state;
    const ov = s.ov || { clip: 'none', tf: 'none', op: 0, cop: 0, trans: 'none' };
    const p = s.active ? this.program(s.active) : null;
    return (
      <div style={{ position: 'relative', overflowX: 'clip', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
        <div ref={this.homeRef} aria-hidden={s.active ? 'true' : undefined} inert={s.active && !s.busy ? true : undefined}
          style={{ transform: s.home.tf, transformOrigin: s.home.origin, opacity: s.home.op, filter: s.home.filter, transition: s.home.trans }}>
          <SiteHeader current="programs" logo={data.logo} tryoutsHref={`/tryouts/${s.myRegion ? '?region=' + s.myRegion : ''}`} regionMenu={s.active ? null : this.regionMenu()} />
          <Home data={data} hover={s.hover} focus={s.focus} intro={s.intro} introDone={s.introDone} active={!!s.active} tilt={tilt}
            myRegion={s.myRegion} today={s.today}
            onHover={(id) => this.setState(id ? { hover: id, focus: id } : { hover: null })}
            onOpen={(id) => this.open(id)} onNetwork={this.goNetwork} />
        </div>

        {showModes ? (
          <div style={{ position: 'fixed', left: '20px', bottom: '20px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '4px', padding: '5px', borderRadius: '10px', background: 'rgba(27,29,36,.92)', backdropFilter: 'blur(10px)', boxShadow: 'var(--shadow-md)', opacity: s.ov ? 0 : 1, pointerEvents: s.ov ? 'none' : 'auto', transition: 'opacity .3s' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', padding: '0 8px' }}>Transition</span>
            {MODES.map(([k, label]) => {
              const on = this.mode() === k;
              return <button key={k} type="button" onClick={() => this.setState({ mode: k })} style={{ cursor: 'pointer', border: `1px solid ${on ? ACC : 'transparent'}`, background: on ? 'rgba(120,183,179,.1)' : 'transparent', color: on ? ACC : 'var(--color-neutral-300)', font: '500 13px/1 var(--font-body)', padding: '8px 12px', borderRadius: '7px' }}>{label}</button>;
            })}
          </div>
        ) : null}

        {p ? (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--color-accent-800)', clipPath: ov.clip, transform: ov.tf, opacity: ov.op, transition: ov.trans }}>
            <div ref={this.scrollRef} role="main" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overscrollBehavior: 'contain', background: 'var(--color-bg)', opacity: ov.cop, transition: 'opacity .35s ease' }}>
              <ProgramPage data={data} program={p} region={s.region} today={s.today} mounted={s.mounted} swap={s.swap}
                regionMenu={this.regionMenu()} copied={s.copied}
                onClose={() => this.close()} onSwitch={(k) => this.switchTo(k)} onRegion={(k) => this.setRegion(k)}
                onJoin={this.goJoin} onCopy={this.copyLink} />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
