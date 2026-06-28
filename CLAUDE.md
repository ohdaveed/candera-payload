# CLAUDE.md

Guidance for Claude / AI assistants working in this repository. This is the
canonical entry point; deeper references live in `AGENTS.md` (operational
playbook + secret handling), `docs/ARCHITECTURE.md` (system diagrams), and
`docs/CONTEXT.md` (domain vocabulary).

## What this is

**Candera** is a botanical candle storefront (canderacandles.com). A single
**Next.js 16 (App Router)** process serves both the public website and the
**Payload CMS 3.85** admin/backend — Payload is mounted into Next via
`withPayload` in `next.config.ts`. Commerce inventory is synced from **Etsy**
into Payload, and product copy is generated with **Claude (Haiku 4.5)** via the
AI gateway.

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Radix), Framer Motion
- **CMS / backend:** Payload CMS 3.85.x, Lexical rich text
- **DB:** Postgres — Neon (Vercel) in prod, Docker Postgres locally
- **Media:** Vercel Blob
- **External:** Etsy Open API v3, Anthropic/Claude (AI gateway), FormSubmit.co (form delivery)
- **Runtime:** Node `24.x`, package manager **pnpm 11.8** (`pnpm-workspace.yaml` present)

## Quick start

This project uses **`pass-cli`** (Proton Pass) for secrets. `.env` holds
`pass://` URIs, not raw values. Inject them at runtime — never overwrite `.env`
with plaintext secrets.

```bash
pass-cli run --env-file .env -- pnpm dev    # dev server at http://localhost:3000
pass-cli run --env-file .env -- pnpm build  # prod build (+ next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm start  # serve prod build
```

See `AGENTS.md` → "pass-cli credential access" for session lifecycle, vault
access, and the full secret-fetch flow before touching credentials.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Next dev server (CMS + storefront); admin at `/admin` |
| `pnpm build` / `pnpm start` | Production build (runs `next-sitemap` in `postbuild`) / serve |
| `pnpm run ci` | What Vercel runs on deploy: `payload migrate && pnpm build` |
| `pnpm lint` / `pnpm lint:fix` | Lint via `vp lint` (Vite+ / Oxlint over `src/` + configs) |
| `pnpm test` | `test:int` then `test:e2e` sequentially |
| `pnpm test:int` | Vitest integration (`tests/int/**/*.int.spec.ts`) — needs DB |
| `pnpm test:e2e` | Playwright E2E (`tests/e2e/`) — auto-spawns dev server |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` from collections |
| `pnpm generate:importmap` | Regenerate Payload admin import map |
| `pnpm payload migrate:create` | Create a migration after a schema change |
| `pnpm payload migrate` | Apply pending migrations |
| `scripts/local-build.sh` | Reproduce the CI/Vercel build locally |

Run a single integration test: `pnpm test:int -- tests/int/syncEtsy.int.spec.ts` (Vitest filter).

> Tooling note: `AGENTS.md` documents a **Vite+ (`vp`)** layer — `pnpm lint`
> and `pnpm test:int` shell out to `vp`. Use `vp check`/`vp test` when iterating
> and `vp install` after pulling.

## Architecture

### Route groups (`src/app/`)

- **`(frontend)/`** — public storefront, mostly React Server Components.
  - `[slug]` → CMS pages (home = `home` slug, statically generated via `generateStaticParams`), block-driven layout
  - `posts` / `posts/[slug]`, `products` / `products/[slug]`, `how-to/`
  - `contact` (→ `submitForm` server action), `inner-circle`, `search`, `(sitemaps)`
  - `next/` utility routes (preview, seed) incl. `next/ai/generate-product-copy/route.ts` — JWT-auth AI copy endpoint (Claude Haiku 4.5 via `gateway('anthropic/claude-haiku-4-5')`)
- **`(payload)/`** — admin panel at `/admin`, REST + GraphQL at `/api`
- **`actions/`** — server actions (`submitForm.ts`)
- **`api/webhooks/`** — e.g. Vercel deploy webhook

### `src/payload.config.ts` is the spine

It wires every collection, global, plugin, the DB adapter, blob storage, email,
and the Etsy endpoints. When adding a collection/global/block, register it here.

**Collections (`src/collections/`):** `Folders`, `Pages`, `Posts`, `Products`
(Etsy-synced), `Media` (Vercel Blob), `Categories` (nested taxonomy), `Users`,
`EtsyTokens` (OAuth token store), `Briefs`, `Quizzes`, `ScentProfiles`,
`Documentation`, `HowToGuides`.

> The older `AGENTS.md`/`GEMINI.md` lists a smaller set — `payload.config.ts`
> is the source of truth; the scent/quiz/docs collections above are newer.

**Globals (`src/`):** `Header`, `Footer`, `SiteTheme`, `StudioInfo` — each has a
`config.ts` and `hooks/` for revalidation. Read via `src/utilities/getGlobals.ts`.

**Blocks — layout builder (`src/blocks/`):** pages/posts compose a block array
rendered by `RenderBlocks.tsx`. Each block = `config.ts` (fields) +
`Component.tsx`. Available: `ArchiveBlock` (posts or products), `Banner`,
`CallToAction`, `Code`, `Content`, `Form`, `InnerCircleCTA`, `MediaBlock`,
`RelatedPosts`, `ScentQuiz` (client), `StorefrontHero`, `Testimonials`,
`TheVessels`. Heroes live separately in `src/heros/` (High/Medium/Low impact + PostHero).

### Plugins (`src/plugins/index.ts`)

`redirects` (pages, posts), `nested-docs` (categories), `seo`, `form-builder`,
`search` (posts only). Vercel Blob storage is wired directly in
`payload.config.ts` (only when a valid `vercel_blob_rw_` token is present).

### Database adapter selection (non-obvious)

`src/utilities/databaseAdapter.ts` picks the adapter from the connection string
at startup: a `*.neon.tech` host uses `@payloadcms/db-vercel-postgres` (Neon
serverless protocol); **any other host** (local Postgres, CI service container)
falls back to `@payloadcms/db-postgres`. The same config therefore runs
everywhere. `DATABASE_URI` takes precedence over `POSTGRES_URL` — the Vercel/Neon
integration injects `POSTGRES_URL` and can override it with a stale credential,
so set `DATABASE_URI` explicitly in production. Both adapters use `push: false`,
so **migrations are always required** — never rely on schema push.

### Etsy sync engine

Hexagonal (ports/adapters) design — domain logic decoupled from client, product
store, and media storage so it can run in-memory under test.
- `src/lib/etsy.ts` — client-safe link helpers. `etsyListingUrl()` guards against placeholder IDs: anything below `MIN_REAL_ETSY_LISTING_ID` (10M) resolves to the shop page, not a dead listing.
- `src/utilities/etsyClient.ts` — OAuth 2.0 client, sliding-window token refresh, `TokenRepository` seam
- `src/utilities/syncEtsy.ts` — `EtsySyncEngine.sync()`; Zod-validates listings (title must contain "candle"), cleans → Lexical, slugifies, upserts transactionally, dedupes images via `etsyImageId`
- Endpoints (`src/endpoints/etsy.ts`, registered in payload config): authenticated `GET /api/sync-etsy`, `/etsy/oauth/init`, `/etsy/oauth/callback`, `/etsy/set-vacation`. Requires `ETSY_SHOP_ID` (no default — throws if unset).
- CLI: `scripts/sync-etsy.ts`

### AI product copy

`src/app/(frontend)/next/ai/generate-product-copy/route.ts` +
`src/lib/ai/product-copy.ts` generate product descriptions via Claude through the
**Vercel AI Gateway** (`ai` SDK v6). On Vercel this is OIDC-provided; locally set
`AI_GATEWAY_API_KEY`.

### Revalidation & forms

- `src/utilities/revalidate.ts` — revalidation engine with `CacheBusterPort` seam; `afterChange`/`afterDelete` hooks call `revalidatePath`/`revalidateTag` for on-demand ISR. Redirects via `redirectRevalidateHooks`.
- Form submissions: `submitForm` server action writes through Payload Local API → `processFormSubmission` `afterChange` hook forwards to **FormSubmit.co** via `sendToFormSubmit` (`src/services/formsubmit.ts`), wrapped in `Promise.allSettled`. Same hook fires for admin-created submissions. Target inbox is `FORMSUBMIT_EMAIL` (defaults to `studio@canderacandles.com`).
- Search: `beforeSyncWithSearch` indexes published posts into a `search` collection; `src/lib/queries/search.ts` queries it via the Payload Local API (`payload.find` with `contains` filters over title/slug/meta) — not raw SQL.

## Database & migrations

- **Prod:** Neon Serverless Postgres. `push: false` — **migrations are always required**. Connection from `DATABASE_URI` (preferred) or `POSTGRES_URL`.
- **Local:** Docker Compose Postgres on port `54320`. Set `POSTGRES_URL=postgres://postgres@localhost:54320/<dbname>`; localhost bypasses the Vercel adapter.
- **Workflow:** schema change → `pnpm payload migrate:create` → commit the migration file (`src/migrations/`). Vercel runs `pnpm run ci` on every deploy, so migrations apply automatically (preview + production). **Do not seed in preview builds.**
- **Seeding** is destructive (overwrites local data). Trigger from the admin dashboard, or use the scripts in `scripts/` (`seed-db.ts`, `reseed.ts`, etc.).
- Neon: compute suspends after ~5 min idle (cold-start penalty on first query); use `-pooler` host for pooled connections; ILIKE search is accelerated by `pg_trgm` (GIN trigram) indexes.

## Generated files — never edit by hand

- `src/payload-types.ts` — run `pnpm generate:types` after collection/field changes
- `src/payload-generated-schema.ts` — auto-generated (in lint ignores)
- Path aliases: `@/*` → `src/*`; `@payload-config` → `src/payload.config.ts`

## Testing

- **Integration** (`tests/int/`): Vitest + jsdom, loads `.env` via `dotenv/config`, needs a DB. Helpers in `tests/helpers/` (`login.ts`, `seedUser.ts`). Existing suites cover Etsy client/sync/URL, revalidation, product copy, scent quiz, forms, search, the DB adapter, and API.
- **E2E** (`tests/e2e/`): Playwright auto-starts `pnpm dev` via `webServer`. Covers admin + frontend flows.
- New features should ship with an int or E2E test mirroring these patterns.

## Code style & conventions

- TypeScript strict, ES2022; Prettier (`.prettierrc.json`): single quotes, **no semicolons**, trailing commas, 100-width.
- ESLint flat config (`eslint.config.mjs`, `eslint-config-next`); ignores `.next/` and generated files. Unused vars prefixed `_`. Keep the `fixCircular` helper.
- shadcn/ui (`components.json`): `default` style, RSC, CSS variables. UI primitives in `src/components/ui/`.
- Tailwind v4 via `@tailwindcss/postcss` + `tw-animate-css`; theme is CSS-variable-driven in `src/app/(frontend)/globals.css`. Fonts: Fraunces, DM Sans, EB Garamond, Geist Mono.
- Follow Payload's **deep module / port-adapter** pattern already established in `etsyClient`, `syncEtsy`, and `revalidate` — keep domain logic decoupled from DB/IO behind interfaces.

## Cron & jobs

`vercel.json` schedules `/api/payload-jobs/run` daily (`0 0 * * *`) for scheduled
publishing via Payload's jobs queue. Access is gated by the `CRON_SECRET` bearer
token (see `jobs.access.run` in `payload.config.ts`).

## Key environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URI` / `POSTGRES_URL` | Neon Postgres connection string (`DATABASE_URI` wins) |
| `PAYLOAD_SECRET` | JWT signing (required; startup throws without it) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (`vercel_blob_rw_…`; required in prod) |
| `PREVIEW_SECRET` | Live-preview URL signing |
| `CRON_SECRET` | Bearer token for Vercel cron / jobs |
| `ETSY_API_KEY` / `ETSY_SHARED_SECRET` / `ETSY_REDIRECT_URI` / `ETSY_SHOP_ID` | Etsy Open API v3 + OAuth (`ETSY_SHOP_ID` required) |
| `AI_GATEWAY_API_KEY` | AI gateway key for product copy (local only; OIDC on Vercel) |
| `FORMSUBMIT_EMAIL` | Inbox for form submissions forwarded to FormSubmit.co (defaults to `studio@canderacandles.com`) |
| `SMTP_HOST/PORT/USER/PASS` | Email transport (falls back to `jsonTransport`) |
| `EMAIL_FROM_ADDRESS` / `EMAIL_FROM_NAME` | Default sender |

See `.env.example` for the full list.

## Working agreements

- Run via `pnpm` (never raw `npm`/`yarn`). Use `pass-cli run --env-file .env --` for anything needing secrets.
- After a schema/field change: `pnpm generate:types` **and** `pnpm payload migrate:create`, then commit both.
- Verify before pushing with `scripts/local-build.sh` (or `pnpm run ci`); prod deploys go from `main`.
- Don't commit secrets, don't edit generated files, don't seed against preview/prod DBs.
- When the prose docs (`AGENTS.md`, `GEMINI.md`, `README.md`) disagree with code, trust `src/payload.config.ts` and the code, and update the docs.
