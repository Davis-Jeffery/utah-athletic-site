# Club admin app: data contract with the website

Internal. Shared with the club admin app project (wireframes and, later, its codebase) so both sides build on the same model. Written from the code on 2026-11-12. When a schema below changes in this repo, update this file in the same change.

## 1. Purpose and direction

The club admin app becomes the system of record for club operations: clubs, people and roles, programs and regions as structures, tryouts, Recreation and Futures sessions, prices, venues and, later, schedules and teams. Built for Athletic Global, so many clubs from day one.

Sanity becomes content only: page copy, photos, page layout, marketing copy per program and region, emails and waivers.

The website (Astro, static, on Vercel) reads both at build time and merges them by shared ids. Nothing is copied between the two systems: every field has one owner.

Out of the app's first scope: player registration (Sports Connect; today Ollie links), Futures registrations and Stripe payments (stay on the website and in Sanity for now), and any sensitive player data.

## 2. Who owns what

| Data | Owner now | Owner later | Notes |
|---|---|---|---|
| Clubs / organizations | (implicit: one club) | App | New. Every app record belongs to a club. |
| Users, roles, scopes | Sanity project members (free plan: Administrator, Viewer only) | App | Scope = club > program > region. |
| Programs (structure: id, kind, enrollment, invite only, order) | Sanity `program` | App | Ids fixed: `academy`, `club`, `rec`, `futures`. |
| Programs (marketing copy, photos, layout) | Sanity `program` | Sanity | Keyed by the same program id. |
| Regions (id, label, area, order) | Sanity `region` | App | Ids fixed: `north`, `south`, `west`. |
| Program in a region (status, hub, ages, registration link) | Sanity `program.<region>` | App | |
| Region fees (Rec) and age group prices (Club) | Sanity `program` | App | Inclusion lists ("what's included") stay content, see section 5. |
| Staff (name, title, email, phone) | Sanity `staff` | App | |
| Staff bio and headshot | Sanity `staff` | Open question | Either app owns all, or Sanity keeps bio/headshot keyed by staff id. |
| Who leads / coaches where | Sanity program `leadership`, region `leaders`/`coaches` | App | Same thing as the app's roles, ideally. |
| Venues | Sanity `venue` | App | |
| Tryouts | Sanity `tryoutSession` | App | First slice candidate. |
| Recreation sessions | Sanity `recSession` | App | First slice candidate. |
| Futures sessions and classes | Sanity `futuresSession` | App | Registrations point at these, see section 7. |
| Tournaments (`event`) dates, registration windows, fees, links | Sanity `event` | Later, maybe | Page content for hosted events stays in Sanity. |
| Futures registrations, payments, group emails | Sanity + website API | Website (for now) | Sensitive. Not in the app's first scope. |
| Page copy, layout, photos, emails, waivers, site settings | Sanity | Sanity | |

Rule of thumb: changed by program leaders every season, the app owns it. Changed by marketing now and then, Sanity owns it.

## 3. Fixed values

- Program ids: `academy`, `club`, `rec`, `futures` (display order on the site: that order).
- Program `kind`: `tryout` (teams picked at tryouts: Academy, Club) or `season` (everyone who signs up plays: Recreation, Futures).
- Program `enrollment` (tryout programs): `trial` (accepting trial applications) or `tryouts` (open tryout registration). `invite: true` means invitation only.
- Region ids: `north`, `south`, `west`, with an `order`.
- Program-in-region `status`: `active` (Running), `soon` (Coming soon, with a `season` like "Fall 2027"), `none` (Not offered). Every program/region page exists either way; never a 404.
- Age groups: numbers 3 to 19 meaning U3 to U19. US Soccer seasonal year Aug 1 to Jul 31. Displayed "U9" or "U9 to U12".
- Gender for tryout groups: `Boys`, `Girls`, `Coed`.
- Times: 24h `"HH:MM"` strings in 15 minute steps, 06:00 to 22:00.
- Dates: `"YYYY-MM-DD"` strings with no time zone (the site reads them at local noon).
- Money: whole US dollars as numbers.
- Session `status`: `auto` (worked out from dates, the default) or an override: Recreation `open`, `closed`, `full`; Futures also `inseason`.

## 4. Records the app will own

Field names below are today's Sanity names. Keeping them makes the website switch mechanical; renaming is fine if the API maps back.

### Club (new)
`id`, `name`, `domain`, programs offered, regions. Everything below carries `clubId`.

### Region
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | e.g. `north`; used in page addresses |
| `label` | string | yes | e.g. "North" |
| `area` | string | yes | e.g. "Salt Lake County" |
| `order` | number | yes | |

### Program (structure only)
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | `academy` etc. |
| `name` | string | yes | |
| `kind` | `tryout` \| `season` | yes | |
| `enrollment` | `trial` \| `tryouts` | tryout programs | |
| `invite` | boolean | | Invitation only |
| `ages` | string | yes | e.g. "U9 to U19"; also limits form age choices |
| `registerUrl` | url | yes except Futures | Default registration link (today Ollie, later Sports Connect) |
| `regions` | map of region id to ProgramRegion | yes | |

### ProgramRegion (a program in a region)
| Field | Type | Req | Notes |
|---|---|---|---|
| `status` | `active` \| `soon` \| `none` | yes | |
| `hub` | string | | e.g. "Draper / Sandy" |
| `season` | string | when `soon` | e.g. "Fall 2027" |
| `ages` | string | | Overrides the program's ages on this region's page |
| `registerUrl` | url | | Recreation: the region's own registration site |
| `fees` | Fee[] | | Recreation (Futures prices come from sessions; Academy prices are never shown; Club uses age tabs) |
| `leaders` | Assignment[] | | |
| `coaches` | Assignment[] | | Not used by Recreation (volunteer coaches) |

Program-wide: `leadership` (Assignment[]).

### Fee (Recreation region fee row)
`ages` (string, e.g. "U9 to U12" or "All ages", required), `cost` (required), `earlyCost` and `earlyEnds` (both or neither; `earlyCost` < `cost`), `note`.

### Club age tab (Club prices)
`minAge`, `maxAge` (required), `prices` `{ north?, south?, west? }`, `note`. Its included / not included lists are content (section 5) but can be limited to regions.

### Staff
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `name` | string | yes | |
| `title` | string | yes | Main title |
| `email` | email | | Shown on the site |
| `phone` | string | | Never shown on the site |
| `bio`, `headshot` | | | See open question in section 2 |

### Assignment (a person in a spot)
`person` (staff id, required), `title` (optional, overrides the person's title in that spot). This is the natural place for app roles to come from: a regional Futures leader is an assignment, and the same record can grant their app permissions.

### Venue
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `name` | string | yes | As families see it, e.g. "Murray Park, Field 3" |
| `address` | string | yes | |
| `place` | `{ name, address, lat, lng, placeId }` | | Exact spot for directions links (Google place id when found) |

### Tryout
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `name` | string | yes | e.g. "2027 Academy Tryouts" |
| `program` | `academy` \| `club` | yes | |
| `region` | region id | yes | |
| `registerUrl` | url | | Else the program's default link |
| `groups` | TryoutGroup[] | yes, 1+ | |

TryoutGroup: `minAge`, `maxAge` (required, max >= min), `gender` (required), `registerUrl` (optional, else the tryout's), `days` (1+).
TryoutDay: `date`, `venue` (venue id), `startTime`, `endTime` (all required; end after start).

### Recreation session
| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `name` | string | yes | e.g. "Spring 2027" |
| `region` | region id | yes | |
| `venue` | venue id | yes | |
| `minAge`, `maxAge` | number | | Both or neither; empty uses the program's ages |
| `cost` | number | yes | Regular price |
| `earlyCost`, `earlyEnds` | number, date | | Both or neither; `earlyCost` < `cost` |
| `registrationOpens`, `registrationCloses` | date | yes | closes >= opens |
| `start`, `end` | date | yes | end >= start; drops off the site after `end` |
| `status` | `auto` \| `open` \| `closed` \| `full` | yes | default `auto` |
| `registerUrl` | url | | Else the region's link, else the program's |

### Futures session
Same as Recreation except: no early bird; status adds `inseason`; `capacity` (optional, integer >= 1; the website sets the session Full when that many have paid); `classes` (Class[]); registration happens on the website (`/futures/register/?session=<id>`), so no `registerUrl`. `start` and `end` are the first and last class.
Class: `date`, `startTime`, `endTime` (required), `note` (e.g. "No class: Thanksgiving").

## 5. What stays in Sanity, keyed by app ids

Program: name shown, tier, kicker, tagline, intros, leagues, photos, join copy, cost note, what's included lists, commitment, typical week, season timeline, development model, compare table, map pins, How we play (Recreation), page layout, search and sharing.
Region pages: layout. Staff: possibly bio and headshot.
Site-wide: home, tryouts, events, network and contact pages, site settings, emails, waivers, tournaments' hosted page content.

## 6. Rules the website applies (the app should store raw data, not computed results)

All on the visitor's own date, so a stale build never shows old information:

- **Session status** (`auto`): before `registrationOpens` "Registration opens <date>"; through `registrationCloses` "Registration open until <date>" (can join); after that "In season" once `start` has passed, else "Registration closed"; after `end` the session is gone. A non-`auto` status overrides, except a session past `end` is always gone.
- **Early bird**: `earlyCost` applies through `earlyEnds`, shown with the regular price struck through, then `cost`. A program's "From" price is the lowest current price across its rows or sessions.
- **Tryouts**: days before today drop off; a group with no days left drops off; a tryout with no groups left drops off. Summary: remaining date range, age range ("U10 to U13"), players ("Boys and Girls" when mixed or Coed).
- **Next thing to sign up for** (home page, per program and region): Futures and Recreation, the first session open now, else the next upcoming; Recreation with none posted links to the region's registration site; Futures with none shows "Coming soon" and a notify-me form. Tryout programs: the soonest tryout, else "Request an invitation" (invite only) or "Dates to be announced".
- **Registration link fallback**: group, then tryout or session, then region (Recreation), then program default.

If the app wants to show the same statuses in its own screens, it should use these same rules (they can be shared as a small TypeScript module later).

## 7. Things that connect across the boundary

- **Futures registrations** (website/Sanity) point at a Futures session by id and keep a copy of its name. When sessions move to the app, the session id must stay stable, and the website's checkout must read the session (price, status, capacity, dates) from the app. Setting a session Full when capacity is reached would become a call to the app.
- **Form messages and group emails** go to the leaders the page shows (region leaders, else the region's, else the main email). Those leaders will come from the app's assignments.
- **Registrations page** (Studio) groups Futures players by age group and session; it reads sessions too.

## 8. Draft read API for the website

Read only, token protected, public fields only (never staff phone numbers), versioned. One snapshot call per build is simplest for a static site:

```
GET /v1/clubs/{clubId}/site
Authorization: Bearer <site read token>

200 {
  "version": 1,
  "updatedAt": "2026-11-12T18:00:00Z",
  "regions":  [Region],
  "programs": [Program],          // with regions, fees, age tabs, leadership, assignments
  "staff":    [Staff],            // public fields only
  "venues":   [Venue],
  "tryouts":  [Tryout],           // with groups and days; include past ones (the site filters by date)
  "sessions": [RecSession | FuturesSession]   // with "program": "rec" | "futures"
}
```

Optional finer endpoints later (`/programs`, `/tryouts?program=&region=`, `/sessions?program=&region=`, `/sessions/{id}` for Futures checkout).

The website validates the response with Zod like it does Sanity: a bad record fails the build with its id and field, and the live site stays as it was.

**Rebuilds:** on any change the app calls the website's Vercel deploy hook (debounced, e.g. once a minute at most), the same way Sanity's publish webhook does today.

## 9. Open questions

1. Staff bio and headshot: app or Sanity?
2. Does Club pricing (age tabs) move to the app now, or with a later slice?
3. Tournaments: do their dates, registration windows and fees move to the app?
4. Sports Connect: one link per program, region, session or group? Does the app store it, or build it?
5. Region ids for merged clubs: global (`north`) or per club (`ua-north`)? Page addresses use them.
6. Futures leaders' group email and registrant export: stays in the Studio (admin sends) until registrations are in scope.

## 10. Suggested first slice for the app

Clubs, users and scoped roles, venues, and Recreation and Futures sessions (then tryouts). The website then reads sessions from the app's API, and regional leaders manage their own sessions without Sanity access.
