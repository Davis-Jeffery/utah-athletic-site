// Site-wide copy and lists that aren't tied to one program. One fixed document.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons/Cog';
import { link, photo, str, txt } from './helpers';

const PILLARS = [['technical', 'Technical'], ['tactical', 'Tactical'], ['physical', 'Physical'], ['mental', 'Mental']] as const;

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'home', title: 'Home page' },
    { name: 'tryouts', title: 'Tryouts page' },
    { name: 'events', title: 'Events page' },
    { name: 'dev', title: 'Development model' },
  ],
  fields: [
    defineField({ name: 'mainEmail', title: 'Main contact email', type: 'email', group: 'general', validation: (r) => r.required() }),
    str('tryoutsLabel', 'Header Tryouts button', { required: true, group: 'general', description: 'e.g. "Tryouts 2027".' }),
    defineField({
      name: 'social', title: 'Social links', type: 'array', group: 'general',
      of: [defineArrayMember({ type: 'object', name: 'socialLink', fields: [str('label', 'Network', { required: true }), link('href', 'Link', { required: true })], preview: { select: { title: 'label', subtitle: 'href' } } })],
    }),

    defineField({
      name: 'collage', title: 'Hero collage photos', type: 'array', group: 'home',
      description: 'Club photos for the home page collage. Drag to reorder. At least 11.',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      options: { layout: 'grid' },
      validation: (r) => r.required().min(11),
    }),
    defineField({
      name: 'videos', title: 'Inside Utah Athletic videos', type: 'array', group: 'home',
      of: [defineArrayMember({
        type: 'object', name: 'video',
        fields: [str('title', 'Title', { required: true }), str('len', 'Length', { required: true, description: 'e.g. "05:56".' }), photo('thumbnail', 'Thumbnail', { required: true }), link('url', 'YouTube link', { required: true })],
        preview: { select: { title: 'title', subtitle: 'len', media: 'thumbnail' } },
      })],
    }),

    defineField({ name: 'tryoutBring', title: 'What to bring', type: 'array', group: 'tryouts', of: [{ type: 'string' }] }),

    defineField({
      name: 'eventReel', title: 'Highlight reel', type: 'array', group: 'events',
      of: [defineArrayMember({
        type: 'object', name: 'reelItem',
        fields: [photo('photo', 'Photo', { required: true }), str('event', 'Event', { required: true }), str('caption', 'Caption', { required: true })],
        preview: { select: { title: 'event', subtitle: 'caption', media: 'photo' } },
      })],
    }),

    defineField({
      name: 'development', title: 'Development pillars (shared across programs)', type: 'object', group: 'dev',
      fields: PILLARS.map(([k, t]) =>
        defineField({
          name: k, title: t, type: 'object',
          fields: [str('tag', 'Tag', { required: true }), txt('deep', 'Detail', { required: true }), defineField({ name: 'focus', title: 'Focus points', type: 'array', of: [{ type: 'string' }] })],
        }),
      ),
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
});
