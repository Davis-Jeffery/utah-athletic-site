// Utah Athletic content Studio. Editors change content here; publishing rebuilds the live site.
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { UsersIcon } from '@sanity/icons/Users';
import { structure, FIXED_TYPES, SITE_CREATED_TYPES, TRYOUT_TEMPLATES, WAIVER_TEMPLATES } from './structure';
import { Registrations } from './tools/Registrations';
import { StartHere } from './tools/StartHere';
import { Pricing } from './tools/Pricing';
import { TagIcon } from '@sanity/icons/Tag';
import { HomeIcon } from '@sanity/icons/Home';

export default defineConfig({
  name: 'default',
  title: 'Utah Athletic',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '03wnsd9x',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({ structure }),
    // GROQ playground for developers; only administrators see it (tools below).
    visionTool(),
  ],

  // Registrations: players by age group and gender, with group emails (tools/Registrations.tsx).
  // Pricing: every price on the site in one place (tools/Pricing.tsx).
  // Vision is a developer tool, so editors don't see it.
  tools: (prev, { currentUser }) => {
    const admin = currentUser?.roles.some((r) => r.name === 'administrator');
    // "Start here" comes first, so the Studio opens on it (tools/StartHere.tsx).
    return [{ name: 'start', title: 'Start here', icon: HomeIcon, component: StartHere }, ...prev.filter((t) => admin || t.name !== 'vision'), { name: 'registrations', title: 'Registrations', icon: UsersIcon, component: Registrations }, { name: 'pricing', title: 'Pricing', icon: TagIcon, component: Pricing }];
  },

  schema: {
    types: schemaTypes,
    // Programs, regions and site settings are fixed documents: never offer "create new".
    // Submissions and Futures registrations are created only by the site's forms.
    // Academy and Club tryout lists start new tryouts with their program filled in (structure.ts).
    templates: (templates) => [...templates.filter((t) => !FIXED_TYPES.has(t.schemaType) && !SITE_CREATED_TYPES.has(t.schemaType)), ...TRYOUT_TEMPLATES, ...WAIVER_TEMPLATES],
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
