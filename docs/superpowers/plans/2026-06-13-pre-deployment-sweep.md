# Pre-Deployment Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 concrete issues found in the pre-deployment audit, then stage and commit all untracked redesign files in one clean production-readiness commit.

**Architecture:** All changes are surgical single-file edits. No new abstractions, no new files (except a rename). Apply fixes in order, verify with TypeScript and grep, then stage and commit everything.

**Tech Stack:** Next.js 16, React 19, TypeScript, Payload CMS 3.x, Tailwind CSS, pnpm

---

### Task 1: Fix console.warn missing context label in Form block

**Files:**
- Modify: `src/blocks/Form/Component.tsx` (line 100)

- [ ] **Step 1: Apply the fix**

In `src/blocks/Form/Component.tsx`, find line 100:
```tsx
          console.warn(err)
```
Replace with:
```tsx
          console.warn('[FormBlock] submission error:', err)
```

- [ ] **Step 2: Verify**
```bash
grep -n "console.warn" src/blocks/Form/Component.tsx
```
Expected output:
```
100:          console.warn('[FormBlock] submission error:', err)
```

---

### Task 2: Wrap history.replaceState in try-catch in ScentQuiz Modal

**Files:**
- Modify: `src/blocks/ScentQuiz/Modal.tsx` (the `close` callback)

- [ ] **Step 1: Apply the fix**

In `src/blocks/ScentQuiz/Modal.tsx`, find the `close` callback:
```tsx
  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
    // Remove the hash without a page jump
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])
```
Replace with:
```tsx
  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
    // Remove the hash without a page jump; fall back if replaceState is unavailable
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      window.location.hash = ''
    }
  }, [])
```

- [ ] **Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "Modal"
```
Expected: no output (no errors).

---

### Task 3: Extract Etsy URL constant and add IntersectionObserver fallback in StickyCTABar

**Files:**
- Modify: `src/app/(frontend)/products/[slug]/StickyCTABar.tsx`

- [ ] **Step 1: Apply the fix**

In `src/app/(frontend)/products/[slug]/StickyCTABar.tsx`, find the `useEffect`:
```tsx
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])
```
Replace with:
```tsx
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    // Browsers without IntersectionObserver show the bar statically
    if (!window.IntersectionObserver) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])
```

Then find the `BoutiqueLink` href inline string:
```tsx
          href={`https://www.etsy.com/listing/${etsyListingId}`}
```
Add a named constant above the component function and replace the inline href:

Above the `export function StickyCTABar` line, add:
```tsx
const etsyListingUrl = (id: number) => `https://www.etsy.com/listing/${id}`
```

Then change the href:
```tsx
          href={etsyListingUrl(etsyListingId)}
```

- [ ] **Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "StickyCTABar"
```
Expected: no output.

- [ ] **Step 3: Verify constant exists**
```bash
grep -n "etsyListingUrl\|IntersectionObserver" "src/app/(frontend)/products/[slug]/StickyCTABar.tsx"
```
Expected: lines showing the constant definition, the guard, and the href usage.

---

### Task 4: Replace fragile title string check with vessel prop in ProductDetailSections

**Files:**
- Modify: `src/app/(frontend)/products/[slug]/ProductDetailSections.tsx` (line ~83)

- [ ] **Step 1: Read the current props type to confirm `vessel` exists**

The component's Props type currently is:
```tsx
type Props = {
  title?: string | null
  scentProfile?: ScentProfile
  burnTime?: string | null
  atmosphere?: string | number | ScentProfileType | null
  productType?: 'candle' | 'vintage' | 'custom'
  specifications?: Array<{ label: string; value: string }> | null
}
```

Add `vessel` to Props:
```tsx
type Props = {
  title?: string | null
  vessel?: string | null
  scentProfile?: ScentProfile
  burnTime?: string | null
  atmosphere?: string | number | ScentProfileType | null
  productType?: 'candle' | 'vintage' | 'custom'
  specifications?: Array<{ label: string; value: string }> | null
}
```

Add `vessel` to the destructure in the function signature:
```tsx
export function ProductDetailSections({
  title,
  vessel,
  scentProfile,
  burnTime,
  atmosphere,
  productType = 'candle',
  specifications,
}: Props) {
```

- [ ] **Step 2: Replace the fragile title checks**

Find:
```tsx
  const isCandle = productType === 'candle' && !title?.toLowerCase().includes('metal')
```
Replace with:
```tsx
  const isCandle = productType === 'candle' && vessel !== 'metal'
```

Find the second title string check in the `displaySpecs` ternary:
```tsx
        : title?.toLowerCase().includes('metal') || productType === 'custom'
```
Replace with:
```tsx
        : vessel === 'metal' || productType === 'custom'
```

- [ ] **Step 3: Verify no title string checks remain**
```bash
grep -n "includes('metal')\|toLowerCase" "src/app/(frontend)/products/[slug]/ProductDetailSections.tsx"
```
Expected: no output.

- [ ] **Step 4: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "ProductDetailSections"
```
Expected: no output.

---

### Task 5: Fix useEffect cleanup in SectionTooltip to prevent setState-after-unmount

**Files:**
- Modify: `src/components/BeforeDashboard/SectionTooltip.tsx`

- [ ] **Step 1: Apply the fix**

In `src/components/BeforeDashboard/SectionTooltip.tsx`, find the `scheduleClose` function and add a `useEffect` cleanup. The component currently has no `useEffect`. Add one after the `scheduleClose` function:

The current component body starts with:
```tsx
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const scheduleClose = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300)
  }
```

Add the import for `useEffect` (it's already using `useState` and `useRef` from React — add `useEffect`):
```tsx
import React, { useState, useRef, useEffect } from 'react'
```

Then add after `scheduleClose`:
```tsx
  // Clear pending timeout on unmount to prevent setState-after-unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])
```

- [ ] **Step 2: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "SectionTooltip"
```
Expected: no output.

---

### Task 6: Add loading state and fix error message in ThemePresetSwitcher

**Files:**
- Modify: `src/components/BeforeDashboard/ThemePresetSwitcher.tsx`

- [ ] **Step 1: Add an `isFetching` state**

The component currently has these state declarations near the top:
```tsx
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
```
Add `isFetching` after them:
```tsx
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
```

- [ ] **Step 2: Set isFetching to false after the initial fetch resolves**

Find the initial fetch `useEffect`:
```tsx
  useEffect(() => {
    if (!token) return
    fetch('/api/globals/site-theme', {
      headers: { Authorization: `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data: SiteThemeSettings) => {
        setCurrentProductCardDensity(data.productCardDensity ?? 'boutique-grid')
        const matched = THEME_PRESETS.find((p) => presetsMatch(data, p.id))
        setActivePresetId(matched?.id ?? null)
      })
      .catch(() => {})
  }, [token])
```
Replace with:
```tsx
  useEffect(() => {
    if (!token) return
    fetch('/api/globals/site-theme', {
      headers: { Authorization: `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data: SiteThemeSettings) => {
        setCurrentProductCardDensity(data.productCardDensity ?? 'boutique-grid')
        const matched = THEME_PRESETS.find((p) => presetsMatch(data, p.id))
        setActivePresetId(matched?.id ?? null)
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [token])
```

- [ ] **Step 3: Render a loading indicator while fetching**

Find the return statement's outermost wrapper div (the container div that wraps all the preset buttons). Add a loading guard just before the preset grid renders. Look for where the presets are mapped — it will be inside a `div` with a grid style. Add a loading state just before it:

Find the section that renders presets (will look like `THEME_PRESETS.map(...)`) and add before it:
```tsx
          {isFetching ? (
            <div style={{ padding: '12px 0', fontSize: '0.8125rem', color: 'var(--theme-elevation-500)' }}>
              Loading current theme…
            </div>
          ) : (
            // existing THEME_PRESETS.map(...) block
          )}
```

Wrap the existing `THEME_PRESETS.map(...)` JSX block in the else branch of this conditional.

- [ ] **Step 4: Fix the error message string**

Find:
```tsx
      setError('Failed to apply theme — try again')
```
Replace with:
```tsx
      setError('Failed to apply theme preset — try again')
```

- [ ] **Step 5: Verify TypeScript**
```bash
npx tsc --noEmit 2>&1 | grep "ThemePresetSwitcher"
```
Expected: no output.

---

### Task 7: Rename siteTheme.int.spec.ts to siteTheme.spec.ts

**Files:**
- Delete: `tests/int/siteTheme.int.spec.ts`
- Create: `tests/int/siteTheme.spec.ts` (same content)

- [ ] **Step 1: Rename the file**
```bash
mv tests/int/siteTheme.int.spec.ts tests/int/siteTheme.spec.ts
```

- [ ] **Step 2: Verify the old name is gone and new name exists**
```bash
ls tests/int/siteTheme*
```
Expected:
```
tests/int/siteTheme.spec.ts
```

---

### Task 8: Final verification, stage all files, and commit

- [ ] **Step 1: Run TypeScript check — must be clean**
```bash
npx tsc --noEmit
```
Expected: no output (exit 0).

- [ ] **Step 2: Verify no fragile title checks remain**
```bash
grep -rn "console\.warn(err)" src/
grep -rn "\.includes\('metal'\)" src/
```
Expected: zero matches on both.

- [ ] **Step 3: Stage all files**
```bash
git add \
  src/blocks/Form/Component.tsx \
  src/blocks/ScentQuiz/Modal.tsx \
  "src/app/(frontend)/products/[slug]/StickyCTABar.tsx" \
  "src/app/(frontend)/products/[slug]/ProductDetailSections.tsx" \
  src/components/BeforeDashboard/SectionTooltip.tsx \
  src/components/BeforeDashboard/ThemePresetSwitcher.tsx \
  src/components/BeforeDashboard/themePresets.ts \
  src/components/BeforeDashboard/DashboardHeader.tsx \
  src/components/BeforeDashboard/MetricCard.tsx \
  src/components/BeforeDashboard/QuickAccessCard.tsx \
  "src/components/BeforeDashboard/index.scss" \
  src/components/BeforeDashboard/index.tsx \
  src/components/FilmGrain/ \
  src/components/Card/index.tsx \
  src/components/FragranceProfile/index.tsx \
  src/components/GlobalLayout/index.tsx \
  src/migrations/20260612_082000_extend_site_theme.ts \
  src/migrations/index.ts \
  src/utilities/siteTheme.ts \
  "tests/int/siteTheme.spec.ts" \
  "tests/int/siteTheme.int.spec.ts" \
  scripts/seed-initial-users.ts \
  scripts/seed-admin.ts \
  src/SiteTheme/config.ts \
  "src/app/(frontend)/layout.tsx" \
  "src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts" \
  "src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts" \
  "src/app/(frontend)/next/ai/generate-product-copy/route.ts" \
  "src/app/(payload)/admin/importMap.js" \
  src/blocks/CallToAction/Component.tsx \
  src/blocks/InnerCircleCTA/Component.tsx \
  "src/blocks/ScentQuiz/Component.tsx" \
  src/blocks/StorefrontHero/Component.tsx \
  src/blocks/Testimonials/Component.tsx \
  src/endpoints/etsy.ts \
  src/endpoints/seed/home-static.ts \
  src/endpoints/seed/home.ts \
  src/heros/HighImpact/index.tsx \
  src/heros/PostHero/index.tsx \
  src/payload-types.ts \
  src/payload.config.ts \
  .env.example \
  .github/workflows/ci.yml \
  AGENTS.md \
  next-sitemap.config.cjs \
  package.json \
  vercel.json
```

- [ ] **Step 4: Confirm staging looks right**
```bash
git status --short | grep "^[AM]"
```
Expected: all staged files show `A` (new) or `M` (modified) in the first column. Verify `scripts/pass_payloads/` and `.vscode/` are NOT listed.

- [ ] **Step 5: Commit**
```bash
git commit -m "$(cat <<'EOF'
feat: production-readiness sweep — commit redesign branch files

- Add FilmGrain component, ScentQuiz modal, ProductDetailSections,
  StickyCTABar, BeforeDashboard admin components, SiteTheme config,
  siteTheme utility, DB migration, and seed scripts (all new files
  from the redesign branch that were never staged)

- Fix console.warn missing context label in Form block
- Wrap history.replaceState in try-catch in ScentQuiz Modal
- Add IntersectionObserver fallback in StickyCTABar; extract Etsy URL
  to named constant
- Replace fragile title.includes('metal') check with vessel === 'metal'
  prop check in ProductDetailSections
- Fix useEffect cleanup in SectionTooltip (prevents setState-after-unmount)
- Add isFetching loading state to ThemePresetSwitcher initial fetch;
  improve error message specificity
- Rename siteTheme.int.spec.ts → siteTheme.spec.ts (it is a unit test)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Verify commit succeeded**
```bash
git log --oneline -3
```
Expected: the new commit appears at the top.
