#!/usr/bin/env node
// Builds src/data/world-geo.json for the Athletic Network map: country outlines as GeoJSON,
// cut from the world-atlas countries-110m TopoJSON (Natural Earth). Antarctica is dropped.
// Run once (or after upgrading world-atlas): npm run geo:build
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';

const require = createRequire(import.meta.url);
const world = require('world-atlas/countries-110m.json');

const round = (g) => JSON.parse(JSON.stringify(g, (k, v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)));
const countries = feature(world, world.objects.countries).features
  .filter((f) => f.id !== '010')
  .map((f) => round({ type: 'Feature', id: String(f.id), properties: {}, geometry: f.geometry }));
const out = { source: 'Natural Earth via world-atlas@2 countries-110m', countries };
fs.writeFileSync('src/data/world-geo.json', JSON.stringify(out));
console.log(`Wrote src/data/world-geo.json: ${countries.length} countries, ${(fs.statSync('src/data/world-geo.json').size / 1024).toFixed(0)} KB`);
