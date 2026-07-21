# Admin dashboard cleanup — design

## Purpose

Every collection and global in the Payload admin panel is functionally sound, but the sidebar gives editors almost no context: 18 of 21 nav-registered items (14 collections, 5 globals, minus the 3 globals that already have descriptions) have no `admin.description`, two content types (`products`, `events`) have missing or broken "view live" links, and the dashboard landing page omits four real content collections from its quick-links entirely. This project fixes navigation clarity and link correctness — it does not remove any collection or global, since the audit found nothing genuinely dead.

## Audit summary

Full survey of `src/payload.config.ts`'s 14 collections, 5 globals, and plugin-registered collections (`forms`, `form-submissions`, `search`, `redirects`, `payload-mcp-api-keys`), cross-referenced against `src/app/(frontend)/` for real consumers:

- **Only 3 of 21 nav items had a description**: `site-theme`, `studio-info`, `login-theme` (all globals).
- **No collection or global was truly orphaned.** The one apparent case — `briefs` — is actually linked from the `BeforeDashboard` footer as "SEO Briefs" and serves a real purpose (pre-publish drafting aid); it has no frontend route by design, since briefs are never published.
- **`media` is grouped "System"** despite being the most frontend-consumed collection in the app (product photos, post art, gallery images, embedded everywhere via relationship fields).
- **`header` and `footer` globals have no `admin` block at all** — no group, no description — unlike the other three globals.
- **`categories`, `quizzes`, `scent-profiles`** are real public content but have no dedicated route of their own — they're only reachable through another collection's relationship field (Categories via Posts/Products, Quizzes via the ScentQuiz block, Scent Profiles two hops deeper through Quizzes).
- **`products` has no working preview link.** Its `admin.livePreview` config sets only `interval`, with no `url` function and no `admin.preview` — so there is no "view live" button in the document editor at all, unlike `pages`, `posts`, `events`, and `how-to-guides`, which all wire `generatePreviewPath()`.
- **`events`'s preview link is broken.** `Events.ts` calls `generatePreviewPath({ collection: 'events', ... })`, but `collectionPrefixMap` in `src/utilities/generatePreviewPath.ts` only maps `posts`, `pages`, and `how-to-guides` — `events` resolves to `undefined`, producing a preview URL like `/next/preview?path=undefined/my-event`. Compounding this, there is no `/events/[slug]` route at all yet — only the `/events` listing page exists.
- **`BeforeDashboard`'s "More Content" footer row links Pages, Media, Posts, and Briefs only** — Events, How-To Guides, Quizzes, and Scent Profiles are absent, even though they're real, actively-edited content types.

Confirmed against the installed `payload@3.85.2` type definitions (not just docs, which mix versions): `admin.description` accepts a plain `string` on both `CollectionConfig` and `GlobalConfig` (`EntityDescription = string | Record<string,string> | function`, `node_modules/payload/dist/config/types.d.ts:1409`), and `admin.group` accepts a `string` or `false` to hide from nav. The `admin.preview` / `admin.livePreview` pattern already used by `Pages`, `Posts`, `Events` (function returning a URL string) is the correct, current API — the planned `Products` fix and `generatePreviewPath` fix both follow that exact pattern.

## Scope decisions

Confirmed with the project owner during brainstorming:

1. **Nothing is deleted.** Every collection/global audited as "no frontend consumer" turned out to be either intentionally admin-only (`documentation`, `login-theme`) or Payload/operational plumbing that has no client-facing equivalent by nature (`folders`, `etsy-tokens`, `users`, `payload-mcp-api-keys`). These stay registered, visible, grouped, and described — not hidden or removed.
2. **`briefs` is kept**, described as an internal drafting aid with no live page.
3. **The `ThemePresetSwitcher` and `LoginThemeCycler` dashboard widgets are kept** as intentional shortcuts to the `site-theme`/`login-theme` globals, not treated as unneeded duplication.
4. **Events gets a real detail page.** Rather than just removing the broken preview config, a new `/events/[slug]` route is built so the existing preview/live-preview wiring in `Events.ts` resolves to something real.
5. **Field-level descriptions are out of scope.** Only collection/global-level `admin.description` is being added — individual field descriptions already exist where needed and aren't part of this pass.
6. **The `BeforeDashboard` landing widgets are in scope** for the "more content" link gap, but no wholesale redesign of the widget layout — additive fix only.

## Changes

### 1. Descriptions (`admin.description`, collection/global level only)

| Item | Group (unchanged unless noted) | New description |
|---|---|---|
| `pages` | Content | Static site pages such as About and FAQ, built from content blocks. Rendered at `/[slug]`. |
| `posts` | Content | Blog articles for storytelling and SEO. Rendered at `/posts` and `/posts/[slug]`. |
| `products` | Commerce | Candle listings synced from Etsy, with storefront-only fields layered on top. Rendered at `/products` and `/products/[slug]`. |
| `events` | Content | In-person events and markets. Rendered at `/events` and `/events/[slug]`. |
| `how-to-guides` | Content | Step-by-step candle care and usage guides. Rendered at `/how-to` and `/how-to/[slug]`. |
| `categories` | Commerce | Taxonomy used to group and filter Posts and Products. No page of its own — browse by category from an archive. |
| `media` | Content (moved from System) | Images and files used across the site. Uploaded here, then attached via relationship fields elsewhere. |
| `quizzes` | Quiz | Scent Quiz question sets. Edited here, rendered wherever a page includes the Scent Quiz block — not a standalone page. |
| `scent-profiles` | Quiz | Scent profiles used to score and recommend products from Scent Quiz results. No page of its own. |
| `briefs` | Marketing | Internal SEO briefs drafted before writing product copy. Not published or visible on the live site — a drafting aid only. |
| `forms` | Inquiries | Form definitions used by storefront forms like Contact. Submissions are stored separately in Form Submissions. |
| `form-submissions` | Inquiries | Inquiries received through storefront forms. Entries are created by visitors, not edited here. |
| `documentation` | Resources | Internal how-to guides for admins using this dashboard. Not visible to site visitors. |
| `folders` | System | Payload's built-in tool for organizing documents inside the admin panel. Doesn't affect the live site. |
| `etsy-tokens` | System | OAuth tokens used to sync products from Etsy. Managed automatically by the connect/sync flow — don't edit directly. |
| `users` | System | Admin panel accounts. Controls who can log in and edit content here. |
| `payload-mcp-api-keys` | System | API keys for the Payload MCP server used by AI coding tools. Unrelated to storefront/customer data. |
| `redirects` | System | URL redirect rules for retired or renamed Pages/Posts URLs. Applied automatically. |
| `search` | (plugin default) | Auto-generated search index built from published Posts and Products. Don't edit directly. |
| `header` (global) | Layout (new group) | Site navigation and header content shown on every page. |
| `footer` (global) | Layout (new group) | Footer navigation, links, and copyright shown on every page. |

`site-theme`, `studio-info`, `login-theme` already have descriptions — left unchanged.

### 2. Fix `products` preview link

Add to `src/collections/Products.ts` `admin` block, matching the existing `Pages`/`Posts`/`Events` pattern:

```ts
livePreview: {
  url: ({ data, req }) =>
    generatePreviewPath({ slug: data?.slug, collection: 'products', req }),
},
preview: (data, { req }) =>
  generatePreviewPath({ slug: data?.slug as string, collection: 'products', req }),
```

Add `products: '/products'` to `collectionPrefixMap` in `src/utilities/generatePreviewPath.ts`.

### 3. Fix `events` preview link + build the detail page

- Add `events: '/events'` to `collectionPrefixMap` so `Events.ts`'s existing preview/livePreview config (already correctly written) resolves to a real path instead of `undefined/<slug>`.
- New route `src/app/(frontend)/events/[slug]/page.tsx`, following the shape of `src/app/(frontend)/how-to/[slug]/page.tsx`: `generateStaticParams`, SEO meta via the `seoPlugin` fields already on `Events`, draft-mode support through `authenticatedOrPublished` access.
- Update the event cards in `src/app/(frontend)/events/page.tsx` to link to `/events/[slug]`.
- Extend `eventsRevalidateHooks` (`src/utilities/revalidate.ts`) to also revalidate the new detail path, alongside the existing listing revalidation.

### 4. Dashboard landing page — fill the "More Content" gap

In `src/components/BeforeDashboard/index.tsx`, add links for Events, How-To Guides, Quizzes, and Scent Profiles to the existing "More Content" footer row (not the Quick Access grid, to avoid additional count queries for items that don't need one):

```
Pages & Content · Media · Posts · Events · How-To Guides · Scent Quiz · Scent Profiles · SEO Briefs
```

Update the `SectionTooltip` copy for "More Content" to mention the added entries.

## Out of scope

- Field-level `admin.description` additions.
- Any collection/global removal — audit found nothing safe or intended to delete.
- Redesigning `ThemePresetSwitcher`, `LoginThemeCycler`, `EtsyIntegrationPanel`, or the Quick Access grid layout.
- Adding a dedicated `/categories/[slug]` archive route — categories remain relationship-only, matching current site IA.

## Testing

- **Types & lint:** `pnpm generate:types` (no schema change, but confirms nothing broke) and `vp check`.
- **Int test** (`tests/int/`): extend or add a spec asserting `generatePreviewPath({ collection: 'products' | 'events', slug, req })` returns a path containing `/products/` or `/events/` respectively (regression guard against the `undefined/<slug>` bug).
- **E2E** (`tests/e2e/`): new spec visiting `/events/<seeded-slug>` and asserting the page renders event details (title, date, venue) — no seeded event detail page exists today, so this is new coverage, not just a regression check.
- **Manual verification via dev server:**
  1. Admin sidebar: confirm every collection/global shows its new description under the label in list view, and `media`/`header`/`footer` show their new groups.
  2. Open a `Products` document in the admin editor, confirm the "Live Preview" tab now renders the storefront product page instead of being unavailable.
  3. Open an `Events` document, confirm Live Preview renders the new `/events/[slug]` page instead of a broken/blank preview.
  4. Visit `/events/<slug>` directly in the browser for a seeded event; confirm it renders and that `/events` listing links to it correctly.
  5. Dashboard home: confirm the "More Content" row now includes Events, How-To Guides, Scent Quiz, and Scent Profiles links, and each resolves to the correct admin list view.
