// The wording of one automatic email (Studio > Settings > Automatic emails), one fixed document per
// email (`emailTemplate.<key>`, keys in studio/shared/emailTemplates.ts). Fields hold {Field} names
// the website fills in when it sends; any field left empty uses the default wording.
import { defineField, defineType, useFormValue } from 'sanity';
import { Card, Stack, Text } from '@sanity/ui';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { str, txt } from './helpers';
import { Note } from '../components/Note';
import { RichTextInput } from '../components/RichTextInput';
import { EMAIL_TEMPLATES, type TemplateKey } from '../shared/emailTemplates';

// When this email is sent and the names it can use.
function FieldList() {
  const key = useFormValue(['key']) as TemplateKey | undefined;
  const t = EMAIL_TEMPLATES[key ?? 'contact'];
  return (
    <Card padding={3} radius={2} border>
      <Stack gap={3}>
        <Text size={1}>{t.when}</Text>
        <Text size={1}>Names you can use. Type them anywhere, braces included, and each email fills them in:</Text>
        <Text size={1} weight="semibold">{t.fields.join('   ')}</Text>
        <Text size={1} muted>A name with nothing to fill in (e.g. no contact role) is left out, with its commas.</Text>
      </Stack>
    </Card>
  );
}

export const emailTemplate = defineType({
  name: 'emailTemplate',
  title: 'Automatic email',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({ name: 'key', title: 'Email', type: 'string', readOnly: true, hidden: true }),
    defineField({
      name: 'note', title: ' ', type: 'string', readOnly: true, components: { input: Note },
      options: { text: 'Change the wording, then Publish: the next email sent uses it. Leave a field empty to use the default wording. Under the message, the email adds who will contact them and what they sent by itself.' } as object,
    }),
    defineField({ name: 'fields', title: 'Names you can use', type: 'string', readOnly: true, components: { input: FieldList } }),
    str('subject', 'Subject', { description: 'The email\'s subject line.' }),
    str('preview', 'Preview line', { description: 'The grey line inboxes show after the subject.' }),
    str('kicker', 'Small heading', { description: 'Above the heading, in small capitals.' }),
    str('heading', 'Heading', { description: 'The big heading, e.g. "Thanks for applying,".' }),
    str('headingAccent', 'Heading, teal part', { description: 'After the heading, in teal, e.g. "{Parent first name}."' }),
    // Formatted (bold, italic, links, lists), saved as JSON blocks; older plain text still works.
    { ...txt('message', 'Message', { description: 'The main text. Select words for bold, italic or a link; use Insert name for this email\'s names.' }), components: { input: RichTextInput } },
    txt('signoff', 'Sign-off', { rows: 2, description: 'Under the details, e.g. "See you on the field." with "Utah Athletic" on the next line.' }),
    txt('footer', 'Footer', { rows: 2, description: 'The small print at the bottom.' }),
  ],
  preview: {
    select: { key: 'key' },
    prepare: ({ key }: { key?: TemplateKey }) => ({ title: key ? EMAIL_TEMPLATES[key].title : 'Automatic email', subtitle: key ? EMAIL_TEMPLATES[key].when : undefined }),
  },
});
