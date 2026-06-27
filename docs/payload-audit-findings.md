# Payload Convention-Audit — Findings

Run of the 9-dimension audit defined in [`payload-audit-playbook.md`](./payload-audit-playbook.md).
Date: 2026-06-26. Repo: candera-payload (Payload 3.85.1 / Next 16.2.7). Reference:
payload-website-starter (3.82.1). API authority: Context7 `/payloadcms/payload/v3.85.0`.

**Method note:** this was a read-only audit. `pnpm generate:types` was run to test freshness, the
resulting diff inspected, and the working tree reverted to its committed state (`git checkout`).
No source files were changed by this audit.

## Summary table

| # | Dimension | Verdict | Severity | File(s) |
|---|---|---|---|---|
| 1 | Collection file-structure consistency | ⚠ Diverges | **Med** | `src/collections/` |
| 2 | Naming consistency | ✓ Pass (minor) | Low | `src/collections/` |
| 3 | Block registration integrity | ✓ Pass | — | `src/blocks/RenderBlocks.tsx` |
| 4 | Access-control idiom | ✓ Pass | — | `src/access/authenticatedOrPublished.ts` |
| 5 | Revalidation correctness | ✓ Pass (ahead of starter) | — | `src/utilities/revalidate.ts` |
| 6 | `generate:types` freshness | ⚠ Stale | **Med** | `src/payload-types.ts` |
| 7 | Plugins config | ✓ Pass | — | `src/plugins/index.ts` |
| 8 | Startup env validation (Etsy) | ⚠ Gap | Low | `src/payload.config.ts` |
| 9 | `CLAUDE.md` presence | ✓ Resolved | — | `CLAUDE.md` |

Net: **2 medium, 1 low actionable; 6 pass.** No functional/correctness defects found.

---

## Actionable findings

### #6 — Committed types are stale (Med)
`pnpm generate:types` produces a diff against the committed `src/payload-types.ts`:

```diff
-  fontSet: 'default' | 'playfair-inter' | 'dm-sans' | 'space-grotesk';
+  fontSet: 'default' | 'dm-sans';
```

The `SiteTheme.fontSet` options were reduced from 4 to 2 in the config, but types were not
regenerated/committed. The codebase consuming `fontSet` is now typed against options that no longer
exist (`'playfair-inter'`, `'space-grotesk'`).

**Fix:** `pnpm generate:types` and commit `src/payload-types.ts`. Consider a CI guard that fails if
`generate:types` yields a non-empty diff. Per the project CLAUDE.md convention, types must be
regenerated after any schema change.

### #1 — Mixed collection file structure (Med)
candera mixes two layouts:
- **Dir-per-collection:** `Pages/`, `Posts/`, `Users/` (with `index.ts`).
- **Single-file:** `Products.ts`, `Categories.ts`, `Media.ts`, `Briefs.ts`, `Documentation.ts`,
  `EtsyTokens.ts`, `Folders.ts`, `HowToGuides.ts`, `Quizzes.ts`, `ScentProfiles.ts`.

The starter standardizes on dir-per-collection + a `hooks/` subdir. **Important nuance:** Payload
imposes **no** file-structure requirement — collections register by importing a `CollectionConfig`
into the `collections` array regardless of layout. So this is an **internal-consistency /
maintainability** finding, not an API-idiom violation.

**Fix (optional, low-risk):** pick one convention. Given candera centralizes revalidation in
`src/utilities/revalidate.ts` (not per-collection `hooks/` dirs), the single-file form is the
simpler target — consider converting `Pages/`, `Posts/`, `Users/` to single files, *or* the
reverse. Either way, do it as a pure file move + import-path update; defer if churn isn't worth it.

### #8 — No startup validation for Etsy env vars (Low)
`src/payload.config.ts` validates `PAYLOAD_SECRET`, `DATABASE_URI`/`POSTGRES_URL`, and (in prod)
`BLOB_READ_WRITE_TOKEN` — but Etsy vars are only read at call time in `src/endpoints/etsy.ts` /
`src/utilities/etsyClient.ts`. Missing Etsy creds fail at sync time, not boot.

**Fix (optional):** add a soft startup check that warns (not throws) if Etsy vars are absent, so the
failure mode is visible before a sync is triggered. Low priority — Etsy sync is background, not
boot-critical.

---

## Passing dimensions (evidence)

- **#2 Naming:** all collection slugs are clean kebab-plural (`products`, `how-to-guides`,
  `scent-profiles`, `etsy-tokens`). The only variance is file/export layout, folded into #1.
- **#3 Block registration:** 12 block configs, all accounted for — 10 layout blocks
  (`archive, content, cta, formBlock, mediaBlock, storefrontHero, theVessels, testimonials,
  innerCircleCTA, scentQuiz`) are in the `blockComponents` map; `banner` + `code` render via the
  Lexical `BlocksFeature` in Posts/HowToGuides (same as starter); `RelatedPosts` is a component-only
  dir (no slug), used directly — not a layout block. **No orphan configs, no unmapped blockTypes.**
- **#4 Access idiom:** `authenticatedOrPublished` is a proper `Access` function returning `true` for
  users or a `{ _status: { equals: 'published' } }` constraint — exactly the canonical idiom
  (confirmed against Context7 `/payloadcms/payload/v3.85.0` access-control docs and the starter).
- **#5 Revalidation:** the rule-based engine honors `!ctx.req.context.disableRevalidate`, and all
  four routed content collections (Pages, Posts, Products, HowToGuides) wire the hooks. This is
  **more robust** than the starter's per-hook duplication.
- **#7 Plugins:** redirects, nested-docs, SEO, form-builder, and search are configured idiomatically;
  search indexes both posts and products.
- **#9 CLAUDE.md:** present (7.1k), high-level map that defers to `AGENTS.md` for the operational
  runbook. The playbook's earlier recommendation is already satisfied.

---

## Recommended next actions (in priority order)
1. **#6** — regenerate + commit `payload-types.ts` (5-minute fix, real type-safety impact).
2. **#1** — decide on one collection file convention; execute as a mechanical move if worthwhile.
3. **#8** — add a non-fatal Etsy env startup warning.

All three are deferred to a separate, explicitly-approved change — this run is the audit only.
