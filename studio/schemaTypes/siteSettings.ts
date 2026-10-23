// Site-wide settings: the main contact email, the header's Tryouts button, social links, the
// default share image and the shared Development model text. Each page's own content lives in its
// page document (schemaTypes/pages.ts), under Website pages in the sidebar.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { link, photo, str, txt } from './helpers';
import { CONTACT_FIELDS, EVENTS_FIELDS, FUTURES_FIELDS, HOME_FIELDS, TRYOUTS_FIELDS } from './pages';

const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

// Moved to the page documents. Kept here, hidden and without validation, until the old values are
// cleaned up, so the Studio doesn't flag them as unknown fields.
const RETIRED = [...HOME_FIELDS, ...TRYOUTS_FIELDS, ...EVENTS_FIELDS, ...CONTACT_FIELDS, ...FUTURES_FIELDS]
  .map((f) => ({ ...f, hidden: true, readOnly: true, validation: undefined }));

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'dev', title: 'Development model (shared)' },
  ],
  fields: [
    defineField({ name: 'mainEmail', title: 'Main contact email', type: 'email', group: 'general', description: 'Contact form messages go here, and anything for a region without leaders. Shown on the Contact page.', validation: (r) => r.required() }),
    str('tryoutsLabel', 'Header Tryouts button', { required: true, group: 'general', description: 'The button at the top of every page, e.g. "Tryouts 2027". Also the small heading on the Tryouts page.' }),
    defineField({
      name: 'social', title: 'Social links', type: 'array', group: 'general',
      of: [defineArrayMember({ type: 'object', name: 'socialLink', fields: [str('label', 'Network', { required: true }), link('href', 'Link', { required: true })], preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),
    photo('shareImage', 'Default share image', { group: 'general', description: 'Shown when a page without its own share image is shared (texts, Facebook, iMessage). Landscape; cropped to 1200 x 630 around the hotspot. Until it\'s set, a club photo from the home collage is used.' }),

    defineField({
      name: 'development', title: 'Development model (shared by all programs)', type: 'object', group: 'dev',
      description: 'The default text for the "We develop the complete player" section and each pillar\'s pop-up. A program can replace any of it on its own Development model.',
      fields: [
        str('heading', 'Heading', { description: 'e.g. "We develop the".' }),
        str('headingAccent', 'Heading, teal part', { description: 'e.g. "complete player."' }),
        txt('intro', 'Intro', { rows: 2 }),
        ...PILLARS.map(([k, t]) =>
        defineField({
          name: k, title: t, type: 'object',
          fields: [str('tag', 'Label', { required: true, description: 'Small label next to the name, e.g. "The foundation".' }), txt('deep', 'Detail', { required: true, description: 'The paragraph in the pop-up.' }), defineField({ name: 'focus', title: 'Focus areas', type: 'array', of: [{ type: 'string' }], description: 'The list in the pop-up.' })],
        }),
      ),
      ],
    }),
    ...RETIRED,
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
