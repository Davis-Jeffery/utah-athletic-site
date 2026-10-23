// The Athletic Global network page (/network/). One fixed document. The map's club locations
// and the page layout stay in code; everything families read is here.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { EarthAmericasIcon } from '@sanity/icons/EarthAmericas';
import { headingPair, photo, placeholderNote, section, str, txt, seo } from './helpers';

export const networkPage = defineType({
  name: 'networkPage',
  title: 'Network page',
  type: 'document',
  icon: EarthAmericasIcon,
  groups: [
    { name: 'top', title: 'Top of page', default: true },
    { name: 'network', title: 'The network' },
    { name: 'means', title: 'What it means' },
    { name: 'club', title: 'Professional club' },
    { name: 'end', title: 'Bottom of page' },
  ],
  fields: [
    seo('seo', 'top'),
    section('hero', 'Hero', 'top', [
      str('kicker', 'Small heading', { required: true }),
      ...headingPair(),
      txt('intro', 'Intro', { required: true, rows: 3 }),
      placeholderNote(),
    ]),

    section('network', 'What exists, and what\'s being built', 'network', [
      str('kicker', 'Small heading', { required: true, description: 'e.g. "01 · The network".' }),
      str('heading', 'Heading', { required: true }),
      defineField({
        name: 'clubs', title: 'Clubs today', type: 'array', description: 'Solid cards beside the map.',
        of: [defineArrayMember({
          type: 'object', name: 'networkClub',
          fields: [str('tag', 'Tag', { required: true, description: 'e.g. "Today · Academy".' }), str('name', 'Name', { required: true }), str('details', 'Details', { required: true })],
          preview: { select: { title: 'name', subtitle: 'tag' } },
        })],
      }),
      defineField({
        name: 'affiliates', title: 'Affiliate academies in development', type: 'array', description: 'Dashed cards under the clubs. Add or remove as plans change.',
        of: [defineArrayMember({
          type: 'object', name: 'affiliate',
          fields: [str('name', 'Name', { required: true }), str('details', 'Details', { required: true, description: 'e.g. "Location to be announced".' })],
          preview: { select: { title: 'name', subtitle: 'details' } },
        })],
      }),
    ]),

    section('means', 'What the network means', 'means', [
      str('kicker', 'Small heading', { required: true }),
      str('heading', 'Heading', { required: true }),
      defineField({
        name: 'cards', title: 'Cards', type: 'array', description: 'Numbered 01, 02, 03 in this order.',
        of: [defineArrayMember({
          type: 'object', name: 'meansCard',
          fields: [str('title', 'Title', { required: true }), txt('body', 'Text', { required: true, rows: 3 })],
          preview: { select: { title: 'title', subtitle: 'body' } },
        })],
      }),
      placeholderNote(),
    ]),

    section('club', 'Professional club', 'club', [
      str('kicker', 'Small heading', { required: true }),
      str('heading', 'Heading', { required: true }),
      str('name', 'Club name', { required: true, description: 'Next to the crest.' }),
      str('location', 'Location', { required: true }),
      photo('crest', 'Crest', { description: 'Optional. A dashed circle shows until one is uploaded.' }),
      defineField({
        name: 'facts', title: 'Facts', type: 'array', description: 'The small grid, e.g. City, Status, League.',
        of: [defineArrayMember({
          type: 'object', name: 'fact',
          fields: [
            str('label', 'Label', { required: true }),
            str('value', 'Value', { required: true, description: 'Shown dimmed while it reads "To be supplied".' }),
            defineField({ name: 'dot', title: 'Show a green status dot', type: 'boolean', initialValue: false }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        })],
      }),
      txt('description', 'Description', { required: true, rows: 3 }),
      placeholderNote(),
      photo('photo', 'Photo', { description: 'Optional. A striped box shows until one is uploaded.' }),
    ]),

    section('closing', 'Closing call to action', 'end', [
      str('kicker', 'Small heading', { required: true }),
      str('heading', 'Heading', { required: true }),
      str('button', 'Button label', { required: true, description: 'Goes to the programs on the home page. The arrow is added for you.' }),
    ]),
  ],
  preview: { prepare: () => ({ title: 'Network page' }) },
});
