# Handoff: Utah Athletic — Programs Redesign

## Overview
Dark, interactive redesign of utathletic-academy.com. The home page presents the club's program pyramid (Academy → Club → Recreation + Futures). Clicking a layer expands it into a full-screen program page with: who it's for, leagues, **locations map**, season/year overview, commitment, investment, staff, players (Academy: team tabs U9–U18 + player profile modal), and join/tryout forms. A persistent back control returns to the pyramid; other programs are reachable from the bottom of each program page.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to ship. Recreate them in the target codebase's environment (e.g. Next.js/React, Astro, Webflow) using its patterns. If no codebase exists yet, a React framework (Next.js) with CSS variables for tokens is recommended.

## Fidelity
**High-fidelity.** Colors, type, spacing, and interactions are final. Copy, names, stats, staff, prices other than those listed below, and most photos are **filler**.

## Files
- `Utah Athletic Programs.dc.html` — the full site prototype (home + 4 program pages). Opens in a browser; requires `support.js`, `image-slot.js`, `nocturne.css` alongside.
- `Utah Map.html` — the interactive locations map, embedded per program via `<iframe src="Utah Map.html?p=academy|club|rec|futures">`. In production, build it as a native component (not an iframe).
- `nocturne.css` — design tokens.
- `assets/` — logos and badges.

## Screens / Views

### 1. Home — Pyramid
- Full-bleed hero photo (grayscale, contrast 1.3, brightness .85, `mix-blend-mode: lighten`) with dark gradient fade.
- Headline with "One standard." in teal `#78b7b3`.
- **Pyramid** (SVG, viewBox 600×480): 3 rows — Academy (top), Club (middle), Recreation + Futures side by side (bottom).
  - Rest fill: vertical gradient `#1b1d24` (.88) → `#111318` (.82); stroke `rgba(120,183,179,.5)`; hovered stroke `.75`.
  - Hover/active fill: teal gradient (`#uaFill`); teal blurred glow polygon behind (opacity .22).
  - Drop shadow `0 24px 48px rgba(0,0,0,.6)` and radial dark halo behind for legibility over photo.
  - Labels: kicker in `--color-accent-300`, ages in `--color-neutral-300`. Hint text "Hover a level…" `--color-neutral-300`.
  - Intro: rows stagger in bottom-up (~140ms per row).
- Click a layer → open transition: the layer expands to fill the screen (also prototyped: camera zoom, curtain slide-up).

### 2. Program page (shared template ×4)
Sticky section nav (scroll-spy) with numbered sections:
1. Who it's for
2. Where we play — league cards. Academy cards show ECNL and EA logos top-right (72px tall, contain).
3. **Locations — "Where we train"** (see Map below)
4. The year — season timeline
5. Commitment
6. Investment — tabs, U9–U11 first (default), then U12–U18
7. Staff
8. Players
9. Join — register / tryout / info forms (tabbed)

Header: full-bleed program photo with teal color overlay (`#78b7b3`, `mix-blend-mode: color`, .55), grayscale. Academy header has ECNL + EA badges (outlined card, 88px logo, caption below).

**Academy specifics**
- Stacked stat blocks (U9–U11 on top):
  - U9–U11: Highest Tier RED X-League Divisions · $2,700 · 3×/week
  - U12–U18: ECNL · Elite Academy League · $3,400 · 4–5×/week
- **Player spotlight**: team tabs U9…U18 (sub-label X-League / EA / ECNL). Team header: league · format (7v7/9v9/11v11), birth year, squad size, head coach, record. Roster grouped GK / DEF / MID / FWD in 3:4 cards (number, name, position). Roster fades/slides on tab change (180ms out, .3s in).
- **Player modal**: backdrop blur 8px; panel max-width 1080px, scale/translate in (.4s cubic-bezier(.2,.8,.2,1)). Sticky header with prev/next/close. Portrait + large number; bio chips (born, height, foot, hometown, class of); season stats grid (6 cells; GK variant shows clean sheets/saves/save %); aspirations quote; season goals with progress bars; attribute bars; 3 highlight video tiles. Keyboard: ←/→ step players, Esc closes.

### 3. Locations Map (`Utah Map.html`)
- Data: real geometry from `us-atlas@3` counties-10m TopoJSON (U.S. Census), d3-geo Mercator fitted to Utah. Do not hand-draw.
- Hubs:
  - Academy: North Academy — Murray; South Academy — Orem
  - Club: North — Draper/Sandy; West — Saratoga Springs; South — Orem
  - Recreation & Futures: Primary Hub — Saratoga Springs/Lehi
- **Service zones**: 8 Wasatch Front counties (Weber 49057, Morgan 49029, Davis 49011, Salt Lake 49035, Tooele 49045, Summit 49043, Wasatch 49051, Utah 49049) split into nearest-hub Voronoi cells, clipped to those counties. Fill opacity .2 (hovered .34, others .08); dashed boundaries. **Replace with the club's official city→hub assignment when available.**
- Zone tones (teal ramp): `#78b7b3`, `#d6f0ee`, `#4f8a86`.
- Left panel: "Find your tryout location" city input (datalist, ~45 cities) → result "City → Hub · Location", flies map to midpoint and marks the city. Hub cards list cities served.
- Controls: Wasatch Front / All of Utah / + / −; drag to pan; ctrl+wheel zoom. Opens on full state, flies to Wasatch Front after 500ms (1.4s ease-in-out). City dots appear at zoom > 3, labels at > 4.5.
- Container: dark frame `linear-gradient(160deg,#171920,#0d0f13)`, radius 14px, shadow `0 24px 60px rgba(0,0,0,.45)`.

## Interactions & Behavior
- Program open/close animation ~600–800ms, cubic-bezier(.2,.8,.2,1). Esc closes program page.
- Hover states: teal border/glow; buttons outlined (never filled).
- Focus: `outline: 2px solid #78b7b3; outline-offset: 2px`.
- Forms are front-end only in the prototype. Recommended backend: form → Zapier/Make → Airtable (player DB) + confirmation email + routing sheet (program × age × hub → coach & director emails). Each submission should include program, age group, and hub (from map match).

## State
- `active` program, `busy` (transition lock), `sec` (scroll-spy), investment `grp`, join `tab`, `team` index, `player` index (modal), `mIn` (modal anim).
- Map: active hub, picked city, zoom transform.

## Design Tokens
- Background `#111318`, surface `#1b1d24`, text `#e9e9ed`, muted `#8b8d98`, divider `rgba(233,233,237,.1)`.
- Brand: black, white (as `#e9e9ed`), **teal `#78b7b3`** (accent-300 `#b5e1dd`, accent-800 `#2a4442`).
- Type: Inter, headings weight 500, tight letter-spacing (−.03 to −.05em); kickers 11–12px uppercase, .12–.14em tracking.
- Radii 7–14px; shadows per `nocturne.css` `--shadow-sm/md/lg`.
- Icons: Phosphor.

## Assets
- `assets/ua-logo.avif` — Utah Athletic logo (client-provided).
- `assets/badge-ecnl.png`, `assets/badge-ea-crop.png` (+ webp) — league logos (client-provided; ECNL source is low-res 58×83 — get vector).
- Hero/program photos: Unsplash placeholders (hotlinked in prototype) — replace with club photography, ≥2000px wide.
- Docuseries thumbnails: YouTube (t9Se3i_CBwo, jJI_pFfA_xI, 47JdWoQT9Lo).
- Map geometry: us-atlas (U.S. Census Bureau).
