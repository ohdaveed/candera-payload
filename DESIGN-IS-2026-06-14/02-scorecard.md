# Scorecard — Candera Homepage Design Audit

Scored by orchestrator from 01-evidence.md. Per-principle anchors applied verbatim. Tie-breaker: lower score. Worst instance scored, not mean.

---

1. **Good design is innovative — Score: 2/3**
   Evidence: StorefrontHero uses an editorial status-card pattern (current release, ships date, batch info) not common in the artisan candle category; CTA hierarchy and art-direction-forward type scale refresh the category norm without imitating any single competitor.
   Justification: Scores 2 (refreshes an existing pattern with a clear improvement) rather than 3 because the individual elements (oversized type, minimal product cards, warm palette) are each found in higher-end DTC brands; the combination is distinctive but not unprecedented.

2. **Good design makes a product useful — Score: 2/3**
   Evidence: Primary task (land → understand → product → Etsy) completes in a direct path. "Vessels" jargon at `products/page.tsx:109,121` and the stat cluster at `StorefrontHero:190–205` require first-time visitors to decode brand vocabulary before the task can fully resolve.
   Justification: Scores 2 (primary task completes but adjacent surface adds steps) rather than 3 because the brand vocabulary substitution ("vessels" for candles, stat cluster that looks like metrics but is qualitative) creates one interpretive detour on the /products route.

3. **Good design is aesthetic — Score: 1/3**
   Evidence: 17 distinct computed type sizes (01-evidence.md §Visual), irregular spacing scale with fractional computed values, 29 color tokens (including 17 alpha variants) — no consistent 4pt or 8pt grid. Core palette and editorial intent are coherent; execution has too many orphan sizes.
   Justification: Scores 1 (3–5 inconsistencies OR one jarring violation) rather than 0 because the palette and visual intent form a legible system; the 17-stop type scale and fractional spacing are systemic inconsistency, not visual noise.

4. **Good design makes a product understandable — Score: 1/3**
   Evidence: "Vessels" (`products/page.tsx:109,121`), stat cluster presenting qualitative descriptors as quantitative metrics (`StorefrontHero:190–205`), "Studio Boutique" toast alias vs. "Buy on Etsy" button label (`BoutiqueLink.tsx:18`), "Assistance" column header (`Footer:74`) — four label clarity gaps documented.
   Justification: Scores 1 (2–3 controls unclear; jargon present) rather than 0 because the primary purchase action "Buy on Etsy" is unambiguous; the jargon accumulates at the periphery rather than on the critical path.

5. **Good design is unobtrusive — Score: 2/3**
   Evidence: 0 idle animations; 0 modals on load; warm palette recedes behind content; hero display type is editorial intent (art direction), not decoration competing with product. Oversized decorative 520px background text element exists but functions as texture, not chrome.
   Justification: Scores 2 (chrome visible but quiet) rather than 3 because the 520px background text element and heavily editorial hero type scale push past "unobtrusive" into authorial; readable but not invisible.

6. **Good design is honest — Score: 1/3**
   Evidence: 4 distinct inflations: "peak botanical clarity" (`products/page.tsx:17`), "intentional living" (`Footer:52`), "ritual transition" (`BoutiqueLink.tsx:19`), stat cluster qualitative-as-quantitative (`StorefrontHero:190–205`). No dark patterns. "Buy on Etsy" label is fully honest.
   Justification: Scores 1 (2+ inflations) rather than 0 because no deceptive flows were found and the primary commerce label is explicitly honest; the inflations are in ambient/peripheral copy, not on transactional controls.

7. **Good design is long-lasting — Score: 2/3**
   Evidence: Warm botanical palette and hand-craft language have multi-year durability. The oversized display type hero (up to 180px, fluid scaling) is a 2023–2026 DTC trend marker. "Botanical" as aesthetic category is at peak saturation.
   Justification: Scores 2 (1 dated marker) rather than 1 because only the hero typography scale registers as trend-indexed; the palette, card minimalism, and overall restraint are not year-stamped.

8. **Good design is thorough down to the last detail — Score: 0/3**
   Evidence: Focus rings: `outline-style: none` on all interactive elements — effectively absent (Visual subagent). States missing or ambiguous: empty ✗, loading ✗, error ✗, success ✗, focus ✗, disabled ✗. ScentQuiz Framer Motion animations lack `useReducedMotion()` guard. All 6 states either missing or unconfirmed.
   Justification: Scores 0 (4+ states missing or default-browser) — every state category is either absent or ambiguous, and focus rings are suppressed with `outline-style: none`, which is the worst-case thoroughness failure.

9. **Good design is environmentally friendly — Score: 1/3**
   Evidence: Production JS ~350–450KB (over 100KB threshold); 11 font files totaling 412KB; 46 network requests; TTI 2.13s on localhost. Framer Motion (129KB) loaded globally for ScentQuiz only. 0 idle animations (good). Reduced motion: partial — ScentQuiz lacks guard. Dark mode: partial.
   Justification: Scores 1 (500KB–2MB uncompressed, motion partially gated) because the combined JS + font payload substantially exceeds the 100KB initial-load target, and reduced motion coverage has a documented gap in ScentQuiz.

10. **Good design is as little design as possible — Score: 1/3**
    Evidence: Nav items array rendered twice in DOM (desktop + mobile, both present simultaneously) at `Header/Nav/index.tsx:38` + `MobileNav.tsx:61`. Footer dual-render risk for Assistance and legal links `Footer:63–158`. `disableInnerContainer` dead prop `StorefrontHero:16`. Stat cluster block uses qualitative words in a quantitative visual format — decorative structure that adds without function. 520px decorative text element in hero.
    Justification: Scores 1 (3–5 removable elements) rather than 0 because the duplicate nav is a standard responsive technique (not genuinely redundant in intent), and the page is not dominated by decoration; the removable items are structural quirks, not visual bloat.

---

## Total: 13 / 30

| #   | Principle                    | Score     |
| --- | ---------------------------- | --------- |
| 1   | Innovative                   | 2         |
| 2   | Useful                       | 2         |
| 3   | Aesthetic                    | 1         |
| 4   | Understandable               | 1         |
| 5   | Unobtrusive                  | 2         |
| 6   | Honest                       | 1         |
| 7   | Long-lasting                 | 2         |
| 8   | Thorough                     | **0**     |
| 9   | Environmentally friendly     | 1         |
| 10  | As little design as possible | 1         |
|     | **Total**                    | **13/30** |
