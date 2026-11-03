// /events/<slug>/: a tournament's own page, for events hosted on this site (Studio: the event's
// Event page set to Host, then its Page and Rules tabs). One template for every event, colored with
// the event's own colors (--ev-*). The hero and status band are fixed; the sections below follow the
// editor's Page layout, and any with nothing filled in are left out. Status (Registration open, Sold
// out, Live, Complete) is worked out on the visitor's date, so a stale build never shows old news.
import React from 'react';
import { ArrowUpRight, CalendarBlank, MapPin, SoccerBall, UsersThree, Plus, FilePdf } from '@phosphor-icons/react';
import { eventNow, eventAction, isExternal, money, EVENT_BADGE, EVENT_STATUS_LABEL, fmtDay } from '../lib/schedule';
import { Kicker, SectionHead, useToday } from './ui.jsx';
import { orderOf } from '../../studio/shared/sections';

const sec = { padding: '64px 0', display: 'flex', flexDirection: 'column', gap: '32px', scrollMarginTop: '80px' };
const out = (href) => (isExternal(href) ? { target: '_blank', rel: 'noopener' } : {});
const card = { borderRadius: '12px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' };

// A button in the event's accent color. `solid` for the one main action.
function Btn({ href, children, solid, style }) {
  const ext = isExternal(href);
  return (
    <a href={href} {...out(href)} className={solid ? 'hv-ev-solid' : 'hv-ev'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '50px', padding: '0 22px', borderRadius: '10px', border: '1px solid var(--ev-accent)', background: solid ? 'var(--ev-accent)' : 'rgba(17,19,24,.45)', color: solid ? 'var(--ev-bg)' : 'var(--ev-ink)', font: '600 15px/1 var(--font-body)', transition: 'filter .2s,background .2s', ...style }}>
      {children}{ext ? <ArrowUpRight aria-hidden="true" /> : <span aria-hidden="true">→</span>}
    </a>
  );
}

// The hero's secondary links: small and quiet, so Register leads.
const quiet = { display: 'inline-flex', alignItems: 'center', minHeight: '44px', color: 'var(--color-neutral-300)', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,.25)', textUnderlineOffset: '4px' };

function Badge({ status, big, bare }) {
  const b = EVENT_BADGE[status], loud = status === 'full' || status === 'live';
  // Bare: no box, just the dot and label (the hero, where the logo leads). Sold out and Live stay red.
  if (bare) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', color: loud ? 'var(--color-alert)' : b.fg, fontSize: '13px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      <span className={status === 'live' ? 'ua-pulse' : undefined} style={{ width: '8px', height: '8px', borderRadius: '50%', background: loud ? 'var(--color-alert)' : b.dot, boxShadow: `0 0 10px ${loud ? 'var(--color-alert)' : b.dot}` }} />{EVENT_STATUS_LABEL[status]}
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: big ? '8px 13px' : '6px 10px', borderRadius: '7px', background: status === 'full' || status === 'live' ? 'var(--color-alert)' : 'rgba(17,19,24,.7)', color: b.fg, boxShadow: b.ring, fontSize: big ? '12px' : '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
      <span className={status === 'live' ? 'ua-pulse' : undefined} style={{ width: '7px', height: '7px', borderRadius: '50%', background: status === 'full' || status === 'live' ? '#fff' : b.dot }} />{EVENT_STATUS_LABEL[status]}
    </span>
  );
}

export default function EventPage({ ev: raw, builtOn }) {
  const today = useToday(builtOn);
  const ev = eventNow(raw, today);
  const s = ev.session;
  const { action } = eventAction(ev);
  const contactHref = `/contact/?event=${ev.id}`;
  const rulesHref = `/events/${ev.slug}/rules/`;
  // Sessions to show: the ones not over yet, else the latest.
  const current = ev.sessions.filter((x) => x.status !== 'complete');
  const shownSessions = current.length ? current : [ev.sessions.at(-1)];
  const next = ev.between ? ev.sessions.find((x) => x.status === 'coming') : null;

  const on = (k) => !ev.hide.includes(k);
  const has = {
    about: !!(ev.about.body || ev.about.photo || ev.about.video), video: !!ev.video.url, highlights: ev.highlights.photos.length > 0,
    rules: ev.rules.length > 0 || !!ev.rulesFile, sponsors: ev.sponsors.list.length > 0 || !!ev.sponsors.pitch, travel: ev.travel.list.length > 0, faq: ev.faqs.length > 0,
  };
  const shown = orderOf('eventPage', ev.order).filter((k) => on(k) && has[k] !== false);
  const num = (k) => String(shown.indexOf(k) + 1).padStart(2, '0');

  const SECTION = {
    sessions: () => (
      <section id="dates" style={sec}>
        <SectionHead kicker={`${num('sessions')} · Dates and pricing`} title={ev.sessionsHeading} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: '14px' }}>
          {shownSessions.map((x) => <SessionCard key={x.key} ev={ev} s={x} contactHref={contactHref} />)}
        </div>
      </section>
    ),
    about: () => {
      const media = ev.about.video || ev.about.photo;
      return (
        <section id="about" style={sec}>
          {/* The heading and text on the left; the photo or silent video on the right (stacked on phones). */}
          <div style={{ display: 'grid', gridTemplateColumns: media ? 'repeat(auto-fit,minmax(min(100%,420px),1fr))' : 'minmax(0,1fr)', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
              <SectionHead kicker={`${num('about')} · About`} title={ev.about.heading || `About ${ev.name}`} />
              {ev.about.body ? <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.7, color: 'var(--color-neutral-300)', whiteSpace: 'pre-line', textWrap: 'pretty' }}>{ev.about.body}</p> : null}
            </div>
            {media ? (
              <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: '16px', overflow: 'hidden', background: 'var(--color-surface)', boxShadow: '0 24px 60px rgba(0,0,0,.45)' }}>
                {ev.about.photo ? <img src={ev.about.photo.src} alt={ev.about.photo.alt || `${ev.name}`} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: ev.about.photo.pos }} /> : null}
                {ev.about.video ? <video className="ev-hero-video" src={ev.about.video} poster={ev.about.photo?.src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: ev.about.photo?.pos }} /> : null}
              </div>
            ) : null}
          </div>
        </section>
      );
    },
    video: () => (
      <section id="video" style={sec}>
        <SectionHead kicker={`${num('video')} · Watch`} title={ev.video.heading || `${ev.name} on film`} />
        {ev.video.embed ? (
          <div style={{ position: 'relative', aspectRatio: '16 / 9', borderRadius: '14px', overflow: 'hidden', background: '#000', boxShadow: '0 24px 60px rgba(0,0,0,.45)' }}>
            <iframe src={ev.video.embed} title={ev.video.heading || `${ev.name} video`} loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} />
          </div>
        ) : <Btn href={ev.video.url}>Watch the video</Btn>}
        {ev.video.caption ? <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-neutral-400)' }}>{ev.video.caption}</p> : null}
      </section>
    ),
    highlights: () => (
      <section id="highlights" style={sec}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
          <SectionHead kicker={`${num('highlights')} · Highlights`} title={ev.highlights.heading || 'Best moments'} />
          {ev.highlights.photos.length > 3 ? <span aria-hidden="true" style={{ fontSize: '13px', color: 'var(--color-neutral-500)' }}>Scroll →</span> : null}
        </div>
        <div tabIndex={0} aria-label={`${ev.name} photos`} style={{ display: 'flex', gap: '10px', overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: '6px' }}>
          {ev.highlights.photos.map((p) => (
            <figure key={p.src} style={{ flex: 'none', width: 'min(78vw,360px)', aspectRatio: '4 / 5', position: 'relative', margin: 0, borderRadius: '12px', overflow: 'hidden', scrollSnapAlign: 'start', background: 'var(--ev-bg)' }}>
              <img src={p.src} alt={p.alt || p.caption || `${ev.name} photo`} loading="lazy" decoding="async" className="hv-zoom" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos, transition: 'transform .6s' }} />
              {p.caption ? (
                <>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 60%,rgba(17,19,24,.9))', pointerEvents: 'none' }} />
                  <figcaption style={{ position: 'absolute', left: '14px', right: '14px', bottom: '12px', margin: 0, font: '500 15px/1.25 var(--font-heading)', pointerEvents: 'none' }}>{p.caption}</figcaption>
                </>
              ) : null}
            </figure>
          ))}
        </div>
      </section>
    ),
    rules: () => (
      <section id="rules" style={sec}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '24px clamp(28px,4vw,64px)', alignItems: 'end' }}>
          <SectionHead kicker={`${num('rules')} · Rules and format`} title="How it's played" intro={ev.rulesIntro} />
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
            {ev.rules.length ? <Btn href={rulesHref} solid>Read the full rules</Btn> : null}
            {ev.rulesFile ? <a href={ev.rulesFile} target="_blank" rel="noopener" className="hv-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '50px', padding: '0 6px', fontSize: '14px', color: 'var(--ev-ink)' }}><FilePdf size={20} aria-hidden="true" />Rules as a PDF</a> : null}
          </div>
        </div>
        {ev.rules.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '10px' }}>
            {ev.rules.map((r, i) => (
              <a key={r.heading} href={`${rulesHref}#rule-${i + 1}`} className="hv-lift-sm" style={{ ...card, display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px 22px', color: 'var(--color-text)', transition: 'box-shadow .25s,transform .25s' }}>
                <span style={{ fontSize: '12px', color: 'var(--ev-accent)', fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{r.heading}</span>
                <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-neutral-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.items[0]}</span>
              </a>
            ))}
          </div>
        ) : null}
      </section>
    ),
    sponsors: () => (
      <section id="sponsors" style={sec}>
        <SectionHead kicker={`${num('sponsors')} · Partners`} title={ev.sponsors.heading || 'Our sponsors'} intro={ev.sponsors.intro} />
        {ev.sponsors.list.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,200px),1fr))', gap: '10px' }}>
            {ev.sponsors.list.map((x) => {
              const inner = x.logo
                ? <img src={x.logo.src} alt={x.logo.alt || x.name} loading="lazy" style={{ maxWidth: '100%', maxHeight: '72px', objectFit: 'contain' }} />
                : <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em', textAlign: 'center' }}>{x.name}</span>;
              const box = { ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '130px', padding: '22px', color: 'var(--color-text)' };
              return x.url
                ? <a key={x.name} href={x.url} target="_blank" rel="noopener" title={x.name} className="hv-lift-sm" style={{ ...box, transition: 'box-shadow .25s,transform .25s' }}>{inner}</a>
                : <div key={x.name} title={x.name} style={box}>{inner}</div>;
            })}
          </div>
        ) : null}
        {ev.sponsors.pitch ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '20px 22px', borderRadius: '12px', border: '1px dashed var(--ev-accent)' }}>
            <span style={{ font: '500 19px/1.3 var(--font-heading)', letterSpacing: '-.01em' }}>{ev.sponsors.pitch}</span>
            <Btn href={contactHref}>Become a sponsor</Btn>
          </div>
        ) : null}
      </section>
    ),
    travel: () => (
      <section id="travel" style={sec}>
        <SectionHead kicker={`${num('travel')} · Travel`} title={ev.travel.heading || 'Where to stay'} intro={ev.travel.intro} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: '12px' }}>
          {ev.travel.list.map((t) => {
            const body = (
              <>
                <span style={{ font: '500 20px/1.15 var(--font-heading)', letterSpacing: '-.02em' }}>{t.name}</span>
                {t.detail ? <span style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--color-neutral-400)', whiteSpace: 'pre-line' }}>{t.detail}</span> : null}
                {t.url ? <span style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ev-accent)' }}>Book or learn more <ArrowUpRight aria-hidden="true" /></span> : null}
              </>
            );
            const box = { ...card, display: 'flex', flexDirection: 'column', gap: '8px', padding: '22px', color: 'var(--color-text)' };
            return t.url
              ? <a key={t.name} href={t.url} target="_blank" rel="noopener" className="hv-lift-sm" style={{ ...box, transition: 'box-shadow .25s,transform .25s' }}>{body}</a>
              : <div key={t.name} style={box}>{body}</div>;
          })}
        </div>
      </section>
    ),
    faq: () => (
      <section id="faq" style={sec}>
        <SectionHead kicker={`${num('faq')} · Questions`} title="Good to know" />
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-divider)' }}>
          {ev.faqs.map((f) => (
            <details key={f.q} className="ua-faq" style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '20px 4px', font: '500 19px/1.3 var(--font-heading)', letterSpacing: '-.01em' }}>
                {f.q}<Plus size={18} color="var(--ev-accent)" aria-hidden="true" style={{ flex: 'none' }} />
              </summary>
              <p style={{ margin: 0, padding: '0 4px 22px', maxWidth: '760px', fontSize: '15px', lineHeight: 1.65, color: 'var(--color-neutral-300)', whiteSpace: 'pre-line' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    ),
    contact: () => (
      <section id="contact" style={{ ...sec, padding: '64px 0 96px' }}>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px 32px', flexWrap: 'wrap', padding: 'clamp(28px,3.4vw,44px) clamp(22px,4vw,52px)', borderRadius: '16px', overflow: 'hidden', background: 'radial-gradient(ellipse at 0% 0%,var(--ev-bg2),var(--ev-bg) 70%)', boxShadow: '0 24px 60px rgba(0,0,0,.45)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
            <Kicker size={11} color="var(--ev-accent)">{num('contact')} · Contact</Kicker>
            <h2 style={{ margin: 0, font: '500 clamp(30px,3.6vw,48px)/1.02 var(--font-heading)', letterSpacing: '-.04em', color: 'var(--ev-ink)', textWrap: 'balance' }}>Questions about {ev.name}?</h2>
            <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--ev-ink)', opacity: 0.8 }}>Send a message and it goes straight to the tournament directors.</p>
          </div>
          <Btn href={contactHref} solid>Message the directors</Btn>
        </div>
      </section>
    ),
  };

  const heading = ev.hero.heading || ev.name;
  const logo = ev.hero.logo || ev.logo;
  return (
    <div style={{ '--ev-bg': ev.brand.bg, '--ev-bg2': ev.brand.bg2, '--ev-ink': ev.brand.ink, '--ev-accent': ev.brand.accent, '--ev-accent2': ev.brand.accent2 || ev.brand.accent, '--color-accent': ev.brand.accent }}>
      <section style={{ position: 'relative', minHeight: ev.hero.photo || ev.hero.video ? 'min(74vh,720px)' : 'min(60vh,560px)', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at 30% 20%,var(--ev-bg2),var(--ev-bg) 70%)' }}>
        {/* The photo sits under the video: it shows while the video loads, and instead of it for visitors who prefer less motion. */}
        {ev.hero.photo ? <img src={ev.hero.photo.src} alt="" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: ev.hero.photo.pos }} /> : null}
        {ev.hero.video ? <video className="ev-hero-video" src={ev.hero.video} poster={ev.hero.photo?.src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: ev.hero.photo?.pos }} /> : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(17,19,24,.35),rgba(17,19,24,.55) 45%,#111318 100%)' }} />
        {/* One left-aligned column: the logo (the Page logo, else the card logo), heading and intro, then the registration
            card (status, dates and place beside Register on wider screens), the quiet Rules and Contact links, and the quick facts. */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '1360px', margin: '0 auto', padding: '96px clamp(20px,4vw,56px) 56px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px' }}>
          {logo ? <img src={logo.src} alt={logo.alt || `${ev.name} logo`} fetchPriority="high" style={{ width: 'min(100%,clamp(220px,26vw,380px))', height: 'auto', maxHeight: 'min(28vh,240px)', objectFit: 'contain', objectPosition: 'left center', filter: 'drop-shadow(0 12px 40px rgba(0,0,0,.55))' }} /> : null}
          <h1 style={{ margin: logo ? '4px 0 0' : 0, maxWidth: '900px', font: logo ? '500 clamp(32px,4.2vw,64px)/1 var(--font-heading)' : '500 clamp(52px,7vw,120px)/.92 var(--font-heading)', letterSpacing: '-.045em', textWrap: 'balance' }}>
            {heading}{ev.hero.headingAccent ? <> <span style={{ color: 'var(--ev-accent)' }}>{ev.hero.headingAccent}</span></> : null}
          </h1>
          <p style={{ margin: 0, maxWidth: '640px', fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.5, color: 'var(--color-neutral-200)', textWrap: 'pretty' }}>{ev.hero.intro || ev.tagline}</p>
          {/* Registering is the point: status, dates, Register and the deadline in one card; Rules and Contact are quiet links under it. */}
          <div className="ev-hero-cta" style={{ width: 'min(100%,820px)', marginTop: '10px', display: 'grid', gap: '16px 28px', alignItems: 'center', padding: 'clamp(18px,2vw,24px) clamp(18px,2.4vw,28px)', borderRadius: '18px', background: 'rgba(17,19,24,.6)', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 24px 60px rgba(0,0,0,.45)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <Badge status={s.status} bare />
              <span style={{ fontSize: '13px', lineHeight: 1.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ev-ink)' }}>{s.dates} · {s.location}</span>
              {s.status === 'open' ? <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>Registration closes {fmtDay(s.regClose)}</span> : null}
            </div>
            {s.status === 'full' || action.href === ev.href ? null : <Btn href={action.href} solid style={{ width: '100%', minWidth: '240px', minHeight: '60px', borderRadius: '12px', fontSize: '17px' }}>{action.label}</Btn>}
          </div>
          <div style={{ display: 'flex', gap: '6px 24px', flexWrap: 'wrap', fontSize: '14px', marginTop: '-6px' }}>
            {has.rules ? <a href={ev.rules.length ? rulesHref : ev.rulesFile} {...out(ev.rules.length ? rulesHref : ev.rulesFile)} className="hv-link" style={quiet}>Rules and format →</a> : null}
            <a href={contactHref} className="hv-link" style={quiet}>Contact the directors →</a>
          </div>
          {on('stats') && ev.stats.length ? <FactCards stats={ev.stats} /> : null}
        </div>
      </section>


      <StatusBand ev={ev} s={s} next={next} contactHref={contactHref} />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
        {shown.map((k) => <React.Fragment key={k}>{SECTION[k]()}</React.Fragment>)}
      </div>
    </div>
  );
}

// The quick facts (Studio: Quick facts bar), as a row of small cards across the bottom of the hero.
function FactCards({ stats }) {
  return (
    <dl style={{ width: '100%', margin: '18px 0 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: '10px' }}>
      {stats.map((x, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(17,19,24,.55)', border: '1px solid rgba(255,255,255,.08)', backdropFilter: 'blur(10px)' }}>
          <dt style={{ font: '600 clamp(22px,2vw,28px)/1 var(--font-heading)', letterSpacing: '-.03em', color: 'var(--ev-accent2)' }}>{x.value}</dt>
          {x.label ? <dd style={{ margin: 0, fontSize: '13px', lineHeight: 1.4, color: 'var(--color-neutral-300)' }}>{x.label}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

// The band under the hero: loud when it matters (Sold out, Live now, the event's over), else nothing.
function StatusBand({ ev, s, next, contactHref }) {
  const band = (tone, children) => (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 clamp(20px,4vw,56px)' }}>
      <div role="status" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px 28px', flexWrap: 'wrap', marginTop: '8px', padding: 'clamp(20px,2.6vw,30px) clamp(20px,3vw,36px)', borderRadius: '14px', ...tone }}>{children}</div>
    </div>
  );
  const title = { margin: 0, font: '500 clamp(26px,3vw,40px)/1.05 var(--font-heading)', letterSpacing: '-.035em' };
  if (s.status === 'full') return band({ background: 'var(--color-alert)', color: '#fff', boxShadow: '0 18px 48px rgba(239,100,97,.3)' }, (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>Sold out</span>
        <p style={title}>Every spot for {ev.name} {s.label} is taken.</p>
        <span style={{ fontSize: '15px', opacity: 0.9 }}>Want to be first in line if a spot opens? Ask the directors to add you to the waitlist.</span>
      </div>
      <a href={contactHref} className="hv-ev" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '50px', padding: '0 22px', borderRadius: '10px', border: '1px solid #fff', color: '#fff', font: '600 15px/1 var(--font-body)' }}>Join the waitlist →</a>
    </>
  ));
  if (s.status === 'live') return band({ background: 'var(--color-surface)', boxShadow: '0 0 0 1px var(--color-alert),0 18px 48px rgba(0,0,0,.35)' }, (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-alert)' }}><span className="ua-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-alert)' }} />Live now</span>
        <p style={title}>{ev.name} is being played right now.</p>
        <span style={{ fontSize: '15px', color: 'var(--color-neutral-400)' }}>Game times, fields and scores are on the schedule.</span>
      </div>
      {s.scheduleUrl ? <Btn href={s.scheduleUrl} solid>View the schedule</Btn> : null}
    </>
  ));
  if (ev.between) return band({ background: 'radial-gradient(ellipse at 0% 0%,var(--ev-bg2),var(--ev-bg) 70%)', color: 'var(--ev-ink)', boxShadow: '0 18px 48px rgba(0,0,0,.35)' }, (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '760px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ev-accent)' }}>{ev.last.label} is complete</span>
        <p style={title}>{ev.after.heading || 'Thank you. See you next year.'}</p>
        {ev.after.body ? <span style={{ fontSize: '16px', lineHeight: 1.6, opacity: 0.85, whiteSpace: 'pre-line' }}>{ev.after.body}</span> : null}
        {next ? (
          <span style={{ display: 'flex', gap: '8px 18px', flexWrap: 'wrap', marginTop: '6px', fontSize: '15px' }}>
            <span><b style={{ fontWeight: 600 }}>Next:</b> {next.dates}</span>
            <span><b style={{ fontWeight: 600 }}>Registration opens</b> {fmtDay(next.regOpen)}</span>
          </span>
        ) : <span style={{ fontSize: '15px', opacity: 0.85 }}>Dates for next year are coming soon.</span>}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {ev.last.resultsUrl ? <Btn href={ev.last.resultsUrl} solid>View {ev.last.label} results</Btn> : null}
        <Btn href={contactHref}>Get updates</Btn>
      </div>
    </>
  ));
  return null;
}

// One session: dates, place, format, ages, prices and what to do now.
function SessionCard({ ev, s, contactHref }) {
  const st = s.status;
  const row = (Icon, label, value) => value ? <><Icon size={18} color="var(--ev-accent)" aria-label={label} /><span>{value}</span></> : null;
  return (
    <article style={{ ...card, display: 'flex', flexDirection: 'column', gap: '18px', padding: 'clamp(20px,2.4vw,28px)', boxShadow: st === 'full' ? '0 0 0 2px var(--color-alert)' : st === 'open' ? '0 0 0 1px var(--ev-accent)' : card.boxShadow }}>
      {s.logo ? <img src={s.logo.src} alt={s.logo.alt || `${ev.name} ${s.label} logo`} loading="lazy" style={{ alignSelf: 'flex-start', width: 'auto', maxWidth: '100%', height: '72px', objectFit: 'contain', objectPosition: 'left center' }} /> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ font: '500 26px/1.05 var(--font-heading)', letterSpacing: '-.03em' }}>{s.label}</span>
        <Badge status={st} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 12px', alignItems: 'center', fontSize: '15px' }}>
        {row(CalendarBlank, 'Dates', s.dates)}
        <MapPin size={18} color="var(--ev-accent)" aria-label="Location" /><a href={s.mapUrl} target="_blank" rel="noopener" className="hv-link" title={`Directions to ${s.location}`} style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--color-neutral-600)', textUnderlineOffset: '3px' }}>{s.location}</a>
        {row(SoccerBall, 'Format', s.format)}
        {row(UsersThree, 'Ages', s.ages)}
      </div>
      {s.note ? <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: 'var(--color-neutral-300)', whiteSpace: 'pre-line' }}>{s.note}</p> : null}
      {s.fees.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--color-divider)' }}>
          {s.fees.map((f) => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}><span style={{ fontSize: '15px' }}>{f.label}</span>{f.note ? <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>{f.note}</span> : null}</span>
              <span style={{ font: '500 26px/1 var(--font-heading)', letterSpacing: '-.03em', color: 'var(--ev-accent)', fontVariantNumeric: 'tabular-nums' }}>{money(f.price)}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {st === 'open' && s.registerUrl ? <Btn href={s.registerUrl} solid>Register a team</Btn> : null}
        {st === 'full' ? <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: '50px', padding: '0 20px', borderRadius: '10px', background: 'var(--color-alert)', color: '#fff', font: '700 15px/1 var(--font-body)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Sold out</span> : null}
        {st === 'coming' ? <span style={{ fontSize: '15px', color: 'var(--color-neutral-300)' }}>Registration opens <b style={{ fontWeight: 600, color: 'var(--color-text)' }}>{fmtDay(s.regOpen)}</b>, closes {fmtDay(s.regClose)}.</span> : null}
        {st === 'open' ? <span style={{ fontSize: '13px', color: 'var(--color-neutral-400)' }}>Closes {fmtDay(s.regClose)}</span> : null}
        {(st === 'closed' || st === 'live') && s.scheduleUrl ? <Btn href={s.scheduleUrl} solid={st === 'live'}>View the schedule</Btn> : null}
        {st === 'closed' && !s.scheduleUrl ? <span style={{ fontSize: '15px', color: 'var(--color-neutral-300)' }}>Registration is closed. The schedule is posted here before the first game.</span> : null}
        {st === 'complete' && s.resultsUrl ? <Btn href={s.resultsUrl} solid>View results</Btn> : null}
        {st === 'full' ? <a href={contactHref} className="hv-link" style={{ fontSize: '14px', color: 'var(--ev-ink)' }}>Join the waitlist →</a> : null}
      </div>
    </article>
  );
}
