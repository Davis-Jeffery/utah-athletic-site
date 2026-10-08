# Utah Athletic Studio

Sanity Studio for editing site content. Editors use the hosted version at https://utah-athletic.sanity.studio. Publishing rebuilds the live site.

## Run locally

```bash
cd studio
cp .env.example .env   # add SANITY_STUDIO_PROJECT_ID
npm install
npm run dev            # http://localhost:3333
```

## Deploy

```bash
npm run deploy         # publishes the Studio to utah-athletic.sanity.studio
```

## What's where

- `schemaTypes/`: one file per content type. `helpers.ts` holds the shared rules (no em dashes, placeholder link warnings, age, time and month pickers).
- `structure.ts`: the sidebar. Programs, regions and site settings are fixed documents (ids `program.<key>`, `region.<key>`, `siteSettings`) that can't be created or deleted from the Studio, because page addresses depend on them.
