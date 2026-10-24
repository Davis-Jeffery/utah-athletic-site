// /futures/register/: pick a Futures session, add the player, parent, medical and emergency details,
// accept each waiver required for Futures (Studio > Settings > Waivers), then pay with Stripe Checkout. The server checks the session is open and has
// room and sets the price (src/pages/api/futures/checkout.ts); this page only collects details.
import React, { useEffect, useState } from 'react';
import { CalendarBlank, MapPin, Clock, CurrencyDollar } from '@phosphor-icons/react';
import { money, sessionLabel } from '../lib/schedule';
import { ACC, Field, FormGuard, ClassList, useSubmit, useToday } from './ui.jsx';

const box = { borderRadius: '14px', background: 'var(--color-surface)', boxShadow: 'var(--shadow-md)' };
const legend = { padding: 0, marginBottom: '12px', font: '500 20px/1.1 var(--font-heading)', letterSpacing: '-.02em', color: 'var(--color-text)' };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '12px' };

export default function FuturesRegister({ sessions, waivers, builtOn }) {
  const today = useToday(builtOn);
  const [id, setId] = useState(null);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setId(q.get('session'));
    setCancelled(q.get('cancelled') === '1');
  }, []);

  const live = sessions.filter((s) => s.end >= today);
  const open = live.filter((s) => sessionLabel(s, today).canJoin);
  // A link names the session; with only one open, it's picked for you.
  const s = live.find((x) => x.id === id) ?? (!id && open.length === 1 ? open[0] : undefined);
  const pick = (next) => {
    setId(next);
    const u = new URL(location.href);
    u.searchParams.set('session', next);
    u.searchParams.delete('cancelled');
    history.replaceState(null, '', u);
    setCancelled(false);
  };

  const f = useSubmit(
    // The waivers ticked, by id; the server checks every required one is there.
    (fields) => ({ session: s?.id, waivers: waivers.filter((w) => fields[`waiver-${w.id}`] === 'on').map((w) => w.id) }),
    '/api/futures/checkout/',
  );
  const submit = async (e) => {
    const out = await f.onSubmit(e);
    if (out?.url) location.href = out.url;
  };
  const status = s ? sessionLabel(s, today) : null;

  return (
    <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '8px clamp(16px,4vw,56px) 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: '24px', alignItems: 'start' }}>
      <aside style={{ ...box, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Session</span>
        {open.length ? (
          <div role="group" aria-label="Pick a session" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {open.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === s?.id} onClick={() => pick(x.id)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '13px 14px', borderRadius: '8px', background: x.id === s?.id ? 'rgba(120,183,179,.1)' : 'var(--color-bg)', boxShadow: `inset 0 0 0 1px ${x.id === s?.id ? '#78b7b3' : 'var(--color-divider)'}` }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ font: '500 16px/1.1 var(--font-heading)', color: x.id === s?.id ? 'var(--color-accent-300)' : 'var(--color-text)' }}>{x.name} · {x.regionLabel}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-neutral-400)' }}>{x.ages} · {x.dates}</span>
                </span>
                <span style={{ font: '500 16px/1.1 var(--font-heading)' }}>{money(x.cost)}</span>
              </button>
            ))}
          </div>
        ) : <span style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>No Futures session is open for registration right now. <a href="/futures/">See upcoming dates →</a></span>}
        {s ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', fontSize: '14px', color: 'var(--color-neutral-300)', borderTop: '1px solid var(--color-divider)' }}>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '8px' }}><CalendarBlank color={ACC} aria-hidden="true" />{s.dates}</span>
            <a href={s.mapUrl} target="_blank" rel="noopener" className="hv-link" style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-neutral-300)' }}><MapPin color={ACC} aria-hidden="true" />{s.venueName}</a>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CurrencyDollar color={ACC} aria-hidden="true" />{money(s.cost)} for the session</span>
            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Clock color={ACC} aria-hidden="true" />{status.text}</span>
            {s.classes.length ? <ClassList classes={s.classes} /> : null}
          </div>
        ) : null}
      </aside>

      <section style={{ ...box, padding: 'clamp(20px,3vw,32px)' }}>
        {cancelled ? <p role="status" style={{ margin: '0 0 18px', fontSize: '14px', color: 'var(--color-accent-300)' }}>Payment was cancelled, so you're not registered yet. You can try again below.</p> : null}
        {!s ? (
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{open.length ? 'Pick a session to start.' : 'Registration opens with the next session.'}</p>
        ) : !status.canJoin ? (
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>{s.name} · {s.regionLabel}: {status.text}.{open.length ? ' Pick an open session on the left.' : ''}</p>
        ) : (
          <form onSubmit={submit} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend style={legend}>Player</legend>
              <div style={grid}>
                <Field label="First name"><input className="ua-input" name="playerFirst" required autoComplete="off" /></Field>
                <Field label="Last name"><input className="ua-input" name="playerLast" required autoComplete="off" /></Field>
                <Field label="Birth date"><input className="ua-input" name="birthDate" required type="date" max={today} /></Field>
                <Field label="Gender"><select className="ua-input" name="gender" required defaultValue=""><option value="" disabled>Pick one</option><option>Boy</option><option>Girl</option></select></Field>
              </div>
            </fieldset>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend style={legend}>Parent or guardian</legend>
              <div style={grid}>
                <Field label="Full name"><input className="ua-input" name="parentName" required autoComplete="name" /></Field>
                <Field label="Email"><input className="ua-input" name="email" required type="email" autoComplete="email" placeholder="you@email.com" /></Field>
                <Field label="Phone"><input className="ua-input" name="phone" required type="tel" autoComplete="tel" placeholder="(801) 555-0123" /></Field>
              </div>
            </fieldset>
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend style={legend}>Health and emergency</legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Field label="Allergies or medical notes (optional)"><textarea className="ua-input" name="medical" rows={3} placeholder="Anything coaches should know" /></Field>
                <div style={grid}>
                  <Field label="Emergency contact name"><input className="ua-input" name="emergencyName" required placeholder="Someone other than you, if possible" /></Field>
                  <Field label="Emergency contact phone"><input className="ua-input" name="emergencyPhone" required type="tel" /></Field>
                </div>
              </div>
            </fieldset>
            {waivers.length ? (
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <legend style={legend}>{waivers.length > 1 ? 'Waivers' : 'Waiver'}</legend>
                {waivers.map((w) => (
                  <div key={w.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {waivers.length > 1 || w.title ? <span style={{ font: '500 16px/1.2 var(--font-heading)' }}>{w.title}</span> : null}
                    <div tabIndex={0} aria-label={`${w.title} text`} style={{ maxHeight: '220px', overflowY: 'auto', padding: '14px 16px', borderRadius: '8px', background: 'var(--color-bg)', boxShadow: 'inset 0 0 0 1px var(--color-divider)', fontSize: '13px', lineHeight: 1.6, color: 'var(--color-neutral-300)', whiteSpace: 'pre-wrap' }}>
                      {w.text}
                    </div>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', lineHeight: 1.5, color: 'var(--color-neutral-300)' }}>
                      <input type="checkbox" name={`waiver-${w.id}`} required style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: ACC }} />
                      {w.checkboxLabel || `I'm the player's parent or guardian, and I've read and accept the ${w.title}.`}
                    </label>
                  </div>
                ))}
              </fieldset>
            ) : null}
            <FormGuard error={f.error} />
            <button type="submit" disabled={f.busy} className="hv-t16" style={{ opacity: f.busy ? 0.6 : 1, cursor: 'pointer', minHeight: '52px', background: 'rgba(120,183,179,.08)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', font: '500 16px/1 var(--font-body)', borderRadius: '8px' }}>
              {f.busy ? 'Opening secure payment…' : `Continue to payment · ${money(s.cost)} →`}
            </button>
            <span style={{ fontSize: '12px', color: 'var(--color-neutral-500)' }}>You'll pay on Stripe's secure page. Your spot is confirmed once payment goes through.</span>
          </form>
        )}
      </section>
    </main>
  );
}
