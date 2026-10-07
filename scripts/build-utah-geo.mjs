#!/usr/bin/env node
// Builds src/data/utah-geo.json: Utah, its counties and the neighboring states as GeoJSON,
// cut from the us-atlas counties-10m TopoJSON (U.S. Census Bureau).
// Run once (or after upgrading us-atlas): npm run geo:build
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const us = require('us-atlas/counties-10m.json');

const NEIGHBORS = ['16', '32', '04', '08', '56', '35']; // ID, NV, AZ, CO, WY, NM
const round = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v)));
const slim = (f) => round({ type: 'Feature', id: String(f.id), properties: { name: f.properties.name }, geometry: f.geometry });

const states = feature(us, us.objects.states).features;
const out = {
  source: 'U.S. Census Bureau via us-atlas@3 counties-10m',
  utah: slim(states.find((f) => f.id === '49')),
  neighbors: states.filter((f) => NEIGHBORS.includes(f.id)).map(slim),
  counties: feature(us, us.objects.counties).features.filter((f) => String(f.id).startsWith('49')).map(slim),
};
fs.writeFileSync('src/data/utah-geo.json', JSON.stringify(out));
console.log(`Wrote src/data/utah-geo.json: ${out.counties.length} counties, ${out.neighbors.length} neighbor states, ${(fs.statSync('src/data/utah-geo.json').size / 1024).toFixed(0)} KB`);
