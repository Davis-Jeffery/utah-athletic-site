// Training locations shown on each program's "Where we train" map.
// Edit hubs and cities here. ll = [longitude, latitude].
// side: which side of the pin the label sits on (1 = right, -1 = left).
//
// Cities are assigned to their nearest hub automatically. Replace with the club's
// official city-to-hub assignment when it exists (add a `hub` id to a city to pin it).

export interface Hub {
  id: string;
  label: string;
  city: string;
  ll: [number, number];
  side: 1 | -1;
}

export const HUBS: Record<'academy' | 'club' | 'rec' | 'futures', Hub[]> = {
  academy: [
    { id: 'north', label: 'North Academy', city: 'Murray', ll: [-111.8879, 40.6669], side: 1 },
    { id: 'south', label: 'South Academy', city: 'Orem', ll: [-111.6946, 40.2969], side: 1 },
  ],
  club: [
    { id: 'north', label: 'North Club', city: 'Draper / Sandy', ll: [-111.851, 40.545], side: 1 },
    { id: 'west', label: 'West Club', city: 'Saratoga Springs', ll: [-111.9047, 40.3491], side: -1 },
    { id: 'south', label: 'South Club', city: 'Orem', ll: [-111.6946, 40.2969], side: 1 },
  ],
  rec: [{ id: 'hub', label: 'Primary Hub', city: 'Saratoga Springs / Lehi', ll: [-111.878, 40.372], side: 1 }],
  futures: [{ id: 'hub', label: 'Futures Hub', city: 'Saratoga Springs / Lehi', ll: [-111.878, 40.372], side: 1 }],
};

// Label for the city search box, per program (rec and futures don't hold tryouts).
export const FIND_LABEL: Record<string, string> = {
  academy: 'Find your tryout location',
  club: 'Find your tryout location',
  rec: 'Find your nearest field',
  futures: 'Find your nearest field',
};

// Zone colors, in hub order (teal ramp).
export const HUB_TONES = ['#78b7b3', '#d6f0ee', '#4f8a86'];

// Wasatch Front counties shaded as service zones (FIPS codes).
export const SERVICE_COUNTIES = ['49057', '49029', '49011', '49035', '49045', '49043', '49051', '49049'];

// Cities in the search box and on the map (name, lon, lat).
export const CITIES: [string, number, number][] = [
  ['Ogden', -111.9738, 41.223], ['Layton', -111.9711, 41.0602], ['Clearfield', -112.0261, 41.1108],
  ['Syracuse', -112.0647, 41.0894], ['Kaysville', -111.9386, 41.0352], ['Farmington', -111.8874, 40.9805],
  ['Centerville', -111.8722, 40.918], ['Bountiful', -111.8808, 40.8894], ['North Salt Lake', -111.9069, 40.8486],
  ['Salt Lake City', -111.891, 40.7608], ['Magna', -112.1016, 40.7091], ['West Valley City', -112.0011, 40.6916],
  ['Millcreek', -111.8755, 40.6869], ['Holladay', -111.8247, 40.6688], ['Taylorsville', -111.9388, 40.6677],
  ['Murray', -111.8879, 40.6669], ['Kearns', -111.9963, 40.66], ['Park City', -111.498, 40.6461],
  ['Cottonwood Heights', -111.8102, 40.6197], ['Midvale', -111.8999, 40.6111], ['West Jordan', -111.9391, 40.6097],
  ['Sandy', -111.8389, 40.5649], ['South Jordan', -111.9297, 40.5622], ['Tooele', -112.2983, 40.5308],
  ['Draper', -111.8638, 40.5247], ['Riverton', -111.9391, 40.5219], ['Herriman', -112.033, 40.5141],
  ['Heber City', -111.4132, 40.507], ['Bluffdale', -111.9388, 40.4897], ['Alpine', -111.7777, 40.4533],
  ['Highland', -111.7949, 40.4252], ['Cedar Hills', -111.7585, 40.4141], ['Lehi', -111.8508, 40.3916],
  ['American Fork', -111.7958, 40.3769], ['Pleasant Grove', -111.7385, 40.3641], ['Saratoga Springs', -111.9047, 40.3491],
  ['Lindon', -111.7208, 40.3433], ['Eagle Mountain', -112.0069, 40.3141], ['Vineyard', -111.7469, 40.2972],
  ['Orem', -111.6946, 40.2969], ['Provo', -111.6585, 40.2338], ['Springville', -111.6107, 40.1652],
  ['Mapleton', -111.5785, 40.1302], ['Spanish Fork', -111.6549, 40.1149], ['Payson', -111.732, 40.0444],
];

// Reference towns shown for orientation only (not served).
export const REFERENCE_TOWNS: [string, number, number][] = [
  ['Logan', -111.8338, 41.737], ['Moab', -109.5498, 38.5733], ['St. George', -113.5684, 37.0965], ['Cedar City', -113.0619, 37.6775],
];
