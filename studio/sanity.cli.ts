import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '03wnsd9x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Hosted at https://utah-athletic.sanity.studio after `npm run deploy`.
  studioHost: 'utah-athletic',
  deployment: { appId: 'v0gp9377s7b33fnloay48x5m', autoUpdates: true },
});
