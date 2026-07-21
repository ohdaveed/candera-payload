# Evidence

## Structural

- `ui_kits/storefront/CartDrawer.jsx`: the "Checkout on Etsy" CTA is a plain `<div style={{cursor:"pointer"}}>Checkout on Etsy ↗</div>` with **no `onClick` and no `href`** — dead button in the component meant to be ported. The `.dc.html` version of the same CTA works (`<a href="{{ shopUrl }}">`), so the defect is specific to the "clean" reference code, not the mockup.
- `Candera Candles.dc.html` shop grid: "Add to cart" is a `<div onClick="{{ p.add }}">` (repeated across 8 product cards), not a `<button>`/`<a>`. Same non-semantic pattern repeats for cart toggle (`<span onClick>`), quiz option cards (`<div onClick>`), and event-row expand (`<div onClick>`).
- `components/commerce/ProductCard.jsx` correctly uses a real `<Button>`/`<button>` for add-to-cart (the one place this is done right) but the product image/name "open" trigger is a bare `onClick` on a `<div>`/`<span>` with no keyboard path.

## Visual / tokens

- `tokens/spacing.css`: `--radius: 0px; /* Candera is square-edged — no rounded cards */` — enforced in `components/core/Button.jsx`, `Tag.jsx`, `Input.jsx`, `ProductCard.jsx` via `var(--radius)`.
- Every `.dc.html` page contradicts this directly with hardcoded `border-radius` on cards/buttons/inputs: `Candera Candles.dc.html` quiz cross-sell card (`border-radius:20px`), CTA (`10px`); `Contact.dc.html` form card (`20px`), inputs (`10px`); `Events.dc.html`/`Upcoming Events.dc.html` event cards (`20px`); `Scent Quiz.dc.html` quiz-option cards (`16px`), CTA (`10px`). Two incompatible corner systems coexist.
- `tokens/typography.css` declares exactly two families (`--font-display`: Cormorant Garamond, `--font-sans`: Jost). Every `.dc.html` page except the shop/home page loads and uses a third, undeclared family — `Parisienne` (script) — for section labels ("our story", "meet the maker", "say hello", "discover your scent", "follow along") and the founder's signature. Not in any token file.
- `tokens/colors.css` defines ~24 custom properties resolving to ~10 real hex values. The `.dc.html` files never consume `var(--token)` — every color is a hardcoded hex literal, and at least 13 hex values appear that have no token equivalent at all (`#E9E1D2`, `#c6b7db`, `#c8b9df`, `#43395c`, `#3d3450`, `#9d93ac`, `#E1D8C9`, `#D8CEBD`, `#9a8f7d`, `#3E3266`, `#857B9A`, `#bfaed6`, `#5f5566`), several near-duplicate inks for what the token system already names `--plum-1`/`--plum-muted-*`.
- States checklist across all 6 pages + 3 UI-kit screens: empty (present — `CartDrawer.jsx` "cart is empty" copy) / loading (absent everywhere) / error (absent — `Contact.dc.html` form has no validation/error styling) / focus (absent — no `:focus`/`:focus-visible` rule in any fetched CSS or inline style) / disabled (n/a) / success (absent beyond the cart drawer auto-opening).
- Contrast: not measured against a live render; `--text-muted` (`#786E90`) on `--bg-page` (`#E6DCF0`) is a mid-value ink-on-lavender pairing used sitewide for nav/label text — flagged as an unverified risk (INFERRED), not a confirmed fail.

## Copy & Honesty

- **Correction (2026-07-20, post-audit):** the two findings below that originally read the social-proof stats and the Events data as fabricated were wrong. The user confirmed directly: the `Events.dc.html`/`Upcoming Events.dc.html` calendar is real and confirmed (venues, addresses, dates), and the social-proof block (5.0 average, 36 reviews, 98 Etsy sales, 5 years on Etsy, the "Elena" quote) is also real and accurate. Both are struck from the honesty finding; see `02-scorecard.md`/`03-verdict.md` for the rescored #6.
- `readme.md`'s own "Caveats/Ask" section flags fonts, logo, and photography as placeholder/unconfirmed, but not the review stats or events — this is no longer an omission, since neither turned out to be placeholder content.
- Catalog cross-check against the live Payload/Neon `products` table (queried directly earlier this session): 7 of 8 candle listing IDs in `Candera Candles.dc.html`'s `catalog()` match real, currently-published products exactly. The 8th, listing `4530195107` labeled **"Rose Embrace"** in the design, is currently **"Fall Spice Botanical Candle"** in the live store — most likely the listing was retitled/replaced on Etsy after the design was built, not a fabrication. Downgraded to a data-freshness checklist item (verify current listing title before reusing this catalog data), not an honesty finding.
- Voice execution is strong and consistent: calm/sensory register, no emoji, no hype-exclamation copy, product descriptions match the documented pairing pattern (poetic name + scent notes + short story) across all 8 products.

## Weight & Friction

- Font loading: 2 documented families (Cormorant Garamond, Jost) at multiple weights, plus the undocumented 3rd (Parisienne) loaded ad hoc on 4 of 6 pages — 3 webfont families total.
- Autoplay video: 5 distinct video assets (`hero.mp4`, `Video Project 7.mp4`, `Video Project 7-d3c09f3f.mp4`, `olesiaplascencia_Dal_pK2JJFS.mp4`, `olesiaplascencia_DaFA-D1Skw3 (2).mp4`) are `autoplay muted loop playsinline`. Home embeds 2 on a single load (hero + "made with" band), About embeds 2, Events embeds 1. No `prefers-reduced-motion` gating found in any fetched CSS.
- Initial JS bytes / TTI: not measurable (static preview markup, no build/bundler) — flagged as unmeasured, and a real risk once ported into Next.js given the video-heavy hero pattern (LCP/INP exposure).
- Modals/notifications on initial load: 1 persistent announcement bar (not a dismissible modal — acceptable).

## Accessibility

- Keyboard reachability fails for: cart toggle, all "Add to cart" triggers in `.dc.html` grids, quiz option selection, event-row expand/collapse, "Retake quiz" — all implemented as `<div>`/`<span onClick>` with no `role`, `tabIndex`, or `onKeyDown`. `ProductCard.jsx`'s add-to-cart button is the one correct exception; its own "open product" trigger repeats the same gap.
- ARIA landmarks: 0 — no `<nav>`, `<main>`, `<header>`, `<footer>`, or landmark `role` attributes in any fetched file; structure is `<div>`-only throughout.
- Skip link: absent on every page.
- Focus order: DOM order matches visual order (nav → hero → grid), so what _is_ focusable would tab in a sane sequence — this part is fine.
