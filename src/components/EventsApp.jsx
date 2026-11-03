// /events: status filter chips with counts and the event card grid. Status comes from each
// event's current session (see src/lib/schedule.ts) and updates to the visitor's date after load.
import React, { useState } from 'react';
import { CalendarBlank, MapPin, SoccerBall, UsersThree, ArrowUpRight } from '@phosphor-icons/react';
import { eventsWithStatus, eventAction, isExternal, EVENT_BADGE, EVENT_STATUS_LABEL } from '../lib/schedule';
import { useToday } from './ui.jsx';

const FILTERS = [['all', 'All events'], ['open', 'Registration open'], ['coming', 'Coming up'], ['complete', 'Complete']];
// "Registration open" includes sold-out events; "Coming up" also lists events whose registration has
// closed or that are being played now.
const GROUP = { open: 'open', full: 'open', coming: 'coming', closed: 'coming', live: 'coming', complete: 'complete' };
const matches = (f, s) => f === 'all' || GROUP[s] === f;

export default function EventsApp({ events, builtOn }) {
  const today = useToday(builtOn);
  const [f, setF] = useState('all');
  const list = eventsWithStatus(events, today);
  const cards = list.filter((e) => matches(f, e.status));
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div role="group" aria-label="Filter events" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {FILTERS.map(([k, l]) => {
          const on = f === k;
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => setF(k)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', padding: '0 14px', borderRadius: '8px', border: `1px solid ${on ? '#78b7b3' : 'var(--color-divider)'}`, background: on ? 'rgba(120,183,179,.12)' : 'transparent', color: on ? '#b5e1dd' : 'var(--color-neutral-300)', font: '500 14px/1 var(--font-body)', transition: 'all .2s' }}>
              {l}<span style={{ fontSize: '12px', color: 'var(--color-neutral-500)' }}>{list.filter((e) => matches(k, e.status)).length}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,290px),1fr))', gap: '14px' }}>
        {cards.map((e) => {
          const b = EVENT_BADGE[e.status], past = e.status === 'complete', s = e.session;
          const { note, action } = eventAction(e);
          const out = isExternal(action.href) ? { target: '_blank', rel: 'noopener' } : {};
          // Sold out and Live get a solid red badge, so they read at a glance.
          const loud = e.status === 'full' || e.status === 'live';
          return (
            <article key={e.id} className="hv-event" style={{ '--ev-accent': e.brand.accent, display: 'flex', flexDirection: 'column', borderRadius: '14px', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', opacity: past ? 0.72 : 1, transition: 'transform .25s,box-shadow .25s' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: `radial-gradient(ellipse at 30% 20%,${e.brand.bg2},${e.brand.bg} 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {e.logo
                  ? <img src={e.logo.src} alt={e.logo.alt || `${e.name} logo`} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: e.logo.pos }} />
                  : <span style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', border: `1px dashed ${e.brand.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px', fontSize: '10px', letterSpacing: '.06em', textTransform: 'uppercase', color: e.brand.ink, opacity: 0.7 }}>{e.name} logo</span>}
                <span style={{ position: 'absolute', left: '12px', top: '12px', display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 10px', borderRadius: '6px', background: loud ? 'var(--color-alert)' : 'rgba(17,19,24,.75)', color: b.fg, boxShadow: b.ring, fontSize: '11px', fontWeight: loud ? 600 : 400, letterSpacing: '.08em', textTransform: 'uppercase', backdropFilter: 'blur(8px)' }}>
                  <span className={e.status === 'live' ? 'ua-pulse' : undefined} style={{ width: '6px', height: '6px', borderRadius: '50%', background: loud ? '#fff' : b.dot, boxShadow: `0 0 8px ${b.dot}` }} />{EVENT_STATUS_LABEL[e.status]}
                </span>
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '3px', background: e.brand.accent }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 style={{ margin: 0, font: '500 24px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{e.name}</h2>
                  <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{e.tagline}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 12px', alignItems: 'center', fontSize: '13px' }}>
                  <CalendarBlank size={16} color={e.brand.accent} aria-label="Dates" /><span>{s.dates}</span>
                  <MapPin size={16} color={e.brand.accent} aria-label="Location" /><a href={s.mapUrl} target="_blank" rel="noopener" className="hv-link" title={`Directions to ${s.location}`} style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--color-neutral-600)', textUnderlineOffset: '3px' }}>{s.location}</a>
                  {s.format ? <><SoccerBall size={16} color={e.brand.accent} aria-label="Format" /><span>{s.format}</span></> : null}
                  {s.ages ? <><UsersThree size={16} color={e.brand.accent} aria-label="Ages" /><span>{s.ages}</span></> : null}
                </div>
                <span style={{ fontSize: '12px', color: e.status === 'full' ? 'var(--color-alert)' : 'var(--color-neutral-500)' }}>{note}</span>
                <a href={action.href} {...out} className="hv-ghost" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '46px', borderRadius: '8px', border: `1px solid ${e.brand.accent}`, color: e.brand.ink, font: '500 14px/1 var(--font-body)', transition: 'background .2s' }}>{action.label}{out.target ? <ArrowUpRight aria-hidden="true" /> : ' →'}</a>
                {e.hosted && action.href !== e.href ? <a href={e.href} className="hv-link" style={{ alignSelf: 'center', fontSize: '13px', color: 'var(--color-neutral-300)' }}>Tournament details →</a> : null}
                {!past ? <a href={`/contact/?event=${e.id}`} className="hv-link" style={{ alignSelf: 'center', fontSize: '13px', color: 'var(--color-neutral-400)' }}>Questions? Message the directors</a> : null}
              </div>
            </article>
          );
        })}
      </div>
      {!cards.length ? <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-neutral-400)' }}>No events here right now.</p> : null}
    </section>
  );
}
