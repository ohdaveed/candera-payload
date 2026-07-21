/make-plan Redesign the candera-payload storefront frontend (Home/shop grid, product detail, cart drawer, About, Contact, Events, Scent Quiz) sourced from the Claude Design project "Photo design creation" (853d02a7-120d-4fae-beb8-5fb44f789a78). Current design failed audit at 11/30 (corrected 2026-07-20) with a critical gap in principle #2 (useful).

Verdict paragraph (quoted from 03-verdict.md, corrected 2026-07-20 — the events/reviews content was confirmed real, not fabricated, so #6 was rescored 0→3; the verdict is otherwise unchanged):

> Total is now 11/30 (still well under the REFINE threshold of 20), and principle #2 (useful) still scored 0 on its own — the checkout CTA in the portable CartDrawer.jsx component has no handler at all, and no interactive control on the .dc.html pages is keyboard-reachable. A single 0 on a load-bearing dimension (#2, #4, or #6) is sufficient to force REDESIGN under the skill's rule, and that holds regardless of the honesty correction.

Why redesign and not refine: principle #2 (useful) scored 0 — a dead checkout CTA and zero keyboard-reachable primary controls block the primary task outright; that alone is load-bearing and forces REDESIGN.

Preserve from current design:

- Typography pairing: Cormorant Garamond (display/headings/prices) + Jost (labels/nav/body UI) — `tokens/typography.css`.
- Palette core as _tokens_ (cream/plum/lavender family) — `tokens/colors.css` — but the redesign must actually consume `var(--token)` in markup, not re-literal every hex value.
- The CSS-drawn crescent MoonMark (`components/brand/MoonMark.jsx`) — never a bitmap/SVG logo per the design's own readme.md.
- Product-copy voice and structure: poetic name + two-note scent line + 1–2 sentence warm story, sentence-case serif display / uppercase tracked sans labels, no emoji, no hype-exclamation copy.
- The real Etsy listing wiring for 7 of 8 catalog entries (verified against the live Payload/Neon `products` table this session) — reuse the Payload Local API as the actual data source instead of a hardcoded `catalog()` array. Re-verify the 8th ("Rose Embrace" / listing 4530195107, now titled "Fall Spice Botanical Candle" live) before reuse — likely just drifted since the design was built.
- **The Events calendar content (7 venues/dates/addresses) and the shop-page social-proof stats/quote are confirmed real and accurate — carry them forward as real content, not discard.** Evidence: user confirmation, 2026-07-20 (see 01-evidence.md Copy & Honesty correction note).

Discard (structural patterns causing the failures):

- Non-semantic `<div onClick>`/`<span onClick>` interaction pattern used for add-to-cart, cart toggle, quiz option selection, and event-row expand. Evidence: 01-evidence.md Structural, Accessibility. Caused failure on principle #2 (useful) and the accessibility gap feeding it.
- The dead `CartDrawer.jsx` checkout button (no `onClick`/`href`). Evidence: 01-evidence.md Structural. Caused failure on principle #2.
- The rounded-corner visual system used in every `.dc.html` page, which directly contradicts the token system's `--radius:0` rule. Evidence: 01-evidence.md Visual. Caused failure on principle #3.
- Untokenized ad hoc hex literals (13+ values with no token equivalent) and the undocumented third typeface (Parisienne). Evidence: 01-evidence.md Visual. Caused failure on principles #3 and #10.
- Unbounded autoplay video (5 assets, 2 stacked per page in places) with no `prefers-reduced-motion` gating. Evidence: 01-evidence.md Weight & Friction. Caused failure on principle #9.

Top moves from the audit (verbatim):

1. #2 useful: Fix the dead checkout CTA and convert every non-semantic click trigger to a real, keyboard-reachable button/link. Evidence: 01-evidence.md Structural, Accessibility.
2. #9 environmentally friendly: Cap autoplay video to at most one per page and add `prefers-reduced-motion` gating; reconsider whether video is needed at all given readme.md's own stated preference for static bordered-slot photography. Evidence: 01-evidence.md Weight & Friction.
3. #3 aesthetic / #10 least design: Resolve the square-vs-rounded contradiction in favor of one system (recommend keeping the token's `--radius:0`, since it's the more distinctive, on-brand choice per readme.md), and consume `var(--token)` values instead of hardcoded hex. Evidence: 01-evidence.md Visual.
4. #8 thorough: Design loading, error, and focus states before this becomes a real cart/checkout flow — only "empty cart" currently exists.

Redesign principles in priority order:

1. #2 useful — every primary action (add to cart, checkout handoff to Etsy, submit quiz, submit contact form) is a real, keyboard-operable control, wired to this repo's actual Payload-backed product data (`src/collections/Products.ts`, `src/utilities/syncEtsy.ts`), not a static mock catalog.
2. #6 honest — no user-facing claim (review counts, testimonials, event dates/venues) ships without a real, current data source; if a section can't be backed by real data yet, it is omitted, not fabricated.
3. #10 as little design as possible — one corner system, one token source of truth actually consumed by markup, two typefaces (drop the undocumented third), motion that's gated and minimal.

Deliverables for the plan:

- New information architecture mapped onto this repo's actual routes: `src/app/(frontend)/[slug]`, `products`, `posts`/`how-to`, `contact` (existing `submitFormAction` server action), plus a new Scent Quiz surface (there's already a `ScentQuiz` block and `ScentProfiles`/`Quizzes` collections in `src/blocks/` and `src/collections/` — check whether this design's quiz should be a new block variant or replace/extend the existing one before building a parallel implementation).
- New primary flow (low-fi, labeled) for browse → product detail → add to cart → Etsy checkout handoff, compared side-by-side to the current design project's flow.
- Token migration plan: port `tokens/*.css` values into this repo's Tailwind v4 CSS-variable theme in `globals.css` (per CLAUDE.md: "CSS-variable-driven theme"), replacing inline styles with Tailwind utility classes and shadcn/ui primitives where they fit (`Button`, `Input`) rather than hand-rolled equivalents.
- States checklist (empty, loading, error, success, focus, disabled) specified per interactive surface before implementation, not after.
- Content audit: the Events calendar and social-proof stats/quote are confirmed real — seed/wire them from a real Payload-backed source rather than a hardcoded array; re-verify the one stale catalog listing ID ("Rose Embrace" → currently "Fall Spice Botanical Candle" live) before reuse.
- Migration path: this is a visual redesign of a live, revenue-generating site — plan should specify whether it ships behind a preview/staging route first or replaces the current storefront blocks directly, and what the rollback path is.
- Cutover criteria: define when the current `(frontend)` block-driven pages are considered fully replaced.

Anti-patterns to guard against (specific to REDESIGN):

- Porting the `.dc.html` markup's non-semantic click-handler pattern under new Tailwind styling — rebuild interactions with real `<button>`/`<a>` semantics from the start.
- Hardcoding the real Events/review content directly in component code — it's confirmed accurate, but should still be seeded through Payload (admin-editable) rather than baked into a static array, so future updates don't require a code change.
- Redesigning to chase the rounded-card/soft-shadow trend the current mockups already show — the token system's own `--radius:0` square-edged intent is the more defensible, longer-lasting choice per the readme's stated brand rationale.
- Treating the Preserve list as optional — the typography pairing, palette core, MoonMark, and copy voice are the parts of this design that are actually good; the redesign should keep them, not throw out the brand along with the broken parts.
