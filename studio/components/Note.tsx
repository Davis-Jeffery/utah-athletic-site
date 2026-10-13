// Read-only note shown as a field, for a line of guidance at the top of a document.
// Usage: a string field with readOnly, options: { text } and components: { input: Note }. Stores nothing.
import type { StringInputProps } from 'sanity';
import { Card, Text } from '@sanity/ui';

export function Note(props: StringInputProps) {
  const text = (props.schemaType.options as { text?: string } | undefined)?.text;
  return (
    <Card padding={3} radius={2} tone="primary" border>
      <Text size={1}>{text}</Text>
    </Card>
  );
}
