# Owner Usage Guide — Design Spec

Date: 2026-06-26 (rev. 2). Repo: candera-payload (Payload 3.85.1 / Next 16.2.7).

## Purpose

The site owner is the non-technical proprietor of Candera, an artisan candle studio that has
historically sold through Etsy. She now operates a full Payload-based website + admin and needs help
**using** it. This guide explains how to run the new site and how it differs from a plain Etsy shop:
the website is where she tells the brand story, writes the journal, and shapes the look.

She owns all four editing areas confirmed in brainstorming: product copy, blog/journal posts,
homepage/pages (layout blocks), and site settings/theming.

## Scope decision (rev. 2)

- **Front-end content is untouched.** Products, pages, posts, media, quizzes — all her real site
  content stays exactly as is. This work touches **only the `documentation` collection** (the admin
  help guides) and supporting tooling.
- **Admin help content is replaced wholesale.** The owner has not yet learned the admin or made any
  edits to the help entries, so there is nothing to preserve. The seed/refresh script **replaces**
  the `documentation` entries rather than skip-if-exists. Simple and safe given no owner edits exist.

## Non-goals

- Not a developer reference (CLAUDE.md / AGENTS.md cover that).
- No screenshots in v1 — text + precise sidebar paths only (seed content is text; screenshots rot).
- No schema changes and no new `documentation.category` options.
- Does not document order/inventory/checkout — those stay on Etsy.
- **Does not document vacation mode** — see "Vacation mode" below.

## Background: consolidating two competing doc systems

Two doc systems exist today and overlap:

- `src/endpoints/seed/admin-docs.ts` — 4 entries, developer-tone, **wired into the destructive full
  seed** (`seed/index.ts:270`), uses typed `lexicalHelpers`, has `category` + `order`.
- `scripts/seed-docs.ts` — 10 entries, genuinely **non-technical owner tone**, idempotent
  (skip-if-exists), **unwired** (no `package.json` script, no imports), inline Lexical builders, has
  `order` but **no `category`**.

Running both yields 14 overlapping entries. This spec **collapses them into one canonical module**,
using `seed-docs.ts`'s non-technical content as the base (superior tone/coverage), and **deletes both
old systems**.

## Deliverables

### 1. Standalone starter — `docs/owner-guide-getting-started.md`

The only piece readable **before** logging in. Markdown, printable to PDF:

- How to reach the admin (`/admin`).
- Where her login is kept — a **pointer only; no real credentials in the repo**.
- Core mental model: *"The website is where you tell the story, write your journal, and shape the
  brand. Orders, inventory, and checkout stay on Etsy."*
- A one-line map to the in-admin guide entries.

### 2. Canonical in-admin entries — `documentation` collection

Records surfaced at **Admin → Resources**, authored with `@/utilities/lexicalHelpers` plus a new
**required** `createNumberedList` helper. Content is migrated from `seed-docs.ts`, refined: typed
helpers, `category` added to every entry, blocks coverage expanded, vacation mode removed, plus two
new entries (Brand Look, developer reset).

Owner-facing entries (shown on the dashboard), with their existing slugs reused for idempotency:

| order | Title | Category | slug | Notes |
|---|---|---|---|---|
| 1 | Welcome to Your Dashboard | CMS Usage | `welcome-to-candera` | Orientation + collections/globals map. |
| 2 | Drafts, Publishing, and Saving | Publishing Workflow | `drafts-and-publishing` | Draft vs published, preview, unpublish. |
| 3 | Editing Your Pages | CMS Usage | `managing-pages` | **Expanded** — all 10 layout blocks (see below). |
| 4 | Managing Your Products | CMS Usage | `managing-products` | Tabs, add/edit, images, hide temporarily. |
| 5 | Writing Journal Posts | Publishing Workflow | `writing-posts` | Editor, images, categories. |
| 6 | Uploading and Managing Images | CMS Usage | `managing-media` | Alt text, folders, attaching. |
| 7 | Editing Your Navigation and Footer | Design & Theming | `navigation-and-footer` | Header/Footer globals; keeps the "globals go live instantly, no draft" warning. |
| 8 | Your Brand Look: Theme & Studio Info | Design & Theming | `brand-look-settings` | **New** — Site Theme + Studio Info globals. |
| 9 | Managing the Scent Quiz | CMS Usage | `managing-scent-quiz` | Quiz + Scent Profiles, scoring. |
| 10 | Etsy Integration | Etsy Integration | `etsy-integration` | Token/connection; defers technical bits to the developer. |
| 11 | Using the Demo Content | CMS Usage | `using-demo-content` | TUTORIAL/PRACTICE items; how to delete. |

Developer-only entry (hidden from the dashboard, see Dashboard change):

| order | Title | Category | slug | Notes |
|---|---|---|---|---|
| 12 | For Your Developer: Resetting Demo Data | Seeding & Data | `developer-reset-demo-data` | **New** — the destructive seed/reset, clearly developer-only, warning intact. |

#### Entry #3 — full layout-block coverage

`Pages.ts` configures ten blocks; the entry must cover all of them, not the five `seed-docs.ts`
listed: **StorefrontHero, TheVessels, CallToAction, Content, MediaBlock, Archive, FormBlock,
Testimonials, InnerCircleCTA, ScentQuiz.**

### Vacation mode (removed — evidence)

The only vacation code is `src/endpoints/etsy.ts:75`, a `/etsy/set-vacation` endpoint that POSTs a
**hardcoded `is_vacation: false`**. There is no global field, no admin UI toggle, and it can only
turn vacation *off*. There is nothing for the owner to operate, so vacation mode is **not
documented** in the owner guide. (A real owner-facing vacation toggle would be a separate feature,
noted as a future follow-up.)

## Delivery mechanism

A single canonical module — `src/endpoints/seed/owner-docs.ts` — exports:

- the entry array (title, slug, order, `category`, `content` via `lexicalHelpers`), and
- `seedOwnerDocs(payload)` with **replace semantics**: delete all existing `documentation` records,
  then create the canonical set. (The `documentation` collection holds only help guides, so a scoped
  wipe-and-reseed of that collection is safe and matches "replace all admin content.")

Consumed two ways:

- **Destructive full seed** — `seed/index.ts` calls `seedOwnerDocs(payload)` in place of the old
  `seedAdminDocs(payload)` at line ~270.
- **Production refresh** — new `scripts/seed-owner-guide.ts` (thin wrapper: `getPayload({ config })`,
  `seedLogger`, calls `seedOwnerDocs`). Safe to run on prod: it replaces only the `documentation`
  collection; **no front-end content is touched**.

### Deletions

- `src/endpoints/seed/admin-docs.ts` (old 4-entry technical set) — deleted; import + call in
  `seed/index.ts` updated to `owner-docs`.
- `scripts/seed-docs.ts` (old 10-entry inline script) — deleted; its content lives on, migrated into
  `owner-docs.ts` with typed helpers + categories.

## Dashboard component change

`src/components/BeforeDashboard/index.tsx:29` currently queries:

```ts
payload.find({ collection: 'documentation', limit: 5, sort: 'order', depth: 0 })
```

With 11 owner entries this hides most of them, and could surface the developer reset entry. Change to
exclude the developer category and show all owner-facing entries:

```ts
payload.find({
  collection: 'documentation',
  where: { category: { not_equals: 'Seeding & Data' } },
  limit: 12,
  sort: 'order',
  depth: 0,
})
```

## New helper — `createNumberedList` (required)

Add to `src/utilities/lexicalHelpers.ts`, mirroring `createBulletList` (verified shape):

```ts
export const createNumberedList = (...items: string[]): LexicalListNode => ({
  type: 'list',
  children: items.map((text, i) => createListItem(text, i + 1)),
  direction: 'ltr',
  format: '',
  indent: 0,
  listType: 'number',
  start: 1,
  tag: 'ol',
  version: 1,
})
```

Used throughout the step-by-step entries (the content is step-heavy).

## Voice rules

- Second person, warm, plain. **No jargon** — avoid "API/endpoint", "`_status`", "ISR", "OAuth",
  "revalidate". Say "the web address piece" for slug, "the site updates within seconds" for
  revalidation.
- Task-first: each section opens with *"To do X…"* then numbered steps (`createNumberedList`).
- Define the two unavoidable terms once: **Draft / Published**, and **block** (a building section of
  a page).
- Use precise sidebar paths (e.g. *"Content → Posts"*) in place of screenshots.

## Verification

No front-end content is touched at any point.

- `pnpm exec tsc --noEmit` and `vp lint` clean on all new/changed files.
- Integration test (`tests/int/`) against the test DB:
  1. Run `seedOwnerDocs` on an empty `documentation` collection → all 12 entries created with the
     expected `slug`, `title`, and `category`; each `content` validates as Lexical (non-empty
     `root.children`).
  2. Modify one entry, then run `seedOwnerDocs` again → still exactly 12 entries (no duplicates), and
     the modified entry is back to canonical content (replace semantics verified).
  3. Assert the developer entry (`developer-reset-demo-data`) is excluded by the dashboard query
     filter (`category != 'Seeding & Data'`).

## Files touched

- **New:** `docs/owner-guide-getting-started.md`, `src/endpoints/seed/owner-docs.ts`,
  `scripts/seed-owner-guide.ts`, `tests/int/ownerDocs.int.spec.ts`.
- **Modified:** `src/utilities/lexicalHelpers.ts` (add `createNumberedList`),
  `src/endpoints/seed/index.ts` (call `seedOwnerDocs`), `src/components/BeforeDashboard/index.tsx`
  (dashboard query).
- **Deleted:** `src/endpoints/seed/admin-docs.ts`, `scripts/seed-docs.ts`.
- **Unchanged:** `documentation` collection schema; all front-end content collections.

## Open follow-ups (out of scope for v1)

- Screenshot pass on the in-admin entries.
- Generating a PDF artifact from the standalone starter.
- A real owner-facing Etsy vacation-mode toggle (global field + wire the endpoint to read it).
