// Utah Athletic content Studio. Editors change content here; publishing rebuilds the live site.
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { UsersIcon } from '@sanity/icons/Users';
import { structure, FIXED_TYPES, SITE_CREATED_TYPES } from './structure';
import { Registrations } from './tools/Registrations';

export default defineConfig({
  name: 'default',
  title: 'Utah Athletic',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '03wnsd9x',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure }),
    // GROQ playground for developers. Hidden from editors by role in production use.
    visionTool(),
  ],

  // Registrations: players by age group and gender, with group emails (tools/Registrations.tsx).
  tools: (prev) => [...prev, { name: 'registrations', title: 'Registrations', icon: UsersIcon, component: Registrations }],

  schema: {
    types: schemaTypes,
    // Programs, regions and site settings are fixed documents: never offer "create new".
    // Submissions and Futures registrations are created only by the site's forms.
    templates: (templates) => templates.filter((t) => !FIXED_TYPES.has(t.schemaType) && !SITE_CREATED_TYPES.has(t.schemaType)),
  },

  document: {
    // Fixed documents can be edited and published, but not deleted, duplicated or unpublished.
    // Submissions can be deleted (spam); Futures registrations are payment records and can't.
    actions: (actions, { schemaType }) =>
      FIXED_TYPES.has(schemaType)
        ? actions.filter((a) => ['publish', 'discardChanges', 'restore'].includes(a.action ?? ''))
        : schemaType === 'submission' ? actions.filter((a) => a.action === 'delete')
          : schemaType === 'futuresRegistration' || schemaType === 'emailBroadcast' ? []
            : actions,
    newDocumentOptions: (items) => items.filter((i) => !FIXED_TYPES.has(i.templateId) && !SITE_CREATED_TYPES.has(i.templateId)),
  },
});
