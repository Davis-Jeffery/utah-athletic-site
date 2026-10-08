// Site footer. `note` replaces the social links on pages that need a line of context.
import React from 'react';
import { SOCIAL } from '../data/site';

export default function SiteFooter({ note }) {
  return (
    <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '28px clamp(16px,4vw,56px)', fontSize: '13px', color: 'var(--color-neutral-500)' }}>
      <span>© {new Date().getFullYear()} Utah Athletic · Part of Athletic Global</span>
      {note ? <span>{note}</span> : (
        <div style={{ display: 'flex', gap: '20px' }}>
          {SOCIAL.map((s) => <a key={s.label} href={s.href} className="hv-white" style={{ color: 'var(--color-neutral-400)' }}>{s.label}</a>)}
        </div>
      )}
    </footer>
  );
}
