# Tailwind Improvement — Design Spec
Date: 2026-06-14  
Scope: All frontend components under `src/` (excluding admin/dashboard)

## Overview

Three independent, sequentially mergeable phases that improve Tailwind usage across the frontend. Each phase can be reviewed and verified before the next begins.

---

## Phase A: Token Correctness

### Goal
Eliminate raw color utilities that bypass the Candera design token system.

### Changes

**1. Remove flat color aliases from `tailwind.config.mjs`**

The top-level `vellum`, `linen`, `obsidian`, `duskRose` entries duplicate the `candera.*` namespace. Remove them and migrate any usages to `candera.*` equivalents.

| Flat alias | Replacement |
|---|---|
| `vellum` | `candera-vellum` |
| `linen` | `candera-linen` |
| `obsidian` | `candera-obsidian` |
| `duskRose` | `candera-rose` |

**2. Replace raw color utilities in frontend components**

| Raw utility | Replacement | Context |
|---|---|---|
| `text-white` | `text-candera-vellum` | Dark backgrounds |
| `text-white/N` | `text-candera-vellum/N` | Dark backgrounds with opacity |
| `bg-white` | `bg-candera-linen` | Page/card surfaces |
| `bg-white` | `bg-candera-vellum` | Input/field surfaces |
| `text-black` | `text-candera-obsidian` | — |
| `bg-black` | `bg-candera-obsidian` | — |
| `text-gray-*` / `bg-gray-*` | Nearest candera token by lightness | — |

**Exceptions (left as-is):**
- `bg-black/80` in `dialog.tsx` and `sheet.tsx` — UI primitive overlay, not a brand surface
- `bg-white/[0.05]` / `bg-white/[0.01]` in `ScentQuiz/Component.tsx` — translucent glass effect on dark background where opacity is the point; no token equivalent

**3. Arbitrary font sizes**

Replace `text-[clamp(...)]` values that map to an existing type scale token. Leave as arbitrary values:
- `EditorialPageHero` watermark: `text-[clamp(8rem,18vw,16rem)]` — one-off decorative, no token equivalent
- `Footer` decorative glyph: `text-[180px]` — one-off, no token equivalent

### Files affected
`src/components/FeaturedPostCard/`, `src/heros/HighImpact/`, `src/heros/PostHero/`, `src/heros/LowImpact/`, `src/heros/PostHero/`, `src/blocks/StorefrontHero/`, `src/blocks/ScentQuiz/Modal.tsx`, `src/blocks/Code/`, `src/Header/Nav/MobileNav.tsx`, `src/app/(frontend)/posts/[slug]/page.tsx`, `src/app/(frontend)/products/ProductCardSkeleton.tsx`, `src/blocks/Content/Component.tsx`, plus any additional usages found during implementation.

### Verification
- `grep -rn "text-white\|bg-white\|text-black\|bg-black\|text-gray-\|bg-gray-" src/ --include="*.tsx"` returns only the documented exceptions
- Visual check: dark-background components render at same contrast

---

## Phase B: Tailwind v4 Migration

### Goal
Move all design tokens from `tailwind.config.mjs` (v3 `extend:` syntax) into `@theme {}` in CSS (v4 CSS-first syntax), and remove the legacy config file.

### Changes

**1. Expand `@theme {}` in `src/app/(frontend)/globals.css`**

Every token in `tailwind.config.mjs` → `theme.extend` maps to a CSS custom property:

| Token type | v3 syntax | v4 CSS syntax |
|---|---|---|
| Color | `colors.candera.vellum: '#f5f2ed'` | `--color-candera-vellum: #f5f2ed` |
| Font size | `fontSize.hero: 'clamp(2.5rem, 5vw, 4.5rem)'` | `--font-size-hero: clamp(2.5rem, 5vw, 4.5rem)` |
| Font family | `fontFamily.display: [...]` | `--font-display: var(--font-fraunces), Georgia, serif` |
| Spacing | `spacing.64: '64px'` | `--spacing-64: 64px` |
| Border radius | `borderRadius.button: '0px'` | `--radius-button: 0px` |
| Letter spacing | `letterSpacing.wide: '0.1em'` | `--tracking-wide: 0.1em` |
| Line height | `lineHeight.hero: '1.0'` | `--leading-hero: 1.0` |
| Box shadow | `boxShadow.card: '...'` | `--shadow-card: ...` |
| Transition | `transitionTimingFunction.candera-enter` | `--ease-candera-enter: cubic-bezier(...)` |
| Max width | `maxWidth.candera: '1280px'` | `--container-candera: 1280px` |

**2. Remove `tailwind.config.mjs`**

Delete the file entirely. Remove the `@config '../../../tailwind.config.mjs'` directive from `globals.css`.

**3. Fix `theme()` calls in `typography.css`**

Rewrite `theme('colors.candera.vellum')` → `var(--color-candera-vellum)` (or v4 `theme(--color-candera-vellum)` where inline `theme()` is required by the typography plugin). All `theme()` calls in `typography.css` and `tailwind.config.mjs`'s prose config need auditing.

**4. Typography plugin prose config**

The `typography:` key in `tailwind.config.mjs` moves to a `@plugin "@tailwindcss/typography"` config block in CSS, or remains as a separate `typography.config.mjs` imported by the plugin directive. Exact syntax to be confirmed against v4 typography plugin docs at implementation time.

### Verification
- `pnpm build` passes with zero errors
- `pnpm dev` starts and all pages render correctly
- No visual regressions on landing page, product pages, editorial pages

---

## Phase C: `cva()` Patterns

### Goal
Replace multi-branch `cn()` conditional logic with typed `cva()` variant maps in components that have 3+ variant states.

### Target components

| Component | Current pattern | Variants to model |
|---|---|---|
| `src/components/ui/button.tsx` | `cn()` conditionals | `variant` (primary/secondary/ghost/destructive), `size` |
| `src/components/Card/index.tsx` | Inline ternaries | `type` (post/product) |
| `src/components/Card/ProductTagBadge.tsx` | Switch/ternary | `type` (limited/bestseller/new/default) |
| Additional audit findings | — | — |

### Pattern

```ts
import { cva, type VariantProps } from 'class-variance-authority'

const component = cva('shared-base-classes', {
  variants: {
    variant: {
      primary: 'bg-candera-ember-strong text-candera-vellum',
      secondary: 'border border-candera-obsidian text-candera-obsidian',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

type Props = VariantProps<typeof component> & { className?: string }
```

`cn()` stays for caller-supplied class merging: `cn(component({ variant }), className)`.

### Rules
- Only convert components with 3+ variant branches — simpler conditionals stay as `cn()`
- Props and rendered output must be identical before and after
- Export the `VariantProps` type alongside the component for consumers

### Verification
- TypeScript compiles with zero errors (`pnpm generate:types`)
- All existing className props accepted by converted components still work
- No visual regressions

---

## Implementation Order

1. **Phase A** — token fixes, no config changes, safe to merge independently
2. **Phase B** — config migration, verify build before starting Phase C
3. **Phase C** — cva() refactor, purely additive

Each phase gets its own commit. Phases do not overlap.
