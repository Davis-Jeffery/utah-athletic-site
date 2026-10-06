# Utah Athletic website

Marketing site for Utah Athletic Soccer Club (utathletic-club.com). Astro, static output, deployed on Vercel.

## How this repo works

- **Content lives in `src/data/`.** Prices, dates, copy, schedules and staff are in `programs.ts`; rec play formats are in `rec-formats.ts`. Change content there, not in page markup.
- **Images** go in `src/assets/images/` and are referenced from data files by file name without extension (see `src/lib/images.ts`). Astro optimizes them at build time.
- **Design tokens** are in `src/styles/global.css`. Use the CSS variables; don't hardcode colors.
- **Pages:** `src/pages/index.astro` (home) and `src/pages/programs/[slug].astro` (Academy, Club, Rec, Futures).
- `docs/` is internal and never published. `docs/rec-program-plan.md` holds rec program decisions. `docs/design-reference/` holds the original Claude Design prototype (template + page script) for porting.

## Deploying

- Push to `main` deploys to production automatically on Vercel.
- Any other branch gets a preview URL. Use a branch for anything that needs review before going live.
- Always run `npm run build` before pushing; fix errors first.

## Writing rules

- No em dashes in any copy. Use periods, commas or colons instead.
- Keep copy short and parent-friendly. Ages are written U5, U9 to U12, etc.

## Current work

- Port the full prototype design (animated hero, program pyramid, transitions) from `docs/design-reference/` into Astro components. Keep it fast: plain CSS and small client scripts, no runtime React unless a component truly needs it.
- Rec page: formats for U5 to U9 are defined; U10+ still to be decided.
- Registration links (LeagueApps) are placeholders. Add `registerUrl` to each program in `programs.ts`.
