// Home page: collage hero with the pathway pyramid, tryouts near you, tournaments,
// the Athletic Global teaser, the docuseries and the closing call to action.
import React, { useEffect, useRef, useState } from 'react';
import { CalendarBlank, MapPin, ArrowUpRight } from '@phosphor-icons/react';
import { ORDER, PYRAMID_POINTS as PTS, PYRAMID_LABELS, COLLAGE_TILES } from '../../data/site';
import { eventsWithStatus, nextFor, money, EVENT_STATUS_LABEL } from '../../lib/schedule';
import { ACC, Kicker, Rule, OutlineLink, Placeholder } from '../ui.jsx';
import SiteFooter from '../SiteFooter.jsx';

const ptsAttr = (id) => PTS[id].slice(0, id === 'pro' ? 3 : 4).map((q) => q.join(',')).join(' ');
const STATUS_STYLE = {
  open: { dot: '#78b7b3', fg: '#d6f0ee', ring: 'inset 0 0 0 1px #78b7b3' },
  coming: { dot: '#e9e9ed', fg: '#e9e9ed', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
  closed: { dot: '#e9e9ed', fg: '#e9e9ed', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
  past: { dot: '#5f616b', fg: '#8b8d98', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
};

export default function Home({ data, hover, focus, intro, introDone, active, tilt: tiltOn, myRegion, today, onHover, onOpen, onNetwork }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroMove = (e) => {
    if (!tiltOn || active) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
  const heroLeave = () => { setTilt({ x: 0, y: 0 }); onHover(null); };
  const P = Object.fromEntries(data.programs.map((p) => [p.id, p]));
  const region = data.regions.find((r) => r.id === (myRegion || 'north'));
  const tryoutsHref = `/tryouts/?region=${region.id}`;

  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Collage photos={data.collage} tf={`scale(1.04) translate(${(tilt.x * -14).toFixed(1)}px,${(tilt.y * -10).toFixed(1)}px)`} />
          <div style={{ position: 'absolute', inset: 0, background: '#78b7b3', mixBlendMode: 'color', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#111318 0%,rgba(17,19,24,.88) 30%,rgba(17,19,24,.35) 62%,rgba(17,19,24,.55) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(17,19,24,.6) 0%,transparent 25%,transparent 70%,#111318 100%)' }} />
        </div>
        <section id="programs" onMouseMove={heroMove} onMouseLeave={heroLeave} style={{ position: 'relative', maxWidth: '1440px', margin: '0 auto', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,56px) 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: '56px', alignItems: 'center' }}>
          <div aria-hidden="true" style={{ position: 'absolute', right: '8%', top: '18%', width: '520px', height: '520px', maxWidth: '100%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,183,179,.16),transparent 65%)', pointerEvents: 'none', transform: `translate(${(tilt.x * 40).toFixed(1)}px,${(tilt.y * 40).toFixed(1)}px)`, transition: 'transform .5s ease' }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <Kicker line>The Utah Athletic pathway</Kicker>
            <h1 style={{ margin: 0, font: '500 clamp(54px,7.2vw,112px)/.94 var(--font-heading)', letterSpacing: '-.045em', textWrap: 'balance' }}>Every level.<br /><span style={{ color: ACC }}>One standard.</span></h1>
            <p style={{ margin: 0, maxWidth: '470px', fontSize: '17px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>From a four-year-old's first touch to national-platform football. Choose a level to see who it's for, where it competes, what it costs, and how to join.</p>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '520px' }}>
              <LevelRow num="Pro" name="Professional" line="Athletic Global · RC Vichy Athletic" right="The network →" on={focus === 'pro'}
                onEnter={() => onHover('pro')} onLeave={() => onHover(null)} onClick={onNetwork} />
              {ORDER.map((id) => {
                const p = P[id];
                const line = id === 'academy' ? p.line : `${p.line} · ${money(p.cost)}${p.unit === 'per year' ? '/yr' : '/season'}`;
                return <LevelRow key={id} num={p.num} name={p.name} line={line} right={`${p.ages} →`} on={focus === id}
                  onEnter={() => onHover(id)} onLeave={() => onHover(null)} onClick={() => onOpen(id)} />;
              })}
            </div>
          </div>
          <Pyramid P={P} hover={hover} focus={focus} intro={intro} introDone={introDone} tilt={tiltOn ? tilt : null} onHover={onHover} onOpen={onOpen} onNetwork={onNetwork} />
        </section>
      </div>

      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px clamp(20px,4vw,56px) 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Kicker line>Tryouts near you · {region.label} region</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(32px,3.8vw,52px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>Your next step, <span style={{ color: ACC }}>by level.</span></h2>
          </div>
          <OutlineLink href={tryoutsHref}>All tryouts →</OutlineLink>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '10px' }}>
          {ORDER.map((id) => {
            const n = nextFor(data, id, region.id, today);
            return (
              <div key={id} className="hv-lift-sm" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s,transform .2s' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{P[id].name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)' }}>{n.kind === 'season' ? 'Season sign-up' : n.kind === 'tryout' ? 'Next tryout' : 'Not yet posted'}</span>
                </span>
                <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{n.title}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: 'var(--color-neutral-300)' }}>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CalendarBlank color={ACC} aria-hidden="true" />{n.when}</span>
                  <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin color={ACC} aria-hidden="true" />{n.where}</span>
                </span>
                <OutlineLink href={n.href} external={n.external} className="hv-t10" style={{ marginTop: 'auto', border: '1px solid var(--color-accent-800)' }}>{n.cta} →</OutlineLink>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px clamp(20px,4vw,56px) 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Kicker line>Tournaments</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(32px,3.8vw,52px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>Four events. <span style={{ color: ACC }}>One host club.</span></h2>
          </div>
          <OutlineLink href="/events/">All tournaments &amp; events →</OutlineLink>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '10px' }}>
          {eventsWithStatus(data.events, today).slice(0, 4).map((e) => {
            const st = STATUS_STYLE[e.status];
            return (
              <a key={e.id} href={e.url} target="_blank" rel="noopener" className="hv-event-sm" style={{ '--ev-accent': e.brand.accent, display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)', transition: 'transform .25s,box-shadow .25s' }}>
                <div style={{ position: 'relative', height: '92px', overflow: 'hidden', background: `radial-gradient(ellipse at 30% 20%,${e.brand.bg2},${e.brand.bg} 70%)` }}>
                  <span aria-hidden="true" style={{ position: 'absolute', right: '-4%', bottom: '-30%', font: '500 110px/1 var(--font-heading)', letterSpacing: '-.06em', color: e.brand.accent, opacity: 0.18 }}>{e.brand.mono}</span>
                  <span style={{ position: 'absolute', left: '12px', top: '12px', display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(17,19,24,.75)', boxShadow: st.ring, fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: st.fg }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />{EVENT_STATUS_LABEL[e.status]}
                  </span>
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '3px', background: e.brand.accent }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px 16px 16px' }}>
                  <span style={{ font: '500 19px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{e.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{e.dates} · {e.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '6px', fontSize: '13px', color: e.brand.accent }}>Event site <ArrowUpRight aria-hidden="true" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section id="network" style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px clamp(20px,4vw,56px) 72px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        <Rule />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Kicker line>Where the pathway leads</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(36px,4.4vw,60px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>Above Academy is the professional game.</h2>
            <p style={{ margin: 0, maxWidth: '520px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>Utah Athletic is part of Athletic Global, a network of affiliate academies and professional clubs. A player can start in Futures or Rec, move through Club and Academy, and have a route to a professional environment inside the same network.</p>
            <Placeholder>Placeholder · copy to be supplied</Placeholder>
            <a href="/network/" onClick={(e) => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); onNetwork(); } }} className="hv-t10" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px', transition: 'background .2s' }}>Explore the Athletic Network →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <NetworkRow crest={<span style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed var(--color-neutral-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>RC Vichy<br />crest</span>} name="RC Vichy Athletic" sub="Vichy, France · Professional club" tag="Today" />
            <NetworkRow crest={<img src={data.logo} alt="" width="56" height="56" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />} name="Utah Athletic" sub="Utah, USA · Futures to Academy" tag="Today" />
            <NetworkRow dashed crest={<span style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed var(--color-neutral-600)' }} />} name="Affiliate academies" sub="Locations to be announced" tag="In development" />
          </div>
        </div>
      </section>

      <section id="inside" style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px clamp(20px,4vw,56px) 88px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <Rule />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, font: '500 clamp(34px,4vw,56px)/1 var(--font-heading)', letterSpacing: '-.035em' }}>Inside Utah Athletic</h2>
          <Kicker>The docuseries</Kicker>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '20px' }}>
          {data.videos.map((v) => (
            <a key={v.url} href={v.url} target="_blank" rel="noopener" className="hv-video" style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text)' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '8px', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                <img src={v.img.src} alt={v.img.alt || ''} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: v.img.pos, filter: 'saturate(.5) brightness(.85)' }} />
                <span style={{ position: 'absolute', left: '12px', bottom: '12px', fontSize: '12px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(17,19,24,.8)', color: 'var(--color-text)' }}>▶ {v.len}</span>
              </div>
              <span style={{ font: '500 18px/1.25 var(--font-heading)', letterSpacing: '-.015em' }}>{v.title}</span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px) 96px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 'clamp(32px,5vw,64px)', borderRadius: '14px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.18),transparent 60%),var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: 0, font: '500 clamp(40px,6vw,88px)/.95 var(--font-heading)', letterSpacing: '-.045em' }}>Want to play for us?</h2>
          <p style={{ margin: 0, maxWidth: '520px', fontSize: '17px', color: 'var(--color-neutral-300)' }}>Request an invitation for a trial with Academy staff, or find the right level for your player.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onOpen('academy')} className="hv-t12" style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px' }}>Apply to Academy →</button>
            <a href="#programs" className="hv-ghost" style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px' }}>Explore all programs</a>
          </div>
        </div>
      </section>
      <SiteFooter social={data.settings.social} />
    </>
  );
}

function LevelRow({ num, name, line, right, on, onEnter, onLeave, onClick }) {
  return (
    <button type="button" onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave} onClick={onClick} style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', gap: '12px', padding: '15px 14px', borderRadius: '8px', background: on ? 'rgba(120,183,179,.08)' : 'transparent', transition: 'background .25s' }}>
      <span style={{ fontSize: '12px', color: on ? ACC : 'var(--color-neutral-500)', fontVariantNumeric: 'tabular-nums' }}>{num}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ font: '500 21px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{name}</span>
        <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{line}</span>
      </span>
      <span style={{ fontSize: '13px', color: on ? ACC : 'var(--color-neutral-500)', transform: on ? 'translateX(4px)' : 'none', transition: 'all .25s' }}>{right}</span>
    </button>
  );
}

function NetworkRow({ crest, name, sub, tag, dashed }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: '16px', alignItems: 'center', padding: '18px', borderRadius: '10px', ...(dashed ? { border: '1px dashed var(--color-neutral-600)' } : { background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }) }}>
      {crest}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ font: '500 19px/1.15 var(--font-heading)', letterSpacing: '-.02em', color: dashed ? 'var(--color-neutral-300)' : undefined }}>{name}</span>
        <span style={{ fontSize: '13px', color: dashed ? 'var(--color-neutral-500)' : 'var(--color-neutral-400)' }}>{sub}</span>
      </div>
      <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 8px', borderRadius: '5px', ...(dashed ? { border: '1px solid var(--color-divider)', color: 'var(--color-neutral-400)' } : { background: 'rgba(120,183,179,.14)', color: 'var(--color-accent-300)' }) }}>{tag}</span>
    </div>
  );
}

// The pathway pyramid. Each slice is keyboard-focusable and opens its program.
function Pyramid({ P, hover, focus, intro, introDone, tilt, onHover, onOpen, onNetwork }) {
  const slice = (id, open) => {
    const on = hover === id, dim = hover && !on;
    const row = { pro: -1, academy: 0, club: 1, rec: 2, futures: 2 }[id];
    const delay = introDone ? 0 : id === 'pro' ? 0.42 : (2 - row) * 0.14 + (id === 'futures' ? 0.06 : 0);
    const rest = id === 'pro' ? 'url(#uaPro)' : 'url(#uaRest)';
    const stroke = on ? ACC : id === 'pro' ? 'rgba(120,183,179,.85)' : focus === id ? 'rgba(120,183,179,.75)' : 'rgba(120,183,179,.5)';
    const name = id === 'pro' ? 'Professional: the Athletic Global network' : P[id].name;
    return (
      <polygon key={id} points={ptsAttr(id)} role="link" tabIndex={0} aria-label={name}
        onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(id)} onBlur={() => onHover(null)}
        onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        fill={on ? 'url(#uaFill)' : rest} stroke={stroke} strokeWidth="1.5"
        style={{ cursor: 'pointer', outline: 'none', opacity: !intro ? 0 : dim ? 0.45 : 1, transform: !intro ? 'translateY(40px)' : on ? 'translateY(-8px)' : 'none', transition: `transform .55s cubic-bezier(.2,.8,.2,1) ${delay}s, opacity .5s ${delay}s, fill .25s, stroke .25s` }} />
    );
  };
  const lab = (id) => ({ op: !intro ? 0 : hover && hover !== id ? 0.45 : 1, lift: hover === id ? 'translateY(-8px)' : '', kc: hover === id ? ACC : 'var(--color-accent-300)' });
  const pro = lab('pro');
  const glow = hover || null;
  const hint = hover === 'pro' ? 'Click to see where the pathway leads' : hover ? 'Click to open ' + P[hover].name : 'Hover a level · click to explore';
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '120%', height: '120%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse at center,rgba(17,19,24,.85) 0%,rgba(17,19,24,.55) 40%,transparent 70%)', pointerEvents: 'none' }} />
      <div data-pyr="1" style={{ position: 'relative', width: 'min(100%,600px)', aspectRatio: '600 / 480', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.6))', transform: tilt ? `perspective(1400px) rotateY(${(tilt.x * 14).toFixed(2)}deg) rotateX(${(-tilt.y * 10).toFixed(2)}deg)` : 'none', transition: 'transform .45s cubic-bezier(.2,.8,.2,1)' }}>
        <svg viewBox="0 0 600 480" role="group" aria-label="The Utah Athletic pathway" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="uaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#78b7b3" stopOpacity=".42" /><stop offset="1" stopColor="#78b7b3" stopOpacity=".08" /></linearGradient>
            <linearGradient id="uaPro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#78b7b3" stopOpacity=".55" /><stop offset="1" stopColor="#78b7b3" stopOpacity=".16" /></linearGradient>
            <linearGradient id="uaRest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1d24" stopOpacity=".88" /><stop offset="1" stopColor="#111318" stopOpacity=".82" /></linearGradient>
            <filter id="uaGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
          </defs>
          <polygon points="300,0 600,480 0,480" fill="#78b7b3" opacity=".22" filter="url(#uaGlow)" />
          <polygon points={ptsAttr(glow || 'academy')} fill="#78b7b3" opacity={glow ? 0.35 : 0} filter="url(#uaGlow)" style={{ transition: 'opacity .3s' }} />
          {slice('pro', onNetwork)}
          {ORDER.map((id) => slice(id, () => onOpen(id)))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', left: '61%', top: '11%', transform: `translateY(-50%) ${pro.lift}`, display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', whiteSpace: 'nowrap', opacity: pro.op, transition: 'transform .35s cubic-bezier(.2,.8,.2,1),opacity .5s' }}>
          <span style={{ width: '28px', height: '1px', background: 'linear-gradient(to left,#78b7b3,transparent)' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: pro.kc }}>Athletic Global</span>
            <span style={{ font: '500 19px/1 var(--font-heading)', letterSpacing: '-.03em', color: 'var(--color-text)' }}>Professional</span>
            <span style={{ fontSize: '11px', color: 'var(--color-neutral-300)' }}>The destination →</span>
          </span>
        </div>
        {ORDER.map((id) => {
          const l = lab(id), pos = PYRAMID_LABELS[id];
          return (
            <div key={id} aria-hidden="true" style={{ position: 'absolute', left: pos.x, top: pos.y, transform: `translate(-50%,-50%) ${l.lift}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', opacity: l.op, transition: 'transform .35s cubic-bezier(.2,.8,.2,1),opacity .5s' }}>
              <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: l.kc }}>{P[id].kicker}</span>
              <span style={{ font: `500 ${pos.fs}/1 var(--font-heading)`, letterSpacing: '-.03em', color: 'var(--color-text)' }}>{P[id].name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-neutral-300)' }}>{P[id].ages}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'relative', fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-300)' }}>{hint}</div>
    </div>
  );
}

// Rotating photo collage behind the hero. Each tile crossfades to its next photo; one tile
// changes every 1.7s in shuffled order, paused while the tab is hidden. A tile's next photo
// only starts loading one step before it's shown, so the page doesn't fetch all 20 up front.
function Collage({ photos, tf }) {
  const n = COLLAGE_TILES.length;
  const [cur, setCur] = useState(() => Array(n).fill(0));
  const [armed, setArmed] = useState(() => new Set());
  const curRef = useRef(cur);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
    let step = 0;
    const arm = (t) => setArmed((s) => new Set(s).add(t + ':' + ((curRef.current[t] + 1) % 3)));
    arm(order[0]);
    const timer = setInterval(() => {
      if (document.hidden) return;
      const t = order[step % n];
      step += 1;
      const next = curRef.current.slice();
      next[t] = (next[t] + 1) % 3;
      curRef.current = next;
      setCur(next);
      arm(order[step % n]);
    }, 1700);
    return () => clearInterval(timer);
  }, [n]);
  return (
    <div style={{ position: 'absolute', inset: '-3%', display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gridTemplateRows: 'repeat(3,minmax(0,1fr))', gap: '4px', background: '#111318', filter: 'grayscale(1) contrast(1.2) brightness(.82)', transform: tf, transition: 'transform .6s ease' }}>
      {COLLAGE_TILES.map(([col, row], t) => (
        <div key={t} style={{ position: 'relative', overflow: 'hidden', gridColumn: col, gridRow: row, background: '#15171d' }}>
          {[0, 1, 2].map((k) => {
            const on = cur[t] === k, load = k === 0 || on || armed.has(t + ':' + k), photo = photos[(t + k * n) % photos.length];
            return <div key={k} style={{ position: 'absolute', inset: 0, backgroundImage: load ? `url("${photo.src}")` : 'none', backgroundSize: 'cover', backgroundPosition: photo.pos || `center ${30 + ((t * 7) % 30)}%`, opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(1.08)', transition: 'opacity 1.4s ease,transform 7s cubic-bezier(.2,.8,.2,1)' }} />;
          })}
        </div>
      ))}
    </div>
  );
}
