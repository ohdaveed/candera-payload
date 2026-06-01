---
name: candera-design
description: Use this skill to generate well-branded interfaces and assets for Candera, a luxury botanical candle storefront, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Quick orientation
- `README.md` — product context, content + visual foundations, iconography, full manifest.
- `colors_and_type.css` — all tokens (color incl. AA-safe variants, type, spacing, radius,
  shadow, motion) + ready-to-use semantic classes. Load it, or copy the `:root` block.
- `assets/images/` — the six candle vessels + studio/lifestyle imagery.
- `preview/` — specimen cards (colors, type, components, spacing) you can read to learn the system.
- `ui_kits/storefront/` — a working, click-through recreation of the storefront; lift its
  `.c-*` components and the `index.html` token stylesheet as a starting scaffold.

## Non-negotiables
- **Type:** Fraunces (display, usually italic), EB Garamond (editorial italic), DM Sans (UI).
  All Google Fonts — never substitute Inter/Playfair.
- **Color:** Vellum ground, Obsidian text. **Dusk Rose `#B28C9C` is the primary**; Ember
  `#DD7D52` is the warm-copper accent. Use the `*-strong` / `sage-text` variants for small
  text and white-on-color CTAs so contrast clears WCAG AA.
- **Voice:** unhurried, devotional, first-person-plural studio. Vessels not products, batches
  not collections, the Inner Circle not a newsletter. No emoji, ever.
- **Form:** near-square corners, restrained shadows, ≥96px between sections, slow fades (never
  bouncy), hover → Ember.
- **Icons:** Lucide only, stroke 1.5, used sparingly. No custom SVG icon-drawing.
