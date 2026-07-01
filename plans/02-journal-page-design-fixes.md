# Plan 02 — Journal / Posts Page Design Fixes

**Source:** Design critique of the `/posts` (Journal) listing page.
**Status:** Phases 1, 2, 3 & 5 complete & verified (2026-07-01). All code work done. Remaining: content items only — thin grid (3.3), low-res images incl. the "360" mark (3.4/4.2). Two decisions still open, both recommend keep-as-is: italic cards (2.1); watermark twice (4.1).
**Method:** Each item was reconciled against the actual code (three Explore passes) **and** a live screenshot of `http://localhost:3000/posts`. The reviewer reported real _symptoms_; several of their guessed _mechanisms_ were wrong. Items are tagged so the executor knows what is a settled fix vs. a judgment call vs. a content task.

Tags:

- **[FIX]** — confirmed code change, low ambiguity.
- **[DECISION]** — design judgment call; recommendation given, get a 👍 before executing.
- **[CONTENT]** — lives in the CMS / an uploaded asset, not in code.

> Executor rule: this page is a **visual** artifact. After each phase, re-screenshot `http://localhost:3000/posts` (Playwright, dev server already runs on :3000) and compare — code-reading alone cannot verify these.

---

## Phase 0 — Confirmed facts ("allowed surface")

These are the real files/classes/tokens. Do not invent APIs; edit only these.

**Route & composition**

- `src/app/(frontend)/posts/page.tsx` — render order: `EditorialPageHero` → featured `Section` → archive `Section` (grid) → `InnerCircleCTABlock`. (uncommitted working-tree edits already present)
  - Featured wrapper: `<Section padding="none" className="mt-16 mb-28">` — `posts/page.tsx:52`
  - Archive `Section`: `padding="large"` (= `py-32 md:py-48`) **plus** `pt-8 md:pt-12` — `posts/page.tsx:60-61`
  - Inner container: `mt-24 pb-16 md:pb-24` — `posts/page.tsx:65`
  - Section header block: `mb-12 md:mb-16`, eyebrow+title `gap-4` — `posts/page.tsx:67`
  - Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12` — `posts/page.tsx:78`
  - Grid renders **`ArticleCard`** (confirmed) — `posts/page.tsx:86`

**Cards**

- `src/components/ArticleCard/index.tsx` — renders **date, no category eyebrow**.
  - `<time>`: `font-sans text-xs font-semibold uppercase tracking-[.14em] text-candera-stone/70 mb-2` — `ArticleCard/index.tsx:47`
  - `<h3>` headline: `font-display text-lg font-normal not-italic leading-[1.2] …` — `ArticleCard/index.tsx:54` (**Fraunces, roman**)
  - excerpt `<p>`: `font-serif italic text-sm text-candera-sage-text …` — `ArticleCard/index.tsx:59`
- `src/components/FeaturedPostCard/index.tsx` — renders **"Featured Story" badge, no date**.
  - Badge — `FeaturedPostCard/index.tsx:34`
  - `<h2 className="h2 text-candera-vellum …">` (**Fraunces, italic**) — `FeaturedPostCard/index.tsx:42`
- NOTE: `src/components/Card/index.tsx` is a _different_ card (used elsewhere, e.g. related posts/products). The Journal grid does **not** use it. Don't edit it for this work.

**Typography system** (`src/app/(frontend)/typography.css`)

- All display headings `h1–h4/.h1–.h4/.hero-heading` = `font-display` (**Fraunces**) + **italic** + `font-normal`. — `typography.css:37-81`
- `.eyebrow` = `font-sans font-bold uppercase text-candera-ember-strong`, `--font-size-xs` (`0.64rem`), `--tracking-widest` (`0.3em`). — `typography.css:84-89`; component `src/components/ui/eyebrow.tsx`
- `.editorial` = `font-editorial` (**EB Garamond**) italic — pull-quotes only, not headlines. — `typography.css:141-146`
- Fonts declared in `src/app/(frontend)/layout.tsx:24-43` (Fraunces / DM Sans / EB Garamond via `next/font/google`).
- **Verified:** every headline on the page is Fraunces. There is **no second serif** on headlines. The reviewer's "slightly different serif" is Fraunces **italic (hero/featured) vs. roman (cards)** at different optical sizes.

**Ghost watermark (same device, two spots)**

- Hero decorative word: `font-display italic text-white/[0.04] text-[clamp(8rem,18vw,16rem)]`, value `"Journal"` — `src/components/EditorialPageHero/index.tsx:46-53` (prop set at `posts/page.tsx:48`)
- Footer watermark: `font-display font-bold text-[180px] text-candera-obsidian opacity-[0.03]`, value `"CANDERA"` — `src/Footer/Component.tsx:27-35`
- Live shot confirms both render (hero "…urnal" bleeds off right edge; "CANDERA" at footer). Different words, both ~3–4% opacity, ~one viewport apart.

**Newsletter CTA input** (`src/blocks/InnerCircleCTA/`)

- Block on dark bg: `<Section className="bg-candera-obsidian">` — `Component.tsx:16`
- Input wrapper: `flex items-center border border-candera-stone/30 bg-candera-obsidian/40 p-1 focus-within:border-candera-vellum …` — `EmailForm.tsx:44`
- Input text/placeholder already **pass** WCAG AA. The problem is the **rest-state border** (`stone/30`) is visually near-invisible on the dark panel until focus.

**Footer theme toggle**

- `<ThemeSelector />` under "Appearance / Switch the studio mood" — `src/Footer/Component.tsx:87-89`
- Custom `ThemeProvider` (not next-themes), `useTheme()` — `src/providers/Theme/index.tsx`; localStorage key `payload-theme`.
- Button + icon (Monitor/Sun/Moon by state), `aria-label="Theme: Auto — click to switch"` — `src/providers/Theme/ThemeSelector/index.tsx:15-19,50-66`
- a11y is **good** (aria-label updates). Gap: **no visible state for sighted users** — icon-only, no text label / active styling.

---

## Phase 1 — Contrast & accessibility (fast, high-value)

1. **[FIX] Newsletter input rest-state border.** `EmailForm.tsx:44` — raise the default border from `border-candera-stone/30` to a clearly visible value on `bg-candera-obsidian` (try `border-candera-stone/50`, verify against the dark block, keep the `focus-within:border-candera-vellum` brightening). Goal: the field boundary is perceptible before focus.
2. **[FIX] Placeholder legibility check.** Confirm `placeholder-candera-stone/50` still reads once the border is bumped; leave if AA holds (it does today at ~10:1).
3. **[CONTENT/DATA] Broken, duplicated image alt text.** _(Found in independent review — invisible to a visual critique.)_ Every post image on the page renders `alt="Curving abstract shapes with an orange and blue gradient"` — Payload-starter boilerplate, wrong on candle photos, identical across all three (screen-reader garbage + generic alt leaking into SEO). Source is **seed/CMS data**, not a component:
   - Seed defaults: `src/endpoints/seed/image-1.ts:4` and `src/endpoints/seed/image-2.ts:4` — correct the `alt` to describe the actual candle imagery (for future seeds).
   - Live data: the rendered alt comes from each Media doc's `alt` field (via `src/utilities/getMetaImage.ts`). Fix the **live** `alt` on the affected Media docs in `/admin` (or via a targeted Local API script). ⚠ Do **not** re-seed to fix this — seeding is destructive per project rules.
   - ⚠ Guard: alt must describe _each_ image individually, not a shared string.
4. **[FIX] Mobile newsletter layout.** At 390px the email input + "JOIN THE CIRCLE" button share one row and get cramped (`InnerCircleCTA/EmailForm.tsx`). Stack them on small screens (input full-width above the button).

**Verify:** re-screenshot the dark CTA block (desktop + 390px); input outline visible at rest, button not cramped on mobile. Confirm each post image's `alt` is unique and descriptive (re-run the DOM check: images should no longer share one alt string). No console errors.

---

## Phase 2 — Typography & eyebrow hierarchy

> Reframed. The font family is **already unified** (all Fraunces) — "unify the serif" is a no-op. The real, live issues are (a) whether the italic/roman/size mix reads as competing, and (b) the **eyebrow asymmetry** between featured and cards.

1. **[DECISION] Italic (hero/featured) vs. roman (cards).**
   - Recommendation: **keep cards roman.** Roman Fraunces at `text-lg` is more scannable in a list; reserving italic display for the hero + section anchors is a sound editorial hierarchy, not an accident. Do **not** make cards italic.
   - If the user still wants tighter unity, the cheaper lever is tuning the **size step** between the "Reflections & Rituals." section header (italic h2/h3) and the card `text-lg` roman headline so the hierarchy reads as intentional — not changing the style. Only do this on explicit request.
2. **[FIX] Eyebrow / date consistency across the two card types.** Today: featured = eyebrow, no date; `ArticleCard` = date, no eyebrow. Pick **one** eyebrow pattern and apply to both:
   - Recommended pattern: **eyebrow label + date on one line**, using the existing `.eyebrow` class for the label and the existing `<time>` styling for the date, as a single flex row above the headline.
   - Featured (`FeaturedPostCard/index.tsx:34`): add the published date beside the "Featured Story" badge.
   - Cards (`ArticleCard/index.tsx:45-52`): add a small category/eyebrow label (post category if available; else a static "Journal"/section label) on the same row as the existing date.
   - Reuse `src/components/ui/eyebrow.tsx` — do not hand-roll a new label style.
   - ⚠ Guard: confirm posts actually carry a category field before wiring one in; if not, use a static eyebrow rather than inventing a field.

**Verify:** screenshot both card types; eyebrow row (label + date) is consistent in weight/placement across featured and grid cards.

---

## Phase 3 — Layout density & whitespace

> Two separate problems the reviewer merged: stacked vertical padding (code) and thin content (CMS).

1. **[FIX] Collapse the stacked vertical rhythm.** The "dead zone" is additive padding: featured `mb-28` (`:52`) + archive `py-32 md:py-48` (`:60`) + `pt-8 md:pt-12` (`:61`) + inner `mt-24` (`:65`) + header `mb-12 md:mb-16` (`:67`). Consolidate to one coherent scale so the grid and the CTA don't float in cream. Suggested direction: drop the archive `Section` from `large` toward `medium` (`py-24 md:py-32`) and remove the redundant `mt-24`/`pt-8` doubling — pick a single top offset, not three.
2. **[FIX] Orphaned third grid column.** _(Found in independent review — this is the sharpest "unfinished" tell, more than the vertical gap.)_ The grid is `lg:grid-cols-3` (`posts/page.tsx:78`) but there are only 2 remaining cards, so the entire right third sits empty and the row reads lopsided. When `remainingPosts.length < 3`, render a responsive column count that matches the item count (e.g. 2-up, centered) so there's no orphaned track. Keep 3-up once there are ≥3 cards.
3. **[CONTENT / DECISION] Thin grid (1 featured + 2 cards).** Code can't manufacture posts. Options, in order of recommendation:
   - (a) After Phase 3.1 (padding) + 3.2 (column fix), the page reads far less "unfinished" with the same 3 posts — do these first and re-judge.
   - (b) If still thin, publish more Journal posts (CMS).
4. **[CONTENT] Low-resolution source images.** _(Found in independent review.)_ Native sizes are small — featured `993×662`, white card `699×367`, red card only `327×491` — and are upscaled into their frames (`_next/image?w=1920` on a 900px source), so they'll look soft on retina. Replace the post cover uploads with higher-resolution assets in the CMS. This is also where the reviewer's "360" mark would live (baked into `blog-hero-candle-book-900x600.jpg`); confirm by opening the Media file (covered in Phase 4.2).
5. **[FIX] Mobile hero / featured crowding.** _(Found in independent review.)_ At 390px the featured headline ("…Costing You Hours of Burn Time") nearly overlaps the hero ("The Journal") — the `mt-16` featured offset (`posts/page.tsx:52`) isn't enough once the hero compresses. Add breathing room between the hero and the featured card at the mobile breakpoint.

**Verify:** full-page screenshot at **desktop and 390px**; the featured → grid → CTA rhythm is continuous, no orphaned empty column, no large cream band before the dark block, and the featured card clears the hero on mobile.

---

## Phase 4 — Watermark & the featured-image artifact

1. **[DECISION] Ghost watermark appearing twice on one page.** Same device (giant low-opacity Fraunces display text) in hero ("Journal") and footer ("CANDERA").
   - Recommendation: **keep both.** They're different words, both ~3–4% opacity, and roughly a viewport apart — they don't visually collide on the live page. The device reads as atmospheric, not repetitive.
   - If the user wants it reserved to one spot: drop the hero `decorativeWord` prop on **secondary** pages (posts/products) and keep the footer "CANDERA" as the brand sign-off. This is a one-line change at `posts/page.tsx:48` (remove/blank the prop). Low priority.
2. **[CONTENT] The "360" mark on the featured image.** This is **not** in code — the featured post's cover is a photographic upload (candle + book). If a "360"/stock watermark is baked into the image, it must be fixed in the CMS:
   - Identify the featured post's `heroImage` / `meta.image` Media doc in Payload admin (`/admin`).
   - Inspect the source file; if it carries a watermark/badge, replace the upload with a clean asset.
   - Screenshot at this resolution was inconclusive — confirm by opening the actual Media file, not by eye on the rendered page.

**Verify:** (4.1) if changed, screenshot confirms single watermark; (4.2) open the Media asset and confirm it's clean.

---

## Phase 5 — Footer theme-toggle affordance

1. **[FIX] Add a visible state indicator for sighted users.** `ThemeSelector/index.tsx:50-66` — the icon changes but there's no text/active styling.
   - Recommended: render a small text label next to the icon showing the current mode ("Auto" / "Light" / "Dark"), driven by the existing `value` from `useTheme()`. Cheapest clear affordance; keep the existing `aria-label` (a11y already good) and the 44×44 hit target.
   - Do **not** swap in next-themes or restructure the provider — reuse the existing custom `useTheme()` + `value`.

**Verify:** screenshot the footer in each state; the current mood is readable without hovering; keyboard focus ring intact.

---

## Final phase — Verification

1. **Visual:** full-page screenshot of `/posts` before/after; walk the critique list and confirm each addressed item.
2. **a11y:** input border visible at rest; toggle state visible; contrast still AA on the dark block.
3. **Anti-pattern grep:** no new hardcoded serif on headlines (`grep -rn "font-serif" src/components/ArticleCard src/components/FeaturedPostCard` should only hit the excerpt, not headlines); confirm eyebrow uses `.eyebrow`/`Eyebrow`, not an ad-hoc class.
4. **Build/checks:** `vp check` (format/lint/types). If any collection/field was touched for the eyebrow category, also `pnpm generate:types` + `pnpm payload migrate:create` — **but** Phase 2 as written adds no schema, so migrations should not be needed.
5. Re-run the affected test suite; ship nothing red.

---

## Reviewer-claim reconciliation (what was wrong vs. real)

| Reviewer claim                                                    | Verdict                                                                                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Card headlines are "a slightly different serif"                   | **Wrong mechanism.** Same font (Fraunces); it's italic-vs-roman + size.                                                        |
| "Unify card headlines with the display font family"               | **No-op** — already unified. Reframed to eyebrow consistency + optional size tuning.                                           |
| Card category eyebrows ("REFLECTIONS") are inconsistent vs. dates | **Partly wrong:** `ArticleCard` has **no** category eyebrow; featured has **no** date. Real issue = the asymmetry (Phase 2.2). |
| Newsletter input has "no visible border"                          | **Real symptom, softened:** border exists but `stone/30` is near-invisible at rest (Phase 1.1). Text passes AA.                |
| Ghost watermark used twice                                        | **Real observation, judgment call** (Phase 4.1).                                                                               |
| "360" artifact on featured image                                  | **Real, content-side** — an uploaded asset, not code (Phase 4.2).                                                              |
| Dead whitespace / page reads under-populated                      | **Real:** additive padding (Phase 3.1) + genuinely thin content (Phase 3.2).                                                   |
| Theme toggle has no state affordance                              | **Real for sighted users**; a11y (aria) is already fine (Phase 5.1).                                                           |

### Found in independent review (not in the original critique)

| Finding                                                                        | Verdict                                                          | Phase |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----- |
| All 3 post images share `alt="Curving abstract shapes…"` (starter boilerplate) | **Real defect** — a11y + SEO; data-side (seed + live Media docs) | 1.3   |
| Grid is `lg:grid-cols-3` with only 2 cards → orphaned empty column             | **Real** — sharpest "unfinished" tell                            | 3.2   |
| Low-res source images (red card `327×491` upscaled)                            | **Real** — soft on retina; CMS assets                            | 3.4   |
| Featured card crowds hero at 390px                                             | **Real** — mobile spacing                                        | 3.5   |
| Newsletter input + button cramped on mobile                                    | **Real** — stack on small screens                                | 1.4   |
