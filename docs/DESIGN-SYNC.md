# Bringing design changes from Claude Design into the site

The site was ported from the Claude Design prototype. When the design changes, don't re-port the whole thing: extract the new export, diff it against the last one, and port only what changed.

## Steps

1. **Export the design.** From Claude Design, download the design handoff `.zip` (preferred: it has readable source, the map page and a README), or a single standalone `.html` file. Save it anywhere, for example `~/Downloads/ua-design.zip`.
2. **Start a branch.**
   ```bash
   git checkout main && git pull
   git checkout -b design-update
   ```
3. **Extract it into the reference folder.**
   ```bash
   npm run design:extract -- ~/Downloads/ua-design.zip
   ```
   This overwrites `docs/design-reference/template.html` (markup), `page-script.js` (logic and content), `extra/` (other prototype pages such as `Utah Map.html`, the handoff README and `nocturne.css`) and `assets/` (images).
4. **See exactly what changed.**
   ```bash
   git diff --stat docs/design-reference
   git diff docs/design-reference/template.html docs/design-reference/page-script.js
   ```
5. **Port the changes** using the map below. The fastest way is to hand it to Claude in the desktop app (prompt below).
6. **Check it:** `npm run build && npm run dev`, click through the pyramid, open and close each program, and check phone width.
7. **Commit and push the branch** to get a Vercel preview link. Merge to `main` when it looks right.

### Prompt for Claude (desktop app, in this repo)

> I exported a new version of the design and ran `npm run design:extract`. Read docs/DESIGN-SYNC.md, then look at `git diff docs/design-reference` and port only those changes into the site using the map. Content changes go in src/data, markup and logic changes go in src/components/UAApp.jsx, new images go in src/assets/images. Keep the routing, RecFormats and content wiring we added. Run the build, check it in a browser at desktop and phone width, and summarize what changed.

## Map: design to code

Line numbers drift, so search for the anchor text in each file.

| In the design (`docs/design-reference/`) | In the site | Search for |
|---|---|---|
| Program content: `const P = { academy, club, rec, futures }` in page-script.js | `src/data/programs.ts` (`PROGRAMS`) | the program key, e.g. `rec: {` |
| Videos `const VIDS` | `src/data/programs.ts` (`VIDEOS`) | `VIDEOS` |
| Pyramid shape `const PTS` | `src/data/programs.ts` (`PYRAMID_POINTS`) | `PYRAMID_POINTS` |
| `MONTHS` season axis | `src/data/programs.ts` (`MONTHS`) | `MONTHS` |
| Helpers, `TEAMS` sample roster, `SECS` section nav, `EASE`, `ACC` | top of `src/components/UAApp.jsx` | `const TEAMS`, `const SECS` |
| `class Component` logic: `open`, `close`, `switchTo`, `renderVals` | `UAApp.jsx` class methods (same names) | `open(id)`, `renderVals()` |
| Header and nav | `UAApp.jsx` render | `<header` |
| Hero, program list, pyramid | `UAApp.jsx` render | `id="programs"`, `data-pyr` |
| Locations section (`sec-locations`, was an iframe of `extra/Utah Map.html`) | `UAApp.jsx` render + `src/components/UtahMap.jsx`, styles in `src/styles/utah-map.css`, data in `src/data/locations.ts` | `sec-locations`, `const SITES` maps to `HUBS` |
| Docuseries section | `UAApp.jsx` render | `id="inside"` |
| Footer | `UAApp.jsx` render | `<footer` |
| Transition mode dock | `UAApp.jsx` render (hidden unless `showModes`) | `showModes` |
| Program page shell, top switcher | `UAApp.jsx` render | `{(ovOn)`, `{(switcher)` |
| Program sections | `UAApp.jsx` render | `id="sec-overview"`, `sec-leagues`, `sec-season`, `sec-schedule`, `sec-cost`, `sec-staff`, `sec-players`, `sec-join` |
| Player pop-up | `UAApp.jsx` render | `{(mOn)` |
| `style-hover` / `style-focus` | `.dcN` classes at the end of `src/styles/global.css` | `.dc0:hover` |
| Design tokens (`<helmet>` styles, `:root` colors) | top of `src/styles/global.css` | `:root` |
| Images (`assets/`) | `src/assets/images/`, referenced by file name in `programs.ts` | image key, e.g. `hero-rec` |

### Translating template syntax to JSX

| Design template | JSX in UAApp.jsx |
|---|---|
| `{{ value }}` | `{value}` |
| `<sc-for list="{{ items }}" as="it">` | `{items.map((it, i) => ( ... ))}` |
| `<sc-if value="{{ flag }}">` | `{flag ? ( ... ) : null}` |
| `sc-camel-on-click="{{ fn }}"` | `onClick={fn}` |
| `style="a:b;c:{{ x }}"` | `style={{a: "b", c: x}}` |
| `style-hover="..."` | add a `.dcN:hover{... !important}` rule in global.css and `className="dcN"` |
| `<image-slot src=...>` | `<img>` with `objectFit` and `borderRadius` |
| any value read in the template | must be returned from `renderVals()` and added to the destructure at the top of `render()` |

### Things that exist only in the site (keep them when porting)

- Routing: `nav()`, `silently()`, the `popstate` listener and `initial` prop (program URLs, back button).
- `resolveContent()` and the `assets` prop (optimized image URLs from `src/lib/assets.ts`).
- `<RecFormats />` inside `sec-leagues` for the Rec program, and `isRec` in `renderVals()`.
- No em dashes in copy.

## Locations map

Built (October 2026) from `extra/Utah Map.html` as a native component, per the handoff README.

- Hubs, cities, zone colors and service counties: `src/data/locations.ts`. In the prototype these are `SITES`, `CITIES`, `TONES`, `SERVICE` and `FAR` at the top of the map script.
- Geometry: `src/data/utah-geo.json`, cut from us-atlas at build time by `npm run geo:build` (the prototype fetched it from a CDN at runtime).
- Changes from the prototype: the search label reads "Find your nearest field" for Rec and Futures (no tryouts); on phones the finder and hub cards scroll sideways above the map, and one finger scrolls the page while two fingers pan the map.
- Still to do: the official city-to-hub assignment (zones are nearest-hub for now) and sending the matched hub with form submissions.
