# Code Quality Review: candera-payload

Scope: read-only review of the current worktree at `/home/ohdaveed/projects/candera-payload`.

Checks run:

- `./node_modules/.bin/tsc --noEmit --pretty false`: exit 0
- `./node_modules/.bin/vp lint .`: 0 warnings, 0 errors across 273 files
- AST line-length scan for large functions/components
- Targeted scans for `console`, `ts-expect-error`, `dangerouslySetInnerHTML`, env usage, generated/deleted code, and large modules

Note: the worktree was already dirty before this review, including deleted unused-code candidates and many modified files. This report reviews the current state and does not revert or edit source files.

## Highest Priority Findings

### 1. Quiz result calculation drops the final answer

Evidence:

- `src/blocks/ScentQuiz/Component.tsx:63` builds `newScores`.
- `src/blocks/ScentQuiz/Component.tsx:73` calls `setScores(newScores)`.
- `src/blocks/ScentQuiz/Component.tsx:78` immediately calls `deriveResult()`.
- `src/blocks/ScentQuiz/Component.tsx:42`-`61` derives from the old `scores` state captured in the callback.

Why it matters:

React state updates are asynchronous. On the last quiz step, the final answer is added to `newScores`, but the result is derived from the previous `scores` object. That can produce the wrong scent result.

Recommendation:

- Make result derivation a pure helper that accepts a score object and questions.
- In `handleOptionSelect`, call `deriveResultFromScores(newScores, questions)` before setting the reveal state.
- Add a unit test for a quiz where the final answer changes the winning profile.

Before:

```ts
setScores(newScores)
const derived = deriveResult()
```

After:

```ts
setScores(newScores)
const derived = deriveResultFromScores(newScores, questions)
```

### 2. A database credential is hardcoded in `package.json`

Evidence:

- `package.json:26` includes a full Neon PostgreSQL URL in `dump-public-schema:neon`.

Why it matters:

This is an operational and security smell. Even if the credential is rotated later, it trains contributors to put secrets in source-controlled scripts and makes local commands depend on one specific remote database.

Recommendation:

- Remove `dump-public-schema:neon`.
- Keep `dump-public-schema` only, reading from `DATABASE_URL`.
- If a convenience command is needed, use an env file outside Git or a documented `DATABASE_URL=... pnpm run dump-public-schema` workflow.
- Rotate that database credential if it has ever been committed or shared.

### 3. Form submission bypasses Payload and is only partially transactional

Evidence:

- `src/app/actions/submitForm.ts:3` imports the raw Neon client.
- `src/app/actions/submitForm.ts:20`-`24` inserts the parent submission row.
- `src/app/actions/submitForm.ts:28`-`37` inserts child rows in a later transaction.
- `src/lib/db.ts:3` asserts `process.env.DATABASE_URL!` at module load.

Why it matters:

If child-row insertion fails after the parent insert succeeds, the database can retain an orphan or incomplete submission. This also couples the app to Payload's generated SQL table names instead of Payload's collection API, which makes schema changes more fragile.

Recommendation:

- Prefer Payload's local API for `form-submissions` unless there is a measured reason to bypass it.
- If raw SQL stays, wrap parent and child inserts in the same transaction.
- Add env validation that fails with a clear message instead of relying on `DATABASE_URL!`.

### 4. Etsy OAuth `state` is generated but not persisted or verified

Evidence:

- `src/utilities/etsyClient.ts:150`-`151` generates an OAuth `state`.
- `src/payload.config.ts:221`-`239` handles the callback but only checks `code`, not `state`.

Why it matters:

The code looks like it has CSRF protection, but the callback does not validate it. That is worse than omitting it because future readers may assume the flow is protected.

Recommendation:

- Store the generated state in a signed, HTTP-only cookie or a short-lived server-side record.
- Validate `state` in `/etsy/oauth/callback` before exchanging the code.
- Encapsulate the OAuth endpoints in `src/endpoints/etsyOAuth.ts` so config wiring stays small.

### 5. Transaction abstraction in Etsy sync likely does not bind operations to the transaction

Evidence:

- `src/utilities/syncEtsy.ts:361`-`386` opens/commits/rolls back a DB transaction.
- `src/utilities/syncEtsy.ts:365` creates a new `ProductionProductStoreAdapter(this.payload)`.
- `src/utilities/syncEtsy.ts:343`-`358` performs `payload.update` / `payload.create` without passing a transaction identifier or request context.

Why it matters:

This abstraction reads as transactional, but the operations do not obviously run inside the opened transaction. If Payload requires a transaction ID or request context for transactional writes, this is a false safety boundary.

Recommendation:

- Confirm Payload's transaction API contract.
- Either pass the transaction context through every Payload operation, or remove the transaction wrapper and make failure behavior explicit.
- Add an integration test that forces an error after media creation/product update and verifies rollback behavior.

## Complexity and Refactoring Opportunities

### 6. `payload.config.ts` has too many responsibilities

Evidence:

- `src/payload.config.ts:40`-`267` defines admin UI, DB, collections, globals, storage, email, custom endpoints, OAuth handlers, job access, and startup logging in one module.
- Etsy endpoint handlers live inline at `src/payload.config.ts:166`-`243`.

Recommendation:

- Extract `src/config/admin.ts`, `src/config/email.ts`, `src/config/storage.ts`, and `src/endpoints/etsy.ts`.
- Keep `payload.config.ts` as composition only: imports plus `buildConfig({ ... })`.
- Move the top-level `PAYLOAD_SECRET` logging into env validation/bootstrap, not the config module.

### 7. Seed logic mixes destructive reset, fixture data, remote fetches, local files, products, pages, forms, and globals

Evidence:

- `src/endpoints/seed/index.ts:47`-`606` is a 560-line function.
- It clears collections at `src/endpoints/seed/index.ts:62`-`86`.
- It creates users/media/posts/products/forms/pages/globals in one flow.
- It fetches remote Payload demo images at `src/endpoints/seed/index.ts:119`-`132`.
- It reads local Candera image files at `src/endpoints/seed/index.ts:608`-`643`.

Recommendation:

- Split into named steps: `clearDatabase`, `seedUsers`, `seedMedia`, `seedPosts`, `seedProducts`, `seedForms`, `seedPages`, `seedGlobals`.
- Move fixture arrays to `src/endpoints/seed/fixtures/`.
- Make remote demo image fetching optional or replace it with local fixtures.
- Return a structured seed summary for tests and admin feedback.

### 8. The product listing routes are divergent duplicates

Evidence:

- `src/app/(frontend)/products/page.tsx:22`-`127` renders products with filters, `ProductGrid`, current styling, and query-string pagination.
- `src/app/(frontend)/products/page/[pageNumber]/page.tsx:20`-`87` renders a different archive UI with `CollectionArchive`, `PageRange`, different copy, no filter/sort handling, and path pagination.

Why it matters:

Two product index implementations will drift. The current UX, filtering, metadata, and pagination rules are split across two routes.

Recommendation:

- Choose one pagination model: query string (`/products?page=2`) or path (`/products/page/2`).
- Extract `queryProducts({ page, tag, sort })` and `ProductsIndexView`.
- Have both routes call the same query/view temporarily, then delete the older route if not needed.

### 9. Large client components combine state machines, API calls, animation, and markup

Evidence:

- `src/blocks/ScentQuiz/Component.tsx:23`-`397` is a 375-line client component.
- `src/components/Card/index.tsx:40`-`258` is a 219-line client component.
- `src/components/admin/GenerateCopyButton.tsx:22`-`252` is a 233-line admin client component.
- `src/components/ContactForm/index.tsx:30`-`199` is a 170-line client component.

Recommendation:

- For `ScentQuiz`, extract `useScentQuizState`, `QuizQuestionStep`, `QuizEmailStep`, and `QuizResult`.
- For `Card`, split product-card and post-card paths instead of branching heavily inside one component.
- For `GenerateCopyButton`, move request logic to a small client hook and extract `ToneSelector` and `SuggestionRows`.
- For `ContactForm`, use an `async` submit handler directly instead of nesting `const submit = async () => {}` inside a callback.

### 10. Environment access is scattered and untyped

Evidence:

- `src/payload.config.ts` reads `PAYLOAD_SECRET`, `POSTGRES_URL`, `DATABASE_URL`, blob, email, Etsy, and cron env values directly.
- `src/lib/db.ts:3` uses `process.env.DATABASE_URL!`.
- `src/services/mailchimp.ts:1`-`3` captures env values at module load.
- `src/services/supabase.ts:3`-`4` captures env values at module load.
- `src/utilities/etsyClient.ts:121`-`129` reads Etsy env values inside the client constructor.

Recommendation:

- Add `src/env/server.ts` with a typed validation schema.
- Separate required env (`PAYLOAD_SECRET`, database URL) from optional integrations (`MAILCHIMP_*`, `SUPABASE_*`, `BLOB_READ_WRITE_TOKEN`).
- Make optional integrations return explicit disabled states instead of warning from deep service code.

### 11. External service code needs clearer failure and retry boundaries

Evidence:

- `src/utilities/syncEtsy.ts:127`-`211` processes listings sequentially.
- `src/utilities/syncEtsy.ts:176`-`181` swallows image-sync failures and continues.
- `src/utilities/etsyClient.ts:260`-`263` swallows token-refresh failures and falls back to unauthenticated/credential-based request behavior.
- `src/services/mailchimp.ts:39`-`61` throws raw API response bodies.

Recommendation:

- Define retry policy, timeout policy, and failure classification for Etsy and Mailchimp.
- Return structured failures from sync, including image failures, instead of hiding them from the public `syncEtsyListings` return at `src/utilities/syncEtsy.ts:459`-`463`.
- Avoid silently changing authentication mode after token refresh failure.

### 12. Generated/template leftovers are still visible in production seed data

Evidence:

- `src/endpoints/seed/index.ts:41` uses generic categories: Technology, News, Finance, Design, Software, Engineering.
- `src/endpoints/seed/index.ts:545`-`556` adds footer links to Payload source/template pages.
- `package.json:2`-`4` still says `with-vercel-website` / Website template for Payload.

Recommendation:

- Rename package metadata to the project name.
- Replace template categories and footer links with Candera-specific data.
- Keep upstream/template links only in documentation, not seeded production-facing content.

## Lower-Risk Cleanup

- Replace repeated price formatting with a `formatCurrency` utility. Evidence: `src/components/Card/index.tsx:195`-`197` and `src/app/(frontend)/products/[slug]/page.tsx:161`-`164`.
- Move JSON-LD builders out of `ProductPage`. Evidence: `src/app/(frontend)/products/[slug]/page.tsx:55`-`88`.
- Remove or document `@ts-expect-error` suppressions. Evidence: `src/blocks/RenderBlocks.tsx:70`, `src/plugins/index.ts:34`.
- Keep raw `dangerouslySetInnerHTML` only for JSON-LD/theme bootstrap and wrap JSON-LD serialization in a helper for consistency. Evidence: `src/app/(frontend)/products/[slug]/page.tsx:92`-`99`, `src/providers/Theme/InitTheme/index.tsx:8`.
- Consider direct imports over broad/barrel imports in frequently used client components to keep bundles analyzable.

## Suggested Refactor Order

1. Fix the ScentQuiz final-answer bug and add a focused test.
2. Remove the hardcoded DB URL from `package.json` and rotate the credential if needed.
3. Move form submission onto Payload API or one SQL transaction.
4. Extract Etsy OAuth endpoints and add state verification.
5. Split `payload.config.ts` endpoint/config sections.
6. Consolidate product listing routes around one shared query/view.
7. Break down the largest client components.
8. Centralize server env validation.
