# Pre-Deployment Sweep — Redesign Branch

**Date:** 2026-06-13  
**Branch:** `redesign` → `main`  
**Scope:** Fix concrete issues in untracked files before staging them, then commit everything clean in one production-readiness commit.

---

## Context

The redesign branch contains a large set of new and modified files. Several new source files were never committed. A pre-deployment audit identified concrete issues — memory leaks, fragile string matching, missing error guards, a mislabeled test file — across both public-facing and admin components. The goal is to resolve all known issues before the merge so the commit history is clean and the deployed state has no known gaps.

---

## Fixes

### Public-facing

**`src/blocks/Form/Component.tsx`**  
- Change `console.warn(err)` → `console.warn('[FormBlock] submission error:', err)`  
- One line change.

**`src/blocks/ScentQuiz/Modal.tsx`**  
- Wrap `history.replaceState()` in a try-catch. On failure, fall back to setting `window.location.hash = ''` to remove the hash without throwing.

**`src/app/(frontend)/products/[slug]/StickyCTABar.tsx`**  
- Extract Etsy listing URL to a named constant at the top of the file instead of inline string construction.  
- Add an `if (!window.IntersectionObserver) return` guard before the observer setup so the CTA bar remains visible as a static fallback in browsers without support.

**`src/app/(frontend)/products/[slug]/ProductDetailSections.tsx`**  
- Replace `title?.toLowerCase().includes('metal')` with `vessel === 'metal'`. The `vessel` prop already exists on the component — use it directly rather than inferring from the product title string.

### Admin-only

**`src/components/BeforeDashboard/SectionTooltip.tsx`**  
- Clear the timeout ref in the `useEffect` cleanup to prevent setState-after-unmount. Return a cleanup function from the effect that calls `clearTimeout(timeoutRef.current)`.

**`src/components/BeforeDashboard/ThemePresetSwitcher.tsx`**  
- Add a visible loading state during the initial theme settings fetch (currently renders nothing while loading).  
- Change the generic error message to `"Failed to apply theme preset — try again"` for slightly more context.

**`tests/int/siteTheme.int.spec.ts`**  
- Rename to `tests/int/siteTheme.spec.ts`. The test has no database or API calls — it is a unit test and the `.int` suffix misrepresents it.

---

## Commit Contents

### New files to stage
| File | Status |
|------|--------|
| `src/components/FilmGrain/` | Clean |
| `src/blocks/ScentQuiz/Modal.tsx` | After try-catch fix |
| `src/app/(frontend)/products/[slug]/ProductDetailSections.tsx` | After vessel prop fix |
| `src/app/(frontend)/products/[slug]/StickyCTABar.tsx` | After URL constant + IO fallback |
| `src/components/BeforeDashboard/SectionTooltip.tsx` | After timeout cleanup fix |
| `src/components/BeforeDashboard/ThemePresetSwitcher.tsx` | After loading + error fix |
| `src/components/BeforeDashboard/themePresets.ts` | Clean |
| `src/migrations/20260612_082000_extend_site_theme.ts` | Clean |
| `src/utilities/siteTheme.ts` | Clean |
| `tests/int/siteTheme.spec.ts` | Renamed from `.int.spec.ts` |
| `scripts/seed-initial-users.ts` | Clean |

### Modified tracked files to stage
All unstaged modifications from the redesign branch:
- `src/blocks/Form/Component.tsx` (console.warn fix)
- `src/SiteTheme/config.ts`
- `src/app/(frontend)/layout.tsx`
- `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`
- `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`
- `src/app/(frontend)/next/ai/generate-product-copy/route.ts`
- `src/app/(payload)/admin/importMap.js`
- `src/blocks/CallToAction/Component.tsx`
- `src/blocks/InnerCircleCTA/Component.tsx`
- `src/blocks/ScentQuiz/Component.tsx`
- `src/blocks/StorefrontHero/Component.tsx`
- `src/blocks/Testimonials/Component.tsx`
- `src/components/BeforeDashboard/DashboardHeader.tsx`
- `src/components/BeforeDashboard/MetricCard.tsx`
- `src/components/BeforeDashboard/QuickAccessCard.tsx`
- `src/components/BeforeDashboard/index.scss`
- `src/components/BeforeDashboard/index.tsx`
- `src/components/Card/index.tsx`
- `src/components/FragranceProfile/index.tsx`
- `src/components/GlobalLayout/index.tsx`
- `src/endpoints/etsy.ts`
- `src/endpoints/seed/home-static.ts`
- `src/endpoints/seed/home.ts`
- `src/heros/HighImpact/index.tsx`
- `src/heros/PostHero/index.tsx`
- `src/migrations/index.ts`
- `src/payload-types.ts`
- `src/payload.config.ts`
- `.env.example`
- `.github/workflows/ci.yml`
- `AGENTS.md`
- `next-sitemap.config.cjs`
- `package.json`
- `scripts/seed-admin.ts`
- `vercel.json`

### Excluded (not staged)
- `.superpowers/brainstorm/` — local tooling artifact
- `docs/superpowers/plans/` — captured separately
- `src/app/(frontend)/products/[slug]/.superdesign/` — design iteration files
- `.vscode/settings.json` — local editor config
- `.superdesign/design_iterations/etsy_theme.css` — design artifact
- `scripts/pass_payloads/candera-production-neon-auth.json` — credentials file, never commit

---

## Verification

Run after all fixes are applied and before committing:

```bash
npx tsc --noEmit
grep -rn "console\.warn(err)" src/
grep -rn "\.includes\('metal'\)" src/
```

Expected: no TypeScript errors, zero matches on both grep commands.
