'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Product, ScentProfile as ScentProfileType } from '@/payload-types'

import { cva, type VariantProps } from 'class-variance-authority'
import { motion, useReducedMotion } from 'framer-motion'
import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { formatPrice } from '@/lib/formatPrice'
import { productPrimaryPhoto } from '@/lib/productImages'

/*
 * NOTE TO FUTURE CONTRIBUTORS:
 * This is the canonical Card component for Candera, consolidating all posts and products.
 * Design (modern vs classic) and Aspect Ratio (square vs portrait 4:5) are explicitly controlled
 * via Tailwind-ready CVA variants. Do not create duplicate product cards.
 */

const cardContainerVariants = cva('group relative flex h-full cursor-pointer flex-col', {
  variants: {
    type: {
      post: '',
      product: [
        'bg-candera-linen overflow-hidden',
        'shadow-[0_1px_3px_rgba(20,20,18,0.06),0_4px_16px_rgba(20,20,18,0.04)]',
        'transition-all duration-300 motion-reduce:transition-none',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      ].join(' '),
    },
    design: {
      modern:
        'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,20,18,0.10),0_16px_40px_rgba(20,20,18,0.08)]',
      classic: 'hover:shadow-[0_4px_12px_rgba(20,20,18,0.10),0_16px_40px_rgba(20,20,18,0.08)]',
    },
  },
  defaultVariants: {
    type: 'post',
    design: 'modern',
  },
})

const cardImageVariants = cva('relative w-full overflow-hidden bg-candera-ash', {
  variants: {
    aspectRatio: {
      square: 'aspect-square',
      portrait: 'aspect-[4/5]',
    },
  },
  defaultVariants: {
    aspectRatio: 'square',
  },
})

export type CardContainerVariants = VariantProps<typeof cardContainerVariants>
export type CardImageVariants = VariantProps<typeof cardImageVariants>

export type CardPostData = Omit<
  Pick<
    Post,
    'slug' | 'categories' | 'meta' | 'title' | 'populatedAuthors' | 'publishedAt' | 'heroImage'
  >,
  'categories'
> & {
  id?: string | number
  currency?: Product['currency']
  categories?: Array<{ title?: string | null } | string | number> | null
  extraPhotos?: Product['extraPhotos']
  etsyPrimaryImage?: Product['etsyPrimaryImage']
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

export interface CardProps {
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'products'
  showCategories?: boolean
  title?: string
  aspectRatio?: 'square' | 'portrait'
  design?: 'modern' | 'classic'
}

export const Card: React.FC<CardProps> = (props) => {
  const prefersReducedMotion = useReducedMotion()
  const { cardRef, linkRef } = useClickableCard({})
  const {
    className,
    doc,
    relationTo,
    showCategories,
    title: titleFromProps,
    aspectRatio = 'square',
    design = 'modern',
  } = props

  const {
    slug,
    categories,
    meta,
    title,
    tagline,
    extraPhotos,
    etsyPrimaryImage,
    scentProfile,
    price,
    currency,
    populatedAuthors,
    publishedAt,
    heroImage,
  } = doc || {}
  const { description, image: metaImage } = meta || {}

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ')
  const href = `/${relationTo}/${slug}`

  const imageToUse = metaImage || heroImage || productPrimaryPhoto(etsyPrimaryImage, extraPhotos)

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
        className={cn(cardContainerVariants({ type: 'post' }), className)}
      >
        <div className="relative w-full overflow-hidden bg-candera-ash aspect-[4/3]">
          {imageToUse && typeof imageToUse !== 'string' ? (
            <Media
              fill
              pictureClassName="w-full h-full"
              imgClassName="object-cover transition-transform duration-1000 group-hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
              resource={imageToUse}
              size="33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-end p-5 candle-bg">
              {/* Candle flame — pure CSS */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center mb-[8%]">
                  {/* Flame */}
                  <div className="candle-flame" />
                  {/* Glow */}
                  <div className="candle-glow" />
                  {/* Wick */}
                  <div className="candle-wick" />
                  {/* Candle body */}
                  <div className="candle-body" />
                </div>
              </div>
              {/* Warm floor glow */}
              <div className="absolute bottom-0 left-0 right-0 h-16 candle-floor-glow" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-candera-obsidian/10 p-6 opacity-0 pointer-events-none transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
            <Link
              href={href}
              className="flex h-[48px] w-full items-center justify-center bg-candera-linen text-xs font-bold uppercase tracking-[.3em] text-candera-obsidian shadow-xl transition-colors hover:bg-candera-vellum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View Details
            </Link>
          </div>
        </div>

        <div className="pt-5 pb-3 px-4 bg-candera-linen flex-1 flex flex-col border-t border-candera-ash/60">
          {/* Date + author row */}
          {(hasAuthors || publishedAt) && (
            <div className="flex items-center gap-2 mb-2">
              {publishedAt && (
                <time
                  className="font-sans text-xs font-semibold uppercase tracking-[.14em] text-candera-stone/70"
                  dateTime={publishedAt}
                >
                  {formatDateTime(publishedAt)}
                </time>
              )}
              {hasAuthors && publishedAt && (
                <span className="text-candera-stone/50 text-sm">·</span>
              )}
              {hasAuthors && (
                <span className="font-sans text-sm font-semibold uppercase tracking-[.14em] text-candera-stone/70">
                  {formatAuthors(populatedAuthors)}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          {titleToUse && (
            <p className="font-display text-lg font-normal not-italic leading-[1.2] text-candera-obsidian m-0 mb-0.5">
              <Link
                href={href}
                ref={linkRef}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:text-candera-ember-strong transition-colors"
              >
                {titleToUse}
              </Link>
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="font-serif italic text-sm text-candera-sage-text leading-[1.55] line-clamp-2 min-h-[3.1em] m-0">
              {sanitizedDescription}
            </p>
          )}

          {/* Read link */}
          <div className="mt-auto pt-6">
            <span className="text-sm font-bold uppercase tracking-[.2em] text-candera-sage-text border-b border-candera-sage-text/40 pb-px group-hover:text-candera-ember-strong group-hover:border-candera-ember-strong transition-colors">
              Read →
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // Determine secondary image for crossfade (from extraPhotos list)
  const secondaryImage =
    extraPhotos && extraPhotos.length > 1
      ? extraPhotos[1]
      : extraPhotos && extraPhotos.length > 0 && extraPhotos[0] !== imageToUse
        ? extraPhotos[0]
        : null

  const scentNotesText = [scentProfile?.top, scentProfile?.heart, scentProfile?.base]
    .filter(Boolean)
    .join(' · ')

  // ── PRODUCT VARIANT ───────────────────────────────────────────
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap={prefersReducedMotion ? undefined : 'tap'}
      variants={prefersReducedMotion ? {} : { tap: { scale: 0.98 } }}
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className={cn(cardContainerVariants({ type: 'product', design }), className)}
    >
      {/* ── Image ── */}
      <div className={cn(cardImageVariants({ aspectRatio }))}>
        {imageToUse && typeof imageToUse !== 'string' ? (
          <>
            <Media
              fill
              imgClassName="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              resource={imageToUse}
              size="33vw"
            />
            {/* Secondary image for hover crossfade */}
            {design === 'modern' && secondaryImage && typeof secondaryImage !== 'string' && (
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-[1]"
                aria-hidden="true"
              >
                <Media fill imgClassName="object-cover" resource={secondaryImage} size="33vw" />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-end p-5 candle-bg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex flex-col items-center mb-[8%]">
                <div className="candle-flame" />
                <div className="candle-glow" />
                <div className="candle-wick" />
                <div className="candle-body" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 candle-floor-glow" />
          </div>
        )}

        {/* Hover slide-up bar for scent notes */}
        {design === 'modern' && scentNotesText && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#121210]/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 py-3 px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white m-0">
              {scentNotesText}
            </p>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 border-t border-candera-ash/60">
        {/* Category label */}
        {showCategories && hasCategories && (
          <div className="flex items-center gap-1 mb-[0.55rem]">
            {categories?.map((category, i) => {
              if (typeof category === 'object' && category !== null) {
                const isLast = i === categories.length - 1
                return (
                  <Fragment key={i}>
                    <span className="text-xs font-semibold uppercase tracking-[.22em] text-candera-sage-text">
                      {category.title}
                    </span>
                    {!isLast && <span className="text-candera-sage-text">,&nbsp;</span>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Product name */}
        {titleToUse && (
          <p className="font-display text-xl font-normal not-italic leading-[1.25] text-candera-obsidian m-0 mb-[0.55rem]">
            <Link
              href={href}
              ref={linkRef}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:text-candera-ember-strong transition-colors"
            >
              {titleToUse}
            </Link>
          </p>
        )}

        {/* Tagline */}
        {tagline && (
          <p className="font-display italic text-sm text-candera-sage-text leading-[1.4] mb-[0.55rem] m-0 line-clamp-2 min-h-[2.8em]">
            {tagline}
          </p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-candera-ash/60 mb-[0.55rem]" />

        {/* Scent note pills — always visible */}
        {hasScentNotes && (
          <div className="flex items-center gap-1.5 mb-[0.55rem] whitespace-nowrap overflow-hidden">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-candera-sage-text shrink-0">
              Scent
            </span>
            {scentProfile?.top && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5 whitespace-nowrap">
                {scentProfile.top}
              </span>
            )}
            {scentProfile?.heart && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5 whitespace-nowrap">
                {scentProfile.heart}
              </span>
            )}
            {scentProfile?.base && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5 whitespace-nowrap">
                {scentProfile.base}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          {price != null && (
            <span className="text-base font-semibold text-candera-obsidian tabular-nums">
              {formatPrice(price, currency)}
            </span>
          )}
          {design === 'modern' ? (
            <Link
              href={href}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian border-b border-candera-obsidian pb-px transition-colors hover:text-candera-ember-strong hover:border-candera-ember-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View Details →
            </Link>
          ) : (
            <span
              className="relative z-10 text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian underline underline-offset-4 decoration-candera-obsidian/30 hover:decoration-candera-obsidian transition-all duration-200 pointer-events-none"
              aria-hidden="true"
            >
              VIEW DETAILS{' '}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:group-hover:translate-x-0">
                →
              </span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
