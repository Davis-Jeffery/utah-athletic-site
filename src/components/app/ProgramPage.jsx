// A program page (Academy, Club, Recreation, Futures), shown full screen over the home page.
// Overview tab: who it's for, development model, competition, season, week, comparison,
// leadership and regions. Region tabs render RegionTab.
import React, { useState } from 'react';
import { ORDER, MONTHS, PATHWAY, PYRAMID_POINTS as PTS, REGION_ORDER } from '../../data/site';
import { fmtDate, tryoutsFor, money } from '../../lib/schedule';
import { ACC, Kicker, SectionHead, Rule } from '../ui.jsx';
import { RegionMenu } from '../SiteHeader.jsx';
import DevModel from './DevModel.jsx';
import CompareTable from './CompareTable.jsx';
import RegionTab from './RegionTab.jsx';
import RecFormats from '../RecFormats.jsx';

// The map (d3 + geometry) loads only in the browser, after the page is up.
const UtahMap = React.lazy(() => import('../UtahMap.jsx'));

const ENROLLMENT = {
  trial: { label: 'Accepting player trial applications', cta: 'Apply for a player trial' },
  tryouts: { label: 'Open tryouts', cta: 'Register for tryouts' },
};
const poly = (id) => PTS[id].slice(0, id === 'pro' ? 3 : 4).map((q) => q.join(',')).join(' ');
const statusSub = (r) => (r.status === 'active' ? r.hub : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered');

export default function ProgramPage({ data, program: p, region, today, mounted, swap, regionMenu, copied, onClose, onSwitch, onRegion, onJoin, onCopy }) {
  const P = Object.fromEntries(data.programs.map((x) => [x.id, x]));
  const en = p.enrollment ? ENROLLMENT[p.enrollment] : null;
  const ctaLabel = en ? en.cta : p.cta;
  const firstTryout = p.enrollment === 'tryouts' ? tryoutsFor(data, { program: p.id }, today)[0] : null;
  const status = en ? {
    label: en.label,
    next: p.enrollment === 'trial' ? p.nextTryout : firstTryout ? `${fmtDate(firstTryout.date)} · ${firstTryout.time}` : 'To be announced',
    reg: p.enrollment === 'trial' ? `Opens ${p.registrationOpens}` : 'Open now',
  } : null;

  return (
    <>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', gap: '16px', minHeight: '57px', padding: '7px clamp(16px,3vw,40px)', background: 'rgba(17,19,24,.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
        <button type="button" onClick={onClose} className="hv-ghost" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '42px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-divider)', color: 'var(--color-text)', padding: '0 14px 0 8px', borderRadius: '8px', font: '500 14px/1 var(--font-body)' }}>
          <svg viewBox="0 0 600 480" width="34" height="27" aria-hidden="true">
            <polygon points={poly('pro')} fill="rgba(120,183,179,.45)" />
            {ORDER.map((k) => <polygon key={k} points={poly(k)} fill={k === p.id ? ACC : 'rgba(233,233,237,.22)'} />)}
          </svg>
          ← All programs <span className="ov-esc" style={{ fontSize: '10px', color: 'var(--color-neutral-500)', border: '1px solid var(--color-divider)', borderRadius: '4px', padding: '3px 5px' }}>ESC</span>
        </button>
        <div style={{ marginRight: 'auto', display: 'flex', minWidth: 0 }}>
          <div className="ov-switcher" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {ORDER.map((k) => {
              const on = k === p.id;
              return <button key={k} type="button" onClick={() => onSwitch(k)} aria-current={on ? 'page' : undefined} style={{ cursor: 'pointer', border: `1px solid ${on ? ACC : 'transparent'}`, background: on ? 'rgba(120,183,179,.1)' : 'transparent', color: on ? ACC : 'var(--color-neutral-300)', padding: '10px 12px', borderRadius: '7px', font: '500 13px/1 var(--font-body)', transition: 'all .2s' }}>{P[k].name}</button>;
            })}
          </div>
        </div>
        <RegionMenu {...regionMenu} />
        <button type="button" onClick={onJoin} className="ov-cta hv-t12" style={{ flex: 'none', cursor: 'pointer', minHeight: '42px', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 14px/1 var(--font-body)', padding: '0 16px', borderRadius: '8px' }}>{ctaLabel} →</button>
      </div>

      <div style={{ transform: swap ? 'translateY(24px)' : 'none', opacity: swap ? 0 : 1, transition: 'transform .5s cubic-bezier(.2,.8,.2,1),opacity .3s' }}>
        <section id="ovhero" style={{ position: 'relative', minHeight: 'min(80vh,760px)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
          <img src={p.img} alt="" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15) brightness(.62)' }} />
          <div style={{ position: 'absolute', inset: 0, background: '#78b7b3', mixBlendMode: 'color', opacity: 0.55 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(17,19,24,.25),rgba(17,19,24,.6) 50%,#111318),radial-gradient(ellipse at 15% 100%,rgba(120,183,179,.22),transparent 55%)' }} />
          <div style={{ position: 'relative', width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '96px clamp(20px,4vw,56px) 44px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{p.tier}</span>
              <span style={{ width: '36px', height: '1px', background: 'var(--color-accent)' }} />
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '6px 11px', borderRadius: '8px', background: 'rgba(17,19,24,.55)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 0 1px rgba(120,183,179,.45)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Age groups</span>
                <span style={{ font: '500 15px/1 var(--font-heading)', letterSpacing: '-.01em', color: ACC, whiteSpace: 'nowrap' }}>{p.ages}</span>
              </span>
            </div>
            <h1 style={{ margin: 0, font: '500 clamp(72px,14vw,220px)/.86 var(--font-heading)', letterSpacing: '-.06em' }}>{p.name}</h1>
            <p style={{ margin: 0, maxWidth: '640px', fontSize: 'clamp(17px,1.5vw,21px)', lineHeight: 1.5, color: 'var(--color-neutral-200)', textWrap: 'pretty' }}>{p.tagline}</p>
            {status ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', marginTop: '10px', maxWidth: '1120px', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-divider)', boxShadow: '0 18px 40px rgba(0,0,0,.35)' }}>
                <StatusCell flex="1.6 1 280px" k="Status"><span style={{ width: '9px', height: '9px', flex: 'none', borderRadius: '50%', background: ACC, boxShadow: '0 0 0 4px rgba(120,183,179,.18),0 0 12px #78b7b3' }} />{status.label}</StatusCell>
                <StatusCell k="Next open tryouts">{status.next}</StatusCell>
                <StatusCell k="Tryout registration">{status.reg}</StatusCell>
                <button type="button" onClick={onJoin} className="hv-t26" style={{ flex: '1 1 220px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '64px', padding: '16px 20px', border: 0, background: 'rgba(120,183,179,.16)', color: '#b5e1dd', font: '500 16px/1.2 var(--font-body)', textAlign: 'left', transition: 'background .2s' }}>{en.cta}<span style={{ fontSize: '20px' }}>→</span></button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '1px', marginTop: '10px', borderRadius: '10px', overflow: 'hidden', background: 'var(--color-divider)' }}>
                {[['Ages', p.ages], ['Competes in', p.line], ['Investment', money(p.cost) + (p.unit === 'per year' ? ' / year' : ' / season')], ['Training', p.commit]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 18px', background: 'rgba(27,29,36,.92)' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{k}</span>
                    <span style={{ font: '500 20px/1.2 var(--font-heading)', letterSpacing: '-.02em' }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <nav id="rnav" aria-label={`${p.name} regions`} style={{ position: 'sticky', top: '57px', zIndex: 9, background: 'rgba(17,19,24,.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)', display: 'flex', alignItems: 'stretch', gap: '2px', overflowX: 'auto' }}>
            {[[null, 'Overview'], ...REGION_ORDER.map((k) => [k, data.regions.find((r) => r.id === k).label])].map(([k, label]) => {
              const on = region === k, r = k ? p.regions[k] : null;
              return (
                <a key={label} href={`/${p.id}/${k ? k + '/' : ''}`} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); onRegion(k); }} aria-current={on ? 'page' : undefined} className="hv-faint"
                  style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px 18px 12px', minWidth: '104px', whiteSpace: 'nowrap', color: 'inherit', boxShadow: `inset 0 -2px 0 ${on ? ACC : 'transparent'}`, transition: 'box-shadow .2s,background .2s' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', font: '500 16px/1 var(--font-heading)', letterSpacing: '-.01em', color: on ? 'var(--color-text)' : 'var(--color-neutral-400)' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: r && r.status === 'active' ? ACC : 'transparent', boxShadow: `0 0 0 1px ${!r ? 'var(--color-neutral-500)' : r.status === 'none' ? 'var(--color-neutral-600)' : ACC}` }} />{label}
                  </span>
                  <span style={{ fontSize: '11px', color: on ? 'var(--color-neutral-300)' : 'var(--color-neutral-500)' }}>{r ? statusSub(r) : 'Every region'}</span>
                </a>
              );
            })}
            <span style={{ flex: 1 }} />
            {region ? (
              <button type="button" onClick={onCopy} title="Copy a shareable link to this region" className="hv-outline" style={{ alignSelf: 'center', flex: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-neutral-300)', font: '500 12px/1 ui-monospace,Menlo,monospace', transition: 'all .2s' }}>
                /{p.id}/{region}<span style={{ fontFamily: 'var(--font-body)', color: ACC }}>{copied ? 'Copied ✓' : 'Copy link'}</span>
              </button>
            ) : null}
          </div>
          <Rule />
        </nav>

        {region
          ? <RegionTab key={p.id + region} program={p} regionId={region} data={data} today={today} onRegion={onRegion} />
          : <Overview key={p.id} data={data} p={p} P={P} status={status} ctaLabel={ctaLabel} mounted={mounted} onJoin={onJoin} onSwitch={onSwitch} onRegion={onRegion} />}

        <section style={{ background: 'var(--color-surface)', padding: '64px clamp(20px,4vw,56px) 88px' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '16px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, font: '500 clamp(30px,3.4vw,46px)/1 var(--font-heading)', letterSpacing: '-.035em' }}>Explore the pathway</h3>
              <button type="button" onClick={onClose} style={{ cursor: 'pointer', minHeight: '44px', background: 'transparent', border: 0, color: 'var(--color-accent)', font: '500 14px/1 var(--font-body)' }}>↑ Back to the pyramid</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: '12px' }}>
              {ORDER.filter((k) => k !== p.id).map((k) => (
                <button key={k} type="button" onClick={() => onSwitch(k)} className="hv-lift" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px', borderRadius: '8px', background: 'var(--color-bg)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .25s,transform .25s' }}>
                  <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{P[k].num} · {P[k].ages}</span>
                  <span style={{ font: '500 38px/1 var(--font-heading)', letterSpacing: '-.04em' }}>{P[k].name}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>{P[k].line}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-accent)' }}>View program →</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const StatusCell = ({ k, children, flex = '1 1 180px' }) => (
  <div style={{ flex, display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 18px', background: 'rgba(27,29,36,.94)' }}>
    <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{k}</span>
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', font: '500 19px/1.2 var(--font-heading)', letterSpacing: '-.02em' }}>{children}</span>
  </div>
);

function Overview({ data, p, P, status, ctaLabel, mounted, onJoin, onSwitch, onRegion }) {
  const isAcademy = p.id === 'academy';
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
      <section id="sec-overview" style={{ padding: '88px 0 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px' }}>
            <Kicker>01 · Who it's for</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>{p.forHead}</h2>
            <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: 'var(--color-neutral-300)', maxWidth: '520px', textWrap: 'pretty' }}>{p.intro}</p>
          </div>
          <div style={{ position: 'relative', minHeight: '260px', overflow: 'hidden', background: 'var(--color-bg)', clipPath: 'polygon(16% 0,100% 0,100% 100%,0 100%)' }}>
            <img src={p.photos.who} alt={`${p.name} players in action`} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg,transparent 55%,rgba(17,19,24,.75))' }} />
            <span style={{ position: 'absolute', right: '18px', bottom: '16px', pointerEvents: 'none', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{p.name} · {p.ages}</span>
          </div>
        </div>
      </section>

      <section style={{ position: 'relative', margin: '8px 0 24px', borderRadius: '16px', overflow: 'hidden', background: 'var(--color-bg)', boxShadow: '0 0 0 1px rgba(120,183,179,.3),0 24px 60px rgba(0,0,0,.45)' }}>
        <img src={p.photos.cta} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.15) brightness(.7)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#78b7b3', mixBlendMode: 'color', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg,rgba(17,19,24,.94) 0%,rgba(17,19,24,.72) 50%,rgba(17,19,24,.35) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px 32px', flexWrap: 'wrap', padding: 'clamp(28px,3.4vw,44px) clamp(22px,4vw,52px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
            <Kicker size={11} color="var(--color-accent-300)">{status ? status.label : `${p.name} · ${p.ages}`}</Kicker>
            <h3 style={{ margin: 0, font: '500 clamp(32px,4vw,56px)/1 var(--font-heading)', letterSpacing: '-.045em', textWrap: 'balance' }}>Do you have <span style={{ color: ACC }}>what it takes?</span></h3>
          </div>
          <button type="button" onClick={onJoin} className="hv-t18" style={{ flex: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '50px', padding: '0 22px', borderRadius: '10px', border: '1px solid #78b7b3', background: 'rgba(17,19,24,.6)', backdropFilter: 'blur(8px)', color: '#b5e1dd', font: '500 16px/1 var(--font-body)', transition: 'background .2s,transform .2s' }}>{ctaLabel}<span style={{ fontSize: '18px' }}>→</span></button>
        </div>
      </section>

      <section id="sec-dev" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <DevModel program={p} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Pathway position</span>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', alignItems: 'stretch', gap: '8px', flexWrap: 'wrap' }}>
            {PATHWAY.map(([k, label], i) => {
              const on = k === p.id;
              return (
                <li key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} aria-current={on ? 'step' : undefined}>
                  {i ? <span aria-hidden="true" style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>→</span> : null}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 16px', borderRadius: '8px', background: on ? 'rgba(120,183,179,.14)' : 'transparent', boxShadow: `inset 0 0 0 1px ${on ? ACC : 'var(--color-divider)'}` }}>
                    <span style={{ font: '500 16px/1 var(--font-heading)', color: on ? ACC : 'var(--color-neutral-300)' }}>{label}</span>
                    <span style={{ fontSize: '11px', minHeight: '11px', color: 'var(--color-neutral-500)' }}>{on ? 'You are here' : k === 'pro' ? 'Athletic Global' : ''}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="sec-leagues" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <SectionHead kicker="03 · Competition" title="Where we play" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '12px' }}>
          {p.leagues.map((l) => (
            <div key={l.name} className="hv-lift" style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '220px', padding: '26px', borderRadius: '8px', background: 'linear-gradient(160deg,rgba(120,183,179,.1),transparent 50%),var(--color-surface)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .25s,transform .25s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{l.level}</span>
                {l.logo ? <img src={l.logo} alt={`${l.name} logo`} width={l.lw} height={l.lh} loading="lazy" style={{ flex: 'none', width: l.lw + 'px', height: l.lh + 'px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,.45))' }} /> : null}
              </div>
              <span style={{ font: '500 34px/1 var(--font-heading)', letterSpacing: '-.035em' }}>{l.name}</span>
              <span style={{ marginTop: 'auto', fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{l.d}</span>
            </div>
          ))}
        </div>
        {p.id === 'rec' ? <RecFormats /> : null}
      </section>

      <Season p={p} />

      <section id="sec-schedule" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', flexWrap: 'wrap' }}>
          <SectionHead kicker="05 · Commitment" title="A typical week" />
          <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: 'var(--color-neutral-400)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', border: '1px solid var(--color-accent)' }} />Training</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'var(--color-accent-700)' }} />Match</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '8px' }}>
          {p.week.map((d) => (
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
        <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-neutral-400)' }}>{p.commitNote}</p>
      </section>

      <section id="sec-cost" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
          <Kicker>06 · Compare programs</Kicker>
          <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>What's included at <span style={{ color: ACC }}>every level</span></h2>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)', textWrap: 'pretty' }}>Every program is built on the same standard. Here's how the experience grows as players move up the pathway.</p>
        </div>
        <CompareTable programs={data.programs} current={p.id} onPick={onSwitch} />
        {!isAcademy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ font: '500 22px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>Fees by region</span>
              <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>Fees reflect local field and facility costs.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '12px' }}>
              {REGION_ORDER.map((k) => {
                const r = p.regions[k], act = r.status === 'active', rm = data.regions.find((x) => x.id === k);
                return (
                  <button key={k} type="button" onClick={() => onRegion(k)} className="hv-lift-sm" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '10px', padding: '22px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .25s,transform .25s' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{rm.label} · {r.hub || rm.area}</span>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ font: `500 ${act ? '44px' : '22px'}/1 var(--font-heading)`, letterSpacing: '-.04em', color: act ? ACC : 'var(--color-neutral-400)', fontVariantNumeric: 'tabular-nums' }}>{act ? money(p.cost + (r.feeDelta || 0)) : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered'}</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{act ? p.unit : ''}</span>
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>View {rm.label} →</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section id="sec-staff" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <SectionHead kicker="07 · Leadership" title="Program leadership" maxWidth="640px" intro="Utah Athletic leadership sets the standard for every region. Regional directors and coaches are listed under each region." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: '12px' }}>
          {p.directors.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px,140px) 1fr', gap: '20px', padding: '14px', borderRadius: '8px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ aspectRatio: '4 / 5', borderRadius: '6px', background: 'repeating-linear-gradient(135deg,#20232b 0 8px,#252830 8px 16px)', display: 'flex', alignItems: 'flex-end', padding: '8px', font: '500 10px/1 ui-monospace,Menlo,monospace', color: 'var(--color-neutral-600)', textTransform: 'uppercase' }}>Headshot</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 6px 6px 0' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{d.role}</span>
                <span style={{ font: '500 26px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{d.name}</span>
                <span style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{d.bio}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="sec-regions" style={{ padding: '64px 0 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <SectionHead kicker="08 · Regions" title="Choose your region" maxWidth="640px" intro="Tryouts, staff, locations and registration are run by region. Pick yours and we'll remember it across every program." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: '12px' }}>
          {REGION_ORDER.map((k) => {
            const r = p.regions[k], rm = data.regions.find((x) => x.id === k);
            const tag = r.status === 'active' ? 'Active' : r.status === 'soon' ? 'Coming ' + r.season : 'Not offered';
            return (
              <button key={k} type="button" onClick={() => onRegion(k)} className="hv-lift-sm" style={{ all: 'unset', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', padding: '22px', borderRadius: '10px', background: 'var(--color-surface)', border: r.status === 'active' ? '1px solid var(--color-accent-800)' : r.status === 'soon' ? '1px dashed rgba(120,183,179,.6)' : '1px dashed var(--color-neutral-600)', transition: 'box-shadow .25s,transform .25s' }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <span style={{ font: '500 30px/1 var(--font-heading)', letterSpacing: '-.04em' }}>{rm.label}</span>
                  <span style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 8px', borderRadius: '5px', background: r.status === 'active' ? 'rgba(120,183,179,.14)' : 'transparent', color: r.status === 'none' ? 'var(--color-neutral-400)' : 'var(--color-accent-300)', boxShadow: `inset 0 0 0 1px ${r.status === 'active' ? 'transparent' : r.status === 'soon' ? 'rgba(120,183,179,.5)' : 'var(--color-divider)'}` }}>{tag}</span>
                </span>
                <span style={{ fontSize: '14px', color: 'var(--color-neutral-300)' }}>{r.hub || 'No hub in this region'}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{rm.area}</span>
                <span style={{ marginTop: '6px', fontSize: '14px', color: ACC }}>{r.status === 'active' ? `Open ${rm.label} ${p.name} →` : r.status === 'soon' ? 'Register interest →' : 'See nearest hub →'}</span>
              </button>
            );
          })}
        </div>
        {mounted ? (
          <React.Suspense fallback={<div className="uamap-placeholder" />}>
            <UtahMap key={p.id} program={p.id} />
          </React.Suspense>
        ) : <div className="uamap-placeholder" />}
      </section>
    </div>
  );
}

// 04 · The year: month axis with clickable phases and the selected phase's detail.
function Season({ p }) {
  const [sel, setSel] = useState(0);
  const range = (ph) => MONTHS[ph.from] + (ph.to - ph.from > 1 ? ' – ' + MONTHS[ph.to - 1] : '');
  const cur = p.phases[sel] || p.phases[0];
  return (
    <section id="sec-season" style={{ padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <SectionHead kicker="04 · The year" title="Season overview" />
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
