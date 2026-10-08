# Utah Athletic website

Marketing site for Utah Athletic Soccer Club (utathletic-club.com). Astro, static output, deployed on Vercel.

## How this repo works

- **Content lives in content collections** (`src/content/`, schemas in `src/content.config.ts`). Staff edit YAML, not markup:
  - `programs/*.yaml`: one file per program (copy, leagues, season, week, development model, comparison values, staff, region status, and the Ollie `registerUrl`, which every Register button reads).
  - `regions.yaml` (leaders, emails), `venues.yaml`, `tryouts.yaml` (one entry per session), `seasons.yaml` (Rec and Futures sessions), `events.yaml` (tournaments; status is worked out from the dates).
  - `src/lib/content.ts` loads them all into one `data` object (image keys swapped for optimized URLs). The build fails with a clear message if an entry doesn't match its schema.
- **Other content:** site-wide copy and layout constants (nav, pyramid geometry, videos, comparison row labels, shared development-model copy, network page) are in `src/data/site.ts`; rec play formats in `src/data/rec-formats.ts`; map hubs in `src/data/locations.ts`.
- **Routes:** `/` home, `/<program>/` program overview, `/<program>/<region>/` region tab (all 12 exist; "soon" and "not offered" regions get their own state, never a 404), `/tryouts/` (`?region=&level=`), `/events/`, `/network/`, `/contact/` (`?region=&program=`). Old `/programs/<key>/` URLs redirect (see `astro.config.mjs`).
- **Home and program pages are one React island**, `src/components/app/UAApp.jsx`: routing, transitions and region memory. It renders `Home.jsx` (collage, pyramid, tryouts near you, tournaments, network teaser, docuseries) and `ProgramPage.jsx` (hero, region tabs, overview sections), which uses `DevModel.jsx`, `CompareTable.jsx` and `RegionTab.jsx`. Opening a program pushes its URL; back/forward and Escape work. The pyramid's Professional tier zooms into `/network/`.
- **Other pages** are Astro pages with small islands: `TryoutsApp.jsx`, `EventsApp.jsx`, `ContactApp.jsx`, `NetworkMap.jsx` (d3, `src/data/world-geo.json`). `SiteHeader.jsx` and `SiteFooter.jsx` are shared by every page.
- **Region memory:** the `ua_region` cookie (1 year) plus `?region=`. Picking a region anywhere sets it; Club and Rec open on it, and so do `/tryouts/` and the header's Tryouts button. Helpers are in `src/lib/schedule.ts` (also date formatting, event status and "next tryout").
- **Dates:** tryouts in the past drop off and event status updates on the visitor's own date after load, so a stale build never shows old dates as open.
- **Locations map** (`src/components/UtahMap.jsx`, in each program's "08 · Regions" section): hubs, cities and service counties in `src/data/locations.ts`; geometry in `src/data/utah-geo.json`. Regenerate both geometry files with `npm run geo:build`. Both maps are lazy-loaded.
- **Images** go in `src/assets/images/` and are referenced by file name without extension. `src/lib/assets.ts` optimizes them to WebP at build time. Club photos are `collage-c01` to `c20` (each gets a small size and a large `<key>@lg` size for full-bleed heroes). Keep source photos under about 2400px; resize big camera files first.
- **Styles:** design tokens are in `src/styles/global.css`, along with the named hover classes (`.hv-*`), the form field class (`.ua-input`) and the phone-width rules. Components style themselves inline, matching the prototype markup. Shared pieces (kickers, buttons, form fields) are in `src/components/ui.jsx`. Use the CSS variables; don't hardcode new colors. Icons are Phosphor (`@phosphor-icons/react`).
- **Transition modes:** `expand` is the default. `zoom` and `curtain` also exist; pass `transition="zoom"` to `UAApp`, or `showModes` to show the picker dock while testing.
- `docs/` is internal and never published. `docs/rec-program-plan.md` holds rec program decisions.
- **Design updates:** follow `docs/DESIGN-SYNC.md`. Run `npm run design:extract -- <handoff.zip, handoff folder or export.html>`, diff `docs/design-reference`, and port only what changed using the map in that doc.

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
