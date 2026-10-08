#!/usr/bin/env node
// Unpacks a Claude Design export into readable source so design changes can be diffed
// and ported into src/.
//
// Usage: npm run design:extract -- <export>
//   <export> can be:
//     - a design handoff .zip (or its unzipped folder) containing a *.dc.html file
//     - a single bundled standalone .html file (as published to an artifact link)
//
// Writes (overwriting) into docs/design-reference/:
//   template.html        the page markup (x-dc template)
//   page-script.js       the page logic and content data
//   extra/               other prototype pages (e.g. Utah Map.html), README, tokens css
//   assets/              images (git-ignored; regenerate any time)
// Then run `git diff docs/design-reference` to see exactly what changed.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const input = process.argv[2];
if (!input) {
  console.error('Usage: npm run design:extract -- <handoff.zip | handoff-folder | export.html>');
  process.exit(1);
}

const outDir = path.resolve('docs/design-reference');
const assetDir = path.join(outDir, 'assets');
const extraDir = path.join(outDir, 'extra');
fs.mkdirSync(assetDir, { recursive: true });

const splitScript = (template) => {
  const m = template.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/);
  fs.writeFileSync(path.join(outDir, 'template.html'), template);
  if (m) fs.writeFileSync(path.join(outDir, 'page-script.js'), m[1]);
};

function fromHandoff(dir) {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  const files = walk(dir);
  // Several pages can ship as .dc.html; the programs page is the main one.
  const dcs = files.filter((f) => f.endsWith('.dc.html'));
  const main = dcs.find((f) => /Programs\.dc\.html$/.test(f)) || dcs[0];
  if (!main) throw new Error('No *.dc.html file found in the handoff.');
  const root = path.dirname(main);
  splitScript(fs.readFileSync(main, 'utf8'));
  fs.mkdirSync(extraDir, { recursive: true });
  let assets = 0;
  for (const f of files) {
    const rel = path.relative(root, f);
    if (f === main || /^(support|image-slot)\.js$/.test(rel)) continue; // design runtime, not content
    if (rel.startsWith('assets' + path.sep)) {
      fs.copyFileSync(f, path.join(assetDir, path.basename(f)));
      assets++;
    } else {
      fs.mkdirSync(path.dirname(path.join(extraDir, rel)), { recursive: true });
      fs.copyFileSync(f, path.join(extraDir, rel));
    }
  }
  console.log(`Extracted handoff: ${path.basename(main)}, ${assets} assets, extras in docs/design-reference/extra`);
}

function fromBundle(file) {
  const html = fs.readFileSync(file, 'utf8');
  const grab = (type) => {
    const m = html.match(new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`));
    return m ? JSON.parse(m[1]) : null;
  };
  const manifest = grab('manifest');
  const template = grab('template');
  if (!manifest || !template) throw new Error('Not a Claude Design bundled export (no manifest/template).');
  const named = Object.fromEntries((grab('ext_resources') || []).map((e) => [e.uuid, e.id]));
  const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg', 'font/woff2': 'woff2' };
  let n = 0;
  for (const [uuid, entry] of Object.entries(manifest)) {
    const ext = EXT[entry.mime];
    if (!ext) continue; // runtime scripts
    let bytes = Buffer.from(entry.data, 'base64');
    if (entry.compressed) bytes = zlib.gunzipSync(bytes);
    const base = (named[uuid] || uuid).replace(/^https?:\/\//, '').replace(/[^\w.-]+/g, '_');
    fs.writeFileSync(path.join(assetDir, `${base}.${ext}`), bytes);
    n++;
  }
  splitScript(template);
  console.log(`Extracted bundled export: ${n} assets`);
}

const stat = fs.statSync(input);
if (stat.isDirectory()) {
  fromHandoff(input);
} else if (input.endsWith('.zip')) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'design-'));
  try { execFileSync('unzip', ['-q', input, '-d', tmp]); } catch { execFileSync('tar', ['-xf', input, '-C', tmp]); }
  fromHandoff(tmp);
  fs.rmSync(tmp, { recursive: true, force: true });
} else {
  fromBundle(input);
}
console.log('Next: git diff docs/design-reference   (then port the changes, see docs/DESIGN-SYNC.md)');
