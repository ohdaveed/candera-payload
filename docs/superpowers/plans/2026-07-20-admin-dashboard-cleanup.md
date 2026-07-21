# Admin Dashboard Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every Payload admin collection/global a real `admin.description`, fix the one broken "view live" link (`products`), regroup `media` out of "System" into "Content", add a `Layout` group + descriptions to the `header`/`footer` globals, and surface the four content types currently missing from the dashboard's "More Content" links.

**Architecture:** Pure admin-config additions (`admin.description`, `admin.group`) plus one real bug fix (`generatePreviewPath` + `Products.ts` live-preview wiring). No database schema changes, no new fields, no migration.

**Tech Stack:** Payload CMS 3.85.2, Next.js 16, TypeScript, `vite-plus` (`vp`) for lint/format/typecheck/test.

## Global Constraints

- Design source: `docs/superpowers/specs/2026-07-20-admin-dashboard-cleanup-design.md` (as revised — the Events `/events/[slug]` route work is superseded/out of scope).
- No DB schema change in this project — do **not** run `payload migrate:create`.
- Prettier: single quotes, no semicolons, trailing commas, 100-width (existing `vp fmt` config — don't hand-format).
- Lint/typecheck via `vp check`; tests via `vp test <path>` (fallback `npx vitest run <path>`).
- Field-level `admin.description` additions are out of scope — collection/global level only.
- No collection/global removal or hiding.
- Never edit `src/payload-types.ts` or `src/payload-generated-schema.ts` by hand.
- Conventional commit messages; commit after each task.
- **Shared working directory hazard:** this repo currently has unrelated uncommitted changes from a concurrent session (`src/app/(frontend)/next/ai/generate-field/route.ts`, `src/utilities/withAIGeneration.ts`, `tests/int/withAIGeneration.int.spec.ts` modified; two `docs/superpowers/specs/2026-06-14-*.md` files deleted) sitting in the working tree, not staged. **Never run `git add -A` or `git add .`** in this plan — always `git add` the exact files each task lists, so those unrelated changes are never swept into a commit.

---

### Task 1: Add `admin.description` to every directly-defined collection and global; regroup `media`

**Files:**
- Modify: `src/collections/Pages.ts:44-62`
- Modify: `src/collections/Posts.ts:50-68`
- Modify: `src/collections/Products.ts:26-30`
- Modify: `src/collections/Events.ts:34-41`
- Modify: `src/collections/HowToGuides.ts:46-64`
- Modify: `src/collections/Categories.ts:15-18`
- Modify: `src/collections/Media.ts:20-22`
- Modify: `src/collections/Quizzes.ts:13-16`
- Modify: `src/collections/ScentProfiles.ts:13-17`
- Modify: `src/collections/Briefs.ts:6-10`
- Modify: `src/collections/Documentation.ts:20-24`
- Modify: `src/collections/Folders.ts:13-16`
- Modify: `src/collections/EtsyTokens.ts:5-9`
- Modify: `src/collections/Users.ts:15-19`
- Modify: `src/Header/config.ts:7-13`
- Modify: `src/Footer/config.ts:7-13`
- Test: `tests/int/adminDescriptions.int.spec.ts` (create)

**Interfaces:**
- Produces: every collection export listed above now has `admin.description: string`. `Media`'s `admin.group` changes from `'System'` to `'Content'`. `Header` and `Footer` gain a top-level `admin: { group: 'Layout', description: string }` block (neither had an `admin` key before).
- Consumes: nothing from other tasks — this is the foundational task.

- [ ] **Step 1: Write the failing regression test**

Create `tests/int/adminDescriptions.int.spec.ts`:

```ts
import { describe, expect, it } from 'vite-plus/test'

import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Products } from '@/collections/Products'
import { Events } from '@/collections/Events'
import { HowToGuides } from '@/collections/HowToGuides'
import { Categories } from '@/collections/Categories'
import { Media } from '@/collections/Media'
import { Quizzes } from '@/collections/Quizzes'
import { ScentProfiles } from '@/collections/ScentProfiles'
import { Briefs } from '@/collections/Briefs'
import { Documentation } from '@/collections/Documentation'
import { Folders } from '@/collections/Folders'
import { EtsyTokens } from '@/collections/EtsyTokens'
import { Users } from '@/collections/Users'
import { Header } from '@/Header/config'
import { Footer } from '@/Footer/config'

const collectionsRequiringDescription = [
  { name: 'Pages', config: Pages },
  { name: 'Posts', config: Posts },
  { name: 'Products', config: Products },
  { name: 'Events', config: Events },
  { name: 'HowToGuides', config: HowToGuides },
  { name: 'Categories', config: Categories },
  { name: 'Media', config: Media },
  { name: 'Quizzes', config: Quizzes },
  { name: 'ScentProfiles', config: ScentProfiles },
  { name: 'Briefs', config: Briefs },
  { name: 'Documentation', config: Documentation },
  { name: 'Folders', config: Folders },
  { name: 'EtsyTokens', config: EtsyTokens },
  { name: 'Users', config: Users },
]

describe('collection admin descriptions', () => {
  it.each(collectionsRequiringDescription)(
    '$name has a non-empty admin.description',
    ({ config }) => {
      expect(typeof config.admin?.description).toBe('string')
      expect((config.admin?.description as string).length).toBeGreaterThan(0)
    },
  )
})

describe('Media collection grouping', () => {
  it('is grouped under Content, not System', () => {
    expect(Media.admin?.group).toBe('Content')
  })
})

describe('Header and Footer global admin config', () => {
  it.each([
    ['Header', Header],
    ['Footer', Footer],
  ])('%s has a Layout group and a non-empty description', (_name, config) => {
    expect(config.admin?.group).toBe('Layout')
    expect(typeof config.admin?.description).toBe('string')
    expect((config.admin?.description as string).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `vp test tests/int/adminDescriptions.int.spec.ts` (fallback: `npx vitest run tests/int/adminDescriptions.int.spec.ts`)
Expected: FAIL — every `admin?.description` assertion fails since none of these collections/globals have a description yet, and `Header`/`Footer` have no `admin` key at all (`config.admin?.group` is `undefined`, not `'Layout'`).

- [ ] **Step 3: Add descriptions to the five "Content" group collections**

In `src/collections/Pages.ts`, inside the `admin: {` block (currently lines 44-62), add a `description` line right after `group: 'Content',`:

```ts
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description: 'Static site pages such as About and FAQ, built from content blocks. Rendered at /[slug].',
    livePreview: {
```

In `src/collections/Posts.ts`, inside `admin: {` (lines 50-68), after `group: 'Content',`:

```ts
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    description: 'Blog articles for storytelling and SEO. Rendered at /posts and /posts/[slug].',
    livePreview: {
```

In `src/collections/Events.ts`, inside `admin: {` (lines 34-41), after `group: 'Content',` (keep the existing comment about the omitted preview config):

```ts
  admin: {
    useAsTitle: 'venueName',
    defaultColumns: ['venueName', 'eventDate', 'city', '_status', 'updatedAt'],
    group: 'Content',
    description:
      'In-person events and markets. Rendered on the /events listing page — no individual event pages yet.',
    // No per-event detail route exists (only the /events listing), so there is nothing a
    // per-document preview/live-preview URL could resolve to — omitted rather than pointed
    // at a route that doesn't exist. Revisit if an /events/[slug] detail page ships.
  },
```

In `src/collections/HowToGuides.ts`, inside `admin: {` (lines 46-64), after `group: 'Content',`:

```ts
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description: 'Step-by-step candle care and usage guides. Rendered at /how-to and /how-to/[slug].',
    livePreview: {
```

In `src/collections/Media.ts`, replace the whole `admin: {` block (lines 20-22):

```ts
  admin: {
    group: 'Content',
    description:
      'Images and files used across the site. Uploaded here, then attached via relationship fields elsewhere.',
  },
```

- [ ] **Step 4: Add descriptions to `Products` and `Categories` (Commerce group)**

In `src/collections/Products.ts`, inside `admin: {` (lines 26-30), after `group: 'Commerce',`:

```ts
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'productType', 'etsyListingId', 'updatedAt'],
    group: 'Commerce',
    description:
      'Candle listings synced from Etsy, with storefront-only fields layered on top. Rendered at /products and /products/[slug].',
  },
```

In `src/collections/Categories.ts`, inside `admin: {` (lines 15-18), after `group: 'Commerce',`:

```ts
  admin: {
    useAsTitle: 'title',
    group: 'Commerce',
    description:
      'Taxonomy used to group and filter Posts and Products. No page of its own — browse by category from an archive.',
  },
```

- [ ] **Step 5: Add descriptions to `Quizzes` and `ScentProfiles` (Quiz group)**

In `src/collections/Quizzes.ts`, inside `admin: {` (lines 13-16), after `group: 'Quiz',`:

```ts
  admin: {
    useAsTitle: 'title',
    group: 'Quiz',
    description:
      'Scent Quiz question sets. Edited here, rendered wherever a page includes the Scent Quiz block — not a standalone page.',
  },
```

In `src/collections/ScentProfiles.ts`, inside `admin: {` (lines 13-17), after `group: 'Quiz',`:

```ts
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Quiz',
    description:
      'Scent profiles used to score and recommend products from Scent Quiz results. No page of its own.',
  },
```

- [ ] **Step 6: Add descriptions to `Briefs`, `Documentation`, `Folders`, `EtsyTokens`, `Users`**

In `src/collections/Briefs.ts`, inside `admin: {` (lines 6-10), after `group: 'Marketing',`:

```ts
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: 'Marketing',
    description:
      'Internal SEO briefs drafted before writing product copy. Not published or visible on the live site — a drafting aid only.',
  },
```

In `src/collections/Documentation.ts`, inside `admin: {` (lines 20-24), after `group: 'Resources',`:

```ts
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'order', 'updatedAt'],
    group: 'Resources',
    description: 'Internal how-to guides for admins using this dashboard. Not visible to site visitors.',
  },
```

In `src/collections/Folders.ts`, inside `admin: {` (lines 13-16), after `group: 'System',`:

```ts
  admin: {
    useAsTitle: 'name',
    group: 'System',
    description:
      "Payload's built-in tool for organizing documents inside the admin panel. Doesn't affect the live site.",
  },
```

In `src/collections/EtsyTokens.ts`, inside `admin: {` (lines 5-9), after `group: 'System',`:

```ts
  admin: {
    useAsTitle: 'label',
    group: 'System',
    hidden: true,
    description:
      "OAuth tokens used to sync products from Etsy. Managed automatically by the connect/sync flow — don't edit directly.",
  },
```

In `src/collections/Users.ts`, inside `admin: {` (lines 15-19), after `group: 'System',`:

```ts
  admin: {
    defaultColumns: ['name', 'email', 'roles', 'status', 'updatedAt'],
    useAsTitle: 'name',
    group: 'System',
    description: 'Admin panel accounts. Controls who can log in and edit content here.',
  },
```

- [ ] **Step 7: Add `admin` blocks to `Header` and `Footer` globals**

In `src/Header/config.ts`, add an `admin` key right after the `access` block (currently lines 7-13):

```ts
export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'Layout',
    description: 'Site navigation and header content shown on every page.',
  },
  fields: [
```

In `src/Footer/config.ts`, add an `admin` key right after the `access` block (currently lines 7-13):

```ts
export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'Layout',
    description: 'Footer navigation, links, and copyright shown on every page.',
  },
  fields: [
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `vp test tests/int/adminDescriptions.int.spec.ts` (fallback: `npx vitest run tests/int/adminDescriptions.int.spec.ts`)
Expected: PASS — all `it.each` cases green.

- [ ] **Step 9: Typecheck and lint**

Run: `vp check`
Expected: no errors. (Prettier/Oxlint should accept the added lines as-is; if formatting shifts quotes/wrapping, accept `vp fmt`'s output — don't hand-fight it.)

- [ ] **Step 10: Commit**

```bash
git add src/collections/Pages.ts src/collections/Posts.ts src/collections/Products.ts \
  src/collections/Events.ts src/collections/HowToGuides.ts src/collections/Categories.ts \
  src/collections/Media.ts src/collections/Quizzes.ts src/collections/ScentProfiles.ts \
  src/collections/Briefs.ts src/collections/Documentation.ts src/collections/Folders.ts \
  src/collections/EtsyTokens.ts src/collections/Users.ts src/Header/config.ts src/Footer/config.ts \
  tests/int/adminDescriptions.int.spec.ts
git commit -m "feat(admin): add descriptions to all collections/globals, regroup Media to Content

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Fix the `products` live-preview link

**Files:**
- Modify: `src/utilities/generatePreviewPath.ts:4-8`
- Modify: `src/collections/Products.ts` (import line + `admin` block from Task 1)
- Test: `tests/int/generatePreviewPath.int.spec.ts` (create)

**Interfaces:**
- Consumes: `Products.ts`'s `admin` block as left by Task 1 Step 4 (already has `description`).
- Produces: `generatePreviewPath({ collection: 'products', slug, req })` now resolves to `/next/preview?path=%2Fproducts%2F<slug>&...` instead of `undefined/<slug>`. `Products.ts` gains `admin.livePreview.url` and `admin.preview`, matching the `Pages`/`Posts`/`HowToGuides` pattern.

- [ ] **Step 1: Write the failing test**

Create `tests/int/generatePreviewPath.int.spec.ts`:

```ts
import { describe, expect, it } from 'vite-plus/test'
import type { PayloadRequest } from 'payload'

import { generatePreviewPath } from '@/utilities/generatePreviewPath'

const fakeReq = {} as PayloadRequest

function extractPath(url: string | null): string | null {
  if (!url) return null
  const params = new URLSearchParams(url.split('?')[1] ?? '')
  return params.get('path')
}

describe('generatePreviewPath', () => {
  it('resolves products to the /products prefix', () => {
    const url = generatePreviewPath({ collection: 'products', slug: 'ember-vessel', req: fakeReq })
    expect(extractPath(url)).toBe('/products/ember-vessel')
  })

  it('resolves pages to the root prefix', () => {
    const url = generatePreviewPath({ collection: 'pages', slug: 'about', req: fakeReq })
    expect(extractPath(url)).toBe('/about')
  })

  it('resolves posts to the /posts prefix', () => {
    const url = generatePreviewPath({ collection: 'posts', slug: 'studio-notes', req: fakeReq })
    expect(extractPath(url)).toBe('/posts/studio-notes')
  })

  it('resolves how-to-guides to the /how-to prefix', () => {
    const url = generatePreviewPath({
      collection: 'how-to-guides',
      slug: 'trim-your-wick',
      req: fakeReq,
    })
    expect(extractPath(url)).toBe('/how-to/trim-your-wick')
  })

  it('returns null when slug is undefined or null', () => {
    expect(
      generatePreviewPath({ collection: 'products', slug: undefined as unknown as string, req: fakeReq }),
    ).toBeNull()
    expect(
      generatePreviewPath({ collection: 'products', slug: null as unknown as string, req: fakeReq }),
    ).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `vp test tests/int/generatePreviewPath.int.spec.ts` (fallback: `npx vitest run tests/int/generatePreviewPath.int.spec.ts`)
Expected: FAIL on the `products` case — `collectionPrefixMap['products']` is `undefined`, so `extractPath(url)` returns `'/undefined/ember-vessel'`, not `'/products/ember-vessel'`.

- [ ] **Step 3: Add `products` to `collectionPrefixMap`**

In `src/utilities/generatePreviewPath.ts`, replace lines 4-8:

```ts
const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
  'how-to-guides': '/how-to',
  products: '/products',
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `vp test tests/int/generatePreviewPath.int.spec.ts` (fallback: `npx vitest run tests/int/generatePreviewPath.int.spec.ts`)
Expected: PASS — all 5 cases green.

- [ ] **Step 5: Wire `Products.ts`'s admin.preview / admin.livePreview**

In `src/collections/Products.ts`, add the import (alongside the existing utility imports near the top):

```ts
import { generatePreviewPath } from '../utilities/generatePreviewPath'
```

Then update the `admin` block (as left by Task 1 Step 4) to add `livePreview` and `preview`:

```ts
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'productType', 'etsyListingId', 'updatedAt'],
    group: 'Commerce',
    description:
      'Candle listings synced from Etsy, with storefront-only fields layered on top. Rendered at /products and /products/[slug].',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'products', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'products', req }),
  },
```

- [ ] **Step 6: Typecheck and lint**

Run: `vp check`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/utilities/generatePreviewPath.ts src/collections/Products.ts \
  tests/int/generatePreviewPath.int.spec.ts
git commit -m "fix(admin): wire products live-preview link, add products to collectionPrefixMap

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Add descriptions to plugin-registered collections

**Files:**
- Modify: `src/plugins/index.ts:87-213`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `redirects`, `forms`, `form-submissions`, `search`, and `payload-mcp-api-keys` (the plugin-generated collections) all gain an `admin.description`.

No automated test for this task: these collections don't exist as importable `CollectionConfig` objects — they're built at runtime by the plugin functions from the override objects below, and verifying the *merged* result would require booting a full Payload config against a database, disproportionate to the risk (a wrong string can't break anything functionally). Verified manually in Task 5's dev-server pass instead.

- [ ] **Step 1: Add description to the `redirects` override**

In `src/plugins/index.ts`, inside the `redirectsPlugin({ overrides: { admin: {` block (lines ~90-92):

```ts
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: {
        group: 'System',
        description: 'URL redirect rules for retired or renamed Pages/Posts URLs. Applied automatically.',
      },
```

- [ ] **Step 2: Add descriptions to the `forms` and `form-submissions` overrides**

In the `formBuilderPlugin({` block, `formOverrides.admin` (lines ~126-129):

```ts
    formOverrides: {
      admin: {
        group: 'Inquiries',
        description:
          'Form definitions used by storefront forms like Contact. Submissions are stored separately in Form Submissions.',
      },
```

And `formSubmissionOverrides.admin` (lines ~155-158):

```ts
    formSubmissionOverrides: {
      admin: {
        group: 'Inquiries',
        description: 'Inquiries received through storefront forms. Entries are created by visitors, not edited here.',
      },
```

- [ ] **Step 3: Add description to the `search` override**

In the `searchPlugin({` block (lines ~168-176), add an `admin` key as a sibling of `fields` inside `searchOverrides`:

```ts
  searchPlugin({
    collections: ['posts', 'products'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: {
        description: "Auto-generated search index built from published Posts and Products. Don't edit directly.",
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
```

- [ ] **Step 4: Add description to the `payload-mcp-api-keys` collection**

In the `mcpPlugin({` block (lines ~187-209), add `overrideApiKeyCollection` as a sibling of `collections`/`globals`:

```ts
  mcpPlugin({
    collections: {
      folders: { enabled: true },
      pages: { enabled: true },
      posts: { enabled: true },
      products: { enabled: true },
      media: { enabled: true },
      categories: { enabled: true },
      briefs: { enabled: true },
      quizzes: { enabled: true },
      'scent-profiles': { enabled: true },
      documentation: { enabled: true },
      'how-to-guides': { enabled: true },
      redirects: { enabled: true },
      forms: { enabled: true },
    },
    globals: {
      header: { enabled: { find: true, update: false } },
      footer: { enabled: { find: true, update: false } },
      'site-theme': { enabled: { find: true, update: false } },
      'studio-info': { enabled: { find: true, update: false } },
    },
    overrideApiKeyCollection: (collection) => ({
      ...collection,
      admin: {
        ...collection.admin,
        description:
          'API keys for the Payload MCP server used by AI coding tools. Unrelated to storefront/customer data.',
      },
    }),
  }),
```

- [ ] **Step 5: Typecheck and lint**

Run: `vp check`
Expected: no errors. If `overrideApiKeyCollection`'s parameter type doesn't infer cleanly, check the exact signature in `node_modules/@payloadcms/plugin-mcp/dist/types.d.ts:269` (`(collection: CollectionConfig) => CollectionConfig`) and annotate explicitly if needed — don't use `any`.

- [ ] **Step 6: Commit**

```bash
git add src/plugins/index.ts
git commit -m "feat(admin): add descriptions to plugin-registered collections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Fill the dashboard "More Content" link gap

**Files:**
- Modify: `src/components/BeforeDashboard/index.tsx:179-247`

**Interfaces:**
- Consumes: nothing from earlier tasks (independent of Task 1-3's config changes).
- Produces: the "More Content" footer row on the admin dashboard home links to Events, How-To Guides, Scent Quiz, and Scent Profiles, in addition to the existing Pages/Media/Posts/SEO Briefs links.

No automated test: this is static JSX in a server component with no conditional logic — a render test would require Payload's admin test harness, disproportionate for four extra `<Link>` elements. Verified manually in Task 5.

- [ ] **Step 1: Extend the "More Content" tooltip copy**

In `src/components/BeforeDashboard/index.tsx`, replace the `SectionTooltip` `content` for "More Content" (lines 181-198):

```tsx
        <SectionTooltip
          title="More Content"
          content={
            <>
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                <li>
                  <strong>Pages &amp; Content</strong> — manage static pages like About and FAQ
                </li>
                <li>
                  <strong>Media</strong> — upload and organize images used across the site
                </li>
                <li>
                  <strong>Posts</strong> — blog-style articles for SEO and storytelling
                </li>
                <li>
                  <strong>Events</strong> — in-person events and markets
                </li>
                <li>
                  <strong>How-To Guides</strong> — step-by-step candle care and usage guides
                </li>
                <li>
                  <strong>Scent Quiz</strong> — question sets for the storefront Scent Quiz
                </li>
                <li>
                  <strong>Scent Profiles</strong> — profiles used to score Scent Quiz results
                </li>
                <li>
                  <strong>SEO Briefs</strong> — AI-generated content briefs for product pages
                </li>
              </ul>
            </>
          }
        />
```

- [ ] **Step 2: Add the four missing links**

In the same file, the link row currently ends with `Posts` then `SEO Briefs` (lines 228-247). Insert the four new links between them:

```tsx
        <Link
          href="/admin/collections/posts"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Posts
        </Link>
        <Link
          href="/admin/collections/events"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Events
        </Link>
        <Link
          href="/admin/collections/how-to-guides"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          How-To Guides
        </Link>
        <Link
          href="/admin/collections/quizzes"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Scent Quiz
        </Link>
        <Link
          href="/admin/collections/scent-profiles"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          Scent Profiles
        </Link>
        <Link
          href="/admin/collections/briefs"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--theme-elevation-700)',
            textDecoration: 'none',
          }}
        >
          SEO Briefs
        </Link>
```

- [ ] **Step 3: Typecheck and lint**

Run: `vp check`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/BeforeDashboard/index.tsx
git commit -m "feat(admin): add Events, How-To Guides, Scent Quiz, Scent Profiles to dashboard links

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Full verification pass

**Files:** none modified — verification only, unless `pnpm generate:importmap` produces a diff (see Step 3).

**Interfaces:**
- Consumes: the complete state of Tasks 1-4.
- Produces: confidence that nothing broke and every design-doc testing item is confirmed.

- [ ] **Step 1: Run the full check**

Run: `pnpm generate:types && vp check`
Expected: `generate:types` produces no diff in `src/payload-types.ts` (no schema change occurred — this just confirms that's true). `vp check` passes with no errors (format, Oxlint, typecheck all clean). If `generate:types` does show a diff, stop and investigate before continuing — it would mean something in Tasks 1-4 unexpectedly touched field/schema shape, not just `admin` config.

- [ ] **Step 2: Run the full test suite**

Run: `vp test` (fallback: `npx vitest run && npx playwright test` per existing project scripts)
Expected: all tests pass, including the two new files from Tasks 1-2 and the pre-existing suite (no regressions).

- [ ] **Step 3: Check for importmap drift**

Run: `pnpm generate:importmap && git status --porcelain src/app/\(payload\)/admin/importMap.js`
Expected: no output (no diff) — this project added no new custom admin components, only strings, so the import map shouldn't change. If it *does* show a diff, stage and commit it on its own:

```bash
git add "src/app/(payload)/admin/importMap.js"
git commit -m "chore(admin): regenerate importMap after admin config changes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Manual dev-server verification**

Start the dev server (`pass-cli run --env-file .env -- pnpm dev`) and confirm, per the design doc's Testing section:

1. Admin sidebar (`/admin`): every collection and global shows its new description under the label in list view; `Media` appears under "Content" (not "System"); `Header`/`Footer` appear under a new "Layout" group.
2. Open a `Products` document in the admin editor — the "Live Preview" tab now renders the storefront product page instead of being unavailable.
3. Dashboard home (`/admin`): the "More Content" row includes Events, How-To Guides, Scent Quiz, and Scent Profiles links, each resolving to the correct admin list view; hovering the tooltip icon shows the updated copy.
4. Confirm the unrelated concurrent-session changes (AI-generation WIP files, deleted landing-page specs) are still present in the working tree, untouched by any of this plan's commits (`git status` should show them exactly as they were before this plan started).

No commit for this step — verification only.
