---
target: homepage + supporting pages
total_score: 25
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
timestamp: 2026-06-14T20-08-30Z
slug: src-app-frontend-slug-page-tsx
---
# Candera — Design Critique: Homepage + Supporting Pages

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | ScentQuiz URL-driven state is good; Etsy redirect launches without feedback or "leaving site" notice |
| 2 | Match System / Real World | 3 | Domain language (curing, batch, botanical) is consistent; "Inner Circle" explained only below the fold |
| 3 | User Control and Freedom | 3 | ScentQuiz URL-state enables back-button nav; no "Start Over" or "Skip"; no breadcrumbs on product detail |
| 4 | Consistency and Standards | 3 | Typography tokens rigorously followed; `rounded-full` on InnerCircleCTA email input and button break the 0–2px radius standard |
| 5 | Error Prevention | 3 | Email validation and disabled states present; no "leave quiz?" confirmation, no autosave on contact form |
| 6 | Recognition Rather Than Recall | 2 | "Inner Circle" and "Atmosphere Study" used without inline explanation; no tooltips on botanical terminology |
| 7 | Flexibility and Efficiency | 1 | No keyboard shortcuts, bulk actions, recently viewed products, or wishlist |
| 8 | Aesthetic and Minimalist Design | 3 | Palette restrained and purposeful; over-decorated with ember rules — section rhythm is one-size-fits-all; 9px labels fail readability |
| 9 | Error Recovery | 3 | Inline error messages use plain language; "Something went wrong. Please try again." is generic; no retry or undo after email submission |
| 10 | Help and Documentation | 1 | No FAQ, tooltips on curing/botanical terms, or advanced search help |
| **Total** | | **25/40** | **Needs attention** |

## Anti-Patterns Verdict

**LLM assessment: Borderline — the bones are real but the scaffolding is showing.**

This is not an AI template drop-in. The palette is genuinely distinctive (obsidian/vellum/copper is not the sage+blush DTC default). The typography system has conviction. The ScentQuiz is differentiated interaction design. But the editorial-typographic framing has been applied like wallpaper:

- **Eyebrow-template rot.** Every section opens with the same pattern: ember rule line → uppercase tracked label → display heading → editorial description. Counted 14+ instances across the site. The "no-eyebrow-by-default" rule is violated on every surface. Readers will pattern-halt by the third section and stop parsing. The sections that would lose nothing without their eyebrow: Testimonials, ScentQuiz CTABand, InnerCircleCTA, Related Posts "Further Reflections", SiteTheme-switcher sections.

- **Section rhythm lockstep.** StorefrontHero, EditorialPageHero, InnerCircleCTA, Testimonials, ScentQuiz CTABand all share the identical skeleton (rule → eyebrow → heading → body). The Archive sidebar is the only variant. Sections were templated, not composed.

- **Radius inconsistency.** `rounded-full` on InnerCircleCTA email input and button, and on header search icon, clash with the editorial austerity of 0–2px structural radius elsewhere.

- **Homepage has no narrative arc.** Five blocks stitched together without progression: Hero → product grid → quotes → quiz → email signup is not a story, it's a CMS dump.

- **9px labels on status card fail readability.** `text-[9px]` with `tracking-[.22em]` pushes legibility past what WCAG or design sense allows.

**Deterministic scan: Clean.** The automated detector found zero anti-patterns across all scanned files (exit code 0). This is expected — the detector catches code-level patterns (gradient text, border-radius excess, stripe backgrounds), not composition-level issues like eyebrow proliferation or section rhythm.

**Visual overlays: Skipped.** No dev server running; browser visualization was unavailable.

## What's Working

1. **ScentQuiz is genuinely differentiated.** URL-driven state persistence, the reveal animation, editorial result copy ("Your atmosphere study is complete"), staggered scent profile reveal — this is brand-making interaction design.

2. **Typography system has conviction.** Fraunces italic at -0.02em tracking on clamp(2.5rem, 5vw, 4.5rem), EB Garamond italic for editorial, DM Sans 300 for body. Real typographic opinion, not a theme. `text-balance` and `text-pretty` thoughtfully applied throughout.

3. **Status card on StorefrontHero breaks the hero-metric template.** It reads as a physical object (batch status, curing info, unit count) rather than a sterile stat panel. Shows design conviction.

## Priority Issues

- **[P1] Eyebrow-template rot**: 14+ sections open with ember rule + eyebrow label + display heading + editorial description. Readers pattern-halt by the third and stop parsing. **Fix**: Apply "no-eyebrow-by-default" rule. Maximum 1 per page, zero is fine. Remove eyebrows from Testimonials, ScentQuiz CTABand, InnerCircleCTA, Related Posts. **Suggested command**: **distill**

- **[P1] Radius inconsistency**: `rounded-full` on InnerCircleCTA email input (EmailForm.tsx:73) and button (:92), and header search icon (Nav/index.tsx:26), violate 0–2px structural radius design token. Pill shapes read as SaaS DTC against editorial austerity. **Fix**: Replace `rounded-full` with `rounded-none` or `rounded-[2px]`. **Suggested command**: **harden**

- **[P2] Homepage has no narrative arc**: Five blocks stitched without progression. Hero → grid → quotes → quiz → email is not a story. **Fix**: Remove or demote Testimonials to secondary (no full-bleed obsidian). Frame Archive with contextual connection to hero. Make InnerCircleCTA feel like a coda, not a chore. **Suggested command**: **shape**

- **[P2] 9px labels on status card fail readability**: `text-[9px]` with `tracking-[.22em]` on StorefrontHero status card (Component.tsx:140,150,161) is unreachable for low-vision users. **Fix**: Bump to `text-[11px]`, reduce tracking to `[.18em]`. **Suggested command**: **harden**

- **[P3] Etsy handoff lacks trust signals**: Buy on Etsy CTA provides no return policy, authenticity statement, or "leaving our site" indicator. **Fix**: Add brief `<aside>` below the buy button with policy snippet. **Suggested command**: **clarify**

## Persona Red Flags

**Elena (Intentional Living Shopper)**: Arrives after evening browsing seeking a ritual object. Dramatic StorefrontHero hooks her. But Archive feels abrupt — she was in a dark editorial space and now sees an e-commerce grid. ScentQuiz delights her, but then she's asked for email in a `rounded-full` input that feels like a Mailchimp embed, not a studio invitation. She notices the eyebrow pattern by the third section and registers the repetitiveness as lack of craft.

**Riley (Stress Tester)**: The `rounded-full` inconsistency catches their eye as a design token leak. 9px labels fail their readability test. Generic "Something went wrong. Please try again." with no retry button frustrates them. ScentQuiz has no "Start Over" affordance after beginning.

**Sam (Accessibility-Dependent)**: Hero heading contrast passes. But `text-[9px]` labels fail minimum font size recommendations. `tracking-[.22em]` creates legibility issues for dyslexic users. Filter buttons on products page use color-only active indication (border-color change) — no underline or icon difference, so colorblind users see no distinction between active and inactive states.

## Minor Observations

- Homepage `pb-32` on page wrapper + per-block padding creates inconsistent bottom spacing
- Film grain SVG noise implemented 3 ways (CSS `.grain`, CSS `.film-grain`, `FilmGrain` React component) with different `baseFrequency` values (0.75, 0.9, 0.65) — may create doubling on dark sections where both are applied
- Product detail back link uses `tracking-[.3em]`; search page uses `btn-text` class (different visual weight)
- Search result count on products page uses `<p class="eyebrow">` rather than `<Eyebrow>` component — functionally equivalent but inconsistent
- Filter buttons on products page use color-only active state — no icon or structural change for colorblind users

## Questions to Consider

1. **If every section gets an eyebrow, does any section have a headline?** Removing eyebrows from Testimonials, ScentQuiz CTABand, and InnerCircleCTA — would any of those sections lose meaning? The answer is no — they communicate their purpose through content, not annotation.

2. **What if the homepage ended on the ScentQuiz result?** It is the most memorable interaction on the site. The InnerCircleCTA could be integrated into the quiz result flow (as it partially already is). Ending on "Your atmosphere study is complete" with a personalized result would be exponentially more powerful than ending on a signup form.

3. **The brand story strip on the product detail page is a full-bleed obsidian panel with strong editorial copy. Why is this not a homepage block?** Consider whether a brand-strip block belongs in the homepage layout — between Archive and Testimonials — to give the user a breather from browsing and a reason to care about the craft.
