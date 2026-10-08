# Utah Athletic website

Astro site for utathletic-club.com.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

## Edit content

Most changes are edits to the YAML files in `src/content/`. The build checks every file and tells you exactly what's wrong if something doesn't fit.

- `programs/academy.yaml` (and `club`, `rec`, `futures`): program copy, leagues, season, weekly schedule, staff, where it runs by region, and the Ollie registration link
- `tryouts.yaml`: one line per tryout session (program, region, venue, date, time, age group)
- `seasons.yaml`: Rec and Futures sign-up sessions
- `events.yaml`: tournaments (status updates itself from the dates)
- `regions.yaml`, `venues.yaml`: regional leaders and fields

Also in `src/data/`: `site.ts` (navigation, videos, shared copy), `rec-formats.ts` (rec divisions, field sizes, game rules) and `locations.ts` (map hubs).

Push to `main` and Vercel deploys in about a minute. Push to any other branch to get a preview link.

## Structure

```
src/
  content/     content collections (edit here)
  data/        site-wide copy, map data
  assets/      images (optimized at build)
  components/  React components (app/ is the home and program pages)
  layouts/     page shell
  lib/         content loading, image map, date helpers
  pages/       routes
  styles/      design tokens
docs/          internal notes and the original design prototype (not published)
```
