// /adult/<league>/: an adult league page (UPSL, Adult Recreation), laid out like a program page
// but written for adult players: what to expect, the season and week, cost, home fields, staff,
// questions, and how to join. Content is the league's mapped document (src/lib/content.ts).
import React from 'react';
import { MapPin, Plus } from '@phosphor-icons/react';
import { money } from '../lib/schedule';
import { ACC, Kicker, SectionHead, Field, FormGuard, Placeholder, Sent, SubmitButton, useSubmit } from './ui.jsx';
import { Season, WeekGrid, StaffGrid } from './app/sections.jsx';
import { orderOf } from '../../studio/shared/sections';

const isExternal = (href) => /^https?:/.test(href);
const sec = { padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px' };

export default function AdultPage({ league: a, other }) {
  const on = (k) => !a.hide.includes(k);
  // The join form, else the Contact page when the form is hidden and there's no outside link.
  const joinHref = a.join.url || (on('join') ? '#join' : '/contact/');
  const joinLink = { href: joinHref, ...(isExternal(joinHref) ? { target: '_blank', rel: 'noopener' } : {}) };
  const hasWeek = a.week.some((d) => d.items.length);
  // Sections in the editor's order (Studio > adult league > Page layout), less hidden ones and those
  // with nothing to show; numbers follow the sections shown.
  const has = { play: a.leagues.length > 0, season: a.phases.length > 0, week: hasWeek, fields: a.venues.length > 0, faq: a.faqs.length > 0 };
  const shown = orderOf('adult', a.order).filter((k) => on(k) && has[k] !== false);
  // The join banner isn't numbered.
  const numbered = shown.filter((k) => k !== 'cta');
  const num = (k) => String(numbered.indexOf(k) + 1).padStart(2, '0');

  // The sections under the hero, drawn in order by key.
  const SECTION = {
    who: () => (
        <section id="sec-who" style={{ padding: '88px 0 48px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 'clamp(28px,4vw,64px)', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px' }}>
              <Kicker>{num('who')} · Who it's for</Kicker>
              <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>{a.forHead}</h2>
              <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: 'var(--color-neutral-300)', maxWidth: '520px', textWrap: 'pretty' }}>{a.intro}</p>
              {a.placeholderNote ? <Placeholder>{a.placeholderNote}</Placeholder> : null}
            </div>
            <div style={{ position: 'relative', minHeight: '280px', overflow: 'hidden', background: 'var(--color-bg)', clipPath: 'polygon(16% 0,100% 0,100% 100%,0 100%)' }}>
              <img src={a.photos.who.src} alt={a.photos.who.alt || `${a.name} players`} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: a.photos.who.pos, filter: 'grayscale(.35)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg,transparent 55%,rgba(17,19,24,.75))' }} />
              <span style={{ position: 'absolute', right: '18px', bottom: '16px', pointerEvents: 'none', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>{a.name} · {a.ages}</span>
            </div>
          </div>
          {a.expect.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '1px', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-divider)' }}>
              {a.expect.map((e, i) => (
                <div key={e.title} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px', background: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '12px', color: ACC, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ font: '500 22px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{e.title}</span>
                  <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{e.body}</span>
                </div>
              ))}
            </div>
          ) : null}
        </section>
    ),
    cta: () => (
        <section style={{ position: 'relative', margin: shown[shown.indexOf('cta') - 1] === 'who' ? '8px 0 24px' : '64px 0 24px', borderRadius: '16px', overflow: 'hidden', background: 'var(--color-bg)', boxShadow: '0 0 0 1px rgba(120,183,179,.3),0 24px 60px rgba(0,0,0,.45)' }}>
          <img src={a.photos.cta.src} alt={a.photos.cta.alt || ''} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: a.photos.cta.pos, filter: 'grayscale(1) contrast(1.15) brightness(.7)' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: '#78b7b3', mixBlendMode: 'color', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg,rgba(17,19,24,.94) 0%,rgba(17,19,24,.72) 50%,rgba(17,19,24,.35) 100%)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px 32px', flexWrap: 'wrap', padding: 'clamp(28px,3.4vw,44px) clamp(22px,4vw,52px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '680px' }}>
              <Kicker size={11} color="var(--color-accent-300)">{a.join.status}</Kicker>
              <h3 style={{ margin: 0, font: '500 clamp(32px,4vw,56px)/1 var(--font-heading)', letterSpacing: '-.045em', textWrap: 'balance' }}>{a.join.heading}{a.join.headingAccent ? <> <span style={{ color: ACC }}>{a.join.headingAccent}</span></> : null}</h3>
            </div>
            <a {...joinLink} className="hv-t18" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '50px', padding: '0 22px', borderRadius: '10px', border: '1px solid #78b7b3', background: 'rgba(17,19,24,.6)', backdropFilter: 'blur(8px)', color: '#b5e1dd', font: '500 16px/1 var(--font-body)', transition: 'background .2s,transform .2s' }}>{a.join.button}<span style={{ fontSize: '18px' }}>→</span></a>
          </div>
        </section>
    ),
    play: () => (
          <section id="sec-play" style={sec}>
            <SectionHead kicker={`${num('play')} · Competition`} title="Where we play" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: '12px' }}>
              {a.leagues.map((l) => (
                <div key={l.name} style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px', padding: '26px', borderRadius: '8px', background: 'linear-gradient(160deg,rgba(120,183,179,.1),transparent 50%),var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{l.level}</span>
                    {l.logo ? <img src={l.logo.src} alt={l.logo.alt || `${l.name} logo`} loading="lazy" style={{ flex: 'none', height: '44px', width: 'auto', objectFit: 'contain' }} /> : null}
                  </div>
                  <span style={{ font: '500 34px/1 var(--font-heading)', letterSpacing: '-.035em' }}>{l.name}</span>
                  <span style={{ marginTop: 'auto', fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{l.d}</span>
                </div>
              ))}
            </div>
          </section>
    ),
    season: () => <Season p={a} kicker={`${num('season')} · The year`} />,
    week: () => <WeekGrid week={a.week} note={a.commitNote} kicker={`${num('week')} · Commitment`} />,
    cost: () => (
        <section id="sec-cost" style={sec}>
          <SectionHead kicker={`${num('cost')} · Cost`} title="What it costs" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '28px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{a.name}</span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ font: `500 ${a.cost != null ? '56px' : '30px'}/1 var(--font-heading)`, letterSpacing: '-.04em', color: ACC, fontVariantNumeric: 'tabular-nums' }}>{a.cost != null ? money(a.cost) : 'To be announced'}</span>
                {a.cost != null && a.unit ? <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>{a.unit}</span> : null}
              </span>
              {a.costNote ? <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>{a.costNote}</p> : null}
            </div>
            {a.includes.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '28px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>What's included</span>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {a.includes.map((x) => <li key={x} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', fontSize: '15px', color: 'var(--color-neutral-200)' }}><span aria-hidden="true" style={{ color: ACC }}>✓</span>{x}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
    ),
    fields: () => (
          <section id="sec-fields" style={sec}>
            <SectionHead kicker={`${num('fields')} · Home fields`} title="Where you'll play" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '12px' }}>
              {a.venues.map((v) => (
                <a key={v.id} href={v.mapUrl} target="_blank" rel="noopener" className="hv-lift-sm" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '22px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', color: 'var(--color-text)', transition: 'box-shadow .25s,transform .25s' }}>
                  <MapPin size={22} color={ACC} aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }} />
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{v.name}</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-neutral-400)' }}>{v.address}</span>
                    <span style={{ fontSize: '13px', color: ACC }}>Directions →</span>
                  </span>
                </a>
              ))}
            </div>
          </section>
    ),
    staff: () => (
        <section id="sec-staff" style={sec}>
          <SectionHead kicker={`${num('staff')} · Staff`} title={`Who runs ${a.name}`} maxWidth="640px" />
          {a.leadership.length ? <StaffGrid people={a.leadership} /> : <p style={{ margin: 0, fontSize: '16px', color: 'var(--color-neutral-400)' }}>Staff will be listed here soon.</p>}
        </section>
    ),
    faq: () => (
          <section id="sec-faq" style={sec}>
            <SectionHead kicker={`${num('faq')} · Questions`} title="Good to know" />
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-divider)' }}>
              {a.faqs.map((f) => (
                <details key={f.q} className="ua-faq" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '20px 4px', font: '500 19px/1.3 var(--font-heading)', letterSpacing: '-.01em' }}>
                    {f.q}<Plus size={18} color={ACC} aria-hidden="true" style={{ flex: 'none' }} />
                  </summary>
                  <p style={{ margin: 0, padding: '0 4px 22px', maxWidth: '760px', fontSize: '15px', lineHeight: 1.65, color: 'var(--color-neutral-300)', whiteSpace: 'pre-line' }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
    ),
    join: () => (
        <section id="join" style={{ ...sec, padding: '64px 0 96px', scrollMarginTop: '80px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Kicker>{num('join')} · Join</Kicker>
              <h2 style={{ margin: 0, font: '500 clamp(38px,4.4vw,64px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>{a.join.heading}{a.join.headingAccent ? <> <span style={{ color: ACC }}>{a.join.headingAccent}</span></> : null}</h2>
              <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.65, color: 'var(--color-neutral-300)', maxWidth: '520px', textWrap: 'pretty' }}>{a.join.body}</p>
              {a.join.url ? <a {...joinLink} className="hv-t14" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', minHeight: '50px', padding: '0 22px', borderRadius: '10px', border: '1px solid #78b7b3', color: '#b5e1dd', font: '500 16px/1 var(--font-body)' }}>{a.join.button} →</a> : null}
              {other ? (
                <a href={other.href} className="hv-lift-sm" style={{ marginTop: '18px', alignSelf: 'stretch', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '10px', border: '1px dashed rgba(120,183,179,.5)', color: 'var(--color-text)', transition: 'box-shadow .25s,transform .25s' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Also for adults</span>
                    <span style={{ font: '500 20px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{other.name}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{other.tagline}</span>
                  </span>
                  <span aria-hidden="true" style={{ color: ACC, fontSize: '18px' }}>→</span>
                </a>
              ) : null}
            </div>
            <QuestionForm a={a} />
          </div>
        </section>
    ),
  };

  return (
    <>
      <section style={{ position: 'relative', minHeight: 'min(74vh,700px)', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
        <img src={a.img.src} alt={a.img.alt || ''} fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: a.img.pos, filter: 'grayscale(1) contrast(1.15) brightness(.62)' }} />
        <div style={{ position: 'absolute', inset: 0, background: '#78b7b3', mixBlendMode: 'color', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(17,19,24,.25),rgba(17,19,24,.6) 50%,#111318),radial-gradient(ellipse at 15% 100%,rgba(120,183,179,.22),transparent 55%)' }} />
        <div style={{ position: 'relative', width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '96px clamp(20px,4vw,56px) 44px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{a.tier}</span>
            <span style={{ width: '36px', height: '1px', background: 'var(--color-accent)' }} />
            <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '6px 11px', borderRadius: '8px', background: 'rgba(17,19,24,.55)', backdropFilter: 'blur(10px)', boxShadow: 'inset 0 0 0 1px rgba(120,183,179,.45)' }}>
              <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Who can play</span>
              <span style={{ font: '500 15px/1 var(--font-heading)', letterSpacing: '-.01em', color: ACC, whiteSpace: 'nowrap' }}>{a.ages}</span>
            </span>
          </div>
          <h1 style={{ margin: 0, font: '500 clamp(64px,12vw,190px)/.88 var(--font-heading)', letterSpacing: '-.06em', textWrap: 'balance' }}>{a.name}</h1>
          <p style={{ margin: 0, maxWidth: '640px', fontSize: 'clamp(17px,1.5vw,21px)', lineHeight: 1.5, color: 'var(--color-neutral-200)', textWrap: 'pretty' }}>{a.tagline}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', marginTop: '10px', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-divider)', boxShadow: '0 18px 40px rgba(0,0,0,.35)' }}>
            <div style={{ flex: '1.4 1 260px', display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 18px', background: 'rgba(27,29,36,.92)' }}>
              <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Status</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', font: '500 20px/1.2 var(--font-heading)', letterSpacing: '-.02em' }}><span style={{ width: '9px', height: '9px', flex: 'none', borderRadius: '50%', background: ACC, boxShadow: '0 0 0 4px rgba(120,183,179,.18),0 0 12px #78b7b3' }} />{a.join.status}</span>
            </div>
            {a.stats.map((s) => (
              <div key={s.label} style={{ flex: '1 1 170px', display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px 18px', background: 'rgba(27,29,36,.92)' }}>
                <span style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>{s.label}</span>
                <span style={{ font: '500 20px/1.2 var(--font-heading)', letterSpacing: '-.02em' }}>{s.value}</span>
              </div>
            ))}
            <a {...joinLink} className="hv-t26" style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '64px', padding: '16px 20px', background: 'rgba(120,183,179,.16)', color: '#b5e1dd', font: '500 16px/1.2 var(--font-body)', transition: 'background .2s' }}>{a.join.button}<span style={{ fontSize: '20px' }}>→</span></a>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        {shown.map((k) => <React.Fragment key={k}>{SECTION[k]()}</React.Fragment>)}
        {shown.at(-1) === 'join' ? null : <div style={{ height: '48px' }} />}
      </div>
    </>
  );
}

// Questions about joining: saved to Submissions and emailed to the league's staff.
function QuestionForm({ a }) {
  const f = useSubmit({ form: 'adult', program: a.form });
  const upsl = a.id === 'upsl';
  return (
    <div style={{ borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
      {f.sent ? (
        <Sent pad="44px 28px" head="Thanks, we got it." copy={`The ${a.name} staff will get back to you by email.`} onAgain={f.reset} />
      ) : (
        <form onSubmit={f.onSubmit} style={{ position: 'relative', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ font: '500 22px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{a.join.formHeading}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
            <Field label="Name"><input className="ua-input" name="name" required autoComplete="name" /></Field>
            <Field label="Email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
            <Field label="Phone (optional)"><input className="ua-input" name="phone" type="tel" autoComplete="tel" /></Field>
            {upsl ? (
              <Field label="Position"><select className="ua-input" name="position" defaultValue=""><option value="">Pick one</option>{['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            ) : (
              <Field label="Joining as"><select className="ua-input" name="topic" defaultValue="An individual"><option>An individual</option><option>A team</option></select></Field>
            )}
          </div>
          <Field label={upsl ? 'Where have you played? (optional)' : 'Team name, if you have one (optional)'}><input className="ua-input" name="club" placeholder={upsl ? 'e.g. college, semi-pro, academy' : ''} /></Field>
          <Field label="Your question (optional)"><textarea className="ua-input" name="message" rows={3} /></Field>
          <FormGuard error={f.error} />
          <SubmitButton busy={f.busy}>{f.busy ? 'Sending…' : `Send to ${a.name} staff`}</SubmitButton>
        </form>
      )}
    </div>
  );
}
