# Utah Athletic website

Marketing site for Utah Athletic Soccer Club (utathletic-club.com). Astro, static output, deployed on Vercel.

## How this repo works

- **The site is one React island**, `src/components/UAApp.jsx` (ported from the Claude Design prototype in `docs/design-reference/`). It renders the pyramid home page and opens each program as an overlay with the expand transition. Opening a program pushes `/programs/<key>/`; back/forward and Escape work.
- **Every program has a real static URL** (`src/pages/programs/[slug].astro`) that renders the app with that program already open, for sharing and search.
- **Content lives in `src/data/`.** Prices, dates, copy, schedules and staff are in `programs.ts`; rec play formats are in `rec-formats.ts` (rendered by `RecFormats.jsx` inside the Rec program's Competition section). Change content there, not in component markup.
- **Images** go in `src/assets/images/` and are referenced from data files by file name without extension. `src/lib/assets.ts` optimizes them to WebP at build time and passes URLs to the app.
- **Styles:** design tokens and the hover/focus rules (`.dcN` classes) are in `src/styles/global.css`. Component styling is inline in `UAApp.jsx`, matching the prototype. Use the CSS variables; don't hardcode new colors.
- **Transition modes:** `expand` is the default. `zoom` and `curtain` also exist; pass `transition="zoom"` to `UAApp`, or `showModes` to show the picker dock while testing.
- `docs/` is internal and never published. `docs/rec-program-plan.md` holds rec program decisions.
- **Design updates:** follow `docs/DESIGN-SYNC.md`. Run `npm run design:extract -- <export.html>`, diff `docs/design-reference`, and port only what changed using the map in that doc.

## Deploying

- Push to `main` deploys to production automatically on Vercel.
- Any other branch gets a preview URL. Use a branch for anything that needs review before going live.
- Always run `npm run build` before pushing; fix errors first.

## Writing rules

- No em dashes in any copy. Use periods, commas or colons instead.
- Keep copy short and parent-friendly. Ages are written U5, U9 to U12, etc.

## Open work

- Registration and info forms show a success message but don't submit anywhere yet. Wire them to LeagueApps (link out) or a form service.
- Academy roster/player data is generated placeholder data from the prototype (`TEAMS` in `UAApp.jsx`). Replace with real rosters or hide before launch.
- Header links Staff, Copa Athletic and News are placeholders.
- Rec page: formats for U5 to U9 are defined; U10+ still to be decided.
- `UAApp.jsx` is one large file from the port. Split it into components (Home, Pyramid, ProgramOverlay, sections) as you touch it.
