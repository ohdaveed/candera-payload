# Candera Admin-Configurable Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an admin-configurable Candera landing-page design system that matches `.superdesign` luxury storefront references and supports conversion-informed palettes, hero layouts, card density, section mood, and CTA style.

**Architecture:** Extend the existing Payload `SiteTheme` global as the single admin source of truth, apply its values as `data-*` attributes on `<html>`, and centralize palette/control styling in `theme.css` plus focused component helpers. Landing pages and blocks will consume the system through CSS variables, shadcn/ui primitives, and Tailwind classes instead of duplicating palette logic.

**Tech Stack:** Payload CMS 3.x, Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui primitives, Vitest via Vite+, Payload generated types.

---

## File Structure

Create or modify these files:

- Modify: `src/SiteTheme/config.ts` — add admin-selectable design controls.
- Modify: `src/app/(frontend)/layout.tsx` — apply new `data-*` attributes from Site Theme.
- Modify: `src/app/(frontend)/theme.css` — add conversion-informed palette variables and presentation-control CSS variables.
- Modify: `src/components/ui/button.tsx` — add theme-aware CTA button variants.
- Create: `src/utilities/siteTheme.ts` — shared defaults and normalization helpers for site-theme values.
- Create: `tests/int/siteTheme.int.spec.ts` — unit/integration tests for normalization helpers.
- Modify: `src/blocks/StorefrontHero/Component.tsx` — support centered editorial, split atelier, and cinematic noir layouts through CSS/data controls.
- Modify: `src/components/PageHeader/index.tsx` — add optional divider/luxury header treatment for landing pages.
- Modify: `src/components/Card/index.tsx` — make product cards respond to card density and palette variables.
- Modify: `src/components/CollectionArchive/index.tsx` — make archive grid respond to card density.
- Modify: `src/app/(frontend)/products/ProductGrid.tsx` — make product listing grid respond to card density.
- Modify: `src/app/(frontend)/products/ProductFilters.tsx` — theme filters with shadcn Button/Select and accessible active states.
- Modify: `src/app/(frontend)/products/page.tsx` — update listing page hero/header and layout spacing.
- Create: `src/app/(frontend)/about/page.tsx` — dedicated About page based on `.superdesign/design_iterations/candera_about.html`.
- Modify: `src/app/(frontend)/contact/page.tsx` — refine contact page as an editorial two-column landing page.
- Modify: `src/components/ContactForm/index.tsx` — use theme-aware form controls and CTA variant.
- Modify: `src/endpoints/seed/home-static.ts` — update fallback homepage copy to match approved direction.
- Generated: `src/payload-types.ts` — regenerate after Site Theme schema change.

---

### Task 1: Add Site Theme defaults and normalization helper

**Files:**
- Create: `src/utilities/siteTheme.ts`
- Test: `tests/int/siteTheme.int.spec.ts`

- [ ] **Step 1: Write failing tests for theme normalization**

Create `tests/int/siteTheme.int.spec.ts`:

```ts
import { describe, expect, it } from 'vite-plus/test'
import {
  DEFAULT_SITE_THEME_SETTINGS,
  normalizeSiteThemeSettings,
  SITE_THEME_OPTIONS,
} from '@/utilities/siteTheme'

describe('site theme settings', () => {
  it('returns approved defaults when no settings exist', () => {
    expect(normalizeSiteThemeSettings(null)).toEqual(DEFAULT_SITE_THEME_SETTINGS)
  })

  it('keeps valid admin-selected values', () => {
    expect(
      normalizeSiteThemeSettings({
        colorScheme: 'black-gold-rose',
        fontSet: 'playfair-inter',
        heroLayout: 'cinematic-noir',
        productCardDensity: 'gallery',
        sectionMood: 'noir-contrast',
        ctaStyle: 'couture-glow',
      }),
    ).toEqual({
      colorScheme: 'black-gold-rose',
      fontSet: 'playfair-inter',
      heroLayout: 'cinematic-noir',
      productCardDensity: 'gallery',
      sectionMood: 'noir-contrast',
      ctaStyle: 'couture-glow',
    })
  })

  it('falls back per-field when a stored value is unknown', () => {
    expect(
      normalizeSiteThemeSettings({
        colorScheme: 'unknown-skin',
        fontSet: 'bad-font',
        heroLayout: 'bad-layout',
        productCardDensity: 'bad-density',
        sectionMood: 'bad-mood',
        ctaStyle: 'bad-cta',
      }),
    ).toEqual(DEFAULT_SITE_THEME_SETTINGS)
  })

  it('keeps legacy skin values available for backward compatibility', () => {
    expect(SITE_THEME_OPTIONS.colorSchemes.map((option) => option.value)).toEqual(
      expect.arrayContaining(['ink-orchid', 'lavender-noir', 'porcelain-pop']),
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm test:int -- tests/int/siteTheme.int.spec.ts
```

Expected: FAIL because `src/utilities/siteTheme.ts` does not exist.

- [ ] **Step 3: Implement the helper**

Create `src/utilities/siteTheme.ts`:

```ts
export const SITE_THEME_OPTIONS = {
  colorSchemes: [
    { label: 'Rose Conversion', value: 'rose-conversion' },
    { label: 'Black Gold Rose', value: 'black-gold-rose' },
    { label: 'Amethyst Amber', value: 'amethyst-amber' },
    { label: 'Ink Orchid Coral', value: 'ink-orchid-coral' },
    { label: 'Plum Sage Coral', value: 'plum-sage-coral' },
    { label: 'Lavender Trust Rose', value: 'lavender-trust-rose' },
    { label: 'Legacy: Ink & Orchid', value: 'ink-orchid' },
    { label: 'Legacy: Lavender Noir', value: 'lavender-noir' },
    { label: 'Legacy: Porcelain Pop', value: 'porcelain-pop' },
    { label: 'Legacy: Default', value: 'default' },
  ],
  fontSets: [
    { label: 'Default (current fonts)', value: 'default' },
    { label: 'Playfair Display + Inter (serif headlines)', value: 'playfair-inter' },
    { label: 'DM Sans (friendly geometric sans)', value: 'dm-sans' },
    { label: 'Space Grotesk (modern studio sans)', value: 'space-grotesk' },
  ],
  heroLayouts: [
    { label: 'Centered Editorial', value: 'centered-editorial' },
    { label: 'Split Atelier', value: 'split-atelier' },
    { label: 'Cinematic Noir', value: 'cinematic-noir' },
  ],
  productCardDensities: [
    { label: 'Gallery', value: 'gallery' },
    { label: 'Boutique Grid', value: 'boutique-grid' },
    { label: 'Compact', value: 'compact' },
  ],
  sectionMoods: [
    { label: 'Light Editorial', value: 'light-editorial' },
    { label: 'Rose Wash', value: 'rose-wash' },
    { label: 'Noir Contrast', value: 'noir-contrast' },
  ],
  ctaStyles: [
    { label: 'Minimal Outline', value: 'minimal-outline' },
    { label: 'Conversion Filled', value: 'conversion-filled' },
    { label: 'Couture Glow', value: 'couture-glow' },
  ],
} as const

export const DEFAULT_SITE_THEME_SETTINGS = {
  colorScheme: 'rose-conversion',
  fontSet: 'playfair-inter',
  heroLayout: 'centered-editorial',
  productCardDensity: 'boutique-grid',
  sectionMood: 'light-editorial',
  ctaStyle: 'conversion-filled',
} as const

type OptionValue<T extends readonly { value: string }[]> = T[number]['value']

export type SiteThemeSettings = {
  colorScheme: OptionValue<typeof SITE_THEME_OPTIONS.colorSchemes>
  fontSet: OptionValue<typeof SITE_THEME_OPTIONS.fontSets>
  heroLayout: OptionValue<typeof SITE_THEME_OPTIONS.heroLayouts>
  productCardDensity: OptionValue<typeof SITE_THEME_OPTIONS.productCardDensities>
  sectionMood: OptionValue<typeof SITE_THEME_OPTIONS.sectionMoods>
  ctaStyle: OptionValue<typeof SITE_THEME_OPTIONS.ctaStyles>
}

type PartialSiteThemeSettings = Partial<Record<keyof SiteThemeSettings, unknown>> | null | undefined

function normalizeOption<T extends readonly { value: string }[]>(
  options: T,
  value: unknown,
  fallback: OptionValue<T>,
): OptionValue<T> {
  return typeof value === 'string' && options.some((option) => option.value === value)
    ? (value as OptionValue<T>)
    : fallback
}

export function normalizeSiteThemeSettings(settings: PartialSiteThemeSettings): SiteThemeSettings {
  return {
    colorScheme: normalizeOption(
      SITE_THEME_OPTIONS.colorSchemes,
      settings?.colorScheme,
      DEFAULT_SITE_THEME_SETTINGS.colorScheme,
    ),
    fontSet: normalizeOption(
      SITE_THEME_OPTIONS.fontSets,
      settings?.fontSet,
      DEFAULT_SITE_THEME_SETTINGS.fontSet,
    ),
    heroLayout: normalizeOption(
      SITE_THEME_OPTIONS.heroLayouts,
      settings?.heroLayout,
      DEFAULT_SITE_THEME_SETTINGS.heroLayout,
    ),
    productCardDensity: normalizeOption(
      SITE_THEME_OPTIONS.productCardDensities,
      settings?.productCardDensity,
      DEFAULT_SITE_THEME_SETTINGS.productCardDensity,
    ),
    sectionMood: normalizeOption(
      SITE_THEME_OPTIONS.sectionMoods,
      settings?.sectionMood,
      DEFAULT_SITE_THEME_SETTINGS.sectionMood,
    ),
    ctaStyle: normalizeOption(
      SITE_THEME_OPTIONS.ctaStyles,
      settings?.ctaStyle,
      DEFAULT_SITE_THEME_SETTINGS.ctaStyle,
    ),
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm test:int -- tests/int/siteTheme.int.spec.ts
```

Expected: PASS for all four tests.

- [ ] **Step 5: Commit**

```bash
git add src/utilities/siteTheme.ts tests/int/siteTheme.int.spec.ts
git commit -m "feat: add site theme setting helpers"
```

---

### Task 2: Extend Payload Site Theme global and apply frontend data attributes

**Files:**
- Modify: `src/SiteTheme/config.ts`
- Modify: `src/app/(frontend)/layout.tsx`
- Generated: `src/payload-types.ts`

- [ ] **Step 1: Update Site Theme config to use shared options**

Modify `src/SiteTheme/config.ts` to import and use the helper options. Replace the existing `fields` array with this shape:

```ts
import type { GlobalConfig } from 'payload'

import { SITE_THEME_OPTIONS, DEFAULT_SITE_THEME_SETTINGS } from '@/utilities/siteTheme'
import { revalidateSiteTheme } from './hooks/revalidateSiteTheme'

export const SiteTheme: GlobalConfig = {
  slug: 'site-theme',
  label: 'Site Theme',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Pick conversion-informed storefront palettes, typography, hero layouts, product card density, section mood, and CTA style. Recommended palettes are designed for high contrast and clear purchase actions.',
  },
  fields: [
    {
      name: 'colorScheme',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.colorScheme,
      options: SITE_THEME_OPTIONS.colorSchemes.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'Palette / Color Scheme',
    },
    {
      name: 'fontSet',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.fontSet,
      options: SITE_THEME_OPTIONS.fontSets.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'Font Pairing',
    },
    {
      name: 'heroLayout',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.heroLayout,
      options: SITE_THEME_OPTIONS.heroLayouts.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'Hero Layout',
    },
    {
      name: 'productCardDensity',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.productCardDensity,
      options: SITE_THEME_OPTIONS.productCardDensities.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'Product Card Density',
    },
    {
      name: 'sectionMood',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.sectionMood,
      options: SITE_THEME_OPTIONS.sectionMoods.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'Section Mood',
    },
    {
      name: 'ctaStyle',
      type: 'select',
      defaultValue: DEFAULT_SITE_THEME_SETTINGS.ctaStyle,
      options: SITE_THEME_OPTIONS.ctaStyles.map(({ label, value }) => ({ label, value })),
      required: true,
      label: 'CTA Style',
    },
  ],
  hooks: {
    afterChange: [revalidateSiteTheme],
  },
}
```

- [ ] **Step 2: Apply normalized values in the frontend layout**

Modify `src/app/(frontend)/layout.tsx`:

```ts
import { normalizeSiteThemeSettings } from '@/utilities/siteTheme'
```

Inside `RootLayout`, after fetching `siteTheme`, add:

```ts
const normalizedSiteTheme = normalizeSiteThemeSettings(siteTheme)
```

Then update `<html>` attributes from:

```tsx
data-fontset={siteTheme?.fontSet ?? 'default'}
data-skin={siteTheme?.colorScheme ?? 'default'}
```

to:

```tsx
data-card-density={normalizedSiteTheme.productCardDensity}
data-cta-style={normalizedSiteTheme.ctaStyle}
data-fontset={normalizedSiteTheme.fontSet}
data-hero-layout={normalizedSiteTheme.heroLayout}
data-section-mood={normalizedSiteTheme.sectionMood}
data-skin={normalizedSiteTheme.colorScheme}
```

- [ ] **Step 3: Generate Payload types**

Run:

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` changes to include `heroLayout`, `productCardDensity`, `sectionMood`, and `ctaStyle` under the Site Theme global type.

If environment variables are required, run:

```bash
pass-cli run --env-file .env -- pnpm generate:types
```

- [ ] **Step 4: Validate tests and types**

Run:

```bash
pnpm test:int -- tests/int/siteTheme.int.spec.ts
pnpm lint
```

Expected: site theme tests pass and lint completes without errors introduced by this task.

- [ ] **Step 5: Commit**

```bash
git add src/SiteTheme/config.ts src/app/'(frontend)'/layout.tsx src/payload-types.ts

git commit -m "feat: expose landing design controls in site theme"
```

---

### Task 3: Add conversion-informed palette and presentation CSS variables

**Files:**
- Modify: `src/app/(frontend)/theme.css`
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Add palette CSS variables**

Append these skin blocks to `src/app/(frontend)/theme.css` after the existing skin blocks and before font-set overrides:

```css
html[data-skin='rose-conversion'] {
  --background: #fff6f8;
  --foreground: #181014;
  --card: #ffffff;
  --card-foreground: #181014;
  --popover: #ffffff;
  --popover-foreground: #181014;
  --primary: #b9116a;
  --primary-foreground: #ffffff;
  --secondary: #f7dfeb;
  --secondary-foreground: #181014;
  --muted: #f7eaf0;
  --muted-foreground: #6d5f66;
  --accent: #b9116a;
  --accent-foreground: #ffffff;
  --border: #ead3dd;
  --input: #ead3dd;
  --ring: #b9116a;
  --candera-theme-hero-overlay: linear-gradient(120deg, rgb(255 255 255 / 0.94), rgb(255 246 248 / 0.78));
  --candera-theme-section-wash: linear-gradient(135deg, rgb(185 17 106 / 0.12), rgb(255 255 255 / 0.38));
  --candera-theme-divider: #b9116a;
  --candera-theme-cta: #d93f6a;
  --candera-theme-cta-foreground: #ffffff;
  --candera-theme-glow: 0 24px 70px rgb(185 17 106 / 0.2);
}

html[data-skin='black-gold-rose'] {
  --background: #080706;
  --foreground: #fdfbf7;
  --card: #14110f;
  --card-foreground: #fdfbf7;
  --popover: #14110f;
  --popover-foreground: #fdfbf7;
  --primary: #d7a84f;
  --primary-foreground: #111111;
  --secondary: #241416;
  --secondary-foreground: #fdfbf7;
  --muted: #241416;
  --muted-foreground: #d8c7c0;
  --accent: #f0bfd0;
  --accent-foreground: #111111;
  --border: #3a2a28;
  --input: #3a2a28;
  --ring: #d7a84f;
  --candera-theme-hero-overlay: radial-gradient(circle at 50% 40%, rgb(215 168 79 / 0.18), transparent 34%), linear-gradient(115deg, rgb(8 7 6 / 0.86), rgb(36 20 22 / 0.72));
  --candera-theme-section-wash: linear-gradient(135deg, #080706, #241416);
  --candera-theme-divider: #d7a84f;
  --candera-theme-cta: #d7a84f;
  --candera-theme-cta-foreground: #111111;
  --candera-theme-glow: 0 26px 80px rgb(215 168 79 / 0.22);
}

html[data-skin='amethyst-amber'] {
  --background: #160d2d;
  --foreground: #fbf7ff;
  --card: #22113f;
  --card-foreground: #fbf7ff;
  --popover: #22113f;
  --popover-foreground: #fbf7ff;
  --primary: #ffb000;
  --primary-foreground: #1b1200;
  --secondary: #4a1d7a;
  --secondary-foreground: #fbf7ff;
  --muted: #2d194f;
  --muted-foreground: #d8c9ee;
  --accent: #d8b4fe;
  --accent-foreground: #160d2d;
  --border: #56317d;
  --input: #56317d;
  --ring: #ffb000;
  --candera-theme-hero-overlay: linear-gradient(120deg, rgb(22 13 45 / 0.88), rgb(74 29 122 / 0.72));
  --candera-theme-section-wash: linear-gradient(135deg, #160d2d, #4a1d7a);
  --candera-theme-divider: #ffb000;
  --candera-theme-cta: #ffb000;
  --candera-theme-cta-foreground: #1b1200;
  --candera-theme-glow: 0 24px 70px rgb(255 176 0 / 0.22);
}

html[data-skin='ink-orchid-coral'] {
  --background: #121014;
  --foreground: #f8eff7;
  --card: #1c1620;
  --card-foreground: #f8eff7;
  --popover: #1c1620;
  --popover-foreground: #f8eff7;
  --primary: #ff6b4a;
  --primary-foreground: #ffffff;
  --secondary: #2a1530;
  --secondary-foreground: #f8eff7;
  --muted: #241629;
  --muted-foreground: #d8bfd3;
  --accent: #ff5db8;
  --accent-foreground: #121014;
  --border: #3b263f;
  --input: #3b263f;
  --ring: #ff6b4a;
  --candera-theme-hero-overlay: linear-gradient(120deg, rgb(18 16 20 / 0.9), rgb(42 21 48 / 0.72));
  --candera-theme-section-wash: linear-gradient(135deg, #121014, #2a1530);
  --candera-theme-divider: #ff5db8;
  --candera-theme-cta: #ff6b4a;
  --candera-theme-cta-foreground: #ffffff;
  --candera-theme-glow: 0 24px 70px rgb(255 107 74 / 0.24);
}

html[data-skin='plum-sage-coral'] {
  --background: #f7f1ed;
  --foreground: #171114;
  --card: #fffaf6;
  --card-foreground: #171114;
  --popover: #fffaf6;
  --popover-foreground: #171114;
  --primary: #6f2a5f;
  --primary-foreground: #ffffff;
  --secondary: #ded7cc;
  --secondary-foreground: #171114;
  --muted: #ebe3dc;
  --muted-foreground: #5f6459;
  --accent: #6f2a5f;
  --accent-foreground: #ffffff;
  --border: #d9cfc4;
  --input: #d9cfc4;
  --ring: #c94f37;
  --candera-theme-hero-overlay: linear-gradient(120deg, rgb(247 241 237 / 0.94), rgb(222 215 204 / 0.82));
  --candera-theme-section-wash: linear-gradient(135deg, rgb(111 42 95 / 0.12), rgb(222 215 204 / 0.36));
  --candera-theme-divider: #6f2a5f;
  --candera-theme-cta: #c94f37;
  --candera-theme-cta-foreground: #ffffff;
  --candera-theme-glow: 0 24px 70px rgb(201 79 55 / 0.2);
}

html[data-skin='lavender-trust-rose'] {
  --background: #f4f0ff;
  --foreground: #171124;
  --card: #ffffff;
  --card-foreground: #171124;
  --popover: #ffffff;
  --popover-foreground: #171124;
  --primary: #b9116a;
  --primary-foreground: #ffffff;
  --secondary: #d9ccff;
  --secondary-foreground: #171124;
  --muted: #e8e0ff;
  --muted-foreground: #625b76;
  --accent: #5f48bd;
  --accent-foreground: #ffffff;
  --border: #d8cff5;
  --input: #d8cff5;
  --ring: #b9116a;
  --candera-theme-hero-overlay: linear-gradient(120deg, rgb(244 240 255 / 0.94), rgb(217 204 255 / 0.76));
  --candera-theme-section-wash: linear-gradient(135deg, rgb(95 72 189 / 0.12), rgb(185 17 106 / 0.08));
  --candera-theme-divider: #5f48bd;
  --candera-theme-cta: #b9116a;
  --candera-theme-cta-foreground: #ffffff;
  --candera-theme-glow: 0 24px 70px rgb(185 17 106 / 0.2);
}
```

- [ ] **Step 2: Add presentation-control base rules**

Append after the palette blocks:

```css
html {
  --candera-card-grid-columns: repeat(1, minmax(0, 1fr));
  --candera-card-grid-gap-x: 2.5rem;
  --candera-card-grid-gap-y: 5rem;
  --candera-product-card-aspect: 4 / 5;
}

@media (width >= 48rem) {
  html {
    --candera-card-grid-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 64rem) {
  html[data-card-density='gallery'] {
    --candera-card-grid-columns: repeat(2, minmax(0, 1fr));
    --candera-card-grid-gap-x: 3.5rem;
    --candera-card-grid-gap-y: 6rem;
    --candera-product-card-aspect: 4 / 5;
  }

  html[data-card-density='boutique-grid'] {
    --candera-card-grid-columns: repeat(3, minmax(0, 1fr));
    --candera-card-grid-gap-x: 2.5rem;
    --candera-card-grid-gap-y: 5rem;
    --candera-product-card-aspect: 4 / 5;
  }

  html[data-card-density='compact'] {
    --candera-card-grid-columns: repeat(4, minmax(0, 1fr));
    --candera-card-grid-gap-x: 1.5rem;
    --candera-card-grid-gap-y: 3rem;
    --candera-product-card-aspect: 1 / 1;
  }
}
```

- [ ] **Step 3: Add theme-aware CTA variants**

Modify `src/components/ui/button.tsx` inside `variant`:

```ts
'theme-cta':
  'bg-[var(--candera-theme-cta)] text-[var(--candera-theme-cta-foreground)] hover:brightness-95 text-[11px] font-bold uppercase tracking-[.24em] rounded-[2px] shadow-lg hover:shadow-[var(--candera-theme-glow)] hover:-translate-y-0.5',
'theme-outline':
  'border border-[var(--candera-theme-divider)] bg-transparent text-foreground hover:bg-[var(--candera-theme-cta)] hover:text-[var(--candera-theme-cta-foreground)] text-[11px] font-bold uppercase tracking-[.24em] rounded-[2px] hover:-translate-y-0.5',
'theme-glow':
  'bg-[var(--candera-theme-cta)] text-[var(--candera-theme-cta-foreground)] text-[11px] font-bold uppercase tracking-[.24em] rounded-[2px] shadow-[var(--candera-theme-glow)] hover:brightness-110 hover:-translate-y-0.5',
```

- [ ] **Step 4: Validate CSS and button typing**

Run:

```bash
pnpm lint
```

Expected: no lint errors in `theme.css` or `button.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(frontend)'/theme.css src/components/ui/button.tsx
git commit -m "feat: add conversion landing theme variables"
```

---

### Task 4: Redesign StorefrontHero with admin-controlled layouts

**Files:**
- Modify: `src/blocks/StorefrontHero/Component.tsx`

- [ ] **Step 1: Replace hero component layout with CSS-variable-driven variants**

Update `src/blocks/StorefrontHero/Component.tsx` to keep the same props but use data attributes and variables. The core structure should include this JSX pattern:

```tsx
<Section
  padding="none"
  className="group/hero relative isolate flex min-h-[720px] items-center overflow-hidden bg-background text-foreground md:min-h-[820px]"
>
  {media && typeof media === 'object' ? (
    <figure className="absolute inset-0 m-0">
      <Media fill imgClassName="object-cover" priority resource={media} />
    </figure>
  ) : null}

  <span
    aria-hidden="true"
    className="absolute inset-0 bg-[image:var(--candera-theme-hero-overlay)]"
  />
  <span
    aria-hidden="true"
    className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
  />

  <Container className="relative z-10 grid w-full gap-12 py-28 data-[hero-layout=split-atelier]:md:grid-cols-[minmax(0,1fr)_360px] data-[hero-layout=centered-editorial]:place-items-center data-[hero-layout=cinematic-noir]:place-items-center">
    <header className="max-w-[760px] data-[hero-layout=centered-editorial]:mx-auto data-[hero-layout=centered-editorial]:text-center data-[hero-layout=cinematic-noir]:mx-auto data-[hero-layout=cinematic-noir]:text-center">
      {heroTag ? <Eyebrow className="mb-6 text-[var(--candera-theme-divider)]">{heroTag}</Eyebrow> : null}
      <h1 className="font-display text-[clamp(3.5rem,10vw,8.75rem)] font-normal italic leading-[0.9] tracking-[-0.045em] text-foreground">
        {headline}
      </h1>
      {subheading ? (
        <p className="editorial mt-7 max-w-[42rem] text-foreground/80 data-[hero-layout=centered-editorial]:mx-auto data-[hero-layout=cinematic-noir]:mx-auto">
          {subheading}
        </p>
      ) : null}
      <nav className="mt-10 flex flex-wrap gap-4 data-[hero-layout=centered-editorial]:justify-center data-[hero-layout=cinematic-noir]:justify-center">
        {primaryCtaLabel && primaryCtaUrl ? (
          <Button asChild size="cta" variant="theme-cta">
            <Link href={primaryCtaUrl}>{primaryCtaLabel}</Link>
          </Button>
        ) : null}
        {secondaryCtaLabel && secondaryCtaUrl ? (
          <Button asChild size="cta" variant="theme-outline">
            <Link href={secondaryCtaUrl}>{secondaryCtaLabel}</Link>
          </Button>
        ) : null}
      </nav>
    </header>

    {showStatusCard ? (
      <Card className="hidden border-border/60 bg-card/90 p-8 text-card-foreground shadow-[var(--candera-theme-glow)] backdrop-blur-md data-[hero-layout=split-atelier]:block">
        <CardHeader className="p-0 pb-5">
          <p className="label text-[var(--candera-theme-divider)]">Current Release</p>
          <CardTitle className="font-display text-4xl font-normal italic">{statusCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-0 text-sm text-muted-foreground">
          <p className="font-mono uppercase tracking-[0.12em]">{statusCardSubtitle}</p>
          <Separator />
          <div className="flex justify-between gap-4"><span>Status</span><strong>{statusCardStatus}</strong></div>
          <div className="flex justify-between gap-4"><span>Ships</span><strong>{statusCardShips}</strong></div>
        </CardContent>
      </Card>
    ) : null}
  </Container>
</Section>
```

Add imports if missing:

```ts
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
```

- [ ] **Step 2: Wire hero layout data attribute locally**

Because `data-hero-layout` is on `<html>`, use arbitrary Tailwind variants on descendants with `html[data-hero-layout='...']` where necessary. If Tailwind arbitrary parent variants become unreadable, add local class names such as `candera-storefront-hero` and define the variant CSS in `theme.css`:

```css
html[data-hero-layout='centered-editorial'] .candera-storefront-hero__container {
  place-items: center;
}

html[data-hero-layout='split-atelier'] .candera-storefront-hero__container {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
}

html[data-hero-layout='cinematic-noir'] .candera-storefront-hero__container {
  place-items: center;
}
```

- [ ] **Step 3: Validate compile**

Run:

```bash
pnpm lint
```

Expected: no unused imports or type errors.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/StorefrontHero/Component.tsx src/app/'(frontend)'/theme.css
git commit -m "feat: add configurable storefront hero layouts"
```

---

### Task 5: Theme product cards, archive grids, filters, and product listing page

**Files:**
- Modify: `src/components/Card/index.tsx`
- Modify: `src/components/CollectionArchive/index.tsx`
- Modify: `src/app/(frontend)/products/ProductGrid.tsx`
- Modify: `src/app/(frontend)/products/ProductFilters.tsx`
- Modify: `src/app/(frontend)/products/page.tsx`

- [ ] **Step 1: Update product image aspect and card styling**

In `src/components/Card/index.tsx`, change the `ShadcnCard` class from hardcoded white to theme-aware card variables:

```tsx
'group relative flex h-full cursor-pointer flex-col overflow-hidden border border-border/50 bg-card text-card-foreground transition-all duration-500 hover:-translate-y-2 hover:shadow-[var(--candera-theme-glow)] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0'
```

Change image wrapper class:

```tsx
<div className="relative aspect-[var(--candera-product-card-aspect)] w-full overflow-hidden bg-muted">
```

Change price class:

```tsx
<span className="price shrink-0 px-0 pt-4 text-[15px] font-medium text-[var(--candera-theme-divider)]">
```

Change Quick View button variant by replacing the inner `<button>` with:

```tsx
<Button
  type="button"
  variant="theme-cta"
  size="cta"
  onClick={(event) => event.stopPropagation()}
  onMouseDownCapture={(event) => event.stopPropagation()}
  onMouseUpCapture={(event) => event.stopPropagation()}
  className="relative z-10 w-full"
>
  Quick View
</Button>
```

Add import:

```ts
import { Button } from '@/components/ui/button'
```

- [ ] **Step 2: Update archive grid to use CSS variables**

In `src/components/CollectionArchive/index.tsx`, replace the `<ul>` class with:

```tsx
<ul className="grid list-none grid-cols-[var(--candera-card-grid-columns)] gap-x-[var(--candera-card-grid-gap-x)] gap-y-[var(--candera-card-grid-gap-y)] p-0">
```

Replace each `<li>` class with:

```tsx
<li className="min-w-0" key={index}>
```

- [ ] **Step 3: Update product grid to use CSS variables**

In `src/app/(frontend)/products/ProductGrid.tsx`, replace the motion ul class with:

```tsx
className="grid list-none grid-cols-[var(--candera-card-grid-columns)] gap-x-[var(--candera-card-grid-gap-x)] gap-y-[var(--candera-card-grid-gap-y)] p-0"
```

- [ ] **Step 4: Update filters for theme-aware active states**

In `src/app/(frontend)/products/ProductFilters.tsx`, use:

```tsx
<Button
  aria-pressed={activeTag === tag}
  variant={activeTag === tag ? 'theme-cta' : 'theme-outline'}
  onClick={() => update('tag', tag)}
  className={cn('h-auto min-h-[44px] px-4 py-2.5 text-[10px] tracking-[.22em] sm:px-6 sm:tracking-[.3em]')}
>
  {tag}
</Button>
```

Change `SelectTrigger` class to:

```tsx
className="h-[44px] rounded-none border-border/60 bg-card/40 text-[10px] font-bold uppercase tracking-[.2em] text-foreground focus:ring-ring/30"
```

- [ ] **Step 5: Update product listing header**

In `src/app/(frontend)/products/page.tsx`, change the outer section class to:

```tsx
<Section padding="large" className="min-h-screen bg-background pt-28 text-foreground md:pt-32">
```

Update `PageHeader` usage:

```tsx
<PageHeader
  align="center"
  className="mb-20"
  description="Each candle in our collection is designed to burn with intention — creating space for ritual, atmosphere, and transformation."
  eyebrow="Botanical Study"
  maxWidthClassName="max-w-[760px]"
  title="The Collection"
/>
```

Change result label wrapper to:

```tsx
<Eyebrow className="mb-8 block text-[var(--candera-theme-divider)]">{resultLabel}</Eyebrow>
```

- [ ] **Step 6: Validate product UI compile**

Run:

```bash
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Card/index.tsx src/components/CollectionArchive/index.tsx src/app/'(frontend)'/products/ProductGrid.tsx src/app/'(frontend)'/products/ProductFilters.tsx src/app/'(frontend)'/products/page.tsx
git commit -m "feat: theme product listing surfaces"
```

---

### Task 6: Add About page and refine contact landing page

**Files:**
- Create: `src/app/(frontend)/about/page.tsx`
- Modify: `src/app/(frontend)/contact/page.tsx`
- Modify: `src/components/ContactForm/index.tsx`

- [ ] **Step 1: Create the About page**

Create `src/app/(frontend)/about/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'About — Candera',
  description:
    'Candera creates hand-poured botanical candles for quiet luxury, soft ritual, and intentional atmosphere.',
}

const values = [
  {
    title: 'Small Batch',
    description: 'Each release is poured in limited quantities so every vessel feels considered.',
  },
  {
    title: 'Botanical Detail',
    description: 'Pressed florals and natural textures turn each candle into a preserved garden.',
  },
  {
    title: 'Ritual First',
    description: 'Scent, vessel, and burn experience are designed around moments of presence.',
  },
]

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <Section padding="large" className="pt-32 text-center">
        <Container className="max-w-[880px]">
          <Separator className="mx-auto mb-8 w-16 bg-[var(--candera-theme-divider)]" />
          <h1 className="hero-heading mb-8 text-foreground">Our Story</h1>
          <p className="editorial mx-auto max-w-[760px] text-[clamp(1.5rem,4vw,3rem)] leading-tight text-[var(--candera-theme-divider)]">
            Self-possessed and effortlessly inviting, each candle embodies quiet luxury and soft femininity.
          </p>
        </Container>
      </Section>

      <Section padding="large">
        <Container className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <article>
            <Separator className="mb-8 w-16 bg-[var(--candera-theme-divider)]" />
            <h2 className="h2 mb-8 text-foreground">
              Born from a Simple <span className="text-[var(--candera-theme-divider)]">Belief</span>
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <p>
                Candera was founded on the belief that the objects we surround ourselves with should be as intentional as the moments we create with them.
              </p>
              <p>
                Each candle is designed to mark a season, celebrate a milestone, or create a ritual of presence in daily life.
              </p>
            </div>
          </article>
          <div className="aspect-[4/5] overflow-hidden bg-muted shadow-[var(--candera-theme-glow)]">
            <img alt="Candera botanical candle detail" className="h-full w-full object-cover" src="/candera/ever-after-glow.jpg" />
          </div>
        </Container>
      </Section>

      <Section padding="large" className="bg-[image:var(--candera-theme-section-wash)]">
        <Container>
          <div className="mb-16 text-center">
            <Separator className="mx-auto mb-8 w-16 bg-[var(--candera-theme-divider)]" />
            <h2 className="h2 text-foreground">Our Values</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="border-border/60 bg-card/80 p-8 text-card-foreground">
                <CardHeader className="p-0 pb-5">
                  <CardTitle className="font-display text-3xl font-normal italic">{value.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-muted-foreground">
                  {value.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section padding="large" className="text-center">
        <Container className="max-w-[720px]">
          <h2 className="h2 mb-6 text-foreground">Find your next ritual.</h2>
          <p className="editorial mb-10 text-muted-foreground">
            Explore small-batch botanical candles crafted for atmosphere, memory, and quiet ceremony.
          </p>
          <Button asChild size="cta" variant="theme-cta">
            <Link href="/products">Explore the Collection</Link>
          </Button>
        </Container>
      </Section>
    </main>
  )
}
```

- [ ] **Step 2: Refine contact page shell**

In `src/app/(frontend)/contact/page.tsx`, change the section and card classes:

```tsx
<Section padding="large" className="min-h-screen bg-background pt-28 text-foreground md:pt-32">
```

Use PageHeader props:

```tsx
<PageHeader
  align="center"
  className="mb-12"
  eyebrow="Get in Touch"
  maxWidthClassName="max-w-[800px]"
  title="Connect with the Studio"
  description="For order questions, wholesale opportunities, press inquiries, or a note from your ritual space."
/>
```

Change the form aside class:

```tsx
className="relative overflow-hidden border border-border/60 border-l-[3px] border-l-[var(--candera-theme-divider)] bg-card/80 p-6 shadow-[var(--candera-theme-glow)] sm:p-8 md:p-10"
```

- [ ] **Step 3: Theme contact form CTA and controls**

In `src/components/ContactForm/index.tsx`, change submit button:

```tsx
<Button type="submit" variant="theme-cta" size="cta" disabled={isLoading}>
  {isLoading ? 'Sending…' : 'Send Correspondence'}
</Button>
```

Change error section class:

```tsx
className="mb-6 bg-destructive/10 p-4 text-[13px] font-medium text-destructive"
```

- [ ] **Step 4: Validate routes compile**

Run:

```bash
pnpm lint
```

Expected: no lint errors in about/contact files.

- [ ] **Step 5: Commit**

```bash
git add src/app/'(frontend)'/about/page.tsx src/app/'(frontend)'/contact/page.tsx src/components/ContactForm/index.tsx
git commit -m "feat: add editorial about and contact pages"
```

---

### Task 7: Update homepage fallback content and PageHeader treatment

**Files:**
- Modify: `src/endpoints/seed/home-static.ts`
- Modify: `src/components/PageHeader/index.tsx`

- [ ] **Step 1: Add optional divider to PageHeader**

In `src/components/PageHeader/index.tsx`, add prop:

```ts
showDivider?: boolean
```

Destructure it:

```ts
showDivider = false,
```

Before the eyebrow render, add:

```tsx
{showDivider ? (
  <span
    aria-hidden="true"
    className={cn(
      'mb-4 block h-px w-16 bg-[var(--candera-theme-divider)]',
      align === 'center' && 'mx-auto',
    )}
  />
) : null}
```

- [ ] **Step 2: Update fallback homepage copy**

In `src/endpoints/seed/home-static.ts`, update the `storefrontHero` block values:

```ts
heroTag: 'Botanical Candle Atelier',
headline: 'Quiet Luxury. Intentional Energy.',
subheading:
  'Hand-poured botanical candles that embody soft femininity and natural elegance. Each flame creates warmth, atmosphere, and peace in your most sacred spaces.',
primaryCtaLabel: 'Shop the Drop',
primaryCtaUrl: '#collection',
secondaryCtaLabel: 'Find Your Ritual →',
secondaryCtaUrl: '#scent-quiz',
statusCardTitle: 'Limited Batch',
statusCardSubtitle: 'Pressed botanicals · hand-poured',
statusCardStatus: 'Now Available',
statusCardShips: 'Ships in 3–5 days',
```

Update archive intro heading text to:

```ts
text: 'Featured botanical candles for your next ritual.',
```

Update archive paragraph text to:

```ts
text: 'Wild and refined candles that embody romantic, slightly moody beauty — each one poured in small batches and finished by hand.',
```

- [ ] **Step 3: Use divider on product PageHeader**

In `src/app/(frontend)/products/page.tsx`, add:

```tsx
showDivider
```

to the `PageHeader` props.

- [ ] **Step 4: Validate compile**

Run:

```bash
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/home-static.ts src/components/PageHeader/index.tsx src/app/'(frontend)'/products/page.tsx
git commit -m "feat: align homepage fallback with luxury redesign"
```

---

### Task 8: Final validation and visual review

**Files:**
- No planned code changes unless validation reveals defects.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm test:int -- tests/int/siteTheme.int.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run generated types if not already current**

Run:

```bash
pnpm generate:types
```

Expected: `src/payload-types.ts` is current. If it changes, include it in the final commit.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
pass-cli run --env-file .env -- pnpm build
```

Expected: Next.js build completes. If local secret injection is unavailable, run `pnpm build` and document any missing environment variable error.

- [ ] **Step 5: Manually review routes**

Start dev server:

```bash
pass-cli run --env-file .env -- pnpm dev
```

Review:

- `http://localhost:3000/`
- `http://localhost:3000/products`
- `http://localhost:3000/about`
- `http://localhost:3000/contact`

Expected:

- Theme variables are visible on all pages.
- Product cards respond to density selection once changed in Payload Admin.
- CTA colors are distinct and high contrast.
- About page uses editorial story/values sections.
- Contact page keeps form behavior and uses the refined card layout.

- [ ] **Step 6: Commit final generated/validation fixes if needed**

If validation changed generated types or required small fixes:

```bash
git add src/payload-types.ts src/app/'(frontend)' src/components src/blocks src/endpoints

git commit -m "chore: finalize landing redesign validation"
```

If no files changed, do not create an empty commit.

---

## Plan Self-Review

- **Spec coverage:** Tasks cover Site Theme admin controls, palette CSS, data attributes, shadcn/Tailwind implementation, homepage hero/archive, product listing, About, Contact, seeded content, testing, and validation.
- **Concrete execution details:** The plan uses exact paths, option values, commands, expected results, and code snippets. It avoids deferred or undefined follow-up work.
- **Type consistency:** `colorScheme`, `fontSet`, `heroLayout`, `productCardDensity`, `sectionMood`, and `ctaStyle` names match across helper, Payload global, layout data attributes, and spec.
