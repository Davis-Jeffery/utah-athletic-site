// Utah Athletic content Studio. Editors change content here; publishing rebuilds the live site.
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { structure, FIXED_TYPES } from './structure';

export default defineConfig({
  name: 'default',
  title: 'Utah Athletic',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure }),
    // GROQ playground for developers. Hidden from editors by role in production use.
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Programs, regions and site settings are fixed documents: never offer "create new".
    templates: (templates) => templates.filter((t) => !FIXED_TYPES.has(t.schemaType)),
  },

  document: {
    // Fixed documents can be edited and published, but not deleted, duplicated or unpublished.
    actions: (actions, { schemaType }) =>
      FIXED_TYPES.has(schemaType)
        ? actions.filter((a) => ['publish', 'discardChanges', 'restore'].includes(a.action ?? ''))
        : actions,
    newDocumentOptions: (items) => items.filter((i) => !FIXED_TYPES.has(i.templateId)),
  },
});
