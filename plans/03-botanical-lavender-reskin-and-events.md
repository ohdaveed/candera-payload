# Plan: Botanical-Lavender Reskin + Real Events Feature

**Source:** Dieter Rams audit of Claude Design project "Photo design creation" (853d02a7-120d-4fae-beb8-5fb44f789a78), 2026-07-20 — verdict REDESIGN (11/30, corrected after the user confirmed the Events calendar and social-proof content are real, not fabricated). Full audit trail: `DESIGN-IS-2026-07-20/`.
**Scope decision (user-confirmed 2026-07-20):** the design project assumes an architecture (on-site cart, greenfield pages) that the live site deliberately does not have. Scope is narrowed to two things only:

1. A new **skin** (palette + typography + brand mark) layered onto the existing `theme.css` skin system — no structural change to the no-cart, direct-to-Etsy purchase flow.
2. A **real Events feature** (new collection + route), since Events genuinely doesn't exist today — built from the design project's real, user-confirmed venue/date data (see Phase 4D), admin-editable going forward rather than hardcoded.

**Explicitly out of scope:** on-site cart/`CartDrawer`, rebuilding Home/Products/ProductDetail/About/Contact/Scent Quiz (all exist, all already passed 3 rounds of design polish — see `plans/01-storefront-redesign.md`, PRs #201/#203/#205), replacing the token/skin architecture. The shop-page social-proof stats/quote are confirmed real (see Phase 0 correction note) but are not part of this plan's scope either — porting them to the homepage would be a separate, explicitly-requested phase.

---

## Phase 0: Documentation Discovery (COMPLETE)

### Allowed APIs & Patterns

**Skin system — copy this exact block shape:**
`src/app/(frontend)/theme.css:241-259` (`html[data-skin='lavender-trust-rose']`) is the closest existing analog — a lavender/rose skin already exists but uses different hex values (`--primary:#8b7ec8`, `--background:#faf9fc`) than the design project's darker plum-ink palette. Add a **new** skin block (don't edit `lavender-trust-rose` — it may already be in use) following the same 15-var shape: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--border`, `--input`, `--ring`.
Skins are selected via `html[data-skin='...']`, driven by the Payload `SiteTheme` global's `colorScheme` select field — `src/SiteTheme/config.ts:19-41` (`name: 'colorScheme'`, `defaultValue: 'rose-conversion'`, `options: [...]`, values match `data-skin` exactly: `rose-conversion`, `black-gold-rose`, `amethyst-amber`, `ink-orchid-coral`, `plum-sage-coral`, `lavender-trust-rose`, `ink-orchid`, `lavender-noir`, `porcelain-pop`, `default`). Add a new option `{ label: 'Botanical Lavender — cream & plum with a lavender accent', value: 'botanical-lavender' }` to this array — this is both the CSS-write and the admin-selectability step, no separate "find it" work needed.

**Source hex values to map (from the design project, `DESIGN-IS-2026-07-20/01-evidence.md` / `tokens/colors.css`):**
`--cream-1:#E6DCF0`, `--plum-1:#33265A`, `--plum-muted-1:#786E90`, `--lavender-1:#7B60AC`, `--lavender-3:#D3C5E4`. Map: `--background`→cream-1, `--foreground`→plum-1, `--primary`/`--ring`→lavender-1, `--accent`→lavender-3, `--muted-foreground`→plum-muted-1. Do not import the 13+ extra untokenized hex values flagged in `01-evidence.md` Visual — resolve those to the nearest existing token instead of adding new ad hoc values.

**`--radius` conflict (already flagged in the audit):** the design project's own token (`--radius:0`, "square-edged") contradicts its own page markup (rounded corners everywhere). Per `03-verdict.md` move #3, the token's stated intent is the one to follow: this skin should NOT introduce new `rounded-*` usage beyond what existing components already use.

**Fontset system — read before touching:**
`src/app/(frontend)/theme.css:321-335` — comment explicitly states legacy fontsets (`playfair-inter`, `space-grotesk`) were **already removed** in the June 14 redesign specifically to cut font-loading weight (`plans/01-storefront-redesign.md` Phase 3C). The Payload-admin side confirms this is a deliberate, standing policy, not just a leftover: `src/SiteTheme/config.ts:46-53`, a code comment on the `fontSet` field: _"The approved brand font system consists strictly of: Fraunces (display/editorial headings), DM Sans (body and secondary sans-serif), EB Garamond (editorial/text body). Options like space-grotesk and playfair-inter have been removed to prevent off-brand styling and avoid extra font loading payloads. **Do not re-add them without brand design approval.**"_ `fontSet` options today are only `default` (Fraunces/DM Sans/EB Garamond mix) and `dm-sans` (`config.ts:56-58`).
**Anti-pattern:** do not add Cormorant Garamond + Jost as a second always-loaded fontset — that re-introduces the exact bundle-weight problem Phase 3C fixed, and directly contradicts the standing "no re-add without brand design approval" policy above. If the new skin needs different type, it must replace the default fontset's font choice, not add a parallel one, OR the type change is dropped from this reskin and only palette + brand mark ship. Decide this explicitly in Phase 2 before writing any `next/font/google` imports — and if choosing to replace fonts, that's a brand-design-approval decision this plan cannot make unilaterally; flag it back to the user rather than assuming (b) from Phase 2A.

**Brand mark — real gap found, not invented work:**
`src/components/Logo/Logo.tsx:21-38` (`LogoIcon`) is a generic dashed-circle "C" glyph — a placeholder, not a considered mark. The design project's `MoonMark` (a circle with `boxShadow: inset -Xpx -Ypx 0 0 <color>` to fake a crescent, zero extra bundle cost, no SVG) is a strictly better mark and cheap to port. Copy the box-shadow-crescent technique, not the React.createElement wrapper (this repo uses JSX, not `createElement`).

**Collection scaffolding — copy `src/collections/HowToGuides.ts` for the new `Events` collection:**

- Access pattern: `HowToGuides.ts:31-36` (`authenticated`/`authenticatedOrPublished` from `../access/`)
- `slugField()` + SEO fields (`OverviewField`/`MetaTitleField`/`MetaImageField`/`MetaDescriptionField`) pattern: `HowToGuides.ts:20-27,58-60+`
- Revalidation hook pattern: `src/utilities/revalidate.ts:306` — `export const howToGuidesRevalidateHooks = createCollectionHooks('how-to-guides')`. For Events, add `export const eventsRevalidateHooks = createCollectionHooks('events')` next to it, then wire `afterChange`/`afterDelete` in the new collection config exactly as `HowToGuides.ts` does via its `revalidate` import.
- Registration: `src/payload.config.ts:43` (import) and `:143` (in the `collections:` array, `:130`) — add `Events` the same way.

**Route scaffolding — copy `src/app/(frontend)/how-to/page.tsx`** as the shape for a new `src/app/(frontend)/events/page.tsx` listing route (collection-backed, not CMS `[slug]`-driven, matching how How-To Guides works today).

**Nav — no code change needed for the link itself:** `src/Header/config.ts:15` (`navItems`) is a Payload-admin-managed array field (per `RowLabel.tsx:6` typing against `Header['navItems']`) — adding "Events" to the header nav is a content-admin task in `/admin`, not a code change, once the route exists.

**Seed pattern (optional, for initial real events):** `src/endpoints/seed/about-page.ts:13` shows the seed-file shape for a collection entry (`slug: 'about'`) — follow the same shape for a `src/endpoints/seed/events.ts` if the business wants seed data, but only with real venue/date data supplied by the user (see Phase 4 anti-pattern below).

**Real purchase-flow pattern to preserve on any Events page CTA (e.g. "shop the collection" link from an event):** `src/components/EtsyHandshake/BoutiqueLink.tsx:18-47` — tracked outbound `<a target="_blank">` + Sonner toast (`toast.info('Opening Etsy', ...)`) + Vercel Analytics `'Etsy Outclick'` event. Reuse this component; do not build a new link pattern.

### Known Anti-Patterns (do NOT do these)

- Do NOT build `CartDrawer`, add-to-cart state, or any client-side cart — `Header/Utilities.tsx:11-14` documents this is an intentional design decision, confirmed by the user this session.
- Do NOT invent event venues, dates, addresses, or review/testimonial statistics for anything beyond what's listed in Phase 4D below — the specific 7 events there are user-confirmed real and safe to seed as-is; any _additional_ events beyond those 7 still need to come from the site owner, not be extrapolated/invented to fill out the calendar.
- Do NOT re-add a second eager-loaded fontset — see Phase 0 fontset note above.
- Do NOT edit the existing `lavender-trust-rose` skin block in place — add a new named skin.
- Do NOT rebuild Home, Products, ProductDetail, About, Contact, or ScentQuiz — all are out of scope per the user's confirmed decision.
- Do NOT use non-semantic `<div onClick>`/`<span onClick>` for any new interactive element (the pattern flagged as a #2/accessibility failure in the audit) — use real `<button>`/`<a>`, matching how `ProductCTASection.tsx` and `BoutiqueLink.tsx` already do it.

---

## Phase 1: Botanical-Lavender Skin (palette)

**Goal:** a new, selectable `data-skin` variant carrying the design project's palette, without touching other skins.

1. In `src/app/(frontend)/theme.css`, after the last skin block (~line 301-319), add:
   ```css
   html[data-skin='botanical-lavender'] {
     --background: #e6dcf0;
     --foreground: #33265a;
     --card: #f8f4fc;
     --card-foreground: #33265a;
     --popover: #f8f4fc;
     --popover-foreground: #33265a;
     --primary: #7b60ac;
     --primary-foreground: #e6dcf0;
     --secondary: #efe7f7;
     --secondary-foreground: #33265a;
     --muted: #efe7f7;
     --muted-foreground: #786e90;
     --accent: #d3c5e4;
     --accent-foreground: #33265a;
     --border: #ded2ec;
     --input: #ded2ec;
     --ring: #7b60ac;
   }
   ```
2. In `src/SiteTheme/config.ts`, add `{ label: 'Botanical Lavender — cream & plum with a lavender accent', value: 'botanical-lavender' }` to the `colorScheme` field's `options` array (lines 22-39) so it's selectable in `/admin`.

**Verification:**

```bash
grep -n "botanical-lavender" src/app/"(frontend)"/theme.css  # → one new block
```

Set the skin via admin, load the homepage, confirm background/text/CTA colors update and no other skin's values changed (`git diff` should touch only the new block + the SiteTheme options list).

---

## Phase 2: Typography decision + Brand mark

**Goal:** resolve the fontset conflict explicitly, port the crescent-moon mark.

### 2A — Fontset decision (make this call before writing font imports)

Given Phase 3C of `plans/01-storefront-redesign.md` deliberately cut the site to one eager fontset to fix bundle weight, do **one** of:

- (a) Leave typography as-is (DM Sans/Fraunces) for this skin — palette-only reskin, zero bundle cost. Recommended default unless the user specifically asks for the serif/script pairing.
- (b) Replace the _default_ fontset's fonts with Cormorant Garamond (display) + Jost (body) rather than adding a second fontset — same "one eager-loaded fontset" budget, different fonts.
  Do not add a `data-fontset='botanical'` third option unless it's made the sole default (never two fontsets loaded eagerly at once).

### 2B — Brand mark

Add a crescent-moon icon component next to `LogoIcon` in `src/components/Logo/Logo.tsx`, using the inset-box-shadow circle technique (no new SVG asset, no bundle cost):

```tsx
export const MoonMark = ({ size = 22 }: { size?: number }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      boxShadow: `inset -${Math.round(size * 0.28)}px -${Math.round(size * 0.1)}px 0 0 currentColor`,
    }}
  />
)
```

**Gating mechanism (important — the skin system is CSS-only, don't make this component JS-skin-aware):** rendering `MoonMark` conditionally on the current skin via `document.documentElement.dataset.skin` in a client component risks a hydration mismatch (server doesn't know the skin at render time in the same way). Instead, render _both_ `LogoIcon` and `MoonMark` unconditionally in the header markup, wrapped in sibling elements with distinct classes (e.g. `logo-icon-default`, `logo-icon-moon`), and toggle visibility purely in CSS:

```css
/* in theme.css, near the botanical-lavender skin block */
.logo-icon-moon {
  display: none;
}
html[data-skin='botanical-lavender'] .logo-icon-default {
  display: none;
}
html[data-skin='botanical-lavender'] .logo-icon-moon {
  display: inline-block;
}
```

This matches how every other skin-scoped visual change in this codebase already works (pure `html[data-skin='...']` selectors, zero JS runtime skin-awareness) — don't introduce the first exception. Alternatively, if the user prefers `MoonMark` as the new default icon site-wide (replacing `LogoIcon` everywhere, no gating needed at all), confirm that explicitly before making it universal.

**Verification:** `grep -n "MoonMark" src/components/Logo/Logo.tsx src/Header/Component.client.tsx`

---

## Phase 3: Component + regression pass

**Goal:** confirm existing components render correctly under the new skin — no rebuilding, just verification, since `ProductCard`/`Button`/focus-ring/state work already exists and passed the June 14 + P0-P3 audits.

1. With `data-skin='botanical-lavender'` active, visually check: `/`, `/products`, `/products/[slug]`, `/about`, `/contact` — confirm text contrast holds (the design's `--muted-foreground`/`#786E90` on `--background`/`#E6DCF0` pairing was flagged INFERRED-risk in `01-evidence.md`; this is the first real chance to measure it).
2. Run the existing focus-ring keyboard check from `plans/01-storefront-redesign.md` Phase 2A verification ("Tab through homepage... every link, button, input must show a visible ring") under the new skin specifically — `--ring` is skin-scoped so this must be re-verified per skin, not assumed inherited.
3. Lighthouse accessibility pass on `/` and `/products` under the new skin (same bar as the prior plan: ≥ 90).

**Verification:**

```bash
# contrast: no automated check exists in-repo; use Lighthouse or a manual contrast checker against the two pairings above
```

---

## Phase 4: Events feature (net-new, real data only)

**Goal:** a real, admin-editable Events collection and listing page — the one genuinely missing piece — with zero fabricated content.

### 4A — Collection

Create `src/collections/Events.ts`, copying `HowToGuides.ts`'s shape (access, `defaultPopulate`, `admin.livePreview`/`preview` via `generatePreviewPath`, SEO fields, `slugField()`). Fields specific to Events (not in HowToGuides):

- `eventDate` (date, required) — start date.
- `eventEndDate` (date, optional) — only set for multi-day events. **Required for correctness**: the real seed data includes a 2-day event (Silverado Resort, 11/14–11/15 — see 4D row 7); a single `eventDate` field cannot represent that, and Phase 4C's ascending-sort/future-filter logic needs a real end date to know when a multi-day event has actually concluded.
- `timeRange` (text, e.g. "12PM – 5PM") — a single formatted field, not separate `startTime`/`endTime`. The seed data (4D) is already pre-formatted this way; splitting it into two fields would require reformatting every row for no benefit.
- `venueName` (text), `address` (text), `city` (text), `mapUrl` (text, optional), `blurb` (textarea or richText, short).
  Add `eventsRevalidateHooks` per the `revalidate.ts:306` pattern.

### 4B — Registration

`src/payload.config.ts`: import `Events` (pattern at line 43), add to `collections:` array (pattern at line 143).

### 4C — Route

**Pre-flight check (do this first):** query the `pages` collection for an existing document with `slug: 'events'` before creating this route. Next.js App Router resolves the static `src/app/(frontend)/events/page.tsx` in preference to the dynamic `[slug]` catch-all, so if a CMS page already exists at that slug, it would be silently shadowed (unreachable, no error) once this route ships. If one exists, resolve the conflict with the user before proceeding (rename the CMS page's slug, or pick a different route segment for this feature).

Create `src/app/(frontend)/events/page.tsx`, copying `how-to/page.tsx`'s listing shape (fetch via Payload Local API, render a list/grid). Sort by `eventDate` ascending. Filter logic must account for multi-day events: an event is "upcoming" if `eventEndDate ?? eventDate` is today or later — using `eventDate` alone would drop a multi-day event from the list on its second day. Reuse `BoutiqueLink` (`EtsyHandshake/BoutiqueLink.tsx`) for any "shop the collection" CTA on the page — do not build a new outbound-link pattern.

### 4D — Content

**User-confirmed (2026-07-20): the event data in `Events.dc.html`/`Upcoming Events.dc.html` is real and accurate — seed it as-is.** Follow the `src/endpoints/seed/about-page.ts:13`-style seed shape (a `src/endpoints/seed/events.ts`) to create these 7 entries:

| Date        | Day               | Time          | Venue                             | Address/City                                | Blurb                                                                                            |
| ----------- | ----------------- | ------------- | --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 7/11        | Friday            | 12PM–5PM      | Humble Sea Brewery                | Alameda, CA                                 | Our summer kickoff — pressed-flower pillars, seasonal scents, and cold beer in good company.     |
| 7/31        | Friday            | 4PM–9PM       | Age Well Center at Lake Elizabeth | Fremont, CA                                 | An evening at the lake — browse one-of-a-kind designs made with real botanicals.                 |
| 8/7         | Friday            | 5PM–8PM       | Castro Valley Marketplace (CVM)   | 3295 Castro Valley Blvd., Castro Valley, CA | An evening market under the string lights — meet the maker and shop the newest pours.            |
| 8/21        | Friday            | 5:30PM–8:30PM | Headlands Brewing                 | UC Berkeley, Berkeley, CA                   | A campus-side pop-up — seasonal scents and pressed-flower candles to close out summer.           |
| 9/4         | Friday            | 5:30PM–8:30PM | Orinda Theatre Square             | Orinda, CA                                  | First Friday in the square — discover the newest seasonal collection under the lights.           |
| 10/10       | Saturday          | 12PM–5PM      | Humble Sea Brewing                | Alameda, CA                                 | An autumn afternoon by the water — warm, cozy scents for the season ahead.                       |
| 11/14–11/15 | Friday & Saturday | 11AM–4PM      | Silverado Resort and Spa          | Napa, CA                                    | A two-day holiday showcase in wine country — perfect for early gifting and cozy seasonal scents. |

**Year note (user-confirmed 2026-07-20): all 7 dates are 2026.** Given today is 2026-07-20, `7/11` is already past — seed it as an archival/past entry (or omit it if the collection should only ever hold upcoming events; recommend seeding it regardless so the collection isn't missing a real event from the record, and let the Phase 4C "filter to future events only" query hide it from the live `/events` page automatically). `7/31` through `11/14–11/15` are all still upcoming from today and will render normally.

**Row 7 (Silverado) is the multi-day case:** `eventDate: '2026-11-14'`, `eventEndDate: '2026-11-15'`, `timeRange: '11AM – 4PM'`. Every other row leaves `eventEndDate` unset.

Map URLs (`https://maps.google.com/?q=...`) from the design can be reused directly as the `mapUrl` field, or regenerated from the address field at seed time.

### 4E — Nav

Add "Events" to the Header's `navItems` via `/admin` (no code change — `Header/config.ts:15` is admin-managed).

**Verification:**

```bash
grep -n "Events" src/payload.config.ts  # → import + array entry
pnpm generate:types && git diff --exit-code src/payload-types.ts  # should show the new Events types after generate, then commit
pnpm payload migrate:create  # create migration for the new collection
```

- [ ] `/events` renders the 6 upcoming seeded entries (7/31 through 11/14–11/15) correctly, sorted ascending, links to Etsy via `BoutiqueLink`
- [ ] The past-dated 7/11 entry does not appear on `/events` (filtered by the future-only logic) but exists in `/admin` as an archival record
- [ ] The Silverado (11/14–11/15) entry displays as a date range, not a single truncated date, and remains "upcoming" through 11/15
- [ ] If the Events collection is ever emptied (e.g. seed rolled back), `/events` with zero entries renders an honest empty state, not a broken/empty grid — verify this path exists even though it won't be hit at initial ship

---

## Phase 5: Verification

- [ ] `pnpm generate:types` run, `src/payload-types.ts` committed
- [ ] `pnpm payload migrate:create` run for the new `Events` collection, migration file committed
- [ ] `vp check` (format/lint/typecheck) passes
- [ ] `scripts/local-build.sh` succeeds
- [ ] New skin: keyboard tab-through on `/` and `/products` shows visible focus rings under `data-skin='botanical-lavender'`
- [ ] New skin: no other skin block's hex values changed (`git diff src/app/"(frontend)"/theme.css` shows only additions)
- [ ] Events: the 7 seeded entries match the table in Phase 4D exactly (venue names, addresses, dates, blurbs) — no drift introduced during seed-file authoring
- [ ] `src/app/(payload)/admin/importMap.js` — this plan doesn't add any custom admin-visible field component (Events uses plain text/date/textarea fields, no `Field: '@/components/...'` overrides like `GenerateCopyButton`), so `generate:importmap` regeneration is likely a no-op. Run it anyway and `git diff` to confirm — only commit if it actually changed.
- [ ] Lighthouse accessibility ≥ 90 on `/`, `/products`, `/events` under the new skin

## Execution Order

| Phase                      | Files touched                                                                                                                | Risk                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 1: Skin palette            | `theme.css`, `SiteTheme` config                                                                                              | Low — additive skin block                                   |
| 2: Typography + brand mark | `theme.css` (fontset, only if 2A chooses replace), `Logo.tsx`, `Header/Component.client.tsx`                                 | Medium if fonts change (bundle weight), Low if palette-only |
| 3: Regression pass         | none (verification only)                                                                                                     | Low                                                         |
| 4: Events feature          | `collections/Events.ts`, `payload.config.ts`, `utilities/revalidate.ts`, `app/(frontend)/events/page.tsx`, migration + types | Medium — new collection + migration                         |
| 5: Verification            | none                                                                                                                         | —                                                           |

Start with Phase 1 (skin palette) — lowest risk, immediately visible, and unblocks Phase 3's regression check. Phase 4 (Events) can run in parallel by a second session since it touches entirely different files.
