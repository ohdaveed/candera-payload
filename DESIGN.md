---
name: Candera — Botanical Scent Studio
description: Digital storefront and micro-batch artisan platform for hand-poured botanical candles in numbered batches.
colors:
  obsidian: '#141412'
  vellum: '#f5f2ed'
  linen: '#fdfbf7'
  ember: '#dd7d52'
  ember-strong: '#a8502b'
  rose: '#b28c9c'
  sage-text: '#5f6459'
  stone: '#dacbb8'
  ash: '#e2ddd6'
  rose-strong: '#8a5e72'
  field: '#d8d5cc'
  sage: '#7a8174'
typography:
  display:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)'
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: '3rem'
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Fraunces, Georgia, serif'
    fontSize: '1.953rem'
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.15
    letterSpacing: 'normal'
  body:
    fontFamily: 'DM Sans, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 300
    lineHeight: 1.75
    letterSpacing: 'normal'
  label:
    fontFamily: 'DM Sans, system-ui, sans-serif'
    fontSize: '0.64rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: '0.3em'
    textTransform: uppercase
  editorial:
    fontFamily: 'EB Garamond, Georgia, serif'
    fontSize: '1.25rem'
    fontWeight: 400
    fontStyle: italic
    lineHeight: 1.7
rounded:
  button: '0px'
  card: '2px'
  input: '2px'
  badge: '2px'
  image: '0px'
spacing:
  '2': '2px'
  '4': '4px'
  '8': '8px'
  '12': '12px'
  '16': '16px'
  '24': '24px'
  '32': '32px'
  '44': '44px'
  '48': '48px'
  '64': '64px'
  '96': '96px'
  '128': '128px'
components:
  button-cta:
    backgroundColor: '{colors.obsidian}'
    textColor: '{colors.vellum}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '16px 40px'
    height: '52px'
  button-cta-ember:
    backgroundColor: '{colors.ember-strong}'
    textColor: '{colors.vellum}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '16px 40px'
    height: '52px'
  button-cta-inverse:
    backgroundColor: '{colors.linen}'
    textColor: '{colors.obsidian}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '16px 40px'
    height: '52px'
  button-cta-ghost-dark:
    textColor: '{colors.vellum}'
    typography: '{typography.label}'
    rounded: '{rounded.button}'
    padding: '16px 40px'
    height: '52px'
  button-default:
    backgroundColor: '{colors.obsidian}'
    textColor: '{colors.linen}'
    rounded: '4px'
    padding: '8px 16px'
    height: '44px'
  card:
    backgroundColor: '{colors.linen}'
    textColor: '{colors.obsidian}'
    rounded: '{rounded.card}'
    padding: '24px'
  input:
    backgroundColor: '{colors.vellum}'
    textColor: '{colors.obsidian}'
    rounded: '{rounded.input}'
    padding: '12px 16px'
    height: '48px'
---

# Design System: Candera — Botanical Scent Studio

## 1. Overview

**Creative North Star: "The Editorial Atelier"**

Candera's design language is the confidence of a design studio that happens to make candles. It borrows from the editorial world — generous whitespace, sharp typography, art-direction-forward composition — and applies it to the sensory experience of botanical scent. The page should feel like opening a carefully bound monograph: composed, intentional, worth taking time with.

The palette is warm without being rustic, refined without being cold. Near-black body text on a warm paper ground anchors every page in legibility. Accents in copper and muted rose arrive sparingly, like an illuminated initial in a manuscript — present when they matter, absent when they don't.

**This system explicitly rejects:** generic mass-market candle aesthetics (farmhouse visuals, Mason jar tropes, stock-photo candle imagery), the DTC SaaS cliché of super-white hyper-minimal pages, and any ornament that doesn't serve the product.

**Key Characteristics:**

- Editorial typography as the primary design material — Fraunces italic at generous scales
- Near-zero border radius; the only curvature is a 2px micro-radius that says "designed," not "softened"
- Warm paper-toned backgrounds (vellum, linen) with a subtle film grain texture for tactility
- Grounded shadows that make surfaces feel like physical objects on the page
- Sparse, intentional color — the page breathes by being mostly ink on paper
- Every interaction state handled with the same care as a numbered candle batch

## 2. Colors

The palette is drawn from a botanical studio's materials: paper, ink, clay, dried flowers, fired copper. Chroma is reserved for accent; the page is primarily ink on warm paper.

### Primary

- **Obsidian** (#141412): Near-black with the faintest warmth. Used for body text, headings, and the primary CTA button background. The ink of the brand.

### Neutral

- **Vellum** (#f5f2ed): Warm off-white. The main page background — the "paper" of the brand. All surfaces rest on this.
- **Linen** (#fdfbf7): Bright warm white. Card backgrounds, tinted section backgrounds, inverse CTA buttons. Slightly brighter than vellum for surface distinction.
- **Ash** (#e2ddd6): Warm grey. Subtle dividers, secondary border treatment, muted decorative elements.

### Accent

- **Ember** (#dd7d52): Warm copper-orange. Primary accent for CTA buttons, highlight elements, emphasis. Appears on ≤10% of any given screen.
- **Ember Strong** (#a8502b): Deep burnt orange. Hover states for ember accents, focus rings, stronger emphasis.

### Secondary

- **Rose** (#b28c9c): Muted rose. Used as an alternate primary accent in skin variants. Softens the warmth when used.
- **Rose Strong** (#8a5e72): Deep rose. Hover states and stronger accent in rose-based skins.

### Muted

- **Sage Text** (#5f6459): Muted green-grey. Secondary body text, label text, editorial pull-quote color. It carries a botanical whisper without shouting "green."
- **Sage** (#7a8174): Mid-tone green-grey. Decorative ambient use, secondary borders.
- **Stone** (#dacbb8): Warm tan. Input borders, card borders, subtle outline elements.
- **Field** (#d8d5cc): Light beige. Muted background elements, secondary surface tint.

### Named Rules

**The One-Voice Rule.** The ember and rose accents are used on ≤10% of any given screen. Their rarity is the point — when they appear, they mean something.

**The Ink-on-Paper Rule.** The foreground-to-background relationship is ink on paper, not figure on ground. Obsidian text on vellum background. No dark-mode-as-default, no light-on-dark text blocks except as deliberate section mood shifts.

## 3. Typography

**Display Font:** Fraunces (italic, roman) — with Georgia, serif fallback
**Body Font:** DM Sans (light 300, semibold 600, bold 700) — with system-ui sans-serif fallback
**Editorial Font:** EB Garamond (regular, italic) — with Georgia, serif fallback
**Mono Font:** Geist Mono — with monospace fallback

**Character:** The pairing is editorial sans-serif body with a distinctive serif display voice. Fraunces italic carries the brand's personality — warm, refined, slightly calligraphic — while DM Sans provides clean, readable body text that doesn't compete. EB Garamond italic is reserved for pull quotes and editorial asides; it signals "this is the voice of the maker."

### Hierarchy

- **Display** (Fraunces 400 italic, clamp(2.5rem, 5vw, 4.5rem), line-height 1, letter-spacing -0.02em): Hero headlines only. `text-wrap: balance`. The most prominent typographic statement on any page.
- **Headline** (Fraunces 400 italic, 3rem, line-height 1.1, letter-spacing -0.01em): Section headings (h2). `text-wrap: balance`.
- **Title** (Fraunces 400 italic, 1.953rem, line-height 1.15): Subsection headings (h3), card titles. `text-wrap: balance`.
- **Subtitle** (Fraunces 400 italic, 1.563rem, line-height 1.2): Minor headings (h4), featured pull-quote sizes. `text-wrap: balance`.
- **Body** (DM Sans 300, 1rem, line-height 1.75): All prose content. Max line length 70ch. `text-wrap: pretty` to reduce orphans.
- **Lead** (DM Sans 300, 1.25rem, line-height 1.75): Opening paragraphs, featured body text. Colored in sage-text for distinction.
- **Label** (DM Sans 700, 0.64rem, letter-spacing 0.3em, uppercase): Button text, CTA labels, small navigation items, form labels.
- **Editorial** (EB Garamond 400 italic, 1.25rem, line-height 1.7): Pull quotes, maker's notes, editorial asides. Colored in sage-text.
- **Caption** (DM Sans 300, 0.8rem, line-height 1.5): Image captions, metadata, small print. Colored in sage-text.
- **Eyebrow** (DM Sans 700, 0.64rem, letter-spacing 0.3em, uppercase, ember-strong color): Section kickers. Used sparingly — maximum one per page.

### Named Rules

**The No-Eyebrow-by-Default Rule.** The tiny uppercase tracked section kicker is reserved for deliberate brand voice, not generated as default scaffolding on every section. One per page at most; zero is fine.

**The 70ch Ceiling Rule.** Body text max-width is 70 characters. No paragraph should span the full viewport width.

## 4. Elevation

Candera uses grounded, object-like shadows rather than tonal layering or flat design. Surfaces should feel like physical objects resting on paper — a stack of card stock, a heavy-stock page, a matte photograph.

The only tonal layering is the grain texture overlay (film grain at 4% opacity, `mix-blend-mode: overlay`), which adds tactile atmosphere without simulating depth.

### Shadow Vocabulary

- **Card shadow** (`0 1px 3px rgba(20, 20, 18, 0.06), 0 0 0 1px rgba(20, 20, 18, 0.04)`): Default card, product card, any raised surface. The 1px pseudo-border is essential — it gives the card a crisp edge without a full border stroke.
- **Small shadow** (`0 1px 2px rgba(20, 20, 18, 0.05)`): Subtle elevation for hovered small elements, tooltips.
- **Large shadow** (`0 18px 40px -12px rgba(20, 20, 18, 0.25)`): Modals, dialogs, floating panels. Noticeably lifted from the page.
- **Button hover** (`hover:shadow-xl` with `hover:-translate-y-0.5`): CTA buttons lift 2px and cast a broader shadow on hover, reinforcing the physical metaphor.

### Named Rules

**The Grounded-by-Default Rule.** Surfaces are at rest. Shadows appear as responses to state (hover, elevation, interaction). No floating elements at rest.

## 5. Components

### Buttons

- **Shape:** Sharp rectangle throughout (0px radius for CTA variants, 4px for standard variants). No rounding — the absence of curves says "this is intentional."
- **Primary CTA (obsidian):** Obsidian (#141412) background, vellum (#f5f2ed) text, DM Sans 700 at 0.8rem uppercase with 0.3em letter-spacing. 52px height, 40px horizontal padding. `shadow-lg` at rest; on hover, lifts 2px (`hover:-translate-y-0.5`) with `hover:shadow-xl`. Transitions in 300ms ease-candera-enter.
- **Ember CTA (conversion):** Ember-strong (#a8502b) background, vellum text. Same typography and sizing as primary CTA. On hover, shifts to obsidian background.
- **Inverse CTA:** Linen (#fdfbf7) background, obsidian text. For placement on dark or tinted sections.
- **Ghost CTA (dark):** Transparent with a 40%-opacity vellum border, vellum text. For overlays on hero imagery.
- **Standard buttons:** shadcn/ui variants (default, destructive, outline, secondary, ghost, link) at 44px default height with 4px radius. These follow the semantic CSS variables and are used in admin-adjacent contexts.
- **Button Wrapping Rule:** All specialized button components (e.g., `SubmitButton`, `PrimaryButton`) must wrap the canonical `Button` component from `src/components/ui/button.tsx` to inherit standard focus-visible rings and tap-scale animations.
- **Hover/Focus:** Hover applies `hover:shadow-xl hover:-translate-y-0.5` for CTA variants; standard variants apply `hover:bg-primary/90`. Focus-visible shows a `ring-4 ring-ring/50` outline with 1px visible outline. `active:scale-[0.98]` press effect on all variants.

### Cards

- **Corner Style:** 2px radius — a subtle micro-curve that prevents sharpness without softening the brand's character.
- **Background:** Linen (#fdfbf7) for product cards and content cards; vellum (#f5f2ed) for cards that need to recede.
- **Shadow Strategy:** Card shadow (1px pseudo-border + soft drop shadow). On hover, elevates the shadow and applies `-translate-y-0.5`.
- **Border:** None — the shadow's 1px pseudo-border (`0 0 0 1px rgba(20,20,18,0.04)`) provides the edge definition.
- **Internal Padding:** 24px (p-6). Product cards use `p-0` with content padding inside.
- **Image Aspect Ratios:** Product images at `aspect-[4/5]`, post cards at `aspect-[3/2]`, grid product thumbnails at `aspect-square`.
- **CMS Content Safeguard:** Because all card details (titles, descriptions, scent profiles) are dynamically populated via Payload CMS, cards must enforce strict line-clamping (`line-clamp-1` / `line-clamp-2`) and minimum heights (`min-h-*`) on their text blocks to prevent grid misalignment.

### Inputs & Fields

- **Style:** Vellum background at 50% opacity, stone border at 30% opacity, DM Sans 300 text. 2px radius. 48px default height with 12px/16px padding.
- **Focus:** Ember-strong border at 50% opacity, linen background, 2px semi-transparent ember-strong outline ring at `outline-offset: 2px`. Transitions in 300ms.
- **Error:** Red border + ring via semantic `--error` token. Same focus behavior with error-colored ring.
- **Disabled:** 50% opacity with `pointer-events: none`.
- **Minimal variant:** Bottom-border only (`border-b border-obsidian/70`) for inline, understated contexts.

### Navigation

- **Style:** Inline horizontal links across the top of the page, DM Sans 700 at label size (0.8rem) with 0.2em uppercase tracking. Near-black text at rest.
- **Link Hover:** Underline via `background-size` technique — growing underline from center, 300ms transition.
- **Active/Current:** Bold weight, underline always visible.
- **Mobile:** Slide-in sheet from right (Radix Sheet/Dialog), full-height, vellum background, same typography with additional vertical spacing (44px minimum touch targets per Fitts's Law).
- **Header background:** Transparent by default (hero bleeds behind); `bg-background/80 backdrop-blur-sm` on scroll. 4.5rem height with sticky positioning.

### Scent Notes (Chips)

- **Style:** Vellum (#f5f2ed) background, obsidian text, 2px radius pills. `px-2 py-0.5` with `text-xs` DM Sans.
- **State:** Static decorative elements (not interactive). Used on product cards to communicate scent notes.

### Badges

- **Shape:** Full rounded pill (`rounded-full`), 2px radius border, `px-2.5 py-0.5` with `text-xs font-semibold`.
- **Variants:** Default (primary bg, primary-foreground text), secondary, destructive, outline — mapped to semantic tokens.

### Signature Components

**Section:** Full-width container with configurable padding (none: 0, small: py-12 md:py-16, medium: py-24 md:py-32, large: py-32 md:py-48). Accepts `tinted` boolean for linen background shift. Used as the primary layout rhythm element across all pages.

**Container:** Max-width 1200px centered wrapper with 5vw horizontal padding. All page content flows through this.

**Film Grain:** Subtle SVG noise overlay at 4% opacity with `mix-blend-mode: overlay`. Applied globally via `body::before` (z-index 9999) for tactile atmosphere, and available as a `film-grain` utility class for per-component application.

## 6. Do's and Don'ts

### Do:

- **Do** use obsidian (#141412) for body text against vellum (#f5f2ed) or linen (#fdfbf7) backgrounds. This is the brand's ink-on-paper contract.
- **Do** use ember (#dd7d52) or ember-strong (#a8502b) as the primary accent, limited to ≤10% of any given screen.
- **Do** keep body text line length at 70ch maximum. Prose should never span the full viewport width.
- **Do** use Fraunces italic for all display and heading text. The italic is not an emphasis style — it's the brand's default heading voice.
- **Do** use DM Sans light (300) for body text. Weight 400 or 700 should be intentional — labels and buttons only.
- **Do** include visible `:focus-visible` ring system (ember-strong at 50% opacity, 2px with 2px offset) on every interactive element.
- **Do** handle all six UI states (empty, loading, error, success, focus, disabled) for every interactive component.
- **Do** use the card shadow (1px pseudo-border + soft drop) for cards and raised surfaces. The pseudo-border is essential — it crisps the edge without a full border stroke.
- **Do** use `text-wrap: balance` on h1–h3, `text-wrap: pretty` on body paragraphs.
- **Do** use `prefers-reduced-motion: reduce` media queries to disable all non-essential motion.
- **Do** wrap all dynamic card layout fields in `line-clamp` and `min-h` to enforce visual consistency when rendering content managed via Payload CMS.

### Don't:

- **Don't** use generic mass-market candle aesthetics — no farmhouse visuals, Mason jar tropes, or stock-photo candle imagery.
- **Don't** use a warm-tinted off-white body background as a default move. Candera's warm paper is vellum, not cream or beige — it's a specific color choice, not a category default.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe on cards, list items, or callouts.
- **Don't** use gradient text (background-clip: text with gradient). Emphasis via weight, size, or ember color only.
- **Don't** use glassmorphism or decorative blur effects. If it needs to feel translucent, the brand has the wrong visual language.
- **Don't** use the tiny uppercase tracked eyebrow (kicker) above every section. Maximum one per page; zero is better.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding. Numbers earn their place when the section is a real sequence.
- **Don't** pair fonts that are similar but not identical — no two geometric sans-serifs or two humanist sans-serifs together.
- **Don't** exceed 6rem (96px) for display heading maximums. The current hero clamp tops at 4.5rem, which is the ceiling.
- **Don't** use display letter-spacing tighter than -0.02em. The current -0.02em is the floor; tighter makes letters touch.
- **Don't** use `border-radius` greater than 2px on cards, inputs, or sections. The 2px micro-radius is the maximum for structural elements. Full pill is fine for badges and tags only.
- **Don't** pair `border: 1px solid` with `box-shadow` with blur ≥ 16px on the same element. Pick one border treatment.
- **Don't** use `repeating-linear-gradient` stripe backgrounds, diagonal stripes, or sketchy SVG illustrations as decoration.
- **Don't** use the slop pattern: "vessels" where you mean "products," "Studio Boutique" where you mean "Etsy," or qualitative claims posed as quantitative metrics.
- **Don't** hardcode visual shadows (such as `shadow-[0_1px_3px...]`) or visual border radii inline within component variants; use standard `shadow-card` and `rounded-card` (2px) tokens instead.
- **Don't** use glassmorphic aside styles or backdrop blurs (like `backdrop-blur-md bg-candera-obsidian/40 rounded-2xl`) on cards or hero callouts; all layouts must remain flat, solid, and aligned to the 2px radius rule.
