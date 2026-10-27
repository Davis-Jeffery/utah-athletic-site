// "Page layout": a page's sections in order, each with ↑ ↓ to move it and a Show switch. The order
// is this field (section keys, studio/shared/sections.ts); the switches write the page's Hide
// sections field (options.hideField), so hiding works as before. Fixed sections (e.g. Explore the
// pathway) can be hidden but stay where they are.
import { useCallback } from 'react';
import { set, unset, useDocumentOperation, useFormValue, type ArrayOfPrimitivesInputProps } from 'sanity';
import { Box, Button, Card, Flex, Stack, Switch, Text } from '@sanity/ui';
import { ArrowDownIcon } from '@sanity/icons/ArrowDown';
import { ArrowUpIcon } from '@sanity/icons/ArrowUp';
import { FIXED_SECTIONS, SECTIONS, orderOf, type PageKind } from '../shared/sections';

type Options = { kind: PageKind; hideField: string };

export function SectionLayoutInput(props: ArrayOfPrimitivesInputProps) {
  const { value, onChange, readOnly, schemaType } = props;
  const { kind, hideField } = schemaType.options as unknown as Options;
  const id = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '');
  const type = String(useFormValue(['_type']) ?? '');
  const programKey = useFormValue(['key']) as string | undefined;
  const hidden = (useFormValue([hideField]) as string[] | undefined) ?? [];
  const { patch } = useDocumentOperation(id, type);

  const labels = Object.fromEntries(SECTIONS[kind].map(([k, t]) => [k, t])) as Record<string, string>;
  // With nothing saved, the site's default order (Futures region tabs put sign-up first).
  const saved = (value as string[] | undefined) ?? [];
  const order = orderOf(kind, saved.length ? saved : kind === 'region' && programKey === 'futures' ? ['try', 'lead', 'coach', 'fee', 'contact'] : []);
  const fixed = FIXED_SECTIONS[kind] ?? [];

  const move = useCallback((i: number, by: number) => {
    const next = [...order];
    const [k] = next.splice(i, 1);
    next.splice(i + by, 0, k);
    onChange(set(next));
  }, [order, onChange]);
  const toggle = (k: string) => {
    const now = hidden.includes(k) ? hidden.filter((x) => x !== k) : [...hidden, k];
    patch.execute([now.length ? { set: { [hideField]: now } } : { unset: [hideField] }]);
  };

  const row = (k: string, i: number | null) => {
    const on = !hidden.includes(k);
    return (
      <Card key={k} padding={2} radius={2} border tone={on ? 'default' : 'transparent'}>
        <Flex align="center" gap={2}>
          <Flex gap={1}>
            <Button mode="bleed" icon={ArrowUpIcon} padding={2} title="Move up" disabled={readOnly || i == null || i === 0} onClick={() => i != null && move(i, -1)} />
            <Button mode="bleed" icon={ArrowDownIcon} padding={2} title="Move down" disabled={readOnly || i == null || i === order.length - 1} onClick={() => i != null && move(i, 1)} />
          </Flex>
          <Box flex={1}>
            <Text size={1} muted={!on} style={{ textDecoration: on ? 'none' : 'line-through' }}>{labels[k] ?? k}</Text>
            {i == null ? <Text size={0} muted>Stays at the bottom</Text> : null}
          </Box>
          <Flex as="label" align="center" gap={2}>
            <Text size={1} muted>{on ? 'Shown' : 'Hidden'}</Text>
            <Switch checked={on} disabled={readOnly} onChange={() => toggle(k)} />
          </Flex>
        </Flex>
      </Card>
    );
  };

  return (
    <Stack gap={2}>
      {order.map((k, i) => row(k, i))}
      {fixed.map((k) => row(k, null))}
      <Flex justify="space-between" align="center" gap={2} wrap="wrap">
        <Text size={0} muted>The hero at the top always shows first. Sections with nothing to show (e.g. no questions yet) are skipped, and section numbers follow the order.</Text>
        {saved.length && !readOnly ? <Button mode="bleed" fontSize={1} text="Back to the usual order" onClick={() => onChange(unset())} /> : null}
      </Flex>
    </Stack>
  );
}
