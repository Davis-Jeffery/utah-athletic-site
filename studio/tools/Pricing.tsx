// Studio > Pricing: every price on the website in one place. Club by age group and region (its
// age tabs), other programs' region fees, Recreation and Futures sessions, and the adult leagues.
// Edits are held until "Publish prices", which saves them all in one transaction, so the site
// rebuilds once. A document with unpublished changes gets the new price in its draft too, so
// publishing that draft later doesn't bring the old price back. Age groups, notes and what's
// included stay on each program's page. Club age groups and Recreation and Futures sessions can
// also be added here (tools/pricingDialogs.tsx); those save and publish straight away.
import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { IntentLink } from 'sanity/router';
import { Badge, Box, Button, Card, Checkbox, Flex, Heading, Stack, Text, TextInput } from '@sanity/ui';
import { useToast } from '@sanity/ui/toast';
import { AgeGroupForm, FeeForm, REGIONS, SessionForm, type AgeTab, type Fee, type RegionKey, type Session } from './pricingDialogs';

/** One editable price: where it lives in Sanity and what it is now (null: not set). */
type Price = { id: string; doc: string; path: string; value: number | null; required: boolean; empty?: string };

type Region = { status?: string; fees?: Fee[] };
type Data = {
  programs: ({ _id: string; key: string; name: string; unit?: string; ageTabs?: AgeTab[] } & Partial<Record<RegionKey, Region>>)[];
  sessions: Session[];
  venues: { _id: string; name: string }[];
  adult: { _id: string; name: string; cost?: number; unit?: string }[];
  regions: { key: RegionKey; label: string }[];
  drafts: string[];
};

const QUERY = `{
  "programs": *[_type == "program" && !(_id in path("drafts.**"))] | order(order asc) {
    _id, key, name, unit, ageTabs, "north": north{status, fees}, "south": south{status, fees}, "west": west{status, fees}
  },
  "sessions": *[_type in ["recSession", "futuresSession"] && !(_id in path("drafts.**"))] | order(start asc) {
    _id, _type, name, region, start, end, cost, "venue": venue._ref, minAge, maxAge, registrationOpens, registrationCloses, registerUrl, capacity, status, classes
  },
  "venues": *[_type == "venue" && !(_id in path("drafts.**"))] | order(name asc) { _id, name },
  "adult": *[_type == "adultLeague" && !(_id in path("drafts.**"))] | order(_id asc) { _id, name, cost, unit },
  "regions": *[_type == "region" && !(_id in path("drafts.**"))] | order(order asc) { key, label },
  "drafts": *[_id in path("drafts.**") && _type in ["program", "recSession", "futuresSession", "adultLeague"]]._id
}`;

// Programs whose prices are never shown (Academy) or come only from their sessions (Futures has no region fees).
const NO_PRICE = ['academy'];
// Programs priced by their sessions (and, optionally, region fees), with each one's session type.
const SESSION_PROGRAMS = [['rec', 'recSession'], ['futures', 'futuresSession']] as const;
// Programs priced by age tabs (AGE_TAB_PROGRAMS in schemaTypes/program.ts): shown even with no age groups yet.
const AGE_TAB_PROGRAMS = ['club'];
const ages = (t: AgeTab) => (t.minAge === t.maxAge ? `U${t.minAge}` : `U${t.minAge} to U${t.maxAge}`);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return { y, text: `${MONTHS[m - 1]} ${d}` }; };
const dates = (a: string, b: string) => { const x = day(a), y = day(b); return `${x.text}${x.y !== y.y ? `, ${x.y}` : ''} to ${y.text}, ${y.y}`; };
const today = () => new Date().toLocaleDateString('en-CA');

const th: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '6px 10px', borderBottom: '1px solid var(--card-border-color)', verticalAlign: 'middle' };
// A row that opens its form (every detail, editable) when clicked anywhere but a box or button in
// it. The first cell is also a button, so the form opens from the keyboard too.
const ROW_CSS = '.pricing-row{cursor:pointer}.pricing-row:hover td{background:var(--card-muted-bg-color)}';
const rowProps = (open: () => void) => ({
  className: 'pricing-row',
  onClick: (e: React.MouseEvent) => { if (!(e.target as HTMLElement).closest('input,select,textarea,button,a')) open(); },
});
const RowLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button type="button" onClick={onClick} title="See and edit all the details" style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}>
    <Text size={1}>{children}</Text>
  </button>
);

export function Pricing() {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [past, setPast] = useState(false);
  const [busy, setBusy] = useState(false);
  // The form that's open, if any: an age group (new, or `tab` to edit), a region fee, or a session
  // (new, copied `from` another, or `editing` one).
  const [adding, setAdding] = useState<null | { program: string; tab?: AgeTab } | { fee: Fee; program: string; region: RegionKey } | { kind: Session['_type']; from?: Session; editing?: Session }>(null);

  const load = () => client.fetch<Data>(QUERY).then(setData).catch(() => setData(null));
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  // Every price on the page, by id, so edits can be checked and saved the same way wherever they are.
  const prices = useMemo(() => {
    const out = new Map<string, Price>();
    const add = (p: Price) => out.set(p.id, p);
    for (const p of data?.programs ?? []) {
      for (const t of p.ageTabs ?? []) for (const r of REGIONS) {
        add({ id: `${p._id}:${t._key}:${r}`, doc: p._id, path: `ageTabs[_key=="${t._key}"].prices.${r}`, value: t.prices?.[r] ?? null, required: false, empty: 'Not offered' });
      }
      for (const r of REGIONS) for (const f of p[r]?.fees ?? []) {
        add({ id: `${p._id}:${r}:${f._key}`, doc: p._id, path: `${r}.fees[_key=="${f._key}"].cost`, value: f.cost ?? null, required: true });
      }
    }
    for (const s of data?.sessions ?? []) add({ id: s._id, doc: s._id, path: 'cost', value: s.cost ?? null, required: true });
    for (const a of data?.adult ?? []) add({ id: a._id, doc: a._id, path: 'cost', value: a.cost ?? null, required: false, empty: 'TBA' });
    return out;
  }, [data]);

  // Edits that differ from what's saved, with any problem (empty where a price is required, not a number).
  const changes = [...Object.entries(edits)].flatMap(([id, raw]) => {
    const p = prices.get(id);
    if (!p) return [];
    const v = raw.trim() === '' ? null : Number(raw);
    if (v === p.value) return [];
    const error = v == null ? (p.required ? 'Needs a price' : null) : !Number.isFinite(v) || v < 0 ? 'Not a price' : null;
    return [{ p, v, error }];
  });
  const errors = changes.filter((c) => c.error);

  const publish = async () => {
    setBusy(true);
    try {
      const drafts = new Set(data?.drafts ?? []);
      const tx = client.transaction();
      for (const { p, v } of changes) {
        for (const id of [p.doc, ...(drafts.has(`drafts.${p.doc}`) ? [`drafts.${p.doc}`] : [])]) {
          tx.patch(id, (patch) => (v == null ? patch.unset([p.path]) : patch.set({ [p.path]: v })));
        }
      }
      await tx.commit({ visibility: 'sync' });
      toast.push({ status: 'success', title: `Published ${changes.length} price${changes.length === 1 ? '' : 's'}`, description: 'The website updates in a few minutes.' });
      setEdits({});
      await load();
    } catch (e) {
      toast.push({ status: 'error', title: 'Prices weren\'t saved', description: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  // One price box: shows the saved price until it's edited; changed boxes are outlined. A plain
  // function, not a component, so the box keeps focus while typing.
  const cell = (id: string, label: string) => {
    const p = prices.get(id);
    if (!p) return null;
    const value = edits[id] ?? (p.value == null ? '' : String(p.value));
    const change = changes.find((c) => c.p.id === id);
    return (
      <Stack gap={1}>
        <Card radius={2} tone={change?.error ? 'critical' : change ? 'caution' : 'default'} style={{ minWidth: 110 }}>
          <TextInput aria-label={label} inputMode="decimal" value={value} placeholder={p.empty ?? ''}
            onChange={(e) => { const v = e.currentTarget.value; setEdits((x) => ({ ...x, [id]: v })); }} />
        </Card>
        {change?.error ? <Text size={0} style={{ color: 'var(--card-badge-critical-fg-color, #c00)' }}>{change.error}</Text> : null}
      </Stack>
    );
  };

  // Removes a Club age group (and its prices and lists) straight away, after asking.
  const removeTab = async (p: Data['programs'][number], t: AgeTab) => {
    if (!window.confirm(`Remove ${ages(t)} from ${p.name}? Its prices and included lists are deleted, and the website updates in a few minutes.`)) return;
    try {
      const tx = client.transaction();
      for (const id of [p._id, ...(data?.drafts.includes(`drafts.${p._id}`) ? [`drafts.${p._id}`] : [])]) tx.patch(id, (x) => x.unset([`ageTabs[_key=="${t._key}"]`]));
      await tx.commit({ visibility: 'sync' });
      toast.push({ status: 'success', title: `Removed ${ages(t)}` });
      await load();
    } catch (e) {
      toast.push({ status: 'error', title: 'The age group wasn\'t removed', description: e instanceof Error ? e.message : String(e) });
    }
  };
  // After a form saves: reload, and drop unpublished grid edits to that document, which the form just replaced.
  const done = (doc?: string) => {
    setAdding(null);
    if (doc) setEdits((x) => Object.fromEntries(Object.entries(x).filter(([id]) => prices.get(id)?.doc !== doc)));
    load();
  };

  if (!data) return <Box padding={5}><Text muted>Loading prices…</Text></Box>;
  const regionLabel = (k: string) => data.regions.find((r) => r.key === k)?.label ?? k;
  const drafts = new Set(data.drafts);
  const unpublished = (id: string) => (drafts.has(`drafts.${id}`) ? <Badge tone="caution" fontSize={0}>Unpublished changes</Badge> : null);
  const tabbed = data.programs.filter((p) => !NO_PRICE.includes(p.key) && (AGE_TAB_PROGRAMS.includes(p.key) || p.ageTabs?.length));
  // Programs priced by their sessions, each with its session type.
  const sessionPrograms = SESSION_PROGRAMS.flatMap(([key, kind]) => { const p = data.programs.find((x) => x.key === key); return p ? [{ p, kind }] : []; });

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 120 }}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Heading size={3}>Pricing</Heading>
          <Text muted size={1}>Every price on the website. Change any box, then Publish prices to update them all at once. Leave a Club price empty where that age group isn't offered: its tab won't show in that region. An empty adult price shows "To be announced". Add Club age groups and Recreation or Futures sessions here too. Notes and what's included are on each program's page.</Text>
          <Flex as="label" gap={2} align="center"><Checkbox checked={past} onChange={() => setPast((x) => !x)} /><Text size={1}>Show past sessions</Text></Flex>
        </Stack>

        {tabbed.map((p) => (
          <Card key={p._id} padding={4} radius={3} border>
            <Stack gap={4}>
              <Flex gap={3} align="center" justify="space-between" wrap="wrap">
                <Flex gap={2} align="center" wrap="wrap"><Heading size={1}>{p.name}, by age group</Heading><Text muted size={1}>(prices in $, {p.unit ?? ''})</Text>{unpublished(p._id)}</Flex>
                <Button mode="ghost" fontSize={1} text="Add age group" onClick={() => setAdding({ program: p._id })} />
              </Flex>
              {p.ageTabs?.length ? null : <Text muted size={1}>No age groups yet. Add one to set its prices.</Text>}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead><tr><th style={th}><Text size={1} weight="medium">Age group</Text></th>{REGIONS.map((r) => <th key={r} style={th}><Text size={1} weight="medium">{regionLabel(r)}{p[r]?.status !== 'active' ? ' (not running)' : ''}</Text></th>)}<th style={th} /></tr></thead>
                  <tbody>
                    {(p.ageTabs ?? []).map((t) => (
                      <tr key={t._key} {...rowProps(() => setAdding({ program: p._id, tab: t }))}>
                        <td style={td}><RowLink onClick={() => setAdding({ program: p._id, tab: t })}>{ages(t)}</RowLink></td>
                        {REGIONS.map((r) => <td key={r} style={td}>{p[r]?.status === 'active' || t.prices?.[r] != null ? cell(`${p._id}:${t._key}:${r}`, `${p.name} ${ages(t)} ${regionLabel(r)}`) : <Text muted size={1}>Not running</Text>}</td>)}
                        <td style={{ ...td, textAlign: 'right' }}><Button mode="bleed" tone="critical" fontSize={1} text="Remove" onClick={() => removeTab(p, t)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Stack>
          </Card>
        ))}

        {/* Recreation and Futures: each program's region fees (if any) and its sessions, together. */}
        {sessionPrograms.map(({ p, kind }) => {
          const list = data.sessions.filter((s) => s._type === kind && (past || s.end >= today()));
          const fees = REGIONS.flatMap((r) => (p[r]?.fees ?? []).map((f) => ({ r, f })));
          return (
            <Card key={p._id} padding={4} radius={3} border>
              <Stack gap={4}>
                <Flex gap={3} align="center" justify="space-between" wrap="wrap">
                  <Flex gap={2} align="center" wrap="wrap"><Heading size={1}>{p.name}</Heading>{p.unit ? <Text muted size={1}>({p.unit})</Text> : null}{unpublished(p._id)}</Flex>
                  <Button mode="ghost" fontSize={1} text={`Add ${p.name} session`} onClick={() => setAdding({ kind })} />
                </Flex>
                {fees.length ? (
                  <Stack gap={3}>
                    <Text size={1} weight="medium">Region fees</Text>
                    <Text muted size={1}>The prices in a region's Fees section. Where a region has these, they're shown instead of its session prices.</Text>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead><tr>{['Region', 'Age group', 'Price ($)'].map((h) => <th key={h} style={th}><Text size={1} weight="medium">{h}</Text></th>)}</tr></thead>
                      <tbody>
                        {fees.map(({ r, f }) => (
                          <tr key={r + f._key} {...rowProps(() => setAdding({ fee: f, program: p._id, region: r }))}>
                            <td style={td}><RowLink onClick={() => setAdding({ fee: f, program: p._id, region: r })}>{regionLabel(r)}</RowLink></td>
                            <td style={td}><Text size={1}>{f.ages}{f.note ? ` · ${f.note}` : ''}</Text></td>
                            <td style={{ ...td, width: 180 }}>{cell(`${p._id}:${r}:${f._key}`, `${p.name} ${regionLabel(r)} ${f.ages}`)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Stack>
                ) : null}
                <Stack gap={3}>
                  {fees.length ? <Text size={1} weight="medium">Sessions</Text> : null}
                  {list.length ? (
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <thead><tr>{['Session', 'Region', 'Dates', 'Price ($)', ''].map((h) => <th key={h} style={th}><Text size={1} weight="medium">{h}</Text></th>)}</tr></thead>
                      <tbody>
                        {list.map((s) => (
                          <tr key={s._id} {...rowProps(() => setAdding({ kind, editing: s }))}>
                            <td style={td}><Flex gap={2} align="center" wrap="wrap"><RowLink onClick={() => setAdding({ kind, editing: s })}>{s.name}</RowLink>{unpublished(s._id)}</Flex></td>
                            <td style={td}><Text size={1}>{regionLabel(s.region)}</Text></td>
                            <td style={td}><Text size={1}>{dates(s.start, s.end)}</Text></td>
                            <td style={{ ...td, width: 180 }}>{cell(s._id, `${s.name} price`)}</td>
                            <td style={{ ...td, whiteSpace: 'nowrap' }}>
                              <Flex gap={1}>
                                <Button mode="bleed" fontSize={1} text="Copy" title="Start a new session with the same details" onClick={() => setAdding({ kind, from: s })} />
                                {/* Classes, status and anything else: the full session. */}
                                <Button as={IntentLink} intent="edit" params={{ id: s._id, type: s._type }} mode="bleed" fontSize={1} text="Open" />
                              </Flex>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <Text muted size={1}>No {past ? '' : 'upcoming '}{p.name} sessions.</Text>}
                </Stack>
              </Stack>
            </Card>
          );
        })}

        {data.adult.length ? (
          <Card padding={4} radius={3} border>
            <Stack gap={4}>
              <Flex gap={2} align="center"><Heading size={1}>Adult leagues</Heading><Text muted size={1}>(prices in $)</Text></Flex>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  {data.adult.map((a) => (
                    <tr key={a._id}>
                      <td style={td}><Flex gap={2} align="center" wrap="wrap"><Text size={1}>{a.name}</Text>{a.unit ? <Text muted size={1}>({a.unit})</Text> : null}{unpublished(a._id)}</Flex></td>
                      <td style={{ ...td, width: 180 }}>{cell(a._id, `${a.name} price`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Stack>
          </Card>
        ) : null}
      </Stack>

      {/* Stays at the bottom of the screen while there are changes. */}
      {changes.length ? (
        <Card padding={3} radius={3} shadow={3} style={{ position: 'fixed', left: '50%', bottom: 20, transform: 'translateX(-50%)', zIndex: 10, width: 'min(680px, calc(100% - 32px))' }}>
          <Flex gap={3} align="center" justify="space-between" wrap="wrap">
            <Text size={1} weight="medium">{changes.length} price{changes.length === 1 ? '' : 's'} changed{errors.length ? `, ${errors.length} to fix` : ''}</Text>
            <Flex gap={2}>
              <Button mode="ghost" text="Discard" disabled={busy} onClick={() => setEdits({})} />
              <Button tone="positive" text={busy ? 'Publishing…' : 'Publish prices'} disabled={busy || errors.length > 0} onClick={publish} />
            </Flex>
          </Flex>
        </Card>
      ) : null}

      <style>{ROW_CSS}</style>
      {(() => {
        if (!adding) return null;
        const regionOpts = data.regions.map((r) => ({ value: r.key, label: r.label }));
        const close = () => setAdding(null);
        if ('fee' in adding) {
          const p = data.programs.find((x) => x._id === adding.program)!;
          return <FeeForm program={p} region={adding.region} regionLabel={regionLabel(adding.region)} fee={adding.fee} unit={p.unit} drafted={drafts.has(`drafts.${p._id}`)} onClose={close} onDone={() => done(p._id)} />;
        }
        if ('program' in adding) {
          const p = data.programs.find((x) => x._id === adding.program)!;
          return <AgeGroupForm program={p} tab={adding.tab} unit={p.unit} regions={regionOpts} drafted={drafts.has(`drafts.${p._id}`)} onClose={close} onDone={() => done(p._id)} />;
        }
        return (
          <SessionForm kind={adding.kind} from={adding.from} editing={adding.editing} drafted={adding.editing ? drafts.has(`drafts.${adding.editing._id}`) : false}
            regions={regionOpts} venues={data.venues.map((v) => ({ value: v._id, label: v.name }))} onClose={close} onDone={() => done(adding.editing?._id)} />
        );
      })()}
    </Box>
  );
}
