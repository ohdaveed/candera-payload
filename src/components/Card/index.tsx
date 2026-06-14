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
            <div
              className="absolute inset-0 flex items-end p-5"
              style={{
                background: 'linear-gradient(160deg, #2a1f14 0%, #3d2a18 35%, #1a110a 100%)',
              }}
            >
              {/* Candle flame — pure CSS */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative flex flex-col items-center" style={{ marginBottom: '8%' }}>
                  {/* Flame */}
                  <div
                    style={{
                      width: 18,
                      height: 28,
                      background:
                        'radial-gradient(ellipse at 50% 80%, #fff5cc 0%, #ffd060 30%, #e8700a 65%, transparent 100%)',
                      borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
                      filter: 'blur(1.5px)',
                      opacity: 0.92,
                    }}
                  />
                  {/* Glow */}
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      width: 48,
                      height: 48,
                      background:
                        'radial-gradient(ellipse, rgba(255,200,80,0.28) 0%, transparent 70%)',
                      borderRadius: '50%',
                    }}
                  />
                  {/* Wick */}
                  <div
                    style={{
                      width: 2,
                      height: 10,
                      background: '#2a1a0a',
                      borderRadius: 1,
                      marginTop: -2,
                    }}
                  />
                  {/* Candle body */}
                  <div
                    style={{
                      width: 28,
                      height: 64,
                      background:
                        'linear-gradient(to right, #e8ddd0 0%, #f5f0e8 40%, #e0d5c5 100%)',
                      borderRadius: '2px 2px 0 0',
                      boxShadow: '0 0 20px rgba(255,180,60,0.15)',
                      marginTop: 0,
                    }}
                  />
                </div>
              </div>
              {/* Warm floor glow */}
              <div
                className="absolute bottom-0 left-0 right-0 h-16"
                style={{
                  background: 'linear-gradient(to top, rgba(255,160,40,0.08), transparent)',
                }}
              />
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

        <div className="pt-4 pb-4 px-5 bg-white flex-1 flex flex-col border-t border-[#ede8e1]">
          {/* Date + author row */}
          {(hasAuthors || publishedAt) && (
            <div className="flex items-center gap-2 mb-2">
              {publishedAt && (
                <time
                  className="font-sans text-[10px] font-semibold uppercase tracking-[.18em] text-[#b8aa98]"
                  dateTime={publishedAt}
                >
                  {formatDateTime(publishedAt)}
                </time>
              )}
              {hasAuthors && publishedAt && <span className="text-[#c8bdb0] text-[10px]">·</span>}
              {hasAuthors && (
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[.18em] text-[#b8aa98]">
                  {formatAuthors(populatedAuthors)}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          {titleToUse && (
            <p className="font-display text-[20px] font-normal not-italic leading-[1.25] text-candera-obsidian m-0 mb-2">
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
            <p className="font-serif italic text-[14px] text-[#7a6c5e] leading-[1.65] line-clamp-2 m-0">
              {sanitizedDescription}
            </p>
          )}

          {/* Read link */}
          <div className="mt-auto pt-3">
            <span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#9e9082] border-b border-[#d4c9bc] pb-px group-hover:text-candera-ember group-hover:border-candera-ember transition-colors">
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
                const isLast = i === categories.length - 1
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
