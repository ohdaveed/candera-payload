'use client'

import React, { Fragment } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import type { Product } from '@/payload-types'

export type ProductCardData = {
  id?: string | number
  slug?: string | null
  title?: string | null
  tagline?: Product['tagline']
  extraPhotos?: Product['extraPhotos']
  scentProfile?: Product['scentProfile']
  price?: Product['price']
  categories?: Array<{ title?: string | null } | string | number> | null
}

interface ProductCardProps {
  product: ProductCardData
  showCategories?: boolean
  className?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showCategories, className }) => {
  const prefersReducedMotion = useReducedMotion()
  const { slug, title, tagline, extraPhotos, scentProfile, price, categories } = product

  const href = `/products/${slug}`
  const image = extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null
  const hasCategories = Array.isArray(categories) && categories.length > 0
  const hasScentNotes =
    scentProfile && (scentProfile.top || scentProfile.heart || scentProfile.base)

  return (
    <motion.div
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      className={cn(
        'group relative flex flex-col h-full cursor-pointer',
        'bg-candera-linen overflow-hidden',
        'shadow-[0_1px_3px_rgba(20,20,18,0.06),0_4px_16px_rgba(20,20,18,0.04)]',
        'transition-shadow duration-300 motion-reduce:transition-none',
        'hover:shadow-[0_4px_12px_rgba(20,20,18,0.10),0_16px_40px_rgba(20,20,18,0.08)]',
        'focus-within:ring-2 focus-within:ring-candera-ember focus-within:ring-offset-2',
        className,
      )}
    >
      {/* ── Image ────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden bg-candera-ash aspect-[4/5]">
        {image && typeof image !== 'string' ? (
          <Media
            fill
            imgClassName={cn(
              'object-cover transition-transform duration-700 ease-out',
              'group-hover:scale-105 motion-reduce:group-hover:scale-100 motion-reduce:transition-none',
            )}
            resource={image}
            size="33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center candle-bg">
            <div className="relative flex flex-col items-center mb-[8%]">
              <div className="candle-flame" />
              <div className="candle-glow" />
              <div className="candle-wick" />
              <div className="candle-body" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 candle-floor-glow" />
          </div>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 border-t border-candera-ash/60">
        {/* Category label */}
        {showCategories && hasCategories && (
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            {categories?.map((cat, i) => {
              if (typeof cat === 'object' && cat !== null && 'title' in cat) {
                const isLast = i === (categories?.length ?? 0) - 1
                return (
                  <Fragment key={i}>
                    <span className="text-xs font-semibold uppercase tracking-[.22em] text-candera-sage-text">
                      {cat.title}
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
        {title && (
          <p className="font-display text-xl font-normal not-italic leading-[1.25] text-candera-obsidian m-0 mb-1">
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:text-candera-ember-strong transition-colors"
            >
              {title}
            </Link>
          </p>
        )}

        {/* Tagline */}
        {tagline && (
          <p className="font-display italic text-sm text-candera-sage-text leading-[1.4] mb-3.5 m-0 line-clamp-2 min-h-[2.8em]">
            {tagline}
          </p>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-candera-ash/60 mb-3.5" />

        {/* Scent note pills */}
        {hasScentNotes && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            <span className="text-xs font-semibold uppercase tracking-[.18em] text-candera-sage-text mr-1">
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

        {/* Price + CTA — pushed to bottom via mt-auto so the border stays aligned */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-candera-ash/60">
          {price != null && (
            <span className="text-base font-semibold text-candera-obsidian tabular-nums">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                Number(price),
              )}
            </span>
          )}

          {/* VIEW DETAILS link — matches InlineLink dark underline style + directional nudge */}
          <span
            className="relative z-10 text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian underline underline-offset-4 decoration-candera-obsidian/30 hover:decoration-candera-obsidian transition-all duration-200 pointer-events-none"
            aria-hidden="true"
          >
            VIEW DETAILS{' '}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5 motion-reduce:group-hover:translate-x-0">
              →
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
