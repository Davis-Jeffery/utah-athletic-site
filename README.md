# Utah Athletic website

Astro site for utathletic-club.com.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

## Edit content

Content (programs, tryout sessions, Rec and Futures sessions, events, venues, regional contacts, photos and site-wide links) is edited in the Sanity Studio: https://utah-athletic.sanity.studio. Click Publish and the live site rebuilds in about a minute.

For editors: [docs/EDITOR-GUIDE.md](docs/EDITOR-GUIDE.md) is a one-page cheat sheet (where to change things, adding tryout sessions, swapping photos, undoing mistakes).

Layout and structure stay in code: `src/data/site.ts` (navigation, pyramid, compare rows), `src/data/rec-formats.ts` (rec divisions and rules) and `src/data/locations.ts` (map hubs). Push to `main` and Vercel deploys; push to any other branch for a preview link.

To work on the Studio itself: `npm run studio` (http://localhost:3333).

## Structure

```
src/
studio/       Sanity Studio and content schemas
  data/        site-wide copy, map data
  assets/      images (optimized at build)
  components/  React components (app/ is the home and program pages)
  layouts/     page shell
  lib/         content loading, image map, date helpers
  pages/       routes
  styles/      design tokens
docs/          internal notes and the original design prototype (not published)
```
