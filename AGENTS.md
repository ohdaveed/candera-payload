# AGENTS.md

This file preserves hard-earned context for AI agents working in this repo.

## Quick start

```bash
# Inject environment variables using pass-cli
pass-cli run --env-file .env -- pnpm dev    # Start dev server at http://localhost:3000
pass-cli run --env-file .env -- pnpm build  # Production build (runs next-sitemap postbuild)
pass-cli run --env-file .env -- pnpm start  # Serve production build
```

**Environment Variables:** This project uses `pass-cli` for secret management. The `.env` file contains `pass://` URIs. Do not overwrite `.env` with raw secrets; always use `pass-cli run --env-file .env -- <command>` to inject them at runtime.

## Commands

| Command                       | Purpose                                                               |
| ----------------------------- | --------------------------------------------------------------------- |
| `pnpm lint` / `pnpm lint:fix` | ESLint (flat config in `eslint.config.mjs`)                           |
| `pnpm test:int`               | Vitest integration tests (`tests/int/**/*.int.spec.ts`) — requires DB |
| `pnpm test:e2e`               | Playwright E2E (`tests/e2e/`) — spawns dev server automatically       |
| `pnpm test`                   | Int then E2E sequentially                                             |
| `pnpm payload migrate:create` | Generate DB migration after schema change                             |
| `pnpm payload migrate`        | Run pending migrations (required before prod deploy)                  |
| `pnpm generate:types`         | Regenerate `src/payload-types.ts` from collections                    |
| `pnpm generate:importmap`     | Regenerate Payload admin import map                                   |
| `pnpm run ci`                 | CI deploy: `payload migrate && pnpm build`                            |

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

**Production:** Neon Serverless Postgres via Vercel integration. `@payloadcms/db-postgres` with `push: false` — migrations always required. Connection string from `DATABASE_URL` (fallback: `POSTGRES_URL`). The Vercel Neon integration auto-provides a pooled connection string; the `@payloadcms/db-vercel-postgres` adapter activates when the URL is a Neon endpoint. `@neondatabase/serverless` is the runtime driver.

**Local:** Docker Compose Postgres (port 54320). Set `POSTGRES_URL=postgres://postgres@localhost:54320/<dbname>` and match `POSTGRES_DB` in `docker-compose.yml`. Localhost URLs bypass the Vercel adapter and use standard `@payloadcms/db-postgres` directly.

**Neon quirks:**

- Compute suspends after 5 min idle; first query after suspend has a cold-start penalty (~hundreds of ms)
- Pooled connections: append `-pooler` to the endpoint hostname in the connection string
- ILIKE queries use `pg_trgm`; ensure the extension is enabled if doing case-insensitive search at scale

**Migration workflow:** After schema change → `pnpm payload migrate:create` → commit migration file → run `pnpm run ci` in a controlled production-only pipeline. Vercel's build command intentionally runs `pnpm build` only; do not seed or migrate in preview builds.

## Testing quirks

- **Integration tests** (`tests/int/`) use Vitest + jsdom, load `.env` via `dotenv/config` — need a real or mock DB connection. Run with `pnpm test:int`.
- **E2E tests** (`tests/e2e/`) use Playwright, auto-starts `pnpm dev` via `webServer` config. Run with `pnpm test:e2e`.
- Test helpers in `tests/helpers/`: `login.ts`, `seedUser.ts`.

## pass-cli credential access

This project uses `pass-cli` (Proton Pass CLI) for secret management. Store the PAT
outside the repository and provide it at runtime via `PROTON_PASS_PERSONAL_ACCESS_TOKEN`.

**Available vaults:** `Google` (role: Owner)

**Session lifecycle:**

- Before any `pass-cli` command, verify session: `pass-cli info`
- If session expired: `pass-cli logout --force`, then re-login with PAT
- Isolated session dir: `export PROTON_PASS_SESSION_DIR="/tmp/pass-agent-$(whoami)-$(date +%s)"`
- Login: `PROTON_PASS_PERSONAL_ACCESS_TOKEN="..." pass-cli login`
- Always set `PROTON_PASS_AGENT_REASON` for `item view`, `item create`, `item update`, `item trash`, `item untrash`, `vault update`

**Fetching secrets:**

```bash
PROTON_PASS_AGENT_REASON="Why this item is needed" pass-cli item view \
  --vault-name "Google" \
  --item-title "Item Title" \
  [--field password]
```

**Quick commands:**

- `pass-cli vault list --output json` — list vaults
- `pass-cli share list --output json` — list shares/access grants
- `pass-cli item list --vault-name "Google" --output json` — list items in vault
- `pass-cli item view pass://SHARE_ID/ITEM_ID` — access by URI
- `pass-cli run --env-file .env -- <cmd>` — inject secrets into commands

## Key env vars

| Variable                              | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- |
| `DATABASE_URL` / `POSTGRES_URL`       | Neon Postgres connection string                          |
| `BLOB_READ_WRITE_TOKEN`               | Vercel Blob storage                                      |
| `PAYLOAD_SECRET`                      | JWT signing                                              |
| `PREVIEW_SECRET`                      | Live preview URL signing                                 |
| `CRON_SECRET`                         | Bearer token for Vercel cron jobs                        |
| `ETSY_API_KEY` / `ETSY_SHARED_SECRET` | Etsy Open API v3                                         |
| `SMTP_HOST/PORT/USER/PASS`            | Optional email transport (falls back to `jsonTransport`) |

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

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Accessibility — Contrast (NON-NEGOTIABLE)

Readability and contrast are top priorities. Every color used for text must meet **WCAG AA minimum** (4.5:1 for normal text, 3:1 for large text ≥18px or bold ≥14px).

### Candera color token contrast on `#f5f2ed` (vellum background)

| Token                  | Hex       | Ratio on vellum | Use for text?                        |
| ---------------------- | --------- | --------------- | ------------------------------------ |
| `candera-obsidian`     | `#141412` | ~16:1           | ✅ Yes — headings, body              |
| `candera-sage-text`    | `#5f6459` | ~5.2:1          | ✅ Yes — secondary text, eyebrows    |
| `candera-ember-strong` | `#a8502b` | ~5.5:1          | ✅ Yes — accents, links              |
| `candera-sage`         | `#7a8174` | ~3.7:1          | ❌ Never for text < 18px             |
| `candera-stone`        | `#dacbb8` | ~1.3:1          | ❌ Never for text — borders only     |
| `candera-ash`          | `#e2ddd6` | ~1.1:1          | ❌ Never for text — backgrounds only |

### On dark backgrounds (`#141412` obsidian)

| Usage                     | Minimum opacity | Notes                     |
| ------------------------- | --------------- | ------------------------- |
| `text-white/XX` body copy | `/80` minimum   | `/80` = ~11:1 on obsidian |
| `text-white/XX` captions  | `/70` minimum   | `/70` = ~9:1 on obsidian  |
| Never use                 | `/50` or below  | Fails AA                  |

### Rules

- **Never use `candera-stone` or `candera-ash` as text colors.** They exist for borders and backgrounds only.
- **Never use `candera-sage` for text smaller than 18px.** It only passes AA at large/bold sizes.
- **Always use `candera-sage-text` as the minimum for secondary/muted text** on light backgrounds.
- **Opacity-based white text on dark: minimum `/75`** for captions, `/80` for body.
- **Before writing any color class**, mentally check: is this text or decoration? If text, does it pass 4.5:1?

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->
