// Site-wide settings: the main contact email, the header's Tryouts button, social links, the
// default share image, the logo and icon, and marketing tracking IDs. Content shared across pages is
// under Site-wide components (schemaTypes/components.ts). Each page's own content lives in its
// page document (schemaTypes/pages.ts), under Website pages in the sidebar.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { link, photo, str } from './helpers';
import { CONTACT_FIELDS, EVENTS_FIELDS, FUTURES_FIELDS, HOME_FIELDS, TRYOUTS_FIELDS } from './pages';
import { DEVELOPMENT_FIELD } from './components';

// Moved to the page documents. Kept here, hidden and without validation, until the old values are
// cleaned up, so the Studio doesn't flag them as unknown fields.
const RETIRED = [...HOME_FIELDS, ...TRYOUTS_FIELDS, ...EVENTS_FIELDS, ...CONTACT_FIELDS, ...FUTURES_FIELDS]
  .map((f) => ({ ...f, hidden: true, readOnly: true, validation: undefined }));

// An ID field with a format check. A warning, not an error, so a new ID format never blocks publishing.
const idField = (name: string, title: string, pattern: RegExp, example: string, where: string) =>
  defineField({
    name, title, type: 'string', description: `e.g. ${example}. Where to find it: ${where}`,
    validation: (r) => r.custom((v?: string) => !v || pattern.test(v.trim()) || `That doesn't look like a ${title.replace(/ \(.*\)/, '')} (e.g. ${example}).`).warning(),
  });

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'brand', title: 'Logo and icon' },
    { name: 'marketing', title: 'Marketing' },
  ],
  fields: [
    defineField({ name: 'mainEmail', title: 'Main contact email', type: 'email', group: 'general', description: 'Contact form messages go here, and anything for a region without leaders. Shown on the Contact page.', validation: (r) => r.required() }),
    str('tryoutsLabel', 'Header Tryouts button', { required: true, group: 'general', description: 'The button at the top of every page, e.g. "Tryouts 2027". Also the small heading on the Tryouts page.' }),
    defineField({
      name: 'social', title: 'Social links', type: 'array', group: 'general',
      of: [defineArrayMember({ type: 'object', name: 'socialLink', fields: [str('label', 'Network', { required: true }), link('href', 'Link', { required: true })], preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),
    defineField({
      name: 'logo', title: 'Logo', type: 'image', group: 'brand',
      description: 'The logo in the header of every page and at the top of every email. Use the light version (it sits on the dark header), with a transparent background: PNG or SVG, at least 400 pixels wide. Empty keeps the current logo.',
    }),
    defineField({
      name: 'favicon', title: 'Browser and home-screen icon (favicon)', type: 'image', group: 'brand', options: { hotspot: true },
      description: 'The small icon in browser tabs and on phone home screens. Upload a square image, at least 512 x 512 pixels, with a solid background (iPhones show transparent areas as black). Empty keeps the current icon.',
    }),
    // Marketing: tracking IDs. Each tool loads only once its ID is set; publishing rebuilds the site.
    defineField({
      name: 'marketing', title: 'Tracking and ads', type: 'object', group: 'marketing', options: { collapsible: false },
      description: 'Paste an ID and publish: the site starts using that tool within a few minutes. Leave a field empty to switch the tool off. The site reports these actions automatically: Futures payments, trial requests, register interest, contact messages and Register clicks to Ollie. No names or emails are ever sent.',
      fields: [
        idField('ga4', 'Google Analytics 4 ID', /^G-[A-Z0-9]{4,}$/, 'G-ABC123XYZ', 'Google Analytics, Admin, Data streams, your web stream: "Measurement ID".'),
        idField('metaPixel', 'Meta (Facebook) Pixel ID', /^\d{10,20}$/, '123456789012345', 'Meta Events Manager, Data sources: the number under your Pixel\'s name.'),
        idField('googleAds', 'Google Ads ID', /^AW-\d{6,}$/, 'AW-123456789', 'Google Ads, Goals, Conversions, a conversion action, Tag setup: the "AW-" ID.'),
        defineField({
          name: 'adsLabels', title: 'Google Ads conversion labels', type: 'object', options: { collapsible: true, collapsed: true },
          description: 'One per conversion action you create in Google Ads (Tag setup shows "AW-123456789/AbC-dEfGhIj": the label is the part after the slash). Leave any empty to skip it.',
          fields: [
            str('futures', 'Futures registration (paid)'),
            str('trial', 'Trial or invitation request'),
            str('interest', 'Register interest or registration request'),
            str('contact', 'Contact message'),
            str('ollie', 'Register click to Ollie'),
          ],
        }),
        idField('gtm', 'Google Tag Manager ID (optional)', /^GTM-[A-Z0-9]{4,}$/, 'GTM-ABC1234', 'Only if an agency manages your tags in Tag Manager. The site also sends its actions to Tag Manager as events (ua_purchase, ua_lead_trial, ua_lead_interest, ua_contact, ua_ollie).'),
      ],
    }),
    photo('shareImage', 'Default share image', { group: 'general', description: 'Shown when a page without its own share image is shared (texts, Facebook, iMessage). Landscape; cropped to 1200 x 630 around the hotspot. Until it\'s set, a club photo from the home collage is used.' }),

    // Moved to Site-wide components > Development model. Hidden until the old values are cleaned up.
    { ...DEVELOPMENT_FIELD, group: undefined, hidden: true, readOnly: true, validation: undefined },
    ...RETIRED,
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
