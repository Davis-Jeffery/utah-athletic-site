import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '03wnsd9x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Hosted at https://utah-athletic.sanity.studio after `npm run deploy`.
  studioHost: 'utah-athletic',
  deployment: { autoUpdates: true },
});
