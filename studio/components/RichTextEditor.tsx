// A small formatted-text editor for emails (group emails, and the automatic emails' message):
// bold, italic, links and lists, with the usual
// shortcuts (⌘B, ⌘I, ⌘K). It edits like a normal text box and reports what's written as blocks
// (studio/shared/richText.ts), never as HTML. Pasted text comes in plain, so formatting from other
// apps can't sneak in.
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, Flex, Text } from '@sanity/ui';
import { NAME_FIELDS, toHref, type RichBlock } from '../shared/richText';
import { serialize, toEditorHtml } from './richTextDom';

const CSS = `
.ua-rte{min-height:var(--ua-rte-min,220px);max-height:50vh;overflow-y:auto;padding:12px 14px;border-radius:0 0 4px 4px;border:1px solid var(--card-border-color);border-top:0;background:var(--card-bg-color);color:var(--card-fg-color);font:400 15px/1.6 Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;outline:none}
.ua-rte:focus{box-shadow:inset 0 0 0 1px var(--card-focus-ring-color, #2276fc)}
.ua-rte:empty::before{content:attr(data-placeholder);color:var(--card-muted-fg-color);pointer-events:none}
.ua-rte p,.ua-rte div{margin:0 0 12px}
.ua-rte ul,.ua-rte ol{margin:0 0 12px;padding-left:24px}
.ua-rte a{color:var(--card-link-fg-color, #2276fc);text-decoration:underline}
.ua-rte b,.ua-rte strong{font-weight:700}
.ua-rte i,.ua-rte em{font-style:italic}
`;

type Field = { token: string; label: string; hint?: string };

export function RichTextEditor({ value, onChange, placeholder, disabled, fields = NAME_FIELDS, minHeight = 220, label = 'Message' }: {
  /** What to show; when it changes from outside (e.g. Discard changes), the editor follows. */
  value?: RichBlock[]; onChange: (blocks: RichBlock[]) => void; placeholder?: string; disabled?: boolean;
  /** The names the Insert name menu offers. */
  fields?: readonly Field[]; minHeight?: number; label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // The last blocks this editor reported, so its own changes don't reset the cursor.
  const mine = useRef<string | null>(null);
  useEffect(() => {
    if (!ref.current || value === undefined) return;
    const json = JSON.stringify(value);
    if (json === mine.current) return;
    ref.current.innerHTML = toEditorHtml(value);
    mine.current = json;
  }, [value]);
  const [active, setActive] = useState({ bold: false, italic: false, link: false, ul: false, ol: false });

  // Shows which buttons apply where the cursor is.
  // Where the cursor was last in the editor, so the Insert name menu (which takes focus) puts the
  // field there.
  const lastRange = useRef<Range | null>(null);
  useEffect(() => {
    const update = () => {
      const sel = document.getSelection();
      if (!ref.current || !sel?.anchorNode || !ref.current.contains(sel.anchorNode)) return;
      lastRange.current = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      const el = sel.anchorNode instanceof HTMLElement ? sel.anchorNode : sel.anchorNode.parentElement;
      // Bold and italic from the text's own tags and style (the browser's own check can miss bold
      // when the Studio's styles set a lighter weight).
      const within = (test: (e: HTMLElement) => boolean) => { for (let e = el; e && e !== ref.current; e = e.parentElement) if (test(e)) return true; return false; };
      setActive({
        bold: within((e) => ['B', 'STRONG'].includes(e.tagName) || Number(e.style.fontWeight) >= 600 || e.style.fontWeight === 'bold') || document.queryCommandState('bold'),
        italic: within((e) => ['I', 'EM'].includes(e.tagName) || e.style.fontStyle === 'italic') || document.queryCommandState('italic'),
        link: !!el?.closest('a'), ul: document.queryCommandState('insertUnorderedList'), ol: document.queryCommandState('insertOrderedList'),
      });
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  const report = () => {
    if (!ref.current) return;
    const blocks = serialize(ref.current);
    mine.current = JSON.stringify(blocks);
    onChange(blocks);
  };
  const run = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    report();
  };

  const link = () => {
    const sel = document.getSelection();
    const range = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    const current = (sel?.anchorNode instanceof HTMLElement ? sel.anchorNode : sel?.anchorNode?.parentElement)?.closest('a')?.getAttribute('href') ?? '';
    const input = window.prompt('Link to (a web address, or an email address)', current.replace(/^mailto:/, ''));
    if (input == null) return;
    const href = toHref(input);
    if (!href) { window.alert('That doesn\'t look like a web or email address.'); return; }
    ref.current?.focus();
    if (range) { sel!.removeAllRanges(); sel!.addRange(range); }
    // Nothing selected: the address itself becomes the link text.
    if (!range || range.collapsed) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = input.trim();
      document.execCommand('insertHTML', false, a.outerHTML);
    } else document.execCommand('createLink', false, href);
    report();
  };

  // Adds a name field where the cursor was, e.g. {Parent first name}.
  const insertField = (token: string) => {
    const sel = document.getSelection();
    ref.current?.focus();
    if (lastRange.current && sel) { sel.removeAllRanges(); sel.addRange(lastRange.current); }
    document.execCommand('insertText', false, token);
    report();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    if (k === 'b') { e.preventDefault(); run('bold'); }
    else if (k === 'i') { e.preventDefault(); run('italic'); }
    else if (k === 'k') { e.preventDefault(); link(); }
  };
  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    report();
  };

  // Buttons keep the editor's selection (mousedown would otherwise move focus to the button).
  const tool = (label: string, title: string, on: boolean, act: () => void, style?: React.CSSProperties) => (
    <Button mode={on ? 'default' : 'bleed'} tone={on ? 'primary' : 'default'} padding={2} fontSize={1} title={title} aria-label={title} aria-pressed={on} disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} onClick={act} text={<span style={style}>{label}</span>} />
  );

  return (
    <Box>
      <style>{CSS}</style>
      <Card padding={1} radius={2} border style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <Flex gap={1} wrap="wrap" align="center">
          {tool('B', 'Bold (⌘B)', active.bold, () => run('bold'), { fontWeight: 700 })}
          {tool('I', 'Italic (⌘I)', active.italic, () => run('italic'), { fontStyle: 'italic', fontFamily: 'Georgia,serif' })}
          {tool('Link', 'Add a link (⌘K)', active.link, link)}
          {active.link ? tool('Remove link', 'Remove the link', false, () => run('unlink')) : null}
          <Box style={{ width: 1, alignSelf: 'stretch', background: 'var(--card-border-color)', margin: '0 4px' }} />
          {tool('• List', 'Bulleted list', active.ul, () => run('insertUnorderedList'))}
          {tool('1. List', 'Numbered list', active.ol, () => run('insertOrderedList'))}
          <Box style={{ width: 1, alignSelf: 'stretch', background: 'var(--card-border-color)', margin: '0 4px' }} />
          {fields.length ? <select aria-label="Insert a name" disabled={disabled} value="" onChange={(e) => { const v = e.currentTarget.value; if (v) insertField(v); }}
            style={{ font: 'inherit', fontSize: 13, padding: '5px 8px', borderRadius: 4, border: '1px solid var(--card-border-color)', background: 'var(--card-bg-color)', color: 'var(--card-fg-color)', cursor: 'pointer' }}>
            <option value="">Insert name…</option>
            {fields.map((f) => <option key={f.token} value={f.token}>{f.label}{f.hint ? ` (${f.hint})` : ''}</option>)}
          </select> : null}
          <Box flex={1} />
          <Text size={0} muted>Pasted text comes in plain</Text>
        </Flex>
      </Card>
      <div ref={ref} className="ua-rte" style={{ ['--ua-rte-min' as string]: `${minHeight}px` }} contentEditable={!disabled} suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label}
        data-placeholder={placeholder} onInput={report} onKeyDown={onKeyDown} onPaste={onPaste}
        onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')} />
    </Box>
  );
}
