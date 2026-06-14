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

const cardContainerVariants = cva('group relative flex h-full cursor-pointer flex-col', {
  variants: {
    type: {
      post: '',
      product: [
        'bg-candera-linen overflow-hidden',
        'shadow-[0_1px_3px_rgba(20,20,18,0.06),0_4px_16px_rgba(20,20,18,0.04)]',
        'transition-all duration-300 motion-reduce:transition-none',
        'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,20,18,0.10),0_16px_40px_rgba(20,20,18,0.08)]',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
      ].join(' '),
    },
  },
  defaultVariants: {
    type: 'post',
  },
})

export type CardContainerVariants = VariantProps<typeof cardContainerVariants>

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
        className={cn(cardContainerVariants({ type: 'post' }), className)}
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

        <div className="pt-4 pb-4 px-5 bg-candera-linen flex-1 flex flex-col border-t border-candera-ash/60">
          {/* Date + author row */}
          {(hasAuthors || publishedAt) && (
            <div className="flex items-center gap-2 mb-2">
              {publishedAt && (
                <time
                  className="font-sans text-sm font-semibold uppercase tracking-[.14em] text-candera-stone/70"
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
            <p className="font-display text-xl font-normal not-italic leading-[1.2] text-candera-obsidian m-0 mb-2">
              <Link
                href={href}
                ref={linkRef}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:text-candera-ember transition-colors"
              >
                {titleToUse}
              </Link>
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="font-serif italic text-base text-candera-sage-text/80 leading-[1.6] line-clamp-2 m-0">
              {sanitizedDescription}
            </p>
          )}

          {/* Read link */}
          <div className="mt-auto pt-3">
            <span className="text-sm font-bold uppercase tracking-[.2em] text-candera-stone/60 border-b border-candera-stone/50 pb-px group-hover:text-candera-ember group-hover:border-candera-ember transition-colors">
              Read →
            </span>
          </div>
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
      className={cn(cardContainerVariants({ type: 'product' }), className)}
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
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 border-t border-candera-ash/60">
        {/* Category label */}
        {showCategories && hasCategories && (
          <div className="flex items-center gap-1 mb-1.5">
            {categories?.map((category, i) => {
              if (typeof category === 'object' && category !== null) {
                const isLast = i === categories.length - 1
                return (
                  <Fragment key={i}>
                    <span className="text-xs font-semibold uppercase tracking-[.22em] text-candera-stone/60">
                      {category.title}
                    </span>
                    {!isLast && <span className="text-candera-stone/60">,&nbsp;</span>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Product name */}
        {titleToUse && (
          <p className="font-display text-xl font-normal not-italic leading-[1.25] text-candera-obsidian m-0 mb-1">
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
          <p className="font-display italic text-sm text-candera-sage-text leading-[1.4] mb-3.5 m-0">
            {tagline}
          </p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-candera-ash/60 mb-3.5" />

        {/* Scent note pills — always visible */}
        {hasScentNotes && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-candera-stone/60 mr-1">
              Scent
            </span>
            {scentProfile?.top && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5">
                {scentProfile.top}
              </span>
            )}
            {scentProfile?.heart && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5">
                {scentProfile.heart}
              </span>
            )}
            {scentProfile?.base && (
              <span className="text-xs text-candera-sage-text bg-candera-vellum px-2 py-0.5">
                {scentProfile.base}
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto">
          {price != null && (
            <span className="text-base font-semibold text-candera-obsidian tabular-nums">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                Number(price),
              )}
            </span>
          )}
          <Link
            href={href}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian border-b border-candera-obsidian pb-px transition-colors hover:text-candera-ember hover:border-candera-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
