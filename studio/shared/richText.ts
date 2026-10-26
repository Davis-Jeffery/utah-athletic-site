// Formatted text for group emails (Studio > Registrations > Email): paragraphs and lists of text
// runs that can be bold, italic or a link. The Studio's editor saves it as JSON on the Sent email
// (`bodyRich`), and the website (/api/broadcast/) checks it with parseRich and builds the email's
// HTML itself (src/lib/server/email.ts), escaping all text. No HTML from the editor is ever sent.
// Name fields like {Parent first name} are filled in for each family when it's sent (fillFields).

/** A run of text: bold, italic and/or a link. "\n" is a line break. */
export type Run = { t: string; b?: boolean; i?: boolean; href?: string };
/** A paragraph, or a bulleted (ul) or numbered (ol) list whose items are lists of runs. */
export type RichBlock = { k: 'p'; c: Run[] } | { k: 'ul' | 'ol'; items: Run[][] };

const MAX_BLOCKS = 300;
const MAX_CHARS = 20_000;

/** Links people can follow from an email: web pages, email addresses and phone numbers. */
export const safeHref = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return /^(https?:\/\/[^\s"<>]+|mailto:[^\s"<>]+|tel:[+\d\s().-]+)$/i.test(s) ? s : undefined;
};

/** What someone typed as a link, made into one: "utathletic.com" → "https://utathletic.com", "a@b.co" → "mailto:a@b.co". */
export const toHref = (input: string): string | undefined => {
  const s = input.trim();
  if (!s) return undefined;
  if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(s)) return `mailto:${s}`;
  if (/^(https?:|mailto:|tel:)/i.test(s)) return safeHref(s);
  return safeHref(`https://${s}`);
};

const runs = (v: unknown): Run[] | null => {
  if (!Array.isArray(v)) return null;
  const out: Run[] = [];
  for (const r of v) {
    if (!r || typeof r !== 'object' || typeof (r as Run).t !== 'string') return null;
    const { t, b, i, href } = r as Run;
    out.push({ t, ...(b === true ? { b } : {}), ...(i === true ? { i } : {}), ...(safeHref(href) ? { href: safeHref(href) } : {}) });
  }
  return out;
};

/** Checks saved JSON and returns clean blocks, or null when it isn't valid formatted text. */
export function parseRich(json: unknown): RichBlock[] | null {
  let v: unknown;
  try { v = typeof json === 'string' ? JSON.parse(json) : json; } catch { return null; }
  if (!Array.isArray(v) || v.length > MAX_BLOCKS) return null;
  const out: RichBlock[] = [];
  for (const blk of v) {
    if (blk?.k === 'p') { const c = runs(blk.c); if (!c) return null; out.push({ k: 'p', c }); }
    else if (blk?.k === 'ul' || blk?.k === 'ol') {
      if (!Array.isArray(blk.items)) return null;
      const items = blk.items.map(runs);
      if (items.some((x: Run[] | null) => !x)) return null;
      out.push({ k: blk.k, items: items as Run[][] });
    } else return null;
  }
  return toPlain(out).length > MAX_CHARS ? null : out;
}

const plainRuns = (rs: Run[]) => rs.map((r) => (r.href && r.href !== r.t && !r.href.endsWith(r.t) ? `${r.t} (${r.href.replace(/^mailto:/, '')})` : r.t)).join('');

/** The same message as plain text: for the record, the email's preview line and its text version. */
export const toPlain = (blocks: RichBlock[]) =>
  blocks.map((b) => (b.k === 'p' ? plainRuns(b.c) : b.items.map((it, n) => `${b.k === 'ol' ? `${n + 1}.` : '•'} ${plainRuns(it)}`).join('\n'))).join('\n\n').trim();

/** True when there's no text at all. */
export const isEmpty = (blocks: RichBlock[]) => !toPlain(blocks).replace(/\s/g, '');

/** Name fields the editor can insert; each family's copy gets its own names. Saved as this text. */
export const NAME_FIELDS = [
  { token: '{Parent first name}', label: 'Parent first name' },
  { token: '{Parent full name}', label: 'Parent full name' },
  { token: '{Player first name}', label: 'Player first name', hint: 'Siblings: "Ava and Max"' },
  { token: '{Player full name}', label: 'Player full name', hint: 'Siblings: "Ava Smith and Max Smith"' },
] as const;

export type Family = { name?: string; players: string[]; playerFirsts: string[] };
const both = (list: string[]) => (list.length > 2 ? `${list.slice(0, -1).join(', ')} and ${list.at(-1)}` : list.join(' and '));

/** Puts one family's names into a piece of text. A missing parent name reads "there" ("Hi there"). */
export function fillText(text: string, f: Family) {
  const parent = (f.name ?? '').trim();
  const values: Record<string, string> = {
    '{Parent first name}': parent.split(/\s+/)[0] || 'there',
    '{Parent full name}': parent || 'there',
    '{Player first name}': both(f.playerFirsts.filter(Boolean)),
    '{Player full name}': both(f.players.filter(Boolean)),
  };
  return text.replace(/\{(Parent|Player) (first|full) name\}/gi, (m) => values[Object.keys(values).find((k) => k.toLowerCase() === m.toLowerCase())!] ?? m);
}

/** The same, through every piece of a formatted message. */
export const fillFields = (blocks: RichBlock[], f: Family): RichBlock[] => blocks.map((b) => (b.k === 'p'
  ? { k: 'p', c: b.c.map((r) => ({ ...r, t: fillText(r.t, f) })) }
  : { k: b.k, items: b.items.map((it) => it.map((r) => ({ ...r, t: fillText(r.t, f) }))) }));
