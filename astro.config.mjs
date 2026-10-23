import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // The live domain: canonical links, link previews, the sitemap and structured data all use it.
  site: process.env.SITE_URL || 'https://utathletic.com',
  trailingSlash: 'always',
  integrations: [react()],
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
