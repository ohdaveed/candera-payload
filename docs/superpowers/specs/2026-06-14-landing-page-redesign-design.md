# Landing Page Redesign — Design Spec

**Date:** 2026-06-14  
**Branch:** fix/code-review-findings  
**Mockup:** `full-page-composite-v10.html`

---

## Overview

Redesign the Candera storefront landing page across seven sections. The goal is an editorial, artisan aesthetic with clear conversion hierarchy and WCAG AA contrast compliance. The page is built on Next.js App Router + Payload CMS blocks.

---

## Page Architecture (locked)

| # | Section | Block / Component |
|---|---------|-------------------|
| 1 | Hero | `StorefrontHero` |
| 2 | Scent Quiz CTA | `ScentQuiz` (static CTA band, triggers existing modal) |
| 3 | The Collection | `ArchiveBlock` → `CollectionArchive` → `Card` |
| 4 | Community Testimonials | `Testimonials` (new block) |
| 5 | From the Studio | `ArchiveBlock` (posts) → blog card grid |
| 6 | Join the Inner Circle | `InnerCircleCTA` |
| 7 | Footer | `Footer` (global) |

The Scent Quiz moved from position 4 to position 2 to intercept decision fatigue before the catalog. The quiz UI itself remains the existing modal — the CTA band is a new static wrapper.

---

## Design Tokens

All values map to existing CSS custom properties in `src/app/(frontend)/theme.css`.

| Token | Value | Usage |
|---|---|---|
| `--color-obsidian` | `#1a1714` | Dark section backgrounds, body text |
| `--color-vellum` | `#f5f0e8` | Light section backgrounds |
| `--color-parchment` | `#f0ece4` | Page background, blog section |
| `--color-ember` | `#c4a882` | Accent, rules, tags, hover states |
| `--color-sage` | `#8a7d6e` | Eyebrow labels, muted body text |
| `--color-ink` | `#0f0d0b` | Card titles, highest-contrast text |

Typography:
- **Headings / quotes:** Playfair Display, italic, `font-style: italic`
- **UI / body:** Inter

---

## Section Specs

### 1. Hero — `StorefrontHero`

**Layout:** Full-bleed dark image, left-aligned content overlay, no right aside.

- Background: full-bleed image at `brightness(0.38)`, linear-gradient overlay `110deg` from `rgba(8,6,4,0.95)` → transparent
- Content container: `max-width: 600px`, `padding: 72px 52px 56px`
- Eyebrow: `9px / 600 / 4px letter-spacing`, color `--color-ember`, with 28px rule line left
- H1: Playfair Display italic, `clamp(48px, 6.5vw, 76px)`, color `--color-vellum`, `line-height: 1.0`
- Rule: 40px × 1px `--color-ember` divider between H1 and subheading
- Subheading: Playfair Display italic, `14px`, `rgba(255,255,255,0.65)`
- CTAs: two side-by-side buttons
  - Primary: `background: --color-ember`, `color: #0a0806`, `padding: 15px 30px`, `font-size: 9px / 700 / 3px letter-spacing / uppercase`
  - Ghost: `background: transparent`, `border: 1px solid rgba(240,236,228,0.4)`, same text treatment

**No status strip. No right editorial aside.**

---

### 2. Scent Quiz CTA Band — `ScentQuiz`

**Layout:** Full-width dark (`--color-obsidian`) horizontal band, two-column: text left, button right.

- Background: `#1a1714`, `padding: 48px 52px`
- Grid: `grid-template-columns: 1fr auto`, `align-items: center`, `gap: 40px`
- Left column:
  - Eyebrow: same spec as hero eyebrow, color `#6b5e50`
  - H2: Playfair Display italic, `26px`, color `--color-vellum`
  - Body: `13px`, color `#8a7d6e`, `max-width: 440px`
- Right: single button `background: --color-ember`, `color: #0a0806`, `padding: 16px 32px`, uppercase label "Take the Scent Quiz →"
- Border bottom: `1px solid rgba(196,168,130,0.12)`

**Interaction:** Button opens the existing `ScentQuiz` modal (already implemented). No quiz logic lives in this component.

---

### 3. The Collection — `ArchiveBlock` + `Card`

**Layout:** Two-column CSS grid, `280px` left sidebar + `1fr` product grid. Both columns share the same `padding-top: 28px` so their top edges align.

**Left sidebar (sticky):**
- `position: sticky; top: 0; align-self: start`
- `padding: 28px 36px 28px 52px`
- `border-right: 1px solid rgba(180,160,130,0.18)`
- Content: eyebrow + serif H2 "Not manufactured. Made." + body paragraph + "View all" link
- View all: `display: inline-flex`, `padding: 13px 20px 13px 0`, `border-bottom: 1px solid --color-ember` — real hit target, not bare text

**Product grid (right):**
- `padding: 28px 52px 28px 0`
- 3-column grid, `gap: 12px`

**Card (`src/components/Card/index.tsx`):**
- Image: `aspect-ratio: 4/5`, full-bleed, `object-fit: cover`
- Tag badge: `position: absolute; top: 16px; left: 16px` — never at 0px edge. `background: rgba(8,6,4,0.84)`, white text, `8px / 700 / 2px letter-spacing`
- Body padding: `16px 16px 18px`
- Three-tier typographic hierarchy (visually distinct, no blending):
  - Category: `9px / 400 / 3px letter-spacing / uppercase`, color `#b8aa98` (faint)
  - Title: Playfair Display, `16px`, color `#0f0d0b` (darkest)
  - Price: `13px / 600`, color `#4a3f34`, `margin-top: 10px` (clear gap from title)

---

### 4. Community Testimonials — new `Testimonials` block

**Layout:** Two-column dark grid (`background: --color-obsidian`), `1fr 1fr`.

**Left (featured):** `padding: 52px 48px`, `border-right: 1px solid rgba(196,168,130,0.1)`
- Eyebrow: `9px / 600 / uppercase`, color `#6b5e50`
- Large decorative quote mark: Playfair Display `56px`, `--color-ember` at `opacity: 0.18`
- Quote: Playfair Display italic, `20px`, color `--color-vellum`, `line-height: 1.6`
- Attribution: `9px / 600 / 2px letter-spacing / uppercase`, color `--color-ember`

**Right (two stacked):** Each cell `padding: 30px 40px`, `flex: 1`, `border-bottom: 1px solid rgba(196,168,130,0.07)`
- Quote: Playfair Display italic, `13px`, color `#b0a090`
- Attribution: `8px / 600 / uppercase`, color `#6b5e50`

---

### 5. From the Studio — `ArchiveBlock` (posts)

**Layout:** `padding: 60px 52px`, background `--color-parchment`. Section header + asymmetric editorial grid.

**Section header:**
- Eyebrow + Playfair serif H2 `30px` + Playfair italic subline `14px / #6b5e50`

**Blog grid:** CSS grid `grid-template-columns: 1fr 1fr`, `grid-template-rows: 1fr 1fr`, `height: 480px`, `gap: 10px`

**Featured card** (spans 2 rows):
- Full-bleed image
- Gradient overlay: `linear-gradient(to top, rgba(6,4,2,0.93) 0%, rgba(6,4,2,0.18) 58%, transparent 100%)`
- Bottom text block: eyebrow + italic H2 `21px` + italic excerpt `11px` + "Read the Story →" link

**Supporting cards** (2 stacked right):
- Same gradient overlay treatment as featured — no solid dark bars
- Bottom text: eyebrow + title `14px`

**Footer link:** Centered "View all posts", `9px / uppercase / 3px letter-spacing`, `border-bottom: 1px solid --color-ember`

---

### 6. Join the Inner Circle — `InnerCircleCTA`

**Layout:** Two-column grid (`1fr 1fr`), `align-items: center`, background `--color-obsidian`, `padding: 52px`, `gap: 52px`.

**Left column (heading only — no bullets, no competing content):**
- Eyebrow with 24px rule line + ember color
- H2: Playfair Display `28px`, color `--color-vellum`
- Body: `14px`, color `#a3a3a3` (neutral-400) — legible on dark bg

**Right column (form + all microcopy below):**
- Email input:
  - `background: #171717` (neutral-900)
  - `border: 1px solid #525252` (neutral-600) — clearly visible against bg
  - `color: #f3f4f6`, `placeholder: #6b7280`
  - Focus: `border-color: #d4d4d4`, `box-shadow: 0 0 0 1px #d4d4d4`
- Submit button: `background: #f5f5f5`, `color: #0a0a0a`, uppercase "Join", `hover: #ffffff`
- Microcopy: single line directly below input — "Early access · Studio notes · No spam · Unsubscribe any time", `10px`, `color: #525252`
- **No perks or reassurances on the left.** All persuasion copy lives below the point of action.

---

### 7. Footer

**Layout:** `background: #0c0a08`, `padding: 52px 52px 28px`. 4-column grid: `1.2fr 1fr 1fr 1fr`.

**Brand column:**
- Logo: Playfair Display italic `21px`, `color: #f3f4f6`
- Tagline: `12px`, `color: #a3a3a3` (neutral-400) — passes WCAG AA on `#0c0a08`
- Social links: `display: block`, `padding: 8px 24px 8px 0` — block-level touch targets, `color: #a3a3a3`, `hover: #f3f4f6`

**Nav columns (Shop / Studio / Help):**
- Column headings: `8px / 700 / 3px letter-spacing / uppercase`, `color: #e5e5e5` (neutral-200)
- Links: `display: block`, `padding: 8px 0` — satisfies Fitts's Law 44pt minimum on mobile, `color: #a3a3a3`, `hover: #f3f4f6`, `transition: color 0.2s`

**Bottom bar:**
- Legal text + policy links: `10px`, `color: #525252`, `hover: #a3a3a3`
- `border-top: 1px solid rgba(255,255,255,0.06)`

---

## UX Principles Applied

| Principle | Implementation |
|---|---|
| **Hick's Law** | Inner Circle left column contains only heading + body — no competing bullet lists. All microcopy consolidated below the input. Quiz intercepts catalog before user hits choice overload. |
| **Fitts's Law** | View All: `inline-flex` with `padding: 13px 20px`. Footer links: `display: block; padding: 8px 0`. Social links: `display: block; padding: 8px 24px 8px 0`. |
| **Jakob's Law** | Email input has visible `border: 1px solid #525252` + distinct dark background — unambiguously interactive. Buttons use standard padding conventions. |
| **Aesthetic-Usability** | All text on dark backgrounds uses neutral-400 (`#a3a3a3`) minimum. Headings neutral-200 (`#e5e5e5`). Passes WCAG AA against `#0c0a08` and `#1a1714` backgrounds. |

---

## Files to Change

| File | Change |
|---|---|
| `src/app/(frontend)/theme.css` | Confirm color tokens present; no new tokens needed |
| `src/blocks/StorefrontHero/Component.tsx` | Remove status strip, remove right aside, left-align layout, update CTA button styles |
| `src/blocks/ScentQuiz/Component.tsx` | Wrap existing modal trigger in new horizontal CTA band layout |
| `src/components/CollectionArchive/index.tsx` | Change to `280px / 1fr` grid with sticky left col |
| `src/components/Card/index.tsx` | Tag `top-4 left-4`, three-tier type hierarchy, View All hit target |
| `src/blocks/InnerCircleCTA/Component.tsx` | Two-col grid `items-center`, remove bullets from left, input border + bg, microcopy below input |
| `src/blocks/RenderBlocks.tsx` | Reorder blocks: ScentQuiz before ArchiveBlock (products) |
| `src/endpoints/seed/home.ts` | Reorder seed block array to match new page architecture |
| `src/components/Footer/index.tsx` | Block-level links with `py-2`, neutral-400 text, neutral-200 headings |
| New: `src/blocks/Testimonials/` | New block — `Component.tsx` + Payload config |

---

## Out of Scope

- ScentQuiz interactive inline mode (deferred — existing modal is sufficient)
- Mobile / responsive breakpoints (follow-up spec)
- New product card "Quick View" interaction
- Testimonials CMS schema (seed data acceptable for v1)
