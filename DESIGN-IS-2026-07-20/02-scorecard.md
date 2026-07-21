# Scorecard

1. Good design is innovative — Score: 1/3
   Evidence: serif-display + tracked-sans-label + hairline-border boutique DTC template is a well-established pattern; CSS-drawn crescent MoonMark is the one original touch (01-evidence.md Structural).
   Justification: refreshes an existing pattern with one small original detail, doesn't introduce anything genuinely new.

2. Good design makes a product useful — Score: 0/3
   Evidence: `CartDrawer.jsx` checkout CTA has no `onClick`/`href` at all; keyboard users cannot add-to-cart anywhere on the `.dc.html` pages (01-evidence.md Structural, Accessibility).
   Justification: the primary task — buy a candle — is non-functional in the ported component and unreachable by keyboard in the mockup; this is load-bearing.

3. Good design is aesthetic — Score: 1/3
   Evidence: token system says `--radius:0` everywhere, every actual page uses 10–20px rounded corners; 13+ untokenized hex values duplicate existing plum inks (01-evidence.md Visual).
   Justification: two incompatible visual systems coexist, past "minor inconsistencies" into active contradiction.

4. Good design makes a product understandable — Score: 2/3
   Evidence: labels/CTAs are plain-language and unambiguous throughout; "Shop" nav target behavior is inconsistent (anchor scroll on Home vs. file link elsewhere).
   Justification: a first-time user names every control correctly; one minor navigation-model inconsistency costs the top score.

5. Good design is unobtrusive — Score: 1/3
   Evidence: readme.md states "no gradients, no photographic full-bleed... imagery lives in bordered rectangular slots," yet pages ship full-bleed autoplay video bands and a radial-gradient page background on Upcoming Events (01-evidence.md Weight & Friction, Visual).
   Justification: chrome/decoration actively competes with and sometimes contradicts the brand's own stated restraint.

6. Good design is honest — Score: 3/3 (corrected 2026-07-20)
   Evidence: the review stats/quote and the Events venues/addresses/dates were initially flagged as fabricated from lack of a visible data source; the user confirmed both are real and accurate (01-evidence.md Copy & Honesty, correction note). The one remaining discrepancy — the "Rose Embrace"/"Fall Spice" listing-ID mismatch — reads as post-design listing drift on Etsy, not a false claim in the design itself.
   Justification: every claim, badge, and label maps 1:1 to actual behavior once the real data source is accounted for.

7. Good design is long-lasting — Score: 1/3
   Evidence: rounded pill CTAs, soft floating-card shadows, and backdrop-blur sticky nav are a recognizable 2020s boutique-SaaS/DTC visual signature (01-evidence.md Visual).
   Justification: 2–3 dated trend markers present.

8. Good design is thorough down to the last detail — Score: 1/3
   Evidence: of 6 states audited, only "empty cart" is handled; loading, error, and focus states are absent sitewide (01-evidence.md Visual states checklist).
   Justification: 3+ states missing across the whole surface.

9. Good design is environmentally friendly — Score: 0/3
   Evidence: 5 autoplay-looping video assets (2 stacked on a single Home load), 3 webfont families, zero `prefers-reduced-motion` gating anywhere (01-evidence.md Weight & Friction).
   Justification: video weight alone almost certainly pushes this past the 2MB band; motion is always-on with no reduced-motion path.

10. Good design is as little design as possible — Score: 1/3
    Evidence: the token system is fully bypassed by hardcoded hex/radius literals in every actual page — a duplicated, non-enforcing abstraction — plus an undocumented third typeface and a fabricated stats block that isn't needed for the primary task (01-evidence.md Visual, Copy & Honesty).
    Justification: 3–5 removable/duplicative elements identified.

**Total: 11/30** (corrected 2026-07-20 — #6 revised from 0 to 3 after the user confirmed the events/reviews content is real, not fabricated. Verdict is unaffected: #2 (useful) remains 0 on a load-bearing dimension, which alone forces REDESIGN under the skill's rule; see 03-verdict.md.)
