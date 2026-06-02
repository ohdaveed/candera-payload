# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Inject environment variables using pass-cli
pass-cli run --env-file .env -- pnpm dev                          # Start dev server (http://localhost:3000)
pass-cli run --env-file .env -- pnpm build                        # Build for production (runs next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm start                        # Serve production build
pnpm lint                         # Run ESLint
pnpm lint:fix                     # Auto-fix lint issues

pass-cli run --env-file .env -- pnpm test                         # Run all tests (integration then E2E)
pass-cli run --env-file .env -- pnpm test:int                     # Vitest integration tests (tests/int/**/*.int.spec.ts)
pass-cli run --env-file .env -- pnpm test:e2e                     # Playwright E2E tests (tests/e2e/, requires dev server)

pass-cli run --env-file .env -- pnpm payload migrate:create       # Create a new DB migration after schema changes
pass-cli run --env-file .env -- pnpm payload migrate              # Run pending migrations (required before prod deploy)
pnpm generate:types               # Regenerate src/payload-types.ts from collections
pnpm generate:importmap           # Regenerate Payload admin import map
```

**Environment Variables:** This project uses `pass-cli` for secret management. The `.env` file contains `pass://` URIs. Do not overwrite `.env` with raw secrets; always use `pass-cli run --env-file .env -- <command>` to inject them at runtime.

The CI deploy command is `pnpm run ci` which runs `payload migrate && pnpm build`.

## Architecture Overview

This is a **Payload CMS 3.x + Next.js 16 monorepo** — both the CMS backend and the public website run in a single Next.js process. Payload is integrated via `withPayload` in `next.config.ts`.

### Route Groups

- `src/app/(frontend)/` — Public Next.js website. The home page (`/`) re-exports the `[slug]` page template defaulting to slug `home`. All pages are statically generated via `generateStaticParams`.
- `src/app/(payload)/` — Payload admin panel at `/admin` and REST/GraphQL APIs at `/api`.

### Collections

| Slug | Purpose |
|------|---------|
| `pages` | Layout-builder pages with draft/schedule support |
| `posts` | Blog posts with layout builder, indexed by search plugin |
| `products` | Etsy-synced product catalog (see Etsy integration below) |
| `media` | Uploads stored in Vercel Blob; includes `etsyImageId` for idempotent sync |
| `categories` | Nested taxonomy used by posts and products |
| `users` | Auth-enabled admin users |
| `folders` | Virtual folder organisation for media |

### Globals

`Header` and `Footer` — nav data fetched via `src/utilities/getGlobals.ts`, revalidated on change.

### Blocks (Layout Builder)

Pages and posts use a layout builder defined in `src/blocks/`. Each block has a `config.ts` (Payload field definition) and a `Component.tsx` (React rendering). Available blocks: `CallToAction`, `Content`, `MediaBlock`, `Archive`, `Form`, `Code`, `Banner`, `RelatedPosts`. The `Archive` block can render either `posts` or `products`.

### Etsy Integration

- `src/utilities/etsy.ts` — Base `fetchEtsy()` using `ETSY_API_KEY` + `ETSY_SHARED_SECRET` headers against `https://openapi.etsy.com/v3/application`.
- `src/utilities/syncEtsy.ts` — Upserts Etsy listings into the `products` collection and downloads listing images into `media` (idempotent via `etsyImageId`).
- Triggered via the authenticated GET endpoint `/api/sync-etsy` defined in `payload.config.ts`.

### Database & Migrations

Uses `@payloadcms/db-postgres` with `push: false` (migrations always required). The `DATABASE_URL` env var (fallback: `POSTGRES_URL`) points to a Neon serverless Postgres instance. After any schema change:
1. `pnpm payload migrate:create` — generates a new migration file in `src/migrations/`
2. Commit the migration alongside the config change
3. On deploy, `pnpm payload migrate` runs automatically via the `ci` script

### Plugins

Configured in `src/plugins/index.ts`: redirects, nested-docs (categories), SEO, form-builder, and search (posts only). Vercel Blob storage is wired directly in `payload.config.ts`.

### Revalidation

On-demand ISR: `afterChange` / `afterDelete` hooks in `src/collections/Pages/hooks/` and `src/collections/Posts/hooks/` call `revalidatePath` / `revalidateTag`. Redirects are revalidated via `src/hooks/revalidateRedirects.ts`.

### Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` / `POSTGRES_URL` | Neon Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |
| `PAYLOAD_SECRET` | JWT signing secret |
| `PREVIEW_SECRET` | Live preview URL signing |
| `CRON_SECRET` | Bearer token for Vercel cron jobs |
| `ETSY_API_KEY` / `ETSY_SHARED_SECRET` | Etsy Open API v3 credentials |
| `SMTP_HOST/PORT/USER/PASS` | Optional email transport (falls back to `jsonTransport`) |

### Type Generation

`src/payload-types.ts` is auto-generated — never edit it manually. Run `pnpm generate:types` after collection/field changes. The `@` path alias maps to `src/`.

### Cron

`vercel.json` schedules `/api/payload-jobs/run` daily (`0 0 * * *`) for scheduled publishing via the Payload jobs queue.
