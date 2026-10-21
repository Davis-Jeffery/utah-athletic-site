// Map data for each program's "Choose your region" map. The pins themselves are edited in the
// Studio (Programs > Map pins) and placed at a town from the list below. ll = [longitude, latitude].
//
// Cities are assigned to their nearest pin automatically. Replace with the club's official
// city-to-hub assignment when it exists.

// Label for the city search box, per program (rec and futures don't hold tryouts).
export const FIND_LABEL: Record<string, string> = {
  academy: 'Find your tryout location',
  club: 'Find your tryout location',
  rec: 'Find your nearest field',
  futures: 'Find your nearest field',
};

// Zone colors, one per hub label in order (teal ramp); hubs sharing a label share a color.
export const HUB_TONES = ['#78b7b3', '#d6f0ee', '#4f8a86'];

// Wasatch Front counties shaded as service zones (FIPS codes).
export const SERVICE_COUNTIES = ['49057', '49029', '49011', '49035', '49045', '49043', '49051', '49049'];

// Cities in the search box and on the map (name, lon, lat). The list lives with the Studio's
// schemas so editors can pick a pin's town from it (Programs > Map pins).
export { TOWNS as CITIES } from '../../studio/schemaTypes/towns';

// Reference towns shown for orientation only (not served).
export const REFERENCE_TOWNS: [string, number, number][] = [
  ['Logan', -111.8338, 41.737], ['Moab', -109.5498, 38.5733], ['St. George', -113.5684, 37.0965], ['Cedar City', -113.0619, 37.6775],
];
