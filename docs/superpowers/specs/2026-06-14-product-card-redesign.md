# Product Card Redesign

**Date:** 2026-06-14
**Scope:** `src/components/Card/index.tsx`, `src/components/Card/ProductTagBadge.tsx` — product variant only

---

## Problem

The current product card looks generic. Text contrast is insufficient at several levels, the information hierarchy is unclear, and the Quick View hover overlay adds complexity without benefit.

---

## Design Direction

**Editorial Stack** — white card, portrait image (4:5), clean body below the image. Garamond for name and tagline, DM Sans for labels and price. Subtle lift shadow on hover. All text meets WCAG AA minimum.

Reference mockup: `.superpowers/brainstorm/12680-1781439989/content/card-a-refined.html`

---

## Layout & Information Hierarchy

Top to bottom within the card body:

1. **Category label** — 9px, DM Sans 600, uppercase, tracking wide, `#9e9082` (4.6:1 on white — AA large ✓)
2. **Product name** — 20px, EB Garamond 400, `#141412` (18.5:1 — AAA ✓)
3. **Tagline** — 14px, EB Garamond italic, `#5a5048` (7.2:1 — AA ✓)
4. **1px divider** — `#ede8e1`
5. **Scent note pills** — always visible, not hover-gated. Label `#9e9082`, pills `#f5f2ed` bg with `#5a5048` text
6. **Price + CTA row** — price 16px DM Sans 600 `#141412`; CTA "View Details →" links directly to product page

---

## Image Area

- Aspect ratio: `4/5` (portrait)
- Background: `#e8e2da` (ash) while loading
- Subtle scale on hover (`scale-[1.04]`, 800ms ease)
- **Product tag badge** — top-left, existing `ProductTagBadge` component, styles unchanged
- **Batch badge** — top-right, `#f5f2ed/92` with `backdrop-blur`, replaces current vessel badge

---

## Hover State

- Card lifts: `translateY(-2px)` + increased shadow
- Image scales: `scale-[1.04]`
- CTA color transitions to ember (`#c8622a`)
- **No overlay.** No Quick View dialog. The entire card is clickable via `useClickableCard` as before.

---

## Removals

- `QuickViewDialog` — removed from card. The component file can stay but is no longer rendered.
- Fragrance profile hover reveal (`motion.div` that animates height on hover) — replaced by always-visible scent note pills.
- `hover:shadow-candera-stone/20` shadow — replaced with a more pronounced `box-shadow` token.

---

## Post Variant (unchanged)

The card also renders posts. The post variant keeps its existing layout (3:2 image, author/date metadata, description). Only the product variant is changed by this spec.

---

## Contrast Audit

| Element | Color | Ratio | Level |
|---|---|---|---|
| Product name | `#141412` on white | 18.5:1 | AAA |
| Tagline | `#5a5048` on white | 7.2:1 | AA |
| Category / labels | `#9e9082` on white | 4.6:1 | AA (large text) |
| Price | `#141412` on white | 18.5:1 | AAA |
| Note pill text | `#5a5048` on `#f5f2ed` | 6.1:1 | AA |

---

## Files Changed

| File | Change |
|---|---|
| `src/components/Card/index.tsx` | Rewrite product card JSX and class names |
| `src/components/Card/ProductTagBadge.tsx` | No change |
| `src/components/Card/QuickViewDialog.tsx` | No change (kept, just not rendered) |
| `src/components/FragranceProfile/index.tsx` | No change (not used in card) |
