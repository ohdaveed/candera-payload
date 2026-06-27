# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> A detailed operational runbook already lives in `AGENTS.md` (pass-cli secret access, Etsy
> internals, Neon quirks). Read it for anything not covered here; this file is the high-level map.

## What this is

Candera is the storefront for an artisan candle studio (canderacandles.com), built on **Payload CMS
3.85 + Next.js 16 (App Router) + React 19**. The CMS backend and the public website run in a
**single Next.js process** — Payload is mounted via `withPayload` in `next.config.ts`. Data lives in
**Neon Postgres**; media in **Vercel Blob**. Products are synced from **Etsy**.

## Commands

Secrets are managed with `pass-cli` — the `.env` file holds `pass://` URIs, not raw values. Prefix
commands that need env vars with `pass-cli run --env-file .env --`. Run everything via `pnpm`
(pnpm@11.8.0, Node 24.x).

| Command                       | Purpose                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm dev`                    | Dev server at http://localhost:3000 (admin at `/admin`)                             |
| `pnpm build`                  | Production build (runs `next-sitemap` in `postbuild`)                               |
| `pnpm run ci`                 | What Vercel runs on deploy: `payload migrate && pnpm build`                         |
| `pnpm lint` / `pnpm lint:fix` | Lint via Vite+ (`vp lint`) — flat config in `eslint.config.mjs`                     |
| `pnpm test`                   | `test:int` then `test:e2e` sequentially                                             |
| `pnpm test:int`               | Vitest integration tests (`tests/int/**`) via `vp test` — **needs a DB connection** |
| `pnpm test:e2e`               | Playwright E2E (`tests/e2e/**`) — auto-starts a dev server                          |
| `pnpm payload migrate:create` | Generate a migration after a schema/field change                                    |
| `pnpm payload migrate`        | Apply pending migrations (required before every prod deploy)                        |
| `pnpm generate:types`         | Regenerate `src/payload-types.ts` after collection/field changes                    |
| `pnpm generate:importmap`     | Regenerate the Payload admin import map                                             |

Run a single integration test: `pnpm test:int -- tests/int/syncEtsy.int.spec.ts` (Vitest filter).

This repo uses **Vite+** (`vp`) as its toolchain for lint/test/format — `vp check` and `vp test`
format, lint, type-check, and test in one pass. Tooling is Oxlint/Oxfmt-based, Prettier-compatible.

## Architecture

### Route groups (`src/app/`)

- `(frontend)/` — public site. `page.tsx` re-exports the `[slug]` page defaulting to slug `home`;
  pages are statically generated via `generateStaticParams`. Also hosts sitemaps, `posts/`,
  `products/`, `how-to/`, `inner-circle/`, `contact/`, and the `next/` utility routes (preview,
  seed, and the admin `ai/generate-product-copy` route).
- `(payload)/` — admin panel at `/admin` plus REST/GraphQL APIs under `/api`.

### Payload config (`src/payload.config.ts`) is the spine

It wires every collection, global, plugin, the DB adapter, blob storage, email, and the Etsy
endpoints. When adding a collection/global/block, register it here.

- **Collections:** `pages`, `posts`, `products` (Etsy-synced), `media` (Vercel Blob),
  `categories` (nested taxonomy), `users`, `folders`, plus domain collections `briefs`, `quizzes`,
  `scentProfiles`, `documentation`, `howToGuides`, and `etsyTokens` (OAuth token store).
- **Globals:** `Header`, `Footer`, `SiteTheme`, `StudioInfo` — fetched via
  `src/utilities/getGlobals.ts`, revalidated on change.
- **Blocks (layout builder, `src/blocks/`):** each block = `config.ts` (fields) + `Component.tsx`
  (render). Pages/posts compose these; `RenderBlocks.tsx` dispatches. Includes domain blocks like
  `StorefrontHero`, `ScentQuiz`, `Testimonials`, `TheVessels`, `InnerCircleCTA`.

### Database adapter selection (non-obvious)

`src/utilities/databaseAdapter.ts` picks the adapter from the connection string at startup:
a `*.neon.tech` host uses `@payloadcms/db-vercel-postgres` (Neon serverless protocol); **any other
host** (local Postgres, CI service container) falls back to `@payloadcms/db-postgres`. The same
config therefore runs everywhere. `DATABASE_URI` takes precedence over `POSTGRES_URL` — the
Vercel/Neon integration injects `POSTGRES_URL` and can override it with a stale credential, so set
`DATABASE_URI` explicitly in production. Both adapters use `push: false`, so **migrations are always
required** — never rely on schema push.

### Etsy integration

- `src/lib/etsy.ts` — client-safe link helpers. `etsyListingUrl()` guards against placeholder IDs:
  anything below `MIN_REAL_ETSY_LISTING_ID` (10M) resolves to the shop page, not a dead listing.
- `src/utilities/etsyClient.ts` / `syncEtsy.ts` — fetches Etsy Open API v3 listings, upserts into
  `products`, and downloads images into `media` idempotently (keyed on `etsyImageId`).
- Endpoints in `src/endpoints/etsy.ts` (registered in payload config): authenticated `GET
/api/sync-etsy`, OAuth init/callback, and vacation-mode toggle. Requires `ETSY_SHOP_ID`
  (no default — throws if unset).

### AI product copy

`src/app/(frontend)/next/ai/generate-product-copy/route.ts` + `src/lib/ai/product-copy.ts` generate
product descriptions via Claude through the **Vercel AI Gateway** (`ai` SDK v6). On Vercel this is
OIDC-provided; locally set `AI_GATEWAY_API_KEY`.

### Revalidation & cron

Collection `afterChange`/`afterDelete` hooks call `revalidatePath`/`revalidateTag` for on-demand
ISR. `vercel.json` schedules `/api/payload-jobs/run` daily for the Payload jobs queue (scheduled
publishing), gated by `CRON_SECRET` as a bearer token.

## Conventions & gotchas

- **Generated files — never edit by hand:** `src/payload-types.ts` and
  `src/payload-generated-schema.ts`. Regenerate with `pnpm generate:types` after schema changes.
- **Path aliases:** `@/*` → `src/*`; `@payload-config` → `src/payload.config.ts`.
- **Style:** TS strict, ES2022. Prettier (`.prettierrc.json`): single quotes, no semicolons,
  trailing commas, 100-col. shadcn/ui (`components.json`) + Tailwind CSS v4.
- **Migration workflow:** schema change → `pnpm payload migrate:create` → commit the migration file.
  Vercel's `pnpm run ci` applies migrations on every deploy (preview + production). **Do not seed in
  preview builds** — seeding is destructive.
- **Seeding** is destructive (overwrites local data). Trigger from the admin dashboard, or use the
  scripts in `scripts/` (`seed-db.ts`, `reseed.ts`, etc.).
- **Local DB:** Docker Compose Postgres on port 54320; set `POSTGRES_URL` to a localhost URL so the
  standard adapter is used. Neon compute suspends after ~5 min idle (cold-start penalty on first
  query); use `-pooler` endpoints for pooled connections.
