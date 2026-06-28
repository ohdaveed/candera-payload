---
target: homepage (slug)
total_score: 26
p0_count: 1
p1_count: 2
timestamp: 2026-06-14T20-34-24Z
slug: src-app-frontend-slug-page-tsx
---

#### Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                               |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Quiz progress & feedback present; testimonial count hidden (slice 3)                    |
| 2         | Match System / Real World       | 3         | Consistent brand voice; "Atmosphere Study" is somewhat abstract                         |
| 3         | User Control and Freedom        | 2         | No quiz back button; no restart after result; email gate is a dark pattern              |
| 4         | Consistency and Standards       | 3         | Theme tokens used throughout; minor btn-text vs Button mismatch                         |
| 5         | Error Prevention                | 3         | Email validation with react-hook-form; InnerCircleCTA input outline fragile             |
| 6         | Recognition Rather Than Recall  | 2         | Quiz progress shown but no reviewable previous answers; URL state not discoverable      |
| 7         | Flexibility and Efficiency      | 2         | URL-driven quiz state enables sharing; no skip-to-content, no search                    |
| 8         | Aesthetic and Minimalist Design | 3         | Strong editorial system; status card slightly dense; quiz reveal rings over-designed    |
| 9         | Error Recovery                  | 3         | Inline errors, dismiss + "Try Again" on ScentQuiz; InnerCircleCTA error not dismissable |
| 10        | Help and Documentation          | 2         | Tooltip on "Botanical Composition" only inline help; no FAQ, no privacy links           |
| **Total** |                                 | **26/40** | **Acceptable**                                                                          |

#### Anti-Patterns Verdict

**AI slop check**: Passes. No gradient text, glassmorphism, sketchy SVG, or stripe backgrounds. The hero status card is close to the hero-metric template pattern (title, price, metrics grid in sidebar) but restrained enough to read as editorial. Eyebrow repetition (hero + testimonials + quiz) is the closest tell.

**Deterministic scan**: CLI detector returned 0 findings, exit code 0. However, the detector's JSDOM adapter cannot resolve Tailwind v4 OKLCH variables or JSX — checks for `cream-palette`, `low-contrast`, `gray-on-color` would only fire in a real browser. Manual review found: hardcoded `#EAD8C0` (should use token), hardcoded gradient `rgba(8,6,4,0.95)`, hover transform on non-interactive status card, ScentQuiz reduced-motion still runs one animation cycle on mount.

**Visual overlays**: Not available (no browser injection performed).

#### Overall Impression

Strong editorial foundation with a cohesive dark-warm palette. The ScentQuiz is the standout interactive feature but its email gate creates the most friction at the worst moment (peak engagement). The site feels intentional and crafted — the issues are predominantly around interaction design, not visual.

#### What's Working

1. **StorefrontHero visual hierarchy** — The full-bleed image with directional gradient overlay, `brightness-[0.38]` + film grain creates a moody, editorial first impression. The ember decorative rules add texture without noise.
2. **ScentQuiz reveal animation** — The staggered reveal (eyebrow → name at `text-8xl` → divider → composition → product link) is the emotional peak of the page. Well-paced and on-brand.
3. **Design token consistency** — Colors, spacing, and radius tokens are used predictably. The system feels cohesive across all sections.

#### Priority Issues

- **[P0] ScentQuiz email gate with no preview or trust signals**: Users must submit email before seeing their full profile result. No reassurance microcopy, no privacy link. Highest-leverage conversion moment with most friction.
- **[P1] No quiz back-navigation or restart**: Once selected, option is locked. No "Back" button during quiz. No "Retake Quiz" after result.
- **[P1] No privacy policy link on either email form**: Both ScentQuiz and InnerCircleCTA collect emails without privacy link. Legal risk + trust erosion.
- **[P2] Hero status card information density**: 6+ data points (title, price, subtitle, divider, 2-col metrics, link) in ~340px card.
- **[P2] InnerCircleCTA input focus styling is fragile**: `focus-within` on parent, `outline-none` + `focus:ring-0` on input. Breaks if DOM changes.
- **[P3] Hardcoded `#EAD8C0` in StorefrontHero and Testimonials**: Should use a CSS variable token.

#### Persona Red Flags

**Jordan (First-timer)**: Email gate is an instant abandonment trigger — doesn't know the brand, asked for email after 3 clicks. "Inner Circle" is undefined. No brand story/About visible in hero. Quiz URL state is not discoverable (no share button).

**Riley (Stress tester)**: Rapid quiz clicks may cause URL race conditions (async `router.push`). InnerCircleCTA input lacks `aria-describedby` for error announcements. No-JS degrades — quiz completely non-functional, forms don't submit. "Something went wrong" covers both "already subscribed" and "server error."

**Casey (Mobile)**: Product card scent notes hidden via `group-hover:translate-y-0` with no `hover:none` fallback for touch devices. Status card becomes a full-width data wall below hero on mobile.

#### Minor Observations

- Double film grain — `FilmGrain` in hero + `body::before` in `layout-utils.css`
- ScentQuiz progress bar uses spring animation (stiffness: 50) — jank on low-end devices
- ScentQuiz result only links to one `featuredProduct` — missed cross-sell
- Archive sticky sidebar `top-24` creates ~120px gap below header
- No testimonial count indicator — `items.slice(0,3)` truncates silently
- `btn-text` class used in place of `Button` component in some locations

#### Questions to Consider

1. What if the ScentQuiz result name and description were shown immediately, gating only the product recommendation behind email?
2. Are ScentQuiz and InnerCircleCTA two distinct journeys, or is one cannibalizing the other?
3. For a candle brand, is the lack of scent-based product filtering or inline preview a conversion leak?
4. What happens when the `html { opacity: 0 }` theme initialization fails silently — is there a fallback?
