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
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { CreditCardIcon } from '@sanity/icons/CreditCard';
import { FORM_OPTIONS } from './schemaTypes/submission';
import { ADULT_LEAGUES } from './schemaTypes/adultLeague';

export const FIXED_TYPES = new Set(['program', 'adultLeague', 'region', 'siteSettings', 'networkPage']);

// Created by the site's forms, never in the Studio.
export const SITE_CREATED_TYPES = new Set(['submission', 'futuresRegistration']);

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

const NEWEST = [{ field: 'receivedAt', direction: 'desc' as const }];

export const structure: StructureResolver = (S) => {
  // A filtered list of submissions or registrations, newest first.
  const list = (type: string, title: string, filter: string, params: Record<string, string> = {}) =>
    S.listItem().title(title).id(title.toLowerCase().replace(/\W+/g, '-')).child(
      S.documentList().title(title).schemaType(type).filter(`_type == $type && ${filter}`).params({ type, ...params }).defaultOrdering(NEWEST),
    );
  return S.list()
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
        .title('Adult leagues')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Adult leagues')
            .items(ADULT_LEAGUES.map(([id, title]) => S.listItem().title(title).id(`adult-${id}`).child(S.document().schemaType('adultLeague').documentId(`adultLeague.${id}`)))),
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
      S.divider(),
      S.listItem()
        .title('Submissions')
        .icon(EnvelopeIcon)
        .child(
          S.list().title('Submissions').items([
            list('submission', 'New', 'status == "new"'),
            list('submission', 'In progress', 'status == "inprogress"'),
            list('submission', 'Done', 'status == "done"'),
            list('submission', 'All submissions', 'true'),
            S.divider(),
            ...FORM_OPTIONS.map((f) => list('submission', f.title, 'form == $form', { form: f.value })),
          ]),
        ),
      S.listItem()
        .title('Futures registrations')
        .icon(CreditCardIcon)
        .child(
          S.list().title('Futures registrations').items([
            list('futuresRegistration', 'Paid', 'payment == "paid"'),
            list('futuresRegistration', 'Checkout started, not paid', 'payment in ["pending", "expired", "failed"]'),
            list('futuresRegistration', 'Refunded', 'payment in ["refunded", "partiallyRefunded"]'),
            list('futuresRegistration', 'All registrations', 'true'),
            S.divider(),
            S.listItem().title('By session').id('by-session').child(
              S.documentTypeList('futuresSession').title('Pick a session').child((sid) =>
                S.documentList().title('Registrations').schemaType('futuresRegistration')
                  .filter('_type == "futuresRegistration" && session._ref in [$sid, "drafts." + $sid] && payment in ["paid", "refunded", "partiallyRefunded"]')
                  .params({ sid: sid.replace(/^drafts\./, '') }).defaultOrdering(NEWEST),
              ),
            ),
          ]),
        ),
    ]);
};
