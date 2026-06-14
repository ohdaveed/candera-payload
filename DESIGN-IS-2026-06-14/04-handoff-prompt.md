# Handoff Prompt — /make-plan

Copy-paste the block below as your next prompt.

---

```
/make-plan Redesign the Candera homepage and /products storefront. Current design scored 13/30 on a Dieter Rams audit with a critical failure on principle #8 (Thorough, scored 0) and total below the 20-point REFINE threshold.

Verdict (from audit 2026-06-14):
> The Candera homepage has a strong visual identity — warm palette, editorial typography, coherent brand voice — but it is built on an interaction layer that is effectively inaccessible and unfinished: every state category (focus, empty, loading, error, success, disabled) is either absent or suppressed, focus rings are explicitly set to `outline-style: none`, the type and spacing systems are not codified into a disciplined scale, and the JS/font payload is substantially overweight for a storefront whose primary action is a single Etsy link. The aesthetic bones are worth preserving; the structural, accessibility, and performance foundations need to be rebuilt.

Why redesign and not refine: Principle #8 (Thorough) scored 0 because all six UI state categories (focus, empty, loading, error, success, disabled) are absent or suppressed, and focus rings are explicitly removed via `outline-style: none` on every interactive element. Total 13/30 is well below the 20-point REFINE floor.

Preserve from current design (MUST NOT be changed):
- Brand palette: warm parchment/linen `rgb(245,242,237)`, terracotta `rgb(221,125,82)`, rust `rgb(168,80,43)`, near-black body text `rgb(20,20,18)` — defined in CSS custom properties
- "Buy on Etsy" label on all three CTA locations (ProductCTASection, StickyCTABar, QuickViewDialog) — already honest, do not rename
- 0-idle-animation approach — no looping animations at rest; keep the motion restraint
- Status card content concept in StorefrontHero (current release + ships date + batch info) — content is distinctive; only rebuild the container if the visual structure needs it
- Editorial large-type hero intent — big, confident display type as anchor is intentional brand voice

Discard (structural patterns causing the failures):
- `outline-style: none` on interactive elements. Evidence: computed styles on all interactive elements at render time (Visual subagent). Caused failure on principle #8 (Thorough).
- Undefined 17-stop type scale and fractional spacing grid. Evidence: 17 computed type sizes including 16.64px, 20.8px, 520.36px (Visual subagent). Caused failure on principles #3 (Aesthetic) and #10 (As little design as possible).
- Globally bundled Framer Motion. Evidence: motion-dom + framer-motion = 129KB loaded on every page for ScentQuiz only (Weight subagent). Caused failure on principle #9 (Environmentally friendly).
- "Vessels" as generic UI label for products. Evidence: products/page.tsx:109,121 — "No vessels found", "View all vessels". Caused failure on principle #4 (Understandable).
- Stat cluster using qualitative words in quantitative format. Evidence: StorefrontHero/Component.tsx:190–205 — "Small / Micro-batch / Hand / Poured & labeled / CA / Ships from" displayed as metric stats. Caused failure on principles #4 (Understandable) and #6 (Honest).
- "Studio Boutique" toast alias. Evidence: BoutiqueLink.tsx:18–19 — toast says "Redirecting to Studio Boutique... Preparing your ritual transition." after user clicked "Buy on Etsy". Caused failure on principle #6 (Honest).

Top 5 moves (verbatim from audit):

1. #8 Thorough — Focus rings and all six UI states.
   Every interactive element has `outline-style: none`. Rebuild with a `:focus-visible` ring system. Add skeleton loading for ProductGrid (products/page.tsx), empty state (products/page.tsx:109–115), error state for failed Etsy navigation. Target: all 6 state categories present and confirmed in QA.

2. #3 Aesthetic + #10 As little design as possible — Type scale to 6–7 stops, spacing to strict 4pt grid.
   Collapse 17 computed type sizes to a disciplined scale in CSS custom properties or Tailwind config. Eliminate fractional spacing (3.25px, 6.5px etc.). All spacing values should resolve to multiples of 4px.

3. #9 Environmentally friendly — Lazy-load Framer Motion, reduce fonts.
   Dynamic import ScentQuiz block (or at minimum its Framer Motion dependency). Reduce 11 woff2 font files (412KB, Weight subagent) to 2–3 weights of one family. Target: initial JS under 250KB production, font payload under 100KB.

4. #4 Understandable + #6 Honest — Replace "vessels" on generic strings, fix stat cluster.
   products/page.tsx:109 "No vessels found" → "No products found for {tag}." products/page.tsx:121 "View all vessels" → "View all products". StorefrontHero:190–205 stat cluster: either add real units ("50+ vessels", "14-day cure") or replace with a labeled list with honest qualitative copy.

5. #6 Honest — Remove or fix the BoutiqueLink toast.
   BoutiqueLink.tsx:18–19: remove the toast entirely, or change description to "Opening on Etsy" to match the button label the user already read.

Redesign principles in priority order:
1. #8 Thorough — ship no interactive surface without all six states + visible focus rings
2. #3 Aesthetic — enforce a 6-7 stop type scale and 4pt spacing grid as tokens before writing any component
3. #9 Environmentally friendly — lazy-load per-block, reduce font variants, target <250KB JS initial

Deliverables for the plan:
- Token spec: finalized 6–7 stop type scale, 4pt spacing grid, color tokens (consolidate 29 to core 8–10), defined in one place
- Component state matrix: each interactive component × 6 states (empty, loading, error, success, focus, disabled) — specify what each looks like before implementation
- New primary flow: compare side-by-side with current (what the user sees on homepage → products → product detail → Etsy)
- Performance budget: JS <250KB production, fonts <100KB, network requests <25 on homepage
- Migration path: which CMS fields need renaming (e.g. if any label fields change), and how StickyCTABar and ProductCTASection are updated without breaking the Etsy link behavior
- Cutover criteria: all 6 state categories confirmed present, Lighthouse accessibility score ≥90, focus ring visible on Tab navigation through all primary controls

Constraints:
- Stack: Next.js App Router + Payload CMS (do not change)
- Etsy as commerce backend — no on-site checkout (do not change)
- Brand palette and editorial tone must be preserved (see Preserve list above)
- Branch: fix/code-review-findings (or a new branch off main)
```
