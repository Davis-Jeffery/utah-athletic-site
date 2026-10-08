// /contact: main office, regional leadership cards and the message form.
// ?region=&program= prefill the form. Picking a regional leader updates the live "To:" line.
// The form is front-end only for now (see "Open work" in CLAUDE.md).
import React, { useEffect, useState } from 'react';
import { EnvelopeSimple, Check } from '@phosphor-icons/react';
import { MAIN_EMAIL, ORDER } from '../data/site';
import { Field, ROW_RULE } from './ui.jsx';

const LEADERS = [['md', 'Managing Director'], ['doc', 'Director of Coaching'], ['any', 'Either']];
const pill = (on) => ({ border: `1px solid ${on ? '#78b7b3' : 'var(--color-divider)'}`, background: on ? 'rgba(120,183,179,.12)' : 'transparent', color: on ? '#78b7b3' : 'var(--color-neutral-300)' });

export default function ContactApp({ regions, programs }) {
  const [region, setRegion] = useState(null);
  const [program, setProgram] = useState('');
  const [leader, setLeader] = useState('md');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    if (regions.some((r) => r.id === q.get('region'))) setRegion(q.get('region'));
    if (ORDER.includes(q.get('program'))) setProgram(q.get('program'));
  }, [regions]);

  const rm = regions.find((r) => r.id === region);
  const to = !rm ? `Main office · ${MAIN_EMAIL}`
    : leader === 'any' ? `${rm.label} regional leadership · ${rm.managingDirector.email}`
      : leader === 'doc' ? `Director of Coaching, ${rm.label} region · ${rm.directorOfCoaching.email}`
        : `Managing Director, ${rm.label} region · ${rm.managingDirector.email}`;
  const programOpts = [...programs.map((p) => [p.id, p.name]), ['', 'Not sure yet']];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '16px clamp(16px,4vw,56px) 104px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '22px', borderRadius: '12px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.14),transparent 60%),var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}><EnvelopeSimple size={16} aria-hidden="true" />Main office</span>
          <a href={'mailto:' + MAIN_EMAIL} className="hv-outline" style={{ font: '500 clamp(22px,2.4vw,30px)/1.1 var(--font-heading)', letterSpacing: '-.02em', color: 'var(--color-text)', overflowWrap: 'anywhere' }}>{MAIN_EMAIL}</a>
          <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>General questions, registration, billing and media.</span>
        </div>
        <h2 style={{ margin: 0, padding: '14px 2px 2px', fontSize: '11px', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Regional leadership</h2>
        {regions.map((r) => (
          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px 20px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: region === r.id ? '0 0 0 1px #78b7b3,0 12px 30px rgba(0,0,0,.35)' : 'var(--shadow-sm)', transition: 'box-shadow .3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ font: '500 22px/1 var(--font-heading)', letterSpacing: '-.03em' }}>{r.label}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-neutral-500)' }}>{r.area}</span>
            </div>
            {[['Managing Director', r.managingDirector], ['Director of Coaching', r.directorOfCoaching]].map(([role, person]) => (
              <div key={role} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', alignItems: 'center', paddingTop: '10px', background: ROW_RULE }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{role}</span><span style={{ fontSize: '15px' }}>{person.name}</span></span>
                <a href={'mailto:' + person.email} style={{ fontSize: '13px', overflowWrap: 'anywhere' }}>{person.email}</a>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderRadius: '16px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md),0 0 0 1px var(--color-divider)', overflow: 'hidden' }}>
        {sent ? (
          <div role="status" style={{ padding: '56px 32px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}><Check aria-hidden="true" /></span>
            <span style={{ font: '500 34px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>Message sent.</span>
            <span style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{rm ? `The ${rm.label} regional team` : 'Our main office'} will reply within 48 hours.</span>
            <button type="button" onClick={() => setSent(false)} className="hv-ghost" style={{ cursor: 'pointer', marginTop: '6px', minHeight: '44px', background: 'transparent', border: '1px solid var(--color-divider)', color: 'var(--color-text)', padding: '0 16px', borderRadius: '8px', font: '500 14px/1 var(--font-body)' }}>Send another</button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ padding: 'clamp(22px,3vw,32px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 style={{ margin: 0, font: '500 26px/1.1 var(--font-heading)', letterSpacing: '-.03em' }}>Send a message</h2>
              <span aria-live="polite" style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>To: <span style={{ color: 'var(--color-accent-300)' }}>{to}</span></span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
              <Field label="Your name"><input className="ua-input" name="name" required autoComplete="name" /></Field>
              <Field label="Email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
              <Field label="Phone"><input className="ua-input" name="phone" type="tel" placeholder="Optional" autoComplete="tel" /></Field>
              <Field label="Topic">
                <select className="ua-input" name="topic"><option>General question</option><option>Tryouts &amp; player trials</option><option>Registration &amp; billing</option><option>Coaching opportunities</option><option>Partnerships &amp; media</option></select>
              </Field>
            </div>
            <Choice label="Program">
              {programOpts.map(([k, l]) => <button key={l} type="button" aria-pressed={program === k} onClick={() => setProgram(k)} style={{ cursor: 'pointer', minHeight: '40px', padding: '0 13px', borderRadius: '8px', font: '500 13px/1 var(--font-body)', transition: 'all .2s', ...pill(program === k) }}>{l}</button>)}
            </Choice>
            <Choice label="Do you want to reach a specific regional leader?" grid>
              {[{ id: null, label: 'No', area: 'Main office' }, ...regions].map((r) => (
                <button key={r.label} type="button" aria-pressed={region === r.id} onClick={() => setRegion(r.id)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px', padding: '11px 13px', borderRadius: '8px', textAlign: 'left', transition: 'all .2s', ...pill(region === r.id) }}>
                  <span style={{ font: '500 14px/1 var(--font-body)' }}>{r.label}</span><span style={{ fontSize: '11px', color: 'var(--color-neutral-500)' }}>{r.area}</span>
                </button>
              ))}
            </Choice>
            {rm ? (
              <Choice label="Which leader?">
                {LEADERS.map(([k, l]) => <button key={k} type="button" aria-pressed={leader === k} onClick={() => setLeader(k)} style={{ cursor: 'pointer', minHeight: '40px', padding: '0 13px', borderRadius: '8px', font: '500 13px/1 var(--font-body)', transition: 'all .2s', ...pill(leader === k) }}>{l}</button>)}
              </Choice>
            ) : null}
            <Field label="Message"><textarea className="ua-input" name="message" required rows={5} placeholder="How can we help?" /></Field>
            <button type="submit" className="hv-t16" style={{ cursor: 'pointer', minHeight: '50px', background: 'rgba(120,183,179,.08)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', borderRadius: '8px' }}>Send message →</button>
          </form>
        )}
      </div>
    </div>
  );
}

const Choice = ({ label, grid, children }) => (
  <div role="group" aria-label={label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{label}</span>
    <div style={grid ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '6px' } : { display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{children}</div>
  </div>
);
