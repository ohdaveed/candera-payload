---
name: candera-payload
description: Coding conventions and patterns specific to the candera-payload repo (file naming, exports, test patterns, commit style, schema-change checklist). Use when writing or reviewing code in this repository, alongside the root CLAUDE.md.
metadata:
  origin: project
---

# candera-payload Development Patterns

This skill captures repo-specific patterns that complement (not duplicate) the root `CLAUDE.md`. Read `CLAUDE.md` first for architecture, toolchain, and env vars.

## File naming

- Payload collections: **PascalCase** (`src/collections/Products.ts`, `src/collections/HowToGuides.ts`).
- Utilities, hooks, lib code: **camelCase** (`src/hooks/populateAuthors.ts`, `src/lib/formatPrice.ts`).
- Next.js route segments: **kebab-case**, per App Router convention (`src/app/(frontend)/next/ai/generate-field/route.ts`).

## Imports

- Alias imports: `@/` for `src/*`, `@payload-config` for `src/payload.config.ts` — see `tsconfig.json` paths.

## Exports

- Collections, globals, blocks, and utility modules: **named exports** (`export const Products: CollectionConfig = {...}`).
- Next.js special files (`page.tsx`, `layout.tsx`, `route.ts`) **require default exports** — that's a framework constraint, not a style violation. Don't "fix" them to named exports.

## Testing

- Test files are suffixed `*.spec.ts` (lightweight) or `*.int.spec.ts` (integration, needs a DB connection) under `tests/int/` — **not** `*.test.*`.
- E2E specs live in `tests/e2e/` (Playwright).
- Run via `vp test` (everything), or targeted: `pnpm test:int`, `pnpm test:e2e`.
- Integration specs need real secrets via `pass-cli run --env-file .env --`, or inline `KEY=test` values for DB-free specs that only need the process to boot (see existing `Bash(...)` entries in `.claude/settings.local.json` for the pattern).

## Commit messages

- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Feature branches off `main`.

## Schema changes

- Every field/collection change needs **both** `pnpm generate:types` and `pnpm payload migrate:create`, committed together.

## MCP access

- `.mcp.json` (repo root) registers the live Payload MCP server (`POST /api/mcp`). Once `PAYLOAD_MCP_API_KEY` is set locally (`pnpm create-mcp-key`), prefer its tools over ad hoc Local API scripts for reading/writing Products, Posts, Pages, Forms, etc.
