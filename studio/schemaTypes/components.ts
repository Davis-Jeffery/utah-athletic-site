// Site-wide components: content shown in several places on the site, edited once here
// (Studio sidebar > Site-wide components). Each is a fixed document; the site lays its fields over
// Site settings when it builds (src/lib/sanity.ts), so field names match the ones used before.
import { defineField, defineType } from 'sanity';
import { BlockElementIcon } from '@sanity/icons/BlockElement';
import { str, txt } from './helpers';
import { DEV_PROGRAMS } from '../shared/sections';

const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

// The development model ("We develop the complete player") on every program page.
export const DEVELOPMENT_FIELD = defineField({
  name: 'development', title: 'Development model', type: 'object',
  description: 'The shared text for the "We develop the complete player" section and each pillar\'s pop-up on every program page. A program can replace any of it on its own Development model (program, Page content, Development and compare).',
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
});

export const componentDevelopment = defineType({
  name: 'componentDevelopment',
  title: 'Development model',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    // Its own name, since component fields are merged into Site settings for the site (src/lib/sanity.ts).
    defineField({
      name: 'devShowOn', title: 'Show on these program pages', type: 'array',
      description: 'Untick a program to leave the development model off its page. Tick it to show it again.',
      of: [{ type: 'string' }],
      options: { list: DEV_PROGRAMS.map(([value, title]) => ({ value, title })), layout: 'grid' },
      initialValue: DEV_PROGRAMS.map(([value]) => value),
    }),
    DEVELOPMENT_FIELD,
  ],
  preview: { prepare: () => ({ title: 'Development model' }) },
});

/** Component documents, by id (each one's id is its type). */
export const COMPONENT_TYPES = ['componentDevelopment'] as const;
