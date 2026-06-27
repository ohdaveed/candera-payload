# Owner Usage Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin help content with one canonical, non-technical owner guide in the `documentation` collection, delivered via the seed pipeline and a prod-safe replace script, plus a standalone getting-started doc.

**Architecture:** Collapse the two existing doc systems (`src/endpoints/seed/admin-docs.ts`, `scripts/seed-docs.ts`) into a single module `src/endpoints/seed/owner-docs.ts` that exports the entry array and a `seedOwnerDocs(payload)` function with replace semantics (wipe the `documentation` collection, recreate the canonical set). Content is migrated from `seed-docs.ts`'s non-technical entries onto typed `lexicalHelpers`, given categories, expanded for full block coverage, plus two new entries. Front-end content is never touched.

**Tech Stack:** Payload 3.85, Next 16, TypeScript, `vite-plus/test` (vitest) for integration tests, `@/utilities/lexicalHelpers` for Lexical content.

## Global Constraints

- Front-end content (products, pages, posts, media, quizzes) is NEVER modified — only the `documentation` collection and listed tooling files.
- Replace semantics, not skip-if-exists: the owner has no edits to preserve.
- No schema changes; no new `documentation.category` options. Valid categories: `CMS Usage`, `Seeding & Data`, `Etsy Integration`, `Publishing Workflow`, `Design & Theming`.
- Voice: second person, warm, plain. No jargon (`API/endpoint`, `_status`, `ISR`, `OAuth`, `revalidate`, raw `slug`). Task-first; numbered steps via `createNumberedList`.
- Reuse existing slugs from `seed-docs.ts` for migrated entries; new slugs only for net-new entries.
- Do NOT document Etsy vacation mode (no admin UI exists — `etsy.ts:75` POSTs hardcoded `is_vacation: false`).
- Commit after each task. Branch: `docs/owner-guide` (already checked out).

---

### Task 1: Add `createNumberedList` helper

**Files:**
- Modify: `src/utilities/lexicalHelpers.ts` (add export after `createBulletList`, ~line 126)
- Test: `tests/int/lexicalHelpers.int.spec.ts` (new)

**Interfaces:**
- Consumes: existing `createListItem`, `LexicalListNode` type from `lexicalHelpers.ts`.
- Produces: `createNumberedList(...items: string[]): LexicalListNode` — a Lexical ordered-list node (`listType: 'number'`, `tag: 'ol'`).

- [ ] **Step 1: Write the failing test**

Create `tests/int/lexicalHelpers.int.spec.ts`:

```ts
import { describe, it, expect } from 'vite-plus/test'
import { createNumberedList } from '@/utilities/lexicalHelpers'

describe('createNumberedList', () => {
  it('builds an ordered Lexical list node', () => {
    const node = createNumberedList('First step', 'Second step')
    expect(node.type).toBe('list')
    expect(node.listType).toBe('number')
    expect(node.tag).toBe('ol')
    expect(node.start).toBe(1)
    expect(node.children).toHaveLength(2)
    expect(node.children[0].value).toBe(1)
    expect(node.children[1].value).toBe(2)
    expect(node.children[0].children[0].text).toBe('First step')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:int -- tests/int/lexicalHelpers.int.spec.ts`
Expected: FAIL — `createNumberedList` is not exported.

- [ ] **Step 3: Add the helper**

In `src/utilities/lexicalHelpers.ts`, immediately after the `createBulletList` export (the block ending at line ~126), add:

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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test:int -- tests/int/lexicalHelpers.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utilities/lexicalHelpers.ts tests/int/lexicalHelpers.int.spec.ts
git commit -m "feat(lexical): add createNumberedList helper"
```

---

### Task 2: Build the canonical `owner-docs.ts` module

**Files:**
- Create: `src/endpoints/seed/owner-docs.ts`
- Reference (source to migrate, do NOT import): `scripts/seed-docs.ts`
- Test: `tests/int/ownerDocs.int.spec.ts` (new)

**Interfaces:**
- Consumes: `createRichText`, `createHeading`, `createParagraph`, `createBulletList`, `createNumberedList` from `@/utilities/lexicalHelpers`; `Payload`, `RequiredDataFromCollectionSlug` from `payload`.
- Produces: `OWNER_DOCS: Doc[]` (array of 12 entries) and `seedOwnerDocs(payload: Payload): Promise<void>` (replace semantics).

**Migration rules** (apply to each of the 10 entries in `scripts/seed-docs.ts` `DOCS_TO_SEED`, preserving all prose verbatim):
- `doc(...children)` → `createRichText([...children])`
- `p('text')` → `createParagraph('text')`
- `h2('text')` → `createHeading('text', 'h2')`
- `ul(...items)` → `createBulletList(...items)`
- `ol(...items)` → `createNumberedList(...items)`
- Keep each entry's `title`, `slug`, and `order`. Add a `category` per the table below.
- Cast content with `as Doc['content']` (the helper output is valid Lexical but does not match the strict generated type).

**Category + order assignment** (orders shift after inserting the new Brand Look entry at 8):

| order | slug (existing unless noted) | category |
|---|---|---|
| 1 | `welcome-to-candera` | CMS Usage |
| 2 | `drafts-and-publishing` | Publishing Workflow |
| 3 | `managing-pages` | CMS Usage |
| 4 | `managing-products` | CMS Usage |
| 5 | `writing-posts` | Publishing Workflow |
| 6 | `managing-media` | CMS Usage |
| 7 | `navigation-and-footer` | Design & Theming |
| 8 | `brand-look-settings` (NEW) | Design & Theming |
| 9 | `managing-scent-quiz` (was order 8) | CMS Usage |
| 10 | `etsy-integration` (was order 9) | Etsy Integration |
| 11 | `using-demo-content` (was order 10) | CMS Usage |
| 12 | `developer-reset-demo-data` (NEW) | Seeding & Data |

**Entry #3 refinement** (`managing-pages`): replace the "The homepage" `createBulletList(...)` (the 5-block list) with the full 10-block list:

```ts
createBulletList(
  'Storefront Hero — the large opening section with the headline, sub-line, and main call-to-action buttons',
  'The Vessels — the showcase row of featured candle vessels',
  'Call To Action — a standalone prompt with a button (for example, "Shop the collection")',
  'Content — flexible rich-text columns for free-form writing and images',
  'Media Block — a single image or video band across the page',
  'Archive — the product grid or journal grid section',
  'Form — an embedded form such as a contact or sign-up form',
  'Testimonials — the customer quote section',
  'Inner Circle CTA — the email sign-up section',
  'Scent Quiz — the "Find Your Scent" section and quiz trigger',
)
```

- [ ] **Step 1: Write the failing integration test**

Create `tests/int/ownerDocs.int.spec.ts`:

```ts
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vite-plus/test'
import { seedOwnerDocs, OWNER_DOCS } from '@/endpoints/seed/owner-docs'

let payload: Payload

const EXPECTED_SLUGS = [
  'welcome-to-candera', 'drafts-and-publishing', 'managing-pages', 'managing-products',
  'writing-posts', 'managing-media', 'navigation-and-footer', 'brand-look-settings',
  'managing-scent-quiz', 'etsy-integration', 'using-demo-content', 'developer-reset-demo-data',
]

describe('seedOwnerDocs', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('exports 12 entries with valid categories and non-empty Lexical content', () => {
    expect(OWNER_DOCS).toHaveLength(12)
    const validCategories = ['CMS Usage', 'Seeding & Data', 'Etsy Integration', 'Publishing Workflow', 'Design & Theming']
    for (const doc of OWNER_DOCS) {
      expect(validCategories).toContain(doc.category)
      expect((doc.content as { root: { children: unknown[] } }).root.children.length).toBeGreaterThan(0)
    }
  })

  it('replaces the documentation collection with exactly the canonical set', async () => {
    await seedOwnerDocs(payload)
    const after = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
    expect(after.totalDocs).toBe(12)
    expect(after.docs.map((d) => d.slug).sort()).toEqual([...EXPECTED_SLUGS].sort())
  })

  it('is idempotent and restores edited entries on re-run', async () => {
    const target = await payload.find({
      collection: 'documentation', where: { slug: { equals: 'welcome-to-candera' } }, limit: 1,
    })
    await payload.update({ collection: 'documentation', id: target.docs[0].id, data: { title: 'TAMPERED' } })
    await seedOwnerDocs(payload)
    const after = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
    expect(after.totalDocs).toBe(12)
    const restored = after.docs.find((d) => d.slug === 'welcome-to-candera')
    expect(restored?.title).toBe('Welcome to Your Dashboard')
  })

  it('hides only the developer entry from the dashboard query', async () => {
    const ownerFacing = await payload.find({
      collection: 'documentation', where: { category: { not_equals: 'Seeding & Data' } },
      limit: 12, sort: 'order', depth: 0,
    })
    expect(ownerFacing.totalDocs).toBe(11)
    expect(ownerFacing.docs.some((d) => d.slug === 'developer-reset-demo-data')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test:int -- tests/int/ownerDocs.int.spec.ts`
Expected: FAIL — cannot import `seedOwnerDocs`/`OWNER_DOCS` (module does not exist).

- [ ] **Step 3: Create the module scaffold and the `seedOwnerDocs` function**

Create `src/endpoints/seed/owner-docs.ts` starting with:

```ts
import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import {
  createBulletList,
  createHeading,
  createNumberedList,
  createParagraph,
  createRichText,
} from '@/utilities/lexicalHelpers'

type Doc = RequiredDataFromCollectionSlug<'documentation'>

// ── Entries 1–11 (owner-facing) and 12 (developer) defined below ──
// (populated in Steps 4–6)

export const OWNER_DOCS: Doc[] = [
  // filled in Steps 4–6
]

export const seedOwnerDocs = async (payload: Payload): Promise<void> => {
  payload.logger.info('— Seeding owner documentation (replace)...')

  const existing = await payload.find({ collection: 'documentation', limit: 1000, depth: 0 })
  for (const doc of existing.docs) {
    await payload.delete({
      collection: 'documentation',
      id: doc.id,
      depth: 0,
      context: { disableRevalidate: true },
    })
  }

  for (const doc of OWNER_DOCS) {
    await payload.create({
      collection: 'documentation',
      depth: 0,
      context: { disableRevalidate: true },
      data: doc,
    })
  }
}
```

- [ ] **Step 4: Migrate the 10 existing entries into `OWNER_DOCS`**

For each entry in `scripts/seed-docs.ts` `DOCS_TO_SEED`, add a `Doc` object to `OWNER_DOCS` applying the Migration rules above (verbatim prose, builder→helper substitutions, add `category`, keep `slug`/`order` except the order shifts in the table for `managing-scent-quiz`→9, `etsy-integration`→10, `using-demo-content`→11). Apply the **Entry #3 refinement** (10-block list) to `managing-pages`. Cast each `content` with `as Doc['content']`. Example shape for the first entry:

```ts
{
  title: 'Welcome to Your Dashboard',
  slug: 'welcome-to-candera',
  order: 1,
  category: 'CMS Usage',
  content: createRichText([
    createParagraph('This is your Candera admin dashboard — the place where you manage everything on your website, from candle listings to journal posts to the homepage layout.'),
    createParagraph('You do not need any technical knowledge to use it. This guide and the articles below will walk you through every area step by step.'),
    createHeading('How the dashboard is organised', 'h2'),
    createParagraph('On the left side of the screen you will see a menu. It is split into two types of areas:'),
    createBulletList(
      'Collections — these are lists of things you can create, edit, and delete. Products, journal posts, media images, and quiz content are all collections.',
      'Globals — these are single settings pages that control site-wide things like your navigation menu and footer.',
    ),
    // ...remaining nodes migrated verbatim from seed-docs.ts entry 1...
  ]) as Doc['content'],
},
```

- [ ] **Step 5: Add new entry #8 — Brand Look (`brand-look-settings`)**

Add this `Doc` to `OWNER_DOCS` at order 8:

```ts
{
  title: 'Your Brand Look: Theme & Studio Info',
  slug: 'brand-look-settings',
  order: 8,
  category: 'Design & Theming',
  content: createRichText([
    createParagraph('Two settings pages control how your site looks and the studio details shown to visitors: Site Theme and Studio Info. Both are Globals — there is only one of each, and saving applies the change everywhere immediately.'),
    createHeading('Changing your brand colours and fonts', 'h2'),
    createNumberedList(
      'Click "Site Theme" under the Globals section in the left menu',
      'Adjust the colour and font options shown',
      'Use the theme preset switcher near the top to try a ready-made look, or fine-tune individual values',
      'Click "Save" — the change goes live on your site immediately',
    ),
    createHeading('Updating your studio details', 'h2'),
    createNumberedList(
      'Click "Studio Info" under the Globals section in the left menu',
      'Edit the studio name, contact details, and any other fields shown',
      'Click "Save" when done',
    ),
    createHeading('Important: settings go live instantly', 'h2'),
    createParagraph('Like your navigation and footer, these settings pages have no Draft state. When you click Save, the change is live right away — so double-check before saving.'),
  ]) as Doc['content'],
},
```

- [ ] **Step 6: Add new entry #12 — developer reset (`developer-reset-demo-data`)**

Add this `Doc` to `OWNER_DOCS` at order 12:

```ts
{
  title: 'For Your Developer: Resetting Demo Data',
  slug: 'developer-reset-demo-data',
  order: 12,
  category: 'Seeding & Data',
  content: createRichText([
    createHeading('This page is for your developer', 'h2'),
    createParagraph('This article describes a technical maintenance task. You do not need to use it for day-to-day editing — it is here so your developer has a reference.'),
    createHeading('Warning: this erases content', 'h2'),
    createParagraph('The reset (seed) process deletes existing content and replaces it with a fresh starter set. It must never be run on the live site unless the intent is to completely reset it.'),
    createHeading('When it is used', 'h2'),
    createParagraph('Resetting is for local development and staging environments where a clean, predictable set of starter content is wanted — for example, before a demo.'),
    createParagraph('If you ever think the site needs resetting, contact your developer rather than running it yourself.'),
  ]) as Doc['content'],
},
```

- [ ] **Step 7: Run the integration test to verify it passes**

Run: `pnpm test:int -- tests/int/ownerDocs.int.spec.ts`
Expected: PASS (all four tests). If the content-length or slug assertions fail, check that all 12 entries are present and orders/categories match the table.

- [ ] **Step 8: Type-check and commit**

```bash
pnpm exec tsc --noEmit
git add src/endpoints/seed/owner-docs.ts tests/int/ownerDocs.int.spec.ts
git commit -m "feat(seed): add canonical owner documentation module"
```

---

### Task 3: Wire `seedOwnerDocs` into the full seed; delete `admin-docs.ts`

**Files:**
- Modify: `src/endpoints/seed/index.ts` (import + call site, ~line 15 and ~line 270)
- Delete: `src/endpoints/seed/admin-docs.ts`

**Interfaces:**
- Consumes: `seedOwnerDocs` from `./owner-docs` (Task 2).

- [ ] **Step 1: Swap the import**

In `src/endpoints/seed/index.ts`, replace:

```ts
import { seedAdminDocs } from './admin-docs'
```

with:

```ts
import { seedOwnerDocs } from './owner-docs'
```

- [ ] **Step 2: Swap the call site**

In the same file, replace `await seedAdminDocs(payload)` with:

```ts
await seedOwnerDocs(payload)
```

- [ ] **Step 3: Delete the old module**

```bash
git rm src/endpoints/seed/admin-docs.ts
```

- [ ] **Step 4: Verify no remaining references**

Run: `grep -rn "seedAdminDocs\|admin-docs" src`
Expected: no output.

- [ ] **Step 5: Type-check and commit**

```bash
pnpm exec tsc --noEmit
git add src/endpoints/seed/index.ts src/endpoints/seed/admin-docs.ts
git commit -m "refactor(seed): replace seedAdminDocs with seedOwnerDocs"
```

---

### Task 4: Fix the dashboard query

**Files:**
- Modify: `src/components/BeforeDashboard/index.tsx:29`

**Interfaces:**
- Consumes: the `documentation` collection seeded by Task 2 (entries carry `category` and `order`).

- [ ] **Step 1: Update the query**

In `src/components/BeforeDashboard/index.tsx`, replace line 29:

```ts
      payload.find({ collection: 'documentation', limit: 5, sort: 'order', depth: 0 }),
```

with:

```ts
      payload.find({
        collection: 'documentation',
        where: { category: { not_equals: 'Seeding & Data' } },
        limit: 12,
        sort: 'order',
        depth: 0,
      }),
```

- [ ] **Step 2: Type-check and lint**

Run: `pnpm exec tsc --noEmit && pnpm exec vp lint src/components/BeforeDashboard/index.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/BeforeDashboard/index.tsx
git commit -m "fix(dashboard): show all owner docs, hide developer reset entry"
```

---

### Task 5: Production refresh script; delete old `seed-docs.ts`

**Files:**
- Create: `scripts/seed-owner-guide.ts`
- Delete: `scripts/seed-docs.ts`

**Interfaces:**
- Consumes: `seedOwnerDocs` from `@/endpoints/seed/owner-docs` (Task 2).

- [ ] **Step 1: Create the script**

Create `scripts/seed-owner-guide.ts`:

```ts
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seedLogger } from '@/utilities/logger'
import { seedOwnerDocs } from '@/endpoints/seed/owner-docs'

async function run(): Promise<void> {
  const payload = await getPayload({ config })
  seedLogger.info('Replacing owner documentation (front-end content untouched)...')
  await seedOwnerDocs(payload)
}

run()
  .then(() => {
    seedLogger.success('Owner documentation refreshed.')
    process.exit(0)
  })
  .catch((err) => {
    seedLogger.error('Failed to refresh owner documentation:', err)
    process.exit(1)
  })
```

- [ ] **Step 2: Delete the superseded script**

```bash
git rm scripts/seed-docs.ts
```

- [ ] **Step 3: Verify no references to the old script**

Run: `grep -rn "seed-docs" package.json src scripts`
Expected: no output.

- [ ] **Step 4: Type-check and commit**

```bash
pnpm exec tsc --noEmit
git add scripts/seed-owner-guide.ts scripts/seed-docs.ts
git commit -m "feat(scripts): add prod-safe owner-guide refresh; remove old seed-docs"
```

---

### Task 6: Standalone getting-started doc

**Files:**
- Create: `docs/owner-guide-getting-started.md`

- [ ] **Step 1: Write the doc**

Create `docs/owner-guide-getting-started.md`:

```markdown
# Getting Started With Your Candera Website

Welcome! This short guide gets you into your website's control room. Keep it handy (you can print
it) — it's the one page you may need *before* you can log in.

## Logging in

1. Open your web browser and go to **canderacandles.com/admin**.
2. Enter the email and password you were given. (Your login was set up for you — if you don't have
   it, ask your developer. It is never written down in the website's code.)
3. You'll land on your **Dashboard**.

## How your site is different from just Etsy

Your candles are still sold and shipped through **Etsy** — orders, inventory, and checkout all
stay there. Your new website is where you:

- **Tell the story** — rich product pages, your brand look, and studio details.
- **Write your journal** — posts and how-to guides for your visitors.
- **Shape the homepage** — arrange the sections visitors see first.

Think of Etsy as your shop counter, and the website as your storefront window and magazine.

## Where to learn each task

Once you're logged in, open **Resources** in the left menu. You'll find step-by-step guides for
every area:

- **Welcome to Your Dashboard** — start here for the lay of the land.
- **Drafts, Publishing, and Saving** — how changes go live (and how to hide them again).
- **Editing Your Pages** — your homepage and other pages.
- **Managing Your Products** — your candle listings.
- **Writing Journal Posts** — your blog.
- **Uploading and Managing Images** — your photo library.
- **Editing Your Navigation and Footer** — your menus.
- **Your Brand Look: Theme & Studio Info** — colours, fonts, and studio details.
- **Managing the Scent Quiz** — the "Find Your Scent" experience.
- **Etsy Integration** — keeping your Etsy connection healthy.
- **Using the Demo Content** — the practice items, and how to remove them.

Take it one guide at a time — there's no rush, and nothing you do in Draft affects your live site
until you choose to publish.
```

- [ ] **Step 2: Commit**

```bash
git add docs/owner-guide-getting-started.md
git commit -m "docs: add owner getting-started starter guide"
```

---

## Final verification (after all tasks)

- [ ] Run the full integration suite touching docs: `pnpm test:int -- tests/int/ownerDocs.int.spec.ts tests/int/lexicalHelpers.int.spec.ts` → all PASS.
- [ ] `pnpm exec tsc --noEmit` → clean.
- [ ] `pnpm exec vp lint src/ scripts/seed-owner-guide.ts` → clean (pre-existing ScentQuiz a11y warnings are acceptable).
- [ ] `grep -rn "admin-docs\|seedAdminDocs\|seed-docs" src scripts package.json` → no output (both old systems gone).
