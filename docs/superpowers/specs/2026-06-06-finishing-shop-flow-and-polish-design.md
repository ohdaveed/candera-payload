# Spec: Finishing Candera — Shop Flow & Polish

**Status:** Approved
**Date:** 2026-06-06
**Topic:** Transitioning to a Direct Ritual (Etsy-focused) commerce flow and applying high-precision "Craftsman" polish across the storefront.

---

## 1. Commerce: The Direct Ritual

Candera will move away from a local "Bag" system to focus entirely on the "Etsy Boutique" as the point of transaction.

### Changes
- **Decommission Shopping Bag:** 
    - Remove the `ShoppingBag` icon and count from `src/Header/Nav/index.tsx`.
    - Remove the "Shopping Bag" link from `src/Header/Nav/MobileNav.tsx`.
    - Delete the `src/app/(frontend)/cart/` directory.
- **The "Etsy Handshake":**
    - Implement a "Redirecting to Studio Boutique..." handshake experience.
    - When the "Join the Ritual on Etsy" button is clicked, show a brief, elegant toast or overlay that fades in for 800ms before opening the new tab.
- **Button Language:**
    - Standardize Product CTAs to: "Join the Ritual on Etsy" or "Acquire through Etsy Boutique".

---

## 2. Animation: The Craftsman Polish

A "Craftsman" style is defined by precision, fluidity, and tactile feedback.

### Interaction Patterns
- **Orchestrated Entrances:** Use `framer-motion` to stagger the entrance of product cards in the grid. (50ms delay between cards, 400ms slide-up with a slight elastic overshoot `type: "spring", stiffness: 300, damping: 20`).
- **Scent Profile Reveal:** On card hover, the Scent Profile should slide out from the bottom or side with high-precision movement.
- **Tactile Feedback:** 
    - All buttons and interactive links scale to `0.98` on click.
    - Hover states for navigation items should use a subtle, fast-fading background tint.
- **Fitts's Law:** Audit all small links (like filters) to ensure a minimum 44px hit box using invisible padding/pseudo-elements.

---

## 3. Performance, SEO & Accessibility

Ensuring the studio is accessible and technically sound.

### Technical Requirements
- **JSON-LD Structured Data:**
    - Add `Product` and `BreadcrumbList` schema to `src/app/(frontend)/products/[slug]/page.tsx`.
- **Skeleton Loaders:**
    - Create `ProductCardSkeleton` and implement it in `src/app/(frontend)/products/loading.tsx` to prevent layout shifts.
- **Accessibility Audit:**
    - Trap focus in `QuickViewDialog` and `MobileNav`.
    - Ensure all images have descriptive `alt` tags via the `Media` collection.
    - Contrast check for `candera-sage-text` against `candera-linen` backgrounds.

---

## 4. Success Criteria

- [ ] Users can navigate the collection and find products without a "dead" cart icon.
- [ ] Transitioning to Etsy feels like a branded "handshake" rather than a site exit.
- [ ] The site feels "alive" and high-end through precise, non-distracting animations.
- [ ] Google Search Console recognizes structured product data.
- [ ] 100/100 Accessibility score on Lighthouse.
