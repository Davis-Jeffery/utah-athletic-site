import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://utathletic-club.com',
  trailingSlash: 'always',
  integrations: [react()],
  // Program pages moved from /programs/<key>/ to /<key>/.
  redirects: {
    '/programs/academy': '/academy/',
    '/programs/club': '/club/',
    '/programs/rec': '/rec/',
    '/programs/futures': '/futures/',
  },
});
