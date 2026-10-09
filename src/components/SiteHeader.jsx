// Site header used on every page. The region menu only appears on the home and program
// pages (inside the app); elsewhere the header renders as static HTML.
import React, { useEffect, useRef } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { NAV } from '../data/site';
import { Rule } from './ui.jsx';

export default function SiteHeader({ current, tryoutsLabel = 'Tryouts', logo = '/logo-ua.avif', tryoutsHref = '/tryouts/', regionMenu = null, sticky = true }) {
  return (
    <>
      <header className="site-header" style={{ position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 31, display: 'flex', alignItems: 'center', gap: '28px', padding: '14px clamp(16px,4vw,56px)', background: 'rgba(17,19,24,.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <a href="/" aria-label="Utah Athletic home" style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Utah Athletic" width="40" height="40" style={{ height: '40px', width: 'auto' }} />
        </a>
        <nav className="site-nav" aria-label="Main" style={{ display: 'flex', gap: '24px', fontSize: '14px', flexWrap: 'wrap' }}>
          {NAV.map((n) => (
            <a key={n.key} href={n.href} aria-current={n.key === current ? 'page' : undefined} className="hv-white" style={{ color: n.key === current ? 'var(--color-text)' : 'var(--color-neutral-400)' }}>{n.label}</a>
          ))}
        </nav>
        {regionMenu ? <RegionMenu {...regionMenu} /> : null}
        <a href={tryoutsHref} data-tryouts-link className="site-tryouts hv-t12" style={{ flex: 'none', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 14px/1 var(--font-body)', padding: '13px 16px', borderRadius: '8px' }}>{tryoutsLabel} →</a>
      </header>
      <Rule />
    </>
  );
}

// "Region: North ▾" picker. Remembers the choice in the ua_region cookie (handled by the caller).
export function RegionMenu({ regions, myRegion, open, onToggle, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    // Capture phase, so Escape closes the menu and not the program page underneath.
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); } };
    document.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc, true);
    return () => { document.removeEventListener('pointerdown', away); window.removeEventListener('keydown', esc, true); };
  }, [open, onClose]);
  const mine = regions.find((r) => r.id === myRegion);
  const opts = [...regions.map((r) => ({ k: r.id, label: r.label, sub: r.area })), { k: null, label: 'All regions', sub: 'Clear my region' }];
  return (
    <div ref={ref} style={{ position: 'relative', flex: 'none' }}>
      <button type="button" onClick={onToggle} aria-haspopup="menu" aria-expanded={open} className="hv-border" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '42px', background: 'transparent', border: '1px solid var(--color-divider)', color: 'var(--color-neutral-300)', font: '500 13px/1 var(--font-body)', padding: '0 12px', borderRadius: '8px', transition: 'border-color .2s' }}>
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: mine ? '#78b7b3' : 'transparent', boxShadow: '0 0 0 1px #78b7b3' }} />
        Region <span style={{ color: 'var(--color-text)' }}>{mine ? mine.label : 'Choose'}</span>
        <CaretDown size={11} color="var(--color-neutral-500)" aria-hidden="true" />
      </button>
      {open ? (
        <div role="menu" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 60, minWidth: '220px', display: 'flex', flexDirection: 'column', padding: '6px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-lg),0 0 0 1px var(--color-divider)' }}>
          <span style={{ padding: '8px 10px 6px', fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Your region</span>
          {opts.map((o) => {
            const on = myRegion === o.k;
            return (
              <button key={o.label} type="button" role="menuitemradio" aria-checked={on} onClick={() => onPick(o.k)} className="hv-t08" style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '7px', background: on ? 'rgba(120,183,179,.08)' : 'transparent' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ font: '500 14px/1 var(--font-body)', color: on ? '#78b7b3' : 'var(--color-text)' }}>{o.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)' }}>{o.sub}</span>
                </span>
                <span style={{ fontSize: '12px', color: '#78b7b3' }}>{on && o.k ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
