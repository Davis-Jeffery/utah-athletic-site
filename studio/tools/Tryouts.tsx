// Studio > Tryouts: every tryout session in one place, by program (Academy, Club) and region.
// A tryout is one registration (one Ollie link) over one or more days, each with its own date,
// venue and times. Click a row to edit it, Copy to start a new one from it, or Add tryout in a
// region. Saving publishes straight away (the website updates in a few minutes); "Publish and add
// another" keeps the days for the next age group. A venue can be added from the form too.
import { useEffect, useMemo, useState } from 'react';
import { useClient } from 'sanity';
import { Badge, Box, Button, Card, Checkbox, Dialog, Flex, Heading, Select, Stack, Text, TextInput } from '@sanity/ui';
import { useToast } from '@sanity/ui/toast';
import { AGE_OPTIONS, TIME_OPTIONS, fmtTime } from '../schemaTypes/helpers';
import { PlaceSearch } from '../components/PlaceSearch';
import { Cols, Field, Footer, FullPage, Problems, addDays, agesLabel, errText, ids, key, longDate } from './formParts';

const REGIONS = ['north', 'south', 'west'] as const;
type RegionKey = (typeof REGIONS)[number];
const PROGRAMS = ['academy', 'club'] as const;
type ProgramKey = (typeof PROGRAMS)[number];
const GENDERS = ['Boys', 'Girls', 'Coed'] as const;
const STATUS: Record<string, [string, 'positive' | 'caution' | 'default']> = { active: ['Running', 'positive'], soon: ['Coming soon', 'caution'], none: ['Not offered', 'default'] };

type Day = { _key: string; date: string; venue?: string; venueName?: string; startTime: string; endTime: string };
export type Tryout = { _id: string; program: ProgramKey; region: RegionKey; days: Day[]; minAge: number; maxAge: number; gender: string; registerUrl?: string };
type Program = { _id: string; key: ProgramKey; name: string; ages: string; registerUrl?: string } & Record<RegionKey, string | undefined>;
type Venue = { _id: string; name: string; address?: string };
type Data = { programs: Program[]; tryouts: Tryout[]; venues: Venue[]; regions: { key: RegionKey; label: string }[]; drafts: string[] };

const QUERY = `{
  "programs": *[_type == "program" && key in $programs && !(_id in path("drafts.**"))] | order(order asc) {
    _id, key, name, ages, registerUrl, "north": north.status, "south": south.status, "west": west.status
  },
  "tryouts": *[_type == "tryoutSession" && !(_id in path("drafts.**"))] {
    _id, program, region, minAge, maxAge, gender, registerUrl,
    "days": days[] | order(date asc, startTime asc) { _key, date, "venue": venue._ref, "venueName": venue->name, startTime, endTime }
  },
  "venues": *[_type == "venue" && !(_id in path("drafts.**"))] | order(name asc) { _id, name, address },
  "regions": *[_type == "region" && !(_id in path("drafts.**"))] | order(order asc) { key, label },
  "drafts": *[_id in path("drafts.**") && _type == "tryoutSession"]._id
}`;

const today = () => new Date().toLocaleDateString('en-CA');
// A program's age range from its Ages text ("U10 to U19"), for the age pickers.
const ageRange = (ages?: string): [number, number] => {
  const n = (ages ?? '').match(/\d+/g)?.map(Number) ?? [];
  return n.length ? [Math.min(...n), Math.max(...n)] : [3, 19];
};

const th: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', verticalAlign: 'middle' };
const ROW_CSS = '.tryout-row{cursor:pointer}.tryout-row:hover td{background:var(--card-muted-bg-color)}';

export function Tryouts() {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [program, setProgram] = useState<'all' | ProgramKey>('all');
  const [region, setRegion] = useState<'all' | RegionKey>('all');
  const [past, setPast] = useState(false);
  // The form that's open: a new tryout (program and region filled in, or copied `from` one) or `editing` one.
  const [form, setForm] = useState<null | { program?: ProgramKey; region?: RegionKey; from?: Tryout; editing?: Tryout }>(null);

  const load = () => client.fetch<Data>(QUERY, { programs: PROGRAMS }).then(setData).catch(() => setData(null));
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (t: Tryout, label: string) => {
    if (!window.confirm(`Delete the ${label} tryout${t.days[0] ? ` starting ${longDate(t.days[0].date)}` : ''}? It comes off the website in a few minutes.`)) return;
    try {
      const tx = client.transaction();
      for (const id of ids(t._id, data?.drafts.includes(`drafts.${t._id}`))) tx.delete(id);
      await tx.commit({ visibility: 'sync' });
      toast.push({ status: 'success', title: 'Tryout deleted' });
      load();
    } catch (e) {
      toast.push({ status: 'error', title: 'The tryout wasn\'t deleted', description: errText(e) });
    }
  };

  // Upcoming: tryouts with a day still to come, in order of their first day.
  const shown = useMemo(() => (data?.tryouts ?? [])
    .filter((t) => past || (t.days.at(-1)?.date ?? '') >= today())
    .sort((a, b) => (a.days[0]?.date ?? '').localeCompare(b.days[0]?.date ?? '') || a.minAge - b.minAge), [data, past]);
  if (!data) return <Box padding={5}><Text muted>Loading tryouts…</Text></Box>;
  const regionLabel = (k: string) => data.regions.find((r) => r.key === k)?.label ?? k;
  const programs = data.programs.filter((p) => program === 'all' || p.key === program);
  const regions = REGIONS.filter((r) => region === 'all' || r === region);
  const drafts = new Set(data.drafts);

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1100, margin: '0 auto' }}>
      <style>{ROW_CSS}</style>
      <Stack gap={5}>
        <Stack gap={3}>
          <Flex gap={3} align="center" justify="space-between" wrap="wrap">
            <Heading size={3}>Tryouts</Heading>
            <Button tone="primary" text="Add tryout" onClick={() => setForm({ program: program === 'all' ? undefined : program, region: region === 'all' ? undefined : region })} />
          </Flex>
          <Text muted size={1}>Every Academy and Club tryout, by region. Click a tryout to change it. Changes go live on the website in a few minutes, and past dates drop off by themselves.</Text>
          <Flex gap={3} wrap="wrap" align="center">
            <Flex gap={1} wrap="wrap">
              {(['all', ...PROGRAMS] as const).map((k) => <Button key={k} mode={program === k ? 'default' : 'ghost'} tone={program === k ? 'primary' : 'default'} fontSize={1} text={k === 'all' ? 'All programs' : data.programs.find((p) => p.key === k)?.name ?? k} onClick={() => setProgram(k)} />)}
            </Flex>
            <Flex gap={1} wrap="wrap">
              {(['all', ...REGIONS] as const).map((k) => <Button key={k} mode={region === k ? 'default' : 'ghost'} tone={region === k ? 'primary' : 'default'} fontSize={1} text={k === 'all' ? 'All regions' : regionLabel(k)} onClick={() => setRegion(k)} />)}
            </Flex>
            <Flex as="label" gap={2} align="center"><Checkbox checked={past} onChange={() => setPast((x) => !x)} /><Text size={1}>Show past tryouts</Text></Flex>
          </Flex>
        </Stack>

        {programs.map((p) => (
          <Card key={p._id} padding={4} radius={3} border>
            <Stack gap={5}>
              <Flex gap={2} align="center" wrap="wrap"><Heading size={2}>{p.name}</Heading><Text muted size={1}>{p.ages}</Text></Flex>
              {regions.map((r) => {
                const list = shown.filter((t) => t.program === p.key && t.region === r);
                const [statusLabel, tone] = STATUS[p[r] ?? 'none'] ?? STATUS.none;
                return (
                  <Stack key={r} gap={3}>
                    <Flex gap={3} align="center" justify="space-between" wrap="wrap">
                      <Flex gap={2} align="center"><Heading size={1}>{regionLabel(r)}</Heading><Badge tone={tone} fontSize={0}>{statusLabel}</Badge><Text muted size={1}>{list.length} tryout{list.length === 1 ? '' : 's'}</Text></Flex>
                      <Button mode="ghost" fontSize={1} text={`Add ${regionLabel(r)} ${p.name} tryout`} onClick={() => setForm({ program: p.key, region: r })} />
                    </Flex>
                    {list.length ? (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                          <thead><tr>{['Ages', 'Players', 'Days', 'Registers at', ''].map((h) => <th key={h} style={th}><Text size={1} weight="medium">{h}</Text></th>)}</tr></thead>
                          <tbody>
                            {list.map((t) => {
                              const open = () => setForm({ editing: t });
                              return (
                                <tr key={t._id} className="tryout-row" onClick={(e) => { if (!(e.target as HTMLElement).closest('button,a')) open(); }}>
                                  <td style={td}><Flex gap={2} align="center" wrap="wrap">
                                    <button type="button" onClick={open} title="Change this tryout" style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}><Text size={1} weight="medium">{agesLabel(t.minAge, t.maxAge)}</Text></button>
                                    {drafts.has(`drafts.${t._id}`) ? <Badge tone="caution" fontSize={0}>Unpublished changes</Badge> : null}
                                  </Flex></td>
                                  <td style={td}><Text size={1}>{t.gender}</Text></td>
                                  <td style={td}><Stack gap={2}>{t.days.map((d) => (
                                    <Text key={d._key} size={1}>{longDate(d.date)} · {fmtTime(d.startTime)} to {fmtTime(d.endTime)} · {d.venueName ?? 'No venue'}</Text>
                                  ))}</Stack></td>
                                  <td style={td}><Text size={1} muted={!t.registerUrl}>{t.registerUrl ? 'Its own Ollie link' : 'Program\'s Ollie link'}</Text></td>
                                  <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                                    <Button mode="bleed" fontSize={1} text="Copy" title="Start a new tryout with the same details" onClick={() => setForm({ from: t })} />
                                    <Button mode="bleed" tone="critical" fontSize={1} text="Delete" onClick={() => remove(t, `${regionLabel(t.region)} ${p.name} ${agesLabel(t.minAge, t.maxAge)} ${t.gender}`)} />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : <Text muted size={1}>No {past ? '' : 'upcoming '}tryouts.</Text>}
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        ))}
      </Stack>

      {form ? (
        <TryoutForm key={form.editing?._id ?? 'new'} data={data} start={form} drafted={form.editing ? drafts.has(`drafts.${form.editing._id}`) : false}
          onClose={() => setForm(null)} onSaved={(close) => { load(); if (close) setForm(null); }} />
      ) : null}
    </Box>
  );
}

// ---------- add, copy or edit one tryout ----------

type DayRow = { _key: string; date: string; venue: string; startTime: string; endTime: string };
const blankDay = (from?: Partial<DayRow>): DayRow => ({ _key: key(), date: '', venue: '', startTime: '', endTime: '', ...from });

function TryoutForm({ data, start, drafted, onClose, onSaved }: {
  data: Data; start: { program?: ProgramKey; region?: RegionKey; from?: Tryout; editing?: Tryout }; drafted: boolean;
  onClose: () => void; onSaved: (close: boolean) => void;
}) {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const base = start.editing ?? start.from;
  const [f, setF] = useState({
    program: base?.program ?? start.program ?? '', region: base?.region ?? start.region ?? '',
    minAge: start.editing ? String(start.editing.minAge) : '', maxAge: start.editing ? String(start.editing.maxAge) : '',
    gender: base?.gender ?? '', registerUrl: base?.registerUrl ?? '',
  });
  // Each day: date, venue and times. A copy keeps them (new keys); a new tryout starts with one empty day.
  const [days, setDays] = useState<DayRow[]>(() => (base?.days.length
    ? base.days.map((d) => ({ _key: start.editing ? d._key : key(), date: d.date, venue: d.venue ?? '', startTime: d.startTime, endTime: d.endTime }))
    : [blankDay()]));
  const [venues, setVenues] = useState(data.venues);
  // The new venue being added, and which day it's for.
  const [newVenue, setNewVenue] = useState<null | { day: string; name: string; address: string; place?: object }>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => { const v = e.currentTarget.value; setF((x) => ({ ...x, [k]: v })); };
  const setDay = (k: string, field: keyof DayRow) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    setDays((list) => list.map((d) => (d._key === k ? { ...d, [field]: v } : d)));
  };
  // Another day: the next date, same venue and times as the last day.
  const addDay = () => setDays((list) => { const last = list.at(-1); return [...list, blankDay(last && { venue: last.venue, startTime: last.startTime, endTime: last.endTime, date: last.date ? addDays(last.date, 1) : '' })]; });

  const prog = data.programs.find((p) => p.key === f.program);
  const [lo, hi] = ageRange(prog?.ages);
  const ages = AGE_OPTIONS.filter((o) => o.value >= lo && o.value <= hi);
  const status = prog && f.region ? prog[f.region as RegionKey] : undefined;
  const problems = [
    ...(!f.program ? ['Pick the program.'] : []),
    ...(!f.region ? ['Pick the region.'] : []),
    ...days.flatMap((d, i) => {
      const day = days.length > 1 ? `Day ${i + 1}: ` : '';
      return [
        ...(!d.date ? [`${day}pick the date.`] : []),
        ...(!d.venue ? [`${day}pick a venue, or add a new one.`] : []),
        ...(!d.startTime || !d.endTime ? [`${day}pick the start and end times.`] : d.endTime <= d.startTime ? [`${day}it must end after it starts.`] : []),
      ];
    }),
    ...(!f.minAge || !f.maxAge ? ['Pick the youngest and oldest age group (the same for one age group).'] : Number(f.maxAge) < Number(f.minAge) ? ['The oldest age group must be the same as or older than the youngest.'] : []),
    ...(!f.gender ? ['Pick Boys, Girls or Coed.'] : []),
    ...(f.registerUrl.trim() && !/^https?:\/\/\S+$/.test(f.registerUrl.trim()) ? ['The Ollie link must start with https://.'] : []),
  ];
  const touched = !!(start.editing || f.minAge || days.some((d) => d.date || d.venue || d.startTime));

  const save = async (again: boolean) => {
    setBusy(true);
    try {
      const fields = {
        program: f.program, region: f.region, minAge: Number(f.minAge), maxAge: Number(f.maxAge), gender: f.gender,
        days: [...days].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
          .map((d) => ({ _key: d._key, _type: 'tryoutDay', date: d.date, venue: { _type: 'reference', _ref: d.venue }, startTime: d.startTime, endTime: d.endTime })),
        ...(f.registerUrl.trim() ? { registerUrl: f.registerUrl.trim() } : {}),
      };
      if (start.editing) {
        const tx = client.transaction();
        for (const id of ids(start.editing._id, drafted)) tx.patch(id, (p) => p.set(fields).unset(f.registerUrl.trim() ? [] : ['registerUrl']));
        await tx.commit({ visibility: 'sync' });
      } else {
        await client.create({ _id: crypto.randomUUID(), _type: 'tryoutSession', ...fields }, { visibility: 'sync' });
      }
      const what = `${data.regions.find((r) => r.key === f.region)?.label ?? ''} ${prog?.name ?? ''} ${agesLabel(Number(f.minAge), Number(f.maxAge))} ${f.gender}`.trim();
      toast.push({ status: 'success', title: start.editing ? `Saved ${what}` : `Added ${what}`, description: 'The website updates in a few minutes.' });
      onSaved(!again);
      // The next age group on the same days: only the ages and players change (new day keys).
      if (again) { setF((x) => ({ ...x, minAge: '', maxAge: '', gender: '' })); setDays((list) => list.map((d) => ({ ...d, _key: key() }))); setBusy(false); }
    } catch (e) {
      toast.push({ status: 'error', title: 'The tryout wasn\'t saved', description: errText(e) });
      setBusy(false);
    }
  };

  const addVenue = async () => {
    if (!newVenue?.name.trim() || !newVenue.address.trim()) return;
    setBusy(true);
    try {
      const doc = await client.create({ _id: crypto.randomUUID(), _type: 'venue', name: newVenue.name.trim(), address: newVenue.address.trim(), ...(newVenue.place ? { place: newVenue.place } : {}) }, { visibility: 'sync' });
      setVenues((v) => [...v, { _id: doc._id, name: doc.name as string }].sort((a, b) => a.name.localeCompare(b.name)));
      setDays((list) => list.map((d) => (d._key === newVenue.day ? { ...d, venue: doc._id } : d)));
      setNewVenue(null);
      toast.push({ status: 'success', title: `Added ${doc.name} to Venues` });
    } catch (e) {
      toast.push({ status: 'error', title: 'The venue wasn\'t added', description: errText(e) });
    } finally { setBusy(false); }
  };

  const timeOptions = [<option key="" value="">Pick</option>, ...TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)];
  const ageSelect = (k: 'minAge' | 'maxAge') => (
    <Select value={f[k]} onChange={(e) => { const v = e.currentTarget.value; setF((x) => ({ ...x, [k]: v, ...(k === 'minAge' && (!x.maxAge || Number(x.maxAge) < Number(v)) ? { maxAge: v } : {}) })); }}>
      <option value="">Pick</option>{ages.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}
    </Select>
  );

  return (
    <Dialog id="tryout" width={2} onClose={busy ? undefined : onClose}
      header={start.editing ? 'Change tryout' : start.from ? 'Copy tryout' : 'Add a tryout'}
      footer={
        <Footer busy={busy} ok={problems.length === 0 && !newVenue} label={start.editing ? 'Save changes' : 'Publish tryout'} onClose={onClose} onSave={() => save(false)}
          full={start.editing ? <FullPage id={start.editing._id} type="tryoutSession" /> : <Button mode="ghost" text="Publish and add another" disabled={busy || problems.length > 0 || !!newVenue} onClick={() => save(true)} />} />
      }>
      <Box padding={4}>
        <Stack gap={4}>
          <Cols>
            <Field label="Program"><Select value={f.program} onChange={set('program')}><option value="">Pick</option>{data.programs.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}</Select></Field>
            <Field label="Region"><Select value={f.region} onChange={set('region')}><option value="">Pick</option>{data.regions.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</Select></Field>
          </Cols>
          {status && status !== 'active' ? (
            <Card tone="caution" padding={3} radius={2}><Text size={1}>{prog?.name} is {status === 'soon' ? 'coming soon' : 'not offered'} in this region, so its page there shows {status === 'soon' ? 'Register interest' : 'the nearest region'} instead of tryouts. Change that under {prog?.name}, Page content, Regions.</Text></Card>
          ) : null}
          <Cols>
            <Field label="Youngest age group" hint={prog ? `${prog.name}: ${prog.ages}` : undefined}>{ageSelect('minAge')}</Field>
            <Field label="Oldest age group" hint="Same as the youngest for one age group.">{ageSelect('maxAge')}</Field>
            <Field label="Players"><Select value={f.gender} onChange={set('gender')}><option value="">Pick</option>{GENDERS.map((g) => <option key={g}>{g}</option>)}</Select></Field>
          </Cols>

          <Card padding={3} radius={2} border>
            <Stack gap={3}>
              <Text size={1} weight="medium">{days.length > 1 ? `${days.length} days` : 'Day'}</Text>
              <Text muted size={1}>Each day has its own date, venue and times. Families register once for all of them.</Text>
              {days.map((d, i) => (
                <Card key={d._key} padding={3} radius={2} tone="transparent" border>
                  <Stack gap={3}>
                    {days.length > 1 ? (
                      <Flex align="center" justify="space-between">
                        <Text size={1} weight="medium">Day {i + 1}</Text>
                        <Button mode="bleed" tone="critical" fontSize={1} text="Remove day" onClick={() => setDays((list) => list.filter((x) => x._key !== d._key))} />
                      </Flex>
                    ) : null}
                    <Cols>
                      <Field label="Date"><TextInput type="date" value={d.date} onChange={setDay(d._key, 'date')} /></Field>
                      <Field label="Starts"><Select value={d.startTime} onChange={setDay(d._key, 'startTime')}>{timeOptions}</Select></Field>
                      <Field label="Ends"><Select value={d.endTime} onChange={setDay(d._key, 'endTime')}>{timeOptions}</Select></Field>
                    </Cols>
                    {newVenue?.day === d._key ? (
                      <Card padding={3} radius={2} border>
                        <Stack gap={3}>
                          <Text size={1} weight="medium">New venue</Text>
                          <PlaceSearch onPick={(pl) => setNewVenue((v) => v && ({ ...v, name: v.name || pl.name || '', address: pl.address ?? v.address, place: { _type: 'place', ...pl, ...(pl.location ? { location: { _type: 'geopoint', ...pl.location } } : {}) } }))} />
                          <Cols>
                            <Field label="Name families see" hint={'e.g. "Murray Park, Field 3".'}><TextInput value={newVenue.name} onChange={(e) => { const v = e.currentTarget.value; setNewVenue((x) => x && { ...x, name: v }); }} /></Field>
                            <Field label="Address"><TextInput value={newVenue.address} onChange={(e) => { const v = e.currentTarget.value; setNewVenue((x) => x && { ...x, address: v }); }} /></Field>
                          </Cols>
                          <Flex gap={2}>
                            <Button tone="positive" fontSize={1} text="Add venue" disabled={busy || !newVenue.name.trim() || !newVenue.address.trim()} onClick={addVenue} />
                            <Button mode="ghost" fontSize={1} text="Cancel" onClick={() => setNewVenue(null)} />
                          </Flex>
                        </Stack>
                      </Card>
                    ) : (
                      <Field label="Venue">
                        <Flex gap={2}>
                          <Box flex={1}><Select value={d.venue} onChange={setDay(d._key, 'venue')}><option value="">Pick</option>{venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}</Select></Box>
                          <Button mode="ghost" text="New venue" disabled={!!newVenue} onClick={() => setNewVenue({ day: d._key, name: '', address: '' })} />
                        </Flex>
                      </Field>
                    )}
                  </Stack>
                </Card>
              ))}
              <Box><Button mode="ghost" fontSize={1} text="Add another day" onClick={addDay} /></Box>
            </Stack>
          </Card>

          <Field label="Ollie registration link (optional)" hint={`One link for every day. Leave empty to use ${prog?.name ?? 'the program'}'s Default Ollie link${prog?.registerUrl ? ` (${prog.registerUrl})` : ''}.`}>
            <TextInput value={f.registerUrl} onChange={set('registerUrl')} placeholder="https://" />
          </Field>
          <Problems list={touched ? problems : []} />
        </Stack>
      </Box>
    </Dialog>
  );
}
