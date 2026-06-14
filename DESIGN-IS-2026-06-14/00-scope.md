# Scope — Dieter Rams Design Audit

**Date:** 2026-06-14  
**Auditor:** claude-mem:design-is

## Surface Audited

- **Primary:** Homepage / Storefront — `http://localhost:3000`
- **Supporting routes:** `/products` (product grid)
- **Key source files:**
  - `src/app/(frontend)/page.tsx`
  - `src/app/(frontend)/products/page.tsx`
  - `src/app/(frontend)/products/ProductGrid.tsx`
  - `src/blocks/StorefrontHero/Component.tsx`
  - `src/Header/Component.tsx`, `src/Footer/Component.tsx`
  - `src/components/GlobalLayout/index.tsx`

## Primary User

Candle/fragrance shoppers — likely browsing on mobile, discovering new scents, deciding to buy on Etsy.

## Primary Task

Land on the site → understand what's being sold → navigate to a product → click through to Etsy to purchase.

## Constraints

- Stack: Next.js App Router + Payload CMS
- Brand: artisan candle/fragrance ("candera")
- Etsy as the commerce backend (no on-site checkout)
- Branch: `fix/code-review-findings`

## Reference / Competitors

- Artisan candle brands (Otherland, Boy Smells, P.F. Candle Co.)
- Dev server running at `http://localhost:3000`
