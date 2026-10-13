// Read-only list on a staff member: every program list they appear in, e.g. "Club · North · Leader".
// Reads from the programs (published and drafts), so it updates as soon as an editor adds them.
import { useEffect, useState } from 'react';
import { useClient, useFormValue } from 'sanity';
import { Card, Stack, Text } from '@sanity/ui';

const PROGRAMS: Record<string, string> = { academy: 'Academy', club: 'Club', rec: 'Recreation', futures: 'Futures' };
const REGIONS = [['north', 'North'], ['south', 'South'], ['west', 'West']] as const;

type Row = { _id: string; key: string; leadership?: Ref[] } & Record<string, unknown>;
type Ref = { person?: { _ref: string } };

export function AssignedTo() {
  const id = String(useFormValue(['_id']) ?? '').replace(/^drafts\./, '');
  const client = useClient({ apiVersion: '2025-10-01' });
  const [rows, setRows] = useState<string[] | null>(null);

  useEffect(() => {
    if (!id) return;
    const has = (list: unknown) => Array.isArray(list) && (list as Ref[]).some((x) => x.person?._ref === id);
    client
      .fetch<Row[]>('*[_type == "program" && references($id)]{_id, key, leadership, north, south, west}', { id }, { perspective: 'raw' })
      .then((docs) => {
        // A program with a draft appears twice; the draft is what the editor sees, so prefer it.
        const byKey = new Map<string, Row>();
        for (const d of docs) if (!byKey.has(d.key) || d._id.startsWith('drafts.')) byKey.set(d.key, d);
        const out: string[] = [];
        for (const d of [...byKey.values()].sort((a, b) => Object.keys(PROGRAMS).indexOf(a.key) - Object.keys(PROGRAMS).indexOf(b.key))) {
          const p = PROGRAMS[d.key] ?? d.key;
          if (has(d.leadership)) out.push(`${p} · Program leadership`);
          for (const [k, r] of REGIONS) {
            const reg = d[k] as { leaders?: Ref[]; coaches?: Ref[] } | undefined;
            if (has(reg?.leaders)) out.push(`${p} · ${r} · Leader`);
            if (has(reg?.coaches)) out.push(`${p} · ${r} · Coach`);
          }
        }
        setRows(out);
      })
      .catch(() => setRows([]));
  }, [client, id]);

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Stack gap={3}>
        {rows === null ? <Text size={1} muted>Loading…</Text>
          : rows.length ? rows.map((r) => <Text key={r} size={1}>{r}</Text>)
            : <Text size={1} muted>Not on any program yet.</Text>}
      </Stack>
    </Card>
  );
}
