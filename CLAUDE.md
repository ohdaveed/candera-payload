# CLAUDE.md

Guidance for Claude / AI assistants working in this repository. This is the canonical entry point; deeper references live in `AGENTS.md` (operational playbook + secret handling), `docs/ARCHITECTURE.md` (system diagrams), and `docs/CONTEXT.md` (domain vocabulary).

## What this is

**Candera** is a botanical candle storefront (canderacandles.com). A single **Next.js 16 (App Router)** process serves both the public website and the **Payload CMS 3.85** admin/backend. Payload is mounted into Next via `withPayload` in `next.config.ts`.

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui (Radix), Framer Motion
- **CMS / Backend:** Payload CMS 3.85.x, Lexical rich text
- **Database:** Postgres — Neon (Vercel) in prod, native Postgres 18 locally
- **Media:** Vercel Blob
- **External APIs:** Etsy Open API v3, Anthropic/Claude (AI gateway), FormSubmit.co (form delivery)
- **Runtime & Tools:** Node `24.x`, **pnpm 11.8** (`pnpm-workspace.yaml`), and **Vite+ (`vp`)** unified toolchain.

> [!IMPORTANT]
> **Secrets Management:** This project uses **`pass-cli`** (Proton Pass) for secrets. `.env` holds `pass://` URIs, not raw values. Inject them at runtime — **never overwrite `.env` with plaintext secrets**. See `AGENTS.md` for the full secret-fetch flow.

## Quick start

```bash
# Start dev server at http://localhost:3000 (CMS + storefront)
pass-cli run --env-file .env -- pnpm dev

# Prod build (+ next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm build

# Serve prod build
pass-cli run --env-file .env -- pnpm start
```

## Toolchain & Commands

We use a mix of `pnpm` for Next.js/Payload scripts and **Vite+ (`vp`)** for unified linting, formatting, and testing.

| Command                       | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `vp install`                  | Run after pulling remote changes and before getting started. |
| `vp check`                    | Format, lint (Oxlint), and type check changes.               |
| `vp test`                     | Run all tests (Vitest + Playwright).                         |
| `pnpm dev`                    | Next dev server (admin at `/admin`).                         |
| `pnpm build`                  | Production build (runs `next-sitemap` in `postbuild`).       |
| `pnpm run ci`                 | Vercel CI command: `payload migrate && pnpm build`.          |
| `pnpm generate:types`         | Regenerate `src/payload-types.ts` from collections.          |
| `pnpm generate:importmap`     | Regenerate Payload admin import map.                         |
| `pnpm payload migrate:create` | Create a migration after a schema change.                    |
| `pnpm payload migrate`        | Apply pending migrations.                                    |
| `scripts/local-build.sh`      | Reproduce the CI/Vercel build locally.                       |

## Architecture

### Route groups (`src/app/`)

- **`(frontend)/`** — Public storefront, mostly React Server Components.
  - `[slug]` → CMS pages (`home` slug statically generated via `generateStaticParams`), block-driven layout.
  - `posts`, `products`, `how-to` and their slug variations.
  - `contact` (→ `submitForm` server action), `inner-circle`, `search`, `(sitemaps)`.
  - `next/` utility routes (preview, seed). Incl. `next/ai/generate-product-copy/route.ts` — JWT-auth AI copy endpoint via `gateway('anthropic/claude-haiku-4-5')`.
- **`(payload)/`** — Admin panel at `/admin`, REST + GraphQL at `/api`.
- **`actions/`** — Server actions (e.g., `submitForm.ts`).
- **`api/webhooks/`** — Vercel deploy webhooks.

### `src/payload.config.ts` is the spine

It wires every collection, global, plugin, the DB adapter, blob storage, email, and the Etsy endpoints. **When adding a collection/global/block, register it here.**

- **Collections (`src/collections/`):** `Folders`, `Pages`, `Posts`, `Products` (Etsy-synced), `Media` (Vercel Blob), `Categories` (nested taxonomy), `Users`, `EtsyTokens`, `Briefs`, `Quizzes`, `ScentProfiles`, `Documentation`, `HowToGuides`.
- **Globals (`src/`):** `Header`, `Footer`, `SiteTheme`, `StudioInfo`. Read via `src/utilities/getGlobals.ts`.
- **Blocks (`src/blocks/`):** Pages/posts compose a block array rendered by `RenderBlocks.tsx`. Available: `ArchiveBlock`, `Banner`, `CallToAction`, `Code`, `Content`, `Form`, `InnerCircleCTA`, `MediaBlock`, `RelatedPosts`, `ScentQuiz`, `StorefrontHero`, `Testimonials`, `TheVessels`. (Heroes live separately in `src/heros/`).

### Plugins (`src/plugins/index.ts`)

Configures `redirects`, `nested-docs`, `seo`, `form-builder`, and `search`. Vercel Blob storage is wired directly in `payload.config.ts` (requires `vercel_blob_rw_` token).

### Database adapter selection

`src/utilities/databaseAdapter.ts` picks the adapter from the connection string at startup:

- `*.neon.tech` host uses `@payloadcms/db-vercel-postgres` (Neon serverless protocol).
- **Any other host** (local Postgres, CI container) falls back to `@payloadcms/db-postgres`.
- `DATABASE_URI` takes precedence over `POSTGRES_URL`. Set `DATABASE_URI` explicitly in production to avoid stale Vercel overriding.

> [!WARNING]
> Both adapters use `push: false`, so **migrations are always required** — never rely on schema push.

### Etsy sync engine (`src/utilities/syncEtsy.ts`)

Hexagonal (ports/adapters) design decoupling domain logic from client and storage.

- Zod-validates listings (title must contain "candle"), cleans → Lexical, slugifies, upserts transactionally, dedupes images via `etsyImageId`.
- Endpoints (in `src/endpoints/etsy.ts`): `/api/sync-etsy`, `/etsy/oauth/init`, `/etsy/oauth/callback`, `/etsy/set-vacation`.
- CLI: `scripts/sync-etsy.ts`

### Revalidation & forms

- **Revalidation:** `src/utilities/revalidate.ts` uses `afterChange`/`afterDelete` hooks to call `revalidatePath`/`revalidateTag` for on-demand ISR.
- **Forms:** `submitForm` server action writes through Payload Local API → `processFormSubmission` hook forwards to **FormSubmit.co** (target inbox is `FORMSUBMIT_EMAIL`).
- **Search:** `beforeSyncWithSearch` indexes published posts into a `search` collection; queried via Local API, not raw SQL.

## Database & migrations

- **Prod:** Neon Serverless Postgres.
- **Local:** Native Postgres 18 on the default port `5432`. Set `POSTGRES_URL=postgres://postgres@localhost:5432/<dbname>`.
- **Workflow:** Schema change → `pnpm payload migrate:create` → commit the migration file (`src/migrations/`). CI applies migrations automatically.
- **Seeding:** Destructive (overwrites local data). Use scripts in `scripts/` (`seed-db.ts`, `reseed.ts`). **Do not seed in preview builds.**

> [!TIP]
> **Neon quirks:** Compute suspends after ~5 min idle (cold-start penalty on first query). Use `-pooler` host for pooled connections. ILIKE search uses `pg_trgm` indexes.

## Testing

- **Integration (`tests/int/`):** Vitest + jsdom. Needs a DB connection. Run with `vp test` (or `pnpm test:int`). Test helpers in `tests/helpers/`.
- **E2E (`tests/e2e/`):** Playwright auto-starts dev server.
- New features should ship with an int or E2E test.

## Code style & conventions

- **TypeScript:** Strict, ES2022.
- **Prettier:** Single quotes, **no semicolons**, trailing commas, 100-width.
- **Linting:** ESLint flat config (`eslint.config.mjs`). Unused vars prefixed `_`. Keep the `fixCircular` helper.
- **Styling:** Tailwind v4 (`@tailwindcss/postcss`) + `tw-animate-css`. CSS-variable-driven theme in `globals.css`. shadcn/ui with `default` style, RSC.
- **Architecture:** Follow Payload's deep module / port-adapter pattern — keep domain logic decoupled from DB/IO behind interfaces.

## Key environment variables

| Variable                                       | Purpose                                                               |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URI` / `POSTGRES_URL`                | Neon Postgres connection string (`DATABASE_URI` wins).                |
| `PAYLOAD_SECRET`                               | JWT signing (required; startup throws without it).                    |
| `BLOB_READ_WRITE_TOKEN`                        | Vercel Blob (required in prod).                                       |
| `PREVIEW_SECRET`                               | Live-preview URL signing.                                             |
| `CRON_SECRET`                                  | Bearer token for Vercel cron / jobs (`vercel.json` schedules daily).  |
| `ETSY_API_KEY` / `_SHARED_SECRET` / `_SHOP_ID` | Etsy Open API v3 + OAuth (`ETSY_SHOP_ID` required).                   |
| `AI_GATEWAY_API_KEY`                           | AI gateway key for product copy (local only).                         |
| `FORMSUBMIT_EMAIL`                             | Inbox for form submissions (defaults to `studio@canderacandles.com`). |

## Working agreements (AI Checklist)

- [ ] **Use Vite+ (`vp`)** for formatting/linting/testing (`vp check`, `vp test`), and `pnpm` for execution/building. Use `pass-cli run --env-file .env --` when executing commands that need secrets.
- [ ] **Generate types AND migrations:** After a schema/field change, run _both_ `pnpm generate:types` and `pnpm payload migrate:create`, then commit both.
- [ ] **Verify builds:** Verify locally with `scripts/local-build.sh` before pushing.
- [ ] **Generated files:** Never edit `src/payload-types.ts` or `src/payload-generated-schema.ts` by hand.
- [ ] **Trust the code:** When prose docs (`AGENTS.md`, `GEMINI.md`, `README.md`) disagree with code, trust `src/payload.config.ts` and the code, and update the docs accordingly.
