// Reads the editor's content (RichTextEditor.tsx) into formatted-text blocks
// (studio/shared/richText.ts): paragraphs and lists of runs that are bold, italic or links.
// Anything else in the page's HTML is dropped, so only that formatting can reach an email.
import { safeHref, type RichBlock, type Run } from '../shared/richText';

const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER']);
const LIST_TAGS = new Set(['UL', 'OL']);
// Never text: their contents are code or settings, not words.
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'IFRAME', 'OBJECT']);
type Marks = { b?: boolean; i?: boolean; href?: string };

// Text runs inside an element, carrying bold, italic and link down from the tags around them.
function inline(node: Node, marks: Marks, out: Run[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = (node.textContent ?? '').replace(/ /g, ' ');
    if (t) out.push({ t, ...marks });
    return;
  }
  if (!(node instanceof HTMLElement) || SKIP.has(node.tagName)) return;
  if (node.tagName === 'BR') { out.push({ t: '\n', ...marks }); return; }
  const style = node.style;
  const next: Marks = {
    ...marks,
    ...(['B', 'STRONG'].includes(node.tagName) || Number(style.fontWeight) >= 600 || style.fontWeight === 'bold' ? { b: true } : {}),
    ...(['I', 'EM'].includes(node.tagName) || style.fontStyle === 'italic' ? { i: true } : {}),
    ...(node.tagName === 'A' && safeHref(node.getAttribute('href')) ? { href: safeHref(node.getAttribute('href')) } : {}),
  };
  node.childNodes.forEach((c) => inline(c, next, out));
}

// Neighbouring runs with the same formatting become one; line breaks at the ends are dropped.
function tidy(rs: Run[]): Run[] {
  const out: Run[] = [];
  for (const r of rs) {
    const last = out.at(-1);
    if (last && !!last.b === !!r.b && !!last.i === !!r.i && last.href === r.href) last.t += r.t;
    else out.push({ ...r });
  }
  while (out.length && /^\n*$/.test(out[0].t.replace(/^\s+$/, ''))) out.shift();
  if (out.length) out[out.length - 1].t = out[out.length - 1].t.replace(/\n+$/, '');
  return out.filter((r) => r.t);
}

/** What's in the editor, as paragraphs and lists. */
export function serialize(root: HTMLElement): RichBlock[] {
  const blocks: RichBlock[] = [];
  let para: Run[] | null = null;
  const flush = () => {
    const c = para ? tidy(para) : [];
    if (c.some((r) => r.t.trim())) blocks.push({ k: 'p', c });
    para = null;
  };
  const walk = (parent: Node) => {
    parent.childNodes.forEach((n) => {
      if (n instanceof HTMLElement && LIST_TAGS.has(n.tagName)) {
        flush();
        const items = [...n.querySelectorAll(':scope > li')].map((li) => { const rs: Run[] = []; inline(li, {}, rs); return tidy(rs); }).filter((rs) => rs.some((r) => r.t.trim()));
        if (items.length) blocks.push({ k: n.tagName === 'OL' ? 'ol' : 'ul', items });
      } else if (n instanceof HTMLElement && BLOCK_TAGS.has(n.tagName)) {
        flush();
        walk(n);
        flush();
      } else {
        para ??= [];
        inline(n, {}, para);
      }
    });
  };
  walk(root);
  flush();
  return blocks;
}
