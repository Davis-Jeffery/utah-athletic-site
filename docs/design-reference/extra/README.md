# Handoff: Utah Athletic site update → Astro

## How to use this
Drop this folder into the root of the existing Astro repo (e.g. `/design_handoff_utah_athletic`) and tell Claude Code:

> Implement the Utah Athletic redesign described in `design_handoff_utah_athletic/README.md` in this Astro project. Use the HTML files in `design/` as the visual reference. Follow the existing project's conventions; create content collections for programs, regions, tryouts and events as specified.

The files in `design/` are **design references built in HTML** (they open in a browser — open `design/Utah Athletic Programs.dc.html`). They are not production code. Recreate them as Astro pages/components; do not ship the `.dc.html` files, `support.js` or `image-slot.js`.

**Fidelity: high.** Colours, type, spacing, layout and interactions are final. Copy, names, dates, venues, staff, Ollie links and event URLs are **placeholders** unless noted.

---

## Routes
| Route | Reference | Notes |
|---|---|---|
| `/` | `Utah Athletic Programs.dc.html` (home state) | Hero collage + pyramid, Tryouts near you, Tournaments strip, Where the pathway leads, Inside UA |
| `/academy`, `/club`, `/rec`, `/futures` | same file, program state (Overview tab) | Shared template driven by the program record |
| `/[program]/[region]` (`north` · `south` · `west`) | same file, region tab | Deep-linkable. Prototype uses `#/academy/north` hashes — use real routes |
| `/tryouts` | `Tryouts.dc.html` | `?region=&level=` query params |
| `/events` | `Events.dc.html` | |
| `/network` | `Athletic Network.dc.html` + `Network Map.html` | |
| `/contact` | `Contact Us.dc.html` | `?region=&program=` prefill |

Top nav (all pages): Programs · Network · Tryouts · Tournaments & Events · Contact, plus region indicator (home/program pages) and **Tryouts 2027 →** button linking `/tryouts?region=<remembered>`.

## Content collections (single source of truth)
Model these as Astro content collections (`src/content/…`) so staff can add/edit without code changes. Seed data is in `design/tryouts-data.js` and `design/events-data.js`.

- **programs** — `id` (academy|club|rec|futures), name, tier label, ages, tagline, intro, `kind` (`tryout` | `season`), `invite` (bool, Academy only), **`registerUrl` (Ollie link — lives here only, never typed into pages)**, status per region: `{ north|south|west: { status: active | soon | none, season?, hub, feeDelta? } }`, development model copy, comparison-table values.
- **regions** — id, label, area, Managing Director, Director of Coaching, email.
- **tryouts** — one entry per event: program, region, venue ref, date, time, age group, gender. Register button = `programs[program].registerUrl`.
- **venues** — name, address (map link = Google Maps search URL).
- **seasons** (Rec/Futures) — Session 1 Nov–Dec, Session 2 Jan–Mar; start date, sign-up note.
- **events** — name, tagline, start, end, regOpen, regClose, location, format, ages, external `url`, logo, `brand { bg, bg2, ink, accent, mono }`. **Status is computed from dates**: before regOpen → *Coming*; regOpen–regClose → *Registration open*; regClose–end → *Registration closed*; after end → *Past*. Sort: open, coming, closed, past.

Tryout data appears in 3 places from the same collection: `/tryouts` table, each program's region tab (first 4 rows + "All [region] tryouts →"), and the home "Tryouts near you" (next event per level for the remembered region).

## Region memory
Cookie `ua_region` (1 year, path `/`) + `?region=` param. Picking a region anywhere sets it; Club/Rec and `/tryouts` open on it. Use a small client island for the header region menu and the Tryouts filters.

## Pages — key specs

### Home
- **Hero background: rotating photo collage** — 6×3 grid, 4px gaps, 11 tiles of mixed spans; each tile crossfades (1.4s opacity + 7s scale 1.08→1) to its next photo; one tile advances every 1.7s in shuffled order; paused when tab hidden. Photos `assets/collage/c01–c20.jpg`, treated `grayscale(1) contrast(1.2) brightness(.82)` + teal colour layer (`#78b7b3`, `mix-blend-mode: color`, .5) + left-to-right dark gradient for legibility. Respect `prefers-reduced-motion` (show static grid).
- Headline "Every level. **One standard.**" (second line `#78b7b3`).
- **Pyramid** (SVG): Professional / Athletic Global (top, no price/age/tryout — links `/network`), Academy, Club, Recreation + Futures. Click → full-screen program transition.
- **Tryouts near you** — 4 cards (one per level) for the remembered region.
- **Tournaments strip** — 4 cards from the events collection, sub-brand gradient top + status badge, link out.

### Program page (shared)
Sticky sub-nav: Overview · North · South · West.
- **Hero**: program photo (Academy: `assets/academy-hero-team.png`), kicker `Tier 0X · …` followed by an outlined **Age groups** pill; huge title; tagline; **status row** (status: *Accepting player trial applications* / *Open tryouts*; Next open tryout; Tryout registration) + button that jumps to the tryout/trial section. Academy: Next tryout **May 2027**, Registration **Opens, Jan. 1, 2027**; Academy & Club currently *Accepting player trial applications*.
- **01 Who it's for** — text left, photo right with hard angled left edge (`clip-path: polygon(16% 0,100% 0,100% 100%,0 100%)`), square right, no radius, full colour, height matches text column (min 260px). No cards.
- **CTA band** "Do you have **what it takes?**" — slim, photo bg, button to trial/tryout form.
- **02 Development — "We develop the complete player."** Orbit diagram: centre player photo, 4 principle circles (Technical, Tactical, Physical, Mental) on diagonals; hover shows title, click opens modal with deeper explanation + photo; legend list on the left with tags and one-line descriptions; "x / 4 explored" counter.
- **03 Competition** — league cards (ECNL / EA logos top-right on Academy).
- **Where we train** — statewide hub map (`Utah Map.html`, d3 + us-atlas, Voronoi service zones in teal ramp, city search).
- **06 Compare programs** — table Futures · Rec · Club · Academy; current program column widest, teal outline + "Viewing". Rows: Training/week (2× · 1× · 3× · 4–5×), Licensed coaching, Competition, Year-round (Club & Academy: "Tryouts & team placement every May"), Player evaluations, Strength & conditioning (Academy only: 1×/week year-round), Film & video review (Academy: 2×/month), Mental performance seminars (Academy: 2×/month), Next step. **No pricing anywhere on Academy.** Club/Rec show "Fees by region" below.
- Leadership; Regions overview.
- **Region tab**: regional lead → coaching staff → Tryouts (posted dates from collection + trial application/registration form) → Fees (Club/Rec only) → "Want to contact our leaders?" CTA → `/contact?region=&program=`. Status `soon` (e.g. West Academy, Fall 2027) shows a Coming state with regional lead + interest form, never a 404.
- Player spotlight and regional venue section are **removed**.

### /tryouts
Sticky filter bar (Region segmented + Level segmented incl. All, + "Showing: North · Academy · 6 sessions" badge, 2px teal bottom line). Hero with photo bg. Results grouped by level; rows wrap into cards on mobile: Age group · Gender · Date · Time · Location (map link) · **Register** (44px min). Rec/Futures show season session cards instead. Academy shows "Request an invitation to trial" form routed by region. Supporting cards: What to bring, Missed your date? (private trial), Regional contact.

### /events
Hero with photo; status filter chips with counts; card grid (sub-brand panel, logo slot, monogram watermark, status badge, dates/location/format/ages, external button whose label follows status); "Bring your club" + "Sponsor an event" blocks; horizontal highlight reel.

### /contact
Main office email; regional leadership cards; form with Topic, Program, "Reach a specific regional leader?" (No / North / South / West) → "Which leader?" (MD / DoC / Either) and a live "To:" line.

## Design tokens
- bg `#111318`, surface `#1b1d24`, text `#e9e9ed`, muted `#8b8d98`, divider `rgba(233,233,237,.1)`.
- Brand: black, white (`#e9e9ed`), teal `#78b7b3` (300 `#b5e1dd`, 800 `#305351`). Full ramp in `design/nocturne.css` + the `:root` block in each page's `<style>`.
- Inter, headings weight 500, tight tracking (−.03 to −.06em). Kickers 11–12px uppercase .12–.16em.
- Buttons are **outlined** (1px teal), never filled. Focus: `2px solid #78b7b3`, offset 2px. Min tap target 44px.
- Radii 8–14px. Rules fade to transparent at the ends. Icons: Phosphor.
- Photos: site-wide treatment is grayscale + teal colour layer; exceptions: "Who it's for" photo is full colour.

## Forms / integrations
Forms are front-end only in the prototype. Recommended: form → Zapier/Make → Airtable (player DB) + confirmation email + routing sheet (program × age × region → coach & director emails). Registration buttons go to Ollie via `programs.registerUrl`.

## Assets
- `assets/ua-logo.avif` — club logo.
- `assets/collage/c01–c20.jpg` — club photography (home collage, Tryouts/Events heroes, highlight reel).
- `assets/academy-hero-team.png` — Academy hero.
- `assets/badge-ecnl.png`, `assets/badge-ea-crop.png` — league logos (ECNL source is low-res; get vector).
- Other program heroes / section photos are Unsplash placeholders (hot-linked) — replace with club photography.
- Event logos: not supplied — slots shown on cards.
- Map geometry: us-atlas (U.S. Census Bureau) via CDN.

## Placeholders to replace before launch
Ollie URLs (`ollie.example`), all tryout dates/venues/times, event details/colours/URLs (`example.com`), staff names & emails, Rec/Futures session dates, program copy marked as filler.
