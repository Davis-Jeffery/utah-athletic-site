# Utah Athletic website

Marketing site for Utah Athletic Soccer Club (utathletic-club.com). Astro, static output, deployed on Vercel.

## How this repo works

- **Content lives in Sanity** (project `03wnsd9x`, dataset `production`). Staff edit it in the Studio at https://utah-athletic.sanity.studio; the Studio source and schemas are in `studio/` (see `studio/README.md`).
  - Document types: `program` (4 fixed docs, ids `program.<key>`), `region` (3 fixed, `region.<key>`), `venue`, `tryoutSession`, `season` (Rec and Futures sessions), `event`, and the `siteSettings` singleton (main email, Tryouts button label, social links, collage, videos, what to bring, event reel, shared development pillar copy).
  - `src/lib/sanity.ts` fetches published content at build time and validates it with Zod; a bad document fails the build with its id and field. `src/lib/content.ts` reshapes it into the one `data` object pages and islands share (image URLs from Sanity's CDN, times and ages formatted, development copy merged into each program).
  - Publishing in the Studio triggers a Vercel rebuild through a webhook. Drafts never reach the site.
  - When a schema changes, update `studio/schemaTypes/`, the Zod schema in `src/lib/sanity.ts` and the mapping in `src/lib/content.ts` together, then `cd studio && npm run deploy`.
- **Content that stays in code:** nav, pyramid geometry, collage tile layout, compare row labels and columns, pathway, network map nodes and page-level copy are in `src/data/site.ts` and the pages; rec play formats in `src/data/rec-formats.ts`; map hubs in `src/data/locations.ts`. Program and region ids are structural and live in code too.
- **Routes:** `/` home, `/<program>/` program overview, `/<program>/<region>/` region tab (all 12 exist; "soon" and "not offered" regions get their own state, never a 404), `/tryouts/` (`?region=&level=`), `/events/`, `/network/`, `/contact/` (`?region=&program=`). Old `/programs/<key>/` URLs redirect (see `astro.config.mjs`).
- **Home and program pages are one React island**, `src/components/app/UAApp.jsx`: routing, transitions and region memory. It renders `Home.jsx` (collage, pyramid, tryouts near you, tournaments, network teaser, docuseries) and `ProgramPage.jsx` (hero, region tabs, overview sections), which uses `DevModel.jsx`, `CompareTable.jsx` and `RegionTab.jsx`. Opening a program pushes its URL; back/forward and Escape work. The pyramid's Professional tier zooms into `/network/`.
- **Other pages** are Astro pages with small islands: `TryoutsApp.jsx`, `EventsApp.jsx`, `ContactApp.jsx`, `NetworkMap.jsx` (d3, `src/data/world-geo.json`). `SiteHeader.jsx` and `SiteFooter.jsx` are shared by every page.
- **Region memory:** the `ua_region` cookie (1 year) plus `?region=`. Picking a region anywhere sets it; Club and Rec open on it, and so do `/tryouts/` and the header's Tryouts button. Helpers are in `src/lib/schedule.ts` (also date formatting, event status and "next tryout").
- **Dates:** tryouts in the past drop off and event status updates on the visitor's own date after load, so a stale build never shows old dates as open.
- **Locations map** (`src/components/UtahMap.jsx`, in each program's "08 · Regions" section): hubs, cities and service counties in `src/data/locations.ts`; geometry in `src/data/utah-geo.json`. Regenerate both geometry files with `npm run geo:build`. Both maps are lazy-loaded.
- **Images:** content photos are uploaded in the Studio and served from Sanity's CDN at fixed widths (`W` in `src/lib/content.ts`). The page heroes on /tryouts, /events and /network still use local files in `src/assets/images/` through `src/lib/assets.ts` (key, or `<key>@lg` for the large size).
- **Styles:** design tokens are in `src/styles/global.css`, along with the named hover classes (`.hv-*`), the form field class (`.ua-input`) and the phone-width rules. Components style themselves inline, matching the prototype markup. Shared pieces (kickers, buttons, form fields) are in `src/components/ui.jsx`. Use the CSS variables; don't hardcode new colors. Icons are Phosphor (`@phosphor-icons/react`).
- **Transition modes:** `expand` is the default. `zoom` and `curtain` also exist; pass `transition="zoom"` to `UAApp`, or `showModes` to show the picker dock while testing.
- `docs/` is internal and never published. `docs/rec-program-plan.md` holds rec program decisions.
- **Design updates:** follow `docs/DESIGN-SYNC.md`. Content changes from a handoff are made in the Studio, not in code. Run `npm run design:extract -- <handoff.zip, handoff folder or export.html>`, diff `docs/design-reference`, and port only what changed using the map in that doc.

## Deploying

- Push to `main` deploys to production automatically on Vercel.
- Any other branch gets a preview URL. Use a branch for anything that needs review before going live.
- Always run `npm run build` before pushing; fix errors first.

## Writing rules

- No em dashes in any copy. Use periods, commas or colons instead.
- Keep copy short and parent-friendly. Ages are written U5, U9 to U12, etc.

## Open work

- Forms (trial application, registration, register interest, Academy invitation, contact) show a success message but don't submit anywhere yet. The handoff recommends form → Zapier/Make → Airtable plus a confirmation email and a routing sheet (program × age × region → coach and director emails).
- Placeholders to replace before launch: Ollie URLs (`ollie.example`), tryout dates, times and venues, Rec/Futures session dates, event details, colors and URLs (`example.com`), event logos, staff names, emails and headshots, network copy, RC Vichy crest and photos.
- Photos: program heroes for Club, Rec and Futures are still Unsplash-derived; section photos use club photography (`collage-*`). The ECNL badge source is low-res; get a vector.
- Rec page: formats for U5 to U9 are defined; U10+ still to be decided.
- Map hubs use nearest-hub zones. Replace with the club's official city-to-hub assignment when available, and pass the matched hub into the join forms.
- Header links Staff and News from the old design were dropped; add them back to `NAV` in `src/data/site.ts` when those pages exist.
