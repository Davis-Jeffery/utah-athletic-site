// Every email the site sends, in one design: the auto-reply to whoever filled in a form, the
// notification to staff, and the Futures payment confirmation. Each builder returns
// { subject, html, text } for sendEmail(). Server-only, like the rest of src/lib/server.
//
// Email clients ignore most CSS, so the layout is tables with inline styles in the site's colors
// (teal on near-black, src/styles/global.css). Inter loads where the client allows web fonts
// (Apple Mail, iOS); elsewhere it falls back to the system sans-serif.

// The site logo as a PNG on Sanity's CDN: a fixed address that works before and after the domain moves.
const LOGO = 'https://cdn.sanity.io/images/03wnsd9x/production/7136068a606a4a8c18b238e508f4eda1a27b6a96-166x77.png';
const STUDIO = 'https://utah-athletic.sanity.studio';

const C = {
  page: '#0c0d11', bg: '#111318', card: '#1b1d24', line: '#2c2f38',
  text: '#e9e9ed', soft: '#cfd3e5', mute: '#9397ab', accent: '#78b7b3', accentSoft: '#b5e1dd',
};
const FONT = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export type Person = { name: string; role?: string; email: string };
export type Row = [label: string, value: string | undefined | null];
type Email = { subject: string; html: string; text: string };

const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl = (v: string) => esc(v).replace(/\n/g, '<br>');
const first = (name?: string) => (name ?? '').trim().split(/\s+/)[0] || 'there';
const filled = (rows: Row[]) => rows.filter((r): r is [string, string] => !!r[1]);

type Block =
  | { kind: 'text'; body: string }
  | { kind: 'details'; title?: string; rows: Row[] }
  | { kind: 'person'; title: string; person: Person; note?: string }
  | { kind: 'quote'; title: string; body: string }
  | { kind: 'list'; title: string; items: string[] }
  | { kind: 'button'; label: string; href: string };

type Layout = {
  preheader: string; kicker: string; heading: string; headingAccent?: string;
  intro: string; blocks?: Block[]; signoff?: string; footer: string;
};

function render(l: Layout): { html: string; text: string } {
  const label = (t: string) => `<div style="font:500 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${C.accent};margin:0 0 12px">${esc(t)}</div>`;
  const card = (inner: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:${C.card};border:1px solid ${C.line};border-radius:12px"><tr><td style="padding:20px 22px">${inner}</td></tr></table>`;
  const html = (b: Block) => {
    switch (b.kind) {
      case 'text': return `<p style="margin:0;font:400 16px/1.65 ${FONT};color:${C.soft}">${nl(b.body)}</p>`;
      case 'details': {
        const rows = filled(b.rows);
        if (!rows.length) return '';
        return card(`${b.title ? label(b.title) : ''}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.map(([k, v], i) =>
          `<tr><td style="padding:9px 12px 9px 0;vertical-align:top;width:38%;font:400 13px/1.5 ${FONT};color:${C.mute};${i ? `border-top:1px solid ${C.line}` : ''}">${esc(k)}</td><td style="padding:9px 0;vertical-align:top;font:500 14px/1.5 ${FONT};color:${C.text};${i ? `border-top:1px solid ${C.line}` : ''}">${nl(v)}</td></tr>`).join('')}</table>`);
      }
      case 'person': return card(`${label(b.title)}<div style="font:500 20px/1.25 ${FONT};letter-spacing:-.01em;color:${C.text}">${esc(b.person.name)}</div>${b.person.role ? `<div style="margin-top:2px;font:400 14px/1.5 ${FONT};color:${C.mute}">${esc(b.person.role)}</div>` : ''}<div style="margin-top:10px"><a href="mailto:${esc(b.person.email)}" style="font:500 15px/1.4 ${FONT};color:${C.accent};text-decoration:none">${esc(b.person.email)}</a></div>${b.note ? `<div style="margin-top:10px;font:400 13px/1.55 ${FONT};color:${C.mute}">${nl(b.note)}</div>` : ''}`);
      case 'quote': return card(`${label(b.title)}<div style="font:400 15px/1.65 ${FONT};color:${C.soft}">${nl(b.body)}</div>`);
      case 'list': return card(`${label(b.title)}${b.items.map((x, i) => `<div style="padding:7px 0;font:400 14px/1.5 ${FONT};color:${C.text};${i ? `border-top:1px solid ${C.line}` : ''}">${esc(x)}</div>`).join('')}`);
      case 'button': return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border:1px solid ${C.accent};border-radius:8px"><a href="${esc(b.href)}" style="display:inline-block;padding:13px 20px;font:500 15px/1 ${FONT};color:${C.accentSoft};text-decoration:none">${esc(b.label)} &rarr;</a></td></tr></table>`;
    }
  };
  const blocks = (l.blocks ?? []).map(html).filter(Boolean).map((b) => `<tr><td style="padding:0 0 16px">${b}</td></tr>`).join('');

  const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">
<title>${esc(l.heading)}${l.headingAccent ? ' ' + esc(l.headingAccent) : ''}</title></head>
<body style="margin:0;padding:0;background:${C.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(l.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${C.bg};border-radius:16px;overflow:hidden">
  <tr><td style="padding:26px 32px 22px;border-bottom:2px solid ${C.accent}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="${LOGO}" width="78" height="36" alt="Utah Athletic" style="display:block;border:0;height:36px;width:auto"></td>
      <td align="right" style="font:500 11px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${C.mute}">Utah Athletic</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:34px 32px 8px">
    ${label(l.kicker)}
    <h1 style="margin:0 0 14px;font:500 30px/1.12 ${FONT};letter-spacing:-.03em;color:${C.text}">${esc(l.heading)}${l.headingAccent ? ` <span style="color:${C.accent}">${esc(l.headingAccent)}</span>` : ''}</h1>
    <p style="margin:0 0 24px;font:400 16px/1.65 ${FONT};color:${C.soft}">${nl(l.intro)}</p>
  </td></tr>
  <tr><td style="padding:0 32px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${blocks}</table></td></tr>
  ${l.signoff ? `<tr><td style="padding:4px 32px 30px;font:400 15px/1.6 ${FONT};color:${C.soft}">${nl(l.signoff)}</td></tr>` : ''}
  <tr><td style="padding:20px 32px 26px;background:${C.card};border-top:1px solid ${C.line};font:400 12px/1.6 ${FONT};color:${C.mute}">
    <span style="color:${C.soft}">Utah Athletic</span> &middot; Every level. One standard.<br>${nl(l.footer)}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  // Plain-text version for clients that don't show HTML (and for spam filters).
  const t = (b: Block) => {
    switch (b.kind) {
      case 'text': return b.body;
      case 'details': { const rows = filled(b.rows); return rows.length ? `${b.title ? b.title.toUpperCase() + '\n' : ''}${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}` : ''; }
      case 'person': return `${b.title.toUpperCase()}\n${b.person.name}${b.person.role ? `, ${b.person.role}` : ''}\n${b.person.email}${b.note ? `\n${b.note}` : ''}`;
      case 'quote': return `${b.title.toUpperCase()}\n${b.body}`;
      case 'list': return `${b.title.toUpperCase()}\n${b.items.map((x) => `  ${x}`).join('\n')}`;
      case 'button': return `${b.label}: ${b.href}`;
    }
  };
  const text = [`${l.heading}${l.headingAccent ? ' ' + l.headingAccent : ''}`, l.intro, ...(l.blocks ?? []).map(t).filter(Boolean), l.signoff, `--\nUtah Athletic\n${l.footer}`]
    .filter(Boolean).join('\n\n');
  return { html: page, text };
}

const AUTO_FOOTER = 'You\'re getting this because you sent a form on the Utah Athletic website. Reply to this email to reach us.';

// ---------- auto-replies to whoever filled in a form ----------

export type Submitted = {
  form: 'contact' | 'trial' | 'invite' | 'interest' | 'register' | 'adult';
  name?: string; email: string; phone?: string; player?: string; birthYear?: string; club?: string; position?: string;
  video?: string; topic?: string; message?: string; session?: string;
  /** "Club", "Academy", "UPSL" … and "North" … as shown to people. */
  programName?: string; regionName?: string;
};

/**
 * The confirmation sent to the person who sent a form. `contact` is who will answer: the director
 * for trials, invitations and registrations, the league staff for adult questions, the main office
 * for the contact form.
 */
export function autoReply(f: Submitted, contact: Person): Email {
  const who = f.programName && f.regionName ? `${f.regionName} ${f.programName}` : f.programName || f.regionName || 'Utah Athletic';
  const player = f.player || 'your player';
  const director: Block = { kind: 'person', title: 'Who will contact you', person: contact, note: 'Questions before then? Reply to this email or write to them directly.' };

  switch (f.form) {
    case 'trial':
      return {
        subject: `We got your ${f.programName ? f.programName + ' ' : ''}trial application for ${player}`,
        ...render({
          preheader: `${contact.name} will be in touch within 48 hours to schedule a trial.`,
          kicker: 'Trial application received', heading: 'Thanks for applying,', headingAccent: `${first(f.name)}.`,
          intro: `We've received ${player}'s application for a ${who} trial. ${contact.name}${contact.role ? `, ${contact.role},` : ''} will review it and contact you within 48 hours to schedule a trial.`,
          blocks: [director, { kind: 'details', title: 'What you sent', rows: [['Player', f.player], ['Age group', f.birthYear], ['Current club', f.club], ['Position', f.position], ['Highlight video', f.video], ['Program', who]] }],
          signoff: 'We look forward to seeing them play.\nUtah Athletic', footer: AUTO_FOOTER,
        }),
      };
    case 'invite':
      return {
        subject: `We got your Academy invitation request for ${player}`,
        ...render({
          preheader: `${contact.name} will be in touch within 48 hours.`,
          kicker: 'Invitation request received', heading: 'Thanks for reaching out,', headingAccent: `${first(f.name)}.`,
          intro: `We've received your request for ${player} to be invited to an Academy trial${f.regionName ? ` in the ${f.regionName} region` : ''}. ${contact.name}${contact.role ? `, ${contact.role},` : ''} will review it and contact you within 48 hours.`,
          blocks: [director, { kind: 'details', title: 'What you sent', rows: [['Player', f.player], ['Age group', f.birthYear], ['Current club', f.club], ['Position', f.position], ['Highlight video', f.video]] }],
          signoff: 'Utah Athletic', footer: AUTO_FOOTER,
        }),
      };
    case 'register':
      return {
        subject: `We got your ${who} registration request`,
        ...render({
          preheader: `${contact.name} will email you within 48 hours with next steps.`,
          kicker: 'Registration request received', heading: 'Thanks,', headingAccent: `${first(f.name)}.`,
          intro: `We've received your request to register ${player} for ${who}${f.session ? `, ${f.session}` : ''}. ${contact.name} will email you within 48 hours with next steps.`,
          blocks: [director, { kind: 'details', title: 'What you sent', rows: [['Player', f.player], ['Session', f.session], ['Age group', f.birthYear], ['Current club', f.club]] }],
          signoff: 'Utah Athletic', footer: AUTO_FOOTER,
        }),
      };
    case 'interest':
      return {
        subject: `You're on the list for ${who}`,
        ...render({
          preheader: `We'll email you as soon as there's news about ${who}.`,
          kicker: 'You\'re on the list', heading: 'Thanks for your interest,', headingAccent: `${first(f.name)}.`,
          intro: `We've added you to our ${who} contact list. We'll email you with updates on the program in your area, including when sessions are posted and registration opens.`,
          blocks: [
            { kind: 'details', title: 'What you signed up for', rows: [['Program', f.programName], ['Region', f.regionName], ['Age group', f.birthYear]] },
            { kind: 'text', body: `Questions in the meantime? Reply to this email and it goes to ${contact.name}.` },
          ],
          signoff: 'Utah Athletic', footer: AUTO_FOOTER,
        }),
      };
    case 'adult':
      return {
        subject: `We got your question about ${f.programName ?? 'our adult leagues'}`,
        ...render({
          preheader: 'Someone from our staff will reply within 48 hours.',
          kicker: 'Message received', heading: 'Thanks,', headingAccent: `${first(f.name)}.`,
          intro: `We've received your question about ${f.programName ?? 'our adult leagues'}. Someone from our staff will reply within 48 hours.`,
          blocks: [
            ...(contact.name !== 'Utah Athletic' ? [director] : []),
            { kind: 'details', title: 'What you sent', rows: [['League', f.programName], ['Position', f.position], ['Joining as', f.topic], ['Played for', f.club]] },
            ...(f.message ? [{ kind: 'quote' as const, title: 'Your message', body: f.message }] : []),
          ],
          signoff: 'Utah Athletic', footer: AUTO_FOOTER,
        }),
      };
    case 'contact':
    default:
      return {
        subject: 'We got your message',
        ...render({
          preheader: 'Someone from our team will reply within 48 hours.',
          kicker: 'Message received', heading: 'Thanks for reaching out,', headingAccent: `${first(f.name)}.`,
          intro: 'We\'ve received your message and someone from our team will get back to you within 48 hours.',
          blocks: [
            { kind: 'details', title: 'What you sent', rows: [['Topic', f.topic], ['Program', f.programName], ['Region', f.regionName]] },
            ...(f.message ? [{ kind: 'quote' as const, title: 'Your message', body: f.message }] : []),
          ],
          signoff: 'Utah Athletic', footer: AUTO_FOOTER,
        }),
      };
  }
}

// ---------- notification to staff ----------

/** What staff get when a form comes in. Reply goes straight to the person who sent it. */
export function staffNotice(f: Submitted, formName: string): Email {
  const where = [f.programName, f.regionName].filter(Boolean).join(' · ');
  const who = f.player || f.name || f.email;
  return {
    subject: `${formName}${where ? ` · ${where}` : ''}: ${who}`,
    ...render({
      preheader: `${f.name || f.email}${f.topic ? ` · ${f.topic}` : ''}`,
      kicker: `New · ${formName}`, heading: who,
      intro: `Sent from the website${where ? ` for ${where}` : ''}. Reply to this email to answer ${first(f.name) === 'there' ? 'them' : first(f.name)} directly.`,
      blocks: [
        { kind: 'details', title: 'Details', rows: [['Name', f.name], ['Email', f.email], ['Phone', f.phone], ['Topic', f.topic], ['Player', f.player], ['Birth year or age group', f.birthYear], ['Session', f.session], ['Club', f.club], ['Position', f.position], ['Video', f.video], ['Program', f.programName], ['Region', f.regionName]] },
        ...(f.message ? [{ kind: 'quote' as const, title: 'Message', body: f.message }] : []),
        { kind: 'button', label: 'Open Submissions in the Studio', href: STUDIO },
      ],
      footer: 'Saved in the Studio under Submissions. Mark it In progress or Done there so the team knows it\'s handled.',
    }),
  };
}

// ---------- Futures payment ----------

export type FuturesPaid = {
  parentName: string; player: string; session: string; dates?: string; where?: string; paid: string;
  classes: string[]; contact?: Person;
  birthDate?: string; gender?: string; email?: string; phone?: string; medical?: string; emergency?: string;
};

/** The family's confirmation after paying for Futures. */
export function futuresConfirmation(r: FuturesPaid): Email {
  return {
    subject: `${r.player} is registered for Futures · ${r.session}`,
    ...render({
      preheader: `Your spot in ${r.session} is confirmed. Stripe sends your receipt separately.`,
      kicker: 'Registration confirmed', heading: `${first(r.player)} is`, headingAccent: 'registered.',
      intro: `Hi ${first(r.parentName)},\nThanks for joining Futures. Your spot is confirmed, and Stripe is emailing your payment receipt separately.`,
      blocks: [
        { kind: 'details', title: 'Your session', rows: [['Session', r.session], ['Dates', r.dates], ['Where', r.where], ['Paid', r.paid]] },
        ...(r.classes.length ? [{ kind: 'list' as const, title: 'Class dates', items: r.classes }] : []),
        ...(r.contact ? [{ kind: 'person' as const, title: 'Your Futures contact', person: r.contact, note: 'Questions? Reply to this email or write to them directly.' }] : []),
      ],
      signoff: 'See you on the field.\nUtah Athletic',
      footer: 'You\'re getting this because you registered a player for Utah Athletic Futures.',
    }),
  };
}

/** Staff copy of a Futures payment. */
export function futuresStaffNotice(r: FuturesPaid): Email {
  return {
    subject: `New Futures registration · ${r.session}: ${r.player}`,
    ...render({
      preheader: `${r.player} · paid ${r.paid}`,
      kicker: 'New · Futures registration', heading: r.player, headingAccent: 'is registered.',
      intro: `Paid online for ${r.session}. Reply to this email to answer the family directly.`,
      blocks: [
        { kind: 'details', title: 'Player and family', rows: [['Player', r.player], ['Birth date', r.birthDate], ['Gender', r.gender], ['Parent', r.parentName], ['Email', r.email], ['Phone', r.phone], ['Emergency contact', r.emergency], ['Medical notes', r.medical]] },
        { kind: 'details', title: 'Session', rows: [['Session', r.session], ['Dates', r.dates], ['Where', r.where], ['Paid', r.paid]] },
        { kind: 'button', label: 'Open Futures registrations in the Studio', href: STUDIO },
      ],
      footer: 'Saved in the Studio under Futures registrations.',
    }),
  };
}

// ---------- group email from the Studio's Registrations page ----------

/** A message staff send to a group of registered families (/api/broadcast/). One per family. */
export function groupMessage(m: { subject: string; body: string; audienceLabel: string; parentName?: string; players: string[]; programName: string; sender?: string }): Email {
  return {
    subject: m.subject,
    ...render({
      preheader: m.body.slice(0, 120),
      kicker: m.audienceLabel, heading: m.subject,
      intro: `Hi ${first(m.parentName)},`,
      blocks: [{ kind: 'text', body: m.body }],
      signoff: `${m.sender ? `${m.sender}\n` : ''}Utah Athletic`,
      footer: `You're getting this because you registered ${m.players.join(' and ')} for Utah Athletic ${m.programName}. Reply to this email to reach us.`,
    }),
  };
}
