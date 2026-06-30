# Candera Payload — Debug Findings & Architecture Review

> Compiled from agent sessions: June 29, 2026

---

## Table of Contents

1. [MCP Plugin Debugging & Fixes](#1-mcp-plugin-debugging--fixes)
2. [Landing Page Improvements](#2-landing-page-improvements)
3. [Architecture Review](#3-architecture-review)
4. [Risk Remediation Plan](#4-risk-remediation-plan)
5. [Files Modified](#5-files-modified)

---

## 1. MCP Plugin Debugging & Fixes

### 1.1 Initial State

The project uses `@payloadcms/plugin-mcp@3.85.1` to expose AI agent write access to Payload CMS via the Model Context Protocol (MCP) at `POST /api/mcp`.

A pnpm patch file existed at `patches/@payloadcms__plugin-mcp.patch` addressing a Zod v4 `"use strict"` transpilation issue in `convertCollectionSchemaToZod.js`.

### 1.2 Bugs Found & Fixed

#### Bug A: `"use strict"` in transpiled Zod schema code

**File:** `dist/utils/schemaConversion/convertCollectionSchemaToZod.js`

**Problem:** TypeScript's `transpileModule` prepends `"use strict";` to output. When passed to `new Function('z', 'return "use strict"; ...')`, this throws a `SyntaxError` because `"use strict"` is a statement, not an expression.

**Fix:** Strip `"use strict";` from transpiled code before passing to `new Function`:

```js
let code = transpileResult.outputText;
code = code.replace(/^["']use strict["'];\s*/, '');
return new Function('z', `return ${code}`)(z);
```

**Status:** ✅ Already patched before this session.

#### Bug B: Authorization header operator precedence

**File:** `dist/endpoints/mcp.js`

**Problem:** JavaScript operator precedence causes `overrideApiKey ?? condition ? value : null` to parse as `(overrideApiKey ?? condition) ? value : null` instead of `overrideApiKey ?? (condition ? value : null)`. When `overrideApiKey` is provided, the ternary picks the Authorization header value instead of the override.

**Original:**
```js
const apiKey = overrideApiKey ?? req.headers.get('Authorization')?.startsWith('Bearer ') ? req.headers.get('Authorization')?.replace('Bearer ', '').trim() : null;
```

**Fix:** Wrap the ternary in parentheses:
```js
const apiKey = overrideApiKey ?? (req.headers.get('Authorization')?.startsWith('Bearer ') ? req.headers.get('Authorization')?.replace('Bearer ', '').trim() : null);
```

**Status:** ✅ Patched (via extended pnpm patch).

**Note:** Dormant in normal usage — `overrideApiKey` is never passed. Would only manifest if `pluginOptions.overrideAuth` is configured.

#### Bug C: Test script port mismatch

**File:** `scripts/test-mcp-conn.ts`

**Problem:** Used `localhost:3001` instead of `localhost:3000`.

**Fix:** Changed port to 3000 and wrapped `main()` in `void main().catch(...)` to satisfy `no-floating-promises` lint.

**Status:** ✅ Fixed.

---

## 2. Landing Page Improvements

### 2.1 Hero Section (`src/blocks/StorefrontHero/Component.tsx`)

| Change | Description |
|--------|-------------|
| Secondary CTA | Added "Explore the Journal →" text link below primary CTA linking to `/posts` |
| Responsive height | Changed from `min-h-[100svh]` to `min-h-[85svh] sm:min-h-[90svh] md:min-h-[100svh]` |
| Import | Added `import Link from 'next/link'` |

### 2.2 Product Cards (`src/components/Card/index.tsx`)

| Change | Description |
|--------|-------------|
| Product tag badge | Added `productTag` pill ("Bestseller", "New Release", "Limited Batch") in top-left of card |
| Customizable CTA | Changed "View Details →" to "Customize →" when `doc.isCustomizable` is true |
| DIV wrapping | Fixed missing `</div>` for `relative` wrapper around the image area |

### 2.3 Empty States (`src/blocks/ArchiveBlock/Component.tsx`)

| State | Before | After |
|-------|--------|-------|
| Journal empty | "Check back soon." + null CTA | "...Join 2,400+ intentional living readers..." + "Get notified" link |
| Products empty | (unchanged) | Already had Inner Circle CTA |

### 2.4 CTA Block (`src/blocks/CallToAction/Component.tsx`)

| Change | Description |
|--------|-------------|
| Link-count-aware layout | For 2 links: centered. For 1 or 3+: right-aligned |
| Null safety | Changed `links.length` to `links?.length` |

### 2.5 SEO & Metadata

- **`src/utilities/generateMeta.ts`** — OG images now include `width: 1200`, `height: 630`, `alt`.
- **`src/app/(frontend)/layout.tsx`** — Added `robots: { index: true, follow: true }` and `referrer`.

### 2.6 Micro-copy (`src/components/EtsyHandshake/BoutiqueLink.tsx`)

Toast updated from "Opening on Etsy / Taking you to the product listing." to "Opening Etsy / Completing your purchase on our official Etsy storefront."

---

## 3. Architecture Review

### 3.1 Route Groups

Single Next.js process with two route groups:
- `(frontend)/` — Public storefront (RSC + client components)
- `(payload)/` — CMS Admin + API

### 3.2 Collections (13)
folders, pages, posts, products, media, categories, users,
etsy-tokens, briefs, quizzes, scent-profiles, documentation, how-to-guides

Plugin-injected: redirects, forms, form-submissions, search, payload-mcp-api-keys, payload-kv, payload-jobs

### 3.3 Globals (4)
header, footer, site-theme, studio-info

### 3.4 Block Layout Builder
12 blocks: StorefrontHero, TheVessels, CallToAction, Content, MediaBlock,
Archive, FormBlock, Testimonials, InnerCircleCTA, ScentQuiz, Banner, Code

### 3.5 Plugin Composition
redirectsPlugin → nestedDocsPlugin → seoPlugin → formBuilderPlugin →
searchPlugin → mcpPlugin → sentryPlugin → storage-vercel-blob

### 3.6 Styling
Tailwind CSS v4, shadcn/ui, 9 color palettes, 4 fonts, Framer Motion

### 3.7 MCP Integration
POST /api/mcp, Bearer token auth, per-collection CRUD permissions

### 3.8 Testing
Integration: Vitest + jsdom. E2E: Playwright. Gaps: Etsy sync, MCP, Card component

---

## 4. Risk Remediation Plan

> [!NOTE]
> This matrix reflects state **before** PRs #152 (migration squash) and #153 (drift guard) were merged. Items 1 and 4 have since been addressed — see Status column.

| # | Risk | Impact | Effort | Action | Status |
|---|------|--------|--------|--------|--------|
| 1 | Schema drift in PRs (stale migrations / types) | High | Low | Add CI check | ✅ Done — migration drift guard (#153) |
| 2 | Framer Motion 129KB global | High | Medium | Extract animation leaf | Open |
| 3 | Manual Etsy sync only | Medium | Low | Vercel Cron webhook | Open |
| 4 | 33 migrations | Medium | Medium | Squash after stable | ✅ Done — squashed to single baseline (#152) |
| 5 | No MCP audit trail | Medium | Medium | afterChange hook | Open |
| 6 | Import map formatting | Low | Low | ignore-pattern | Open |

---

## 5. Files Modified

### Committed
- pnpm-lock.yaml, pnpm-workspace.yaml
- patches/@payloadcms__plugin-mcp.patch
- scripts/test-mcp-conn.ts
- src/app/(payload)/admin/importMap.js

### Uncommitted (landing page)
- src/blocks/StorefrontHero/Component.tsx
- src/components/Card/index.tsx
- src/blocks/ArchiveBlock/Component.tsx
- src/blocks/CallToAction/Component.tsx
- src/utilities/generateMeta.ts
- src/app/(frontend)/layout.tsx
- src/components/EtsyHandshake/BoutiqueLink.tsx
