// Shared field builders and validation rules. Every text field goes through these, so the
// writing rules (no em dashes) and placeholder checks apply everywhere without repeating them.
import { defineField, type ImageRule, type StringRule, type TextRule, type UrlRule } from 'sanity';

type Opts = { description?: string; required?: boolean; group?: string; fieldset?: string; hidden?: any; readOnly?: boolean; rows?: number };

const noEmDash = (v: unknown) =>
  typeof v === 'string' && v.includes('—') ? 'No em dashes. Use a period, comma or colon instead.' : true;

/** One-line text. */
export const str = (name: string, title: string, o: Opts = {}) =>
  defineField({
    name, title, type: 'string', description: o.description, group: o.group, fieldset: o.fieldset, hidden: o.hidden, readOnly: o.readOnly,
    validation: (r: StringRule) => (o.required ? r.required() : r).custom(noEmDash),
  });

/** Multi-line text. */
export const txt = (name: string, title: string, o: Opts = {}) =>
  defineField({
    name, title, type: 'text', rows: o.rows ?? 3, description: o.description, group: o.group, fieldset: o.fieldset, hidden: o.hidden,
    validation: (r: TextRule) => (o.required ? r.required() : r).custom(noEmDash),
  });

/** Web link. Flags leftover placeholder links (example.com) as a warning, not an error. */
export const link = (name: string, title: string, o: Opts = {}) =>
  defineField({
    name, title, type: 'url', description: o.description, group: o.group, fieldset: o.fieldset,
    validation: (r: UrlRule) => [
      (o.required ? r.required() : r).uri({ scheme: ['http', 'https', 'mailto'] }),
      r.custom((v) => (typeof v === 'string' && /example\.(com|org)|ollie\.example/.test(v) ? 'This is still a placeholder link.' : true)).warning(),
    ],
  });

/** Photo with hotspot, so crops keep the important part of the picture at every size. */
export const photo = (name: string, title: string, o: Opts = {}) =>
  defineField({
    name, title, type: 'image', options: { hotspot: true }, description: o.description, group: o.group, fieldset: o.fieldset,
    fields: [defineField({ name: 'alt', title: 'Describe the photo', type: 'string', description: 'For screen readers, e.g. "U12 girls celebrating a goal".' })],
    validation: (r: ImageRule) => (o.required ? r.required() : r),
  });

export const PROGRAM_OPTIONS = [
  { title: 'Academy', value: 'academy' },
  { title: 'Club', value: 'club' },
  { title: 'Recreation', value: 'rec' },
  { title: 'Futures', value: 'futures' },
];
export const TRYOUT_PROGRAM_OPTIONS = PROGRAM_OPTIONS.filter((p) => p.value === 'academy' || p.value === 'club');
export const REGION_OPTIONS = [
  { title: 'North', value: 'north' },
  { title: 'South', value: 'south' },
  { title: 'West', value: 'west' },
];

/** U5 to U19. Stored as numbers so the site formats "U9 to U11" consistently and sorts correctly. */
export const AGE_OPTIONS = Array.from({ length: 15 }, (_, i) => ({ title: `U${i + 5}`, value: i + 5 }));

/** 6:00 AM to 10:00 PM in 15 minute steps, stored as 24h "HH:MM" so it sorts and formats cleanly. */
export const TIME_OPTIONS = Array.from({ length: (22 - 6) * 4 + 1 }, (_, i) => {
  const mins = 6 * 60 + i * 15;
  const h = Math.floor(mins / 60), m = mins % 60;
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const title = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return { title, value };
});

/** Season timeline months. The site's axis runs August to July. */
export const MONTH_OPTIONS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((title, value) => ({ title, value }));

export const fmtTime = (v?: string) => TIME_OPTIONS.find((t) => t.value === v)?.title ?? v ?? '';
