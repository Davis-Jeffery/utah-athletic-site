// "We develop the complete player": legend on the left, orbit diagram on the right.
// Hovering a principle shows its name; clicking opens a modal with the detail and a photo.
// Each opened principle counts toward "x / 4 explored".
import React, { useEffect, useState } from 'react';
import { SoccerBall, Strategy, Lightning, Brain, Check } from '@phosphor-icons/react';
import { DEVELOPMENT } from '../../data/site';
import { ACC, Kicker, ROW_RULE } from '../ui.jsx';

const ICONS = { SoccerBall, Strategy, Lightning, Brain };
const ANGLES = [-135, -45, 45, 135];

export default function DevModel({ program }) {
  const [built, setBuilt] = useState([]);
  const [hover, setHover] = useState(null);
  const [modal, setModal] = useState(null);
  const [shown, setShown] = useState(false);
  const items = program.development.map((row, i) => ({ ...row, ...DEVELOPMENT[row.t], Icon: ICONS[DEVELOPMENT[row.t].icon], n: '0' + (i + 1), photo: program.photos.dev[i] }));
  const add = (i) => setBuilt((b) => (b.includes(i) ? b : [...b, i]));
  const open = (i) => { add(i); setHover(null); setModal(i); setShown(false); requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); };
  const close = () => { setShown(false); setTimeout(() => setModal(null), 240); };
  const step = (dir) => { const i = ((modal ?? 0) + dir + 4) % 4; add(i); setModal(i); };

  useEffect(() => {
    if (modal == null) return undefined;
    // Capture phase, so Escape closes this modal and not the program page underneath.
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  const n = built.length, done = n === 4;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '540px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Kicker>02 · Development model</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>We develop the <span style={{ color: ACC }}>complete player.</span></h2>
          </div>
          <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>Four principles, developed together. Every session, at every level and in every region, is planned around building a complete player, not just a good one.</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((it, i) => {
              const hv = hover === i, b = built.includes(i);
              return (
                <button key={it.t} type="button" onClick={() => open(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: '44px 1fr auto', alignItems: 'start', gap: '16px', padding: '16px 4px', background: ROW_RULE }}>
                  <span style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', color: b ? ACC : 'var(--color-neutral-300)', boxShadow: `inset 0 0 0 1px ${hv || b ? ACC : 'rgba(120,183,179,.35)'}`, background: b ? 'rgba(120,183,179,.18)' : 'transparent', transition: 'all .25s' }}><it.Icon aria-hidden="true" /></span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ font: '500 20px/1.1 var(--font-heading)', letterSpacing: '-.02em', color: hv ? ACC : 'var(--color-text)', transition: 'color .25s' }}>{it.t}</span>
                      <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{it.tag}</span>
                    </span>
                    <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--color-neutral-400)', textWrap: 'pretty' }}>{it.d}</span>
                  </span>
                  <span style={{ paddingTop: '4px', fontSize: '12px', whiteSpace: 'nowrap', color: hv ? ACC : 'var(--color-neutral-500)', transition: 'color .25s' }}>{b ? 'Explored ✓' : 'Explore →'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '560px', justifySelf: 'center', alignSelf: 'center', aspectRatio: '1', margin: '28px 0 56px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle,rgba(120,183,179,${0.06 + n * 0.05}) 0%,transparent 68%)`, transition: 'background .6s' }} />
          <div style={{ position: 'absolute', inset: '7%', borderRadius: '50%', boxShadow: 'inset 0 0 0 1px rgba(120,183,179,.22)', background: 'rgba(120,183,179,.03)' }} />
          <div style={{ position: 'absolute', inset: '21%', borderRadius: '50%', boxShadow: 'inset 0 0 0 1px rgba(120,183,179,.3)', background: 'rgba(120,183,179,.05)' }} />
          <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            {items.map((it, i) => {
              const a = (ANGLES[i] * Math.PI) / 180, hv = hover === i;
              return <line key={it.t} x1="50" y1="50" x2={(50 + 43 * Math.cos(a)).toFixed(2)} y2={(50 + 43 * Math.sin(a)).toFixed(2)} stroke="#78b7b3" strokeWidth={hv ? 1.6 : 1} strokeOpacity={hv ? 0.9 : built.includes(i) ? 0.45 : 0.22} strokeDasharray="1.2 1.4" vectorEffect="non-scaling-stroke" style={{ transition: 'stroke-opacity .3s' }} />;
            })}
          </svg>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '44%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 1px #78b7b3,0 0 0 8px rgba(120,183,179,.08),0 24px 60px rgba(0,0,0,.55)', background: 'var(--color-surface)' }}>
            <img src={program.photos.core} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.6) contrast(1.06)' }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translate(-50%,0)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '14px', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            <span style={{ font: '500 15px/1 var(--font-heading)', color: done ? ACC : 'var(--color-text)', transition: 'color .4s' }}>{done ? 'A complete player' : 'The complete player'}</span>
            <span aria-live="polite" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{n} / 4 explored</span>
          </div>
          {items.map((it, i) => {
            const a = (ANGLES[i] * Math.PI) / 180, hv = hover === i, b = built.includes(i);
            return (
              <div key={it.t} style={{ position: 'absolute', left: (50 + 43 * Math.cos(a)).toFixed(2) + '%', top: (50 + 43 * Math.sin(a)).toFixed(2) + '%', width: 0, height: 0 }}>
                <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 'calc(50% + 50px)', transform: `translate(-50%,${hv ? '0' : '6px'})`, opacity: hv ? 1 : 0, padding: '7px 11px', borderRadius: '7px', background: 'rgba(17,19,24,.94)', boxShadow: '0 0 0 1px rgba(120,183,179,.5),0 10px 24px rgba(0,0,0,.45)', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', pointerEvents: 'none', transition: 'opacity .25s,transform .3s cubic-bezier(.2,.8,.2,1)' }}>
                  <span style={{ font: '500 14px/1 var(--font-heading)' }}>{it.t}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{it.tag}</span>
                </span>
                <button type="button" onClick={() => open(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} aria-label={it.t}
                  style={{ position: 'absolute', left: '-38px', top: '-38px', width: '76px', height: '76px', cursor: 'pointer', border: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: hv || b ? '#b5e1dd' : 'var(--color-neutral-300)', background: hv ? 'rgba(120,183,179,.28)' : b ? 'rgba(120,183,179,.16)' : 'rgba(27,29,36,.9)', backdropFilter: 'blur(8px)', boxShadow: hv ? '0 0 0 1px #78b7b3,0 0 0 8px rgba(120,183,179,.12),0 0 32px rgba(120,183,179,.45)' : `0 0 0 1px ${b ? '#78b7b3' : 'rgba(120,183,179,.45)'},0 12px 28px rgba(0,0,0,.45)`, transform: hv ? 'scale(1.14)' : 'none', transition: 'transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s,background .3s,color .3s' }}>
                  <it.Icon aria-hidden="true" />
                </button>
                <span aria-hidden="true" style={{ position: 'absolute', left: '18px', top: '-38px', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', background: '#78b7b3', color: '#111318', opacity: b ? 1 : 0, transform: `scale(${b ? 1 : 0})`, transition: 'opacity .3s,transform .35s cubic-bezier(.34,1.56,.64,1)', pointerEvents: 'none' }}><Check weight="bold" /></span>
              </div>
            );
          })}
        </div>
      </div>

      {modal != null ? <DevModal it={items[modal]} prev={items[(modal + 3) % 4].t} next={items[(modal + 1) % 4].t} shown={shown} onClose={close} onStep={step} /> : null}
    </>
  );
}

function DevModal({ it, prev, next, shown, onClose, onStep }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(10px,3vw,40px)', background: 'rgba(10,11,16,.74)', backdropFilter: 'blur(8px)', opacity: shown ? 1 : 0, transition: 'opacity .25s ease' }}>
      <div role="dialog" aria-modal="true" aria-label={it.t} onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '980px', maxHeight: '100%', overflowY: 'auto', borderRadius: '16px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg),0 0 0 1px var(--color-accent-800)', transform: shown ? 'none' : 'scale(.9) translateY(20px)', transformOrigin: '50% 60%', transition: 'transform .45s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))' }}>
          <div style={{ position: 'relative', minHeight: '320px', background: 'var(--color-bg)' }}>
            <img src={it.photo} alt={`${it.t} training`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.55) contrast(1.06) brightness(.9)' }} />
            <span aria-hidden="true" style={{ position: 'absolute', left: '18px', top: '18px', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#78b7b3', background: 'rgba(17,19,24,.85)', backdropFilter: 'blur(8px)', boxShadow: '0 0 0 1px #78b7b3', pointerEvents: 'none' }}><it.Icon /></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: 'clamp(22px,3vw,34px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <Kicker size={11}>{it.n} · {it.tag}</Kicker>
              <button type="button" onClick={onClose} aria-label="Close" autoFocus className="hv-outline" style={{ cursor: 'pointer', width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-text)', fontSize: '17px' }}>×</button>
            </div>
            <h3 style={{ margin: 0, font: '500 clamp(36px,4vw,54px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>{it.t}</h3>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-200)', textWrap: 'pretty' }}>{it.d}</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.65, color: 'var(--color-neutral-400)', textWrap: 'pretty' }}>{it.deep}</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', paddingBottom: '8px' }}>Focus areas</span>
              {it.focus.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', fontSize: '14px', background: ROW_RULE }}><span style={{ width: '6px', height: '6px', flex: 'none', transform: 'rotate(45deg)', background: '#78b7b3' }} />{f}</div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
              <button type="button" onClick={() => onStep(-1)} className="hv-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-neutral-300)', font: '500 13px/1 var(--font-body)' }}>← {prev}</button>
              <button type="button" onClick={() => onStep(1)} className="hv-t10" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-accent)', background: 'transparent', color: 'var(--color-accent)', font: '500 13px/1 var(--font-body)' }}>{next} →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
