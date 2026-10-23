// A staff member's bio on their card: the first three lines, then "Read more" (only when there is
// more), which opens their profile: a larger headshot, name, title, the full bio and their email.
// Used by every staff card (program leadership, region leaders, coaches, adult league staff).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ACC, Headshot } from './ui.jsx';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function StaffBio({ person, lines = 3, size = 14, color = 'var(--color-neutral-400)' }) {
  const ref = useRef(null);
  // Before the browser can measure, guess from the length; then check whether the text is cut off.
  const [more, setMore] = useState(() => (person.bio ?? '').length > lines * 55 || (person.bio ?? '').includes('\n'));
  const [open, setOpen] = useState(false);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setMore(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, [person.bio, lines]);
  if (!person.bio) return null;
  return (
    <>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
        <span ref={ref} style={{ display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: size + 'px', lineHeight: 1.55, color, whiteSpace: 'pre-line' }}>{person.bio}</span>
        {more ? (
          <button type="button" onClick={() => setOpen(true)} className="hv-link" aria-haspopup="dialog" style={{ all: 'unset', cursor: 'pointer', fontSize: '13px', color: ACC }}>
            Read more<span className="sr-only"> about {person.name}</span> →
          </button>
        ) : null}
      </span>
      {open ? <StaffModal person={person} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

// The full profile, over the page. Escape, the × button or a click outside closes it.
function StaffModal({ person: p, onClose }) {
  const [shown, setShown] = useState(false);
  const close = () => { setShown(false); setTimeout(onClose, 220); };
  useEffect(() => {
    requestAnimationFrame(() => setShown(true));
    // Capture phase, so Escape closes this and not the program page underneath.
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } };
    window.addEventListener('keydown', onKey, true);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey, true); document.body.style.overflow = overflow; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return createPortal(
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(10px,3vw,40px)', background: 'rgba(10,11,16,.74)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', opacity: shown ? 1 : 0, transition: 'opacity .22s ease' }}>
      <div role="dialog" aria-modal="true" aria-label={`${p.name}, ${p.role}`} onClick={(e) => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '860px', maxHeight: '100%', overflowY: 'auto', borderRadius: '16px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg),0 0 0 1px var(--color-accent-800)', transform: shown ? 'none' : 'scale(.94) translateY(16px)', transition: 'transform .4s cubic-bezier(.2,.8,.2,1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))' }}>
          <div style={{ position: 'relative', background: 'var(--color-bg)' }}>
            <Headshot pic={p.headshotLg ?? p.headshot} name={p.name} style={{ height: '100%', minHeight: '320px', aspectRatio: '4 / 5' }} slotStyle={{ height: '100%', minHeight: '320px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 'clamp(22px,3vw,36px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)', paddingTop: '6px' }}>{p.role}</span>
              <button type="button" onClick={close} aria-label="Close" autoFocus className="hv-outline" style={{ flex: 'none', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-text)', fontSize: '17px' }}>×</button>
            </div>
            <h3 style={{ margin: 0, font: '500 clamp(30px,3.4vw,44px)/1.02 var(--font-heading)', letterSpacing: '-.035em' }}>{p.name}</h3>
            <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.7, color: 'var(--color-neutral-300)', whiteSpace: 'pre-line', textWrap: 'pretty' }}>{p.bio}</p>
            {p.email ? <a href={'mailto:' + p.email} style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '14px', overflowWrap: 'anywhere' }}>{p.email}</a> : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
