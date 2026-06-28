# AGENTS.md

This file preserves hard-earned context for AI agents working in this repo.

## Quick Start & CLI Workflows

Before running any script or starting the server, you must verify your Proton Pass session and run commands through the environment injector.

### Environment & Secret Management

This project uses `pass-cli` (Proton Pass CLI) for secret management. The `.env` file contains `pass://` URIs instead of raw values.

- **Never** overwrite `.env` with raw secrets.
- Always run commands using: `pass-cli run --env-file .env -- <command>`
- **Vault name:** `Google` (role: Owner)
- **Session Lifecycle:** Before executing any `pass-cli` command, verify your session status with `pass-cli info`. If expired, log out using `pass-cli logout --force` and log back in with `PROTON_PASS_PERSONAL_ACCESS_TOKEN`. Set `PROTON_PASS_AGENT_REASON` for any item actions.

```bash
# Inject secrets and run commands
pass-cli run --env-file .env -- vp dev     # Start dev server at http://localhost:3000
pass-cli run --env-file .env -- vp build   # Production build
pass-cli run --env-file .env -- vp check   # Lint, format, and typecheck
pass-cli run --env-file .env -- vp test    # Run integration + E2E tests
```

### Vite+ Toolchain (`vp`)

We use **Vite+** (`vp`), a unified toolchain wrapping Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task.

- Do not use raw `npm` or `pnpm` for validation if `vp` is configured.
- Run `vp help` or `vp <command> --help` to explore commands.
- Run `vp install` after pulling remote changes.
- Run `vp env doctor` to troubleshoot environment issues.

### Command Reference Table

Run all command executions via `pnpm` or `vp`. Node >=24.15.0 is required.

| Command                       | Purpose                                                                           |
| :---------------------------- | :-------------------------------------------------------------------------------- |
| `vp check`                    | Formats, lints (Oxlint), and typechecks changes.                                  |
| `vp test`                     | Runs integration tests and E2E tests.                                             |
| `pnpm test:int`               | Vitest integration tests (`tests/int/**/*.int.spec.ts`) — requires DB connection. |
| `pnpm test:e2e`               | Playwright E2E tests (`tests/e2e/`) — starts dev server automatically.            |
| `pnpm payload migrate:create` | Generates a new DB migration file after a schema change.                          |
| `pnpm payload migrate`        | Runs pending migrations (required before production deployment).                  |
| `pnpm generate:types`         | Regenerates `src/payload-types.ts` from collections.                              |
| `pnpm generate:importmap`     | Regenerates Payload CMS admin import map.                                         |
| `pnpm run ci`                 | CI deploy script: `payload migrate && pnpm build`.                                |

## Architecture

**Payload CMS 3.x + Next.js 16** — both CMS backend and public website run in a single Next.js process. Payload is integrated via `withPayload` in `next.config.ts`.

### Route Groups

- `src/app/(frontend)/` — Public website. `page.tsx` re-exports `[slug]` page defaulting to `home`. All pages are statically generated via `generateStaticParams`.
- `src/app/(payload)/` — CMS Admin panel at `/admin`, REST/GraphQL APIs at `/api`.

### Collections & Content Structure

- **Collections:** `pages`, `posts`, `products` (Etsy-synced), `media` (Vercel Blob), `categories` (nested taxonomy), `users`, `folders` (virtual media organization).
- **Globals:** `Header` and `Footer` (fetched via `src/utilities/getGlobals.ts` and revalidated on change).
- **Blocks (Layout Builder):** Pages and posts use a layout builder in `src/blocks/`. Each block has `config.ts` (fields) + `Component.tsx` (rendering). Available blocks: `CallToAction`, `Content`, `MediaBlock`, `Archive`, `Form`, `Code`, `Banner`, `RelatedPosts`.

### Etsy Integration

- `src/utilities/etsy.ts` — Calls Etsy OpenAPI v3 (`https://openapi.etsy.com/v3/application`) using `ETSY_API_KEY` and `ETSY_SHARED_SECRET`.
- `src/utilities/syncEtsy.ts` — Upserts listings into `products`, downloads images into `media` (idempotent via `etsyImageId`).
- Triggered via authenticated GET `/api/sync-etsy` in `payload.config.ts`.

## Database & Migrations

**Production:** Neon Serverless Postgres via Vercel integration. `@payloadcms/db-postgres` with `push: false` (migrations always required). Connection string is `DATABASE_URI` (fallback: `POSTGRES_URL`). The `@payloadcms/db-vercel-postgres` adapter activates when using Neon endpoints.

- **Neon connection pool:** Append `-pooler` to the endpoint hostname in the connection string to use pooled connections.
- **Compute suspend:** Neon compute suspends after 5 minutes of idle time. Expect a cold-start penalty (~hundreds of ms) on first connection.
- **Case-insensitive search:** ILIKE queries utilize `pg_trgm`. Ensure this extension is enabled if performing case-insensitive searches at scale.

**Local Development:** Uses Docker Compose Postgres on port 54320. Set `POSTGRES_URL=postgres://postgres@localhost:54320/<dbname>` and match `POSTGRES_DB` in `docker-compose.yml`. Standard `@payloadcms/db-postgres` is used for localhost URLs.

**Migration workflow:**

1.  Make schema change.
2.  Run `pnpm payload migrate:create` to generate the migration file.
3.  Commit migration file.
4.  _Note:_ Vercel's build runs `pnpm run ci` (`payload migrate && pnpm build`), so migrations are applied automatically on every deploy. Do not seed in preview builds.

## Testing Quirks

- **Integration tests** (`tests/int/`): Run via `pnpm test:int`. Uses Vitest + jsdom, loading `.env` via `dotenv/config`. A real or mock DB connection is required.
- **E2E tests** (`tests/e2e/`): Run via `pnpm test:e2e`. Uses Playwright and automatically starts the dev server via `webServer` config.
- **Test Helpers:** Check `tests/helpers/` for `login.ts` and `seedUser.ts` utilities.

## Ignore Boundaries

LLM agents must ignore and avoid indexing, reading, or traversing the following files and directories:

- **Build & Dependencies:** `.next/`, `node_modules/`, `dist/`, `build/`
- **Lockfiles:** `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`
- **Payload CMS & Databases:** `*.db`, `*.sqlite`, `*.sqlite3`, `postgres-data/`, `media/`
- **Cache & Vercel:** `.vercel/`, `.turbo/`, `.cache/`
- **Environment & Secrets:** `.env*` (never read or write raw credentials)
- **System & Git:** `.git/`, `.DS_Store`, `*.log`

## Agent Guidelines & Constraints

Always adhere to these guidelines to ensure reliability, security, and performance.

### 1. Documentation Lookup (context7)

Use the `ctx7` CLI to fetch documentation whenever you deal with libraries, frameworks, SDKs, APIs, or cloud services (even well-known ones like Next.js, Payload CMS, Prisma, Express, Tailwind, etc.):

```bash
# 1. Resolve library ID (e.g., Next.js -> /vercel/next.js)
npx ctx7@latest library "Next.js" "<your query>"

# 2. Fetch specific documentation
npx ctx7@latest docs <libraryId> "<your query>"
```

- _Note:_ Do not run more than 3 commands per query. Never fall back to training data or general web searches if `ctx7` can provide up-to-date documentation.

### 2. Verification Before Completion

Before declaring a task done:

- Run `vp check` to ensure all formatting, linting (Oxlint), and TypeScript typechecks pass.
- Run `vp test` to verify that both integration and E2E tests pass.
- _Never_ commit changes that break the build or tests.

### 3. Codegen & Autogenerated Files

- **Do not edit** `src/payload-types.ts` or `src/payload-generated-schema.ts` manually.
- After editing collections/fields, run `pnpm generate:types` and check in the generated changes.

### 4. Performance & Revalidation

- On-demand ISR must use `revalidateTag(tag, 'max')` on collection hook updates (`src/utilities/revalidate.ts`).
- Avoid adding custom `clamp()` expressions in CSS. Use standard Tailwind spacing/font-size tokens.
- Focus states must never use `outline-none` unless paired with `focus-visible:ring-*`. Use the mapped brand color `--ring` (`var(--candera-ember-strong)`) via `ring-ring`.
