# Bringing design changes from Claude Design into the site

The site was ported from the Claude Design prototype. When the design changes, don't re-port the whole thing: extract the new export, diff it against the last one, and port only what changed.

## Steps

1. **Export the design.** From Claude Design, download the design handoff `.zip` (preferred: it has readable source, every page and a README), or a single standalone `.html` file. Save it anywhere, for example `~/Downloads/ua-design.zip`. An unzipped handoff folder works too.
2. **Start a branch.**
   ```bash
   git checkout main && git pull
   git checkout -b design-update
   ```
3. **Extract it into the reference folder.**
   ```bash
   npm run design:extract -- ~/Downloads/ua-design.zip
   ```
   This overwrites `docs/design-reference/template.html` (markup), `page-script.js` (logic and content), `extra/` (the other pages, seed data, the handoff README and `nocturne.css`) and `assets/` (images).
4. **See exactly what changed.**
   ```bash
   git diff --stat docs/design-reference
   git diff docs/design-reference/template.html docs/design-reference/page-script.js
   ```
5. **Port the changes** using the map below. If the handoff README asks for new content fields, add them to the schema in `src/content.config.ts` first. The fastest way is to hand it to Claude in the desktop app (prompt below).
6. **Check it:** `npm run build && npm run dev`, click through the pyramid, open and close each program, switch region tabs, try `/tryouts/`, `/events/`, `/network/` and `/contact/`, and check phone width.
7. **Commit and push the branch** to get a Vercel preview link. Merge to `main` when it looks right.

### Prompt for Claude (desktop app, in this repo)

> I exported a new version of the design and ran `npm run design:extract`. Read docs/DESIGN-SYNC.md, then look at `git diff docs/design-reference` and port only those changes into the site using the map. Content changes go in src/content (YAML) or src/data/site.ts, markup and logic changes go in the components listed in the map, new images go in src/assets/images. Keep the routing, content wiring and site-only pieces listed below. Run the build, check it in a browser at desktop and phone width, and summarize what changed.

## What the extract writes

The handoff can hold several pages. `Utah Athletic Programs.dc.html` (home and program pages) is split into `template.html` and `page-script.js`. Every other page lands in `extra/` as-is: `Tryouts.dc.html`, `Events.dc.html`, `Contact Us.dc.html`, `Athletic Network.dc.html`, `Network Map.html`, `Utah Map.html`, the seed data (`tryouts-data.js`, `events-data.js`), `nocturne.css` and the handoff `README.md`.

## Map: design to code

Line numbers drift, so search for the anchor text in each file.

| In the design (`docs/design-reference/`) | In the site | Search for |
|---|---|---|
| Program content `const P = { academy, club, rec, futures }`, `RG` (region status), `DEV`, `CMP`, `TRY_DATES`, `PSTAT` in page-script.js | `src/content/programs/<key>.yaml` (`regions`, `development`, `compare`, `enrollment`, `nextTryout`, `registrationOpens`) | the program key |
| `REGIONS`, `LEADS` | `src/content/regions.yaml` | region id |
| `extra/tryouts-data.js`: `VENUES`, `RAW`/`plan`, `SESSIONS`, `SEASON_VENUE`, `PROGRAMS.register` | `venues.yaml`, `tryouts.yaml`, `seasons.yaml`, `regions.yaml` (`seasonVenue`), each program's `registerUrl` | venue or tryout id |
| `extra/events-data.js` `EVENTS` | `src/content/events.yaml` | event id |
| `DEEP`, `CMP` row labels, `CMP_COLS`, `PATH`, `VIDS`, `PTS`, `MONTHS`, `COLLAGE_TILES`, `BRING`, `REEL` | `src/data/site.ts` | `DEVELOPMENT`, `COMPARE_ROWS`, `PATHWAY`, `VIDEOS`, `PYRAMID_POINTS`, `COLLAGE_TILES`, `TRYOUT_BRING`, `EVENT_REEL` |
| Photos `PICS`/`SP` (Unsplash in the design) | each program's `photos` (club photos `collage-cNN`) | `photos:` |
| `class Component`: `open`, `close`, `switchTo`, `setRegion`, `goNetwork`, `goJoin` | `src/components/app/UAApp.jsx` (same names) | method name |
| Header, region menu | `src/components/SiteHeader.jsx` (`RegionMenu`) | `<header` |
| Hero collage, pyramid, program list, Tryouts near you, Tournaments, Where the pathway leads, Inside UA, "Want to play for us?" | `src/components/app/Home.jsx` | `Collage`, `Pyramid`, `id="network"`, `id="inside"` |
| Program top bar, hero, status row, region tabs `#rnav`, Explore the pathway | `src/components/app/ProgramPage.jsx` | `#ovhero`, `id="rnav"` |
| Overview sections `sec-overview` to `sec-regions` | `ProgramPage.jsx` (`Overview`, `Season`) | `id="sec-…"` |
| Development orbit and modal (`sec-dev`, `dmOn`) | `src/components/app/DevModel.jsx` | `DevModal` |
| Compare table (`cmpCols`, `cmpRows`) | `src/components/app/CompareTable.jsx` | `COMPARE_COLUMNS` |
| Region tab (`inRegion`: `sec-rlead`, `sec-rcoach`, `sec-rtry`, `sec-rfee`, `sec-rcontact`, `sec-rsoon`, `sec-rnone`) | `src/components/app/RegionTab.jsx` | section id |
| `extra/Tryouts.dc.html` | `src/pages/tryouts.astro` + `src/components/TryoutsApp.jsx` | |
| `extra/Events.dc.html` | `src/pages/events.astro` + `src/components/EventsApp.jsx` | |
| `extra/Contact Us.dc.html` | `src/pages/contact.astro` + `src/components/ContactApp.jsx` | |
| `extra/Athletic Network.dc.html`, `extra/Network Map.html` | `src/pages/network.astro` + `src/components/NetworkMap.jsx` | |
| `extra/Utah Map.html` | `src/components/UtahMap.jsx`, `src/styles/utah-map.css`, `src/data/locations.ts` | `const SITES` maps to `HUBS` |
| Footer | `src/components/SiteFooter.jsx` | `<footer` |
| `style-hover` / `style-focus` | `.hv-*` classes and `.ua-input` in `src/styles/global.css` | `.hv-lift` |
| Design tokens (`<helmet>` styles, `:root` colors) | top of `src/styles/global.css` | `:root` |
| Images (`assets/`) | `src/assets/images/`, referenced by key | image key |

### Translating template syntax to JSX

| Design template | JSX |
|---|---|
| `{{ value }}` | `{value}` |
| `<sc-for list="{{ items }}" as="it">` | `{items.map((it) => ( ... ))}` |
| `<sc-if value="{{ flag }}">` | `{flag ? ( ... ) : null}` |
| `onClick="{{ fn }}"` | `onClick={fn}` |
| `style="a:b;c:{{ x }}"` | `style={{ a: 'b', c: x }}` |
| `style-hover="..."` | a `.hv-*` class (add one to global.css if none matches) |
| `<image-slot src=...>` | `<img>` with `objectFit`; placeholders use `PhotoSlot` from `ui.jsx` |
| `<i class="ph ph-map-pin">` | `<MapPin />` from `@phosphor-icons/react` |
| `renderVals()` computed values | computed inside the component that renders them (state lives in the smallest component that needs it) |

### Things that exist only in the site (keep them when porting)

- Real routes instead of the prototype's `#/academy/north` hashes: `nav()`, `silently()`, the `popstate` listener and the `initial` prop in `UAApp.jsx`; `src/pages/[program]/`.
- Content collections and `src/lib/content.ts` (the prototype hard-codes content in scripts).
- Date handling in `src/lib/schedule.ts`: past tryouts hidden, event status on the visitor's date (`useToday`).
- `<RecFormats />` inside the Rec program's Competition section.
- Accessibility additions: keyboard-focusable pyramid slices, Escape closes the innermost layer first, `aria-pressed` on filters, 44px tap targets, reduced-motion support (collage, transitions, maps).
- Club photos replace the design's Unsplash placeholders for section photos; the Network hero uses a club photo until Athletic Global supplies imagery.
- No em dashes in copy.

## Locations map

Built (October 2026) from `extra/Utah Map.html` as a native component, per the handoff README. Shown in each program's "08 · Regions" section.

- Hubs, cities, zone colors and service counties: `src/data/locations.ts`. In the prototype these are `SITES`, `CITIES`, `TONES`, `SERVICE` and `FAR` at the top of the map script.
- Geometry: `src/data/utah-geo.json`, cut from us-atlas by `npm run geo:build` (the prototype fetched it from a CDN at runtime). The same script writes `src/data/world-geo.json` for the network map from world-atlas.
- Changes from the prototype: the search label reads "Find your nearest field" for Rec and Futures (no tryouts); on phones the finder and hub cards scroll sideways above the map, and one finger scrolls the page while two fingers pan the map.
- Still to do: the official city-to-hub assignment (zones are nearest-hub for now) and sending the matched hub with form submissions.
