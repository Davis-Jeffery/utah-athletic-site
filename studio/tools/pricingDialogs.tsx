// The Pricing page's forms (tools/Pricing.tsx): add or edit a Club age group, edit a region fee, and
// add (blank or copied for the next season) or edit a Recreation or Futures session. Each saves
// straight away and publishes, the same as publishing from the document itself; a document with
// unpublished changes gets the same change in its draft, so publishing that later doesn't undo it.
import { useState } from 'react';
import { useClient } from 'sanity';
import { Box, Button, Card, Dialog, Flex, Select, Stack, Text, TextInput } from '@sanity/ui';
import { useToast } from '@sanity/ui/toast';
import { AGE_OPTIONS, TIME_OPTIONS } from '../schemaTypes/helpers';
import { Cols, DAYS, Field, Footer, FullPage, Label, Problems, addDays, agesLabel, errText, ids, key, longDate, weekday } from './formParts';

export const REGIONS = ['north', 'south', 'west'] as const;
export type RegionKey = (typeof REGIONS)[number];
export type AgeTab = { _key: string; minAge: number; maxAge: number; note?: string; prices?: Partial<Record<RegionKey, number>>; included?: unknown[]; notIncluded?: unknown[] };
export type Session = {
  _id: string; _type: 'recSession' | 'futuresSession'; name: string; region: RegionKey; start: string; end: string; cost: number;
  venue?: string; minAge?: number; maxAge?: number; registrationOpens?: string; registrationCloses?: string; registerUrl?: string; capacity?: number; status?: string;
  classes?: { _key?: string; date: string; startTime: string; endTime: string; note?: string }[];
};
type Opt = { value: string; label: string };


/** Every `day` (0 Sunday to 6 Saturday) from `start` through `end`, as Futures classes. */
export function weeklyClasses(start: string, end: string, day: number, startTime: string, endTime: string) {
  const out: { _key: string; _type: 'class'; date: string; startTime: string; endTime: string }[] = [];
  for (let d = addDays(start, (day - weekday(start) + 7) % 7); d <= end; d = addDays(d, 7)) out.push({ _key: key(), _type: 'class', date: d, startTime, endTime });
  return out;
}


// Included / Not included: a list of items, each with an optional detail.
type ItemRow = { _key: string; item: string; detail: string };
const toRows = (list?: unknown[]): ItemRow[] => ((list ?? []) as { _key?: string; item?: string; detail?: string }[]).map((x) => ({ _key: x._key ?? key(), item: x.item ?? '', detail: x.detail ?? '' }));
const fromRows = (list: ItemRow[]) => list.filter((x) => x.item.trim()).map((x) => ({ _key: x._key, _type: 'feeItem', item: x.item.trim(), ...(x.detail.trim() ? { detail: x.detail.trim() } : {}) }));
function ItemsEditor({ label, hint, list, onChange }: { label: string; hint?: string; list: ItemRow[]; onChange: (l: ItemRow[]) => void }) {
  const edit = (k: string, field: 'item' | 'detail') => (e: React.FormEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value;
    onChange(list.map((x) => (x._key === k ? { ...x, [field]: v } : x)));
  };
  return (
    <Stack gap={2}>
      <Label>{label}</Label>
      {hint ? <Text muted size={0}>{hint}</Text> : null}
      {list.map((x) => (
        <div key={x._key} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,1fr) minmax(140px,1.4fr) auto', gap: 8, alignItems: 'center' }}>
          <TextInput aria-label="Item" placeholder="Item, e.g. Licensed coaching" value={x.item} onChange={edit(x._key, 'item')} />
          <TextInput aria-label="Detail" placeholder="Detail (optional)" value={x.detail} onChange={edit(x._key, 'detail')} />
          <Button mode="bleed" tone="critical" fontSize={1} text="Remove" onClick={() => onChange(list.filter((y) => y._key !== x._key))} />
        </div>
      ))}
      <Box><Button mode="ghost" fontSize={1} text="Add item" onClick={() => onChange([...list, { _key: key(), item: '', detail: '' }])} /></Box>
    </Stack>
  );
}

// ---------- Club: add or edit an age group ----------

export function AgeGroupForm({ program, tab, regions, drafted, unit, onClose, onDone }: {
  program: { _id: string; name: string; ageTabs?: AgeTab[] } & Partial<Record<RegionKey, { status?: string }>>;
  tab?: AgeTab; regions: Opt[]; drafted: boolean; unit?: string; onClose: () => void; onDone: () => void;
}) {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const tabs = program.ageTabs ?? [];
  const others = tabs.filter((t) => t._key !== tab?._key);
  const running = REGIONS.filter((r) => program[r]?.status === 'active' || tab?.prices?.[r] != null);
  const [min, setMin] = useState(tab ? String(tab.minAge) : '');
  const [max, setMax] = useState(tab ? String(tab.maxAge) : '');
  const [prices, setPrices] = useState<Record<string, string>>(Object.fromEntries(REGIONS.map((r) => [r, tab?.prices?.[r] != null ? String(tab.prices[r]) : ''])));
  const [note, setNote] = useState(tab?.note ?? '');
  // A new age group starts with the lists of the last one (pick another, or start empty).
  const [copyFrom, setCopyFrom] = useState(tab ? '' : tabs.at(-1)?._key ?? '');
  const source = tab ?? tabs.find((t) => t._key === copyFrom);
  const [included, setIncluded] = useState(() => toRows(source?.included).map((x) => (tab ? x : { ...x, _key: key() })));
  const [notIncluded, setNotIncluded] = useState(() => toRows(source?.notIncluded).map((x) => (tab ? x : { ...x, _key: key() })));
  const pickCopy = (k: string) => {
    setCopyFrom(k);
    const t = tabs.find((x) => x._key === k);
    setIncluded(toRows(t?.included).map((x) => ({ ...x, _key: key() })));
    setNotIncluded(toRows(t?.notIncluded).map((x) => ({ ...x, _key: key() })));
  };
  const [busy, setBusy] = useState(false);
  const lo = Number(min), hi = Number(max);
  const label = min && max ? agesLabel(lo, hi) : '';
  const overlap = min && max ? others.find((t) => lo <= t.maxAge && hi >= t.minAge) : undefined;
  const problems = [
    ...(!min || !max ? ['Pick the youngest and oldest age group (the same for one age).'] : hi < lo ? ['The oldest must be the same as or older than the youngest.'] : []),
    ...Object.entries(prices).filter(([, v]) => v.trim() && !(Number(v) >= 0)).map(([r]) => `${regions.find((x) => x.value === r)?.label} price isn't a number.`),
  ];

  const save = async () => {
    setBusy(true);
    try {
      const next: AgeTab & { _type: string } = {
        _key: tab?._key ?? key(), _type: 'ageTab', minAge: lo, maxAge: hi, ...(note.trim() ? { note: note.trim() } : {}),
        prices: Object.fromEntries(REGIONS.flatMap((r) => (prices[r]?.trim() ? [[r, Number(prices[r])]] : []))),
        included: fromRows(included), notIncluded: fromRows(notIncluded),
      };
      // Kept in age order: placed before the first other group that starts older, else at the end.
      const after = others.find((t) => t.minAge > lo);
      const tx = client.transaction();
      for (const id of ids(program._id, drafted)) {
        if (tab) tx.patch(id, (p) => p.unset([`ageTabs[_key=="${tab._key}"]`]));
        tx.patch(id, (p) => p.setIfMissing({ ageTabs: [] }).insert(after ? 'before' : 'after', after ? `ageTabs[_key=="${after._key}"]` : 'ageTabs[-1]', [next]));
      }
      await tx.commit({ visibility: 'sync' });
      toast.push({ status: 'success', title: tab ? `Saved ${label}` : `Added ${label} to ${program.name}`, description: 'The website updates in a few minutes.' });
      onDone();
    } catch (e) {
      toast.push({ status: 'error', title: tab ? 'The age group wasn\'t saved' : 'The age group wasn\'t added', description: errText(e) });
      setBusy(false);
    }
  };

  return (
    <Dialog id="age-group" header={tab ? `${program.name}, ${agesLabel(tab.minAge, tab.maxAge)}` : `Add a ${program.name} age group`} onClose={busy ? undefined : onClose} width={2}
      footer={<Footer busy={busy} ok={problems.length === 0} label={tab ? 'Save changes' : 'Add age group'} onClose={onClose} onSave={save}
        full={tab ? <FullPage id={program._id} type="program" path={`ageTabs[_key=="${tab._key}"]`} /> : null} />}>
      <Box padding={4}>
        <Stack gap={5}>
          <Cols>
            <Field label="From"><Select value={min} onChange={(e) => { const v = e.currentTarget.value; setMin(v); if (!max || Number(max) < Number(v)) setMax(v); }}><option value="">Pick</option>{AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}</Select></Field>
            <Field label="Through"><Select value={max} onChange={(e) => setMax(e.currentTarget.value)}><option value="">Pick</option>{AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}</Select></Field>
          </Cols>
          {overlap ? <Card tone="caution" padding={3} radius={2}><Text size={1}>This overlaps {agesLabel(overlap.minAge, overlap.maxAge)}. Families would see both tabs for those ages.</Text></Card> : null}
          <Stack gap={2}>
            <Cols>
              {running.map((r) => (
                <Field key={r} label={`${regions.find((x) => x.value === r)?.label} price ($)`}>
                  <TextInput inputMode="decimal" placeholder="Not offered" value={prices[r] ?? ''} onChange={(e) => { const v = e.currentTarget.value; setPrices((x) => ({ ...x, [r]: v })); }} />
                </Field>
              ))}
            </Cols>
            <Text muted size={0}>{unit ? `Billed ${unit}. ` : ''}Leave a region empty if this age group isn't offered there: its tab won't show on that region's page.</Text>
          </Stack>
          <Field label="Note (optional)" hint={'Under the price, e.g. "Includes tournament entry".'}><TextInput value={note} onChange={(e) => setNote(e.currentTarget.value)} /></Field>
          {!tab && tabs.length ? (
            <Field label="Start the lists from">
              <Select value={copyFrom} onChange={(e) => pickCopy(e.currentTarget.value)}>
                {tabs.map((t) => <option key={t._key} value={t._key}>Same as {agesLabel(t.minAge, t.maxAge)}</option>)}
                <option value="">Start empty</option>
              </Select>
            </Field>
          ) : null}
          <ItemsEditor label="Included" hint="What this fee covers." list={included} onChange={setIncluded} />
          <ItemsEditor label="Not included" hint="e.g. kit package, tournament travel." list={notIncluded} onChange={setNotIncluded} />
          <Problems list={min && max ? problems : []} />
        </Stack>
      </Box>
    </Dialog>
  );
}

// ---------- Recreation (or another program): edit one region fee row ----------

export type Fee = { _key: string; ages: string; cost: number; note?: string };

export function FeeForm({ program, region, regionLabel, fee, drafted, unit, onClose, onDone }: {
  program: { _id: string; name: string }; region: RegionKey; regionLabel: string; fee: Fee; drafted: boolean; unit?: string; onClose: () => void; onDone: () => void;
}) {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const [ages, setAges] = useState(fee.ages);
  const [cost, setCost] = useState(String(fee.cost ?? ''));
  const [note, setNote] = useState(fee.note ?? '');
  const [busy, setBusy] = useState(false);
  const problems = [
    ...(!ages.trim() ? ['Enter the age group, e.g. "U9 to U12" or "All ages".'] : []),
    ...(ages.includes('—') || note.includes('—') ? ['No em dashes. Use a period, comma or colon instead.'] : []),
    ...(!(cost.trim() && Number(cost) >= 0) ? ['Enter a price.'] : []),
  ];
  const save = async () => {
    setBusy(true);
    try {
      const tx = client.transaction();
      const row = { _key: fee._key, _type: 'fee', ages: ages.trim(), cost: Number(cost), ...(note.trim() ? { note: note.trim() } : {}) };
      for (const id of ids(program._id, drafted)) tx.patch(id, (p) => p.set({ [`${region}.fees[_key=="${fee._key}"]`]: row }));
      await tx.commit({ visibility: 'sync' });
      toast.push({ status: 'success', title: 'Saved', description: 'The website updates in a few minutes.' });
      onDone();
    } catch (e) {
      toast.push({ status: 'error', title: 'The fee wasn\'t saved', description: errText(e) });
      setBusy(false);
    }
  };
  return (
    <Dialog id="region-fee" header={`${program.name}, ${regionLabel}: ${fee.ages}`} onClose={busy ? undefined : onClose} width={1}
      footer={<Footer busy={busy} ok={problems.length === 0} label="Save changes" onClose={onClose} onSave={save} full={<FullPage id={program._id} type="program" path={`${region}.fees[_key=="${fee._key}"]`} />} />}>
      <Box padding={4}>
        <Stack gap={4}>
          <Field label="Age group" hint={'e.g. "U9 to U12" or "All ages".'}><TextInput value={ages} onChange={(e) => setAges(e.currentTarget.value)} /></Field>
          <Field label="Price ($)" hint={unit ? `Billed ${unit}.` : undefined}><TextInput inputMode="decimal" value={cost} onChange={(e) => setCost(e.currentTarget.value)} /></Field>
          <Field label="Note (optional)" hint={'e.g. "Tooele and Stansbury Park".'}><TextInput value={note} onChange={(e) => setNote(e.currentTarget.value)} /></Field>
          <Problems list={problems} />
        </Stack>
      </Box>
    </Dialog>
  );
}

// ---------- Recreation and Futures: add, copy or edit a session ----------

const KIND_LABEL = { recSession: 'Recreation', futuresSession: 'Futures' } as const;

type ClassRow = { _key: string; date: string; startTime: string; endTime: string; note: string };

const STATUSES = {
  recSession: [['auto', 'Automatic (from the dates)'], ['open', 'Open'], ['closed', 'Closed'], ['full', 'Full']],
  futuresSession: [['auto', 'Automatic (from the dates)'], ['open', 'Open'], ['inseason', 'In season'], ['closed', 'Closed'], ['full', 'Full']],
} as const;

export function SessionForm({ kind, from, editing, drafted, regions, venues, onClose, onDone }: {
  kind: Session['_type']; from?: Session; editing?: Session; drafted?: boolean; regions: Opt[]; venues: Opt[]; onClose: () => void; onDone: () => void;
}) {
  const client = useClient({ apiVersion: '2025-10-01' });
  const toast = useToast();
  const futures = kind === 'futuresSession';
  // Editing fills in everything; copying fills in all but the name and dates.
  const base = editing ?? from;
  const first = base?.classes?.[0];
  const [f, setF] = useState({
    name: editing?.name ?? '', region: base?.region ?? '', venue: base?.venue ?? '', minAge: base?.minAge != null ? String(base.minAge) : '', maxAge: base?.maxAge != null ? String(base.maxAge) : '',
    cost: base?.cost != null ? String(base.cost) : '', registrationOpens: editing?.registrationOpens ?? '', registrationCloses: editing?.registrationCloses ?? '',
    start: editing?.start ?? '', end: editing?.end ?? '', status: editing?.status ?? 'auto',
    registerUrl: base?.registerUrl ?? '', capacity: base?.capacity != null ? String(base.capacity) : '',
    // Futures "add weekly classes": day and times (copied from the first class of the session it copies) and a date range.
    day: first ? String(weekday(first.date)) : '', startTime: first?.startTime ?? '', endTime: first?.endTime ?? '', wFrom: '', wThrough: '',
  });
  // Futures: every class in the session, edited one by one. The first and last class come from here.
  const [classes, setClasses] = useState<ClassRow[]>(() => (editing?.classes ?? []).map((c) => ({ _key: c._key ?? key(), date: c.date, startTime: c.startTime, endTime: c.endTime, note: c.note ?? '' })));
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => { const v = e.currentTarget.value; setF((x) => ({ ...x, [k]: v })); };
  const setRow = (k: string, field: keyof ClassRow) => (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => {
    const v = e.currentTarget.value;
    setClasses((list) => list.map((c) => (c._key === k ? { ...c, [field]: v } : c)));
  };
  const sorted = [...classes].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.startTime.localeCompare(b.startTime));
  const dated = sorted.filter((c) => c.date);
  const start = futures ? dated[0]?.date ?? '' : f.start;
  const end = futures ? dated.at(-1)?.date ?? '' : f.end;

  // Adds a class every week on the chosen day between the two dates, skipping dates already in the list.
  const weeklyReady = f.day !== '' && f.startTime && f.endTime && f.endTime > f.startTime && f.wFrom && f.wThrough && f.wThrough >= f.wFrom;
  const weekly = weeklyReady ? weeklyClasses(f.wFrom, f.wThrough, Number(f.day), f.startTime, f.endTime) : [];
  const addWeekly = () => setClasses((list) => [...list, ...weekly.filter((w) => !list.some((c) => c.date === w.date)).map((w) => ({ ...w, note: '' }))]);
  // One more class: a week after the last one, at the same time (or the weekly times).
  const addOne = () => setClasses((list) => {
    const last = [...list].filter((c) => c.date).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
    return [...list, { _key: key(), date: last ? addDays(last.date, 7) : f.wFrom, startTime: last?.startTime ?? f.startTime, endTime: last?.endTime ?? f.endTime, note: '' }];
  });

  const dupes = dated.filter((c, i) => dated.findIndex((x) => x.date === c.date && x.startTime === c.startTime) !== i);
  const problems = [
    ...(!f.name.trim() ? ['Give it a name, e.g. "Spring 2027".'] : []),
    ...(!f.region ? ['Pick a region.'] : []),
    ...(!f.venue ? ['Pick a venue.'] : []),
    ...(!(f.cost.trim() && Number(f.cost) >= 0) ? ['Enter a price.'] : []),
    ...(!f.registrationOpens || !f.registrationCloses ? ['Fill in when registration opens and closes.'] : []),
    ...(f.registrationOpens && f.registrationCloses && f.registrationCloses < f.registrationOpens ? ['Registration must close on or after it opens.'] : []),
    ...(futures
      ? [
        ...(!classes.length ? ['Add the classes: weekly, one at a time, or both.'] : []),
        ...(classes.some((c) => !c.date || !c.startTime || !c.endTime) ? ['Every class needs a date, a start time and an end time.'] : []),
        ...(classes.some((c) => c.startTime && c.endTime && c.endTime <= c.startTime) ? ['A class ends before it starts.'] : []),
        ...(dupes.length ? [`${longDate(dupes[0].date)} is in the list twice.`] : []),
      ]
      : [
        ...(!f.start || !f.end ? ['Fill in when the season starts and ends.'] : []),
        ...(f.start && f.end && f.end < f.start ? ['The season must end on or after it starts.'] : []),
      ]),
    ...((f.minAge === '') !== (f.maxAge === '') ? ['Pick both ages, or neither to use the program\'s ages.'] : f.minAge && Number(f.maxAge) < Number(f.minAge) ? ['The oldest age must be the same as or older than the youngest.'] : []),
    ...(f.registerUrl.trim() && !/^https?:\/\/\S+$/.test(f.registerUrl.trim()) ? ['The registration link must start with https://.'] : []),
    ...(f.capacity.trim() && !(Number.isInteger(Number(f.capacity)) && Number(f.capacity) >= 1) ? ['Spots must be a whole number.'] : []),
  ];
  const touched = !!(editing || f.name || f.registrationOpens || f.registrationCloses || f.start || f.end || classes.length);

  const save = async () => {
    setBusy(true);
    try {
      const fields = {
        name: f.name.trim(), region: f.region, venue: { _type: 'reference', _ref: f.venue },
        cost: Number(f.cost), registrationOpens: f.registrationOpens, registrationCloses: f.registrationCloses, start, end, status: f.status,
        ...(f.minAge ? { minAge: Number(f.minAge), maxAge: Number(f.maxAge) } : {}),
        ...(!futures && f.registerUrl.trim() ? { registerUrl: f.registerUrl.trim() } : {}),
        ...(futures && f.capacity.trim() ? { capacity: Number(f.capacity) } : {}),
        ...(futures ? { classes: sorted.map(({ _key, date, startTime, endTime, note }) => ({ _key, _type: 'class', date, startTime, endTime, ...(note.trim() ? { note: note.trim() } : {}) })) } : {}),
      };
      if (editing) {
        // Optional fields left empty are cleared.
        const cleared = [...(f.minAge ? [] : ['minAge', 'maxAge']), ...(futures ? (f.capacity.trim() ? [] : ['capacity']) : (f.registerUrl.trim() ? [] : ['registerUrl']))];
        const tx = client.transaction();
        for (const id of ids(editing._id, drafted)) tx.patch(id, (p) => p.set(fields).unset(cleared));
        await tx.commit({ visibility: 'sync' });
      } else {
        await client.create({ _id: crypto.randomUUID(), _type: kind, ...fields }, { visibility: 'sync' });
      }
      toast.push({ status: 'success', title: editing ? `Saved ${fields.name}` : `${KIND_LABEL[kind]} session added`, description: 'It\'s published: the website updates in a few minutes.' });
      onDone();
    } catch (e) {
      toast.push({ status: 'error', title: editing ? 'The session wasn\'t saved' : 'The session wasn\'t added', description: errText(e) });
      setBusy(false);
    }
  };

  const ageSelect = (k: 'minAge' | 'maxAge') => (
    <Select value={f[k]} onChange={set(k)}><option value="">Program's ages</option>{AGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)}</Select>
  );
  const timeOptions = [<option key="" value="">Pick</option>, ...TIME_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.title}</option>)];

  return (
    <Dialog id="session" header={editing ? `${KIND_LABEL[kind]}: ${editing.name}` : from ? `Copy "${from.name}" as a new ${KIND_LABEL[kind]} session` : `Add a ${KIND_LABEL[kind]} session`} onClose={busy ? undefined : onClose} width={2}
      footer={<Footer busy={busy} ok={problems.length === 0} label={editing ? 'Save changes' : 'Publish session'} onClose={onClose} onSave={save} full={editing ? <FullPage id={editing._id} type={kind} /> : null} />}>
      <Box padding={4}>
        <Stack gap={4}>
          <Field label="Name" hint={futures ? 'e.g. "Spring 2027, Saturday mornings".' : 'e.g. "Spring 2027".'}><TextInput value={f.name} onChange={set('name')} /></Field>
          <Cols>
            <Field label="Region"><Select value={f.region} onChange={set('region')}><option value="">Pick</option>{regions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
            <Field label="Venue" hint="Not listed? Add it under Venues first."><Select value={f.venue} onChange={set('venue')}><option value="">Pick</option>{venues.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>
          </Cols>
          <Cols>
            <Field label="Price ($)"><TextInput inputMode="decimal" value={f.cost} onChange={set('cost')} /></Field>
            <Field label="Youngest">{ageSelect('minAge')}</Field>
            <Field label="Oldest">{ageSelect('maxAge')}</Field>
          </Cols>
          <Cols>
            <Field label="Registration opens"><TextInput type="date" value={f.registrationOpens} onChange={set('registrationOpens')} /></Field>
            <Field label="Registration closes"><TextInput type="date" value={f.registrationCloses} onChange={set('registrationCloses')} /></Field>
            {futures ? null : <Field label="Season starts"><TextInput type="date" value={f.start} onChange={set('start')} /></Field>}
            {futures ? null : <Field label="Season ends" hint="The session drops off the site after this day."><TextInput type="date" value={f.end} onChange={set('end')} /></Field>}
          </Cols>
          {editing ? (
            <Field label="Registration status" hint="Leave on Automatic and the site works it out from the dates. Pick another only to override that.">
              <Select value={f.status} onChange={set('status')}>{STATUSES[kind].map(([v, t]) => <option key={v} value={v}>{t}</option>)}</Select>
            </Field>
          ) : null}
          {futures ? (
            <>
              <Card padding={3} radius={2} border>
                <Stack gap={3}>
                  <Label>Classes</Label>
                  <Text muted size={1}>Add a class every week, then remove or change any of them (e.g. a holiday), or add single classes. The first and last class set when the session runs; it drops off the site after the last class.</Text>
                  <Cols min={120}>
                    <Field label="Every"><Select value={f.day} onChange={set('day')}><option value="">Pick a day</option>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</Select></Field>
                    <Field label="Starts"><Select value={f.startTime} onChange={set('startTime')}>{timeOptions}</Select></Field>
                    <Field label="Ends"><Select value={f.endTime} onChange={set('endTime')}>{timeOptions}</Select></Field>
                    <Field label="From"><TextInput type="date" value={f.wFrom} onChange={set('wFrom')} /></Field>
                    <Field label="Through"><TextInput type="date" value={f.wThrough} onChange={set('wThrough')} /></Field>
                  </Cols>
                  <Flex gap={2} wrap="wrap">
                    <Button mode="ghost" fontSize={1} text={weekly.length ? `Add ${weekly.length} weekly classes` : 'Add weekly classes'} disabled={!weekly.length} onClick={addWeekly} />
                    <Button mode="ghost" fontSize={1} text="Add a class" onClick={addOne} />
                  </Flex>
                  {sorted.length ? (
                    <Stack gap={2}>
                      <Text size={1}>{dated.length} class{dated.length === 1 ? '' : 'es'}{start ? `, ${longDate(start)} to ${longDate(end)}` : ''}</Text>
                      {sorted.map((c) => (
                        <div key={c._key} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,1.2fr) minmax(100px,1fr) minmax(100px,1fr) minmax(120px,1.4fr) auto', gap: 8, alignItems: 'center' }}>
                          <TextInput type="date" aria-label="Class date" value={c.date} onChange={setRow(c._key, 'date')} />
                          <Select aria-label="Starts" value={c.startTime} onChange={setRow(c._key, 'startTime')}>{timeOptions}</Select>
                          <Select aria-label="Ends" value={c.endTime} onChange={setRow(c._key, 'endTime')}>{timeOptions}</Select>
                          <TextInput aria-label="Note" placeholder="Note (optional)" value={c.note} onChange={setRow(c._key, 'note')} />
                          <Button mode="bleed" tone="critical" fontSize={1} text="Remove" onClick={() => setClasses((list) => list.filter((x) => x._key !== c._key))} />
                        </div>
                      ))}
                    </Stack>
                  ) : null}
                </Stack>
              </Card>
              <Field label="Spots (optional)" hint="When this many families have paid, the session switches to Full by itself."><TextInput inputMode="numeric" value={f.capacity} onChange={set('capacity')} /></Field>
            </>
          ) : (
            <Field label="Registration link (optional)" hint="Leave empty to use the Recreation program's Default Ollie link."><TextInput value={f.registerUrl} onChange={set('registerUrl')} placeholder="https://" /></Field>
          )}
          <Problems list={touched ? problems : []} />
        </Stack>
      </Box>
    </Dialog>
  );
}
