// A program's region tab (/academy/north/ etc.). Three states, from the program's `regions`:
// active (leadership, coaches, tryouts, fees, contact), soon (register interest) and none
// (point to the nearest region that runs it). Forms are front-end only for now.
import React, { useState } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { REGION_ORDER } from '../../data/site';
import { fmtDate, tryoutsFor, money, signupText } from '../../lib/schedule';
import { Kicker, SectionHead, Field, SubmitButton, Sent, PhotoSlot, ROW_RULE } from '../ui.jsx';

export default function RegionTab({ program: p, regionId, data, today, onRegion }) {
  const rm = data.regions.find((r) => r.id === regionId);
  const rd = p.regions[regionId];
  const title = `${rm.label} ${p.name}`;
  const isAcademy = p.id === 'academy';
  const line = rd.status === 'active'
    ? `The same ${p.name} program and standard, run locally from ${rd.hub}. Staff, tryouts${isAcademy ? '' : ', fees'} and contacts below are specific to the ${rm.label} region.`
    : rd.status === 'soon' ? `${p.name} launches in the ${rm.label} region in ${rd.season}.`
      : `This program does not run in the ${rm.label} region.`;
  const leads = [
    { role: 'Managing Director', ...rm.managingDirector, scope: `${rm.label} region · all programs` },
    { role: 'Director of Coaching', ...rm.directorOfCoaching, scope: `${rm.label} region · coaching & curriculum` },
  ];

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
      <section style={{ padding: '72px 0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Kicker>{rm.label} region · {rm.area}</Kicker>
        <h2 style={{ margin: 0, font: '500 clamp(48px,6.4vw,96px)/.95 var(--font-heading)', letterSpacing: '-.05em' }}>{title}</h2>
        <p style={{ margin: 0, maxWidth: '620px', fontSize: '17px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>{line}</p>
      </section>

      {rd.status === 'active' ? (
        <>
          <section id="sec-rlead" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionHead kicker="01 · Regional leadership" title={`Who runs ${title}`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: '12px' }}>
              {leads.map((l) => <LeadCard key={l.role} lead={l} />)}
            </div>
          </section>
          <section id="sec-rcoach" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionHead kicker="02 · Coaching staff" title={`${title} coaches`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap: '16px' }}>
              {p.coaches.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <PhotoSlot label="Coach photo" style={{ aspectRatio: '1', borderRadius: '8px', padding: '10px', background: 'repeating-linear-gradient(135deg,#1a1d23 0 8px,#1f2229 8px 16px)' }} />
                  <span style={{ font: '500 17px/1.2 var(--font-heading)' }}>{c.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{c.role}</span>
                </div>
              ))}
            </div>
          </section>
          <Tryouts p={p} rm={rm} data={data} today={today} />
          {!isAcademy ? (
            <section id="sec-rfee" style={{ padding: '48px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Kicker>04 · Fees</Kicker>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ font: '500 clamp(80px,10vw,144px)/.9 var(--font-heading)', letterSpacing: '-.06em', color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{money(p.cost + (rd.feeDelta || 0))}</span>
                  <span style={{ fontSize: '15px', color: 'var(--color-neutral-400)' }}>{p.unit}</span>
                </div>
                <p style={{ margin: 0, maxWidth: '460px', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{p.costNote}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', paddingBottom: '12px' }}>What's included</span>
                {p.includes.map((inc) => (
                  <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 0', fontSize: '16px', background: ROW_RULE }}><span style={{ width: '7px', height: '7px', flex: 'none', transform: 'rotate(45deg)', background: 'var(--color-accent)' }} />{inc}</div>
                ))}
              </div>
            </section>
          ) : null}
          <section id="sec-rcontact" style={{ padding: '24px 0 96px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: 'clamp(22px,3vw,32px) clamp(22px,3vw,36px)', borderRadius: '14px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.16),transparent 60%),var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Kicker>{isAcademy ? '04' : '05'} · Contact</Kicker>
                <span style={{ font: '500 clamp(28px,3vw,40px)/1.05 var(--font-heading)', letterSpacing: '-.035em' }}>Want to contact our leaders?</span>
                <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>Reach the {rm.label} Managing Director or Director of Coaching directly.</span>
              </div>
              <a href={`/contact/?region=${rm.id}&program=${p.id}`} className="hv-t14" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '48px', padding: '0 20px', borderRadius: '10px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 15px/1 var(--font-body)', transition: 'background .2s' }}>Contact us →</a>
            </div>
          </section>
        </>
      ) : null}

      {rd.status === 'soon' ? (
        <section id="sec-rsoon" style={{ padding: '32px 0 96px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '12px', padding: 'clamp(20px,3vw,32px)', borderRadius: '14px', border: '1px dashed #78b7b3', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.12),transparent 60%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '8px' }}>
              <span style={{ alignSelf: 'flex-start', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 9px', borderRadius: '5px', background: 'rgba(120,183,179,.14)', color: 'var(--color-accent-300)' }}>Coming {rd.season}</span>
              <h3 style={{ margin: 0, font: '500 clamp(32px,3.6vw,52px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>{title} is coming.</h3>
              <p style={{ margin: 0, maxWidth: '460px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>Register interest and the {rm.label} regional team will contact you first with {p.kind === 'season' ? 'sign-up dates' : 'tryout dates'} and program details.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {leads.map((l) => <LeadCard key={l.role} lead={l} />)}
              </div>
            </div>
            <InterestForm p={p} rm={rm} title={title} />
          </div>
        </section>
      ) : null}

      {rd.status === 'none' ? (
        <section id="sec-rnone" style={{ padding: '32px 0 96px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: 'clamp(24px,4vw,48px)', borderRadius: '14px', border: '1px dashed var(--color-neutral-600)' }}>
            <span style={{ alignSelf: 'flex-start', fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', padding: '6px 9px', borderRadius: '5px', boxShadow: 'inset 0 0 0 1px var(--color-divider)', color: 'var(--color-neutral-400)' }}>Not offered</span>
            <h3 style={{ margin: 0, maxWidth: '760px', font: '500 clamp(30px,3.4vw,48px)/1.05 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>{p.name} isn't offered in the {rm.label} region.</h3>
            <p style={{ margin: 0, maxWidth: '560px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>Families in {rm.area} are welcome at our nearest hub.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {REGION_ORDER.filter((k) => p.regions[k].status === 'active').map((k) => (
                <button key={k} type="button" onClick={() => onRegion(k)} className="hv-t08" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', padding: '16px 18px', borderRadius: '10px', border: '1px solid var(--color-accent)', background: 'transparent', color: 'var(--color-text)', textAlign: 'left' }}>
                  <span style={{ font: '500 18px/1 var(--font-heading)' }}>{data.regions.find((r) => r.id === k).label} {p.name} →</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{p.regions[k].hub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function LeadCard({ lead }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '18px', padding: '14px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
      <PhotoSlot label="Headshot" style={{ aspectRatio: '4 / 5', borderRadius: '6px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 4px 4px 0', minWidth: 0 }}>
        <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{lead.role}</span>
        <span style={{ font: '500 24px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{lead.name}</span>
        <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{lead.scope}</span>
        <a href={'mailto:' + lead.email} style={{ marginTop: 'auto', fontSize: '13px', overflowWrap: 'anywhere' }}>{lead.email}</a>
      </div>
    </div>
  );
}

// 03 · Tryouts: posted dates on the left, the trial application or registration form on the right.
function Tryouts({ p, rm, data, today }) {
  const season = p.kind === 'season';
  const trial = !season && p.enrollment !== 'tryouts';
  const rows = season
    ? data.seasons.map((s) => ({ key: s.id, title: `${s.name} · ${s.span}`, when: `Starts ${fmtDate(s.start)} · ${signupText(s, today)}`, where: rm.seasonVenue.name, mapUrl: rm.seasonVenue.mapUrl, cta: 'Sign up', pick: s.name }))
    : tryoutsFor(data, { program: p.id, region: rm.id }, today).map((t) => ({ key: t.id, title: `${t.age} · ${t.gender}`, when: `${fmtDate(t.date)} · ${t.time}`, where: t.venueName, mapUrl: t.mapUrl, cta: 'Register', pick: `${fmtDate(t.date)}, ${t.age} ${t.gender}` }));
  const head = trial ? 'Player trial application' : season ? `Sign up in ${rm.label}` : `Next tryouts in ${rm.label}`;
  const copy = trial
    ? `Tryout registration opens ${p.registrationOpens}. Until then, apply for a private trial with ${rm.label} staff. We review every application.`
    : p.joinCopy;
  return (
    <section id="sec-rtry" style={{ padding: '48px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '48px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Kicker>03 · {season ? 'Sign up' : 'Tryouts'}</Kicker>
        <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>{head}</h2>
        <p style={{ margin: 0, maxWidth: '460px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{copy}</p>
        {rows.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '520px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{season ? 'Season sign-up' : 'Posted tryout dates'}</span>
            {rows.slice(0, 4).map((r) => (
              <div key={r.key} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 14px', padding: '12px 14px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ font: '500 15px/1.1 var(--font-heading)' }}>{r.title}</span><span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{r.when}</span></span>
                <a href={r.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-neutral-300)' }}><MapPin color="#78b7b3" aria-hidden="true" />{r.where}</a>
                <a href={p.registerUrl} target="_blank" rel="noopener" className="hv-t14" style={{ flex: 'none', display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 14px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 13px/1 var(--font-body)' }}>{r.cta} →</a>
              </div>
            ))}
            <a href={`/tryouts/?region=${rm.id}&level=${p.id}`} style={{ paddingTop: '4px', fontSize: '13px', color: 'var(--color-accent-300)' }}>All {rm.label} {season ? 'sessions' : 'tryouts & dates'} →</a>
          </div>
        ) : null}
      </div>
      <div style={{ borderRadius: '14px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', alignSelf: 'start' }}>
        {trial ? <TrialForm p={p} rm={rm} /> : <RegisterForm p={p} choices={rows.map((r) => r.pick)} />}
      </div>
    </section>
  );
}

function TrialForm({ p, rm }) {
  const [sent, setSent] = useState(false);
  if (sent) return <Sent head="Application received." copy={`The ${rm.label} Director of Coaching will review it and contact you to schedule a trial.`} again="Submit another" onAgain={() => setSent(false)} />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-neutral-300)' }}><span style={{ width: '7px', height: '7px', flex: 'none', borderRadius: '50%', background: '#78b7b3', boxShadow: '0 0 8px #78b7b3' }} />Player trial application · reviewed by the {rm.label} Director of Coaching</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
        <Field label="Player name"><input className="ua-input" name="player" required placeholder="First and last" autoComplete="off" /></Field>
        <Field label="Birth year"><select className="ua-input" name="birthYear">{p.years.map((y) => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Parent email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
        <Field label="Parent phone"><input className="ua-input" name="phone" type="tel" placeholder="(801) 555-0123" autoComplete="tel" /></Field>
        <Field label="Current club & team"><input className="ua-input" name="club" required placeholder="Club, team, league" /></Field>
        <Field label="Primary position"><select className="ua-input" name="position"><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></Field>
      </div>
      <Field label="Highlight video link"><input className="ua-input" name="video" type="url" placeholder="Optional · YouTube, Veo, Hudl" /></Field>
      <SubmitButton>Submit trial application</SubmitButton>
    </form>
  );
}

function RegisterForm({ p, choices }) {
  const [sent, setSent] = useState(false);
  const [pick, setPick] = useState(0);
  const choice = choices[pick] || choices[0];
  if (sent) return <Sent head={p.cta === 'Register' ? "You're registered." : "You're on the list."} copy={choice ? `Confirmation for ${choice} is on its way to your inbox.` : 'Confirmation is on its way to your inbox.'} again="Submit another" onAgain={() => setSent(false)} />;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {choices.length ? (
        <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <legend style={{ padding: 0, marginBottom: '10px', fontSize: '12px', color: 'var(--color-neutral-400)' }}>{p.sessionLabel}</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '8px' }}>
            {choices.slice(0, 6).map((c, i) => (
              <button key={c} type="button" aria-pressed={pick === i} onClick={() => setPick(i)} style={{ all: 'unset', cursor: 'pointer', padding: '13px', borderRadius: '8px', background: pick === i ? 'rgba(120,183,179,.1)' : 'var(--color-bg)', boxShadow: `inset 0 0 0 1px ${pick === i ? '#78b7b3' : 'var(--color-divider)'}`, font: '500 15px/1.2 var(--font-heading)', color: pick === i ? 'var(--color-accent-300)' : 'var(--color-text)', transition: 'all .2s' }}>{c}</button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
        <Field label="Player name"><input className="ua-input" name="player" required placeholder="First and last" autoComplete="off" /></Field>
        <Field label="Age group"><select className="ua-input" name="age">{p.years.map((y) => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Parent email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
        <Field label="Current club"><input className="ua-input" name="club" placeholder="Optional" /></Field>
      </div>
      <SubmitButton>{p.cta}{choice ? ` · ${choice}` : ''}</SubmitButton>
    </form>
  );
}

function InterestForm({ p, rm, title }) {
  const [sent, setSent] = useState(false);
  return (
    <div style={{ borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', alignSelf: 'start' }}>
      {sent ? (
        <Sent pad="44px 28px" head="You're on the list." copy={`The ${rm.label} team will contact you first when ${p.name} ${p.kind === 'season' ? 'sign-up opens' : 'tryouts open'}.`} onAgain={() => setSent(false)} />
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>To: Managing Director, {rm.label} region · {rm.managingDirector.email}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
            <Field label="Parent name"><input className="ua-input" name="name" required autoComplete="name" /></Field>
            <Field label="Email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
          </div>
          <Field label={p.kind === 'season' ? 'Player age group' : 'Player birth year'}><select className="ua-input" name="age">{p.years.map((y) => <option key={y}>{y}</option>)}</select></Field>
          <SubmitButton>Register interest · {title}</SubmitButton>
        </form>
      )}
    </div>
  );
}
