// The automatic emails families get (Studio > Settings > Automatic emails): each one's wording,
// the name fields it can use, and the default wording used for any field left empty. Shared by
// the Studio (one fixed document per email, `emailTemplate.<key>`) and the website, which fills
// in the fields when it sends (src/lib/server/email.ts). The "Who will contact you" card, the
// "What you sent" summary and the staff notices stay automatic.

export type TemplateText = {
  subject: string; preview: string; kicker: string; heading: string; headingAccent: string;
  message: string; signoff: string; footer: string;
};
type Template = { title: string; when: string; fields: string[]; defaults: TemplateText };

const FORM_FOOTER = 'You\'re getting this because you sent a form on the Utah Athletic website. Reply to this email to reach us.';
// Fields every form auto-reply can use.
const FORM_FIELDS = ['{Parent first name}', '{Parent full name}', '{Player}', '{Program}', '{Region}', '{Program and region}', '{Contact name}', '{Contact role}'];

export const EMAIL_TEMPLATES = {
  trial: {
    title: 'Trial application', when: 'Sent when someone applies for a player trial (Academy or Club).', fields: FORM_FIELDS,
    defaults: {
      subject: 'We got your {Program} trial application for {Player}',
      preview: '{Contact name} will be in touch within 48 hours to schedule a trial.',
      kicker: 'Trial application received', heading: 'Thanks for applying,', headingAccent: '{Parent first name}.',
      message: 'We\'ve received {Player}\'s application for a {Program and region} trial. {Contact name}, {Contact role}, will review it and contact you within 48 hours to schedule a trial.',
      signoff: 'We look forward to seeing them play.\nUtah Athletic', footer: FORM_FOOTER,
    },
  },
  invite: {
    title: 'Academy invitation request', when: 'Sent when someone asks for an invitation to an Academy trial (Tryouts page).', fields: FORM_FIELDS,
    defaults: {
      subject: 'We got your Academy invitation request for {Player}',
      preview: '{Contact name} will be in touch within 48 hours.',
      kicker: 'Invitation request received', heading: 'Thanks for reaching out,', headingAccent: '{Parent first name}.',
      message: 'We\'ve received your request for {Player} to be invited to an Academy trial in the {Region} region. {Contact name}, {Contact role}, will review it and contact you within 48 hours.',
      signoff: 'Utah Athletic', footer: FORM_FOOTER,
    },
  },
  register: {
    title: 'Registration request', when: 'Sent when someone asks to register for a session through the site\'s form.', fields: [...FORM_FIELDS, '{Session}'],
    defaults: {
      subject: 'We got your {Program and region} registration request',
      preview: '{Contact name} will email you within 48 hours with next steps.',
      kicker: 'Registration request received', heading: 'Thanks,', headingAccent: '{Parent first name}.',
      message: 'We\'ve received your request to register {Player} for {Program and region}, {Session}. {Contact name} will email you within 48 hours with next steps.',
      signoff: 'Utah Athletic', footer: FORM_FOOTER,
    },
  },
  interest: {
    title: 'Register interest', when: 'Sent when someone joins the list for a program or region that isn\'t open yet ("Get notified").', fields: FORM_FIELDS,
    defaults: {
      subject: 'You\'re on the list for {Program and region}',
      preview: 'We\'ll email you as soon as there\'s news about {Program and region}.',
      kicker: 'You\'re on the list', heading: 'Thanks for your interest,', headingAccent: '{Parent first name}.',
      message: 'We\'ve added you to our {Program and region} contact list. We\'ll email you with updates on the program in your area, including when sessions are posted and registration opens.\n\nQuestions in the meantime? Reply to this email and it goes to {Contact name}.',
      signoff: 'Utah Athletic', footer: FORM_FOOTER,
    },
  },
  adult: {
    title: 'Adult league question', when: 'Sent when someone asks about UPSL or Adult Recreation.', fields: FORM_FIELDS,
    defaults: {
      subject: 'We got your question about {Program}',
      preview: 'Someone from our staff will reply within 48 hours.',
      kicker: 'Message received', heading: 'Thanks,', headingAccent: '{Parent first name}.',
      message: 'We\'ve received your question about {Program}. Someone from our staff will reply within 48 hours.',
      signoff: 'Utah Athletic', footer: FORM_FOOTER,
    },
  },
  contact: {
    title: 'Contact message', when: 'Sent when someone uses the Contact page form.', fields: FORM_FIELDS,
    defaults: {
      subject: 'We got your message',
      preview: 'Someone from our team will reply within 48 hours.',
      kicker: 'Message received', heading: 'Thanks for reaching out,', headingAccent: '{Parent first name}.',
      message: 'We\'ve received your message and someone from our team will get back to you within 48 hours.',
      signoff: 'Utah Athletic', footer: FORM_FOOTER,
    },
  },
  futuresPaid: {
    title: 'Futures registration confirmed', when: 'Sent to the family when their Futures payment goes through.',
    fields: ['{Parent first name}', '{Parent full name}', '{Player}', '{Player first name}', '{Session}', '{Dates}', '{Where}', '{Paid}'],
    defaults: {
      subject: '{Player} is registered for Futures · {Session}',
      preview: 'Your spot in {Session} is confirmed. Stripe sends your receipt separately.',
      kicker: 'Registration confirmed', heading: '{Player first name} is', headingAccent: 'registered.',
      message: 'Hi {Parent first name},\nThanks for joining Futures. Your spot is confirmed, and Stripe is emailing your payment receipt separately.',
      signoff: 'See you on the field.\nUtah Athletic', footer: 'You\'re getting this because you registered a player for Utah Athletic Futures.',
    },
  },
} as const satisfies Record<string, Template>;

export type TemplateKey = keyof typeof EMAIL_TEMPLATES;
export const TEMPLATE_KEYS = Object.keys(EMAIL_TEMPLATES) as TemplateKey[];

/**
 * Fills {Field} names in with values. A field with no value (e.g. no contact role) is left out with
 * the commas around it, so "{Contact name}, {Contact role}, will" reads "Jo will", and doubled
 * spaces are tidied. Unknown names are left as typed, so a typo shows up in a test.
 */
export function fillTemplate(text: string, values: Record<string, string | undefined | null>, o: { keepEdges?: boolean } = {}) {
  const re = (k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let out = text;
  for (const [k, v] of Object.entries(values)) if (!v) out = out.replace(new RegExp(`,\\s*${re(k)}\\s*,`, 'gi'), '');
  const known = new Map(Object.entries(values).map(([k, v]) => [k.toLowerCase(), v ?? '']));
  const filled = out.replace(/\{[^{}\n]{1,40}\}/g, (m) => (known.has(m.toLowerCase()) ? known.get(m.toLowerCase())! : m));
  const lines = filled.split('\n').map((l) => l.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+([,.!?;:])/g, '$1').replace(/,(\s*[,.])/g, '$1'));
  // A piece of formatted text keeps the spaces at its ends ("Hi " + bold "Jo"); whole fields are trimmed.
  return o.keepEdges ? lines.join('\n') : lines.map((l) => l.trim()).join('\n').trim();
}
