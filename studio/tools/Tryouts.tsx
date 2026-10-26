// Studio > Tryouts: every tryout by program (Academy, Club) and region. A tryout (e.g. "2027
// Academy Tryouts") has one name and Ollie link and its age groups; each age group (ages and
// players) has its own days, each with a date, venue and times. Click a tryout to edit all of it,
// Copy it for next year, or Add tryout in a region. Saving publishes straight away (the website
// updates in a few minutes). A venue can be added from the form too.
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
type Group = { _key: string; minAge: number; maxAge: number; gender: string; registerUrl?: string; days: Day[] };
type Tryout = { _id: string; name?: string; program: ProgramKey; region: RegionKey; registerUrl?: string; groups: Group[]; legacy?: boolean };
type Program = { _id: string; key: ProgramKey; name: string; ages: string; registerUrl?: string } & Record<RegionKey, string | undefined>;
type Venue = { _id: string; name: string; address?: string };
type Data = { programs: Program[]; tryouts: Tryout[]; venues: Venue[]; regions: { key: RegionKey; label: string }[]; drafts: string[] };

const DAY = '{ _key, date, "venue": venue._ref, "venueName": venue->name, startTime, endTime }';
const QUERY = `{
  "programs": *[_type == "program" && key in $programs && !(_id in path("drafts.**"))] | order(order asc) {
    _id, key, name, ages, registerUrl, "north": north.status, "south": south.status, "west": west.status
  },
  "tryouts": *[_type == "tryoutSession" && !(_id in path("drafts.**"))] {
    _id, name, program, region, registerUrl,
    "groups": groups[] { _key, minAge, maxAge, gender, registerUrl, "days": days[] | order(date asc, startTime asc) ${DAY} },
    minAge, maxAge, gender, "days": days[] | order(date asc, startTime asc) ${DAY}
  },
  "venues": *[_type == "venue" && !(_id in path("drafts.**"))] | order(name asc) { _id, name, address },
  "regions": *[_type == "region" && !(_id in path("drafts.**"))] | order(order asc) { key, label },
  "drafts": *[_id in path("drafts.**") && _type == "tryoutSession"]._id
}`;
// Older tryouts were one age group each (ages and days at the top): read them as one group.
type Raw = Omit<Tryout, 'groups'> & { groups?: Group[] | null; minAge?: number; maxAge?: number; gender?: string; days?: Day[] | null };
const normalize = (t: Raw): Tryout => (t.groups?.length
  ? { ...t, groups: t.groups.map((g) => ({ ...g, days: g.days ?? [] })) }
  : { ...t, legacy: true, groups: [{ _key: 'legacy', minAge: t.minAge ?? 0, maxAge: t.maxAge ?? 0, gender: t.gender ?? '', days: t.days ?? [] }] });

const today = () => new Date().toLocaleDateString('en-CA');
const ageRange = (ages?: string): [number, number] => {
  const n = (ages ?? '').match(/\d+/g)?.map(Number) ?? [];
  return n.length ? [Math.min(...n), Math.max(...n)] : [3, 19];
};
const daysOf = (t: Tryout) => t.groups.flatMap((g) => g.days).map((d) => d.date).filter(Boolean).sort();
// "Wed, May 26, 2027 to Sat, May 29, 2027 · U10 to U13 · Boys and Girls", worked out from the age groups.
const summary = (t: Tryout) => {
  const d = daysOf(t), g = t.groups.filter((x) => x.minAge);
  const genders = new Set(g.map((x) => x.gender));
  return [
    d.length ? (d[0] === d.at(-1) ? longDate(d[0]) : `${longDate(d[0])} to ${longDate(d.at(-1)!)}`) : 'No days yet',
    g.length ? agesLabel(Math.min(...g.map((x) => x.minAge)), Math.max(...g.map((x) => x.maxAge))) : '',
    genders.has('Coed') || (genders.has('Boys') && genders.has('Girls')) ? 'Boys and Girls' : [...genders][0] ?? '',
  ].filter(Boolean).join(' · ');
};

const th: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--card-border-color)', verticalAlign: 'top' };

export function Tryouts() {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [program, setProgram] = useState<'all' | ProgramKey>('all');
  const [region, setRegion] = useState<'all' | RegionKey>('all');
  const [past, setPast] = useState(false);
  // The form that's open: a new tryout (program and region filled in, or copied `from` one) or `editing` one.
  const [form, setForm] = useState<null | { program?: ProgramKey; region?: RegionKey; from?: Tryout; editing?: Tryout }>(null);

  const load = () => client.fetch<Omit<Data, 'tryouts'> & { tryouts: Raw[] }>(QUERY, { programs: PROGRAMS })
    .then((d) => setData({ ...d, tryouts: d.tryouts.map(normalize) })).catch(() => setData(null));
  useEffect(() => { load(); }, [client]); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (t: Tryout) => {
    if (!window.confirm(`Delete "${t.name || 'this tryout'}" and all its age groups? It comes off the website in a few minutes.`)) return;
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

  // Upcoming: tryouts with a day still to come, soonest first.
  const shown = useMemo(() => (data?.tryouts ?? [])
    .filter((t) => past || (daysOf(t).at(-1) ?? '') >= today())
    .sort((a, b) => (daysOf(a)[0] ?? '').localeCompare(daysOf(b)[0] ?? '')), [data, past]);
  if (!data) return <Box padding={5}><Text muted>Loading tryouts…</Text></Box>;
  const regionLabel = (k: string) => data.regions.find((r) => r.key === k)?.label ?? k;
  const programs = data.programs.filter((p) => program === 'all' || p.key === program);
  const regions = REGIONS.filter((r) => region === 'all' || r === region);
  const drafts = new Set(data.drafts);

  return (
    <Box padding={[3, 4, 5]} style={{ maxWidth: 1100, margin: '0 auto' }}>
      <Stack gap={5}>
        <Stack gap={3}>
          <Flex gap={3} align="center" justify="space-between" wrap="wrap">
            <Heading size={3}>Tryouts</Heading>
            <Button tone="primary" text="Add tryout" onClick={() => setForm({ program: program === 'all' ? undefined : program, region: region === 'all' ? undefined : region })} />
          </Flex>
          <Text muted size={1}>Each tryout (e.g. "2027 Academy Tryouts") has its age groups, and each age group its own days. Click a tryout to change it. Changes go live on the website in a few minutes, and past days drop off by themselves.</Text>
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
                      <Flex gap={2} align="center"><Heading size={1}>{regionLabel(r)}</Heading><Badge tone={tone} fontSize={0}>{statusLabel}</Badge></Flex>
                      <Button mode="ghost" fontSize={1} text={`Add ${regionLabel(r)} ${p.name} tryout`} onClick={() => setForm({ program: p.key, region: r })} />
                    </Flex>
                    {list.length ? list.map((t) => (
                      <Card key={t._id} padding={3} radius={2} border>
                        <Stack gap={3}>
                          <Flex gap={2} align="center" justify="space-between" wrap="wrap">
                            <Flex gap={2} align="center" wrap="wrap">
                              <button type="button" onClick={() => setForm({ editing: t })} title="Change this tryout" style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}>
                                <Text size={2} weight="semibold">{t.name || 'Unnamed tryout'}</Text>
                              </button>
                              {drafts.has(`drafts.${t._id}`) ? <Badge tone="caution" fontSize={0}>Unpublished changes</Badge> : null}
                              {t.legacy ? <Badge fontSize={0}>Older format: open and save to name it</Badge> : null}
                            </Flex>
                            <Flex gap={1}>
                              <Button mode="ghost" fontSize={1} text="Change" onClick={() => setForm({ editing: t })} />
                              <Button mode="bleed" fontSize={1} text="Copy" title="Start a new tryout with the same age groups and days" onClick={() => setForm({ from: t })} />
                              <Button mode="bleed" tone="critical" fontSize={1} text="Delete" onClick={() => remove(t)} />
                            </Flex>
                          </Flex>
                          <Text muted size={1}>{summary(t)} · {t.registerUrl ? 'Its own Ollie link' : 'Program\'s Ollie link'}</Text>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                              <thead><tr>{['Ages', 'Players', 'Days'].map((h) => <th key={h} style={th}><Text size={1} weight="medium">{h}</Text></th>)}</tr></thead>
                              <tbody>
                                {t.groups.map((g) => (
                                  <tr key={g._key}>
                                    <td style={td}><Text size={1} weight="medium">{g.minAge ? agesLabel(g.minAge, g.maxAge) : '?'}</Text></td>
                                    <td style={td}><Text size={1}>{g.gender}{g.registerUrl ? ' (own link)' : ''}</Text></td>
                                    <td style={td}><Stack gap={2}>{g.days.map((d) => (
                                      <Text key={d._key} size={1}>{longDate(d.date)} · {fmtTime(d.startTime)} to {fmtTime(d.endTime)} · {d.venueName ?? 'No venue'}</Text>
                                    ))}</Stack></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </Stack>
                      </Card>
                    )) : <Text muted size={1}>No {past ? '' : 'upcoming '}tryouts.</Text>}
                  </Stack>
                );
              })}
            </Stack>
          </Card>
        ))}
      </Stack>

      {form ? (
        <TryoutForm key={form.editing?._id ?? 'new'} data={data} start={form} drafted={form.editing ? drafts.has(`drafts.${form.editing._id}`) : false}
          onClose={() => setForm(null)} onSaved={() => { load(); setForm(null); }} />
      ) : null}
    </Box>
  );
}

// ---------- add, copy or edit one tryout and its age groups ----------

type DayRow = { _key: string; date: string; venue: string; startTime: string; endTime: string };
type GroupRow = { _key: string; minAge: string; maxAge: string; gender: string; registerUrl: string; days: DayRow[] };
const blankDay = (from?: Partial<DayRow>): DayRow => ({ _key: key(), date: '', venue: '', startTime: '', endTime: '', ...from });
const blankGroup = (): GroupRow => ({ _key: key(), minAge: '', maxAge: '', gender: '', registerUrl: '', days: [blankDay()] });
const toRow = (g: Group, keep: boolean): GroupRow => ({
  _key: keep && g._key !== 'legacy' ? g._key : key(), minAge: g.minAge ? String(g.minAge) : '', maxAge: g.maxAge ? String(g.maxAge) : '',
  gender: g.gender ?? '', registerUrl: g.registerUrl ?? '',
  days: g.days.map((d) => ({ _key: keep ? d._key : key(), date: d.date, venue: d.venue ?? '', startTime: d.startTime, endTime: d.endTime })),
});

function TryoutForm({ data, start, drafted, onClose, onSaved }: {
  data: Data; start: { program?: ProgramKey; region?: RegionKey; from?: Tryout; editing?: Tryout }; drafted: boolean;
  onClose: () => void; onSaved: () => void;
}) {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const base = start.editing ?? start.from;
  const [f, setF] = useState({
    name: start.editing?.name ?? '', program: base?.program ?? start.program ?? '', region: base?.region ?? start.region ?? '', registerUrl: base?.registerUrl ?? '',
  });
  // A copy keeps the age groups and days (with new keys); a new tryout starts with one empty group.
  const [groups, setGroups] = useState<GroupRow[]>(() => (base ? base.groups.map((g) => toRow(g, !!start.editing)) : [blankGroup()]));
  const [venues, setVenues] = useState(data.venues);
  // The new venue being added, and which day of which group it's for.
  const [newVenue, setNewVenue] = useState<null | { group: string; day: string; name: string; address: string; place?: object }>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => { const v = e.currentTarget.value; setF((x) => ({ ...x, [k]: v })); };
  const setGroup = (gk: string, change: (g: GroupRow) => GroupRow) => setGroups((list) => list.map((g) => (g._key === gk ? change(g) : g)));
  const groupField = (gk: string, field: 'minAge' | 'maxAge' | 'gender' | 'registerUrl') => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    setGroup(gk, (g) => ({ ...g, [field]: v, ...(field === 'minAge' && (!g.maxAge || Number(g.maxAge) < Number(v)) ? { maxAge: v } : {}) }));
  };
  const dayField = (gk: string, dk: string, field: keyof DayRow) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    setGroup(gk, (g) => ({ ...g, days: g.days.map((d) => (d._key === dk ? { ...d, [field]: v } : d)) }));
  };
  // Another day: the next date, same venue and times as the group's last day.
  const addDay = (gk: string) => setGroup(gk, (g) => {
    const last = g.days.at(-1);
    return { ...g, days: [...g.days, blankDay(last && { venue: last.venue, startTime: last.startTime, endTime: last.endTime, date: last.date ? addDays(last.date, 1) : '' })] };
  });
  // Another age group like this one (same days); change its ages, players or times.
  const copyGroup = (g: GroupRow) => setGroups((list) => {
    const i = list.findIndex((x) => x._key === g._key);
    const copy = { ...g, _key: key(), minAge: '', maxAge: '', gender: '', days: g.days.map((d) => ({ ...d, _key: key() })) };
    return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
  });

  const prog = data.programs.find((p) => p.key === f.program);
  const [lo, hi] = ageRange(prog?.ages);
  const ages = AGE_OPTIONS.filter((o) => o.value >= lo && o.value <= hi);
  const status = prog && f.region ? prog[f.region as RegionKey] : undefined;
  const label = (g: GroupRow, i: number) => (g.minAge ? `${agesLabel(Number(g.minAge), Number(g.maxAge || g.minAge))} ${g.gender}`.trim() : `Age group ${i + 1}`);
  const problems = [
    ...(!f.name.trim() ? ['Give the tryout a name, e.g. "2027 Academy Tryouts".'] : []),
    ...(!f.program ? ['Pick the program.'] : []),
    ...(!f.region ? ['Pick the region.'] : []),
    ...(f.registerUrl.trim() && !/^https?:\/\/\S+$/.test(f.registerUrl.trim()) ? ['The Ollie link must start with https://.'] : []),
    ...(!groups.length ? ['Add at least one age group.'] : []),
    ...groups.flatMap((g, i) => {
      const who = label(g, i);
      return [
        ...(!g.minAge || !g.maxAge ? [`${who}: pick the youngest and oldest age group.`] : Number(g.maxAge) < Number(g.minAge) ? [`${who}: the oldest must be the same as or older than the youngest.`] : []),
        ...(!g.gender ? [`${who}: pick Boys, Girls or Coed.`] : []),
        ...(g.registerUrl.trim() && !/^https?:\/\/\S+$/.test(g.registerUrl.trim()) ? [`${who}: its Ollie link must start with https://.`] : []),
        ...(!g.days.length ? [`${who}: add at least one day.`] : []),
        ...g.days.flatMap((d, n) => {
          const day = g.days.length > 1 ? ` day ${n + 1}` : '';
          return [
            ...(!d.date ? [`${who}${day}: pick the date.`] : []),
            ...(!d.venue ? [`${who}${day}: pick a venue, or add a new one.`] : []),
            ...(!d.startTime || !d.endTime ? [`${who}${day}: pick the start and end times.`] : d.endTime <= d.startTime ? [`${who}${day}: it must end after it starts.`] : []),
          ];
        }),
      ];
    }),
  ];
  const touched = !!(start.editing || f.name || groups.some((g) => g.minAge || g.days.some((d) => d.date || d.venue)));

  const save = async () => {
    setBusy(true);
    try {
      const fields = {
        name: f.name.trim(), program: f.program, region: f.region,
        groups: [...groups].sort((a, b) => Number(a.minAge) - Number(b.minAge) || a.gender.localeCompare(b.gender)).map((g) => ({
          _key: g._key, _type: 'tryoutGroup', minAge: Number(g.minAge), maxAge: Number(g.maxAge), gender: g.gender,
          ...(g.registerUrl.trim() ? { registerUrl: g.registerUrl.trim() } : {}),
          days: [...g.days].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
            .map((d) => ({ _key: d._key, _type: 'tryoutDay', date: d.date, venue: { _type: 'reference', _ref: d.venue }, startTime: d.startTime, endTime: d.endTime })),
        })),
        ...(f.registerUrl.trim() ? { registerUrl: f.registerUrl.trim() } : {}),
      };
      if (start.editing) {
        // Saving an older one-group tryout turns it into the grouped shape.
        const cleared = [...(f.registerUrl.trim() ? [] : ['registerUrl']), 'minAge', 'maxAge', 'gender', 'days'];
        const tx = client.transaction();
        for (const id of ids(start.editing._id, drafted)) tx.patch(id, (p) => p.set(fields).unset(cleared));
        await tx.commit({ visibility: 'sync' });
      } else {
        await client.create({ _id: crypto.randomUUID(), _type: 'tryoutSession', ...fields }, { visibility: 'sync' });
      }
      toast.push({ status: 'success', title: `${start.editing ? 'Saved' : 'Added'} ${fields.name}`, description: 'The website updates in a few minutes.' });
      onSaved();
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
      setGroup(newVenue.group, (g) => ({ ...g, days: g.days.map((d) => (d._key === newVenue.day ? { ...d, venue: doc._id } : d)) }));
      setNewVenue(null);
      toast.push({ status: 'success', title: `Added ${doc.name} to Venues` });
    } catch (e) {
      toast.push({ status: 'error', title: 'The venue wasn\'t added', description: errText(e) });
    } finally { setBusy(false); }
  };

  const timeOptions = [<option key="" value="">Pick</option>, ...TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)];
  const ageOptions = [<option key="" value="">Pick</option>, ...ages.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)];

  return (
    <Dialog id="tryout" width={3} onClose={busy ? undefined : onClose}
      header={start.editing ? `Change ${start.editing.name || 'tryout'}` : start.from ? 'Copy tryout' : 'Add a tryout'}
      footer={<Footer busy={busy} ok={problems.length === 0 && !newVenue} label={start.editing ? 'Save changes' : 'Publish tryout'} onClose={onClose} onSave={save}
        full={start.editing ? <FullPage id={start.editing._id} type="tryoutSession" /> : null} />}>
      <Box padding={4}>
        <Stack gap={4}>
          <Field label="Name" hint={'e.g. "2027 Academy Tryouts". The site adds the dates, ages and players from the age groups below.'}><TextInput value={f.name} onChange={set('name')} /></Field>
          <Cols>
            <Field label="Program"><Select value={f.program} onChange={set('program')}><option value="">Pick</option>{data.programs.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}</Select></Field>
            <Field label="Region"><Select value={f.region} onChange={set('region')}><option value="">Pick</option>{data.regions.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</Select></Field>
          </Cols>
          {status && status !== 'active' ? (
            <Card tone="caution" padding={3} radius={2}><Text size={1}>{prog?.name} is {status === 'soon' ? 'coming soon' : 'not offered'} in this region, so its page there shows {status === 'soon' ? 'Register interest' : 'the nearest region'} instead of tryouts. Change that under {prog?.name}, Page content, Regions.</Text></Card>
          ) : null}
          <Field label="Ollie registration link (optional)" hint={`Every age group's Register button goes here. Empty uses ${prog?.name ?? 'the program'}'s Default Ollie link${prog?.registerUrl ? ` (${prog.registerUrl})` : ''}.`}>
            <TextInput value={f.registerUrl} onChange={set('registerUrl')} placeholder="https://" />
          </Field>

          {groups.map((g, gi) => (
            <Card key={g._key} padding={3} radius={2} border>
              <Stack gap={3}>
                <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
                  <Text size={1} weight="semibold">{label(g, gi)}</Text>
                  <Flex gap={1}>
                    <Button mode="bleed" fontSize={1} text="Copy group" title="Add another age group with the same days" onClick={() => copyGroup(g)} />
                    {groups.length > 1 ? <Button mode="bleed" tone="critical" fontSize={1} text="Remove group" onClick={() => setGroups((list) => list.filter((x) => x._key !== g._key))} /> : null}
                  </Flex>
                </Flex>
                <Cols>
                  <Field label="Youngest age group" hint={prog ? `${prog.name}: ${prog.ages}` : undefined}><Select value={g.minAge} onChange={groupField(g._key, 'minAge')}>{ageOptions}</Select></Field>
                  <Field label="Oldest age group" hint="Same as the youngest for one age group."><Select value={g.maxAge} onChange={groupField(g._key, 'maxAge')}>{ageOptions}</Select></Field>
                  <Field label="Players"><Select value={g.gender} onChange={groupField(g._key, 'gender')}><option value="">Pick</option>{GENDERS.map((x) => <option key={x}>{x}</option>)}</Select></Field>
                </Cols>
                {g.days.map((d, di) => (
                  <Card key={d._key} padding={3} radius={2} tone="transparent" border>
                    <Stack gap={3}>
                      {g.days.length > 1 ? (
                        <Flex align="center" justify="space-between">
                          <Text size={1} weight="medium">Day {di + 1}</Text>
                          <Button mode="bleed" tone="critical" fontSize={1} text="Remove day" onClick={() => setGroup(g._key, (x) => ({ ...x, days: x.days.filter((y) => y._key !== d._key) }))} />
                        </Flex>
                      ) : null}
                      <Cols>
                        <Field label="Date"><TextInput type="date" value={d.date} onChange={dayField(g._key, d._key, 'date')} /></Field>
                        <Field label="Starts"><Select value={d.startTime} onChange={dayField(g._key, d._key, 'startTime')}>{timeOptions}</Select></Field>
                        <Field label="Ends"><Select value={d.endTime} onChange={dayField(g._key, d._key, 'endTime')}>{timeOptions}</Select></Field>
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
                            <Box flex={1}><Select value={d.venue} onChange={dayField(g._key, d._key, 'venue')}><option value="">Pick</option>{venues.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}</Select></Box>
                            <Button mode="ghost" text="New venue" disabled={!!newVenue} onClick={() => setNewVenue({ group: g._key, day: d._key, name: '', address: '' })} />
                          </Flex>
                        </Field>
                      )}
                    </Stack>
                  </Card>
                ))}
                <Box><Button mode="ghost" fontSize={1} text="Add another day" onClick={() => addDay(g._key)} /></Box>
                <Field label="Ollie link for this group (optional)" hint="Only if this group registers somewhere else. Empty uses the tryout's link.">
                  <TextInput value={g.registerUrl} onChange={groupField(g._key, 'registerUrl')} placeholder="https://" />
                </Field>
              </Stack>
            </Card>
          ))}
          <Box><Button mode="ghost" text="Add age group" onClick={() => setGroups((list) => [...list, blankGroup()])} /></Box>
          <Problems list={touched ? problems : []} />
        </Stack>
      </Box>
    </Dialog>
  );
}
