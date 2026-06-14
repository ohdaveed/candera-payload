# Product Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the product variant of `Card` to use an editorial white-card layout with strong contrast, always-visible scent note pills, and a direct link to the product page (no Quick View overlay).

**Architecture:** Single-file rewrite of the product branch inside `src/components/Card/index.tsx`. The post variant is untouched. `QuickViewDialog` stays in the filesystem but is no longer rendered. `ProductTagBadge` is reused as-is.

**Tech Stack:** React, Tailwind CSS, Framer Motion, Next.js `Link`, existing Candera design tokens (`font-display`, `text-candera-obsidian`, `bg-candera-ash`, `text-candera-ember`).

---

### Task 1: Rewrite product card JSX and styles

**Files:**
- Modify: `src/components/Card/index.tsx`

- [ ] **Step 1: Read the current file**

Open `src/components/Card/index.tsx` and note the existing prop types and imports — they are largely preserved; only the JSX for the product variant changes.

- [ ] **Step 2: Replace the product card JSX**

Replace the entire `return` block of `Card` with the following. The post branch is identical to today's; only the product branch changes.

```tsx
'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Product, ScentProfile as ScentProfileType } from '@/payload-types'

import { motion, useReducedMotion } from 'framer-motion'
import { Media } from '@/components/Media'
import { ProductTagBadge } from './ProductTagBadge'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'populatedAuthors' | 'publishedAt'
> & {
  extraPhotos?: Product['extraPhotos']
  etsyListingId?: Product['etsyListingId']
  tagline?: Product['tagline']
  scentProfile?: Product['scentProfile']
  burnTime?: Product['burnTime']
  atmosphere?: string | number | ScentProfileType | null
  productTag?: Product['productTag']
  vessel?: Product['vessel']
  price?: Product['price']
  productType?: Product['productType']
  specifications?: Product['specifications']
  isCustomizable?: Product['isCustomizable']
  customizationLabel?: Product['customizationLabel']
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'products'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const prefersReducedMotion = useReducedMotion()
  const { cardRef, linkRef } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const {
    slug,
    categories,
    meta,
    title,
    tagline,
    extraPhotos,
    scentProfile,
    burnTime,
    productTag,
    vessel,
    price,
    populatedAuthors,
    publishedAt,
  } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  const imageToUse = metaImage || (extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null)

  const isPosts = relationTo === 'posts'
  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const hasScentNotes =
    scentProfile && (scentProfile.top || scentProfile.heart || scentProfile.base)

  // ── POST VARIANT ─────────────────────────────────────────────
  if (isPosts) {
    return (
      <motion.div
        initial="initial"
        whileHover="hover"
        whileTap={prefersReducedMotion ? undefined : 'tap'}
        variants={prefersReducedMotion ? {} : { tap: { scale: 0.98 } }}
        ref={cardRef as React.RefObject<HTMLDivElement>}
        className={cn('group relative flex h-full cursor-pointer flex-col', className)}
      >
        <div className="relative w-full overflow-hidden bg-candera-ash aspect-[3/2]">
          {imageToUse && typeof imageToUse !== 'string' ? (
            <Media
              fill
              imgClassName="object-cover transition-transform duration-1000 group-hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
              resource={imageToUse}
              size="33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-candera-sage-text italic">
              Image unavailable
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-candera-obsidian/10 p-6 opacity-0 pointer-events-none transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
            <Link
              href={href}
              className="flex h-[48px] w-full items-center justify-center bg-white text-[10px] font-bold uppercase tracking-[.3em] text-candera-obsidian shadow-xl transition-colors hover:bg-candera-vellum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="pt-4 pb-2 px-4 bg-white flex-1 flex flex-col">
          {titleToUse && (
            <p className="font-display text-[16px] font-normal not-italic leading-[1.3] text-candera-obsidian m-0 mb-1">
              <Link
                href={href}
                ref={linkRef}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:text-candera-ember transition-colors"
              >
                {titleToUse}
              </Link>
            </p>
          )}
          {(hasAuthors || publishedAt) && (
            <div className="flex items-center gap-2 mt-2">
              {hasAuthors && (
                <span className="font-editorial italic text-candera-sage-text text-[13px]">
                  By {formatAuthors(populatedAuthors)}
                </span>
              )}
              {hasAuthors && publishedAt && (
                <span className="text-candera-stone/40 text-[10px]">•</span>
              )}
              {publishedAt && (
                <time
                  className="font-editorial italic text-candera-sage-text text-[13px]"
                  dateTime={publishedAt}
                >
                  {formatDateTime(publishedAt)}
                </time>
              )}
            </div>
          )}
          {description && (
            <p className="font-serif italic text-[15px] text-candera-sage-text leading-relaxed line-clamp-2 mt-2">
              {sanitizedDescription}
            </p>
          )}
        </div>
      </motion.div>
    )
  }

  // ── PRODUCT VARIANT ───────────────────────────────────────────
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap={prefersReducedMotion ? undefined : 'tap'}
      variants={prefersReducedMotion ? {} : { tap: { scale: 0.98 } }}
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col bg-white overflow-hidden',
        'shadow-[0_1px_3px_rgba(20,20,18,0.06),0_4px_16px_rgba(20,20,18,0.04)]',
        'transition-all duration-300 motion-reduce:transition-none',
        'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,20,18,0.10),0_16px_40px_rgba(20,20,18,0.08)]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      {/* ── Image ── */}
      <div className="relative w-full overflow-hidden bg-candera-ash aspect-[4/5]">
        {imageToUse && typeof imageToUse !== 'string' ? (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            resource={imageToUse}
            size="33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-candera-sage-text italic">
            Image unavailable
          </div>
        )}

        {/* Product tag — top left */}
        {productTag && (
          <div className="absolute top-3.5 left-3.5 z-10">
            <ProductTagBadge tag={productTag} />
          </div>
        )}

        {/* Batch badge — top right */}
        {vessel && (
          <span className="absolute top-3.5 right-3.5 z-10 text-[8px] font-semibold uppercase tracking-[.15em] px-2.5 py-1 bg-candera-vellum/[0.92] text-candera-obsidian backdrop-blur-sm">
            Batch {vessel}
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 border-t border-[#ede8e1]">

        {/* Category label */}
        {showCategories && hasCategories && (
          <div className="flex items-center gap-1 mb-1.5">
            {categories?.map((category, i) => {
              if (typeof category === 'object' && category !== null) {
                const isLast = i === (categories.length - 1)
                return (
                  <Fragment key={i}>
                    <span className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#9e9082]">
                      {category.title}
                    </span>
                    {!isLast && <span className="text-[#9e9082]">,&nbsp;</span>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Product name */}
        {titleToUse && (
          <p className="font-display text-[20px] font-normal not-italic leading-[1.25] text-candera-obsidian m-0 mb-1">
            <Link
              href={href}
              ref={linkRef}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:text-candera-ember transition-colors"
            >
              {titleToUse}
            </Link>
          </p>
        )}

        {/* Tagline */}
        {tagline && (
          <p className="font-display italic text-[14px] text-[#5a5048] leading-[1.4] mb-3.5 m-0">
            {tagline}
          </p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[#ede8e1] mb-3.5" />

        {/* Scent note pills — always visible */}
        {hasScentNotes && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            <span className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#9e9082] mr-1">
              Scent
            </span>
            {scentProfile?.top && (
              <span className="text-[10px] text-[#5a5048] bg-candera-vellum px-2 py-0.5">
                {scentProfile.top}
              </span>
            )}
            {scentProfile?.heart && (
              <span className="text-[10px] text-[#5a5048] bg-candera-vellum px-2 py-0.5">
                {scentProfile.heart}
              </span>
            )}
            {scentProfile?.base && (
              <span className="text-[10px] text-[#5a5048] bg-candera-vellum px-2 py-0.5">
                {scentProfile.base}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          {price != null && (
            <span className="text-[16px] font-semibold text-candera-obsidian tabular-nums">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                Number(price),
              )}
            </span>
          )}
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="text-[9px] font-bold uppercase tracking-[.2em] text-candera-obsidian border-b border-candera-obsidian pb-px transition-colors hover:text-candera-ember hover:border-candera-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 3: Verify lint and types pass**

```bash
pnpm lint && pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Card/index.tsx
git commit -m "feat: redesign product card — editorial stack, contrast-compliant, no Quick View"
```

---

### Task 2: Visual verification

**Files:** none changed

- [ ] **Step 1: Open the products page**

Navigate to `http://localhost:3000/products` in a browser. Confirm:
- Cards render with white background and portrait (4:5) images
- Product name is larger and darker than tagline
- Scent note pills are always visible (no hover needed)
- Batch badge appears top-right when vessel is set
- No Quick View button appears on hover

- [ ] **Step 2: Verify hover state**

Hover over a card. Confirm:
- Card lifts slightly (`-translate-y-0.5`)
- Image zooms subtly
- "View Details →" text turns ember orange

- [ ] **Step 3: Verify click navigates to product detail**

Click anywhere on a card body. Confirm it navigates to `/products/<slug>` — not a dialog.

- [ ] **Step 4: Verify post cards are unchanged**

Navigate to `http://localhost:3000/posts`. Confirm post cards still render with 3:2 images, author/date metadata, and the hover overlay "View Details" button.

- [ ] **Step 5: Run E2E tests**

```bash
pnpm exec playwright test --reporter=line
```

Expected: all 5 tests pass.

- [ ] **Step 6: Commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: product card visual polish after verification"
```
