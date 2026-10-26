// Pieces shared by the Studio's quick-edit pages (Pricing, Tryouts): form layout, the dialog
// footer, a link to the full document, and small date helpers.
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui';
import { IntentLink } from 'sanity/router';

export const key = () => Math.random().toString(36).slice(2, 12);
export const agesLabel = (min: number, max: number) => (min === max ? `U${min}` : `U${min} to U${max}`);
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Day of the week for a YYYY-MM-DD date, without time zone surprises.
export const weekday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();
export const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
// Fields side by side, wrapping to one per row on narrow screens (@sanity/ui's Grid has no columns prop here).
export const Cols = ({ children, min = 150 }: { children: React.ReactNode; min?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap: 12 }}>{children}</div>
);
export const Label = ({ children }: { children: React.ReactNode }) => <Text size={1} weight="medium">{children}</Text>;
export const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <Stack gap={2}><Label>{label}</Label>{children}{hint ? <Text muted size={0}>{hint}</Text> : null}</Stack>
);
export const Problems = ({ list }: { list: string[] }) => (list.length ? (
  <Card tone="critical" padding={3} radius={2}><Stack gap={2}>{list.map((p) => <Text key={p} size={1}>{p}</Text>)}</Stack></Card>
) : null);
export const errText = (e: unknown) => (e instanceof Error ? e.message : String(e));
// The published document, plus its draft when it has unpublished changes.
export const ids = (id: string, drafted?: boolean) => [id, ...(drafted ? [`drafts.${id}`] : [])];

/** Goes to the whole document in the Studio, for anything these forms don't cover. */
export const FullPage = ({ id, type, path }: { id: string; type: string; path?: string }) => (
  <Button as={IntentLink} intent="edit" params={{ id, type, ...(path ? { path } : {}) }} mode="bleed" text="Open full page" />
);
export const Footer = ({ busy, ok, label, onClose, onSave, full }: { busy: boolean; ok: boolean; label: string; onClose: () => void; onSave: () => void; full?: React.ReactNode }) => (
  <Box padding={3}>
    <Flex gap={2} justify="space-between" align="center" wrap="wrap">
      <Box>{full}</Box>
      <Flex gap={2}><Button mode="ghost" text="Cancel" disabled={busy} onClick={onClose} /><Button tone="positive" text={busy ? 'Saving…' : label} disabled={busy || !ok} onClick={onSave} /></Flex>
    </Flex>
  </Box>
);
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const longDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${DAYS[weekday(iso)].slice(0, 3)}, ${MONTHS[m - 1]} ${d}, ${y}`; };
