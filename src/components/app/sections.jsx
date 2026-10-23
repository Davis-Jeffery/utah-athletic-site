// Program page sections shared with the adult league pages: season timeline, typical week, staff cards.
import React, { useState } from 'react';
import { MONTHS } from '../../data/site';
import { ACC, SectionHead, Headshot } from '../ui.jsx';
import StaffBio from '../StaffBio.jsx';

// 04 · The year: month axis with clickable phases and the selected phase's detail.
export function Season({ p, kicker = '04 · The year' }) {
  const [sel, setSel] = useState(0);
  const range = (ph) => MONTHS[ph.from] + (ph.to - ph.from > 1 ? ' – ' + MONTHS[ph.to - 1] : '');
  const cur = p.phases[sel] || p.phases[0];
  return (
    <section id="sec-season" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <SectionHead kicker={kicker} title="Season overview" />
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '760px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)' }}>
            {MONTHS.map((m) => <span key={m} style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', padding: '0 0 8px 8px', borderLeft: '1px solid var(--color-divider)' }}>{m}</span>)}
          </div>
          <div style={{ position: 'relative', height: '72px' }}>
            {p.phases.map((ph, i) => {
              const on = sel === i;
              return (
                <button key={ph.label} type="button" aria-pressed={on} onClick={() => setSel(i)} onMouseEnter={() => setSel(i)} style={{ position: 'absolute', top: 0, bottom: 0, left: (ph.from / 12) * 100 + '%', width: ((ph.to - ph.from) / 12) * 100 + '%', cursor: 'pointer', border: `1px solid ${on ? ACC : 'transparent'}`, borderRadius: '8px', background: on ? 'rgba(120,183,179,.18)' : 'var(--color-surface)', color: on ? 'var(--color-accent-200)' : 'var(--color-neutral-300)', padding: '0 12px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', overflow: 'hidden', boxShadow: '0 0 0 2px var(--color-bg)', transition: 'all .25s' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', opacity: 0.75 }}>{range(ph)}</span>
                  <span style={{ font: '500 15px/1 var(--font-heading)', whiteSpace: 'nowrap' }}>{ph.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '28px', padding: '24px 26px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{range(cur)}</span>
          <span style={{ font: '500 30px/1 var(--font-heading)', letterSpacing: '-.03em' }}>{cur.label}</span>
        </div>
        <p style={{ margin: 0, alignSelf: 'center', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>{cur.d}</p>
      </div>
    </section>
  );
}

// 05 · Commitment: a typical week, training and matches by day.
export function WeekGrid({ week, note, kicker = '05 · Commitment' }) {
  return (
    <section id="sec-schedule" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', flexWrap: 'wrap' }}>
        <SectionHead kicker={kicker} title="A typical week" />
        <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: 'var(--color-neutral-400)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', border: '1px solid var(--color-accent)' }} />Training</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--color-accent-700)' }} />Match</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '8px' }}>
        {week.map((d) => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '170px', padding: '12px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ font: '500 15px/1 var(--font-heading)', color: 'var(--color-neutral-300)' }}>{d.day}</span>
            {(d.items.length ? d.items : [null]).map((it, i) => {
              const m = it && it.kind === 'match';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '9px 10px', borderRadius: '6px', background: !it ? 'transparent' : m ? 'var(--color-accent-700)' : 'rgba(120,183,179,.06)', color: !it ? 'var(--color-neutral-600)' : m ? 'var(--color-accent-100)' : 'var(--color-text)', boxShadow: `inset 0 0 0 1px ${!it ? 'rgba(233,233,237,.06)' : m ? 'transparent' : 'rgba(120,183,179,.55)'}` }}>
                  <span style={{ fontSize: '10px', letterSpacing: '.04em', opacity: 0.8, minHeight: '10px' }}>{it ? it.time : ''}</span>
                  <span style={{ font: '500 13px/1.25 var(--font-body)' }}>{it ? it.label : 'Rest'}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {note ? <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-neutral-400)' }}>{note}</p> : null}
    </section>
  );
}

// Staff cards: headshot, title, name, bio and email.
export function StaffGrid({ people }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: '12px' }}>
      {people.map((d) => (
        <div key={d.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px,140px) 1fr', gap: '20px', padding: '14px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
          <Headshot pic={d.headshot} name={d.name} style={{ aspectRatio: '4 / 5', borderRadius: '6px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 6px 6px 0' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{d.role}</span>
            <span style={{ font: '500 26px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{d.name}</span>
            <StaffBio person={d} />
            {d.email ? <a href={'mailto:' + d.email} style={{ marginTop: 'auto', fontSize: '13px', overflowWrap: 'anywhere' }}>{d.email}</a> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
