// Studio sidebar, organized like the website: each page holds everything shown on it (its content,
// and its sessions, events or registrations), then people and places, the inbox of things that come
// in from the site, and settings. Fixed documents open directly by id.
import type { StructureBuilder, StructureResolver } from 'sanity/structure';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ClockIcon } from '@sanity/icons/Clock';
import { StarIcon } from '@sanity/icons/Star';
import { PinIcon } from '@sanity/icons/Pin';
import { DocumentIcon } from '@sanity/icons/Document';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { CogIcon } from '@sanity/icons/Cog';
import { EarthAmericasIcon } from '@sanity/icons/EarthAmericas';
import { UsersIcon } from '@sanity/icons/Users';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { CreditCardIcon } from '@sanity/icons/CreditCard';
import { HomeIcon } from '@sanity/icons/Home';
import { SunIcon } from '@sanity/icons/Sun';
import { FORM_OPTIONS } from './schemaTypes/submission';
import { ADULT_LEAGUES } from './schemaTypes/adultLeague';
import { PAGE_TYPES } from './schemaTypes/pages';
import { COMPONENT_TYPES } from './schemaTypes/components';
import { BlockElementIcon } from '@sanity/icons/BlockElement';

export const FIXED_TYPES = new Set(['program', 'adultLeague', 'region', 'siteSettings', 'networkPage', ...PAGE_TYPES, ...COMPONENT_TYPES]);

// Created by the site's forms, never in the Studio.
export const SITE_CREATED_TYPES = new Set(['submission', 'futuresRegistration', 'emailBroadcast']);

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

// "+ New" in Academy's and Club's tryout lists starts a tryout with the program filled in
// (registered in sanity.config.ts).
export const TRYOUT_TEMPLATES = (['academy', 'club'] as const).map((p) => ({
  id: `tryout-${p}`, title: `${p === 'academy' ? 'Academy' : 'Club'} tryout session`, schemaType: 'tryoutSession', value: { program: p },
}));

const NEWEST = [{ field: 'receivedAt', direction: 'desc' as const }];
const BY_START = [{ field: 'start', direction: 'asc' as const }];

export const structure: StructureResolver = (S) => {
  // A filtered list of submissions or registrations, newest first.
  const list = (type: string, title: string, filter: string, params: Record<string, string> = {}) =>
    S.listItem().title(title).id(title.toLowerCase().replace(/\W+/g, '-')).child(
      S.documentList().title(title).schemaType(type).filter(`_type == $type && ${filter}`).params({ type, ...params }).defaultOrdering(NEWEST),
    );
  const program = (id: string, title: string) => S.document().schemaType('program').documentId(`program.${id}`).title(`${title} page`);
  const pageContent = (id: string, title: string) => S.listItem().title('Page content').id(`${id}-page`).icon(DocumentIcon).child(program(id, title));
  // A page document (schemaTypes/pages.ts) opened by its id.
  const pageDoc = (type: string, title: string) => S.document().schemaType(type).documentId(type).title(title);

  return S.list()
    .title('Content')
    .items([
      S.divider().title('Website pages'),
      S.listItem().title('Home page').id('home').icon(HomeIcon).child(pageDoc('pageHome', 'Home page')),
      ...PROGRAMS.map(([id, title]) => S.listItem().title(title).id(id).icon(DocumentsIcon).child(
        S.list().title(title).items([
          pageContent(id, title),
          ...programExtras(S, id, title, list),
        ]),
      )),
      ...ADULT_LEAGUES.map(([id, title]) => S.listItem().title(`Adult: ${title}`).id(`adult-${id}`).icon(UsersIcon)
        .child(S.document().schemaType('adultLeague').documentId(`adultLeague.${id}`).title(title))),
      S.listItem().title('Tryouts page').id('tryouts-page').icon(CalendarIcon).child(pageDoc('pageTryouts', 'Tryouts page')),
      S.listItem()
        .title('Tournaments & Events')
        .icon(StarIcon)
        .child(S.list().title('Tournaments & Events').items([
          S.listItem().title('Page content').id('events-page').icon(DocumentIcon).child(pageDoc('pageEvents', 'Tournaments & Events page')),
          S.listItem().title('Events').id('events-list').icon(StarIcon).child(S.documentTypeList('event').title('Events').defaultOrdering(BY_START)),
        ])),
      S.listItem()
        .title('Network page')
        .icon(EarthAmericasIcon)
        .child(S.document().schemaType('networkPage').documentId('networkPage').title('Network page')),
      S.listItem().title('Contact page').id('contact-page').icon(EnvelopeIcon).child(pageDoc('pageContact', 'Contact page')),

      S.divider().title('Site-wide components'),
      S.listItem().title('Development model').id('development-model').icon(BlockElementIcon)
        .child(S.document().schemaType('componentDevelopment').documentId('componentDevelopment').title('Development model')),

      S.divider().title('People and places'),
      S.listItem()
        .title('Staff')
        .id('staff')
        .icon(UsersIcon)
        .child(S.documentTypeList('staff').title('Staff').defaultOrdering([{ field: 'name', direction: 'asc' }])),
      S.documentTypeListItem('venue').title('Venues (fields)').icon(PinIcon),

      S.divider().title('Inbox'),
      S.listItem()
        .title('Form messages')
        .id('messages')
        .icon(EnvelopeIcon)
        .child(
          S.list().title('Form messages').items([
            list('submission', 'New', 'status == "new"'),
            list('submission', 'In progress', 'status == "inprogress"'),
            list('submission', 'Done', 'status == "done"'),
            list('submission', 'All messages', 'true'),
            S.divider().title('By form'),
            ...FORM_OPTIONS.map((f) => list('submission', f.title, 'form == $form', { form: f.value })),
          ]),
        ),
      S.listItem().title('Futures registrations').id('inbox-registrations').icon(CreditCardIcon).child(registrations(S, list)),
      S.listItem()
        .title('Sent emails')
        .icon(EnvelopeIcon)
        .child(S.documentTypeList('emailBroadcast').title('Sent emails').defaultOrdering([{ field: 'createdAt', direction: 'desc' }])),

      S.divider().title('Settings'),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
      S.listItem()
        .title('Region settings')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('Region settings')
            .items(REGIONS.map(([id, title]) => S.listItem().title(title).id(id).child(S.document().schemaType('region').documentId(`region.${id}`)))),
        ),
    ]);
};

type ListFn = (type: string, title: string, filter: string, params?: Record<string, string>) => ReturnType<StructureBuilder['listItem']>;

// What sits under each program besides its page: tryout sessions (Academy, Club), sessions
// (Recreation, Futures) and, for Futures, its registrations.
function programExtras(S: StructureBuilder, id: string, title: string, list: ListFn) {
  if (id === 'academy' || id === 'club') {
    return [S.listItem().title('Tryout sessions').id(`${id}-tryouts`).icon(CalendarIcon).child(
      S.documentList().title(`${title} tryout sessions`).schemaType('tryoutSession')
        .filter('_type == "tryoutSession" && program == $program').params({ program: id })
        .defaultOrdering([{ field: 'date', direction: 'asc' }, { field: 'startTime', direction: 'asc' }])
        .initialValueTemplates([S.initialValueTemplateItem(`tryout-${id}`)]),
    )];
  }
  const type = id === 'rec' ? 'recSession' : 'futuresSession';
  return [
    S.listItem().title('Sessions').id(`${id}-sessions`).icon(ClockIcon).child(S.documentTypeList(type).title(`${title} sessions`).defaultOrdering(BY_START)),
    ...(id === 'futures' ? [
      S.listItem().title('Registration page and waiver').id('futures-register-page').icon(SunIcon)
        .child(S.document().schemaType('pageFutures').documentId('pageFutures').title('Futures registration page and waiver')),
      S.listItem().title('Registrations').id('futures-registrations').icon(CreditCardIcon).child(registrations(S, list)),
    ] : []),
  ];
}

// Futures registrations by payment, plus by session. Shown under Futures and in the Inbox.
function registrations(S: StructureBuilder, list: ListFn) {
  return S.list().title('Futures registrations').items([
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
  ]);
}
