# Technical Debt Analysis & Remediation Roadmap — 2026-07-16

Snapshot analysis of `main` (`e7457b3`). Read-only audit: this document is the only artifact;
no source files were changed. Findings are cross-checked against the prior audits
([backend-review.md](./backend-review.md), [payload-audit-findings.md](./payload-audit-findings.md),
[state-review-2026-07-01.md](./state-review-2026-07-01.md),
[client-readiness.md](./client-readiness.md)) and open issues #86–#89 so nothing is
double-tracked.

## Executive summary

The codebase is healthy at its core — access control, revalidation, route-handler guards, and
integration coverage are all in good shape — but it is **unguarded and duplicated at the edges**:

- **One confirmed user-facing bug (HIGH):** product pagination silently drops active
  `?tag`/`?sort` filters and creates duplicate-content URLs (FE-01).
- **One confirmed data-integrity bug (MED-HIGH):** the Etsy sync "transaction" never threads its
  `transactionID` into the writes, so rollback is a no-op (BE-01).
- **No lint/test/build CI.** Only security/drift workflows run; the entire test suite is
  effectively local-only. The local verifier (`scripts/local-build.sh`) also swallows failures,
  and the ESLint config it implies is orphaned — ESLint isn't even installed (CI-01/02/04).
- **A long duplication tail:** 7 listing routes with no shared skeleton, 3 divergent form
  implementations (one bypassing sanitization), an 858-line `syncEtsy.ts` god-file, 6 dead
  components, ~26 stale one-off scripts, and doc drift in CLAUDE.md/AGENTS.md/README.
- **Two prior-audit items are now resolved** (stale `fontSet` types; Etsy OAuth CSRF `state`
  validation) and are closed in the inventory below; three remain open (RV-02/03/04).

Recommended order: make the verifiers honest first (Phase 0), fix the two confirmed bugs
(Phase 1), land the CI safety net (Phase 2), and only then run the consolidation refactors
(Phase 3) — a 7-route consolidation or a forms rewrite without lint/test CI is how new debt
gets minted.

## Scope & method

Three parallel exploration tracks (backend/CMS core; frontend; tests/tooling/config/deps),
followed by a verification pass that confirmed the highest-impact claims directly in source
(pagination link generation, transaction threading, dependency graph, dead-component imports,
workflow inventory). Severity: **HIGH** = user-facing or integrity impact now; **MED** = costs
correctness-confidence or maintenance velocity; **LOW** = hygiene.

## Findings inventory

Disposition legend: `P0`–`P4` = remediation phase below; `DEF` = deferred (see §Deferred);
`#NN` = tracked in an existing GitHub issue.

### CI / tooling (CI-xx)

| ID | Sev | Finding | Files | Disposition |
|----|-----|---------|-------|-------------|
| CI-01 | HIGH | No lint/test/build job in CI — only `types-check`, `migration-drift`, `gitleaks`, `security` (Trivy) workflows exist. Regressions reach `main` unguarded. | `.github/workflows/` | P2 + #89 (Appendix A) |
| CI-02 | HIGH | Orphaned `eslint.config.mjs`: neither `eslint` nor `eslint-config-next` is in `package.json`/lockfile; the real linter is Oxlint via `vp lint`. The `lint` script even passes the config file as a lint *target*. | `eslint.config.mjs`, `package.json:18-19` | P0 |
| CI-03 | MED | `scripts/local-build.sh` swallows lint/test failures (`\|\| echo …`), exiting 0 on failure — while CLAUDE.md tells contributors to trust it before pushing. | `scripts/local-build.sh` | P0 |
| CI-04 | MED | Vercel install runs `rm -rf node_modules && pnpm install` without `--frozen-lockfile`; lockfile drift can ship silently. | `vercel.json`, `scripts/vercel-build.sh` | P0 |
| CI-05 | MED | Playwright requires system Google Chrome (`channel: 'chrome'`) and sets `reuseExistingServer: true` even on CI (can test a stale server). | `playwright.config.ts` | P2 |
| CI-06 | LOW | `tsconfig.json` `include` references `redirects.js`/`next.config.js`; the repo uses `.ts` variants. | `tsconfig.json` | P2 |
| CI-07 | LOW | The ~25-line `pass://` guard block is copy-pasted verbatim into `vitest.setup.ts` and `playwright.config.ts`. | both files | P2 |
| CI-08 | LOW | Test/lint toolchain pinned to pre-1.0 `vite-plus 0.2.1` via catalog (upstream `@voidzero-dev/vite-plus-test` never shipped 0.2.x). | `pnpm-workspace.yaml` | DEF (watch) |

### Tests (TS-xx)

| ID | Sev | Finding | Files | Disposition |
|----|-----|---------|-------|-------------|
| TS-01 | HIGH | Committed assertion-less debug test — pure `console.log`, no `expect()`, hardcodes admin creds `dev@candera.com`/`test1234`. | `tests/e2e/debug-admin.e2e.spec.ts` | P0 |
| TS-02 | MED | Duplicated AI-copy coverage: two parallel spec files test the same `@/lib/ai/product-copy` module. | `tests/int/productCopy.int.spec.ts`, `tests/int/lib/ai/product-copy.int.spec.ts` | P2 |
| TS-03 | MED | No test for the Vercel deploy webhook — a signed external-input endpoint; the highest-value untested surface. | `src/app/api/webhooks/vercel-deploy/route.ts` | P2 |
| TS-04 | MED | Hardcoded/inconsistent test credentials in helpers, incl. Payload-template leftover `dev@payloadcms.com`. | `tests/helpers/seedUser.ts`, `tests/helpers/login.ts` | P0 (with TS-01) |

Otherwise coverage is broad (18 int spec files: Etsy sync/OAuth/client, submitForm, revalidate,
search, scentQuiz, boot validation, DB adapter…) with no `.skip`/`.only` — good baseline.

### Backend / CMS core (BE-xx)

| ID | Sev | Finding | Files | Disposition |
|----|-----|---------|-------|-------------|
| BE-01 | MED-HIGH | **Verified:** `transaction()` calls `payload.db.beginTransaction()` but never passes `req: { transactionID }` into the inner `payload.create`/`update` — writes run on the default connection, outside the transaction; commit/rollback don't cover them. A mid-sync failure can leave partial state despite the "rollback". | `src/utilities/syncEtsy.ts:731-757` | P1 |
| BE-02 | MED-HIGH | In-memory form rate limiter is ineffective on serverless: module-level `Map` is per-lambda-instance, so the 5/min cap is trivially bypassed under scale. | `src/utilities/formRateLimit.ts` | P1 (seam) + #87 (real fix) |
| BE-03 | MED | Redundant DB round-trip per synced listing: `findProductByEtsyId` runs before the transaction *and* again inside `upsertProduct`. | `src/utilities/syncEtsy.ts:313,714` | P1 (with BE-01) |
| BE-04 | MED | `syncEtsy.ts` is an 858-line god-file: pure engine + three production adapters + a ~170-line heuristic description string-parser, all in one module. | `src/utilities/syncEtsy.ts` | P3 |
| BE-05 | MED | Payload monorepo version split: `payload` + most `@payloadcms/*` at 3.85.1 but `@payloadcms/next`/`plugin-mcp` at 3.85.2, `email-nodemailer` `^3.85.2`. Should move in lockstep. | `package.json` | P0 |
| BE-06 | MED | Whole-file `// @ts-nocheck` disables type checking for the module. | `src/utilities/deepMerge.ts:2` | P3 |
| BE-07 | MED | MCP plugin: global updates bypass Payload access control (per inline comment), gated only by a per-key checkbox; Header/Footer/SiteTheme/StudioInfo are write-enabled. | `src/plugins/index.ts:183-207` | P3 |
| BE-08 | MED | `revalidate.ts` decides whether to swallow `revalidatePath/Tag` failures by string-matching Next error messages (`'static generation store missing'`, …) — breaks silently when Next rewords; also raw `console.warn` instead of the project logger. | `src/utilities/revalidate.ts:20-47` | P1 |
| BE-09 | MED | `scripts/seed-legal-pages.ts` re-implements slug derivation and hardcodes footer link URLs, duplicating `src/endpoints/seed/` logic. | `scripts/seed-legal-pages.ts` | P3 (with seed consolidation) |
| BE-10 | LOW | Etsy shop ID `25894791` hardcoded in 4 places (canonical const exists in `src/endpoints/etsy.ts:8`); real listing IDs baked into scripts. | `scripts/sync-etsy.ts`, `scripts/fix-product-listings.ts`, `src/utilities/bootValidation.ts` | P3 |
| BE-11 | LOW | Over-broad Etsy OAuth scopes (`listings_w`, `shops_w`, `transactions_r/w`) for a mostly read/sync integration. | `src/utilities/etsyClient.ts:8-15` | P3 |
| BE-12 | LOW | `etsyOAuthInitEndpoint` constructs the client outside try/catch — missing creds → raw 500 (sibling handlers catch). | `src/endpoints/etsy.ts:86-102` | P1 |
| BE-13 | LOW | Recurring type-suppression: `@ts-expect-error` in `syncEtsy.ts:260`, `plugins/index.ts:93`, `RenderBlocks.tsx:69,98`; `as unknown as Product` double-casts in the sync store layer. | various | P3 |
| BE-14 | LOW | Template leftovers: `package.json` name `with-vercel-website`, description "Website template for Payload". | `package.json:2-4` | P4 |
| BE-15 | LOW | Script sprawl: ~26 scripts incl. stale one-offs (`test-*`, `fix-*`, `apply-*`, `update-*`) and 7 overlapping seed entrypoints. | `scripts/` | P0 (prune) + P3 (seed consolidation) |
| BE-16 | LOW | Validation constants split between `src/constants/validation.ts` (2 lines) and `src/utilities/formValidation.ts`. | both | P3 |

### Frontend (FE-xx)

| ID | Sev | Finding | Files | Disposition |
|----|-----|---------|-------|-------------|
| FE-01 | HIGH | **Verified:** pagination drops active filters/sort. `Pagination` always links path-based `${basePath}/page/N`; `/products/page/[pageNumber]` hardcodes `sort: '-createdAt'` and ignores `?tag`/`?sort`, so filtering + "next page" loses the filter. The `?page=` branch in `products/page.tsx` is dead, and `/products?page=2` vs `/products/page/2` both resolve (duplicate content, no canonical). | `src/components/Pagination/index.tsx:35-96`, `src/app/(frontend)/products/page/[pageNumber]/page.tsx:62`, `src/app/(frontend)/products/page.tsx:44-54` | P1 |
| FE-02 | MED | 7 listing routes (`posts`, `how-to`, `products` + their `page/[pageNumber]` siblings, detail pages) repeat the same fetch/render skeleton with no shared helper; paginated variants duplicate ~90% of their base route. | `src/app/(frontend)/{posts,how-to,products}/**` | P3 |
| FE-03 | MED | `toGridProduct` mapper copied verbatim (15 lines) in two files. | `products/page.tsx:22-37`, `products/page/[pageNumber]/page.tsx:18-33` | P3 |
| FE-04 | MED | Three divergent form implementations; only `InnerCircleCTA/EmailForm` uses the shared `useFormSubmission` hook; `blocks/Form/Component.tsx` calls `submitFormAction` directly, **bypassing `validateAndSanitizeSubmission`**. | `components/ContactForm/`, `blocks/InnerCircleCTA/EmailForm.tsx`, `blocks/Form/Component.tsx` | P3 |
| FE-05 | MED | Redundant double validation in the action layer: zod in `submitFormAction` + manual `validateAndSanitizeSubmission` in the `submitForm` wrapper — two public entry points with different guarantees. | `src/app/actions/submitForm.ts` | P3 (with FE-04) |
| FE-06 | MED | Inner Circle CTA hand-rolled 4 ways: the reusable block plus three inline variants in `posts/[slug]`, `how-to/[slug]`, `products/[slug]`. | those pages + `blocks/InnerCircleCTA/` | P3 |
| FE-07 | MED | Read-time calculation duplicated and inconsistent — posts use `JSON.stringify(content).split(/\s+/)` (counts JSON syntax; inaccurate), how-to walks the Lexical tree. | `posts/[slug]/page.tsx:37`, `how-to/[slug]/page.tsx:37-47` | P3 (with FE-02) |
| FE-08 | MED | Font config drift: `--font-sans` defined three times (`globals.css:41`, `theme.css:334`, `typography.css:4`); `globals.css` references `--font-geist-sans` but `GeistSans` is never imported (only `GeistMono`). | those files, `(frontend)/layout.tsx` | P4 |
| FE-09 | MED | Two product-card rendering systems: `ProductGrid` (framer-motion) on listings vs `CollectionArchive` on search — same `Card`, different layout/animation per route. | `products/ProductGrid.tsx`, `components/CollectionArchive/` | P3 |
| FE-10 | MED | Layout drift: `/posts` (featured + grid) vs `/posts/page/2` (sticky-sidebar two-column) — page structure changes when paginating. | `posts/page.tsx`, `posts/page/[pageNumber]/page.tsx:74-115` | P3 (with FE-02) |
| FE-11 | LOW | Six dead components (verified unimported): `ui/PrimaryButton`, `ui/InlineLink`, `PageHeader`, `PageRange`, `Card/QuickViewDialog`, `Card/ProductTagBadge`. | `src/components/` | P0 |
| FE-12 | LOW | Inconsistent error color tokens: `text-candera-rose` (3 forms) vs `text-candera-ember-strong` (ContactForm). | form components | P4 |
| FE-13 | LOW | Posts lack the Article JSON-LD that how-to guides emit. | `posts/[slug]/page.tsx` | P4 |
| FE-14 | LOW | FOUC guard `html { opacity: 0 }` revealed only by the `InitTheme` inline script — no `<noscript>` fallback; site is invisible if the script fails. | `globals.css:114-121` | P4 |
| FE-15 | LOW | `contactFormId = contactForm?.id ?? 0` — unseeded form renders and submits against id `0`, failing with a generic error instead of degrading visibly. | `contact/page.tsx:28` | P1 |
| FE-16 | LOW | Header theme has two competing effect-based sources (`SetHeaderTheme` on pages vs `HighImpact` hero's own `setHeaderTheme('dark')`); final state depends on effect ordering. | `heros/HighImpact/index.tsx:15-18` | P4 |

The `next/` route handlers (`seed`, `dev-auto-login`, `preview`, `generate-product-copy`,
`vercel-deploy` webhook) were audited and are **well-guarded** — admin/auth checks, timing-safe
HMAC verification, env-gated dev bypass. No security gaps found there.

### Dependencies & docs (DD-xx)

| ID | Sev | Finding | Files | Disposition |
|----|-----|---------|-------|-------------|
| DD-01 | MED | Likely-unused dependencies (no `src/`/`scripts/` imports found): `@inferencesh/sdk`, `@tanstack/react-query`, `match-sorter`, `@shefing/color-picker`, `remark-gfm`. Verify each, then remove. | `package.json` | P0 |
| DD-02 | MED | Committed Neon infra metadata: real `project_id` + production Neon-auth hostname in `scripts/pass_payloads/candera-production-neon-auth.json` (API key is a placeholder — no secret leaked, but infra identifiers don't belong in git). | `scripts/pass_payloads/` | P0 |
| DD-03 | MED | Broken `dump-public-schema` script family reads/writes `./schema/`, which doesn't exist. | `scripts/dump-public-schema.sh`, `package.json` | P0 |
| DD-04 | MED | CLAUDE.md contradicts itself on linting: "ESLint flat config (`eslint.config.mjs`)… keep the `fixCircular` helper" vs the (correct) Oxlint/`vp` toolchain section. | `CLAUDE.md` | P0 (with CI-02) |
| DD-05 | MED | AGENTS.md documents non-existent `vp dev` / `vp build` commands. | `AGENTS.md` | P0 |
| DD-06 | LOW | README omits the mandatory `pass-cli`/`pass://` secret flow and has stale seed instructions — a new contributor following README alone fails startup. | `README.md` | P0 |
| DD-07 | LOW | Five overlapping AI-assistant instruction surfaces (CLAUDE.md, AGENTS.md, GEMINI.md, frontend_instructions.md, `.github/copilot-instructions.md`) plus `.claude/`, `.codex/`, `.cursor/`, `.impeccable/` dirs — guaranteed drift. | root | DEF |
| DD-08 | LOW | Committed working artifacts: `DESIGN-IS-2026-06-14/`, `DESIGN.md`, `plans/`; large binaries in `public/candera/` and seed images (236–756 KB each). | root, `public/` | DEF |

### Prior-audit residuals re-verified (RV-xx)

| ID | Status | Item | Source |
|----|--------|------|--------|
| RV-01 | ✅ **Resolved** | Stale `payload-types.ts` (`fontSet` options) — committed types now match config (2 options). | payload-audit #6 |
| RV-05 | ✅ **Resolved** | Etsy OAuth `state` CSRF validation — callback now validates against the `etsy_oauth_state` cookie (`src/endpoints/etsy.ts:145`). | client-readiness residual |
| RV-06 | ✅ **Resolved** | Etsy env startup validation — `src/utilities/bootValidation.ts` exists and is wired into `payload.config.ts`. | payload-audit #8 |
| RV-02 | ⚠ Open | `payload-generated-schema.ts` drift (`statusCardShips` default). Regenerate + commit. | state-review #1 |
| RV-03 | ⚠ Open | Hidden legacy `statusCard*` fields with placeholder defaults in `StorefrontHero/config.ts` — prune + column-drop migration. | state-review #2 |
| RV-04 | ⚠ Open | SMTP silently no-ops to `jsonTransport` when `SMTP_HOST` unset — password-reset emails vanish; add startup warning. | client-readiness residual |

## Phased roadmap

Sequencing philosophy: **Phase 0 makes the verifiers honest** (you cannot trust
`local-build.sh` today, and the lint config is a lie), **Phase 1 fixes what users and data
see**, **Phase 2 builds the safety net**, and only then **Phase 3 does the large refactors**.
Phase 4 is polish. Each row is an independently-shippable PR.

### Phase 0 — Hygiene & trustworthy verifiers (~6 small PRs, all independent)

| PR | Work | Findings | Effort | Risk |
|----|------|----------|--------|------|
| 0.1 | Delete orphaned `eslint.config.mjs`; remove it from the `lint`/`lint:fix` script targets; fix CLAUDE.md lint contradiction, AGENTS.md `vp dev/build`, add pass-cli flow to README. | CI-02, DD-04/05/06 | S | low |
| 0.2 | Delete `debug-admin.e2e.spec.ts`; centralize test creds into one env-driven helper; rotate creds if they ever matched a real environment. | TS-01, TS-04 | S | low |
| 0.3 | Make `local-build.sh` fail honestly (drop `\|\| echo`); add `--frozen-lockfile` to the Vercel install. Do this **first** — every later phase gates on it. | CI-03, CI-04 | S | med* |
| 0.4 | Remove `scripts/pass_payloads/` (+ `.gitignore`); delete broken `dump-public-schema` scripts + their `package.json` entries. | DD-02, DD-03 | S | low |
| 0.5 | Prune dead code: 6 unused components + stale one-off scripts (`apply-homepage-lean`, `fix-media-alt`, `update-home-copy`, `test-*`, `fix-product-listings`, …) and their script entries. Delete, don't archive — git history is the archive. Grep-verify zero imports per deletion. | FE-11, BE-15, BE-10 (partial) | M | low |
| 0.6 | Dependency alignment: verify-and-remove the 5 unused deps (one commit each, build between); align `@payloadcms/*` to a single 3.85.x patch. | DD-01, BE-05 | M | low-med |

\* `--frozen-lockfile` may surface existing drift — that's the point; fix drift in the same PR.

### Phase 1 — Correctness bugs (before any refactor touches the same code)

| PR | Work | Findings | Effort | Risk | Depends on |
|----|------|----------|--------|------|-----------|
| 1.1 | Fix pagination: thread `tag`/`sort` through page links, stop hardcoding sort on `/products/page/N`, remove the dead `?page=` branch, add self-referencing canonicals. Ship with a test asserting `?tag=X` survives to page 2 — the regression guard for PR 3.2/3.4. | FE-01 | M | med | — |
| 1.2 | Fix syncEtsy transaction threading (`req: { transactionID }` into create/update; prove rollback with a forced mid-sync failure test); dedupe the double `findProductByEtsyId`. Surgical — no restructuring (that's 3.1). | BE-01, BE-03 | M | med | — |
| 1.3 | Error-handling batch: `revalidate.ts` stops string-matching messages (error types/codes; rethrow unknowns; project logger); try/catch on oauth-init; replace `contactFormId ?? 0` with explicit error/log. | BE-08, BE-12, FE-15 | S | low | — |
| 1.4 | Rate-limiter honesty: document the serverless limitation in-code and on #87; extract a `RateLimiter` interface seam so a durable (Upstash/WAF) impl is a drop-in. | BE-02 | S | low | #87 for real fix |

### Phase 2 — CI & test hardening (gate for Phase 3)

| PR | Work | Findings | Effort | Risk | Depends on |
|----|------|----------|--------|------|-----------|
| 2.1 | CI workflow (lint + int tests + build) — YAML in Appendix A; **a maintainer must commit it** (automation tokens lack `workflow` scope, issue #89). | CI-01 | M | low | 0.1, maintainer |
| 2.2 | Playwright CI-compat: bundled-Chromium fallback when system Chrome absent; `reuseExistingServer: !process.env.CI`. | CI-05 | S | low | — |
| 2.3 | Test gaps: add vercel-deploy webhook test; collapse duplicate AI-copy specs; extract shared `pass://` guard helper. | TS-02, TS-03, CI-07 | M | low | 0.2 |
| 2.4 | tsconfig include-glob cleanup. | CI-06 | S | low | — |

**Gate:** Phase 3 does not start until 2.1 (or at minimum lint+build) is green on `main`. If the
maintainer is unavailable, proceed with 2.2–2.4 and enforce `vp check && vp test &&
scripts/local-build.sh` manually per Phase 3 PR — stated explicitly in each PR description.

### Phase 3 — Consolidation refactors (independently shippable, by value)

| PR | Work | Findings | Effort | Risk | Depends on |
|----|------|----------|--------|------|-----------|
| 3.1 | Split `syncEtsy.ts` → `sync/engine.ts`, `sync/adapters.ts`, `sync/descriptionParser.ts` (parser gets pure-function unit tests); single shop-ID constant; narrow OAuth scopes. | BE-04, BE-10, BE-11, BE-13 (partial) | L | med | 1.2 |
| 3.2 | Shared listing-route skeleton for the 7 duplicated routes; fixes posts page-1 vs page-2+ layout drift; one correct read-time impl. | FE-02, FE-07, FE-10 | L | med | 1.1 |
| 3.3 | Forms unification: all 3 forms through `useFormSubmission`; `Form/Component.tsx` goes through `validateAndSanitizeSubmission`; single validation boundary in the action layer. Highest-risk refactor (conversion paths) — hence gated on Phase 2. | FE-04, FE-05 | M | med-high | 2.3, 1.4 |
| 3.4 | Product rendering dedupe: single `toGridProduct`; converge on one card system (recommend `ProductGrid` canonical; `CollectionArchive` delegates). | FE-03, FE-09 | M | med | 3.2 preferred |
| 3.5 | One Inner Circle CTA component replacing the 4 variants. | FE-06 | S | low | — |
| 3.6 | Seed consolidation: 7 entrypoints → one `scripts/seed.ts` CLI with subcommands; dedupe `seed-legal-pages.ts` logic. | BE-09, BE-15 | M | low | 0.5 |
| 3.7 | Type hygiene: remove `@ts-nocheck` from `deepMerge.ts`, burn down `@ts-expect-error`/double-casts, merge split validation constants. | BE-06, BE-13, BE-16 | M | low | — |
| 3.8 | MCP plugin: stop global writes bypassing access control (route through authenticated Local API / explicit checks). | BE-07 | M | med | — |

### Phase 4 — Polish (1–2 batched PRs, all S/low)

Fonts single-source (`--font-sans`, drop dead `--font-geist-sans`) · error-token consistency ·
posts Article JSON-LD (mirror how-to) · `<noscript>` FOUC fallback · header-theme
single-source · fix template package name · close RV-02/03/04 (regen generated schema; prune
`statusCard*` fields + column-drop migration; SMTP startup warning).
(FE-08, FE-12, FE-13, FE-14, FE-16, BE-14, RV-02/03/04)

## Deferred / won't-fix

| Item | Rationale |
|------|-----------|
| Legal content (#86) | Client action; blocked on client, not engineering. |
| Durable rate limiting / bot mitigation (#87) | Needs an infra decision (Upstash/Vercel WAF/Turnstile). PR 1.4 delivers the code seam; implementation lands when infra exists. |
| Major dependency upgrades (#88) | Tracked separately; this roadmap only removes unused deps and aligns the trivial 3.85.x split. Mixing major upgrades into a debt roadmap doubles every phase's risk. |
| Committing `ci.yml` directly (#89) | Hard constraint — automation tokens can't push workflow files. YAML shipped in Appendix A; maintainer commits. |
| Reintroducing ESLint | Won't-fix: Oxlint via `vp` is the sanctioned linter; a second linter is new debt. |
| Refactoring stale one-off scripts | Delete (P0.5), don't refactor — git history preserves them. |
| Full `CollectionArchive` rewrite | Only converge card rendering (3.4); rewriting the template-derived block internals is poor value/risk. |
| History purge for `pass_payloads/` | Content is metadata, not a live credential — not worth a force-push disruption. (`scripts/purge-env-from-history.sh` exists if that assessment changes.) |
| vite-plus 0.2.1 pin (CI-08) | Watch upstream; unblock when `vite-plus-test` ships a compatible release. |
| AI-doc surface sprawl (DD-07), committed design artifacts (DD-08) | Low value; revisit if drift causes a real incident. |

## Verification strategy

- **Phase 0:** `vp check`; `scripts/local-build.sh` (trustworthy only after 0.3 — land 0.3
  first, then use it to gate 0.5/0.6). Per dep removal in 0.6: grep imports → full build.
- **Phase 1:** `vp test` for new int tests; e2e for 1.1 (assert `?tag` survives pagination,
  canonical present); for 1.2, a forced mid-sync failure proving rollback; `local-build.sh`.
- **Phase 2:** the CI workflow verifies itself — a deliberately broken commit on a scratch
  branch must go red. Playwright change verified locally *and* headless.
- **Phase 3:** full suite per PR (`vp check` + `vp test` + e2e + `local-build.sh`) plus targeted
  manual smoke: filter → paginate (3.2/3.4); submit all 3 forms incl. a validation-failure path
  (3.3); full Etsy sync dry-run (3.1); MCP write attempt with a non-privileged key (3.8).
- **Phase 4:** `local-build.sh` + visual spot-check (fonts; FOUC with JS disabled) + Rich
  Results test for JSON-LD.

Rough total: Phases 0–2 ≈ 10 small/medium PRs; Phase 3 ≈ 8 PRs (two L); Phase 4 ≈ 1–2 PRs.

## Appendix A — proposed `.github/workflows/ci.yml`

For a maintainer to commit (see issue #89; supersedes the YAML there — updated for the `vp`
toolchain and pinned action majors already used in this repo).

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: candera_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      # Non-Neon host -> standard postgres adapter (see src/utilities/databaseAdapter.ts)
      DATABASE_URI: postgres://postgres:postgres@localhost:5432/candera_test
      POSTGRES_URL: postgres://postgres:postgres@localhost:5432/candera_test
      PAYLOAD_SECRET: ci-test-secret
      NEXT_PUBLIC_SERVER_URL: http://localhost:3000
      CRON_SECRET: ci-cron-secret
      PREVIEW_SECRET: ci-preview-secret
      ETSY_SHOP_ID: '0'

    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Lint
        run: pnpm lint
      - name: Run migrations
        run: pnpm payload migrate
      - name: Integration tests
        run: pnpm test:int
      - name: Build
        run: pnpm build
```

Notes: Postgres 18 matches the documented local baseline; `ETSY_SHOP_ID` is a dummy to satisfy
boot validation without enabling sync; the Playwright e2e suite stays out of the required gate
until PR 2.2 lands (browser/channel portability), after which an optional e2e job can be added.
