import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { readFileSync, writeFileSync } from 'node:fs';

// Security headers on every response, pages and API alike. The Vercel adapter writes its own routing
// config (.vercel/output/config.json) and ignores vercel.json headers, so they're added to it after
// the build: no framing (clickjacking), no MIME sniffing, a tight referrer and no device permissions.
const SECURITY_HEADERS = {
  'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};
const securityHeaders = {
  name: 'security-headers',
  hooks: {
    'astro:build:done': () => {
      const file = new URL('./.vercel/output/config.json', import.meta.url);
      let config;
      try { config = JSON.parse(readFileSync(file, 'utf8')); } catch { return; } // not a Vercel build
      config.routes = [{ src: '/(.*)', headers: SECURITY_HEADERS, continue: true }, ...config.routes.filter((r) => !r.headers?.['X-Frame-Options'])];
      writeFileSync(file, JSON.stringify(config, null, 2));
    },
  },
};

export default defineConfig({
  // The live domain: canonical links, link previews, the sitemap and structured data all use it.
  site: process.env.SITE_URL || 'https://utathletic.com',
  trailingSlash: 'always',
  integrations: [react(), securityHeaders],
  // Pages stay static. Only the form and payment routes in src/pages/api/ run on the server.
  adapter: vercel(),
  // Same check, done in src/middleware.ts so the Studio can call /api/broadcast/.
  security: { checkOrigin: false },
  // Program pages moved from /programs/<key>/ to /<key>/.
  redirects: {
    '/programs/academy': '/academy/',
    '/programs/club': '/club/',
    '/programs/rec': '/rec/',
    '/programs/futures': '/futures/',
  },
});
