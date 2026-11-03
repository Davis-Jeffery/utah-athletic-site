// The Rec program's "How we play" section (its own section in Page layout, `formats`).
// Content: Studio > Programs > Recreation > How we play.
import React from 'react';
import { SectionHead } from './ui.jsx';

const th = { textAlign: 'left', padding: '12px 16px', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-neutral-500)', borderBottom: '1px solid var(--color-divider)', whiteSpace: 'nowrap' };
const td = { padding: '14px 16px', fontSize: '14px', borderBottom: '1px solid var(--color-divider)', verticalAlign: 'top' };

export default function RecFormats({ formats: f, kicker }) {
  // Columns with nothing in any division (e.g. Roster) are left out.
  const any = (k) => f.divisions.some((d) => d[k]);
  const cols = [
    ['Division', (d) => d.division, { color: 'var(--color-accent)', fontWeight: 500 }],
    ['Format', (d) => `${d.format}${d.keepers ? ' + keeper' : ', no keepers'}`],
    ...(any('field') ? [['Field (ft)', (d) => d.field]] : []),
    ...(any('goals') ? [['Goals (ft)', (d) => d.goals]] : []),
    ...(any('ball') ? [['Ball', (d) => (d.ball ? `Size ${d.ball}` : '')]] : []),
    ...(any('length') ? [['Game length', (d) => d.length]] : []),
    ...(any('roster') ? [['Roster', (d) => d.roster]] : []),
    ...(any('referees') ? [['Referees', (d) => d.referees, { color: 'var(--color-neutral-300)' }]] : []),
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <SectionHead kicker={kicker} title="How we play" intro={f.intro} maxWidth="680px" />
      <div style={{ overflowX: 'auto', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {cols.map(([h]) => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {f.divisions.map((d) => (
              <tr key={d.division}>
                {cols.map(([h, v, s]) => <td key={h} style={{ ...td, ...s }}>{v(d)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '12px' }}>
        {f.rules.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '18px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', fontSize: '14px', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, maxWidth: '720px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-neutral-500)' }}>{f.combining}</p>
    </div>
  );
}
