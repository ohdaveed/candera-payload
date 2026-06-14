# Plan: Candera Storefront Redesign

**Source:** Dieter Rams audit 2026-06-14 — REDESIGN verdict (13/30)  
**Branch:** `fix/code-review-findings` (or new branch off main)  
**Scope:** Homepage + /products. Not touching: admin, Payload collections, blog/posts, auth.

---

## Phase 0: Documentation Discovery (COMPLETE)

### Allowed APIs & Patterns

**Token system (two-layer):**

- Design primitives: `tailwind.config.mjs` — `extend.fontSize` (Major Third, 8 stops), `extend.spacing` (8pt grid), `extend.colors.candera.*`
- Semantic layer: `src/app/(frontend)/theme.css` — CSS custom properties in oklch at `:root`, overridden per `html[data-skin='*']` and `html[data-fontset='*']`
- Bridge: `theme.css` `@theme inline { --color-* }` maps semantic vars into Tailwind v4 namespace

**Type scale that EXISTS (use these names):**
`xs:0.64rem`, `sm:0.8rem`, `base:1rem`, `lg:1.25rem`, `xl:1.563rem`, `2xl:1.953rem`, `3xl:3rem`, `hero:clamp(3rem,9vw,7.25rem)` — defined at `tailwind.config.mjs:37–46`

**Focus ring patterns (two coexist):**

- shadcn/ui: `focus-visible:ring-4 focus-visible:outline-1 outline-ring/50 ring-ring/10` — `button.tsx:7`, `input.tsx:13`
- Brand: `focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm` — `Footer/Component.tsx:65,81,90,98,106`
- `--ring` CSS var is NOT mapped to `candera-ember-strong` — fix in Phase 1

**Loading/skeleton patterns:**

- Base component: `src/components/ui/skeleton.tsx:3–11` — `bg-accent animate-pulse rounded-md`
- Project skeleton: `src/app/(frontend)/products/ProductCardSkeleton.tsx` — uses `<Skeleton>` with `bg-candera-ash rounded-none`
- Route loading: `src/app/(frontend)/products/loading.tsx` — renders full-page skeleton layout

**Error state pattern (copy for new uses):**

- `src/blocks/Form/Error/index.tsx:10` — `<div role="alert" id={name}-error>` with `text-destructive`
- `src/blocks/InnerCircleCTA/EmailForm.tsx:93–98` — `role="alert" aria-live="polite"` on error + success messages

**Dynamic import pattern (copy for ScentQuiz):**

```ts
// src/blocks/RenderBlocks.tsx:15 — existing pattern
const FormBlock = dynamic(() => import('@/blocks/Form/Component').then((m) => m.FormBlock), {
  ssr: true,
})
// Change ssr: true → ssr: false for client-only components; add loading: () => <Skeleton>
```

**Font loading:** `src/app/(frontend)/layout.tsx:4–68` — 7 families via `next/font/google` + `geist/font/mono`, all loaded unconditionally.

**Framer Motion files:**

- `src/components/Card/index.tsx:9`
- `src/app/(frontend)/products/ProductGrid.tsx:4` (already imports `useReducedMotion`)
- `src/blocks/ScentQuiz/Component.tsx:6`

### Known Anti-Patterns (do NOT do these)

- Do NOT add a font-size to `typography.css` using arbitrary `clamp()` — use the Tailwind token names instead (`text-hero`, `text-3xl`, etc.)
- Do NOT use `focus:ring-*` — use `focus-visible:ring-*` exclusively
- Do NOT use `outline: none` or `outline-style: none` without pairing with an explicit `focus-visible:ring-*`
- Do NOT use `{ ssr: true }` for ScentQuiz dynamic import — use `{ ssr: false }` so Framer Motion isn't in the server bundle
- Do NOT add `aria-busy` as a string — use the boolean attribute (`aria-busy="true"`)

---

## Phase 1: Token Consolidation

**Goal:** One source of truth for the type scale and spacing. Eliminate the 17-computed-size problem.

### 1A — Fix undefined Tailwind references

`tailwind.config.mjs` references tokens that don't exist, causing silent fallbacks:

| Reference                      | Location                      | Fix                                                               |
| ------------------------------ | ----------------------------- | ----------------------------------------------------------------- |
| `theme(lineHeight.hero)`       | `tailwind.config.mjs:140`     | Add `hero: 1.0` to `lineHeight` block                             |
| `theme(lineHeight.h2)`         | `tailwind.config.mjs:144`     | Add `h2: 1.1`                                                     |
| `theme(lineHeight.h3)`         | `tailwind.config.mjs:148`     | Add `h3: 1.15`                                                    |
| `theme(lineHeight.h4)`         | `tailwind.config.mjs:153`     | Add `h4: 1.2`                                                     |
| `theme(letterSpacing.display)` | `tailwind.config.mjs:135`     | Add `display: '-0.02em'` to `letterSpacing`                       |
| `theme(letterSpacing.heading)` | `tailwind.config.mjs:144,148` | Add `heading: '-0.01em'`                                          |
| `theme(fontSize.4xl)`          | `tailwind.config.mjs:231,236` | Add `'4xl': '3.5rem'` to `fontSize` (or use `3xl` if appropriate) |

**Files to edit:** `tailwind.config.mjs` lines 37–62 (fontSize, lineHeight, letterSpacing blocks)

### 1B — Consolidate typography.css heading sizes

`src/app/(frontend)/typography.css` lines 41–166 defines font-sizes inline with `clamp()` values that diverge from the Tailwind token scale. These are applied to `.prose` selectors and heading elements.

**Fix:** For each heading element in `typography.css`:

- Replace the inline `font-size: clamp(...)` with `font-size: theme('fontSize.STOP')` referencing the appropriate Tailwind stop
- Keep `line-height`, `letter-spacing`, `font-family`, `font-weight` intact — only replace `font-size`
- Map: h1 → `hero`, h2 → `3xl`, h3 → `2xl`, h4 → `xl`, h5 → `lg`, body → `base`, caption/label → `sm`

**Verification:**

```bash
# After change, no clamp() should remain on font-size in typography.css
grep -n "clamp" src/app/(frontend)/typography.css
# Should return empty or only non-font-size uses
```

### 1C — Map --ring to brand color

In `src/app/(frontend)/theme.css` in the `:root` block, add:

```css
--ring: var(--candera-ember-strong);
```

This makes shadcn components (`button.tsx`, `input.tsx`, etc.) use the brand focus color automatically, unifying Pattern A and Pattern B from the discovery.

**Verification:** `grep -n "\-\-ring" src/app/(frontend)/theme.css` — should show one line in `:root`

---

## Phase 2: Focus Rings & UI State Layer

**Goal:** All 6 state categories present and confirmed. No `outline-style: none` without a paired `focus-visible:ring-*`.

### 2A — Audit and fix bare outline-none instances

These are the known suppressions without a paired focus-visible ring:

- `src/components/ui/tabs.tsx:48` — `outline-none` on `TabsContent` — add `focus-visible:ring-2 focus-visible:ring-offset-1`
- `src/components/ui/select.tsx:99` — `outline-hidden` on `SelectItem` — replace with `focus-visible:ring-2 focus-visible:ring-offset-1`
- `src/app/(frontend)/products/ProductFilters.tsx:73` — `focus:ring-candera-ember-strong/20` — change `focus:` to `focus-visible:`
- `src/app/(frontend)/typography.css:115–119` — raw `input:focus-visible` rule changes border/bg but no ring — add `outline: 2px solid theme('colors.candera.ember.strong / 50%'); outline-offset: 2px;`

**Do NOT change:** `src/components/ui/sheet.tsx:69`, `dialog.tsx:58` — these have `focus:outline-none` paired with `focus:ring-2` which is intentional for the close button.

**Verification:** Tab through the homepage using keyboard only. Every link, button, and input must show a visible ring.

### 2B — Empty state for /products

`src/app/(frontend)/products/page.tsx:109–115` renders a text-only empty state when no products match a filter. Add a proper empty state component.

**Pattern to copy:** `src/blocks/InnerCircleCTA/EmailForm.tsx:93–98` (role="alert" aria-live="polite" pattern)

**What to build:** In `src/app/(frontend)/products/page.tsx` around line 109, wrap the existing empty state text in:

```tsx
<div role="status" aria-live="polite" className="...">
  <p>No products found for &quot;{tag}&quot;.</p>
  <p>
    The next batch is still curing. <Link href="/products">Clear the filter</Link>
  </p>
</div>
```

The existing copy is already honest — just needs semantic wrapping and visual treatment consistent with the loading skeleton.

### 2C — aria-busy on loading containers

`src/app/(frontend)/products/loading.tsx` renders a skeleton grid but has no `aria-busy` attribute to signal loading to assistive tech.

**Fix:** Wrap the root element in `loading.tsx` with `aria-busy="true" aria-label="Loading products"`.

**Pattern:** `src/blocks/Form/Component.tsx:133` uses `aria-live="polite"` on result messages — same approach.

### 2D — Error boundary for the frontend route

No React ErrorBoundary exists in the frontend route tree. Create a minimal one.

**File to create:** `src/app/(frontend)/error.tsx` — Next.js App Router uses this file automatically as the error boundary for the `(frontend)` segment.

```tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="...">
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Verification:** `ls src/app/(frontend)/error.tsx` — file exists.

---

## Phase 3: Bundle & Font Optimization

**Goal:** Initial JS < 250KB production; font payload < 100KB; ScentQuiz Framer Motion not in the homepage bundle.

### 3A — Dynamic import ScentQuiz

**File:** `src/blocks/RenderBlocks.tsx`

Change the static import of `ScentQuizModal`:

```ts
// Remove:
import { ScentQuizModal } from '@/blocks/ScentQuiz/Component'

// Add (copy the FormBlock pattern at line 15, but use ssr: false):
const ScentQuizModal = dynamic(
  () => import('@/blocks/ScentQuiz/Component').then((m) => m.ScentQuizModal),
  { ssr: false, loading: () => null },
)
```

`ssr: false` is required here — Framer Motion's `AnimatePresence` and `motion` require a browser environment. `loading: () => null` is appropriate because ScentQuiz is a modal (not visible on load).

**Verification:**

```bash
# After build, check that motion-dom is not in the main chunk
ls .next/static/chunks/ | grep -v "framer\|motion" # framer chunks should only appear as lazy chunks
```

### 3B — Add useReducedMotion guard to Card

`src/components/Card/index.tsx:9` imports `motion` from framer-motion. `ProductGrid.tsx:4` already imports `useReducedMotion` — apply the same guard to Card.

**Fix in `src/components/Card/index.tsx`:**

```ts
// Change line 9:
import { motion, useReducedMotion } from 'framer-motion'

// At top of component function:
const prefersReducedMotion = useReducedMotion()

// On any motion.div that has animation props:
// Add: initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
// Add: animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
```

**Verification:** `grep -n "useReducedMotion" src/components/Card/index.tsx` — should appear.

### 3C — Reduce font families

All 7 families load unconditionally from `src/app/(frontend)/layout.tsx:4–68`. The `data-fontset` system selects between `playfair-inter`, `dm-sans`, and `space-grotesk` skin presets — but all 7 fonts still download.

**Fix:** Pick the default fontset and load only those fonts eagerly. Load the others conditionally or remove from the layout.

**Approach (minimal change):**

1. Identify which fontset is the default (check Payload CMS `siteTheme` default or the `InitTheme` component)
2. Keep the 2–3 fonts that belong to the default fontset in `layout.tsx` as eager loads
3. Move the remaining families to dynamic `<link rel="preload">` attributes triggered by the `data-fontset` attribute change, OR accept loading them lazily via CSS `@font-face` with `font-display: optional`

**If the default is `dm-sans` fontset:** Keep `DM_Sans` + `Fraunces` (display) + `GeistMono` (mono). Remove or defer `EB_Garamond`, `Playfair_Display`, `Inter`, `Space_Grotesk` from the eager load.

**Verification:**

```bash
# Count woff2 requests in network panel after build
# Target: ≤ 4 woff2 files on homepage
```

---

## Phase 4: Copy & Honesty Fixes

**Goal:** No jargon on generic strings. Toast matches button label. Stat cluster is explicit.

### 4A — "vessels" → "products" on generic strings

Two occurrences where "vessel" is used as a generic fallback (not as a product-specific label):

- `src/app/(frontend)/products/page.tsx:109` — `"No vessels found for {tag}."` → `"No products found for \"{tag}\"."` (also handled by Phase 2B empty state)
- `src/app/(frontend)/products/page.tsx:121` — `"View all vessels →"` → `"View all products →"`

**Do NOT change:** Product detail page uses of "vessel" (e.g., "Vessel {vessel}" in StickyCTABar) — those are product-context labels where the term is established.

### 4B — Fix stat cluster in StorefrontHero

`src/blocks/StorefrontHero/Component.tsx:190–205` displays qualitative words ("Small", "Micro-batch", "Hand", "Poured & labeled", "CA", "Ships from") in a two-line metric card format that implies measurement.

**Fix options (pick one, simplest first):**

1. **Add context labels:** Change "Small" → "Small batch" (label) + no implied number, or restructure to `<dt>Format</dt><dd>Small batch</dd>` definition list
2. **Replace with a labeled list:** Remove the metric-card format entirely and render as prose badges or a simple `<ul>` with explicit labels

**Do NOT add fake numbers.** The fix is to make the format match the content (qualitative), not to invent quantities.

### 4C — Fix BoutiqueLink toast

`src/components/EtsyHandshake/BoutiqueLink.tsx:18–19` shows:

- Title: `"Redirecting to Studio Boutique..."`
- Description: `"Preparing your ritual transition."`

**Fix:** Either remove the toast entirely (simplest), or change to:

- Title: `"Opening on Etsy"`
- Description: `"Taking you to the product listing."` (or omit description)

---

## Phase 5: Verification

Run all checks before declaring done.

### Checklist

**Token system:**

```bash
# No clamp() on font-size in typography.css
grep -n "font-size.*clamp" src/app/(frontend)/typography.css  # → empty

# --ring is defined in :root
grep -n "\-\-ring" src/app/(frontend)/theme.css  # → one line in :root

# No undefined lineHeight/letterSpacing references
npx tsc --noEmit  # → 0 errors
```

**Focus rings:**

- [ ] Tab through homepage: logo, nav items, search, hero CTAs — all show visible ring
- [ ] Tab through /products: filter buttons, product cards, "View all products" link — all show visible ring
- [ ] Mouse click on buttons does NOT show ring (focus-visible only)
- `grep -rn "outline-none\|outline-style.*none" src --include="*.tsx" | grep -v "node_modules"` → all remaining instances are paired with a `focus-visible:ring-*` on the same element

**UI states:**

- [ ] `/products?tag=xyz-nonexistent` — empty state renders with `role="status"`
- [ ] `/products` loading — skeleton has `aria-busy="true"`
- [ ] `src/app/(frontend)/error.tsx` exists
- [ ] InnerCircleCTA email form: submit with invalid email → error with `role="alert"` visible

**Bundle:**

```bash
npm run build 2>&1 | grep "First Load JS"
# Target: homepage First Load JS < 250KB
```

**Accessibility:**

- Run Lighthouse on http://localhost:3000 → Accessibility score ≥ 90
- Run Lighthouse on http://localhost:3000/products → Accessibility score ≥ 90

**Copy:**

```bash
grep -rn '"vessels"\|vessels found\|all vessels' src --include="*.tsx"
# → zero results (all replaced)

grep -n "Studio Boutique\|ritual transition" src/components/EtsyHandshake/BoutiqueLink.tsx
# → zero results (removed or replaced)
```

---

## Execution Order

Each phase is self-contained and can be executed in a new chat context. Paste the relevant phase section plus the "Allowed APIs" from Phase 0 into each new context.

| Phase                         | Est. changes                                         | Risk                                                         |
| ----------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| 1: Token Consolidation        | `tailwind.config.mjs`, `typography.css`, `theme.css` | Medium — type scale change affects all text; verify visually |
| 2: Focus Rings & UI States    | 4 component files + 1 new file (`error.tsx`)         | Low — additive only                                          |
| 3: Bundle & Font Optimization | `RenderBlocks.tsx`, `Card/index.tsx`, `layout.tsx`   | Medium — font change affects visual                          |
| 4: Copy Fixes                 | 2 files, 4 strings                                   | Low — pure text change                                       |
| 5: Verification               | No code changes                                      | —                                                            |

Start with Phase 2 (Focus Rings) if time is limited — it has the highest impact per effort ratio, directly addresses the 0-score principle, and is purely additive.
