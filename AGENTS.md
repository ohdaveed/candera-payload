# AGENTS.md

This file preserves hard-earned context for AI agents working in this repo.

## Quick start

```bash
pnpm install && pnpm dev    # Start dev server at http://localhost:3000
pnpm build                  # Production build (runs next-sitemap postbuild)
pnpm start                  # Serve production build
```

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config in `eslint.config.mjs`) |
| `pnpm test:int` | Vitest integration tests (`tests/int/**/*.int.spec.ts`) — requires DB |
| `pnpm test:e2e` | Playwright E2E (`tests/e2e/`) — spawns dev server automatically |
| `pnpm test` | Int then E2E sequentially |
| `pnpm payload migrate:create` | Generate DB migration after schema change |
| `pnpm payload migrate` | Run pending migrations (required before prod deploy) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` from collections |
| `pnpm generate:importmap` | Regenerate Payload admin import map |
| `pnpm run ci` | CI deploy: `payload migrate && pnpm build` |

Run everything via `pnpm`. Node >=24.15.0 required.

## Architecture

**Payload CMS 3.x + Next.js 16** — both CMS backend and public website run in a single Next.js process. Payload is integrated via `withPayload` in `next.config.ts`.

### Route groups

- `src/app/(frontend)/` — Public website. `page.tsx` re-exports `[slug]` page defaulting to slug `home`. All pages statically generated via `generateStaticParams`.
- `src/app/(payload)/` — Admin panel at `/admin`, REST/GraphQL APIs at `/api`.

### Collections

`pages`, `posts`, `products` (Etsy-synced), `media` (Vercel Blob), `categories` (nested taxonomy), `users`, `folders` (virtual media org).

### Globals

`Header` and `Footer` — nav data fetched via `src/utilities/getGlobals.ts`, revalidated on change.

### Blocks (Layout Builder)

Pages and posts use a layout builder in `src/blocks/`. Each block has `config.ts` (fields) + `Component.tsx` (rendering). Available: `CallToAction`, `Content`, `MediaBlock`, `Archive`, `Form`, `Code`, `Banner`, `RelatedPosts`. Archive renders either `posts` or `products`.

### Etsy Integration

- `src/utilities/etsy.ts` — `fetchEtsy()` with `ETSY_API_KEY` + `ETSY_SHARED_SECRET` against `https://openapi.etsy.com/v3/application`.
- `src/utilities/syncEtsy.ts` — Upserts listings into `products`, downloads images into `media` (idempotent via `etsyImageId`).
- Triggered via authenticated GET `/api/sync-etsy` in `payload.config.ts`.

## Database & Migrations

Uses `@payloadcms/db-postgres` with `push: false` — migrations always required. `DATABASE_URL` env var (fallback: `POSTGRES_URL`). After schema change: `pnpm payload migrate:create`, commit migration, then migrations run on deploy via `pnpm run ci`.

Local Postgres via Docker Compose (port 54320). Set `POSTGRES_URL=postgres://postgres@localhost:54320/<dbname>` and match `POSTGRES_DB` in `docker-compose.yml`.

## Testing quirks

- **Integration tests** (`tests/int/`) use Vitest + jsdom, load `.env` via `dotenv/config` — need a real or mock DB connection. Run with `pnpm test:int`.
- **E2E tests** (`tests/e2e/`) use Playwright, auto-starts `pnpm dev` via `webServer` config. Run with `pnpm test:e2e`.
- Test helpers in `tests/helpers/`: `login.ts`, `seedUser.ts`.

## Key env vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` / `POSTGRES_URL` | Neon Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage |
| `PAYLOAD_SECRET` | JWT signing |
| `PREVIEW_SECRET` | Live preview URL signing |
| `CRON_SECRET` | Bearer token for Vercel cron jobs |
| `ETSY_API_KEY` / `ETSY_SHARED_SECRET` | Etsy Open API v3 |
| `SMTP_HOST/PORT/USER/PASS` | Optional email transport (falls back to `jsonTransport`) |

## Codegen & generated files

- `src/payload-types.ts` — auto-generated, never edit manually. Run `pnpm generate:types` after collection/field changes.
- `src/payload-generated-schema.ts` — auto-generated, also in ESLint ignores.
- Path alias `@/*` maps to `src/*`.
- `@payload-config` maps to `src/payload.config.ts`.

## Code style

- TypeScript strict mode, ES2022 target.
- Prettier (`.prettierrc.json`): single quotes, no semicolons, trailing commas, 100 print width.
- ESLint flat config (`eslint.config.mjs`): `eslint-config-next` rules, ignores `.next/` and generated files. Warnings for `@ts-*`, `any`, unused vars (prefixed with `_`).
- shadcn/ui components (`components.json`): style `default`, RSC enabled, CSS variables.
- Tailwind CSS v4 with `@tailwindcss/postcss` and `tw-animate-css`.
- ESLint uses a `fixCircular` helper to resolve circular plugin references in Next.js configs — don't remove it.

## Plugins

Configured in `src/plugins/index.ts`: redirects, nested-docs (categories), SEO, form-builder, search (posts only). Vercel Blob storage wired directly in `payload.config.ts`.

## On-demand revalidation

`afterChange` / `afterDelete` hooks in `src/collections/Pages/hooks/` and `src/collections/Posts/hooks/` call `revalidatePath` / `revalidateTag`. Redirects revalidated via `src/hooks/revalidateRedirects.ts`.

## Cron

`vercel.json` schedules `/api/payload-jobs/run` daily (`0 0 * * *`) for scheduled publishing via Payload jobs queue. Access controlled by CRON_SECRET bearer token.

## Packages to know

- Payload ecosystem: `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-vercel-blob`, `@payloadcms/email-nodemailer`.
- Plugins: `@payloadcms/plugin-form-builder`, `@payloadcms/plugin-nested-docs`, `@payloadcms/plugin-redirects`, `@payloadcms/plugin-search`, `@payloadcms/plugin-seo`.
- Next.js 16, React 19, TypeScript 6.
- Package manager: `pnpm` 10.33.
