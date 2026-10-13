// Studio sidebar. Most frequent edits first; fixed documents open directly by id.
import type { StructureResolver } from 'sanity/structure';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ClockIcon } from '@sanity/icons/Clock';
import { SunIcon } from '@sanity/icons/Sun';
import { StarIcon } from '@sanity/icons/Star';
import { PinIcon } from '@sanity/icons/Pin';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { CogIcon } from '@sanity/icons/Cog';
import { EarthAmericasIcon } from '@sanity/icons/EarthAmericas';
import { UsersIcon } from '@sanity/icons/Users';

export const FIXED_TYPES = new Set(['program', 'region', 'siteSettings', 'networkPage']);

export const PROGRAMS = [
  ['academy', 'Academy'],
  ['club', 'Club'],
  ['rec', 'Recreation'],
  ['futures', 'Futures'],
] as const;

export const REGIONS = [
  ['north', 'North'],
  ['south', 'South'],
  ['west', 'West'],
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Tryout sessions')
        .icon(CalendarIcon)
        .child(
          S.documentTypeList('tryoutSession')
            .title('Tryout sessions')
            .defaultOrdering([{ field: 'date', direction: 'asc' }, { field: 'startTime', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Recreation sessions')
        .icon(ClockIcon)
        .child(S.documentTypeList('recSession').title('Recreation sessions').defaultOrdering([{ field: 'start', direction: 'asc' }])),
      S.listItem()
        .title('Futures sessions')
        .icon(SunIcon)
        .child(S.documentTypeList('futuresSession').title('Futures sessions').defaultOrdering([{ field: 'start', direction: 'asc' }])),
      S.listItem()
        .title('Tournaments and events')
        .icon(StarIcon)
        .child(S.documentTypeList('event').title('Tournaments and events').defaultOrdering([{ field: 'start', direction: 'asc' }])),
      S.documentTypeListItem('venue').title('Venues').icon(PinIcon),
      S.divider(),
      S.listItem()
        .title('Staff')
        .icon(UsersIcon)
        .child(S.documentTypeList('staff').title('Staff').defaultOrdering([{ field: 'name', direction: 'asc' }])),
      S.listItem()
        .title('Programs')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Programs')
            .items(PROGRAMS.map(([id, title]) => S.listItem().title(title).id(id).child(S.document().schemaType('program').documentId(`program.${id}`)))),
        ),
      S.listItem()
        .title('Region settings')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('Region settings')
            .items(REGIONS.map(([id, title]) => S.listItem().title(title).id(id).child(S.document().schemaType('region').documentId(`region.${id}`)))),
        ),
      S.listItem()
        .title('Network page')
        .icon(EarthAmericasIcon)
        .child(S.document().schemaType('networkPage').documentId('networkPage').title('Network page')),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
    ]);
