// "How we play" block shown in the Rec program's Competition section.
// Content: Studio > Programs > Recreation > How we play.
import React from 'react';

const th = { textAlign: 'left', padding: '12px 16px', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--color-neutral-500)', borderBottom: '1px solid var(--color-divider)', whiteSpace: 'nowrap' };
const td = { padding: '14px 16px', fontSize: '14px', borderBottom: '1px solid var(--color-divider)', verticalAlign: 'top' };

export default function RecFormats({ formats: f }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
        <h3 style={{ margin: 0, font: '500 28px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>How we play</h3>
        <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>{f.intro}</p>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Division', 'Format', 'Field (yds)', 'Goals (ft)', 'Ball', 'Roster', 'Referees'].map((h) => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {f.divisions.map((d) => (
              <tr key={d.division}>
                <td style={{ ...td, color: 'var(--color-accent)', fontWeight: 500 }}>{d.division}</td>
                <td style={td}>{d.format}{d.keepers ? ' + keeper' : ', no keepers'}</td>
                <td style={td}>{d.field}</td>
                <td style={td}>{d.goals}</td>
                <td style={td}>{d.ball ? `Size ${d.ball}` : ''}</td>
                <td style={td}>{d.roster}</td>
                <td style={{ ...td, color: 'var(--color-neutral-300)' }}>{d.referees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '12px' }}>
        {f.rules.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', padding: '18px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', fontSize: '14px', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>0{i + 1}</span>
            <span>{r}</span>
          </div>
        ))}
      </div>
      <p style={{ margin: 0, maxWidth: '720px', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-neutral-500)' }}>{f.combining}</p>
    </div>
  );
}
