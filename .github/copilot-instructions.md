# Copilot Instructions — Candera Payload

## Commands

```bash
# Dev / build
pass-cli run --env-file .env -- pnpm dev          # dev server at http://localhost:3000
pass-cli run --env-file .env -- pnpm build        # prod build (runs next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm run ci       # what Vercel runs: payload migrate && pnpm build

# Lint
pnpm lint                # vp lint (Vite+ / Oxlint)
pnpm lint:fix

# Tests
pnpm test:int            # Vitest integration tests (needs DB)
pnpm test:e2e            # Playwright E2E (auto-spawns dev server)
pnpm test                # int then e2e sequentially

# Run a single integration test
pnpm test:int -- tests/int/syncEtsy.int.spec.ts

# Code generation (always run after schema/field changes)
pnpm generate:types       # regenerates src/payload-types.ts
pnpm generate:importmap   # regenerates Payload admin import map

# Migrations (required after any schema change)
pnpm payload migrate:create   # create migration file
pnpm payload migrate          # apply pending migrations
```

## Architecture

**Single-process Payload CMS 3.85 + Next.js 16.** `withPayload` in `next.config.ts` mounts the CMS into the Next.js app. Admin lives at `/admin`; REST/GraphQL at `/api`.

### Route groups (`src/app/`)

- `(frontend)/` — public storefront (RSCs). `page.tsx` re-exports `[slug]` defaulting to slug `home`. All pages statically generated.
- `(payload)/` — admin panel and CMS API routes.
- `next/` — utility routes: live preview, seed, and `next/ai/generate-product-copy/` (Claude Haiku 4.5 via Vercel AI Gateway).

### Collections (`src/collections/`)

`Pages`, `Posts`, `Products` (Etsy-synced), `Media` (Vercel Blob), `Categories` (nested), `Users`, `EtsyTokens`, `Briefs`, `Quizzes`, `ScentProfiles`, `Documentation`, `HowToGuides`, `Folders`.

`src/payload.config.ts` is the source of truth — consult it, not docs, when the collection list matters.

### Globals (`src/*/config.ts`)

`Header`, `Footer`, `SiteTheme`, `StudioInfo`. Read via `src/utilities/getGlobals.ts`; revalidated via `afterChange`/`afterDelete` hooks.

### Blocks — layout builder (`src/blocks/`)

Pages/posts compose a `layout` block array rendered by `RenderBlocks.tsx`. Each block = `config.ts` (Payload fields) + `Component.tsx` (React). Available: `ArchiveBlock`, `Banner`, `CallToAction`, `Code`, `Content`, `Form`, `InnerCircleCTA`, `MediaBlock`, `RelatedPosts`, `ScentQuiz`, `StorefrontHero`, `Testimonials`, `TheVessels`. Heroes live in `src/heros/`.

## Key Conventions

### Secrets — always use pass-cli

`.env` contains `pass://` URIs, not raw values. Prefix every command that needs secrets:

```bash
pass-cli run --env-file .env -- <command>
```

Never overwrite `.env` with plaintext secrets.

### Database adapter selection

`src/utilities/databaseAdapter.ts` auto-selects the adapter:

- `*.neon.tech` hostname → `@payloadcms/db-vercel-postgres` (Neon serverless)
- everything else (local Postgres, CI) → `@payloadcms/db-postgres`

`DATABASE_URI` takes precedence over `POSTGRES_URL`. Both adapters use `push: false` — **migrations are always required, never push schema.**

### Migration workflow

After any collection/field change:

1. `pnpm payload migrate:create`
2. `pnpm generate:types`
3. Commit both the migration file (`src/migrations/`) and the updated `src/payload-types.ts`.

Vercel runs `pnpm run ci` on every deploy, which applies migrations automatically.

### Generated files — never edit by hand

- `src/payload-types.ts` — run `pnpm generate:types`
- `src/payload-generated-schema.ts` — auto-generated

### Port/adapter pattern

Domain logic is decoupled from I/O via interface seams:

- `src/utilities/revalidate.ts` — `CacheBusterPort` interface with `NextCacheBusterAdapter` for production and injectable mocks for tests.
- `src/utilities/syncEtsy.ts` — `EtsySyncEngine` takes `EtsyClientPort`, `ProductStorePort`, and `MediaStorePort` — all swappable for in-memory implementations in tests.

Follow this pattern when adding new integrations.

### Etsy sync

- Listings **must** contain `"candle"` in the title (Zod-validated) to be processed.
- Images are deduplicated by `etsyImageId`.
- Trigger: authenticated `GET /api/sync-etsy`, or `scripts/sync-etsy.ts`.
- Etsy link helper `etsyListingUrl()` guards against placeholder IDs below `MIN_REAL_ETSY_LISTING_ID` (10M) — resolves to shop page instead of dead link.

### Revalidation

`afterChange`/`afterDelete` hooks in `Pages`, `Posts`, and redirects call `revalidatePath`/`revalidateTag` via `src/utilities/revalidate.ts`.

### Form submissions

`submitFormAction` server action → Payload Local API → `processFormSubmission` `afterChange` hook → `sendToFormSubmit` (`src/services/formsubmit.ts`) → FormSubmit.co. Target inbox: `FORMSUBMIT_EMAIL` (defaults to `studio@canderacandles.com`).

### Search

`src/lib/queries/search.ts` queries the `search` collection via the Payload Local API (`payload.find` with `contains` filters). Not raw SQL. Only `posts` and `products` are indexed.

### Code style

- TypeScript strict, ES2022
- Prettier: **single quotes, no semicolons**, trailing commas, 100-char print width
- ESLint flat config (`eslint.config.mjs`), `eslint-config-next`. The `fixCircular` helper in the ESLint config resolves circular plugin references — do not remove it.
- Unused vars prefixed with `_`
- Tailwind CSS v4 — theme is CSS-variable-driven in `src/app/(frontend)/globals.css`
- shadcn/ui components in `src/components/ui/`

### Path aliases

- `@/*` → `src/*`
- `@payload-config` → `src/payload.config.ts`

### Testing setup

- Integration tests (`tests/int/**/*.int.spec.ts`): Vitest + jsdom. `vitest.setup.ts` loads `.env` and falls back `DATABASE_URL` → `DATABASE_URI` → `POSTGRES_URL`.
- E2E tests (`tests/e2e/`): Playwright auto-starts `pnpm dev` via `webServer`.
- Test helpers: `tests/helpers/login.ts`, `tests/helpers/seedUser.ts`.
- Do not seed against preview/prod DBs.

### Vercel cron

`vercel.json` schedules `POST /api/payload-jobs/run` daily. Access gated by `CRON_SECRET` bearer token.
