# Verdict: REDESIGN

**Corrected 2026-07-20:** the original version of this verdict cited a fabricated-content finding on principle #6 (honest) that the user has since confirmed was wrong — the Events calendar and the social-proof stats/quote in the design project are real and accurate, not placeholder. #6 is rescored 0→3 in `02-scorecard.md`. The verdict itself is unchanged: total is now 11/30 (still well under the REFINE threshold of 20), and principle #2 (useful) still scored 0 on its own — the checkout CTA in the portable `CartDrawer.jsx` component has no handler at all, and no interactive control on the `.dc.html` pages is keyboard-reachable. A single 0 on a load-bearing dimension (#2, #4, or #6) is sufficient to force REDESIGN under the skill's rule, and that holds regardless of the honesty correction.

## Highest-leverage moves

1. **#2 useful** — Fix the dead checkout CTA in `ui_kits/storefront/CartDrawer.jsx` (no `onClick`/`href`) and convert every non-semantic `<div onClick>`/`<span onClick>` trigger (add-to-cart, cart toggle, quiz options, event expand) to a real, keyboard-reachable `<button>`/`<a>`. Evidence: 01-evidence.md Structural, Accessibility.
2. **#9 environmentally friendly** — Cap autoplay video to at most one per page (currently 2 stacked on Home, 2 on About) and add `prefers-reduced-motion` gating; reconsider whether video is needed at all given readme.md's own stated preference for static bordered-slot photography. Evidence: 01-evidence.md Weight & Friction.
3. **#3 aesthetic / #10 least design** — Resolve the square-vs-rounded contradiction (token says `--radius:0`, every page ships 10–20px rounded corners) in favor of one system, and make pages actually consume `var(--token)` values instead of 13+ untokenized hardcoded hex literals. Evidence: 01-evidence.md Visual.
4. **#8 thorough** — Design loading, error, and focus states before this becomes a real cart/checkout flow; only "empty cart" currently exists. Evidence: 01-evidence.md Visual states checklist.
5. **#5 unobtrusive** — Reconcile the full-bleed autoplay video bands and the Upcoming Events radial-gradient background with the design's own stated "no gradients, no photographic full-bleed" rule. Evidence: 01-evidence.md Visual, Weight & Friction.

## What survives

The Cormorant Garamond / Jost pairing, the lavender-plum-gold palette core (as _tokens_, not the untethered hex literals), the CSS-drawn crescent MoonMark, the product-copy voice, **and now also the real Events calendar and real social-proof content** — both confirmed accurate and worth carrying forward as real content, not discarding. See the handoff's Preserve list.

## Scope note (post-audit, separate from the score correction)

This verdict is a design-quality assessment of the Claude Design project in isolation. A separate, user-confirmed scoping decision (documented in `plans/03-botanical-lavender-reskin-and-events.md`) narrowed what actually gets implemented against the live `candera-payload` site: the live site already has a mature, deliberately no-cart, direct-to-Etsy purchase flow (unrelated to this design project's CartDrawer assumption), so principle #2's fix lands as "don't build the broken cart pattern at all," not "repair CartDrawer.jsx." The Events and reviews content, now confirmed real, is exactly the kind of thing that plan's Phase 4 should seed as-is.
