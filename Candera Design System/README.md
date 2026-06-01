# Candera — Design System

> _"This feels like a ritual, not a purchase."_

**Candera** is a luxury botanical candle storefront — hand-poured, micro-batch candles
born from "16 hours of intention." Each vessel is numbered, embedded with pressed
botanicals and shells, cured for two weeks in a dark room, and sold as a finite batch.
This is a headless e-commerce storefront for the spiritual/ritual buyer who treats scent
as a practice, not decoration (Otherland / Boy Smells territory).

- **Space:** Premium DTC home goods / wellness / botanical
- **Project type:** Headless e-commerce storefront (React 19 + Vite + Tailwind v4), with a Payload CMS backend
- **Catalog source:** Live Etsy listings via `/api/etsy/listings`, with a curated `products.json` fallback
- **Memorable sentence:** _Every design decision serves "ritual, not purchase."_

---

## Sources

This design system was reverse-engineered from the brand's own repositories. If you have
access, explore them to build richer, more accurate Candera designs:

| Source | URL | What's there |
| --- | --- | --- |
| **Frontend storefront** | https://github.com/ohdaveed/candera-frontend | React/Vite storefront, `DESIGN.md` (the canonical design spec), pages, components, product data, photography |
| **Payload CMS backend** | https://github.com/ohdaveed/candera-payload | Headless CMS / content backend (Payload + Next.js) |

The single most authoritative file is **`DESIGN.md`** in `candera-frontend` — it is a
formal design-consultation output ("Approved mockup: Variant C") that defines the palette,
type, spacing, radius, and motion exactly as reproduced here.

> **Note on fonts:** Candera uses three Google Fonts — **Fraunces** (display), **EB Garamond**
> (editorial), and **DM Sans** (UI) — loaded from the Google Fonts CDN. The brand's `DESIGN.md`
> originally specified **Cormorant** for the editorial role; it was swapped to **EB Garamond**
> here for legibility at body size (same warm-classical mood, far easier to read small). All
> three are Google Fonts — no local font files ship with the brand.

---

## Content Fundamentals

Copy is the soul of Candera. It reads like a **field journal kept by a botanical chemist** —
unhurried, devotional, materially specific. It sells a feeling and a practice, never a
"product."

- **Voice:** First-person-plural studio ("**we** choose a sensory revolution," "**our** pure
  products"). Addresses the reader as an initiate, not a shopper. Warm, grounded, slightly
  sacred — never salesy, never exclamatory.
- **Tone:** Solemn and slow. "An invitation to slow down." "A site that knows you'll wait
  for it." Scarcity is framed as devotion, not urgency: _"Each Candera batch is numbered and
  finite… This is not a newsletter. It is a correspondence between the studio and those who
  collect with intention."_
- **Casing:** Sentence case for prose. **UPPERCASE with wide letter-spacing** for eyebrows,
  nav, labels, badges, and buttons (e.g. `HAND-POURED IN THE STUDIO`, `THE CURRENT BATCH`).
  The wordmark is always all-caps: **CANDERA**.
- **Recurring vocabulary:** _ritual, vessel, batch, the studio, cure, micro-batch, botanical,
  intention, sensory revolution, pure products, the Inner Circle, hand-poured._ Products are
  **"vessels,"** numbered (`Vessel 001`); collections are **"batches"** (`Batch 014`).
  Customers are **"Ritualists"** / **"Collectors."**
- **Scent writing:** EB Garamond italic, sensory and literary. _"Capturing the raw, mineral
  breath of the Pacific. A softly salty sea breeze meets sun-warmed sand at the threshold of
  dusk."_ Scent is structured as **Top / Heart / Base**.
- **Punctuation:** Em-dashes and mid-dots (`·`) for rhythm — _"15 oz · Soy & beeswax blend"_,
  _"50 Hours burn · Coastal."_ Periods used as full stops in headlines ("Meet the Maker.",
  "16 Hours of Intention.").
- **Emoji:** **Never.** No emoji anywhere. Visual punctuation comes from line rules,
  mid-dots, and a single Lucide icon at most.
- **CTAs:** Quiet imperatives, not hype: _Explore the Collection · Shop the Batch ·
  Request Entry · Take the Scent Quiz · View details →._

---

## Visual Foundations

**Direction:** _Mineral stillness with botanical warmth._ Sun-bleached, hand-touched,
unhurried. Not cold luxury — warm, grounded, slightly sacred.

### Color
A desaturated, high-editorial palette where the colors tell the same story as the product:
high-desert stillness + botanical warmth. Warm cream (**Vellum** `#F5F2ED`) is the primary
ground; white sections carry the catalog; **Obsidian** `#141412` is the only "black."
**Dusk Rose** `#B28C9C` is the **primary brand color** — a muted, dusty pink (logos, "New Release", primary accents); **Ember** `#DD7D52`
is the terracotta warmth used for CTAs, hover states, eyebrows, and "ritual moments."
**Sage** `#7A8174` and **Stone** `#DACBB8` handle secondary text and borders. (For small text & white-on-color CTAs, AA-safe deepened variants of Sage / Ember / Dusk Rose are defined in `colors_and_type.css`.) A dark
"Nocturnal" inversion (obsidian ground, Dusk Rose type) exists for evening/editorial pages.
See `colors_and_type.css` for the full token set.

### Typography
Three fonts, three jobs, **no Inter, no Playfair**:
- **Fraunces** (display) — wordmark, hero, product names. Variable optical-size on
  (`font-optical-sizing: auto`); at hero scale it reads _pressed, not rendered_. Almost
  always **italic** in headlines.
- **EB Garamond** (editorial) — pull quotes, scent descriptions, About/Ritual prose. Warm,
  classical, and legible at body size (chosen over Cormorant, which got too thin/small in
  running text); use italic for the devotional voice.
- **DM Sans** (body/UI) — all body, nav, labels, prices (`tabular-nums`), buttons.
Modular **1.25 (Major Third)** scale. Eyebrows are tiny (10px) with `0.3em` tracking.

### Spacing & Layout
8px base unit; **generous** density — ritual brands need breathing room. Minimum **96px**
between page sections ("the site should feel like turning pages, not scrolling a feed").
Max content width **1280px**, 12-col desktop grid. Collections use a spare **2–3 column**
grid (never 4-up dense), each card tall and image-dominant (4:5). Editorial pages use a
**45/55 two-panel** split (field / vellum).

### Backgrounds & Texture
No gradients-as-decoration, no blobs, no pattern fills. Texture is **material evidence of
handcraft**: a faint grain/noise overlay (`opacity ~0.04`, `mix-blend-overlay`) on key dark
surfaces only. Backgrounds are either flat warm fields (vellum / white / stone-50 / obsidian)
or **full-bleed botanical photography** dimmed with a dark scrim (`brightness ~0.62`) so white
type sits on top. Radial vignettes are used sparingly on the Nocturnal hero.

### Photography
Naturalistic, warm, shot in real daylight. Hand-poured candles embedded with pressed
flowers, shells, and botanicals — range from **bright & airy** (Seashell Garden) to
**moody & intimate** (Crimson Noir, near-black wax with dried blooms). Slightly desaturated,
warm-leaning. Founder/lifestyle shots are **grayscale**. Hard crops, no rounded corners.

### Motion
Intentional, never bouncy. **No** spring physics, bounce, scale-up entrances, or hover lifts.
**Yes** slow opacity fades and deliberate `y: 12→0` translate entrances (the `slow-fade`
keyframe), scroll-driven reveals. Easing: enter `cubic-bezier(0.4,0,0.2,1)`, exit
`cubic-bezier(0.4,0,1,1)`. Durations: micro `100ms`, entrance `800–1200ms`, section reveal
`1000ms`.

### Interaction states
- **Hover:** color shift to **Ember** (links, nav, CTAs go terracotta), or a slow `2s`
  image `scale(1.05–1.10)` zoom inside a fixed crop. Buttons darken (`bg/80`).
- **Press:** buttons nudge down `translateY(1px)` — no shrink, no shadow pop.
- **Focus:** 2px ring in Dusk Rose at low opacity (`ring/30`).

### Borders, radius & elevation
**Nearly square throughout.** Buttons & images `0px`; cards, inputs, badges `2px`. Borders
are hairline **Stone** (often at 40% opacity) used as dividers and `border-t` section rules.
Elevation is **restrained** — `shadow-sm` and a `ring-1` hairline (`foreground/5`) on cards;
a single large soft shadow (`shadow-2xl`) only on primary hero CTAs. No glassmorphism beyond
a light `backdrop-blur` on the sticky nav and image-corner badges.

### Cards
Image-dominant. Tall 4:5 photo crop, a corner tag/badge (`Batch 00X`, `Bestseller`), then a
title-row with a `border-b` rule separating the product name (Fraunces italic) and price
(DM Sans tabular), a Top/Heart/Base fragrance grid, and a full-width square CTA. Hover lifts
nothing — it shifts the title to Ember and slowly zooms the photo.

---

## Iconography

Candera uses **[Lucide](https://lucide.dev)** icons exclusively — thin (`strokeWidth 1.5`),
outline, geometric. They are used **sparingly**: one small icon per moment, never decorative
clusters. Common glyphs in the product: `Menu`, `X`, `ShoppingBag`, `Sparkles` (Scent Quiz),
`ArrowRight` (CTAs), `Star` (testimonials), `Mail`, `BadgeCheck`, `Clock` (burn time),
`Camera` / `MessageSquare` / `Globe` / `ExternalLink` (footer social + Etsy).

- **No icon font or custom SVG sprite ships with the brand.** (The repo's `icons.svg` and
  `favicon.svg` are leftover Vite/starter assets — a purple developer mark and dev-platform
  social glyphs — and are **not** Candera brand assets. They are intentionally excluded here.)
- **No emoji, ever.** No unicode dingbats. Visual punctuation is line rules, mid-dots (`·`),
  and arrows (`→`).
- **The logo is the wordmark itself** — `CANDERA` set in Fraunces, bold, tight tracking. There
  is no pictorial logomark.

**Usage in this system:** load Lucide from CDN —
`<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or use
inline `<svg>` copied from lucide.dev. Keep `stroke-width` at `1.5`, size `14–20px`.

---

## What's in here (index)

| Path | What it is |
| --- | --- |
| `README.md` | This file — context, content + visual foundations, iconography, manifest |
| `colors_and_type.css` | All design tokens: color, type, spacing, radius, shadow, motion + semantic classes |
| `SKILL.md` | Agent Skill manifest (for use as a downloadable Claude skill) |
| `assets/images/` | Product photography (6 candle vessels) + lifestyle/about imagery |
| `preview/` | Small specimen cards rendered in the Design System tab (colors, type, components, spacing) |
| `ui_kits/storefront/` | High-fidelity recreation of the Candera storefront — `index.html` + JSX components |

### UI Kits
- **`ui_kits/storefront/`** — the editorial e-commerce storefront: sticky nav, hero, product
  grid, product detail, the Inner Circle / Scent-Quiz moments, footer. See its own
  `README.md`.

---

_Reverse-engineered from `candera-frontend` and `candera-payload`. The brand's `DESIGN.md`
remains the canonical spec; this system reproduces and operationalizes it for design work._
