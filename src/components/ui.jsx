// Small building blocks shared by every page. Styles match the design's inline styles.
import React, { useEffect, useState } from 'react';
import { todayIso } from '../lib/schedule';

export const ACC = '#78b7b3';

// Section kicker: "01 · Who it's for". `line` adds the short rule used in page heroes.
export function Kicker({ children, line = false, size = 12, color = 'var(--color-accent)', style }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: size + 'px', letterSpacing: '.14em', textTransform: 'uppercase', color, ...style }}>
      {line ? <span style={{ width: '28px', height: '1px', background: 'var(--color-accent)', flex: 'none' }} /> : null}
      {children}
    </span>
  );
}

// Section heading block used on program pages.
export function SectionHead({ kicker, title, intro, maxWidth, size = 'clamp(38px,4.4vw,64px)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth }}>
      <Kicker>{kicker}</Kicker>
      <h2 style={{ margin: 0, font: `500 ${size}/1 var(--font-heading)`, letterSpacing: '-.04em', textWrap: 'balance' }}>{title}</h2>
      {intro ? <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)', textWrap: 'pretty' }}>{intro}</p> : null}
    </div>
  );
}

// Divider that fades out at both ends.
export const Rule = ({ style }) => (
  <div style={{ height: '1px', background: 'linear-gradient(to right,transparent,var(--color-divider) 48px,var(--color-divider) calc(100% - 48px),transparent)', ...style }} />
);
// Same fade, painted as a top border on list rows.
export const ROW_RULE = 'linear-gradient(to right,var(--color-divider),var(--color-divider) calc(100% - 48px),transparent) no-repeat top / 100% 1px';

// Outlined teal button or link (the design never fills buttons). 44px tall for touch.
const outline = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', padding: '0 18px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', background: 'transparent', font: '500 14px/1 var(--font-body)', cursor: 'pointer', textDecoration: 'none', transition: 'background .2s' };
export function OutlineLink({ href, children, external, style, className = 'hv-t14', ...rest }) {
  return <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})} className={className} style={{ ...outline, ...style }} {...rest}>{children}</a>;
}
export function OutlineButton({ children, style, className = 'hv-t14', ...rest }) {
  return <button type="button" className={className} style={{ ...outline, ...style }} {...rest}>{children}</button>;
}

// Labeled form field. Pass an <input>, <select> or <textarea> with className="ua-input".
export function Field({ label, children, style }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--color-neutral-400)', ...style }}>
      {label}
      {children}
    </label>
  );
}

export function SubmitButton({ children, style }) {
  return (
    <button type="submit" className="hv-t16" style={{ cursor: 'pointer', minHeight: '48px', background: 'rgba(120,183,179,.08)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', padding: '15px', borderRadius: '8px', ...style }}>
      {children}
    </button>
  );
}

// Confirmation shown after a form is sent.
export function Sent({ head, copy, again = 'Send another', onAgain, pad = '52px 28px' }) {
  return (
    <div role="status" style={{ padding: pad, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
      <span style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>✓</span>
      <span style={{ font: '500 30px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{head}</span>
      <span style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{copy}</span>
      <button type="button" onClick={onAgain} className="hv-ghost" style={{ cursor: 'pointer', marginTop: '6px', background: 'transparent', border: '1px solid var(--color-divider)', color: 'var(--color-text)', padding: '10px 16px', borderRadius: '8px', font: '500 14px/1 var(--font-body)' }}>{again}</button>
    </div>
  );
}

// Dashed tag marking copy or images still to be supplied.
export const Placeholder = ({ children }) => (
  <span style={{ alignSelf: 'flex-start', font: '500 10px/1 ui-monospace,Menlo,monospace', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-neutral-400)', border: '1px dashed var(--color-neutral-600)', borderRadius: '5px', padding: '5px 7px' }}>{children}</span>
);

// Striped box standing in for a photo that hasn't been supplied yet.
export const PhotoSlot = ({ label, style }) => (
  <div style={{ background: 'repeating-linear-gradient(135deg,#20232b 0 8px,#252830 8px 16px)', display: 'flex', alignItems: 'flex-end', padding: '8px', font: '500 10px/1 ui-monospace,Menlo,monospace', color: 'var(--color-neutral-600)', textTransform: 'uppercase', ...style }}>{label}</div>
);

// Club photo with the site-wide treatment: grayscale plus a teal color layer.
export function TealPhoto({ src, alt = '', position = 'center', brightness = 0.7, layer = 0.5, style, imgStyle }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, filter: `grayscale(1) contrast(1.15) brightness(${brightness})`, ...imgStyle }} />
      <div style={{ position: 'absolute', inset: 0, background: '#78b7b3', mixBlendMode: 'color', opacity: layer, pointerEvents: 'none' }} />
    </div>
  );
}

// Today's date (YYYY-MM-DD). Renders with the build date, then switches to the visitor's
// date once the page is live, so date-based status never mismatches during hydration.
export function useToday(builtOn) {
  const [today, setToday] = useState(builtOn);
  useEffect(() => { setToday(todayIso()); }, []);
  return today;
}
