# Utah Athletic website

Astro site for utathletic-club.com.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
```

## Edit content

Most changes are one-line edits in `src/data/`:

- `programs.ts`: program copy, prices, seasons, schedules, staff, sessions
- `rec-formats.ts`: rec divisions, field sizes, game rules, combining policy

Push to `main` and Vercel deploys in about a minute. Push to any other branch to get a preview link.

## Structure

```
src/
  data/        content (edit here)
  assets/      images (optimized at build)
  layouts/     page shell, header, footer
  pages/       routes
  styles/      design tokens
docs/          internal notes and the original design prototype (not published)
```
