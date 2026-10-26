// A place found with the Studio's place search (studio/components/PlaceSearch.tsx): its name,
// address, exact spot and (from Google) its place id. Venues, tournaments and map pins can have
// one. The site turns any location into a directions link with `directions` below.

export type Place = { name?: string; address?: string; location?: { lat: number; lng: number }; placeId?: string };

/**
 * Directions to a place in Google Maps. On iPhones, iPads and Macs, a click on one of these links
 * opens Apple Maps to the same destination instead (src/layouts/Base.astro). With an exact spot
 * the directions go straight there; without one they search for the name and address, like typing
 * them into the maps app.
 */
export function directions(p: Place): { href: string } {
  const text = [p.name, p.address].filter(Boolean).join(', ');
  const at = p.location ? `${p.location.lat},${p.location.lng}` : '';
  const q = new URLSearchParams({ api: '1', destination: at || text });
  if (at && p.placeId) q.set('destination_place_id', p.placeId);
  return { href: `https://www.google.com/maps/dir/?${q}` };
}
