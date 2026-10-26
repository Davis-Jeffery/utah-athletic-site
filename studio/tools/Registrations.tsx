// Studio > Registrations: every registered player, grouped by US Soccer age group (Aug 1 cutoff) and
// gender. Filter by season, session, age group and gender; then email the group, copy the parents'
// emails or download a CSV. Sending saves a Sent email (emailBroadcast) and asks the website's
// /api/broadcast/ to send it, which works out the same recipients from the same filter.
import { useEffect, useMemo, useState } from 'react';
import { useClient, useCurrentUser } from 'sanity';
import { Badge, Box, Button, Card, Checkbox, Dialog, Flex, Heading, Select, Stack, Text, TextInput } from '@sanity/ui';
import { RichTextEditor } from '../components/RichTextEditor';
import { isEmpty, toPlain, type RichBlock } from '../shared/richText';
import { useToast } from '@sanity/ui/toast';
import {
  AGE_MAX, AGE_MIN, GENDERS, SOURCES, ageChart, ageLabel, describe, matches, recipientsOf, seasonEnd, seasonLabel,
  type Audience, type Registrant,
} from '../shared/registrants';

// The website that sends the emails. Change when the site moves to its own domain.
const SITE_URL = (process.env.SANITY_STUDIO_SITE_URL || 'https://utah-athletic-site.vercel.app').replace(/\/$/, '');
const PAYMENT = [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Checkout started' }, { value: 'refunded', label: 'Refunded' }];

const cell: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', textAlign: 'left', verticalAlign: 'top', whiteSpace: 'nowrap' };
const genderLabel = (g?: string) => GENDERS.find((x) => x.value === g)?.label ?? g ?? '';

export function Registrations() {
  const client = useClient({ apiVersion: '2025-10-01' });
  const user = useCurrentUser();
  const toast = useToast();
  const [all, setAll] = useState<Registrant[] | null>(null);
  const [a, setA] = useState<Audience>({ program: SOURCES[0].program, payments: ['paid'] });
  const [compose, setCompose] = useState(false);
  const [chart, setChart] = useState(false);

  const load = () => Promise.all(SOURCES.map((s) => client.fetch<Record<string, any>[]>(s.query).then((docs) => docs.map(s.toRegistrant))))
    .then((lists) => setAll(lists.flat()))
    .catch(() => setAll([]));
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const inProgram = useMemo(() => (all ?? []).filter((r) => r.program === a.program), [all, a.program]);
  const seasons = useMemo(() => [...new Set(inProgram.map((r) => r.season).filter(Boolean) as string[])].sort().reverse(), [inProgram]);
  // Default to the newest season once data arrives.
  useEffect(() => { if (a.season === undefined && seasons.length) setA((x) => ({ ...x, season: seasons[0] })); }, [seasons]); // eslint-disable-line react-hooks/exhaustive-deps
  const inSeason = inProgram.filter((r) => !a.season || r.season === a.season);
  const sessions = [...new Set(inSeason.map((r) => r.session).filter(Boolean) as string[])].sort();
  // Counts for the grid ignore the age and gender picks, so the grid always shows the whole season.
  const base = inSeason.filter((r) => matches(r, { ...a, ages: [], genders: [] }));
  const rows = inSeason.filter((r) => matches(r, a)).sort((x, y) => (x.ageNumber ?? 99) - (y.ageNumber ?? 99) || (x.gender ?? '').localeCompare(y.gender ?? '') || x.last.localeCompare(y.last));
  const families = recipientsOf(rows);
  const ages = [...new Set(base.map((r) => r.ageNumber).filter((n): n is number => n != null))].sort((x, y) => x - y);
  const count = (n?: number, g?: string) => base.filter((r) => (n == null || r.ageNumber === n) && (!g || r.gender === g)).length;
  const toggle = <K extends 'ages' | 'genders' | 'sessions' | 'payments'>(k: K, v: NonNullable<Audience[K]>[number]) =>
    setA((x) => { const cur = (x[k] ?? []) as (typeof v)[]; return { ...x, [k]: cur.includes(v) ? cur.filter((y) => y !== v) : [...cur, v] }; });
  const only = (n?: number, g?: string) => setA((x) => ({ ...x, ages: n == null ? [] : [n], genders: g ? [g] : [] }));

  const copy = async () => {
    await navigator.clipboard.writeText(families.map((f) => f.email).join(', '));
    toast.push({ status: 'success', title: `Copied ${families.length} email addresses` });
  };
  const csv = () => {
    const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['Player first', 'Player last', 'Age group', 'Gender', 'Birth date', 'Session', 'Season', 'Parent', 'Email', 'Phone', 'Payment'],
      ...rows.map((r) => [r.first, r.last, r.ageNumber != null ? ageLabel(r.ageNumber) : '', genderLabel(r.gender), r.birthDate, r.session, r.season, r.parentName, r.email, r.phone, r.payment])];
    const url = URL.createObjectURL(new Blob([lines.map((l) => l.map(q).join(',')).join('\n')], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: `${describe(a).replace(/[^\w]+/g, '-').toLowerCase()}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Heading size={3}>Registrations</Heading>
          <Text muted size={1}>Players grouped by US Soccer age group (season runs Aug 1 to Jul 31) and gender. Pick a group, then email it, copy the emails or download a list.</Text>
        </Stack>

        <Card padding={4} radius={3} border>
          <Stack gap={4}>
            <Flex gap={3} wrap="wrap" align="flex-end">
              <Stack gap={2} style={{ minWidth: 160 }}>
                <Text size={1} weight="medium">Program</Text>
                <Select value={a.program} onChange={(e) => setA({ program: e.currentTarget.value, payments: ['paid'] })}>
                  {SOURCES.map((s) => <option key={s.program} value={s.program}>{s.label}</option>)}
                </Select>
              </Stack>
              <Stack gap={2} style={{ minWidth: 140 }}>
                <Text size={1} weight="medium">Season</Text>
                <Select value={a.season ?? ''} onChange={(e) => setA((x) => ({ ...x, season: e.currentTarget.value || '', sessions: [] }))}>
                  {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="">All seasons</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Text size={1} weight="medium">Payment</Text>
                <Flex gap={3} wrap="wrap">
                  {PAYMENT.map((p) => (
                    <Flex key={p.value} as="label" gap={2} align="center" style={{ cursor: 'pointer' }}>
                      <Checkbox checked={(a.payments ?? []).includes(p.value)} onChange={() => toggle('payments', p.value)} />
                      <Text size={1}>{p.label}</Text>
                    </Flex>
                  ))}
                </Flex>
              </Stack>
            </Flex>

            {sessions.length > 1 ? (
              <Stack gap={2}>
                <Text size={1} weight="medium">Sessions <Text as="span" size={1} muted>(none picked = all)</Text></Text>
                <Flex gap={2} wrap="wrap">
                  {sessions.map((s) => <Button key={s} text={s} mode={(a.sessions ?? []).includes(s) ? 'default' : 'ghost'} tone={(a.sessions ?? []).includes(s) ? 'primary' : 'default'} fontSize={1} padding={2} onClick={() => toggle('sessions', s)} />)}
                </Flex>
              </Stack>
            ) : null}

            <Stack gap={2}>
              <Text size={1} weight="medium">Age groups <Text as="span" size={1} muted>(none picked = all)</Text></Text>
              <Flex gap={2} wrap="wrap">
                {Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i).map((n) => {
                  const on = (a.ages ?? []).includes(n), c = count(n);
                  return <Button key={n} text={`${ageLabel(n)}${c ? ` · ${c}` : ''}`} mode={on ? 'default' : 'ghost'} tone={on ? 'primary' : 'default'} fontSize={1} padding={2} disabled={!c && !on} onClick={() => toggle('ages', n)} />;
                })}
              </Flex>
            </Stack>

            <Stack gap={2}>
              <Text size={1} weight="medium">Gender</Text>
              <Flex gap={2}>
                <Button text="Boys and girls" mode={!(a.genders ?? []).length ? 'default' : 'ghost'} tone={!(a.genders ?? []).length ? 'primary' : 'default'} fontSize={1} padding={2} onClick={() => setA((x) => ({ ...x, genders: [] }))} />
                {GENDERS.map((g) => {
                  const on = (a.genders ?? []).length === 1 && a.genders![0] === g.value;
                  return <Button key={g.value} text={`${g.label} · ${count(undefined, g.value)}`} mode={on ? 'default' : 'ghost'} tone={on ? 'primary' : 'default'} fontSize={1} padding={2} onClick={() => setA((x) => ({ ...x, genders: [g.value] }))} />;
                })}
              </Flex>
            </Stack>
          </Stack>
        </Card>

        {/* Quick counts: click a number to pick that group. */}
        {ages.length ? (
          <Card padding={4} radius={3} border>
            <Stack gap={3}>
              <Text size={1} weight="medium">Players by age group{a.season ? ` · ${a.season}` : ''}</Text>
              <Box style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr>{['', ...GENDERS.map((g) => g.label), 'Total'].map((h) => <th key={h} style={{ ...cell, fontWeight: 500 }}><Text size={1} muted>{h}</Text></th>)}</tr></thead>
                  <tbody>
                    {ages.map((n) => (
                      <tr key={n}>
                        <td style={cell}><Text size={1} weight="medium">{ageLabel(n)}</Text></td>
                        {[...GENDERS.map((g) => g.value), undefined].map((g) => (
                          <td key={g ?? 'all'} style={cell}><Button mode="bleed" padding={1} fontSize={1} text={String(count(n, g))} onClick={() => only(n, g)} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Stack>
          </Card>
        ) : null}

        <Card padding={4} radius={3} border tone="primary">
          <Flex gap={3} wrap="wrap" align="center" justify="space-between">
            <Stack gap={2}>
              <Text weight="medium">{describe(a)}</Text>
              <Text size={1} muted>{rows.length} players · {families.length} families</Text>
            </Stack>
            <Flex gap={2} wrap="wrap">
              <Button text="Email this group" tone="primary" disabled={!families.length} onClick={() => setCompose(true)} />
              <Button text="Copy emails" mode="ghost" disabled={!families.length} onClick={copy} />
              <Button text="Download CSV" mode="ghost" disabled={!rows.length} onClick={csv} />
            </Flex>
          </Flex>
        </Card>

        {all === null ? <Text muted>Loading…</Text> : rows.length ? (
          <Card radius={3} border style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr>{['Player', 'Age group', 'Gender', 'Birth date', 'Session', 'Parent', 'Email', 'Phone'].map((h) => <th key={h} style={{ ...cell, fontWeight: 500 }}><Text size={1} muted>{h}</Text></th>)}</tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={cell}><Text size={1} weight="medium">{r.first} {r.last}</Text></td>
                    <td style={cell}><Badge tone="primary">{r.ageNumber != null ? ageLabel(r.ageNumber) : '?'}</Badge></td>
                    <td style={cell}><Text size={1}>{genderLabel(r.gender)}</Text></td>
                    <td style={cell}><Text size={1}>{r.birthDate}</Text></td>
                    <td style={cell}><Text size={1}>{r.session}</Text></td>
                    <td style={cell}><Text size={1}>{r.parentName}</Text></td>
                    <td style={cell}><Text size={1}><a href={`mailto:${r.email}`}>{r.email}</a></Text></td>
                    <td style={cell}><Text size={1}>{r.phone}</Text></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : <Card padding={4} radius={3} border><Text muted size={1}>No registrations match. {inProgram.length ? 'Try a different season or group.' : 'Registrations appear here as families register on the website.'}</Text></Card>}

        <Stack gap={3}>
          <Box><Button mode="bleed" fontSize={1} text={chart ? 'Hide the age group chart' : `Show the age group chart${a.season ? ` for ${a.season}` : ''}`} onClick={() => setChart(!chart)} /></Box>
          {chart ? <AgeChart season={a.season} /> : null}
        </Stack>
      </Stack>

      {compose ? (
        <Compose audience={a} families={families.length} players={rows.length} user={user} onClose={() => setCompose(false)}
          onSent={(n) => { setCompose(false); toast.push({ status: 'success', title: `Sent to ${n} families`, description: 'See it under Sent emails.' }); }}
          send={async (subject, blocks) => {
            const id = `emailBroadcast.${crypto.randomUUID()}`;
            await client.create({
              _id: id, _type: 'emailBroadcast', status: 'queued', createdAt: new Date().toISOString(),
              // The formatted message (bodyRich), and the same as plain text for the record.
              subject, body: toPlain(blocks), bodyRich: JSON.stringify(blocks), audience: a, audienceLabel: describe(a), sentBy: user ? `${user.name} <${user.email}>` : undefined,
            });
            const r = await fetch(`${SITE_URL}/api/broadcast/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            const out = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(out.error || `The website couldn't send it (error ${r.status}).`);
            return out.sent as number;
          }} />
      ) : null}
    </Box>
  );
}

function AgeChart({ season }: { season?: string }) {
  const end = season ? Number(season.slice(0, 4)) + 1 : seasonEnd(new Date().toISOString().slice(0, 10));
  const fmt = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <Card padding={4} radius={3} border>
      <Stack gap={3}>
        <Text size={1} muted>{seasonLabel(end)} season. Birth dates in each age group under the Aug 1 cutoff. Check against US Soccer's age group calculator if in doubt.</Text>
        <table style={{ borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {ageChart(end).map((r) => (
              <tr key={r.n}><td style={cell}><Text size={1} weight="medium">{r.label}</Text></td><td style={cell}><Text size={1}>{fmt(r.from)} to {fmt(r.to)}</Text></td></tr>
            ))}
          </tbody>
        </table>
      </Stack>
    </Card>
  );
}

function Compose({ audience, families, players, user, onClose, onSent, send }: {
  audience: Audience; families: number; players: number; user: ReturnType<typeof useCurrentUser>;
  onClose: () => void; onSent: (n: number) => void; send: (subject: string, blocks: RichBlock[]) => Promise<number>;
}) {
  const [subject, setSubject] = useState('');
  const [blocks, setBlocks] = useState<RichBlock[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const go = async () => {
    if (!window.confirm(`Send "${subject}" to ${families} families?`)) return;
    setBusy(true); setError('');
    try { onSent(await send(subject.trim(), blocks)); } catch (e) { setError((e as Error).message); setBusy(false); }
  };
  return (
    <Dialog id="compose" header={`Email ${describe(audience)}`} onClose={busy ? undefined : onClose} width={2}
      footer={
        <Flex gap={2} justify="flex-end" padding={3}>
          <Button text="Cancel" mode="ghost" disabled={busy} onClick={onClose} />
          <Button text={busy ? 'Sending…' : `Send to ${families} families`} tone="primary" disabled={busy || !subject.trim() || isEmpty(blocks)} onClick={go} />
        </Flex>
      }>
      <Box padding={4}>
        <Stack gap={4}>
          <Text size={1} muted>{players} players, {families} families. Each family gets its own copy in the site's email design, starting "Hi [parent's first name],". Replies come to {user?.email ?? 'you'}. Use Insert name for each family's names; the same fields, e.g. {'{Player first name}'}, work in the subject.</Text>
          <Stack gap={2}><Text size={1} weight="medium">Subject</Text><TextInput value={subject} onChange={(e) => setSubject(e.currentTarget.value)} placeholder="e.g. Saturday's session moves to 10 AM" /></Stack>
          <Stack gap={2}><Text size={1} weight="medium">Message</Text><RichTextEditor onChange={setBlocks} disabled={busy} placeholder="Write it like a normal email. Select text to make it bold, italic or a link." /></Stack>
          {error ? <Card padding={3} radius={2} tone="critical"><Text size={1}>{error}</Text></Card> : null}
        </Stack>
      </Box>
    </Dialog>
  );
}
