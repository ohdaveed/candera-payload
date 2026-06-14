# Verdict — Candera Homepage Design Audit

## REDESIGN

**Score: 13/30. Principle #8 (Thorough) scored 0; total is well below the 20-point REFINE threshold.**

The Candera homepage has a strong visual identity — warm palette, editorial typography, coherent brand voice — but it is built on an interaction layer that is effectively inaccessible and unfinished: every state category (focus, empty, loading, error, success, disabled) is either absent or suppressed, focus rings are explicitly set to `outline-style: none`, the type and spacing systems are not codified into a disciplined scale, and the JS/font payload is substantially overweight for a storefront whose primary action is a single Etsy link. The aesthetic bones are worth preserving; the structural, accessibility, and performance foundations need to be rebuilt.

---

## What to Preserve

- **Brand palette:** warm parchment/linen base (`rgb(245,242,237)`), terracotta (`rgb(221,125,82)`), rust (`rgb(168,80,43)`), near-black body text
- **Editorial intent:** large, confident display typography as hero anchor; art-direction-forward composition
- **"Buy on Etsy" honest labeling:** the primary transactional label is correct and should be preserved exactly
- **0-idle-animation approach:** the restraint on motion at rest is the right call; keep it
- **Status card concept in hero:** current release + ships date + batch info is distinctive and informative — keep the content, rebuild the container

---

## Top 5 Leverage Moves

1. **#8 Thorough — Implement focus rings and all six UI states.**
   Every interactive element has `outline-style: none` (Visual subagent). Rebuild with a visible `:focus-visible` ring system. Add skeleton loading states for ProductGrid (`products/page.tsx`), empty state for no-results (`products/page.tsx:109–115`), and error state for failed Etsy navigation. This single change moves the score from 0 to at least 2.

2. **#3 Aesthetic + #10 As little design as possible — Codify type scale to 6–7 stops and spacing to a strict 4pt grid.**
   17 computed type sizes and fractional spacing values (Visual subagent) indicate no enforced design token system. Collapse to a disciplined scale in CSS custom properties (or Tailwind config). This resolves both the aesthetic inconsistency score and eliminates the orphan sizes that make the system feel unpolished.

3. **#9 Environmentally friendly — Lazy-load Framer Motion and audit font loading.**
   Framer Motion (`motion-dom` + `framer-motion` = 129KB) loads globally for ScentQuiz only (Weight subagent). Dynamic import the ScentQuiz block. Reduce 11 font files (412KB) to 2–3 weights of a single family. This alone reduces initial load by ~250–350KB.

4. **#4 Understandable + #6 Honest — Replace "vessels" with "products" on generic strings, remove the stat cluster or label it explicitly.**
   "Vessels" at `products/page.tsx:109,121` is brand jargon first-timers won't decode. The stat cluster at `StorefrontHero:190–205` presents qualitative descriptors (Small, Hand, CA) in a quantitative format that implies measurement. Either add units/context or replace with a labeled list.

5. **#6 Honest — Remove the "Studio Boutique" toast or replace with "Opening on Etsy".**
   `BoutiqueLink.tsx:18–19` toast says "Redirecting to Studio Boutique... Preparing your ritual transition." after the user clicked a button labeled "Buy on Etsy." The alias contradicts the honest label. Remove the toast or change to match the button.
