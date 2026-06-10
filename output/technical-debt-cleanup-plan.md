# Candera Payload Technical Debt Cleanup Plan

Date: 2026-06-10
Project: `/home/ohdaveed/projects/candera-payload`

## Scope

This is a read-only technical debt review of the current worktree. The repo is already dirty, including dependency/script edits, deleted unused-code candidates, a new migration, and generated Payload import map/type changes. I treated the current file contents as the review target and did not modify source files.

## Baseline Health

| Check                                             | Result                                                                   |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| `./node_modules/.bin/tsc --noEmit --pretty false` | Passed                                                                   |
| `./node_modules/.bin/vp lint .`                   | Passed: 0 warnings, 0 errors across 273 files                            |
| `npm outdated --json`                             | 37 outdated packages                                                     |
| Context docs checked                              | Next.js `/vercel/next.js/v16.2.2`, Payload `/payloadcms/payload/v3.85.0` |

The codebase is not in a broken state. Most debt is modernization, safety, and maintainability work rather than urgent compile failures.

## Highest Priority Cleanup

### P0. Remove broad deprecation suppression from npm scripts

Evidence: `package.json:8`, `package.json:11-23` wrap most scripts in `NODE_OPTIONS=--no-deprecation`.

Why it matters: this hides runtime warnings that usually point to dependency or framework migration work. It turns deprecations into background noise instead of actionable maintenance.

Plan:

1. Add a temporary script such as `build:diagnose` without `--no-deprecation`.
2. Run build, dev startup, Payload generation, lint, and tests without suppression.
3. Fix or document each warning source.
4. Remove `NODE_OPTIONS=--no-deprecation` from normal scripts once warnings are understood.

Before:

```json
"build": "cross-env NODE_OPTIONS=--no-deprecation next build"
```

After:

```json
"build": "next build"
```

### P0. Rationalize database adapters and direct SQL usage

Evidence:

- `package.json:34-35` declares both `@payloadcms/db-postgres` and `@payloadcms/db-vercel-postgres`.
- `src/payload.config.ts:1` and `src/payload.config.ts:97-102` use `vercelPostgresAdapter`.
- `src/lib/db.ts:1-3` creates a separate Neon SQL client from `DATABASE_URL`.
- `src/app/actions/submitForm.ts:20-37` manually writes Payload form-builder tables.

Why it matters: there are two database access paths and two Payload Postgres adapters in the dependency graph. Direct SQL into Payload/plugin-owned tables bypasses Payload hooks, validation, access rules, and schema abstractions. It also creates transaction risk: the parent row insert happens before the child-row transaction.

Plan:

1. Decide on one Payload DB adapter. If Vercel Postgres remains the runtime target, remove unused `@payloadcms/db-postgres`; otherwise migrate config/migrations consistently.
2. Replace direct form-submission SQL with Payload's local API if the form-builder plugin supports the required operation.
3. If direct SQL must remain, wrap parent and child inserts in the same transaction and centralize table names/types in one module.
4. Add an integration test that fails if a child-row insert errors after the parent row was created.

Before:

```ts
const rows = await sql`INSERT INTO form_submissions ... RETURNING id`
await sql.transaction((tx) => submissionData.map(...))
```

After:

```ts
await sql.transaction(async (tx) => {
  const rows = await tx`INSERT INTO form_submissions ... RETURNING id`
  await Promise.all(submissionData.map((item, i) => tx`INSERT INTO ...`))
})
```

Prefer an even better after-state: use Payload/plugin APIs instead of table-level writes.

### P0. Fix OAuth state handling before expanding Etsy automation

Evidence:

- `src/utilities/etsyClient.ts:144-153` generates a `state` value.
- `src/payload.config.ts:221-239` handles callback `code` but does not read or validate `state`.

Why it matters: generating state without validating it gives a false sense of OAuth CSRF protection.

Plan:

1. Store generated state server-side with an expiry, or in a secure HTTP-only cookie if this route flow is browser-driven.
2. Validate callback state before token exchange.
3. Add tests for missing, mismatched, expired, and valid state.

## Dependency Modernization

### Current outdated packages

`npm outdated --json` reported 37 outdated packages.

Only one major-version update appeared:

| Package                | Current | Wanted | Latest | Recommendation                                                                         |
| ---------------------- | ------: | -----: | -----: | -------------------------------------------------------------------------------------- |
| `@vitejs/plugin-react` |   4.5.2 |  4.5.2 |  6.0.2 | Treat as separate dev-tool migration; check Vite/Vitest/vite-plus compatibility first. |

Patch/minor updates include:

| Group                | Current                                                                                         | Latest                                            | Recommendation                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Payload core/plugins | `3.85.0`                                                                                        | `3.85.1`                                          | Batch all `payload` and `@payloadcms/*` packages together. Regenerate import map and types afterward. |
| Next/React           | `next 16.2.7`, `react 19.2.6`, `react-dom 19.2.6`                                               | `next 16.2.9`, `react 19.2.7`, `react-dom 19.2.7` | Batch together and run build/e2e smoke tests.                                                         |
| Radix UI             | Several `1.x` / `2.x` patch updates                                                             | Latest patch/minor                                | Batch low risk, but first remove packages made unused by the unused-code cleanup.                     |
| Type packages        | `@types/node 25.9.1`, `@types/react 19.2.15`                                                    | patch updates                                     | Batch with typecheck.                                                                                 |
| Other libs           | `ai`, `graphql`, `geist`, `react-hook-form`, `@supabase/supabase-js`, `react-medium-image-zoom` | patch/minor                                       | Update in small groups by feature area.                                                               |

### Package manager/tooling debt

Evidence:

- `package.json:109` says `pnpm@11.5.2`.
- This environment had `npm` available but `pnpm` was not on PATH in earlier checks.
- `pnpm-workspace.yaml` uses `catalog:` entries for `vite`, `vitest`, and `vite-plus`, resolving to `@voidzero-dev` packages.

Plan:

1. Ensure Corepack or pnpm is available in onboarding/CI docs.
2. Keep `packageManager` and lockfile as the single source of truth.
3. Document why `vite-plus`, `vitest`, and `vite` are catalog aliases to `@voidzero-dev/*`; otherwise future maintainers may replace them with ordinary Vite/Vitest accidentally.

## Deprecated or Risky Patterns

### Generated Payload artifacts need a repeatable regeneration rule

Evidence:

- Payload docs recommend regenerating import map after admin component/folder changes.
- `src/app/(payload)/admin/importMap.js` is modified.
- `src/payload.config.ts:68-70` sets `admin.importMap.baseDir`.
- `src/payload.config.ts:246-248` writes generated types to `src/payload-types.ts`.

Plan:

1. After any admin component, collection, field, or migration config change, run:

```bash
pnpm payload generate:importmap
pnpm payload generate:types
```

2. Add a CI check that fails when generated artifacts drift after config changes.
3. Document this in the repo README or AGENTS-style workflow doc.

### Payload migrations are configured but not wired for production runtime migrations

Evidence:

- `src/migrations/index.ts:16` exports `migrations`.
- Payload docs show `prodMigrations: migrations` inside the database adapter when runtime production migrations are desired.
- `src/payload.config.ts:97-102` configures the adapter but does not pass `prodMigrations`.

Plan:

1. Decide whether production runs `payload migrate` explicitly during deploy or relies on `prodMigrations`.
2. If explicit migration is the policy, document it and keep `ci`/deploy aligned.
3. If runtime migration is desired, wire `prodMigrations: migrations` into the adapter.

### Environment variables are scattered and sometimes default to production-ish values

Evidence:

- `src/payload.config.ts:99`, `src/lib/db.ts:3`, `src/services/supabase.ts:3-4`, `src/services/mailchimp.ts:1-3`, `src/utilities/etsyClient.ts:121-129`, and several scripts read env directly.
- `scripts/seed-admin.ts:6-8` defaults admin credentials.
- `src/payload.config.ts:174` and `src/payload.config.ts:204` default `ETSY_SHOP_ID` to `25894791`.

Plan:

1. Create one server-only env module using `zod` for required and optional variables.
2. Split build-time public env, server runtime env, and script-only env.
3. Replace production-ish fallbacks with explicit dev defaults or required env failures.
4. Keep secrets out of client bundles by avoiding accidental imports into `'use client'` modules.

## Architecture and Maintainability Debt

### `payload.config.ts` is a mixed config/controller module

Evidence: `src/payload.config.ts` is 267 lines and includes core Payload config, admin config, storage/email config, custom endpoint handlers, OAuth flow, jobs access, and inline folders collection config.

Plan:

1. Move Etsy endpoints into `src/endpoints/etsy/*`.
2. Move storage/email builders into small config helper modules.
3. Move the inline `folders` collection to `src/collections/Folders.ts`.
4. Keep `payload.config.ts` as a composition root that imports prebuilt pieces.

### Etsy sync is too large and mixes transformation, API, persistence, and media download

Evidence: `src/utilities/syncEtsy.ts` is 464 lines and contains schemas, ports, sync orchestration, text cleanup, rich-text conversion, concrete Payload adapters, media download, and the public entrypoint.

Plan:

1. Split into `etsy/schemas.ts`, `etsy/sourceAdapter.ts`, `etsy/productStore.ts`, `etsy/mediaStorage.ts`, `etsy/transformListing.ts`, and `etsy/syncEngine.ts`.
2. Move `textToRichText` and description cleanup into pure functions with unit tests.
3. Add rate-limit and retry policy for Etsy fetches and media downloads.
4. Fix transaction binding: the current adapter opens a DB transaction but creates a new adapter using the same Payload instance without visibly passing transaction context into `payload.create/update`.

### Product listing routes are divergent

Evidence:

- `src/app/(frontend)/products/page.tsx:22-127` implements current product grid, filters, sorting, search params, and product DTO mapping.
- `src/app/(frontend)/products/page/[pageNumber]/page.tsx:20-87` uses `CollectionArchive`/`PageRange` and a different presentation path.

Plan:

1. Pick one canonical product archive experience.
2. Extract `queryProductsArchive()` and `toProductCardDTO()` helpers.
3. Make root and paginated routes share the same rendering components.
4. Decide whether pagination lives in query params (`/products?page=2`) or path segments (`/products/page/2`); avoid maintaining both behavior models.

### Client components are broader than needed

Evidence:

- Many files are marked `'use client'`, including high-level cards, media, quiz, admin widgets, search, pagination, filters, and form components.
- `src/components/Card/index.tsx:1-258` is a large client component combining card layout, product-specific quick view, post behavior, animation, and link behavior.
- `src/blocks/ScentQuiz/Component.tsx:1-399` is entirely client-side and imports animation/media/form logic.

Plan:

1. Split mostly-static markup into Server Components where possible.
2. Keep only interactive islands as client components: quick-view trigger/dialog, product filters, quiz state machine, form submit controls.
3. Avoid passing large Payload docs into client components; map them to narrow DTOs on the server.
4. Use dynamic imports for heavy optional interactions such as quick view and motion-heavy quiz screens.

### The quiz component is a maintenance hotspot

Evidence: `src/blocks/ScentQuiz/Component.tsx` contains quiz state, scoring, animated reveal, email capture, API submission, and result UI in one 399-line client component.

Plan:

1. Extract `useScentQuizState` for scoring/step transitions.
2. Extract presentational pieces: `QuestionStep`, `RevealStep`, `EmailGate`, `ResultStep`.
3. Move email submission to a Server Action or a typed client API helper.
4. Add tests for tie-breaking, missing scores, final answer inclusion, and failed email submission.

## Cleanup Sequence

### Phase 1: Stabilize and document current state

1. Commit or shelve unrelated worktree changes before large modernization.
2. Keep the current passing checks as the baseline.
3. Add a short developer workflow note for required commands:

```bash
pnpm install
pnpm payload generate:importmap
pnpm payload generate:types
pnpm run lint
pnpm exec tsc --noEmit
```

### Phase 2: Low-risk dependency maintenance

1. Remove dependencies already made unused by dead-code cleanup, especially `@radix-ui/react-tooltip` and `react-medium-image-zoom` if no imports remain.
2. Batch Payload `3.85.0 -> 3.85.1` packages together.
3. Batch Next/React patch updates.
4. Batch Radix patch/minor updates.
5. Leave `@vitejs/plugin-react 6` for a separate branch because it is the only major-version update.

### Phase 3: Remove deprecated-warning masking

1. Run all scripts without `NODE_OPTIONS=--no-deprecation`.
2. Capture warnings in `output/deprecation-warnings.txt`.
3. Fix warning sources or pin/document dependencies that still require suppression.
4. Remove suppression from normal scripts.

### Phase 4: Database and form modernization

1. Choose the single database adapter policy.
2. Replace or harden direct SQL in `submitForm`.
3. Add integration tests for form submission atomicity.
4. Validate migrations/deploy behavior and decide on `prodMigrations`.

### Phase 5: Etsy modernization

1. Add OAuth state storage and validation.
2. Split Etsy sync into smaller modules.
3. Add retry/rate-limit/error classification.
4. Add tests around token refresh, batch partial failures, media reuse, and product upsert.

### Phase 6: Frontend modernization

1. Consolidate product archive routes.
2. Split large client components.
3. Narrow DTOs passed from server to client.
4. Dynamically import heavy optional interactions.

## Verification Commands

Run these after each phase:

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm run test:int
pnpm run build
```

Run these after Payload config/admin/schema changes:

```bash
pnpm payload generate:importmap
pnpm payload generate:types
git diff -- src/app/'(payload)'/admin/importMap.js src/payload-types.ts src/migrations
```

Run these after dependency changes:

```bash
pnpm install
npm outdated
pnpm run lint
pnpm exec tsc --noEmit
pnpm run build
```

## Summary Priority List

1. Remove or diagnose `NODE_OPTIONS=--no-deprecation`.
2. Fix OAuth state validation.
3. Rationalize DB adapters and direct SQL form writes.
4. Remove unused packages from the previous dead-code cleanup.
5. Patch-update Payload, Next, React, and Radix in controlled batches.
6. Wire/document Payload migration policy.
7. Centralize env validation.
8. Split `payload.config.ts` endpoint/config responsibilities.
9. Split Etsy sync into focused modules.
10. Consolidate product listing routes and reduce broad client component usage.
