// A Studio field with the email editor (RichTextEditor.tsx): bold, italic, links and lists. Saves
// the formatted text as JSON blocks (studio/shared/richText.ts) in a text field; older plain text
// opens as paragraphs. Used for the automatic emails' message, with that email's names.
import { useCallback, useMemo } from 'react';
import { set, unset, useFormValue, type TextInputProps } from 'sanity';
import { RichTextEditor } from './RichTextEditor';
import { isEmpty, readBlocks, type RichBlock } from '../shared/richText';
import { EMAIL_TEMPLATES, type TemplateKey } from '../shared/emailTemplates';

export function RichTextInput(props: TextInputProps) {
  const { value, onChange, readOnly } = props;
  const key = useFormValue(['key']) as TemplateKey | undefined;
  const blocks = useMemo(() => readBlocks(value), [value]);
  // This email's names, e.g. {Contact name}, for the Insert name menu.
  const fields = useMemo(() => (key ? EMAIL_TEMPLATES[key].fields.map((token) => ({ token, label: token.slice(1, -1) })) : []), [key]);
  const change = useCallback((next: RichBlock[]) => onChange(isEmpty(next) ? unset() : set(JSON.stringify(next))), [onChange]);
  return <RichTextEditor value={blocks} onChange={change} disabled={readOnly} fields={fields} minHeight={160} label={props.schemaType.title ?? 'Message'} placeholder="Empty uses the default wording." />;
}
