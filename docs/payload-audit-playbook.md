# Payload Convention-Audit Playbook

A repeatable workflow for keeping **candera-payload** aligned with idiomatic Payload conventions,
using **Context7** as the canonical API authority and the **payload-website-starter** template as
the convention reference.

> **Status of this repo vs. the starter.** candera-payload is *ahead* of the official
> `payload-website-starter`, not behind it. candera runs Payload **3.85.1** / Next **16.2.7** and
> extends the template with Products + Etsy sync, Quizzes, ScentProfiles, HowToGuides, the
> SiteTheme global, a rule-based revalidation engine, and a full Vitest/Playwright suite. The
> starter runs Payload **3.82.1** with only the base collections (Pages, Posts, Media, Categories,
> Users) and **no Products**. Consequence: **the starter is a reference for idiomatic *shape and
> convention*, never a source to copy code from.** When the two disagree on an API, **Context7
> wins** (it is version-matched to 3.85).

---

## Section A — How to fetch Payload docs via Context7

**Preferred path: the `ctx7` CLI.** This matches the global rule in `~/.claude/rules/context7.md`
(CLI over MCP/web search for library docs). Confirmed working: `ctx7` v0.5.3 via `npx`, credentials
at `~/.config/context7/credentials.json`.

### Resolved library IDs (verified — do not re-guess)

| Library ID | Use for | Notes |
|---|---|---|
| `/payloadcms/payload` | Core API & framework | 5,603 snippets, High reputation, benchmark 83.58 |
| `/payloadcms/payload/v3.85.0` | **Default** — version-matched to candera's 3.85.1 | Use this pin so docs match the installed API |
| `/payloadcms/website` | Template-shaped conventions (mirrors the starter) | Use when confirming "what the template does" |

### Procedure (max 3 commands per question)

```bash
# 1. (Optional) resolve a library if you don't already have an ID above
npx ctx7@latest library "Payload" "<focused question>"

# 2. Fetch version-matched docs — this is the default call
npx ctx7@latest docs /payloadcms/payload/v3.85.0 "<focused question>"

# 3. Implement or validate from the returned docs — not from memory
```

**Fallback (CLI rate-limited):** the connected `claude.ai Context7` MCP — `resolve-library-id`
then `query-docs`. If you hit a quota error, run `npx ctx7@latest login` or set `CONTEXT7_API_KEY`;
do **not** silently fall back to training data.

**When to fetch:** before validating or changing any collection, global, block, field, hook,
access rule, or plugin idiom. Fetch *before* writing, not after an error.

---

## Section B — payload-website-starter as the golden reference

Path: `/home/ohdaveed/projects/payload-website-starter` (an additional working directory).

Diff candera against these canonical reference files:

| Convention | Starter reference file |
|---|---|
| Collection shape (dir-per-collection + `hooks/`, drafts+autosave, `defaultPopulate`) | `src/collections/Pages/index.ts` + `src/collections/Pages/hooks/` |
| Block registration (blockType → component map) | `src/blocks/RenderBlocks.tsx` |
| Block schema (`slug`, `interfaceName`) | `src/blocks/*/config.ts` |
| Access idioms | `src/access/{anyone,authenticated,authenticatedOrPublished}.ts` |
| Revalidation hook (honors `context.disableRevalidate`, handles publish↔draft + slug-change) | `src/collections/Pages/hooks/revalidatePage.ts` |
| Plugin wiring | `src/plugins/index.ts` |
| Global caching | `src/utilities/getCachedGlobal.ts` |

**Rule:** only *convention/shape* transfers from starter → candera. candera's extra features and
newer version mean code is **not** copied 1:1.

---

## Section C — The whole-repo convention audit

Run each dimension as: **check candera → compare to the starter reference → confirm the canonical
idiom via Context7.** Record findings in the output template at the end.

### 1. Collection file-structure consistency
- **Check:** candera mixes single-file collections (`src/collections/Products.ts`) with dir-based
  ones (`src/collections/Pages/index.ts`, `Posts/index.ts`, `Users/`). Decide on one convention.
- **Starter ref:** dir-per-collection with a `hooks/` subdir (`src/collections/Pages/`).
- **Context7:** `npx ctx7@latest docs /payloadcms/payload/v3.85.0 "collection config file structure and hooks organization"`

### 2. Naming consistency
- **Check:** singular `Products` vs plural `Posts`/`Pages`. Flag mismatches in `slug`, folder, and
  exported const names.
- **Starter ref:** consistent collection naming across `src/collections/`.
- **Context7:** `... "collection slug naming conventions singular vs plural"`

### 3. Block registration integrity
- **Check:** every block listed in a collection's `blocks` array must (a) appear in
  `src/blocks/RenderBlocks.tsx`, and (b) have a generated type from its `interfaceName`. Sweep all
  candera blocks for drift (orphan configs, unmapped blockTypes, stale map entries).
- **Starter ref:** `src/blocks/RenderBlocks.tsx` (the blockType → component map).
- **Context7:** `... "blocks field interfaceName RenderBlocks blockType mapping"`

### 4. Access-control idiom
- **Check:** is `authenticatedOrPublished` (and friends) used consistently — as an access
  *function* vs a condition object — across all collections?
- **Starter ref:** `src/access/authenticatedOrPublished.ts`.
- **Context7:** `... "access control function read authenticatedOrPublished published status"`

### 5. Revalidation correctness
- **Check:** candera centralizes revalidation in `src/utilities/revalidate.ts` (rule-based engine).
  Confirm every wired collection honors `req.context.disableRevalidate` and handles publish↔draft
  transitions and slug changes — matching the starter's per-hook guarantees.
- **Starter ref:** `src/collections/Pages/hooks/revalidatePage.ts`.
- **Context7:** `... "afterChange hook revalidatePath revalidateTag context disableRevalidate"`

### 6. `generate:types` freshness
- **Check:** `src/payload-types.ts` is committed and matches the live config.
- **Command:** `pnpm generate:types` then `git diff --stat src/payload-types.ts` — a non-empty diff
  is a finding (types are stale / not regenerated after a schema change).

### 7. Plugins config sanity
- **Check:** candera `src/plugins/index.ts` (redirects, nested-docs, SEO, form-builder, search)
  matches starter wiring patterns; verify search indexes the intended collections.
- **Starter ref:** `src/plugins/index.ts`.
- **Context7:** `... "plugins seoPlugin searchPlugin formBuilderPlugin configuration"`

### 8. Startup env validation
- **Check:** `src/payload.config.ts` validates core secrets but not Etsy-related env vars; missing
  Etsy config currently fails at call time, not startup. Note as a finding (severity: low).

### 9. `CLAUDE.md` presence
- **Check:** candera has `AGENTS.md`/`GEMINI.md` but no `CLAUDE.md`. Recommend adding one that can
  reference this playbook. (Recommendation only — not an audit failure.)

### Output template

| # | Dimension | File(s) | Divergence | Canonical idiom (Context7 / starter cite) | Severity |
|---|---|---|---|---|---|
| 1 | … | … | … | … | high/med/low |

---

## Section D — Verification

Confirm the tooling this playbook depends on actually works:

```bash
# Context7 access returns real version-matched docs
npx ctx7@latest docs /payloadcms/payload/v3.85.0 "collections config"

# Audit mechanics are runnable in candera (read-only to source)
pnpm generate:types          # types freshness (dimension 6)
pnpm lint                    # convention/style baseline
pnpm test:int                # revalidation + core logic still green
```

---

## Scope notes

This document is the **playbook only**. Running the audit, filling the findings table, and applying
any code changes (collection restructuring, naming fixes, adding a `CLAUDE.md`, etc.) are deliberate
**separate steps** — not performed by authoring this file.
