// /tryouts: sticky Region and Level filters (synced to ?region=&level= and the ua_region
// cookie), results grouped by level, the Academy invitation form and supporting cards.
import React, { useEffect, useState } from 'react';
import { MapPin, CalendarBlank, Clock, Backpack, CalendarX, UserCircle, Check } from '@phosphor-icons/react';
import { ORDER, REGION_ORDER, TRYOUT_BRING } from '../data/site';
import { fmtDate, tryoutsFor, readRegion, rememberRegion } from '../lib/schedule';
import { ACC, Field, useToday } from './ui.jsx';

const LEVELS = [['', 'All levels'], ...ORDER.map((k) => [k, null])];
const seg = (on) => ({ background: on ? 'rgba(120,183,179,.16)' : 'transparent', color: on ? '#b5e1dd' : 'var(--color-neutral-300)', boxShadow: on ? 'inset 0 0 0 1px #78b7b3' : 'none' });
const label10 = { fontSize: '10px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' };
const card = { display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' };

export default function TryoutsApp({ data }) {
  const today = useToday(data.builtOn);
  const [region, setRegion] = useState('north');
  const [level, setLevel] = useState('');
  const [fade, setFade] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    const r = readRegion();
    const l = new URLSearchParams(location.search).get('level');
    if (r) setRegion(r);
    if (l && ORDER.includes(l)) setLevel(l);
  }, []);

  const update = (patch) => {
    setFade(true);
    setTimeout(() => {
      const r = patch.region ?? region, l = patch.level ?? level;
      setRegion(r); setLevel(l); setFade(false); setInviteSent(false);
      rememberRegion(r);
      const u = new URL(location.href);
      u.searchParams.set('region', r);
      if (l) u.searchParams.set('level', l); else u.searchParams.delete('level');
      history.replaceState(null, '', u);
    }, 140);
  };

  const P = Object.fromEntries(data.programs.map((p) => [p.id, p]));
  const R = data.regions.find((x) => x.id === region);
  const levels = level ? [level] : ORDER;
  let count = 0;
  const blocks = levels.map((id) => {
    const p = P[id], st = p.regions[region];
    const kicker = `${p.name} · ${p.ages} · ${R.label}`;
    if (st.status !== 'active') {
      const alt = REGION_ORDER.find((k) => p.regions[k].status === 'active');
      const altR = data.regions.find((x) => x.id === alt);
      return {
        id, p, kicker, title: st.status === 'soon' ? 'Coming ' + st.season : 'Not offered here', empty: true,
        head: st.status === 'soon' ? `${p.name} launches in ${R.label}: ${st.season}` : `${p.name} isn't offered in the ${R.label} region`,
        copy: st.status === 'soon'
          ? (p.invite ? `There are no ${R.label} ${p.name} tryouts yet. Request an invitation and the ${R.label} staff will contact you as the program opens.` : `Register interest and the ${R.label} team will contact you first when sign-up opens.`)
          : `${R.area} families are welcome at our ${altR.label} hub in ${p.regions[alt].hub}.`,
        cta: st.status === 'soon' ? (p.invite ? 'Request an invitation' : 'Register interest') : `See ${altR.label} ${p.name}`,
        href: st.status === 'soon' ? (p.invite ? '#invite' : `/${id}/${region}/`) : `/${id}/${alt}/`,
      };
    }
    if (p.kind === 'season') return { id, p, kicker, title: 'Season sign-up', season: true };
    const rows = tryoutsFor(data, { program: id, region }, today);
    count += rows.length;
    return rows.length
      ? { id, p, kicker, title: `${rows.length} tryout sessions`, rows }
      : { id, p, kicker, title: 'No posted dates', empty: true, head: 'Dates to be announced', copy: `We'll post ${R.label} dates here as soon as they're set.`, cta: p.invite ? 'Request an invitation' : 'Get notified', href: p.invite ? '#invite' : `/contact/?region=${region}&program=${id}` };
  });
  const showInvite = levels.includes('academy');
  const contactHref = `/contact/?region=${region}${level ? '&program=' + level : ''}`;

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ background: 'linear-gradient(180deg,rgba(27,29,36,.97),rgba(21,23,29,.97))', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: 'inset 0 1px 0 rgba(120,183,179,.25),0 12px 30px rgba(0,0,0,.45)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px clamp(16px,4vw,56px)', display: 'flex', flexWrap: 'wrap', gap: '12px 28px', alignItems: 'center' }}>
            <div role="group" aria-label="Region" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
              <span style={label10}>Region</span>
              <div style={{ display: 'flex', gap: '4px', padding: '3px', borderRadius: '10px', background: 'var(--color-surface)' }}>
                {data.regions.map((r) => (
                  <button key={r.id} type="button" aria-pressed={region === r.id} onClick={() => update({ region: r.id })} style={{ cursor: 'pointer', minHeight: '40px', padding: '0 16px', borderRadius: '8px', border: 0, font: '500 14px/1 var(--font-body)', transition: 'all .2s', ...seg(region === r.id) }}>{r.label}</button>
                ))}
              </div>
            </div>
            <div role="group" aria-label="Level" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, maxWidth: '100%' }}>
              <span style={label10}>Level</span>
              <div style={{ display: 'flex', gap: '4px', padding: '3px', borderRadius: '10px', background: 'var(--color-surface)', overflowX: 'auto' }}>
                {LEVELS.map(([k, l]) => (
                  <button key={k || 'all'} type="button" aria-pressed={level === k} onClick={() => update({ level: k })} style={{ flex: 'none', cursor: 'pointer', minHeight: '40px', padding: '0 14px', borderRadius: '8px', border: 0, font: '500 14px/1 var(--font-body)', transition: 'all .2s', ...seg(level === k) }}>{l || P[k].name}</button>
                ))}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <span style={label10}>Showing</span>
              <span aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '40px', padding: '0 14px', borderRadius: '8px', background: 'rgba(120,183,179,.12)', boxShadow: 'inset 0 0 0 1px #78b7b3', font: '500 14px/1 var(--font-body)', color: '#e9e9ed', whiteSpace: 'nowrap' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ACC, boxShadow: '0 0 8px #78b7b3' }} />
                {R.label} · {level ? P[level].name : 'All levels'}{count ? ` · ${count} sessions` : ''}
              </span>
            </div>
          </div>
          <div style={{ height: '2px', background: 'linear-gradient(to right,transparent,#78b7b3 48px,#78b7b3 calc(100% - 48px),transparent)', opacity: 0.55 }} />
        </div>
      </div>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,56px) 40px', display: 'flex', flexDirection: 'column', gap: '44px', opacity: fade ? 0.25 : 1, transition: 'opacity .2s' }}>
        {blocks.map((b) => (
          <section key={b.id} aria-labelledby={`lv-${b.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{b.kicker}</span>
                <h2 id={`lv-${b.id}`} style={{ margin: 0, font: '500 clamp(28px,3.2vw,40px)/1 var(--font-heading)', letterSpacing: '-.035em' }}>{b.title}</h2>
              </div>
              <a href={`/${b.id}/${region}/`} style={{ fontSize: '13px', color: 'var(--color-accent-300)' }}>About {b.p.name} →</a>
            </div>

            {b.rows ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {b.rows.map((r) => (
                  <div key={r.id} className="hv-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 20px', padding: '14px 16px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s' }}>
                    <Cell label="Age group" flex="1 1 120px"><span style={{ font: '500 18px/1 var(--font-heading)', letterSpacing: '-.02em' }}>{r.age}</span></Cell>
                    <Cell label="Gender" flex="0 1 70px">{r.gender}</Cell>
                    <Cell label="Date" flex="1 1 120px">{fmtDate(r.date)}</Cell>
                    <Cell label="Time" flex="1 1 120px"><span style={{ whiteSpace: 'nowrap' }}>{r.time}</span></Cell>
                    <a href={r.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ flex: '2 1 220px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--color-text)' }}>
                      <span style={label10}>Location</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}><MapPin color={ACC} aria-hidden="true" />{r.venueName}</span>
                    </a>
                    <a href={b.p.registerUrl} target="_blank" rel="noopener" aria-label={`Register for ${b.p.name} ${r.age} ${r.gender}, ${fmtDate(r.date)}`} className="hv-t14" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '44px', padding: '0 18px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 14px/1 var(--font-body)', transition: 'background .2s' }}>Register →</a>
                  </div>
                ))}
              </div>
            ) : null}

            {b.empty ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '22px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-divider)' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '560px' }}>
                  <span style={{ font: '500 20px/1.2 var(--font-heading)' }}>{b.head}</span>
                  <span style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{b.copy}</span>
                </span>
                <a href={b.href} className="hv-t14" style={{ display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 18px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 14px/1 var(--font-body)' }}>{b.cta} →</a>
              </div>
            ) : null}

            {b.season ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '10px' }}>
                  {data.seasons.map((s) => (
                    <div key={s.id} style={card}>
                      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ font: '500 24px/1 var(--font-heading)', letterSpacing: '-.03em' }}>{s.name}</span>
                        <span style={{ fontSize: '12px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{s.span}</span>
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--color-neutral-300)' }}>
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CalendarBlank color={ACC} aria-hidden="true" />Starts {fmtDate(s.start)}</span>
                        <a href={R.seasonVenue.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-neutral-300)' }}><MapPin color={ACC} aria-hidden="true" />{R.seasonVenue.name}</a>
                        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Clock color={ACC} aria-hidden="true" />{s.signup}</span>
                      </span>
                      <a href={b.p.registerUrl} target="_blank" rel="noopener" className="hv-t14" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 14px/1 var(--font-body)' }}>Sign up for {s.name} →</a>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{b.p.name} has no tryouts. Every player who signs up is placed on a team.</span>
              </>
            ) : null}
          </section>
        ))}

        {showInvite ? (
          <section id="invite" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '24px', padding: 'clamp(20px,3vw,32px)', borderRadius: '14px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.14),transparent 60%),var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)', scrollMarginTop: '120px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Academy · {R.label}</span>
              <h2 style={{ margin: 0, font: '500 clamp(28px,3.2vw,40px)/1.02 var(--font-heading)', letterSpacing: '-.035em', textWrap: 'balance' }}>Request an invitation to trial</h2>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)', textWrap: 'pretty' }}>Can't make a posted date, or want to be seen sooner? Apply and the {R.label} Director of Coaching will invite you to a training session.</p>
            </div>
            {inviteSent ? (
              <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                <span style={{ font: '500 26px/1.1 var(--font-heading)' }}>Request sent.</span>
                <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>The {R.label} Director of Coaching will reply within 5 days.</span>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setInviteSent(true); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px', alignContent: 'start' }}>
                <Field label="Player name"><input className="ua-input" name="player" required style={{ minHeight: '44px' }} /></Field>
                <Field label="Birth year"><input className="ua-input" name="birthYear" required inputMode="numeric" pattern="20[0-9]{2}" placeholder="2013" style={{ minHeight: '44px' }} /></Field>
                <Field label="Parent email"><input className="ua-input" name="email" required type="email" autoComplete="email" style={{ minHeight: '44px' }} /></Field>
                <Field label="Current club"><input className="ua-input" name="club" placeholder="Optional" style={{ minHeight: '44px' }} /></Field>
                <button type="submit" className="hv-t16" style={{ gridColumn: '1 / -1', cursor: 'pointer', minHeight: '48px', borderRadius: '8px', border: '1px solid #78b7b3', background: 'rgba(120,183,179,.08)', color: '#b5e1dd', font: '500 15px/1 var(--font-body)' }}>Send to {R.label} Academy →</button>
              </form>
            )}
          </section>
        ) : null}

        <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Before you come · {R.label} region</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '10px' }}>
            <div style={card}>
              <CardHead Icon={Backpack}>What to bring</CardHead>
              {TRYOUT_BRING.map((b) => <span key={b} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--color-neutral-300)' }}><Check color={ACC} aria-hidden="true" />{b}</span>)}
            </div>
            <div style={card}>
              <CardHead Icon={CalendarX}>Missed your date?</CardHead>
              <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>Request a private trial with the {R.label} staff. We'll invite your player to a regular training session with the right age group.</span>
              <a href={showInvite ? '#invite' : contactHref} className="hv-t14" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 14px/1 var(--font-body)' }}>Request a private trial →</a>
            </div>
            <div style={card}>
              <CardHead Icon={UserCircle}>{R.label} contact</CardHead>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Managing Director</span><span style={{ fontSize: '15px' }}>{R.managingDirector.name}</span></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Director of Coaching</span><span style={{ fontSize: '15px' }}>{R.directorOfCoaching.name}</span></span>
              <a href={'mailto:' + R.managingDirector.email} style={{ fontSize: '14px' }}>{R.managingDirector.email}</a>
              <a href={contactHref} style={{ marginTop: 'auto', fontSize: '13px', color: 'var(--color-accent-300)' }}>Contact the {R.label} team →</a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const Cell = ({ label, flex, children }) => (
  <span style={{ flex, display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <span style={label10}>{label}</span>
    <span style={{ fontSize: '14px' }}>{children}</span>
  </span>
);
const CardHead = ({ Icon, children }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', font: '500 18px/1 var(--font-heading)' }}><Icon size={22} color={ACC} aria-hidden="true" />{children}</span>
);
