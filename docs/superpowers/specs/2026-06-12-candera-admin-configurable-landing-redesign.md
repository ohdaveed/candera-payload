# Candera Admin-Configurable Landing Page Redesign

## Goal

Redesign Candera's public landing-page experience to match the `.superdesign/design_iterations` visual direction while making the look configurable from Payload Admin. The redesign should cover the homepage, product listing page, a new About page, and contact/content-style landing pages.

The implementation should use existing shadcn/ui primitives and Tailwind utilities, not standalone HTML/CSS replicas. The final system should let admins change the active storefront design mode without code changes.

## Source References

Primary design references:

- `.superdesign/design_iterations/candera_storefront_1.html`
- `.superdesign/design_iterations/luxury_storefront_2.html`
- `.superdesign/design_iterations/candera_collections.html`
- `.superdesign/design_iterations/candera_about.html`
- `.superdesign/design_iterations/candera_product_detail.html` for downstream product-detail consistency, though product detail is not in this first implementation pass.

Existing implementation references:

- `src/SiteTheme/config.ts` — existing Payload global for admin-selected site theme.
- `src/app/(frontend)/layout.tsx` — applies `data-skin` and `data-fontset` to `<html>`.
- `src/app/(frontend)/theme.css` — current skin CSS variables.
- `src/app/(frontend)/typography.css` — current Candera semantic typography.
- `src/blocks/StorefrontHero/Component.tsx` — homepage hero block.
- `src/blocks/ArchiveBlock/Component.tsx` and `src/components/CollectionArchive/index.tsx` — homepage collection/product archive rendering.
- `src/components/Card/index.tsx` — shadcn Card-based product/post card.
- `src/app/(frontend)/products/page.tsx` — product listing page.
- `src/app/(frontend)/contact/page.tsx` — contact landing page.
- `src/endpoints/seed/home-static.ts` — fallback/seeded homepage layout content.

## Research Findings: Conversion-Focused Color Use

The palette system should be informed by ecommerce and landing-page conversion guidance:

- Color affects first impressions and purchasing behavior; ecommerce sources commonly cite that up to 90% of first impressions can be color-based.
- High contrast matters more than raw brightness for CTA visibility.
- Use a limited 3–5 color system per theme to reduce cognitive load.
- Use the 60/30/10 rule: dominant neutral/background, secondary brand color, and a small high-contrast CTA accent.
- Luxury ecommerce commonly uses black, cream/white, gold, deep purple, and restrained rose/pink accents.
- Warm CTA accents such as rose-red, coral, amber, or vivid pink can guide action and urgency when used sparingly.
- All themes must maintain accessible foreground/background contrast and should not rely on color alone to communicate state.

## Design Direction

Use an enhanced hybrid approach:

1. Treat `.superdesign` as the primary layout and visual-hierarchy source of truth.
2. Adapt the look to Candera's real product imagery and botanical/luxury brand language.
3. Implement shared reusable React components using shadcn/ui primitives and Tailwind utilities.
4. Extend the existing Payload `site-theme` global so admins can switch palettes and presentation controls.
5. Keep CMS/Payload content flexible; avoid hardcoding all page copy/layout into static route templates when existing blocks can support the structure.

## Admin Controls

Extend `src/SiteTheme/config.ts` beyond the existing `colorScheme` and `fontSet` controls.

### 1. Palette / Color Scheme

Add conversion-informed palette choices. These should map to `html[data-skin='...']` CSS variables in `theme.css`.

Recommended options:

| Admin Label | Value | Use Case | Palette Intent |
| --- | --- | --- | --- |
| Rose Conversion | `rose-conversion` | Default storefront option | Soft pink luxury foundation with rose-red CTA for clear buying action. |
| Black Gold Rose | `black-gold-rose` | Premium launch / luxury mode | Black/cream with gold CTA and rose highlights. |
| Amethyst Amber | `amethyst-amber` | Purple luxury campaign | Royal purple base with amber CTA for warm contrast. |
| Ink Orchid Coral | `ink-orchid-coral` | High-impact editorial/campaign mode | Near-black orchid theme with coral CTA urgency. |
| Plum Sage Coral | `plum-sage-coral` | Botanical/wellness mode | Earth neutrals, plum brand color, coral CTA. |
| Lavender Trust Rose | `lavender-trust-rose` | Email/contact/trust-oriented mode | Calm lavender/purple with rose CTA. |

Keep existing experimental skin values (`ink-orchid`, `lavender-noir`, `porcelain-pop`) as legacy options for backward compatibility so any saved global value continues to render. Label them as legacy in the admin, but make the six conversion-informed palettes the recommended choices and use `rose-conversion` as the default for new installs.

### 2. Hero Layout

Add a `heroLayout` select field that controls how landing heroes render.

Options:

| Label | Value | Description |
| --- | --- | --- |
| Centered Editorial | `centered-editorial` | `.superdesign`-style centered headline over softened product imagery. Best default for the homepage. |
| Split Atelier | `split-atelier` | Text, CTA, image, and optional status card split into an editorial/commerce layout. Best for product or launch-heavy pages. |
| Cinematic Noir | `cinematic-noir` | Dark immersive hero with strong contrast and luxury launch mood. Best paired with `black-gold-rose`, `ink-orchid-coral`, or `amethyst-amber`. |

### 3. Product Card Density

Add `productCardDensity` to tune archive/listing pages.

Options:

| Label | Value | Description |
| --- | --- | --- |
| Gallery | `gallery` | Roomy editorial cards, fewer per row, bigger imagery. |
| Boutique Grid | `boutique-grid` | Balanced default, closest to `.superdesign` collection pages. |
| Compact | `compact` | More products visible on listing pages. Keeps imagery strong but reduces vertical spacing. |

### 4. Section Mood

Add `sectionMood` to control landing-page section backgrounds and separators.

Options:

| Label | Value | Description |
| --- | --- | --- |
| Light Editorial | `light-editorial` | Cream/linen backgrounds, rose dividers, airy boutique feel. |
| Rose Wash | `rose-wash` | Soft rose gradient bands for featured product/collection sections. |
| Noir Contrast | `noir-contrast` | Dark feature/CTA bands for premium contrast and launch emphasis. |

### 5. CTA Style

Add `ctaStyle` to control button/CTA treatment.

Options:

| Label | Value | Description |
| --- | --- | --- |
| Minimal Outline | `minimal-outline` | `.superdesign`-style luxury outlined buttons. |
| Conversion Filled | `conversion-filled` | High-contrast filled CTA using each palette's CTA color. Best default for conversion. |
| Couture Glow | `couture-glow` | Dark/gold/pink glow treatment for premium campaign moments. |

## Frontend Data Flow

1. Payload Admin stores all presentation controls in the `site-theme` global.
2. `src/app/(frontend)/layout.tsx` fetches `site-theme` via `getCachedGlobal('site-theme')()`.
3. The layout applies attributes to `<html>`:
   - `data-skin`
   - `data-fontset`
   - `data-hero-layout`
   - `data-card-density`
   - `data-section-mood`
   - `data-cta-style`
4. CSS variables and Tailwind utility compositions respond to these attributes.
5. Components read theme choices primarily through CSS variables/data attributes, not by duplicating palette logic in TypeScript.

This preserves static-friendly rendering and avoids client-side theme recomputation.

## Component Architecture

### Site Theme Global

Update `src/SiteTheme/config.ts` to include the new select fields and clear admin descriptions. Keep defaults conservative:

- `colorScheme`: `rose-conversion`
- `heroLayout`: `centered-editorial`
- `productCardDensity`: `boutique-grid`
- `sectionMood`: `light-editorial`
- `ctaStyle`: `conversion-filled`
- `fontSet`: `playfair-inter` for closer `.superdesign` alignment.

Regenerate Payload types after schema changes.

### Theme CSS

Update `src/app/(frontend)/theme.css` to define variables for each palette:

- Background and foreground.
- Card background/foreground.
- Primary and primary foreground.
- Accent and accent foreground.
- CTA and CTA foreground.
- Border/ring/input.
- Luxury-specific variables such as:
  - `--candera-theme-hero-overlay`
  - `--candera-theme-section-wash`
  - `--candera-theme-divider`
  - `--candera-theme-cta`
  - `--candera-theme-cta-foreground`
  - `--candera-theme-glow`

Keep values accessible and avoid low-contrast decorative text.

### Shared UI Patterns

Use shadcn/ui primitives already present in `src/components/ui/`:

- `Card`, `CardHeader`, `CardContent`, `CardTitle` for product/category/editorial cards.
- `Button` for CTAs.
- `Input`, `Textarea`, `Label`, `Form` for contact/newsletter forms.
- `Badge` for product tags/status.
- `Separator` for hairline dividers.
- `Sheet` for mobile nav if header changes require it.
- `Dialog` remains appropriate for product quick view.

Tailwind should provide layout, spacing, responsive behavior, hover effects, and theme-specific variants through CSS variables/data attributes.

## Page Designs

### Homepage

Use the `.superdesign` storefront structure, adapted to existing Payload blocks:

1. Hero: centered editorial by default, with large serif headline, rose/purple accent word, softened product image, and high-contrast CTA.
2. Collections/category section: three editorial category cards with 4:5 imagery, centered copy, dividers, hover image zoom.
3. Featured products/archive: shadcn Card-based product grid with palette-specific card density and CTA behavior.
4. Editorial story section: alternating text/image layout inspired by the About reference.
5. Newsletter/Inner Circle CTA: dark or palette-specific high-contrast CTA band depending on `sectionMood` and `ctaStyle`.

Update `src/endpoints/seed/home-static.ts` content where needed so fallback seeded content reflects the new structure and copy.

### Product Listing Page (`/products`)

Adapt `src/app/(frontend)/products/page.tsx` to match `.superdesign/design_iterations/candera_collections.html`:

- Hero/header area with centered divider, headline, and product-count copy.
- Filters styled as shadcn/Tailwind outline pills or select controls using theme variables.
- Product cards use `productCardDensity` to control grid spacing and image scale.
- Result labels and empty states use editorial copy and high-contrast recovery CTAs.
- Preserve current query/search param behavior (`tag`, `sort`, `page`).

### About Page (`/about`)

Create a dedicated About route if not present:

- Use `.superdesign/design_iterations/candera_about.html` as the layout source.
- Hero with pull quote and divider.
- Alternating story sections with 4:5 imagery and editorial headings.
- Values section using shadcn Cards.
- Optional CTA to products or contact.

### Contact / Content-Style Pages

Refine `src/app/(frontend)/contact/page.tsx`:

- Keep dynamic form lookup behavior.
- Use a two-column editorial inquiry layout.
- Place form in a shadcn Card styled as a crafted note with palette-aware border/accent.
- Use theme CTA style for submit buttons through shared Button styles.
- Ensure forms remain accessible with labels, focus rings, and clear validation states.

Generic CMS content pages should inherit improved typography, section dividers, and palette-aware backgrounds through shared `PageHeader`, `ContentBlock`, `BannerBlock`, and CSS variables where practical.

## Error Handling and Accessibility

- If an unknown `site-theme` option is stored, fall back to the default theme values.
- All palette text/background pairs must meet WCAG AA contrast for normal text where used.
- CTA colors must have accessible foreground text.
- Do not rely on color alone for filter active states; include shape, border, label, or aria state.
- Respect `motion-reduce` for hover/entrance effects.
- Product cards must remain keyboard-accessible; preserve existing link and quick-view behavior.
- Contact form validation should continue to expose errors with `role="alert"` or existing conventions.

## Testing and Validation

Implementation should validate:

1. Type generation succeeds after `SiteTheme` schema changes.
2. Lint/type checks pass.
3. The frontend renders with each palette selected.
4. Hero layout, card density, section mood, and CTA style visibly affect pages.
5. `/`, `/products`, `/about`, and `/contact` render responsively on mobile and desktop.
6. Product filtering/sorting/pagination still works.
7. Contact form still submits or handles validation as before.
8. Accessibility spot checks for contrast, keyboard focus, and reduced motion pass.

Recommended commands, subject to environment availability:

```bash
pnpm generate:types
pnpm lint
pnpm build
```

For commands that require secrets or DB access, use the repo convention:

```bash
pass-cli run --env-file .env -- <command>
```

## Out of Scope for This Pass

- Full product-detail redesign, except preserving compatibility with card/quick-view links.
- Checkout/cart implementation.
- A/B testing infrastructure or analytics event wiring.
- Admin preview thumbnails for each theme. The controls are select fields for this pass.
- Migrating live production content unless explicitly requested during implementation.

## Success Criteria

- Candera landing pages visually align with the `.superdesign` luxury storefront direction.
- Admins can select conversion-informed palettes and layout controls in Payload Admin.
- The selected admin controls affect frontend rendering through data attributes/CSS variables.
- The system uses shadcn/ui components plus Tailwind styling.
- Existing content, product listing behavior, forms, and Payload workflows remain functional.
- The implementation is maintainable: theme logic is centralized, components stay reusable, and pages do not duplicate large one-off style systems.
