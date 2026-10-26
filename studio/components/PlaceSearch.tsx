// Search for a real place by name or address and pick one: a field, park, school or city. Uses
// Google Places when SANITY_STUDIO_GOOGLE_MAPS_KEY is set (Maps JavaScript API + Places API (New),
// key restricted to the Studio's address), else OpenStreetMap (Photon), which needs no key.
// Results lean toward Utah.
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, Spinner, Stack, Text, TextInput } from '@sanity/ui';
import { SearchIcon } from '@sanity/icons/Search';
import type { Place } from '../shared/places';

const KEY = process.env.SANITY_STUDIO_GOOGLE_MAPS_KEY || '';
const UTAH = { lat: 40.6, lng: -111.9 };
type Hit = { id: string; title: string; subtitle: string; pick: () => Promise<Place> };

// ---------- Google ----------

let googleReady: Promise<any> | null = null;
function loadGoogle(): Promise<any> {
  googleReady ??= new Promise((resolve, reject) => {
    const w = window as any;
    if (w.google?.maps?.importLibrary) { resolve(w.google.maps); return; }
    w.__uaMapsLoaded = () => resolve(w.google.maps);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&v=weekly&loading=async&callback=__uaMapsLoaded`;
    s.async = true;
    s.onerror = () => { googleReady = null; reject(new Error('Google Maps didn\'t load. Check the API key.')); };
    document.head.appendChild(s);
  });
  return googleReady;
}

async function searchGoogle(q: string, token: { current: any }): Promise<Hit[]> {
  const maps = await loadGoogle();
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await maps.importLibrary('places');
  token.current ??= new AutocompleteSessionToken();
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: q, sessionToken: token.current, includedRegionCodes: ['us'], locationBias: { center: UTAH, radius: 50000 },
  });
  return suggestions.flatMap((s: any) => {
    const p = s.placePrediction;
    if (!p) return [];
    return [{
      id: p.placeId, title: p.mainText?.text ?? p.text.text, subtitle: p.secondaryText?.text ?? '',
      pick: async () => {
        const place = p.toPlace();
        await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
        token.current = null; // a session ends when a place is picked
        return { name: place.displayName ?? p.mainText?.text, address: place.formattedAddress, location: { lat: place.location.lat(), lng: place.location.lng() }, placeId: p.placeId };
      },
    }];
  });
}

// ---------- OpenStreetMap (no key) ----------

async function searchOsm(q: string, signal: AbortSignal): Promise<Hit[]> {
  const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lat=${UTAH.lat}&lon=${UTAH.lng}&lang=en`, { signal });
  if (!r.ok) throw new Error('The place search isn\'t answering. Try again in a moment.');
  const { features } = await r.json();
  return (features ?? []).map((f: any) => {
    const p = f.properties ?? {};
    const street = [p.housenumber, p.street].filter(Boolean).join(' ');
    const name = p.name || street || p.city;
    const address = [street !== name ? street : '', p.city !== name ? p.city : '', [p.state, p.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    const [lng, lat] = f.geometry.coordinates;
    return { id: `${p.osm_type}${p.osm_id}`, title: name, subtitle: address, pick: async () => ({ name, address, location: { lat, lng } }) };
  });
}

// ---------- the search box ----------

export function PlaceSearch({ onPick, placeholder = 'Search for a field, park, school, address or city' }: { onPick: (p: Place) => void; placeholder?: string }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const token = useRef<any>(null);

  // Searches a moment after typing stops.
  useEffect(() => {
    if (q.trim().length < 3) { setHits([]); setError(''); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true); setError('');
      try { setHits(await (KEY ? searchGoogle(q.trim(), token) : searchOsm(q.trim(), ctl.signal))); }
      catch (e) { if (!ctl.signal.aborted) { setHits([]); setError((e as Error).message); } }
      finally { if (!ctl.signal.aborted) setBusy(false); }
    }, 350);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const pick = async (h: Hit) => {
    setBusy(true);
    try { onPick(await h.pick()); setQ(''); setHits([]); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <Stack gap={2}>
      <TextInput icon={SearchIcon} iconRight={busy ? <Spinner muted /> : undefined} value={q} placeholder={placeholder} onChange={(e) => setQ(e.currentTarget.value)} />
      {hits.length ? (
        <Card radius={2} border>
          {hits.map((h) => (
            <Button key={h.id} mode="bleed" style={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: 0 }} onClick={() => pick(h)}
              text={<Stack gap={2} padding={1}><Text size={1} weight="medium">{h.title}</Text>{h.subtitle ? <Text size={1} muted>{h.subtitle}</Text> : null}</Stack>} />
          ))}
        </Card>
      ) : null}
      {error ? <Text size={1} style={{ color: 'var(--card-badge-critical-fg-color, #c00)' }}>{error}</Text> : null}
      {!KEY ? <Text size={0} muted>Searching OpenStreetMap. Google search switches on when a Google Maps key is added.</Text> : null}
    </Stack>
  );
}

/** A small map of the spot, from OpenStreetMap (no key needed). */
export function PlacePreview({ place }: { place: Place }) {
  if (!place.location) return null;
  const { lat, lng } = place.location;
  const d = 0.006;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d / 1.6},${lng + d},${lat + d / 1.6}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <Box style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid var(--card-border-color)' }}>
      <iframe title="Map of the place" src={src} style={{ display: 'block', width: '100%', height: 180, border: 0 }} loading="lazy" />
    </Box>
  );
}

export const placeLine = (p?: Place) => (p ? [p.name, p.address].filter(Boolean).join(', ') : '');
