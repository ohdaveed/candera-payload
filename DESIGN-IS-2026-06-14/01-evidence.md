# Evidence — Candera Homepage Design Audit

Consolidated from 4 parallel subagents. All findings cite source. No scores in this document.

---

## Structural Evidence

**Interactive element count (minimum confirmed, homepage):**

- Header/Component.client.tsx:61 — Logo link (home)
- Header/Nav/index.tsx:38 — CMS nav items ×N (typically 3–4)
- Header/Nav/index.tsx:46 — Search icon button (desktop)
- Header/Nav/MobileNav.tsx:32 — Hamburger SheetTrigger (mobile)
- Header/Nav/MobileNav.tsx:51 — Search link (mobile drawer)
- Header/Nav/MobileNav.tsx:61 — CMS nav items ×N (mobile drawer, same data rendered again)
- StorefrontHero/Component.tsx:153 — Primary CTA button
- StorefrontHero/Component.tsx:171 — Secondary CTA link
- CallToAction block — 1–2 CTA links (CMS-driven)
- InnerCircleCTA/EmailForm.tsx:74 — Email input
- InnerCircleCTA/EmailForm.tsx:88 — Submit button
- Footer/Component.tsx — 3–5 footer nav links + 2 legal links + ThemeSelector (unread)
- **Total confirmed minimum: ~14 elements. True count depends on CMS content + ThemeSelector.**

**Max nesting depth:** 8 levels — `Section > Container > header > nav > Button > Link > svg > path` at `StorefrontHero/Component.tsx:165`.

**Repeated patterns (same affordance, same purpose):**

1. CANDERA home link: `Header/Component.client.tsx:61` + `Footer/Component.tsx:43`
2. Search link: `Header/Nav/index.tsx:47` + `Header/Nav/MobileNav.tsx:51` — both in DOM simultaneously, one hidden per breakpoint
3. Nav items array: `Header/Nav/index.tsx:38` + `Header/Nav/MobileNav.tsx:61` — same data rendered twice in DOM
4. Footer "Assistance" links (Shipping/Wholesale/Contact): hardcoded fallback `Footer/Component.tsx:88–110` AND CMS `assistanceItems` `Footer:63–68` — structural double-render risk if CMS matches fallback
5. Footer legal links: same dual-render pattern `Footer:135–158`

**Dead props / unused imports (confirmed):**

1. `StorefrontHero/Component.tsx:16` — `disableInnerContainer` in Props type, never read in component body
2. `Header/Nav/MobileNav.tsx:13` — `transparent` prop applied only to trigger button, never applied to drawer link items where it would affect readability

---

## Visual Evidence

**Spacing scale observed:** 15+ distinct values including fractional computed sizes (`3.25px, 6.5px, 9.75px, 19.5px, 26.25px, 32.5px`) alongside standard stops (`8px, 16px, 24px, 32px, 48px`). No consistent 4pt or 8pt grid.

**Type scale observed:** 17 distinct computed sizes — `15, 16, 16.64, 18, 20, 20.8, 22, 24, 26, 32.5, 43.36, 52.04, 69.38, 78, 134.42, 180, 520.36px`. The 520px value is a decorative background element. A disciplined scale would use 6–7 stops.

**Distinct color count:** 29 unique computed values. Core palette is coherent (warm off-white, tan, terracotta, rust), but 17 additional alpha/overlay variants are in use. Chromatic accent colors: terracotta `rgb(221,125,82)` and rust `rgb(168,80,43)`.

**Contrast ratios:**

- Primary text on main background: 16.52:1 (excellent)
- White on dark background: 18.44:1 (excellent)
- Muted secondary text `rgb(95,100,89)` on off-white `rgb(245,242,237)`: **~5.45:1** — WCAG AA pass, AAA fail
- White on rust: 5.46:1 (AA pass)

**States checklist (primary CTA / product cards):**
| State | Status |
|---|---|
| Empty | **Missing** |
| Loading | **Ambiguous** — no skeleton/spinner/aria-busy found at render time |
| Error | **Ambiguous** — no role="alert" found at render time |
| Success | **Missing** |
| Focus | **Effectively absent** — `outline-style: none` on all interactive elements; `outlineWidth` value exists but `none` style nullifies it |
| Disabled | **Missing** |

**Visual impression:** Refined editorial feel with warm parchment/linen palette. Hero uses oversized display type (up to 180px) dominating the viewport — art-direction-forward. Product cards are flat and minimal. Terracotta/rust accent is the sole chromatic punctuation. The visual language reads as intentional and premium.

---

## Copy & Honesty Evidence

**Inflations (2+ instances):**

1. `products/page.tsx:17–18` — "inspected for peak botanical clarity" — undefined standard, unverifiable
2. `Footer:51–52` — "Cultivating intentional living" — unearnable lifestyle claim
3. `BoutiqueLink.tsx:19` — "Preparing your ritual transition." — overwrought description for clicking a link
4. `StorefrontHero:190–205` — Stat cluster (Small / Micro-batch / Hand / Poured & labeled / CA / Ships from) — qualitative descriptors presented in quantitative stat-card format; implies measurement where there is none

**Dark patterns:** None found. No confirmshaming, fake scarcity timers, forced continuity, or hidden costs. Empty-state copy "The next batch is still curing" is honest about unavailability.

**Jargon / unclear labels:**
| Label | Location | Issue |
|---|---|---|
| "Vessels" | `products/page.tsx:109, 121` | Brand noun for candles; first-time visitors won't parse |
| "Studio Boutique" | `BoutiqueLink.tsx:18` | Internal alias for Etsy; inconsistent with "Buy on Etsy" button label |
| "Assistance" | `Footer:74` | Formal; "Support" or "Help" is standard |
| Stat cluster labels | `StorefrontHero:190–205` | Qualitative words formatted as metrics — ambiguous intent |

**Label → behavior mismatches:**

- `"Buy on Etsy"` (3 locations) → opens Etsy in new tab: **Honest** — label names platform
- Toast "Redirecting to Studio Boutique..." → navigates to Etsy: **Mild mismatch** — substitutes house alias for the named destination after user has already clicked

---

## Weight & Friction Evidence

**Initial JS:** ~1.15MB uncompressed (dev build); production estimate ~350–450KB. Heavy contributors:

- `react-dom`: 180KB
- `next/dist/client`: 152KB
- `motion-dom` + `framer-motion`: 129KB total — loaded globally for ScentQuiz which is one block, not present on homepage
- `prism-react-renderer`: 36KB — code syntax highlighter with no apparent storefront use

**Network requests (homepage):** 46 total — 28 JS chunks, 11 font woff2 files (412KB), 4 images, 2 CSS, 1 HTML, 1 `/api/users/me` auth check, 2 Vercel analytics scripts.

**Time-to-interactive:** 2,132ms domInteractive on localhost (floor). Real-world estimate 3–5s on average connection.

**Idle animations:** 0 — no looping animations running when page is at rest. `motion-reduce:transition-none` and `motion-reduce:hover:scale-100` present on Card and FeaturedPostCard. ✓

**Modals on initial load:** 0. ✓

**Reduced motion:** Partial — Tailwind `motion-reduce:` variants cover Card and FeaturedPostCard. ScentQuiz Framer Motion animations have **no `useReducedMotion()` guard**.

**Dark mode:** Partial — `prefers-color-scheme: dark` read by ThemeProvider; shadcn/ui primitives have `dark:` variants. Storefront design does not appear to have a fully designed dark variant.

**Gaps:**

- Framer Motion loaded on every page for a block only used in ScentQuiz (129KB unnecessary for homepage visitors)
- 11 font files (412KB) — too many variants
- Dark mode coverage is primitive-level only, not full storefront design
