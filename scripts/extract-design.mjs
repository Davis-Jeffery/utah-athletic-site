#!/usr/bin/env node
// Unpacks a Claude Design export (the single bundled .html file) into readable source
// so design changes can be diffed and ported into src/.
//
// Usage: npm run design:extract -- path/to/export.html
//
// Writes (overwriting) into docs/design-reference/:
//   template.html     the page markup (x-dc template)
//   page-script.js    the page logic and content data
//   assets/           every embedded image, named by its id in the design where known
//   assets.json       uuid -> file name map
// Then run `git diff docs/design-reference` to see exactly what changed.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run design:extract -- path/to/export.html');
  process.exit(1);
}

const html = fs.readFileSync(src, 'utf8');
const grab = (type) => {
  const m = html.match(new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`));
  return m ? JSON.parse(m[1]) : null;
};

const manifest = grab('manifest');
const template = grab('template');
const ext = grab('ext_resources') || [];
if (!manifest || !template) {
  console.error('This does not look like a Claude Design bundled export (no manifest/template found).');
  process.exit(1);
}

const outDir = path.resolve('docs/design-reference');
const assetDir = path.join(outDir, 'assets');
fs.mkdirSync(assetDir, { recursive: true });

// Friendly names: ids the page script asks for (hero-rec, logo-ecnl...), else the uuid.
const named = Object.fromEntries(ext.map((e) => [e.uuid, e.id]));
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg', 'font/woff2': 'woff2', 'text/javascript': 'js' };

const map = {};
let scriptCount = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);
  const ext = EXT[entry.mime] || 'bin';
  // Skip runtime libraries (React, the design runtime): they are not design content.
  if (ext === 'js') { scriptCount++; continue; }
  const base = (named[uuid] || uuid).replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '_');
  const file = `${base}.${ext}`;
  fs.writeFileSync(path.join(assetDir, file), bytes);
  map[uuid] = file;
}

// Split the template into markup and the page script.
const scriptMatch = template.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
fs.writeFileSync(path.join(outDir, 'template.html'), template);
if (scriptMatch) fs.writeFileSync(path.join(outDir, 'page-script.js'), scriptMatch[1]);
fs.writeFileSync(path.join(outDir, 'assets.json'), JSON.stringify(map, null, 2) + '\n');

console.log(`Extracted ${Object.keys(map).length} assets (skipped ${scriptCount} runtime scripts) to ${path.relative(process.cwd(), outDir)}`);
console.log('Next: git diff docs/design-reference   (then port the changes, see docs/DESIGN-SYNC.md)');
