# Spec: Landing Page Redesign (Modern Minimalist Luxury)

- **Date:** 2026-06-14
- **Status:** Proposed
- **Theme:** Modern Minimalist Luxury

## 1. Objective
Redesign the Candera landing page to achieve a premium, moody, minimalist storefront aesthetic. This is accomplished by enforcing a strict global 12-column vertical grid system, tightening UI regions, ensuring accessible high-contrast text layers, and prioritizing scent-discovery content.

---

## 2. Visual & Layout Foundations

### 2.1 The Invisible Vertical Grid
To anchor the eye and make whitespace feel deliberate rather than empty, a strict 12-column skeleton is implemented globally.
- **Global Width Limit:** Max width of `1200px` for all content wrappers.
- **Global Padding:** Horizontal padding of `5vw` (or a responsive variant peaking at `2rem`) applied to the `.grid-container` wrapper.
- **Alignment Rules:**
  - **Left Edge:** The header logo, the hero eyebrow kicker, the hero H1 headline, the product section sidebar header, the testimonials kicker, and the newsletter join text must start on the exact same vertical left edge (Column 1).
  - **Right Edge:** The header navigation links, the right boundary of the hero status card, the right edge of the product grid, the testimonials signatures, and the newsletter join button must terminate on the exact same vertical right edge (Column 12).
- **Section Transition:** Remove any thin horizontal divider lines between the dark hero and light product section. Rely entirely on the stark background color change (deep black to off-white vellum) to separate sections natively.

---

## 3. Section Specifications

### 3.1 Storefront Hero Section (`src/blocks/StorefrontHero/Component.tsx`)
- **Structure:**
  - Left content spans Columns 1 to 8.
  - Status Card spans Columns 9 to 12.
- **Maker Overline:** Shift the "Handmade by Olesia" gold overline color from a dark gold to a bright gold-cream (`#EAD8C0`) to ensure contrast against the dark background.
- **Primary CTA:** Give the "Explore Collection" button a solid, muted ember background fill with dark text instead of a thin border, creating an immediate visual focal point.

### 3.2 Hero Status Card (Batch 014 Replacement)
- **Aesthetic:** Align the card to Columns 9 to 12. Use a low-opacity background fill (`rgba(255, 255, 255, 0.02)`) with a thin border and tight `1.5rem` internal padding.
- **Content (Commerce-Focused):**
  - **Header:** "Featured Candle" on the left, price "$38" on the right.
  - **Subtitle:** "Wild Lilac (8 oz)".
  - **Grid Metrics:** A strict two-column grid at the bottom containing:
    - **Left Column:** "Limited Batch" with "47 units total".
    - **Right Column:** A text link "View Scent →" in gold-cream (`#EAD8C0`) pointing directly to the product detail page.

### 3.3 Product Section & Card Interaction (`src/blocks/ArchiveBlock/Component.tsx` & `src/components/Card/index.tsx`)
- **Structure:**
  - Sidebar text block ("Not manufactured. Made.") spans Columns 1 to 4.
  - Product Grid spans Columns 5 to 12.
- **Typography & Scale:**
  - Scale down the product section headline to `1.85rem` to keep the hero H1 the dominant focal point.
  - Increase the spacing (`margin-top: 1.75rem`) and line-height (`1.85`) of the italicized sidebar copy.
- **Product Card Styling:**
  - Enforce a strict 1:1 (square) aspect ratio on product thumbnails.
  - Increase the spacing (`margin-bottom: 0.55rem`) between product titles/prices and scent notes descriptive text.
- **Hover Interaction (Option C - Hybrid Swap & Overlay):**
  - Hovering crossfades the primary image to a secondary lifestyle/lit candle photo.
  - A semi-transparent dark bar (`rgba(18, 18, 16, 0.95)`) slides up from the bottom containing the scent notes (e.g. *"Lilac · Sage · Wet Earth"*).
  - The text in the hover bar must use pure high-contrast white (`#FFFFFF`) to satisfy WCAG AA contrast rules.

### 3.4 Scent Quiz CTA (`src/blocks/ScentQuiz/CTABand.tsx` & `src/blocks/ScentQuiz/Component.tsx`)
- **CTA Band:** A clean, horizontal obsidian band with a centered Fraunces italic headline (*"Not sure where to start?"*), a brief invitation paragraph, and a minimal outlined button leading to the Scent Quiz.
- **Button Styling:** Share the same visual weight as the hero's primary CTA (solid fill or matching bold stroke) to establish a cohesive design language.
- **Modal Design (`src/blocks/ScentQuiz/Modal.tsx`):** Update the modal backdrop to a deep obsidian overlay (`bg-candera-obsidian/90`) with soft blur and high-contrast light typography, matching the minimalist theme.

### 3.5 Testimonials (`src/blocks/Testimonials/Component.tsx`)
- Enforce strict 12-column grid alignment inside the testimonials container.
- Clean columns featuring center-aligned italic EB Garamond quotes, large subtle quotation mark glyphs, and high-contrast signatures.

### 3.6 Inner Circle CTA (`src/blocks/InnerCircleCTA/EmailForm.tsx`)
- Aligned to columns 7-12 on the right, directly opposite the text content on columns 1-6.
- Flat inline input form inside a capsule outline, terminating exactly at the right boundary.

---

## 4. Implementation Steps
1. Refine the typography scaling, padding, and grid structure variables in CSS.
2. Update the `StorefrontHero` component to implement the new grid container and the commerce-focused status card.
3. Update the `ArchiveBlock` and `Card` components to implement square aspect ratios, refined product card margins, and the Hybrid Swap & Overlay hover effect with high-contrast text.
4. Refine the Scent Quiz CTA band button weight and modal styling.
5. Apply the unified grid margins and padding to `Testimonials` and `InnerCircleCTA`.
