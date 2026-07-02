# Frontend Design Audit — Candera Storefront

Date: 2026-07-02

## Scope
Audit focuses on the public storefront experience (route group `src/app/(frontend)`) and the shared UI layers it depends on:

- Layout/theme foundations
  - `src/app/(frontend)/layout.tsx`
  - `src/app/(frontend)/globals.css`
  - `src/app/(frontend)/theme.css`
  - `src/app/(frontend)/layout-utils.css`
- Shared UI and shell
  - `src/components/GlobalLayout/index.tsx`
  - `src/Header/*`
  - `src/Footer/*`
- Key storefront journeys
  - Product list + cards: `src/app/(frontend)/products/*`, `src/components/Card/index.tsx`
  - Product PDP sections + gallery: `src/app/(frontend)/products/[slug]/page.tsx`, `src/app/(frontend)/products/[slug]/ProductDetailSections.tsx`, `src/app/(frontend)/products/[slug]/ImageGallery.tsx`

## Audit standards

1. Project design system intent: `DESIGN.md` and theme/token definitions in `globals.css`/`theme.css`/`typography.css`.
2. Modern web best-practice guides:
   - Accessibility: semantic structure, focus visibility, ARIA correctness, media alternatives
   - Forms: labels + validation messaging patterns
   - Interaction patterns: performance and motion considerations

## Executive summary (top risks)

1. **Critical: skip-link target is ambiguous and not reliably focusable**
   - Duplicate `id="main-content"` and the skip-link target lacks `tabIndex=-1`.
2. **Major: “whole card is clickable” affordance is pointer-only**
   - Card routing is driven by mouse events; there is no equivalent keyboard activation model for the full-card behavior.
3. **Major: tooltip isn’t semantically connected to its trigger**
   - Tooltip uses `role="tooltip"` but doesn’t bind to the trigger via `aria-describedby` (or equivalent), which can prevent announcements in assistive tech.
4. **Major: missing explicit focus styling for several key navigation controls**
   - Header brand link, breadcrumb links, and “back to top” button do not consistently apply `focus-visible` ring styling.
5. **Major: disclosure toggle lacks `aria-controls` linkage**
   - The specs toggle exposes `aria-expanded` without establishing which region is controlled.

## Strengths worth preserving

- Design tokens are centralized in `globals.css`/`theme.css` and map cleanly to Candera’s brand palette + typography.
- Shared focus styling is generally consistent in the canonical UI primitives (inputs/buttons/dialog primitives), and many components use `focus-visible:ring-*`.
- Form UI (search, contact, product filters) uses semantic inputs and labeled controls, with visible and/or alert-style status output.

## Findings (prioritized)

### 1) Critical — Duplicate `id="main-content"` + skip-link focusability

**Evidence**
- Shell renders `<main id="main-content">...</main>`.
- Storefront slug pages also render a nested `<div id="main-content">...</div>`.
- Skip-link anchors to `#main-content`, but the target element is not programmatically focusable.

**Impact**
- Invalid HTML (duplicate IDs).
- Skip-link navigation may scroll but not move focus to the destination for keyboard/screen-reader users.

**Recommendation**
- Ensure `main-content` is unique and used in one place.
- Make the skip-link target focusable: apply `tabIndex={-1}` to the element that owns the `id`.

---

### 2) Major — Pointer-only “whole card click” (keyboard parity missing)

**Evidence**
- The clickable-card behavior is implemented via `mousedown`/`mouseup` listeners on the card container.
- No keyboard handlers are attached for Enter/Space on the card container (only native link/button behavior inside).

**Impact**
- Keyboard users lose the “whole card is actionable” expectation (affordance mismatch).
- This can reduce discoverability and increase cognitive friction.

**Recommendation**
- Provide keyboard activation parity:
  - Prefer rendering the card container as a semantic interactive element (e.g., wrapping in a `<Link>` or using a `<button>` with a nested link avoided).
  - If keeping the pattern, add `onKeyDown`/`onKeyUp` handling for Enter/Space and ensure focus rings match the “whole card” affordance.

---

### 3) Major — Tooltip lacks semantic linkage to its trigger

**Evidence**
- Tooltip content uses `role="tooltip"`.
- The trigger element does not set `aria-describedby` referencing tooltip content, and there is no stable id linkage.

**Impact**
- Assistive tech may not announce tooltip content when it appears.
- Screen reader users may never learn the tooltip’s meaning.

**Recommendation**
- Bind tooltip to trigger via `aria-describedby`:
  - Give the tooltip element an `id`.
  - Set `aria-describedby` on the trigger to that `id`.
- Consider dismissal and accessibility-tree behavior (escape key, focus management) for consistent behavior across assistive tech.

---

### 4) Major — Missing explicit focus-visible styling on key navigation controls

**Evidence**
- Header brand link does not apply an explicit `focus-visible:ring-*` style.
- Breadcrumb links only define hover styling; they do not define focus-visible ring/outline.
- “Back to top” button visually changes on hover/visibility, but does not define focus-visible styling.

**Impact**
- Keyboard users may not get sufficiently clear focus indication on these critical navigation elements.
- Inconsistent focus patterns dilute the design system’s interaction model.

**Recommendation**
- Add `focus-visible:ring-* focus-visible:ring-ring focus-visible:ring-offset-*` to:
  - header brand link
  - breadcrumb links
  - back-to-top button
- Keep styling consistent with `DESIGN.md` focus guidance.

---

### 5) Major — Disclosure toggle missing `aria-controls` linkage

**Evidence**
- Toggle button sets `aria-expanded` but does not set `aria-controls`.
- The collapsible region has no id referenced by `aria-controls`.

**Impact**
- Assistive tech users may not be able to understand which region is expanded/collapsed.

**Recommendation**
- Add:
  - a stable `id` to the collapsible region
  - `aria-controls="<that-id>"` on the toggle button

---

### 6) Major (conditional) — Image alt fallback becomes empty string

**Evidence**
- Image alt is derived from CMS resource alt, and defaults to `''` when missing.
- The rendered `<img>` uses `alt={alt || ''}`.

**Impact**
- Informative imagery may be treated as decorative if CMS alt is missing.
- If content images are meaningful, empty alt can reduce accessibility.

**Recommendation**
- Decide the intended policy:
  - **If informative:** require/validate CMS alt for these resources, or provide a safe contextual fallback alt instead of `''`.
  - **If decorative:** enforce `aria-hidden` and ensure the component is always used only for decorative media.

---

### 7) Minor/Major (depends on intent) — Autoplay video without controls/captions

**Evidence**
- Video renders with `controls={false}`, `autoPlay`, `loop`, `muted`.
- Only an `aria-label` is provided; there are no captions/transcript tracks.

**Impact**
- If video conveys information, lack of controls and captions can be a significant accessibility gap.

**Recommendation**
- If video is informational:
  - enable `controls`
  - include caption tracks (WebVTT)
  - consider a non-video fallback.
- If video is decorative:
  - prefer `aria-hidden`/`alt=""` patterns and avoid labeling it as “Video content”.

---

### 8) Minor — Gallery thumbnail selection semantics may be under-specified

**Evidence**
- Thumbnails are buttons with `aria-label="View image N"`.
- Selected state is indicated by `aria-current="true"` on the button.

**Impact**
- `aria-current` on buttons is usable but may not fully communicate “selected” in all screen reader contexts.

**Recommendation**
- Consider adopting a richer pattern (tablist/roving tabindex) for image sets, or switch to `aria-pressed`/`aria-selected` with explicit instructions where appropriate.

---

### 9) Major — Global transitions applied via `*` (reduced motion not respected here)

**Evidence**
- `layout-utils.css` applies transition/transform/background/border/opacity changes to `*` unconditionally.
- There is no `@media (prefers-reduced-motion: reduce)` or equivalent guard in this file.

**Impact**
- Users who prefer reduced motion can experience unexpected animation-like effects.
- Global transitions can also make performance tuning harder (especially on complex pages).

**Recommendation**
- Add a reduced-motion guard for the global `*` rule, or scope transitions to interactive elements only.

---

## Quick wins (lowest-effort, highest impact)

1. Make the skip-link destination unique and focusable (remove duplicate `id="main-content"`, add `tabIndex={-1}` to the remaining target).
2. Add `focus-visible:ring-*` to:
   - header brand link
   - breadcrumb links
   - Back to top button
3. Add `aria-describedby`/id linkage to tooltip trigger/content.

## Notes
- This audit is evidence-based from code and design-system docs; it still benefits from verification with keyboard-only navigation and 1–2 screen readers.

