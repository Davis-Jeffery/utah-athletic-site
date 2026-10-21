// Towns the site's location maps know: the city search box, and the towns a map pin can be
// placed in (Programs > Map pins). [name, longitude, latitude]. Used by the website too
// (src/data/locations.ts), so add a town here and both pick it up.
export const TOWNS: [string, number, number][] = [
  ['Ogden', -111.9738, 41.223], ['Layton', -111.9711, 41.0602], ['Clearfield', -112.0261, 41.1108],
  ['Syracuse', -112.0647, 41.0894], ['Kaysville', -111.9386, 41.0352], ['Farmington', -111.8874, 40.9805],
  ['Centerville', -111.8722, 40.918], ['Bountiful', -111.8808, 40.8894], ['North Salt Lake', -111.9069, 40.8486],
  ['Salt Lake City', -111.891, 40.7608], ['Magna', -112.1016, 40.7091], ['West Valley City', -112.0011, 40.6916],
  ['Millcreek', -111.8755, 40.6869], ['Holladay', -111.8247, 40.6688], ['Taylorsville', -111.9388, 40.6677],
  ['Murray', -111.8879, 40.6669], ['Kearns', -111.9963, 40.66], ['Park City', -111.498, 40.6461],
  ['Cottonwood Heights', -111.8102, 40.6197], ['Midvale', -111.8999, 40.6111], ['West Jordan', -111.9391, 40.6097],
  ['Sandy', -111.8389, 40.5649], ['South Jordan', -111.9297, 40.5622], ['Tooele', -112.2983, 40.5308], ['Stansbury Park', -112.2966, 40.6377],
  ['Draper', -111.8638, 40.5247], ['Riverton', -111.9391, 40.5219], ['Herriman', -112.033, 40.5141],
  ['Heber City', -111.4132, 40.507], ['Bluffdale', -111.9388, 40.4897], ['Alpine', -111.7777, 40.4533],
  ['Highland', -111.7949, 40.4252], ['Cedar Hills', -111.7585, 40.4141], ['Lehi', -111.8508, 40.3916],
  ['American Fork', -111.7958, 40.3769], ['Pleasant Grove', -111.7385, 40.3641], ['Saratoga Springs', -111.9047, 40.3491],
  ['Lindon', -111.7208, 40.3433], ['Eagle Mountain', -112.0069, 40.3141], ['Vineyard', -111.7469, 40.2972],
  ['Orem', -111.6946, 40.2969], ['Provo', -111.6585, 40.2338], ['Springville', -111.6107, 40.1652],
  ['Mapleton', -111.5785, 40.1302], ['Spanish Fork', -111.6549, 40.1149], ['Payson', -111.732, 40.0444],
];

export const TOWN_OPTIONS = [...TOWNS].sort((a, b) => a[0].localeCompare(b[0])).map(([name]) => ({ title: name, value: name }));
