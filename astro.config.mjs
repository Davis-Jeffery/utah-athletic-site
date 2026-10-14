import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://utathletic-club.com',
  trailingSlash: 'always',
  integrations: [react()],
  // Pages stay static. Only the form and payment routes in src/pages/api/ run on the server.
  adapter: vercel(),
  // Program pages moved from /programs/<key>/ to /<key>/.
  redirects: {
    '/programs/academy': '/academy/',
    '/programs/club': '/club/',
    '/programs/rec': '/rec/',
    '/programs/futures': '/futures/',
  },
});
