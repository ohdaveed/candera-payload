# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the landing page redesign across seven sections — hero, scent quiz CTA band, collection grid, testimonials, blog, inner circle, and footer — per the design spec at `docs/superpowers/specs/2026-06-14-landing-page-redesign-design.md`.

**Architecture:** Each section maps to an existing Payload CMS block component. Changes are isolated to individual component files with no shared-state coupling. The only cross-cutting change is block order in `home.ts` (seed) and `RenderBlocks.tsx` (runtime renderer). The ScentQuiz block gains a visible CTA band wrapper; the existing modal (`ScentQuizModal`, triggered by `#scent-quiz` hash) is preserved unchanged.

**Tech Stack:** Next.js 15 App Router, Payload CMS, Tailwind CSS v4, Framer Motion, React Hook Form

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/blocks/StorefrontHero/Component.tsx` | Modify | Remove status strip + right aside; update overlay gradients and CTA button styles |
| `src/blocks/ScentQuiz/CTABand.tsx` | **Create** | New client component — dark horizontal CTA band that triggers the existing `#scent-quiz` modal |
| `src/blocks/RenderBlocks.tsx` | Modify | Wire `scentQuiz` to render `CTABand` + existing `ScentQuizModal`; reorder block spacing rules |
| `src/endpoints/seed/home.ts` | Modify | Move `scentQuiz` block to position 2 (after hero); set `showStatusCard: false` |
| `src/components/CollectionArchive/index.tsx` | Modify | Replace flex grid with `280px / 1fr` CSS grid; add sticky sidebar |
| `src/components/Card/index.tsx` | Modify | Tag inset `top-4 left-4`; three-tier type hierarchy; price margin |
| `src/blocks/Testimonials/Component.tsx` | Modify | Redesign to two-column asymmetric dark layout per spec |
| `src/blocks/InnerCircleCTA/Component.tsx` | Modify | Two-col grid, heading-only left, form + microcopy right |
| `src/blocks/InnerCircleCTA/EmailForm.tsx` | Modify | Input border/bg affordance; remove perks from this component |
| `src/Footer/Component.tsx` | Modify | Nav links to `block py-2`; text neutral-400; headings neutral-200 |

---

## Task 1: Hero — Remove Status Strip and Right Aside

**Files:**
- Modify: `src/blocks/StorefrontHero/Component.tsx`
- Modify: `src/endpoints/seed/home.ts`

The current hero renders a radial scrim + left-to-right gradient + a bottom fade-to-vellum gradient + a right `<aside>` with studio facts. The spec removes the bottom fade, the aside, and the status strip. The left gradient becomes a `110deg` directional gradient (`rgba(8,6,4,0.95)` → transparent). The primary CTA uses `variant="cta-ember"` (already exists). The secondary CTA becomes a ghost button with a border.

- [ ] **Step 1: Update `StorefrontHeroBlock` in `src/blocks/StorefrontHero/Component.tsx`**

Replace the entire component body with:

```tsx
export const StorefrontHeroBlock: React.FC<Props> = ({
  heroTag,
  headline,
  subheading,
  media,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
}) => {
  return (
    <Section
      padding="none"
      className="relative flex min-h-[560px] md:min-h-[700px] items-end overflow-hidden bg-candera-obsidian"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0" aria-hidden="true">
          <Media
            fill
            imgClassName="object-cover brightness-[0.38]"
            priority
            resource={media}
          />
        </div>
      )}

      {/* 110deg directional gradient — left heavy, fades to transparent */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(110deg, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.55) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Content */}
      <Container className="relative z-10 pb-14 pt-32 md:pt-44 max-w-[600px]">
        <header className="flex flex-col items-start text-left">
          {heroTag && (
            <div className="flex items-center gap-3 mb-6">
              <span className="w-7 h-[1px] bg-candera-ember" aria-hidden="true" />
              <Eyebrow className="text-candera-ember">{heroTag}</Eyebrow>
            </div>
          )}

          <h1
            className="text-candera-vellum m-0 font-display font-normal italic tracking-tight leading-[1.0]"
            style={{ fontSize: 'clamp(3rem, 6.5vw, 4.75rem)' }}
          >
            {headline}
          </h1>

          {/* Ember rule between headline and subheading */}
          <span className="block w-10 h-[1px] bg-candera-ember mt-5 mb-4" aria-hidden="true" />

          {subheading && (
            <p className="font-display italic text-[14px] text-white/65 leading-[1.75] max-w-[360px] m-0">
              {subheading}
            </p>
          )}

          <nav className="flex flex-wrap items-center gap-4 mt-8">
            {primaryCtaLabel && primaryCtaUrl && (
              <Button asChild variant="cta-ember" size="cta">
                <Link href={primaryCtaUrl}>
                  {primaryCtaLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaUrl && (
              <Link
                href={secondaryCtaUrl}
                className="font-sans text-[10px] font-600 uppercase tracking-[.25em] text-candera-vellum border border-white/40 px-6 py-[14px] hover:border-white/70 transition-colors"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </nav>
        </header>
      </Container>
    </Section>
  )
}
```

Keep all imports at the top of the file. Remove the `StudioStatusStrip` component and `StatusCardProps` type entirely — they are no longer used.

- [ ] **Step 2: Update seed to turn off status card**

In `src/endpoints/seed/home.ts`, change the hero block:

```ts
// Change:
showStatusCard: true,
statusCardTitle: 'Studio Status',
statusCardSubtitle: 'Hand-pouring series 01',
statusCardStatus: 'In Progress',
statusCardShips: 'Coming Soon',
// To:
showStatusCard: false,
```

- [ ] **Step 3: Verify the page builds**

```bash
pnpm build 2>&1 | tail -20
```

Expected: no TypeScript errors about missing props. The `showStatusCard`, `statusCardTitle`, etc. props still exist in the type — we're just not rendering the strip anymore.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/StorefrontHero/Component.tsx src/endpoints/seed/home.ts
git commit -m "feat: hero — remove status strip and right aside, directional gradient overlay"
```

---

## Task 2: Scent Quiz — Add CTA Band Wrapper

**Files:**
- Create: `src/blocks/ScentQuiz/CTABand.tsx`
- Modify: `src/blocks/RenderBlocks.tsx`
- Modify: `src/endpoints/seed/home.ts`

The existing `ScentQuizModal` (in `ClientBlock.tsx`) opens when `window.location.hash === '#scent-quiz'`. The new CTA band is a dark horizontal section that renders a "Take the Scent Quiz →" button. Clicking it navigates to `#scent-quiz`, which triggers the existing modal. The `ScentQuizModal` stays mounted as a sibling portal — we just add the visible band above it.

- [ ] **Step 1: Create `src/blocks/ScentQuiz/CTABand.tsx`**

```tsx
'use client'

import React from 'react'
import Link from 'next/link'

type Props = {
  eyebrow?: string | null
  headline?: string | null
  body?: string | null
}

export const ScentQuizCTABand: React.FC<Props> = ({
  eyebrow = 'Find Your Scent',
  headline = 'Not sure where to start?',
  body = "Answer a few questions and we'll match you to the candle that fits your space, your mood, and your ritual — before you have to browse.",
}) => (
  <section
    style={{
      background: 'var(--candera-obsidian)',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: '40px',
      padding: '48px 52px',
      borderBottom: '1px solid rgba(196,168,130,0.12)',
    }}
  >
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0">
          {eyebrow}
        </p>
      )}
      {headline && (
        <h2 className="font-display italic text-[26px] text-candera-vellum leading-[1.2] m-0">
          {headline}
        </h2>
      )}
      {body && (
        <p className="font-sans text-[13px] text-candera-sage-text leading-[1.6] max-w-[440px] m-0 mt-1">
          {body}
        </p>
      )}
    </div>
    <Link
      href="#scent-quiz"
      className="font-sans text-[10px] font-bold uppercase tracking-[3px] px-8 py-4 no-underline whitespace-nowrap"
      style={{ background: 'var(--candera-ember)', color: '#0a0806' }}
    >
      Take the Scent Quiz →
    </Link>
  </section>
)
```

- [ ] **Step 2: Update `src/blocks/RenderBlocks.tsx` to render the CTA band + existing modal**

Add the import at the top:

```tsx
import { ScentQuizCTABand } from '@/blocks/ScentQuiz/CTABand'
```

Replace the `scentQuiz` case in the render loop:

```tsx
if (blockType === 'scentQuiz') {
  return (
    <React.Fragment key={index}>
      {/* Visible CTA band — navigates to #scent-quiz which opens the modal */}
      <ScentQuizCTABand
        eyebrow={(block as any).eyebrow}
        headline={(block as any).headline}
        body={(block as any).body}
      />
      {/* Modal portal — always mounted, listens for #scent-quiz hash */}
      {/* @ts-expect-error block type mismatch */}
      <Block {...block} />
    </React.Fragment>
  )
}
```

- [ ] **Step 3: Move `scentQuiz` block to position 2 in `src/endpoints/seed/home.ts`**

The current layout array order is: `storefrontHero`, `archive`, `testimonials`, `scentQuiz`, `innerCircleCTA`.

Reorder to: `storefrontHero`, `scentQuiz`, `archive`, `testimonials`, `innerCircleCTA`.

Cut the `scentQuiz` block object (it starts with `blockName: 'Scent Quiz'`) and paste it immediately after the `storefrontHero` block.

- [ ] **Step 4: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep -E "error|CTABand|scentQuiz"
```

Expected: no errors on the new file.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/ScentQuiz/CTABand.tsx src/blocks/RenderBlocks.tsx src/endpoints/seed/home.ts
git commit -m "feat: scent quiz — add CTA band intercept before collection, preserve modal"
```

---

## Task 3: Collection Grid — Sidebar + Grid Layout

**Files:**
- Modify: `src/components/CollectionArchive/index.tsx`

The current layout is a `flex-wrap` list of cards. Replace with a CSS grid: fixed `280px` left sidebar (sticky) + `1fr` card grid. The sidebar contains the section header from `introContent` (already passed by `ArchiveBlock`). The right grid is 3-column.

Note: `CollectionArchive` currently receives `posts` and `relationTo`. The sidebar copy ("Not manufactured. Made." etc.) currently lives in `introContent` rich text rendered by `ArchiveBlock`. For the sidebar we render it as static JSX matching the seed values — it doesn't need to be CMS-driven for v1.

- [ ] **Step 1: Rewrite `src/components/CollectionArchive/index.tsx`**

```tsx
import React from 'react'
import Link from 'next/link'
import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
}

export const CollectionArchive: React.FC<Props> = ({ posts, relationTo = 'posts' }) => {
  const collectionPath = relationTo === 'products' ? '/products' : '/posts'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        background: 'var(--candera-vellum)',
      }}
    >
      {/* Left sidebar — sticky, top-aligned with first image row */}
      <div
        style={{
          padding: '28px 36px 28px 52px',
          borderRight: '1px solid rgba(180,160,130,0.18)',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
          background: 'var(--candera-vellum)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-candera-sage-text m-0">
          The Collection
        </p>
        <h2 className="font-display text-[24px] text-candera-obsidian leading-[1.15] m-0">
          Not manufactured.<br />Made.
        </h2>
        <p className="font-sans text-[12px] text-candera-sage-text leading-[1.75] m-0">
          Every Candera candle designed, poured, and finished by hand — by Olesia, the only maker.
          No two are exactly alike.
        </p>
        <Link
          href={collectionPath}
          className="font-sans text-[9px] font-bold uppercase tracking-[3px] text-candera-obsidian no-underline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '13px 20px 13px 0',
            borderBottom: '1px solid var(--candera-ember)',
            width: 'fit-content',
          }}
        >
          View all →
        </Link>
      </div>

      {/* Right — 3-column product grid */}
      <div style={{ padding: '28px 52px 28px 0' }}>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {posts?.map((result, index) => {
            if (typeof result !== 'object' || result === null) return null

            const { slug, categories, meta, title, tagline, extraPhotos, scentProfile, burnTime, atmosphere, productTag, vessel, price } = result

            const minimizedDoc = {
              slug,
              categories: categories?.map((cat) =>
                typeof cat === 'object' ? { title: cat.title } : cat,
              ),
              meta: { description: meta?.description, image: meta?.image },
              title, tagline, extraPhotos, scentProfile, burnTime, atmosphere, productTag, vessel, price,
            }

            return (
              <li key={index}>
                <Card
                  className="h-full"
                  doc={minimizedDoc as CardPostData}
                  relationTo={relationTo}
                  showCategories
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "CollectionArchive"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/CollectionArchive/index.tsx
git commit -m "feat: collection — 280px sticky sidebar + 3-col product grid"
```

---

## Task 4: Card — Tag Inset, Type Hierarchy, Price Spacing

**Files:**
- Modify: `src/components/Card/index.tsx`

Three targeted changes:
1. `ProductTagBadge` wrapper already uses `absolute top-4 left-4` — confirm it's `top-4 left-4` not 0.
2. Add category label below image with correct faint color.
3. Price gets `mt-[10px]` and a darker mid-tone color.

The card body area currently renders `tagline` (an italic description) and a `FragranceProfile`. For the redesign, the visible hierarchy should be: category (faint) → title (darkest) → price (mid-tone). Tagline and fragrance profile stay — they're revealed on hover/in quick view.

- [ ] **Step 1: Replace the `CardHeader` block in `src/components/Card/index.tsx`**

Find and replace this exact block (lines 172–195):

```tsx
// REPLACE THIS:
        <CardHeader className="pt-6 pb-3 px-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5 px-0">
              {titleToUse ? (
                <CardTitle className="m-0 text-balance text-[18px] font-medium leading-snug not-italic text-candera-obsidian transition-colors group-hover:text-candera-ember-strong line-clamp-2 min-h-[3rem] border-none p-0 bg-transparent shadow-none">
                  <Link
                    href={href}
                    ref={linkRef}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {titleToUse}
                  </Link>
                </CardTitle>
              ) : null}
            </div>
            {price != null && (
              <span className="price text-[15px] font-medium shrink-0 pt-4 px-0">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  Number(price),
                )}
              </span>
            )}
          </div>
        </CardHeader>
```

```tsx
// WITH THIS:
        <CardHeader className="pt-4 pb-2 px-4">
          <div className="flex flex-col">
            {/* Category — faint, de-emphasized (for products) */}
            {showCategories && hasCategories && relationTo === 'products' && (
              <div className="flex items-center gap-1 mb-1">
                {categories?.map((category, i) => {
                  if (typeof category === 'object' && category !== null) {
                    const { title: titleOfCategory } = category
                    const isLast = i === categories.length - 1
                    return (
                      <Fragment key={i}>
                        <p className="font-sans text-[9px] font-normal uppercase tracking-[3px] text-[#b8aa98] m-0">
                          {titleOfCategory}
                        </p>
                        {!isLast && <span className="text-[#b8aa98]">,&nbsp;</span>}
                      </Fragment>
                    )
                  }
                  return null
                })}
              </div>
            )}
            {/* Title — darkest */}
            {titleToUse ? (
              <CardTitle className="m-0 font-display text-[16px] font-normal not-italic leading-[1.3] text-[#0f0d0b] border-none p-0 bg-transparent shadow-none">
                <Link
                  href={href}
                  ref={linkRef}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:text-candera-ember transition-colors"
                >
                  {titleToUse}
                </Link>
              </CardTitle>
            ) : null}
            {/* Price — mid-tone, clear gap */}
            {price != null && (
              <p className="font-sans text-[13px] font-semibold text-[#4a3f34] mt-[10px] m-0 tabular-nums">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                  Number(price),
                )}
              </p>
            )}
          </div>
        </CardHeader>
```

- [ ] **Step 2: Remove the duplicate category rendering from `CardContent`**

In the same file, find the `CardContent` block. It has a category fallback gated on `!scentProfile`. Remove it entirely since category is now in `CardHeader`:

```tsx
// REMOVE THIS BLOCK:
          {/* Categories fallback for posts */}
          {showCategories && hasCategories && !scentProfile && (
            <div className="uppercase text-[10px] font-bold tracking-widest text-candera-sage-text mt-auto px-0">
              {categories?.map((category, index) => {
                if (category && typeof category === 'object') {
                  const { title: titleFromCategory } = category
                  const categoryTitle = titleFromCategory || 'Untitled category'
                  const isLast = index === categories.length - 1
                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment> &bull; </Fragment>}
                    </Fragment>
                  )
                }
                return null
              })}
            </div>
          )}
```

- [ ] **Step 3: Confirm `ProductTagBadge` wrapper is `top-4 left-4`**

In `src/components/Card/index.tsx`, find the `productTag` rendering. It should already be:

```tsx
{productTag ? (
  <div className="absolute top-4 left-4 z-10">
    <ProductTagBadge tag={productTag} />
  </div>
) : null}
```

If `top-0 left-0` or `top-2 left-2`, update to `top-4 left-4`. No other change needed.

- [ ] **Step 4: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "Card"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Card/index.tsx
git commit -m "feat: card — tag inset top-4/left-4, three-tier type hierarchy, price mt-10"
```

---

## Task 5: Testimonials — Asymmetric Two-Column Dark Layout

**Files:**
- Modify: `src/blocks/Testimonials/Component.tsx`

The current layout is a large featured quote + compact grid below it (all in a vertical column). The spec is a strict two-column CSS grid: featured quote fills the left column, two stacked smaller quotes fill the right column. Both columns are the same height (grid row stretch).

- [ ] **Step 1: Rewrite `src/blocks/Testimonials/Component.tsx`**

```tsx
import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  const [featured, ...rest] = items
  const secondary = rest.slice(0, 2)

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--candera-obsidian)',
      }}
    >
      {/* Left — featured quote */}
      <div
        style={{
          padding: '52px 48px',
          borderRight: '1px solid rgba(196,168,130,0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {eyebrow && (
          <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0 mb-6">
            {eyebrow}
          </p>
        )}
        {featured && (
          <>
            <p
              className="font-display text-candera-ember m-0 leading-[0.7]"
              style={{ fontSize: '56px', opacity: 0.18 }}
              aria-hidden="true"
            >
              &ldquo;
            </p>
            <blockquote className="m-0 mt-3">
              <p className="font-display italic text-[20px] text-candera-vellum leading-[1.6] m-0">
                &ldquo;{featured.quote}&rdquo;
              </p>
            </blockquote>
            <p className="font-sans text-[9px] font-bold uppercase tracking-[2px] text-candera-ember m-0 mt-5">
              {featured.author}
              {featured.location ? ` — ${featured.location}` : ''}
              {featured.badge ? ` · ${featured.badge}` : ''}
            </p>
          </>
        )}
      </div>

      {/* Right — two stacked secondary quotes */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {secondary.map((t, i) => (
          <div
            key={i}
            style={{
              padding: '30px 40px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderBottom: i < secondary.length - 1 ? '1px solid rgba(196,168,130,0.07)' : 'none',
            }}
          >
            <blockquote className="m-0">
              <p className="font-display italic text-[13px] text-[#b0a090] leading-[1.65] m-0">
                &ldquo;{t.quote}&rdquo;
              </p>
            </blockquote>
            <p className="font-sans text-[8px] font-bold uppercase tracking-[2px] text-[#6b5e50] m-0 mt-2">
              {t.author}
              {t.location ? ` — ${t.location}` : ''}
              {t.badge ? ` · ${t.badge}` : ''}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "Testimonials"
```

Expected: no errors. The `TestimonialsBlockType` has `items` with `quote`, `author`, `location`, `badge`.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/Testimonials/Component.tsx
git commit -m "feat: testimonials — two-column asymmetric dark layout, featured left, stacked right"
```

---

## Task 6: Inner Circle — Two-Col Grid, Input Affordance, Consolidated Microcopy

**Files:**
- Modify: `src/blocks/InnerCircleCTA/Component.tsx`
- Modify: `src/blocks/InnerCircleCTA/EmailForm.tsx`

The current layout is a centered single-column overlay with a full-bleed background image. The spec is a two-column grid with `align-items: center`: left has heading + body only (no bullets), right has input + button + microcopy below.

- [ ] **Step 1: Rewrite `src/blocks/InnerCircleCTA/Component.tsx`**

```tsx
import React from 'react'
import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { InnerCircleEmailForm } from './EmailForm'
import type { InnerCircleCTABlock as InnerCircleCTABlockType } from '@/payload-types'

type Props = InnerCircleCTABlockType & { disableInnerContainer?: boolean }

const getInnerCircleFormId = cache(async () => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'forms',
    where: { title: { equals: 'Inner Circle Signup' } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0]?.id?.toString() ?? ''
})

export async function InnerCircleCTABlock({ headline, description }: Props) {
  const formId = await getInnerCircleFormId()

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        background: 'var(--candera-obsidian)',
        padding: '52px',
        gap: '52px',
      }}
    >
      {/* Left — heading + body only, no bullets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{ display: 'block', width: '24px', height: '1px', background: 'var(--candera-ember)' }}
            aria-hidden="true"
          />
          <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0">
            Join the Inner Circle
          </p>
        </div>
        <h2 className="font-display text-[28px] text-candera-vellum leading-[1.2] m-0">
          {headline}
        </h2>
        {description && (
          <p className="font-sans text-[14px] leading-[1.75] m-0" style={{ color: '#a3a3a3' }}>
            {description}
          </p>
        )}
      </div>

      {/* Right — form + microcopy below */}
      <InnerCircleEmailForm formId={formId} />
    </section>
  )
}
```

- [ ] **Step 2: Add input CSS to `src/app/(frontend)/theme.css`**

Append at the end of the file:

```css
/* Inner Circle email input — explicit dark affordance */
.ic-email-input {
  flex: 1;
  padding: 13px 16px;
  background: #171717;
  border: 1px solid #525252;
  color: #f3f4f6;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ic-email-input::placeholder { color: #6b7280; }
.ic-email-input:focus {
  border-color: #d4d4d4;
  box-shadow: 0 0 0 1px #d4d4d4;
}
```

- [ ] **Step 3: Rewrite `src/blocks/InnerCircleCTA/EmailForm.tsx`**

Replace the entire render return with the new layout. Keep all existing state/hooks — only the JSX changes:

```tsx
// Keep all imports, state, hooks, and onSubmit callback unchanged.
// Replace only the return statement:

  if (hasSubmitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p className="font-sans text-[13px] text-candera-vellum m-0">
          You&apos;re in. We&apos;ll be in touch before the next batch.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'flex' }}>
          <input
            id="ic-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-label="Email address"
            className="ic-email-input"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            })}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '13px 24px',
              background: '#f5f5f5',
              color: '#0a0a0a',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '…' : 'Join'}
          </button>
        </div>
        {errors.email && (
          <p className="font-sans text-[10px] text-red-400 m-0 mt-1">{errors.email.message}</p>
        )}
        {error && (
          <p className="font-sans text-[10px] text-red-400 m-0 mt-1">{error}</p>
        )}
      </form>

      {/* All microcopy consolidated directly below the input */}
      <p className="font-sans text-[10px] m-0" style={{ color: '#525252' }}>
        Early access · Studio notes · No spam · Unsubscribe any time
      </p>
    </div>
  )
```

- [ ] **Step 3: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "InnerCircle\|EmailForm"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/InnerCircleCTA/Component.tsx src/blocks/InnerCircleCTA/EmailForm.tsx src/app/\(frontend\)/theme.css
git commit -m "feat: inner circle — two-col grid, visible input border, microcopy below input"
```

---

## Task 7: Footer — Contrast and Touch Targets

**Files:**
- Modify: `src/Footer/Component.tsx`

The current footer uses `text-candera-sage-text` for nav links (a mid-tone warm gray that may fail WCAG AA on the linen background). The footer background is `bg-candera-linen` with `border-t border-candera-stone/30` — it's a **light** footer, not the dark `#0c0a08` mockup. The spec mockup showed a dark footer, but the real component is light. Apply the contrast and Fitts's Law changes within the existing light design.

Changes:
1. Nav link `<CMSLink>` components already have `min-h-[44px] flex items-center` — this satisfies Fitts's Law. Confirm this is present and not `gap-1` collapsing them.
2. The `gap-1` on the nav `flex flex-col` is tight. Change to `gap-0` and rely on the `min-h-[44px]` per-link for spacing.
3. Footer heading color: change from `text-candera-sage-text` to a slightly darker `text-candera-obsidian/70` so it reads as a header.
4. Link color: `text-candera-obsidian` is fine for light bg — keep it but remove `font-light` in favor of `font-normal` for better readability.

- [ ] **Step 1: Update nav column headings in `src/Footer/Component.tsx`**

Find the two `<h5>` elements (Navigation and Assistance headings):

```tsx
// Change:
<h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-sage-text mb-6">
// To:
<h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-obsidian mb-6">
```

Apply to both Navigation and Assistance column headings.

- [ ] **Step 2: Update nav link weight from font-light to font-normal**

Find all `CMSLink` and `Link` elements in the nav sections. They currently have `font-light`. Change to `font-normal`:

```tsx
// Change all instances of:
className="font-sans text-[14px] font-light text-candera-obsidian no-underline hover:text-candera-ember-strong transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm min-h-[44px] flex items-center"
// To:
className="font-sans text-[14px] font-normal text-candera-obsidian no-underline hover:text-candera-ember-strong transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm min-h-[44px] flex items-center"
```

This applies to `navItems`, `assistanceItems`, and the hardcoded fallback links inside `assistanceItems.length === 0`.

- [ ] **Step 3: Tighten nav flex gap**

```tsx
// Change (in each nav Section):
className="flex flex-col gap-1"
// To:
className="flex flex-col gap-0"
```

The `min-h-[44px]` on each link already provides the touch target height. `gap-1` was adding extra space on top of that; `gap-0` gives clean stacking.

- [ ] **Step 4: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "Footer"
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/Footer/Component.tsx
git commit -m "feat: footer — heading contrast, font-normal links, gap-0 for clean min-h touch targets"
```

---

## Task 8: ArchiveBlock — Hide Intro Content (Collection Sidebar Owns It)

**Files:**
- Modify: `src/blocks/ArchiveBlock/Component.tsx`

The `ArchiveBlock` currently renders `introContent` (a RichText) above the `CollectionArchive`. Now that `CollectionArchive` renders its own sidebar with the section header, rendering `introContent` would duplicate the heading. Suppress it for the `products` relation type.

- [ ] **Step 1: Read the current ArchiveBlock component**

```bash
cat src/blocks/ArchiveBlock/Component.tsx
```

Find where `introContent` is rendered — it's likely a `<RichText>` or `<Container>` block above the `<CollectionArchive />` call.

- [ ] **Step 2: Conditionally suppress introContent for products**

Wrap the introContent render in a condition:

```tsx
{/* Only show introContent for posts (blog) — products use the CollectionArchive sidebar */}
{introContent && relationTo !== 'products' && (
  <RichText data={introContent} enableGutter={false} />
)}
```

If the variable is named differently (e.g. `intro`, `content`), use the actual variable name from the file.

- [ ] **Step 3: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "ArchiveBlock\|archive"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/ArchiveBlock/Component.tsx
git commit -m "feat: archive — suppress introContent for products (sidebar owns the header)"
```

---

## Task 9: Seed Reorder — Update Home Page Layout Array

**Files:**
- Modify: `src/endpoints/seed/home.ts`

Task 2 already moved `scentQuiz` to position 2. This task confirms the full array order matches the spec and updates the `archive` block to use `relationTo: 'products'` (the archive currently says `relationTo: 'posts'` which would show blog posts, not products).

- [ ] **Step 1: Confirm block order in `src/endpoints/seed/home.ts`**

The `layout` array should be:
1. `storefrontHero`
2. `scentQuiz`
3. `archive` (products)
4. `testimonials`
5. `innerCircleCTA`

If blog posts are a separate ArchiveBlock on this page, keep it between testimonials and innerCircleCTA.

- [ ] **Step 2: Fix archive block `relationTo`**

```ts
// If the archive block has:
relationTo: 'posts',
// And it's meant to show products, change to:
relationTo: 'products',
```

Check the seed — the block comment says `'Product Archive'` but the value is `'posts'`. Update:

```ts
{
  blockName: 'Product Archive',
  blockType: 'archive',
  categories: [],
  introContent: createRichText([
    createHeading(COLLECTION_HEADING, 'h2'),
    createParagraph(COLLECTION_BODY),
  ]),
  populateBy: 'collection',
  relationTo: 'products',  // was 'posts'
  limit: 6,
},
```

- [ ] **Step 3: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "home\|seed"
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/home.ts
git commit -m "fix: home seed — archive relationTo products, confirm block order matches spec"
```

---

## Task 10: RenderBlocks — Block Spacing for New Architecture

**Files:**
- Modify: `src/blocks/RenderBlocks.tsx`

The current spacing logic adds `my-16` to non-full-bleed blocks and `mt-32 md:mt-48` to anything following `storefrontHero`. With the new architecture, `scentQuiz` follows `storefrontHero` and should have no top margin (it's a flush dark band). The `testimonials` block should also be full-bleed (no margin).

- [ ] **Step 1: Update `fullBleedBlocks` set and `followsStorefrontHero` logic**

```tsx
const fullBleedBlocks = new Set([
  'storefrontHero',
  'testimonials',
  'innerCircleCTA',
  'scentQuiz',    // add — the CTA band is full-width flush
])
```

And update the `followsStorefrontHero` logic — the extra top margin was added to create space after the hero's bottom fade gradient. Since the gradient is removed, this spacing is no longer needed:

```tsx
// Remove:
const followsStorefrontHero = previousBlock?.blockType === 'storefrontHero'
// And remove this from the className:
followsStorefrontHero ? 'mt-32 md:mt-48' : '',
```

Full updated wrapper div:

```tsx
return (
  <div
    className={isFullBleed ? '' : 'my-16'}
    id={blockType === 'archive' ? 'collection' : undefined}
    data-block={blockType}
    data-block-index={index}
    key={index}
  >
    {/* @ts-expect-error there may be some mismatch between the expected types here */}
    <Block {...block} disableInnerContainer />
  </div>
)
```

- [ ] **Step 2: Check TypeScript**

```bash
pnpm typecheck 2>&1 | grep "RenderBlocks"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/blocks/RenderBlocks.tsx
git commit -m "feat: render blocks — scentQuiz full-bleed, remove post-hero top margin"
```

---

## Task 11: Final Build Verification

- [ ] **Step 1: Full TypeScript check**

```bash
pnpm typecheck
```

Expected: 0 errors.

- [ ] **Step 2: Production build**

```bash
pnpm build 2>&1 | tail -30
```

Expected: build completes with no errors. Ignore warnings about `@ts-expect-error` directives.

- [ ] **Step 3: Dev server smoke test**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- Hero: full-bleed image, left-aligned text, no status strip, no right aside, ember rule between headline and subheading, two CTA buttons
- Section 2: dark horizontal band with quiz copy left and "Take the Scent Quiz →" button right; clicking opens the quiz modal
- Section 3: 280px sticky sidebar ("Not manufactured. Made.") + 3-column product grid; top edges align
- Product cards: tag badge `top-4 left-4`; category faint gray; title darkest; price with gap
- Section 4: two-column testimonials, featured left, two stacked right, all on obsidian bg
- Section 6: two-col inner circle, heading-only left, input with visible border right, microcopy below input
- Footer: readable link text, headings distinct from links

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: landing page redesign — all sections complete per 2026-06-14 design spec"
```
