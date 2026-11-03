// A program's region tab (/academy/north/ etc.). Three states, from the program's `regions`:
// active (this program's regional leaders and coaches (not for volunteer-coached programs), tryouts, fees, contact), soon (register interest) and none
// (point to the nearest region that runs it). Forms are front-end only for now.
import React, { useEffect, useState } from 'react';
import { MapPin, ArrowUpRight } from '@phosphor-icons/react';
import { REGION_ORDER, NO_COACH_LIST } from '../../data/site';
import { orderOf } from '../../../studio/shared/sections';
import StaffBio from '../StaffBio.jsx';
import { tryoutsFor, money, sessionsFor, sessionLabel, priceOn, lowestPrice, earlyNote, fmtDay } from '../../lib/schedule';
import { Kicker, SectionHead, Field, SubmitButton, Sent, Headshot, ClassList, FormGuard, useSubmit, ROW_RULE } from '../ui.jsx';

const isExternal = (href) => /^https?:/.test(href);

export default function RegionTab({ program: p, regionId, data, today, onRegion }) {
  const rm = data.regions.find((r) => r.id === regionId);
  const rd = p.regions[regionId];
  const title = `${rm.label} ${p.name}`;
  const isAcademy = p.id === 'academy';
  // Volunteer-coached programs never list coaches; others only once a coach is added.
  const showCoaches = !NO_COACH_LIST.includes(p.id) && rd.coaches.length > 0;
  // Sections in the editor's order (Studio > program > Page layout on region tabs); with none
  // saved, Futures puts its sign-up first, since it registers online. Hidden sections and ones with
  // nothing to show drop out; section numbers follow the sections shown.
  // Recreation's Sign up section carries what's included, so it has no Fees section.
  // Recreation and Futures show their fees on the session cards and what's included in Sign up, so no Fees section.
  const has = { coach: showCoaches, fee: !isAcademy && p.kind !== 'season' };
  const shown = orderOf('region', p.regionOrder?.length ? p.regionOrder : p.id === 'futures' ? ['try', 'lead', 'coach', 'fee', 'contact'] : [])
    .filter((k) => has[k] !== false && !p.hideRegion.includes(k));
  const num = (s) => String(shown.indexOf(s) + 1).padStart(2, '0');
  const line = rd.status === 'active'
    ? `The same ${p.name} program and standard, run locally from ${rd.hub}. Staff, tryouts${isAcademy ? '' : ', fees'} and contacts below are specific to the ${rm.label} region.`
    : rd.status === 'soon' ? `${p.name} launches in the ${rm.label} region in ${rd.season}.`
      : `This program does not run in the ${rm.label} region.`;
  // Where the register-interest form says it goes: the first leader with an email, else the main office.
  const contact = rd.leaders.find((l) => l.email) || { email: data.settings.mainEmail };
  // Links like /rec/north/#notify (home page "Get notified") jump to the register-interest form.
  useEffect(() => {
    if (location.hash !== '#notify') return;
    const t = setTimeout(() => document.getElementById('notify')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    return () => clearTimeout(t);
  }, []);

  // The active region's sections, drawn in order by key.
  const SECTION = {
    lead: () => (
          <section id="sec-rlead" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionHead kicker={`${num('lead')} · Regional leadership`} title={`Who runs ${title}`} />
            {rd.leaders.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: '12px' }}>
                {rd.leaders.map((l) => <LeadCard key={l.id} lead={l} />)}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-neutral-400)' }}>Leaders for {title} will be listed here soon.</p>
            )}
          </section>
    ),
    coach: () => (
          <section id="sec-rcoach" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <SectionHead kicker={`${num('coach')} · Coaching staff`} title={`${title} coaches`} />
            {rd.coaches.length ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap: '16px' }}>
                {rd.coaches.map((c, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Headshot pic={c.headshot} name={c.name} label="Coach photo" style={{ aspectRatio: '1', borderRadius: '8px' }} slotStyle={{ padding: '10px', background: 'repeating-linear-gradient(135deg,#1a1d23 0 8px,#1f2229 8px 16px)' }} />
                    <span style={{ font: '500 17px/1.2 var(--font-heading)' }}>{c.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{c.role}</span>
                    <StaffBio person={c} size={13} color="var(--color-neutral-500)" />
                    {c.email ? <a href={'mailto:' + c.email} style={{ fontSize: '13px', overflowWrap: 'anywhere' }}>{c.email}</a> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-neutral-400)' }}>Coaches for {title} will be listed here soon.</p>
            )}
          </section>
    ),
    try: () => <Tryouts p={p} rm={rm} data={data} today={today} n={num('try')} />,
    fee: () => { const low = lowestPrice(rd.price?.items, today); return (rd.tabs.length ? <FeeTabs p={p} tabs={rd.tabs} n={num('fee')} /> : (
            <section id="sec-rfee" style={{ padding: '48px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '48px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Kicker>{num('fee')} · Fees</Kicker>
                {rd.fees.length > 1 ? (
                  // Prices by age group (Studio > Programs > Regions > Fees by age group).
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)', paddingBottom: '8px' }}>By age group, {p.unit}</span>
                    {rd.fees.map((f) => (
                      <div key={f.ages + f.note} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', padding: '16px 0', background: ROW_RULE }}>
                        <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ font: '500 20px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{f.ages}</span>
                          {f.note ? <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{f.note}</span> : null}
                        </span>
                        <FeePrice x={priceOn(f, today)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ font: '500 clamp(80px,10vw,144px)/.9 var(--font-heading)', letterSpacing: '-.06em', color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{low ? money(low.cost) : 'TBA'}</span>
                      <span style={{ fontSize: '15px', color: 'var(--color-neutral-400)' }}>{rd.fees.length ? [rd.fees[0].ages, p.unit, rd.fees[0].note].filter(Boolean).join(', ') : low ? (low.from ? 'and up, ' : '') + p.unit : p.kind === 'season' ? 'Prices post with the first session' : 'Prices to be announced'}</span>
                    </div>
                    {earlyNote(low) ? <EarlyTag text={earlyNote(low)} /> : null}
                  </div>
                )}
                <p style={{ margin: 0, maxWidth: '460px', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{p.costNote}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {p.includes.length ? <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', paddingBottom: '12px' }}>What's included</span> : null}
                {p.includes.map((inc) => (
                  <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '15px 0', fontSize: '16px', background: ROW_RULE }}><span style={{ width: '7px', height: '7px', flex: 'none', transform: 'rotate(45deg)', background: 'var(--color-accent)' }} />{inc}</div>
                ))}
              </div>
            </section>
    )); },
    contact: () => (
          <section id="sec-rcontact" style={{ padding: '24px 0 96px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: 'clamp(22px,3vw,32px) clamp(22px,3vw,36px)', borderRadius: '14px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.16),transparent 60%),var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Kicker>{num('contact')} · Contact</Kicker>
                <span style={{ font: '500 clamp(28px,3vw,40px)/1.05 var(--font-heading)', letterSpacing: '-.035em' }}>Want to contact our leaders?</span>
                <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>Reach the {title} leadership team directly.</span>
              </div>
              <a href={`/contact/?region=${rm.id}&program=${p.id}`} className="hv-t14" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '48px', padding: '0 20px', borderRadius: '10px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 15px/1 var(--font-body)', transition: 'background .2s' }}>Contact us →</a>
            </div>
          </section>
    ),
  };

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
      <section style={{ padding: '72px 0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Kicker>{rm.label} region · {rm.area}</Kicker>
        <h2 style={{ margin: 0, font: '500 clamp(48px,6.4vw,96px)/.95 var(--font-heading)', letterSpacing: '-.05em' }}>{title}</h2>
        <p style={{ margin: 0, maxWidth: '620px', fontSize: '17px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>{line}</p>
      </section>

      {rd.status === 'active' ? (
        <>
          {shown.map((k) => <React.Fragment key={k}>{SECTION[k]()}</React.Fragment>)}
          {shown.at(-1) === 'contact' ? null : <div style={{ height: '48px' }} />}
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
                {rd.leaders.map((l) => <LeadCard key={l.id} lead={l} />)}
              </div>
            </div>
            <InterestForm p={p} rm={rm} to={contact} title={title} />
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

// Fees by age group (Club): a tab per age group with this region's price, what's included and what
// isn't (Studio > program > Cost and what's included > Fees by age group). One age group shows no tabs.
function FeeTabs({ p, tabs, n }) {
  const [sel, setSel] = useState(0);
  const t = tabs[sel] ?? tabs[0];
  // Arrow keys move between tabs, as screen reader users expect.
  const onKey = (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = (sel + d + tabs.length) % tabs.length;
    setSel(i);
    document.getElementById(`fee-tab-${tabs[i].key}`)?.focus();
  };
  const list = (title, items, dot, color) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color, paddingBottom: '8px' }}>{title}</span>
      {items.map((x) => (
        <div key={x.item} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '14px 0', background: ROW_RULE }}>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: '14px', fontSize: '16px' }}>
            <span aria-hidden="true" style={{ width: '7px', height: '7px', flex: 'none', transform: 'translateY(-2px) rotate(45deg)', background: dot }} />{x.item}
          </span>
          {x.detail ? <span style={{ paddingLeft: '21px', fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{x.detail}</span> : null}
        </div>
      ))}
    </div>
  );
  return (
    <section id="sec-rfee" style={{ padding: '48px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Kicker>{n} · Fees</Kicker>
      {tabs.length > 1 ? (
        <div role="tablist" aria-label="Age groups" onKeyDown={onKey} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tabs.map((x, i) => {
            const on = i === sel;
            return (
              <button key={x.key} id={`fee-tab-${x.key}`} type="button" role="tab" aria-selected={on} aria-controls="fee-panel" tabIndex={on ? 0 : -1} onClick={() => setSel(i)} className={on ? undefined : 'hv-outline'}
                style={{ cursor: 'pointer', minHeight: '44px', padding: '0 18px', borderRadius: '8px', border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`, background: on ? 'rgba(120,183,179,.14)' : 'transparent', color: on ? 'var(--color-accent)' : 'var(--color-neutral-300)', font: '500 15px/1 var(--font-body)', transition: 'all .2s' }}>
                {x.label}
              </button>
            );
          })}
        </div>
      ) : null}
      <div id="fee-panel" role={tabs.length > 1 ? 'tabpanel' : undefined} aria-labelledby={tabs.length > 1 ? `fee-tab-${t.key}` : undefined}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ font: '500 clamp(80px,10vw,144px)/.9 var(--font-heading)', letterSpacing: '-.06em', color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{money(t.cost)}</span>
            <span style={{ fontSize: '15px', color: 'var(--color-neutral-400)' }}>{[t.label, p.unit, t.note].filter(Boolean).join(', ')}</span>
          </div>
          {p.costNote ? <p style={{ margin: 0, maxWidth: '460px', fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{p.costNote}</p> : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {t.included.length ? list('What\'s included', t.included, 'var(--color-accent)', 'var(--color-neutral-500)') : null}
          {t.notIncluded.length ? list('Not included', t.notIncluded, 'var(--color-error)', 'var(--color-error)') : null}
        </div>
      </div>
    </section>
  );
}

function LeadCard({ lead }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '18px', padding: '14px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
      <Headshot pic={lead.headshot} name={lead.name} label="Headshot" style={{ aspectRatio: '4 / 5', borderRadius: '6px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 4px 4px 0', minWidth: 0 }}>
        <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{lead.role}</span>
        <span style={{ font: '500 24px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{lead.name}</span>
        <StaffBio person={lead} size={13} />
        {lead.email ? <a href={'mailto:' + lead.email} style={{ marginTop: 'auto', fontSize: '13px', overflowWrap: 'anywhere' }}>{lead.email}</a> : null}
      </div>
    </div>
  );
}

// 03 · Tryouts: posted dates on the left, the trial application or registration form on the right.
function Tryouts({ p, rm, data, today, n }) {
  // Recreation and Futures: session cards (price, Sign up or Register, Full) with what's included beside them.
  if (p.kind === 'season') return <SeasonSignUp p={p} rm={rm} data={data} today={today} n={n} />;
  const trial = p.enrollment !== 'tryouts';
  const rows = tryoutsFor(data, { program: p.id, region: rm.id }, today).map((t) => ({ key: t.id, title: t.name, when: `${t.when} · ${t.ages} · ${t.players}`, where: t.next.venueName, mapUrl: t.next.mapUrl, cta: 'See days and times', href: `/tryouts/?region=${rm.id}&level=${p.id}`, pick: t.name }));
  const head = trial ? 'Player trial application' : `Next tryouts in ${rm.label}`;
  const copy = trial
    ? `Tryout registration opens ${p.registrationOpens}. Until then, apply for a private trial with ${rm.label} staff. We review every application.`
    : p.joinCopy;
  return (
    <section id="sec-rtry" style={{ padding: '48px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '48px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <Kicker>{n} · Tryouts</Kicker>
        <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>{head}</h2>
        <p style={{ margin: 0, maxWidth: '460px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{copy}</p>
        {rows.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '520px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Posted tryout dates</span>
            {rows.slice(0, 4).map((r) => (
              <div key={r.key} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 14px', padding: '12px 14px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ flex: '1 1 140px', display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ font: '500 15px/1.1 var(--font-heading)' }}>{r.title}</span><span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{r.when}</span></span>
                <a href={r.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-neutral-300)' }}><MapPin color="#78b7b3" aria-hidden="true" />{r.where}</a>
                <a href={r.href} className="hv-t14" style={{ flex: 'none', display: 'flex', alignItems: 'center', minHeight: '44px', padding: '0 14px', borderRadius: '8px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 13px/1 var(--font-body)' }}>{r.cta} →</a>
              </div>
            ))}
            <a href={`/tryouts/?region=${rm.id}&level=${p.id}`} style={{ paddingTop: '4px', fontSize: '13px', color: 'var(--color-accent-300)' }}>All {rm.label} tryouts & dates →</a>
          </div>
        ) : null}
      </div>
      <div style={{ borderRadius: '14px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', alignSelf: 'start' }}>
        {/* Trial programs take an application; tryout-enrollment programs a request for the posted tryouts. */}
        {trial ? <TrialForm p={p} rm={rm} /> : <RegisterForm p={p} rm={rm} choices={rows.map((r) => r.pick)} />}
      </div>
    </section>
  );
}

// Recreation and Futures Sign up: every session still to come in the region (the price large, status, and
// Sign up to Recreation's registration site or Register on Futures' own page, or a red Full), with what's
// included beside it. With nothing posted, Recreation links to the region's registration site and Futures
// shows the register-interest form. Questions go to the contact page.
function SeasonSignUp({ p, rm, data, today, n }) {
  const rd = p.regions[rm.id];
  const list = sessionsFor(data, p.id, rm.id, today);
  const rec = p.id === 'rec';
  const url = rd.registerUrl || p.registerUrl;
  const included = p.includes.length > 0 || !!p.costNote;
  return (
    <section id="sec-rtry" style={{ padding: '48px 0', display: 'grid', gridTemplateColumns: included ? 'repeat(auto-fit,minmax(min(100%,420px),1fr))' : '1fr', gap: '48px', alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
        <Kicker>{n} · Sign up</Kicker>
        <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em' }}>Sign up in {rm.label}</h2>
        {p.joinCopy ? <p style={{ margin: 0, maxWidth: '520px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{p.joinCopy}</p> : null}
        {list.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            {list.map((s) => <SessionCard key={s.id} s={s} today={today} cta={rec ? 'Sign up' : 'Register'} />)}
          </div>
        ) : !rec ? (
          <>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-neutral-400)' }}>{rm.label} {p.name} sessions will be posted here soon.</p>
            <div style={{ borderRadius: '14px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              <InterestForm p={p} rm={rm} to={rd.leaders.find((l) => l.email) || { email: data.settings.mainEmail }} title={`${rm.label} ${p.name}`} />
            </div>
          </>
        ) : <a href={url} {...(isExternal(url) ? { target: '_blank', rel: 'noopener' } : {})} className="hv-lift-sm" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '10px', minHeight: '52px', padding: '0 24px', borderRadius: '10px', background: 'var(--color-accent)', color: 'var(--color-bg)', font: '600 16px/1 var(--font-body)', transition: 'transform .2s,box-shadow .2s' }}>Register in {rm.label} <ArrowUpRight aria-hidden="true" /></a>}
        <a href={`/contact/?region=${rm.id}&program=${p.id}`} className="hv-link" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: '44px', fontSize: '14px', color: 'var(--color-neutral-300)', textDecoration: 'underline', textDecorationColor: 'var(--color-neutral-600)', textUnderlineOffset: '4px' }}>Questions? Contact the {rm.label} leaders →</a>
      </div>
      {included ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: 'clamp(20px,2.4vw,28px)', borderRadius: '14px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' }}>
          <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', paddingBottom: '8px' }}>What's included</span>
          {p.includes.map((inc) => (
            <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', fontSize: '16px', background: ROW_RULE }}><span style={{ width: '7px', height: '7px', flex: 'none', transform: 'rotate(45deg)', background: 'var(--color-accent)' }} />{inc}</div>
          ))}
          {p.costNote ? <p style={{ margin: '12px 0 0', fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{p.costNote}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

// One session: name, ages, dates and place; the price large (early bird with the regular price struck
// through); the sign-up button while open, a red Full when the session is full; Futures' classes under it.
function SessionCard({ s, today, cta }) {
  const l = sessionLabel(s, today), x = priceOn(s, today);
  const full = l.status === 'full';
  return (
    <div id={`session-${s.id}`} style={{ scrollMarginTop: '150px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px', padding: '20px 22px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: full ? '0 0 0 1px var(--color-alert)' : l.canJoin ? '0 0 0 1px var(--color-accent-800)' : 'var(--shadow-sm)' }}>
      <div style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <span style={{ font: '500 22px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{s.name}</span>
        <span style={{ fontSize: '14px', color: 'var(--color-neutral-300)' }}>{[s.ages, s.dates].filter(Boolean).join(' · ')}</span>
        <a href={s.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-neutral-400)' }}><MapPin color="#78b7b3" aria-hidden="true" />{s.venueName}</a>
        <span style={{ fontSize: '13px', color: full ? 'var(--color-alert)' : 'var(--color-accent-300)' }}>{full ? 'This session is full' : l.text}</span>
      </div>
      <div className="ua-sess-price" style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          {x.regular != null ? <s style={{ fontSize: '18px', color: 'var(--color-neutral-500)', fontVariantNumeric: 'tabular-nums' }}>{money(x.regular)}</s> : null}
          <span style={{ font: '500 clamp(36px,3.4vw,48px)/1 var(--font-heading)', letterSpacing: '-.04em', color: full ? 'var(--color-neutral-400)' : 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{money(x.cost)}</span>
        </span>
        {x.ends && !full ? <EarlyTag end text={`Early bird until ${fmtDay(x.ends)}`} /> : null}
        {full
          ? <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: '46px', padding: '0 20px', borderRadius: '9px', background: 'var(--color-alert)', color: '#fff', font: '700 14px/1 var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Full</span>
          : l.canJoin
            ? <a href={s.url} {...(isExternal(s.url) ? { target: '_blank', rel: 'noopener' } : {})} className="hv-lift-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '46px', padding: '0 20px', borderRadius: '9px', background: 'var(--color-accent)', color: 'var(--color-bg)', font: '600 15px/1 var(--font-body)', transition: 'transform .2s,box-shadow .2s' }}>{cta} {isExternal(s.url) ? <ArrowUpRight aria-hidden="true" /> : '→'}</a>
            : null}
      </div>
      {s.classes?.length ? <div style={{ flex: '1 1 100%' }}><ClassList classes={s.classes} /></div> : null}
    </div>
  );
}

function TrialForm({ p, rm }) {
  const f = useSubmit({ form: 'trial', program: p.id, region: rm.id });
  if (f.sent) return <Sent head="Application received." copy={`The ${rm.label} ${p.name} staff will review it and contact you to schedule a trial.`} again="Submit another" onAgain={f.reset} />;
  return (
    <form onSubmit={f.onSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-neutral-300)' }}><span style={{ width: '7px', height: '7px', flex: 'none', borderRadius: '50%', background: '#78b7b3', boxShadow: '0 0 8px #78b7b3' }} />Player trial application · reviewed by the {rm.label} {p.name} staff</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
        <Field label="Player name"><input className="ua-input" name="player" required placeholder="First and last" autoComplete="off" /></Field>
        <Field label="Age group"><select className="ua-input" name="birthYear">{p.ageGroups.map((y) => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Parent email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
        <Field label="Parent phone"><input className="ua-input" name="phone" type="tel" placeholder="(801) 555-0123" autoComplete="tel" /></Field>
        <Field label="Current club & team"><input className="ua-input" name="club" required placeholder="Club, team, league" /></Field>
        <Field label="Primary position"><select className="ua-input" name="position"><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></Field>
      </div>
      <Field label="Highlight video link"><input className="ua-input" name="video" type="url" placeholder="Optional · YouTube, Veo, Hudl" /></Field>
      <FormGuard error={f.error} />
      <SubmitButton busy={f.busy}>{f.busy ? 'Sending…' : 'Submit trial application'}</SubmitButton>
    </form>
  );
}

function RegisterForm({ p, rm, choices }) {
  const [pick, setPick] = useState(0);
  const choice = choices[pick] || choices[0];
  const f = useSubmit({ form: 'register', program: p.id, region: rm.id, session: choice ?? '' });
  if (f.sent) return <Sent head="Request received." copy={`The ${rm.label} ${p.name} team will email you${choice ? ` about ${choice}` : ''} with next steps.`} again="Submit another" onAgain={f.reset} />;
  return (
    <form onSubmit={f.onSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <Field label="Age group"><select className="ua-input" name="age">{p.ageGroups.map((y) => <option key={y}>{y}</option>)}</select></Field>
        <Field label="Parent email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
        <Field label="Current club"><input className="ua-input" name="club" placeholder="Optional" /></Field>
      </div>
      <FormGuard error={f.error} />
      <SubmitButton busy={f.busy}>{f.busy ? 'Sending…' : <>{p.cta}{choice ? ` · ${choice}` : ''}</>}</SubmitButton>
    </form>
  );
}

function InterestForm({ p, rm, to, title }) {
  const f = useSubmit({ form: 'interest', program: p.id, region: rm.id });
  return (
    <div id="notify" style={{ scrollMarginTop: '140px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', alignSelf: 'start' }}>
      {f.sent ? (
        <Sent pad="44px 28px" head="You're on the list." copy={`The ${rm.label} team will contact you first when ${p.name} ${p.kind === 'season' ? 'sign-up opens' : 'tryouts open'}.`} onAgain={f.reset} />
      ) : (
        <form onSubmit={f.onSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>To: {title} leadership · {to.email}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
            <Field label="Parent name"><input className="ua-input" name="name" required autoComplete="name" /></Field>
            <Field label="Email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
          </div>
          <Field label="Player age group"><select className="ua-input" name="age">{p.ageGroups.map((y) => <option key={y}>{y}</option>)}</select></Field>
          <FormGuard error={f.error} />
          <SubmitButton busy={f.busy}>{f.busy ? 'Sending…' : `Register interest · ${title}`}</SubmitButton>
        </form>
      )}
    </div>
  );
}

// A fee row's price on the visitor's date: the early bird price, with the regular one and the end date under it.
function FeePrice({ x }) {
  return (
    <span style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        {x.regular != null ? <s style={{ fontSize: '18px', color: 'var(--color-neutral-500)', fontVariantNumeric: 'tabular-nums' }}>{money(x.regular)}</s> : null}
        <span style={{ font: '500 40px/1 var(--font-heading)', letterSpacing: '-.04em', color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>{money(x.cost)}</span>
      </span>
      {x.ends ? <EarlyTag end text={`Early bird until ${fmtDay(x.ends)}`} /> : null}
    </span>
  );
}

// The early bird pill.
function EarlyTag({ text, end }) {
  return <span style={{ alignSelf: end ? 'flex-end' : 'flex-start', padding: '5px 10px', borderRadius: '999px', background: 'rgba(120,183,179,.14)', color: 'var(--color-accent-300)', fontSize: '12px', fontWeight: 500 }}>{text}</span>;
}

