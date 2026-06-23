# Backend Review — Payload CMS Correctness & Content Completeness

**Date:** 2026-06-23
**Scope:** Full backend audit (content completeness + implementation correctness)
**Stack:** Payload CMS 3.85.1 · Next.js 16 (App Router) · Vercel Postgres (Neon) · Vercel Blob

This review audits whether the Payload CMS backend is correctly implemented and whether
all storefront content is modeled in the CMS. Findings are tagged with severity and a
status: **Fixed** (changed in this branch), **Recommended** (left for a decision), or
**OK** (no action needed).

---

## Summary

The backend is mature and well-structured: 13 collections, now **4 globals**, 5 plugins,
and a clean port–adapter Etsy sync engine. The audit found one branding bug, three pieces
of editorial content hardcoded in the storefront (now CMS-managed), one stale
architecture note, and two correctness items worth a decision (draft exposure on
`products`, and silent-failure behavior in the Etsy sync). Form submissions — previously
documented as bypassing Payload hooks — were verified to already use the Local API.

| # | Finding | Area | Severity | Status |
|---|---------|------|----------|--------|
| A | SEO meta titles read "Payload Website Template" | SEO plugin | High | **Fixed** |
| B | Contact email / Instagram / hours hardcoded | Content | High | **Fixed** |
| C | Inner Circle benefit cards hardcoded | Content | Medium | **Fixed** |
| D | Search suggestion tags hardcoded (duplicated) | Content | Medium | **Fixed** |
| E | "Form submissions bypass Payload hooks" | Forms | — | **OK** (doc corrected) |
| F | `products` exposes drafts via public API | Access control | Medium | **Fixed** |
| G | Etsy sync swallows errors / always reports success | Etsy sync | Medium | **Fixed** |

---

## Audit areas

### 1. Content completeness — gaps found & fixed
A sweep of `src/app/(frontend)/**` confirmed that Pages, Posts, Products, Categories,
How-To Guides, Quizzes, Scent Profiles, and Forms are all CMS-driven. The exceptions were
three surfaces with literal copy (Findings **B/C/D**), now sourced from a new
`StudioInfo` global. No other significant hardcoded content was found; remaining literals
are structural microcopy (button labels, eyebrows) appropriate to leave in code.

### 2. Collections & fields — OK
Required fields, `useAsTitle`, slug uniqueness, and conditional fields (e.g. `Products`
`atmosphere`/`scentProfile` gated on `productType === 'candle'`) are coherent. Admin
grouping is consistent (`System`, `Commerce`, `Quiz`, `Marketing`, `Inquiries`).

### 3. Access control — one finding (F)
`anyone` / `authenticated` / `authenticatedOrPublished` are applied consistently for
most collections; `etsy-tokens` is correctly locked server-only (all ops `false`,
`admin.hidden`). **Exception:** `products` enables drafts but uses `read: anyone` — see
Finding F.

### 4. Globals — OK (extended)
Header, Footer, and SiteTheme are well-modeled with public read + revalidate hooks. This
review adds **StudioInfo** to cover the previously-hardcoded editorial content.

### 5. Plugins — one bug (A)
SEO, Search (posts + products), Redirects (pages + posts), Nested Docs (categories), and
Form Builder are configured correctly. The SEO `generateTitle` carried the starter
template's brand string — Finding A.

### 6. Hooks & revalidation — OK
`src/utilities/revalidate.ts` covers Pages, Posts, Products, How-To Guides, and redirects.
Globals revalidate via tag (`global_<slug>`). The new StudioInfo hook follows the same
convention (`revalidateTag('global_studio-info', 'max')`).

### 7. Schema / migration drift — OK
All 36 existing migrations apply cleanly against a fresh Postgres 16 database. After
adding StudioInfo, `payload generate:types` produced no unexpected drift, and a new
migration (`20260623_001156_add_studio_info`) was generated and verified to apply.

### 8. Etsy sync, seed data, env config — one finding (G)
`.env.example` matches the env vars referenced in code (`ETSY_API_KEY`,
`ETSY_SHARED_SECRET`, `ETSY_REDIRECT_URI` are read in `etsyClient.ts` but not documented
in `.env.example` — minor doc gap). Seed data is comprehensive. The sync engine's error
handling has gaps — see Finding G.

---

## Findings — detail

### A. SEO meta titles read "Payload Website Template" — High — Fixed
`src/plugins/index.ts` — `generateTitle` returned `` `${doc.title} | Payload Website
Template` `` (and the same string as fallback), branding every page/post meta title
incorrectly. Changed to `` `${doc.title} | Candera Candles` ``, matching the admin
`titleSuffix`.

### B/C/D. Hardcoded editorial content — High/Medium — Fixed
Three surfaces rendered literal content that editors could not change:
- **B** — `contact/page.tsx`: email, Instagram handle/URL, studio hours, location tagline.
- **C** — `inner-circle/page.tsx`: three "What you'll receive" benefit cards.
- **D** — `search/page.tsx`: six suggestion tags, duplicated across two render branches.

**Remediation — new `StudioInfo` global** (`src/StudioInfo/config.ts`), registered in
`payload.config.ts`. To keep the admin clean and editorial, fields are organized with a
Payload `tabs` field into three tabs:
- **Contact & Location** — `email`, `instagramHandle`, `instagramUrl`, `studioHours`,
  `locationTagline`.
- **Inner Circle** — `innerCircleBenefits` array (`label`, `description`).
- **Search Configuration** — `searchSuggestions` array (`term`).

The three pages now read from `getCachedGlobal('studio-info')()` (reusing the existing
helper, auto-tagged `global_studio-info`), keeping the original values as in-code
fallbacks so nothing breaks before the global is seeded. The `revalidateStudioInfo`
`afterChange` hook invalidates via `revalidateTag('global_studio-info', 'max')` so the
storefront never serves stale fallbacks. The global is seeded in
`src/endpoints/seed/index.ts`, and a migration was generated.

### E. "Storefront form submissions bypass Payload hooks" — Not a defect — Doc corrected
`docs/ARCHITECTURE.md` claimed the `submitForm` server action wrote `form_submissions`
via raw SQL, bypassing the `processSubmission` `afterChange` hook (Mailchimp/Supabase
fan-out). **Verified false against current code:** `src/app/actions/submitForm.ts`
already uses `payload.create({ collection: 'form-submissions', ... })` (the Local API),
so the hook fires for storefront submissions exactly as for admin-created ones. The stale
note and diagram in `ARCHITECTURE.md` were corrected. No code change required.

### F. `products` exposes drafts via the public API — Medium — Fixed
`src/collections/Products.ts` enabled drafts (`versions.drafts`) but used `read: anyone`,
which returns `true` unconditionally. Unlike `pages`/`posts` (which use
`authenticatedOrPublished`), **unpublished/draft products were readable by anyone** through
the REST/GraphQL API. ScentProfiles and Quizzes also use `read: anyone` but have no drafts,
so only published data exists — left as-is (lower risk).

**Fix applied** — `products` read access now uses `authenticatedOrPublished` (mirrors
Pages/Posts). Published reads continue to work for the storefront; admin live-preview uses
an authenticated session, so draft preview is unaffected.

### G. Etsy sync swallowed errors and always reported success — Medium — Fixed
`src/utilities/syncEtsy.ts` / `src/utilities/etsyClient.ts`:

1. **No rate-limit handling.** `EtsyClient.request()` throws a generic
   `Etsy API Error (<status>)` for any non-2xx, including HTTP 429. There is no
   `Retry-After` handling, backoff, or retry. A rate-limited shop sync fails hard; a
   rate-limited per-listing fetch is silently dropped (next point).
2. **Silent per-listing failures.** In `ProductionEtsySourceAdapter.fetchListings`, the
   per-id fallback loop uses `catch {}` (empty) — listings that error are dropped with no
   log, causing silent drift between Etsy and the `products` collection.
3. **Misleading success signal.** `EtsySyncEngine.sync()` returns `success: true`
   regardless of `failures.length`, and the entry point `syncEtsyListings()` discards the
   `failures` array entirely (returns only `{ success, count }`), so callers/endpoints
   cannot observe partial failures.

Inventory-mismatch handling was otherwise reasonable: Zod-invalid shop listings are logged
and skipped; per-listing processing errors and image-download failures are caught, logged,
and collected into `failures[]`; upserts run inside a transaction with rollback.

**Fixes applied:**
- **(a) 429 handling** — `EtsyClient.request()` now retries on HTTP 429 up to 3 times,
  honoring the `Retry-After` header (falling back to exponential backoff) and logging each
  retry, instead of failing the whole sync on a transient throttle.
- **(b) No more silent drops** — the per-listing fallback and batch-fetch failure paths in
  `ProductionEtsySourceAdapter.fetchListings` now log each dropped/failed listing.
- **(c) Honest success signal** — `EtsySyncEngine.sync()` returns
  `success: failures.length === 0`, and `syncEtsyListings()` now propagates the `failures`
  array, so the `/sync-etsy` endpoint and `scripts/sync-etsy.ts` surface partial failures
  (the latter logs each failing listing and exits non-zero). For listing-ID syncs, any
  requested ID Etsy never returns (batch + per-listing fetch both failed) is recorded as a
  failure so it can't vanish silently. Test coverage updated in
  `tests/int/syncEtsy.int.spec.ts`.

---

## Verification performed
- `payload migrate` — all 36 prior migrations + the new `add_studio_info` apply cleanly
  against a fresh Postgres 16 DB; `migrate:status` shows all applied.
- `payload generate:types` — `StudioInfo` typed; no unexpected drift.
- `pnpm lint` — clean (only pre-existing a11y warnings in `ScentQuiz`).
- Integration tests — 43 passed (10 files).
- `pnpm build` — production build, prerender, and sitemap generation succeed.

## Recommended follow-ups
All findings from this review (A–G) are addressed in this branch. Documented `ETSY_API_KEY`
/ `ETSY_SHARED_SECRET` / `ETSY_REDIRECT_URI` / `ETSY_SHOP_ID` in `.env.example`. No
outstanding items.
