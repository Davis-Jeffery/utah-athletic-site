// Home page: collage hero with the pathway pyramid, tryouts near you, tournaments,
// the Athletic Global teaser, the docuseries and the closing call to action.
import React, { useEffect, useRef, useState } from 'react';
import { CalendarBlank, MapPin, ArrowUpRight, Triangle, ListBullets } from '@phosphor-icons/react';
import { ORDER, REGION_ORDER, PYRAMID_POINTS as PTS, PYRAMID_LABELS, COLLAGE_TILES } from '../../data/site';
import { orderOf } from '../../../studio/shared/sections';
import { eventsWithStatus, nextFor, EVENT_STATUS_LABEL } from '../../lib/schedule';
import { ACC, Kicker, Rule, OutlineLink, Field, FormGuard, Sent, SubmitButton, useSubmit } from '../ui.jsx';
import SiteFooter from '../SiteFooter.jsx';

const ptsAttr = (id) => PTS[id].slice(0, id === 'pro' ? 3 : 4).map((q) => q.join(',')).join(' ');
const STATUS_STYLE = {
  open: { dot: '#78b7b3', fg: '#d6f0ee', ring: 'inset 0 0 0 1px #78b7b3' },
  coming: { dot: '#e9e9ed', fg: '#e9e9ed', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
  closed: { dot: '#e9e9ed', fg: '#e9e9ed', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
  past: { dot: '#5f616b', fg: '#8b8d98', ring: 'inset 0 0 0 1px rgba(233,233,237,.25)' },
};

// A heading with an optional teal second part, as edited in Site settings.
const Head = ({ h }) => <>{h.heading}{h.headingAccent ? <>{' '}<span style={{ color: ACC }}>{h.headingAccent}</span></> : null}</>;
// "RC Vichy crest" -> "RC Vichy" / "crest", so the text wraps neatly inside the circle.
const twoLines = (s) => { const i = s.lastIndexOf(' '); return i > 0 ? <>{s.slice(0, i)}<br />{s.slice(i + 1)}</> : s; };

const HeroHeading = ({ as: Tag, ...rest }) => <Tag {...rest} />;

export default function Home({ data, hover, focus, intro, introDone, active, tilt: tiltOn, myRegion, today, onHover, onOpen, onNetwork }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [heroView, setHeroView] = useState('list'); // phones only: pyramid or list (.hero-view in global.css)
  const heroMove = (e) => {
    if (!tiltOn || active) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };
  const heroLeave = () => { setTilt({ x: 0, y: 0 }); onHover(null); };
  const P = Object.fromEntries(data.programs.map((p) => [p.id, p]));
  // No region chosen (header menu): "Play for us" shows every region, each card naming its region.
  const region = data.regions.find((r) => r.id === myRegion) ?? null;
  const tryoutsHref = `/tryouts/?region=${region ? region.id : 'all'}`;
  // "Play for us" cards: only programs with something to register for in the region (past dates
  // drop off on the visitor's date); nothing posted, no card. With no tryouts, Academy and Club
  // become a trial request form.
  const cards = ORDER.flatMap((id) => (region ? [region.id] : REGION_ORDER).map((r) => ({ id, r, n: nextFor(data, id, r, today) })))
    .filter((c) => c.n.kind !== 'none');
  const noTryouts = !cards.some((c) => c.n.kind === 'tryout');
  // Nothing in the visitor's region, but tryouts elsewhere: say so, so the page doesn't look empty.
  const elsewhere = region && noTryouts
    ? data.regions.filter((r) => r.id !== region.id && ORDER.some((id) => nextFor(data, id, r.id, today).kind === 'tryout')).map((r) => r.label)
    : [];
  const label = (r) => (region ? null : data.regions.find((x) => x.id === r).label);
  const { home, pro } = data;
  // Sections the editor hid (Home page > Hide sections).
  const on = (k) => !home.hide.includes(k);

  // The sections under the hero, drawn in the editor's order (Studio > Home page > Page layout).
  const SECTION = {
    tryouts: () => (
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '56px clamp(20px,4vw,56px) 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Kicker line>{home.tryouts.kicker} · {region ? `${region.label} region` : 'All regions'}</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(32px,3.8vw,52px)/1 var(--font-heading)', letterSpacing: '-.04em' }}><Head h={home.tryouts} /></h2>
          </div>
          <OutlineLink href={tryoutsHref}>All tryouts →</OutlineLink>
        </div>
        {elsewhere.length ? (
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>
            No tryouts posted in {region.label} yet. {elsewhere.join(' and ')} {elsewhere.length === 1 ? 'has' : 'have'} tryouts open.{' '}
            <a href="/tryouts/?region=all" style={{ color: 'var(--color-accent-300)', whiteSpace: 'nowrap' }}>See all regions →</a>
          </p>
        ) : null}
        {/* With no tryouts posted, Academy and Club become a trial request form. */}
        <div style={noTryouts ? { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' } : { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '10px' }}>
          {noTryouts ? <TrialRequest key={region ? region.id : 'all'} data={data} region={region ? region.id : REGION_ORDER[0]} /> : null}
          {noTryouts ? (cards.length ? (
            <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cards.map((c) => <PlayCard key={c.id + c.r} P={P} id={c.id} n={c.n} place={label(c.r)} />)}
            </div>
          ) : null) : cards.map((c) => <PlayCard key={c.id + c.r} P={P} id={c.id} n={c.n} place={label(c.r)} />)}
        </div>
      </section>
    ),
    events: () => (
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px clamp(20px,4vw,56px) 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Kicker line>{home.events.kicker}</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(32px,3.8vw,52px)/1 var(--font-heading)', letterSpacing: '-.04em' }}><Head h={home.events} /></h2>
          </div>
          <OutlineLink href="/events/">All tournaments &amp; events →</OutlineLink>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '10px' }}>
          {eventsWithStatus(data.events, today).slice(0, 4).map((e) => {
            const st = STATUS_STYLE[e.status];
            return (
              // The whole card opens the event's site (a cover link); the location is its own directions link on top.
              <div key={e.id} className="hv-event-sm" style={{ '--ev-accent': e.brand.accent, position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', background: 'var(--color-surface)', color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)', transition: 'transform .25s,box-shadow .25s' }}>
                <a href={e.url} target="_blank" rel="noopener" aria-label={`${e.name}: event site`} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: `radial-gradient(ellipse at 30% 20%,${e.brand.bg2},${e.brand.bg} 70%)` }}>
                  {e.logo ? <img src={e.logo.src} alt={e.logo.alt || `${e.name} logo`} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: e.logo.pos }} /> : null}
                  <span style={{ position: 'absolute', left: '12px', top: '12px', display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(17,19,24,.75)', boxShadow: st.ring, fontSize: '10px', letterSpacing: '.08em', textTransform: 'uppercase', color: st.fg }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />{EVENT_STATUS_LABEL[e.status]}
                  </span>
                  <span style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '3px', background: e.brand.accent }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px 16px 16px' }}>
                  <span style={{ font: '500 19px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{e.name}</span>
                  <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{e.dates} · <a href={e.mapUrl} target="_blank" rel="noopener" className="hv-link" title={`Directions to ${e.location}`} style={{ position: 'relative', zIndex: 2, color: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--color-neutral-600)', textUnderlineOffset: '3px' }}>{e.location}</a></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '6px', fontSize: '13px', color: e.brand.accent }}>Event site <ArrowUpRight aria-hidden="true" /></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    ),
    pathway: () => (
      <section id="network" style={{ maxWidth: '1440px', margin: '0 auto', padding: '40px clamp(20px,4vw,56px) 72px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        <Rule />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Kicker line>{home.pathway.kicker}</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(36px,4.4vw,60px)/1 var(--font-heading)', letterSpacing: '-.04em', textWrap: 'balance' }}>{home.pathway.heading}</h2>
            <p style={{ margin: 0, maxWidth: '520px', fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>{home.pathway.body}</p>
            <a href="/network/" onClick={(e) => { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); onNetwork(); } }} className="hv-t10" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px', transition: 'background .2s' }}>{home.pathway.button} →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {home.pathway.cards.map((c, i) => (
              <NetworkRow key={i} dashed={c.look === 'development'} name={c.name} sub={c.details} tag={c.tag}
                crest={c.useClubLogo ? <img src={data.logo} alt="" width="56" height="56" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                  : c.crest ? <img src={c.crest.src} alt={c.crest.alt || ''} width="56" height="56" loading="lazy" style={{ width: '56px', height: '56px', objectFit: 'contain', objectPosition: c.crest.pos }} />
                    : c.crestLabel ? <span style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed var(--color-neutral-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', textAlign: 'center', color: 'var(--color-neutral-500)' }}>{twoLines(c.crestLabel)}</span>
                      : <span style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px dashed var(--color-neutral-600)' }} />} />
            ))}
          </div>
        </div>
      </section>
    ),
    inside: () => (
      <section id="inside" style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px clamp(20px,4vw,56px) 88px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <Rule />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, font: '500 clamp(34px,4vw,56px)/1 var(--font-heading)', letterSpacing: '-.035em' }}>{home.inside.heading}</h2>
          <Kicker>{home.inside.kicker}</Kicker>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '20px' }}>
          {data.videos.map((v) => (
            <a key={v.url} href={v.url} target="_blank" rel="noopener" className="hv-video" style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--color-text)' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '8px', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
                <img src={v.img.src} alt={v.img.alt || ''} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: v.img.pos, filter: 'saturate(.5) brightness(.85)' }} />
                <span style={{ position: 'absolute', left: '12px', bottom: '12px', fontSize: '12px', padding: '5px 9px', borderRadius: '6px', background: 'rgba(17,19,24,.8)', color: 'var(--color-text)' }}>▶ {v.len}</span>
              </div>
              <span style={{ font: '500 18px/1.25 var(--font-heading)', letterSpacing: '-.015em' }}>{v.title}</span>
            </a>
          ))}
        </div>
      </section>
    ),
    play: () => (
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px) 96px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: 'clamp(32px,5vw,64px)', borderRadius: '14px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.18),transparent 60%),var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ margin: 0, font: '500 clamp(40px,6vw,88px)/.95 var(--font-heading)', letterSpacing: '-.045em' }}>{home.play.heading}</h2>
          <p style={{ margin: 0, maxWidth: '520px', fontSize: '17px', color: 'var(--color-neutral-300)' }}>{home.play.body}</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => onOpen('academy')} className="hv-t12" style={{ cursor: 'pointer', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px' }}>{home.play.primaryButton} →</button>
            <a href="#programs" className="hv-ghost" style={{ border: '1px solid var(--color-divider)', color: 'var(--color-text)', font: '500 15px/1 var(--font-body)', padding: '14px 20px', borderRadius: '8px' }}>{home.play.secondaryButton}</a>
          </div>
        </div>
      </section>
    ),
  };
  return (
    <>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="hero-collage"><Collage photos={data.collage} tf={`scale(1.04) translate(${(tilt.x * -14).toFixed(1)}px,${(tilt.y * -10).toFixed(1)}px)`} /></div>
          <div className="hero-single"><PhotoRotator photos={data.collage} /></div>
          <div style={{ position: 'absolute', inset: 0, background: '#78b7b3', mixBlendMode: 'color', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,#111318 0%,rgba(17,19,24,.88) 30%,rgba(17,19,24,.35) 62%,rgba(17,19,24,.55) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(17,19,24,.6) 0%,transparent 25%,transparent 70%,#111318 100%)' }} />
        </div>
        <section id="programs" data-view={heroView} onMouseMove={heroMove} onMouseLeave={heroLeave} style={{ position: 'relative', maxWidth: '1440px', margin: '0 auto', padding: 'clamp(48px,7vw,104px) clamp(20px,4vw,56px) 72px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,440px),1fr))', gap: '56px', alignItems: 'center' }}>
          <div aria-hidden="true" style={{ position: 'absolute', right: '8%', top: '18%', width: '520px', height: '520px', maxWidth: '100%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,183,179,.16),transparent 65%)', pointerEvents: 'none', transform: `translate(${(tilt.x * 40).toFixed(1)}px,${(tilt.y * 40).toFixed(1)}px)`, transition: 'transform .5s ease' }} />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <Kicker line>{home.hero.kicker}</Kicker>
            {/* The page's one main heading, unless a program is open on top (it has its own). */}
            <HeroHeading as={active ? 'p' : 'h1'} style={{ margin: 0, font: '500 clamp(54px,7.2vw,112px)/.94 var(--font-heading)', letterSpacing: '-.045em', textWrap: 'balance' }}>{home.hero.heading}<br /><span style={{ color: ACC }}>{home.hero.headingAccent}</span></HeroHeading>
            <p style={{ margin: 0, maxWidth: '470px', fontSize: '17px', lineHeight: 1.6, color: 'var(--color-neutral-300)', textWrap: 'pretty' }}>{home.hero.intro}</p>
            <ViewToggle view={heroView} onChange={setHeroView} />
            <div className="hero-list" style={{ display: 'flex', flexDirection: 'column', maxWidth: '520px' }}>
              <LevelRow id="pro" num="Pro" name={pro.rowName} line={pro.rowLine} right={`${pro.rowLink} →`} on={focus === 'pro'}
                onEnter={() => onHover('pro')} onLeave={() => onHover(null)} onClick={onNetwork} />
              {ORDER.map((id) => {
                const p = P[id];
                return <LevelRow key={id} id={id} num={p.num} kicker={p.kicker} name={p.name} line={p.line} right={`${p.ages} →`} on={focus === id}
                  onEnter={() => onHover(id)} onLeave={() => onHover(null)} onClick={() => onOpen(id)} />;
              })}
            </div>
          </div>
          <Pyramid P={P} proTier={pro} adult={home.adult} hover={hover} focus={focus} intro={intro} introDone={introDone} tilt={tiltOn ? tilt : null} onHover={onHover} onOpen={onOpen} onNetwork={onNetwork} />
        </section>
      </div>

      {/* Sections in the editor's order; hidden ones are left out. */}
      {orderOf('home', home.order).filter(on).map((k) => <React.Fragment key={k}>{SECTION[k]()}</React.Fragment>)}
      <SiteFooter social={data.settings.social} />
    </>
  );
}

// One "Play for us" card: the next tryout or session a family in the region can sign up for.
// `place` names the region when the cards show every region.
function PlayCard({ P, id, n, place }) {
  return (
    <div className="hv-lift-sm" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px', borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .2s,transform .2s' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{P[id].name}{place ? ` · ${place}` : ''}</span>
        <span style={{ fontSize: '11px', color: 'var(--color-neutral-500)' }}>{n.kind === 'season' || (n.kind === 'none' && P[id].kind === 'season') ? 'Season sign-up' : n.kind === 'tryout' ? 'Next tryout' : 'Not yet posted'}</span>
      </span>
      <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{n.title}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', color: 'var(--color-neutral-300)' }}>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CalendarBlank color={ACC} aria-hidden="true" />{n.when}</span>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MapPin color={ACC} aria-hidden="true" />{n.where}</span>
      </span>
      <OutlineLink href={n.href} external={n.external} className="hv-t10" style={{ marginTop: 'auto', border: '1px solid var(--color-accent-800)' }}>{n.cta} →</OutlineLink>
    </div>
  );
}

// "Play for us" with no tryout dates posted: a trial request for Academy or Club in a region. It goes to
// that program's leaders there (src/pages/api/submit.ts), and the family gets a confirmation naming them.
function TrialRequest({ data, region: start }) {
  const tryoutPrograms = data.programs.filter((p) => p.kind === 'tryout');
  const [program, setProgram] = useState(tryoutPrograms[tryoutPrograms.length - 1]?.id ?? 'club');
  const [region, setRegion] = useState(start);
  const p = tryoutPrograms.find((x) => x.id === program) ?? tryoutPrograms[0];
  const rm = data.regions.find((r) => r.id === region);
  const lead = (p.regions[region].status === 'none' ? [] : p.regions[region].leaders).find((l) => l.email) ?? rm.leaders.find((l) => l.email);
  const f = useSubmit({ form: 'trial', program, region });
  const pill = (on) => ({ cursor: 'pointer', minHeight: '40px', padding: '0 14px', borderRadius: '8px', font: '500 13px/1 var(--font-body)', transition: 'all .2s', border: `1px solid ${on ? '#78b7b3' : 'var(--color-divider)'}`, background: on ? 'rgba(120,183,179,.12)' : 'transparent', color: on ? '#78b7b3' : 'var(--color-neutral-300)' });
  return (
    <div style={{ flex: '2 1 520px', borderRadius: '12px', background: 'radial-gradient(ellipse at 0% 0%,rgba(120,183,179,.14),transparent 60%),var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)', overflow: 'hidden' }}>
      {f.sent ? (
        <Sent pad="44px 28px" head="Request received." copy={`We've emailed you a confirmation. ${lead ? `${lead.name} from` : 'The'} ${rm.label} ${p.name} staff will contact you within 48 hours to set up a trial.`} again="Request another" onAgain={f.reset} />
      ) : (
        <form onSubmit={f.onSubmit} style={{ position: 'relative', padding: 'clamp(20px,2.6vw,28px)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Tryout dates coming soon</span>
            <span style={{ font: '500 clamp(24px,2.4vw,30px)/1.1 var(--font-heading)', letterSpacing: '-.03em' }}>Request a trial</span>
            <span style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>Tryout dates aren't posted yet. Tell us about your player and our staff will invite them to a training session.</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
            <div role="group" aria-label="Program" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {tryoutPrograms.map((x) => <button key={x.id} type="button" aria-pressed={program === x.id} onClick={() => setProgram(x.id)} style={pill(program === x.id)}>{x.name}</button>)}
            </div>
            <div role="group" aria-label="Region" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {data.regions.map((r) => <button key={r.id} type="button" aria-pressed={region === r.id} onClick={() => setRegion(r.id)} style={pill(region === r.id)}>{r.label}</button>)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' }}>
            <Field label="Player name"><input className="ua-input" name="player" required placeholder="First and last" autoComplete="off" /></Field>
            <Field label="Age group"><select key={program} className="ua-input" name="birthYear">{p.ageGroups.map((y) => <option key={y}>{y}</option>)}</select></Field>
            <Field label="Parent name"><input className="ua-input" name="name" required autoComplete="name" /></Field>
            <Field label="Parent email"><input className="ua-input" name="email" required type="email" placeholder="you@email.com" autoComplete="email" /></Field>
            <Field label="Parent phone"><input className="ua-input" name="phone" type="tel" placeholder="Optional" autoComplete="tel" /></Field>
            <Field label="Current club and team"><input className="ua-input" name="club" placeholder="Optional" /></Field>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>Goes to: <span style={{ color: 'var(--color-accent-300)' }}>{lead ? `${lead.name}, ${lead.role}` : `${rm.label} ${p.name} staff`}</span></span>
          <FormGuard error={f.error} />
          <SubmitButton busy={f.busy}>{f.busy ? 'Sending…' : `Request a ${p.name} trial →`}</SubmitButton>
        </form>
      )}
    </div>
  );
}

// Phones only, in place of the row number: the whole pyramid in outline with this row's piece filled.
function MiniPyramid({ id, on }) {
  return (
    <svg className="row-pyr" viewBox="-8 -8 616 496" width="36" height="29" aria-hidden="true" style={{ overflow: 'visible' }}>
      {['pro', ...ORDER].map((k) => (
        <polygon key={k} points={ptsAttr(k)} vectorEffect="non-scaling-stroke" strokeWidth="1"
          fill={k === id ? (on ? ACC : 'var(--color-accent-300)') : 'transparent'} stroke={k === id ? 'none' : 'rgba(120,183,179,.45)'} />
      ))}
    </svg>
  );
}

// Phones only: switch the hero between the program list and the pyramid (the adult boxes stay in both).
function ViewToggle({ view, onChange }) {
  const opt = (k, Icon, label) => (
    <button type="button" aria-pressed={view === k} onClick={() => onChange(k)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '40px', padding: '0 14px', borderRadius: '8px', border: 0, font: '500 14px/1 var(--font-body)', transition: 'all .2s', background: view === k ? 'rgba(120,183,179,.14)' : 'transparent', boxShadow: view === k ? 'inset 0 0 0 1px #78b7b3' : 'none', color: view === k ? ACC : 'var(--color-neutral-300)' }}>
      <Icon size={18} weight={view === k ? 'fill' : 'regular'} aria-hidden="true" />{label}
    </button>
  );
  return (
    <div role="group" aria-label="Show programs as" className="hero-toggle" style={{ alignSelf: 'center', gap: '4px', padding: '3px', borderRadius: '10px', background: 'var(--color-surface)', boxShadow: 'inset 0 0 0 1px var(--color-divider)' }}>
      {opt('list', ListBullets, 'List')}
      {opt('pyramid', Triangle, 'Pyramid')}
    </div>
  );
}

function LevelRow({ id, num, kicker, name, line, right, on, onEnter, onLeave, onClick }) {
  return (
    <button type="button" onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave} onClick={onClick} style={{ all: 'unset', cursor: 'pointer', display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', gap: '12px', padding: '15px 14px', borderRadius: '8px', background: on ? 'rgba(120,183,179,.08)' : 'transparent', transition: 'background .25s' }}>
      <span style={{ fontSize: '12px', color: on ? ACC : 'var(--color-neutral-500)', fontVariantNumeric: 'tabular-nums' }}>
        <span className="row-num">{num}</span>
        <MiniPyramid id={id} on={on} />
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {/* The pyramid's tier label (Elite, Competitive ...); phones only, where the list stands in for the pyramid. */}
        {kicker ? <span className="row-kicker" style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: on ? ACC : 'var(--color-accent-300)' }}>{kicker}</span> : null}
        <span style={{ font: '500 21px/1.1 var(--font-heading)', letterSpacing: '-.02em' }}>{name}</span>
        <span style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>{line}</span>
      </span>
      <span style={{ fontSize: '13px', color: on ? ACC : 'var(--color-neutral-500)', transform: on ? 'translateX(4px)' : 'none', transition: 'all .25s' }}>{right}</span>
    </button>
  );
}

function NetworkRow({ crest, name, sub, tag, dashed }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: '16px', alignItems: 'center', padding: '18px', borderRadius: '10px', ...(dashed ? { border: '1px dashed var(--color-neutral-600)' } : { background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-accent-800)' }) }}>
      {crest}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ font: '500 19px/1.15 var(--font-heading)', letterSpacing: '-.02em', color: dashed ? 'var(--color-neutral-300)' : undefined }}>{name}</span>
        <span style={{ fontSize: '13px', color: dashed ? 'var(--color-neutral-500)' : 'var(--color-neutral-400)' }}>{sub}</span>
      </div>
      <span style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', padding: '5px 8px', borderRadius: '5px', ...(dashed ? { border: '1px solid var(--color-divider)', color: 'var(--color-neutral-400)' } : { background: 'rgba(120,183,179,.14)', color: 'var(--color-accent-300)' }) }}>{tag}</span>
    </div>
  );
}

// The pathway pyramid. Each slice is keyboard-focusable and opens its program.
function Pyramid({ P, proTier, adult, hover, focus, intro, introDone, tilt, onHover, onOpen, onNetwork }) {
  const slice = (id, open) => {
    const on = hover === id, dim = hover && !on;
    const row = { pro: -1, academy: 0, club: 1, rec: 2, futures: 2 }[id];
    const delay = introDone ? 0 : id === 'pro' ? 0.42 : (2 - row) * 0.14 + (id === 'futures' ? 0.06 : 0);
    const rest = id === 'pro' ? 'url(#uaPro)' : 'url(#uaRest)';
    const stroke = on ? ACC : id === 'pro' ? 'rgba(120,183,179,.85)' : focus === id ? 'rgba(120,183,179,.75)' : 'rgba(120,183,179,.5)';
    const name = id === 'pro' ? `${proTier.pyramidName}: the ${proTier.pyramidKicker} network` : P[id].name;
    return (
      <polygon key={id} points={ptsAttr(id)} role="link" tabIndex={0} aria-label={name}
        onMouseEnter={() => onHover(id)} onMouseLeave={() => onHover(null)} onFocus={() => onHover(id)} onBlur={() => onHover(null)}
        onClick={open} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
        fill={on ? 'url(#uaFill)' : rest} stroke={stroke} strokeWidth="1.5"
        style={{ cursor: 'pointer', outline: 'none', opacity: !intro ? 0 : dim ? 0.45 : 1, transform: !intro ? 'translateY(40px)' : on ? 'translateY(-8px)' : 'none', transition: `transform .55s cubic-bezier(.2,.8,.2,1) ${delay}s, opacity .5s ${delay}s, fill .25s, stroke .25s` }} />
    );
  };
  const lab = (id) => ({ op: !intro ? 0 : hover && hover !== id ? 0.45 : 1, lift: hover === id ? 'translateY(-8px)' : '', kc: hover === id ? ACC : 'var(--color-accent-300)' });
  const pro = lab('pro');
  const glow = hover || null;
  const hint = hover === 'pro' ? proTier.hint : hover ? 'Click to open ' + P[hover].name
    : <><span className="hint-mouse">Hover a level · click to explore</span><span className="hint-touch">Tap a level to explore</span></>;
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '120%', height: '120%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(ellipse at center,rgba(17,19,24,.85) 0%,rgba(17,19,24,.55) 40%,transparent 70%)', pointerEvents: 'none' }} />
      <div data-pyr="1" className="hero-pyr" style={{ position: 'relative', width: 'min(100%,600px)', aspectRatio: '600 / 480', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.6))', transform: tilt ? `perspective(1400px) rotateY(${(tilt.x * 14).toFixed(2)}deg) rotateX(${(-tilt.y * 10).toFixed(2)}deg)` : 'none', transition: 'transform .45s cubic-bezier(.2,.8,.2,1)' }}>
        <svg viewBox="0 0 600 480" role="group" aria-label="The Utah Athletic pathway" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="uaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#78b7b3" stopOpacity=".42" /><stop offset="1" stopColor="#78b7b3" stopOpacity=".08" /></linearGradient>
            <linearGradient id="uaPro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#78b7b3" stopOpacity=".55" /><stop offset="1" stopColor="#78b7b3" stopOpacity=".16" /></linearGradient>
            <linearGradient id="uaRest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b1d24" stopOpacity=".88" /><stop offset="1" stopColor="#111318" stopOpacity=".82" /></linearGradient>
            <filter id="uaGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
          </defs>
          <polygon points="300,0 600,480 0,480" fill="#78b7b3" opacity=".22" filter="url(#uaGlow)" />
          <polygon points={ptsAttr(glow || 'academy')} fill="#78b7b3" opacity={glow ? 0.35 : 0} filter="url(#uaGlow)" style={{ transition: 'opacity .3s' }} />
          {slice('pro', onNetwork)}
          {ORDER.map((id) => slice(id, () => onOpen(id)))}
        </svg>
        {/* Inside the top triangle: the short label ("Pro"). */}
        <div aria-hidden="true" style={{ position: 'absolute', left: PYRAMID_LABELS.pro.x, top: PYRAMID_LABELS.pro.y, transform: `translate(-50%,-50%) ${pro.lift}`, pointerEvents: 'none', whiteSpace: 'nowrap', opacity: pro.op, transition: 'transform .35s cubic-bezier(.2,.8,.2,1),opacity .5s' }}>
          <span style={{ font: `500 ${PYRAMID_LABELS.pro.fs}/1 var(--font-heading)`, letterSpacing: '-.02em', color: hover === 'pro' ? 'var(--color-text)' : '#d6f0ee' }}>{proTier.pyramidShort}</span>
        </div>
        {/* Beside it, only while the top triangle is pointed at (or focused): the full label. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '61%', top: '11%', transform: `translateY(-50%) ${pro.lift} ${hover === 'pro' ? '' : 'translateX(-10px)'}`, display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none', whiteSpace: 'nowrap', opacity: hover === 'pro' ? 1 : 0, transition: 'transform .35s cubic-bezier(.2,.8,.2,1),opacity .3s' }}>
          <span style={{ width: '28px', height: '1px', background: 'linear-gradient(to left,#78b7b3,transparent)' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: pro.kc }}>{proTier.pyramidKicker}</span>
            <span style={{ font: '500 19px/1 var(--font-heading)', letterSpacing: '-.03em', color: 'var(--color-text)' }}>{proTier.pyramidName}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-neutral-300)' }}>{proTier.pyramidSub} →</span>
          </span>
        </div>
        {ORDER.map((id) => {
          const l = lab(id), pos = PYRAMID_LABELS[id];
          return (
            <div key={id} aria-hidden="true" style={{ position: 'absolute', left: pos.x, top: pos.y, transform: `translate(-50%,-50%) ${l.lift}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', opacity: l.op, transition: 'transform .35s cubic-bezier(.2,.8,.2,1),opacity .5s' }}>
              <span style={{ fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: l.kc }}>{P[id].kicker}</span>
              <span style={{ font: `500 ${pos.fs}/1 var(--font-heading)`, letterSpacing: '-.03em', color: 'var(--color-text)' }}>{P[id].name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-neutral-300)' }}>{P[id].ages}</span>
            </div>
          );
        })}
      </div>
      {adult ? <AdultPathways adult={adult} show={intro} dim={!!hover} /> : null}
      <div className="hero-pyr" style={{ position: 'relative', fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-300)' }}>{hint}</div>
    </div>
  );
}

// Adult pathways: boxes set apart under the pyramid, styled like its slices.
function AdultPathways({ adult, show, dim }) {
  return (
    <div style={{ position: 'relative', width: 'min(100%,600px)', display: 'flex', flexDirection: 'column', gap: '10px', opacity: !show ? 0 : dim ? 0.45 : 1, transform: show ? 'none' : 'translateY(24px)', transition: 'opacity .5s .5s,transform .55s cubic-bezier(.2,.8,.2,1) .5s' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '10px', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>
        {adult.kicker}<span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(120,183,179,.5),transparent)' }} />
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(adult.items.length, 2)},1fr)`, gap: '12px' }}>
        {adult.items.map((a) => {
          const body = (
            <>
              <span style={{ font: '500 19px/1 var(--font-heading)', letterSpacing: '-.03em', color: 'var(--color-text)' }}>{a.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-neutral-300)' }}>{a.details}{a.href ? ' →' : ''}</span>
            </>
          );
          const style = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '76px', padding: '14px 12px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(27,29,36,.88),rgba(17,19,24,.82))', boxShadow: 'inset 0 0 0 1.5px rgba(120,183,179,.5),0 24px 48px rgba(0,0,0,.45)', transition: 'box-shadow .25s,transform .25s' };
          return a.href
            ? <a key={a.name} href={a.href} {...(/^https?:/.test(a.href) ? { target: '_blank', rel: 'noopener' } : {})} className="hv-adult" style={style}>{body}</a>
            : <div key={a.name} style={style}>{body}</div>;
        })}
      </div>
    </div>
  );
}

// Phones (max-width 720px, matching .hero-single in global.css) show PhotoRotator instead of the collage.
const PHONE = typeof window === 'undefined' ? { matches: false } : matchMedia('(max-width: 720px)');

// Phone hero: one full-screen photo at a time, crossfading every 5s through the collage photos.
// Like the collage, the next photo only starts loading one step before it's shown.
function PhotoRotator({ photos }) {
  const [cur, setCur] = useState(0);
  const [armed, setArmed] = useState(() => new Set([0, 1 % photos.length]));
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let i = 0;
    const timer = setInterval(() => {
      if (document.hidden || !PHONE.matches) return;
      i = (i + 1) % photos.length;
      setCur(i);
      setArmed((s) => new Set(s).add((i + 1) % photos.length));
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'min(100%,100svh)', overflow: 'hidden', background: '#111318', filter: 'grayscale(1) contrast(1.2) brightness(.82)', WebkitMaskImage: 'linear-gradient(180deg,#000 55%,transparent)', maskImage: 'linear-gradient(180deg,#000 55%,transparent)' }}>
      {photos.map((photo, k) => {
        const on = cur === k;
        return <div key={k} style={{ position: 'absolute', inset: 0, backgroundImage: armed.has(k) ? `url("${photo.lg}")` : 'none', backgroundSize: 'cover', backgroundPosition: photo.pos || 'center 30%', opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(1.08)', transition: 'opacity 1.4s ease,transform 7s cubic-bezier(.2,.8,.2,1)' }} />;
      })}
    </div>
  );
}

// Rotating photo collage behind the hero. Each tile crossfades to its next photo; one tile
// changes every 1.7s in shuffled order, paused while the tab is hidden. A tile's next photo
// only starts loading one step before it's shown, so the page doesn't fetch all 20 up front.
function Collage({ photos, tf }) {
  const n = COLLAGE_TILES.length;
  const [cur, setCur] = useState(() => Array(n).fill(0));
  const [armed, setArmed] = useState(() => new Set());
  const curRef = useRef(cur);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
    let step = 0;
    const arm = (t) => setArmed((s) => new Set(s).add(t + ':' + ((curRef.current[t] + 1) % 3)));
    arm(order[0]);
    const timer = setInterval(() => {
      if (document.hidden || PHONE.matches) return;
      const t = order[step % n];
      step += 1;
      const next = curRef.current.slice();
      next[t] = (next[t] + 1) % 3;
      curRef.current = next;
      setCur(next);
      arm(order[step % n]);
    }, 1700);
    return () => clearInterval(timer);
  }, [n]);
  return (
    <div style={{ position: 'absolute', inset: '-3%', display: 'grid', gridTemplateColumns: 'repeat(6,minmax(0,1fr))', gridTemplateRows: 'repeat(3,minmax(0,1fr))', gap: '4px', background: '#111318', filter: 'grayscale(1) contrast(1.2) brightness(.82)', transform: tf, transition: 'transform .6s ease' }}>
      {COLLAGE_TILES.map(([col, row], t) => (
        <div key={t} style={{ position: 'relative', overflow: 'hidden', gridColumn: col, gridRow: row, background: '#15171d' }}>
          {[0, 1, 2].map((k) => {
            const on = cur[t] === k, load = k === 0 || on || armed.has(t + ':' + k), photo = photos[(t + k * n) % photos.length];
            return <div key={k} style={{ position: 'absolute', inset: 0, backgroundImage: load ? `url("${photo.src}")` : 'none', backgroundSize: 'cover', backgroundPosition: photo.pos || `center ${30 + ((t * 7) % 30)}%`, opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(1.08)', transition: 'opacity 1.4s ease,transform 7s cubic-bezier(.2,.8,.2,1)' }} />;
          })}
        </div>
      ))}
    </div>
  );
}
