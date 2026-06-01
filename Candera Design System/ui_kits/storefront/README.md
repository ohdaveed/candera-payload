# Candera — Storefront UI Kit

A high-fidelity, interactive recreation of the **Candera** botanical-candle storefront, built
to match `candera-frontend` (React + Vite + Tailwind v4). It is a *design* kit — cosmetic and
click-through, not production logic — so screens can be recombined for new work.

## Run it
Open `index.html` in a browser. No build step — React + Babel load from CDN and the `.jsx`
files are transpiled in-browser. Product photography is referenced from `../../assets/images/`.

## What's inside

| File | Role |
| --- | --- |
| `index.html` | App shell + the full design-token stylesheet (`:root` vars → every `.c-*` class) |
| `data.js` | Catalog (6 vessels) + site/home copy, lifted from `products.json` / `content/*` |
| `Icons.jsx` | Lucide-style inline icons (stroke 1.5) — the brand's icon set |
| `Primitives.jsx` | `Button`, `Tag`, `Eyebrow`, `Reveal` (the slow-fade entrance) |
| `Nav.jsx` | Sticky nav — transparent over hero, solid on scroll, mobile sheet |
| `Hero.jsx` | Full-bleed editorial hero (dimmed botanical photo, Fraunces italic) |
| `Catalog.jsx` | `FragranceProfile`, `ProductCard`, `ProductGrid` |
| `Sections.jsx` | Home testimonials band + Inner Circle CTA band |
| `ProductDetail.jsx` | Vertical editorial PDP (price deferred below the narrative) |
| `Pages.jsx` | `Home`, `Collection` (with tag filter), `About` (craft + FAQ) |
| `InnerCircle.jsx` | Two-panel "by invitation" entry page + success state |
| `ScentQuiz.jsx` | 3-question modal → recommended vessel |
| `Footer.jsx` | Linen footer — brand, nav, assistance columns |
| `App.jsx` | Route state, cart toast, quiz modal wiring |

## Interactive flow
Home → scroll the collection → open a vessel (PDP) → **Add to the Ritual** (cart toast) →
filter on the Collection page → take the **Scent Quiz** (nav) for a recommendation →
**Request Entry** to the Inner Circle. All client-side, no backend.

## Design notes (kept faithful to the brand)
- **Primary color is Dusk Rose** `#B28C9C` (the token formerly called "Lavender"). Ember
  `#DD7D52` is the warm-copper accent.
- **Type:** Fraunces (display, italic), EB Garamond (editorial), DM Sans (UI).
- **Radius** is near-square (buttons 0, cards/inputs 2px); **motion** is slow fades + y-rise,
  never bouncy.
- **Accessibility:** small text and white-on-color CTAs use the AA-safe deepened variants
  (`--ember-strong`, `--rose-strong`, `--sage-text`) defined at the top of `index.html`,
  mirroring `../../colors_and_type.css`.

## Coverage / omissions
Recreates the core merchandising surfaces. The real app's Etsy live-sync, MailChimp wiring,
Sensory-Map plot, and the `/exhibit-sync` module are intentionally omitted — out of scope for
a visual kit.
