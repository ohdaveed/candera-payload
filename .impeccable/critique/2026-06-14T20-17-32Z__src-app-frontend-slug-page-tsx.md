---
target: homepage (src/app/(frontend)/[slug]/page.tsx)
total_score: 28
p0_count: 0
p1_count: 0
p2_count: 2
p3_count: 2
timestamp: 2026-06-14T20-17-32Z
slug: src-app-frontend-slug-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Toast on Etsy navigation works; no loading skeletons for SSG content (acceptable) |
| 2 | Match System / Real World | 3/4 | Editorial language is on-brand; "micro-batches" & "botanical profile" fit the domain |
| 3 | User Control and Freedom | 3/4 | Etsy links open in new tab; ScentQuiz URL-param answers allow back-button navigation |
| 4 | Consistency and Standards | 3/4 | Radius system now consistent (2px max); eyebrow usage tamed to 1-per-page rule |
| 5 | Error Prevention | 3/4 | Email validation on quiz form; Etsy toast as navigation guardrail |
| 6 | Recognition Rather Than Recall | 3/4 | Clear block hierarchy; scannable sections; nav visible |
| 7 | Flexibility and Efficiency | 2/4 | Content site — no shortcut expectations; tab navigation works |
| 8 | Aesthetic and Minimalist Design | 3/4 | Editorial restraint is strong; removed unnecessary eyebrows cleaned up visual noise |
| 9 | Error Recovery | 3/4 | Inline validation errors with specific messages; form submission errors surfaced |
| 10 | Help and Documentation | 2/4 | Newsletter CTA explains what you get; no formal help (expected for brand site) |
| **Total** | | **28/40** | **Good** |

**Rating**: 28-35 = Good — Address weak areas, solid foundation.

## Anti-Patterns Verdict

**Does this look AI-generated?** Mixed. The editorial atelier aesthetic is well-executed and avoids most obvious tells. However:

- The homepage block order (Hero → Archive → Testimonials → Quiz → CTA) is the standard landing page skeleton. While each block is individually well-crafted, the overall composition doesn't surprise — it delivers exactly what a landing page template promises.
- The trust signal badges on the product page (`text-[10px]`) use tiny SVGs that feel like an afterthought rather than an integral design element. The icons are generic Feather-style — not distinctive.
- The ScentQuiz is the most differentiated element and the strongest brand expression on the page. Everything else is solid but conventional.

**Deterministic scan**: Clean — 0 findings across all scanned files. No CSS anti-patterns, no radius violations, no gradient text, no glassmorphism, no side-stripe borders.

## Overall Impression

The homepage has improved measurably from the previous critique. The radius inconsistency is fixed, the eyebrow-template rot is resolved, and the 9px labels have been corrected. The editorial aesthetic reads as intentional and restrained — a deliberate brand choice rather than an AI default. The strongest moment is the ScentQuiz block, which combines interactive depth with atmospheric visual design. The weakest moment is the product CTA with its cramped trust badges — they signal trust but don't feel like they belong to the same system.

## What's Working

1. **ScentQuiz block** (`ScentQuiz/Component.tsx`): The multi-step flow with URL-driven state, ambient background reveals, and the "synthesizing your ritual" animation is the most differentiated, brand-coherent experience on the site. The grid of answer options with animated left-borders and background image reveals is genuinely tactile.
2. **StorefrontHero composition** (`blocks/StorefrontHero/Component.tsx`): Strong editorial hierarchy — headline, ember rule, subheading, then CTAs. The status card on the right provides concrete product context without interrupting the hero's atmospheric impact. The gradient overlay and film grain add texture without noise.
3. **Typography system**: Fraunces for display + EB Garamond for editorial body + Inter for UI creates a distinctive editorial voice. The `--font-display` and `--font-editorial` distinction gives flexibility while maintaining cohesion.

## Priority Issues

- **[P2] What**: The ProductCTASection trust badges (`text-[10px]`) sit below the Etsy buy button in a cramped row of three tiny badges with inline SVGs. The `gap-1.5` between icon and text combined with `text-[10px]` makes the whole row feel like a legal disclaimer rather than a trust signal.
  - **Why it matters**: Trust signals that look like fine print undermine trust. The 10px size and low-opacity `text-candera-stone/60` make them nearly invisible.
  - **Fix**: Either (a) drop the icon row and weave the trust copy into a single sentence below the shipping text, or (b) make them more substantial — bump to `text-[11px]`, increase opacity, use ember accents.
  - **Suggested command**: `$impeccable polish`

- **[P2] What**: The homepage page wrapper uses `bg-candera-linen/30` — a 30% opacity background. This means the true page background shifts slightly warm compared to the pure white/off-white sections above and below.
  - **Why it matters**: With multiple theme/skin options and section-level overrides, a semitransparent page bg can cause unpredictable layering on different skins. The "linen at 30%" effect may look intentional on some skins and accidental on others.
  - **Fix**: Either make it `bg-candera-linen` (full strength) for consistency, or remove it to let section-level backgrounds speak.
  - **Suggested command**: `$impeccable polish`

- **[P3] What**: The Archive block `home-static.ts` seed data passes hardcoded product data with no fallback variation. If `selectedDocs` is empty or the Etsy sync hasn't run, the homepage shows nothing in the archive slot.
  - **Why it matters**: Fresh installs or demo environments will show an empty archive block unless the seed data includes at least inline placeholder entries.
  - **Fix**: Ensure `home-static.ts` supplies fallback archive entries that survive an empty DB.
  - **Suggested command**: `$impeccable harden`

- **[P3] What**: `candera-linen/30` uses OKLCH `#fdfbf7` at 30% opacity, which on white backgrounds produces an almost-imperceptible shift. The intent ("warm page bg") may not justify the complexity of an opacity-based token.
  - **Why it matters**: Minor — cosmetic, warm cast is intentional for editorial feel.
  - **Fix**: Alternative: use `bg-candera-vellum` directly (a dedicated warm-light token at `#f5f2ed`) which avoids opacity layering altogether.
  - **Suggested command**: `$impeccable polish`

## Persona Red Flags

**Jordan (Confused First-Timer)**: The "Buy on Etsy" button is unambiguous. The trust badges, while small, don't confuse. The ScentQuiz has clear instructions at each step. Low abandonment risk for first-timers. **3/10 risk.**

**Riley (Stress Tester)**: The ScentQuiz state is URL-driven, so refreshing mid-flow preserves the user's place — good. Empty states for Archive: if seed data is missing and Etsy hasn't synced, the archive block renders an empty grid with no "No products yet" message. This is a real edge case. **5/10 risk.**

**Casey (Distracted Mobile)**: The hero CTA buttons are at the bottom of the hero section — thumb-reachable on mobile. The ScentQuiz answer options are large touch targets (p-10, full width on mobile grid). The product CTA "Buy on Etsy" is wide and bottom-of-section. The trust badges at 10px may be hard to read on small screens. **4/10 risk.**

## Minor Observations

- The ScentQuiz uses `Eyebrow` component for the quiz title ("Discovery Awaits") and result section header ("Your Atmosphere Study") — technically these are section headers within an interactive widget, not eyebrow rot. Worth noting but not a problem.
- The color token `candera-ember` is used as both a text accent and background across different blocks — consistent usage is good.
- The status card in StorefrontHero uses `border-candera-vellum/15` with `hover:border-candera-vellum/25` — subtle interaction that rewards exploration.

## Questions to Consider

- "What would the landing page look like with one fewer block? Is there a block that could be cut to make the remaining ones breathe more?"
- "Could the product trust signals be embedded into the 'Buy on Etsy' button itself (e.g., sub-text on the button) rather than as a separate row?"
