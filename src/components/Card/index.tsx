'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Product, ScentProfile as ScentProfileType } from '@/payload-types'

import { motion, useReducedMotion } from 'framer-motion'
import { Media } from '@/components/Media'
import { FragranceProfile } from '@/components/FragranceProfile'
import { ProductTagBadge } from './ProductTagBadge'
import { QuickViewDialog } from './QuickViewDialog'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> & {
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

import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    etsyListingId,
    scentProfile,
    burnTime,
    atmosphere,
    productTag,
    vessel,
    price,
    productType,
    specifications,
    isCustomizable,
    customizationLabel,
  } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // For products, use the first extra photo as the image if meta image is missing
  const imageToUse = metaImage || (extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null)

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap={prefersReducedMotion ? undefined : 'tap'}
      variants={prefersReducedMotion ? {} : { tap: { scale: 0.98 } }}
      ref={cardRef as React.RefObject<HTMLDivElement>}
    >
      <ShadcnCard
        className={cn(
          'group relative flex h-full cursor-pointer flex-col overflow-hidden border-none bg-white transition-all duration-300 hover:shadow-xl hover:shadow-candera-stone/20 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 motion-reduce:transition-none',
          className,
        )}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-candera-ash">
          {!imageToUse ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-candera-sage-text italic">
              Image unavailable
            </div>
          ) : null}
          {imageToUse && typeof imageToUse !== 'string' ? (
            <Media
              fill
              imgClassName="object-cover transition-transform duration-1000 group-hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
              resource={imageToUse}
              size="33vw"
            />
          ) : null}

          {/* Product tag badge */}
          {productTag ? (
            <div className="absolute top-4 left-4 z-10">
              <ProductTagBadge tag={productTag} />
            </div>
          ) : null}

          {vessel ? (
            <div className="absolute top-4 right-4 z-10">
              <span className="relative z-10 text-[9px] font-bold uppercase tracking-[.18em] px-2.5 py-1 bg-white/90 text-candera-obsidian backdrop-blur-sm">
                BATCH {vessel}
              </span>
            </div>
          ) : null}

          {/* Hover overlay for Quick View */}
          {relationTo === 'products' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-candera-obsidian/10 p-6 opacity-0 pointer-events-none transition-opacity duration-500 motion-reduce:transition-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
              <div className="flex w-full translate-y-4 flex-col gap-2 transition-transform duration-500 motion-reduce:transition-none group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:none)]:translate-y-0">
                <QuickViewDialog
                  title={titleToUse}
                  slug={slug}
                  tagline={tagline}
                  extraPhotos={extraPhotos}
                  price={price}
                  vessel={vessel}
                  scentProfile={scentProfile}
                  burnTime={burnTime}
                  atmosphere={atmosphere}
                  productTag={productTag}
                  etsyListingId={etsyListingId}
                  productType={productType}
                  specifications={specifications}
                  isCustomizable={isCustomizable}
                  customizationLabel={customizationLabel}
                >
                  <button
                    type="button"
                    onClick={(event) => event.stopPropagation()}
                    onMouseDownCapture={(event) => event.stopPropagation()}
                    onMouseUpCapture={(event) => event.stopPropagation()}
                    className="relative z-10 flex h-[48px] w-full items-center justify-center rounded-none bg-white text-[10px] font-bold uppercase tracking-[.3em] text-candera-obsidian shadow-xl transition-colors hover:bg-candera-vellum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Quick View
                  </button>
                </QuickViewDialog>
                <Link
                  href={href}
                  className="relative z-10 text-center text-[10px] font-bold uppercase tracking-[.25em] text-white transition-colors hover:text-candera-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-candera-obsidian/10 p-6 opacity-0 pointer-events-none transition-opacity duration-500 motion-reduce:transition-none group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100">
              <div className="w-full translate-y-4 transition-transform duration-500 motion-reduce:transition-none group-hover:translate-y-0 group-focus-within:translate-y-0 [@media(hover:none)]:translate-y-0">
                <Link
                  href={href}
                  className="relative z-10 flex h-[48px] w-full items-center justify-center bg-white text-[10px] font-bold uppercase tracking-[.3em] text-candera-obsidian shadow-xl transition-colors hover:bg-candera-vellum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{ borderRadius: 0 }}
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </div>

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

        <CardContent className="pt-0 pb-2 px-0 flex flex-col flex-grow">
          {/* Fragrance profile for products - Strict conditional check */}
          {relationTo === 'products' &&
            scentProfile &&
            (scentProfile.top || scentProfile.heart || scentProfile.base || burnTime) && (
              <motion.div
                variants={
                  prefersReducedMotion
                    ? {}
                    : {
                        initial: { height: 0, opacity: 0, marginTop: 0 },
                        hover: { height: 'auto', opacity: 1, marginTop: 8 },
                      }
                }
                transition={
                  prefersReducedMotion ? {} : { type: 'spring', stiffness: 300, damping: 30 }
                }
                className="mt-auto overflow-hidden pointer-events-none group-hover:pointer-events-auto"
              >
                <FragranceProfile
                  profile={scentProfile}
                  burnTime={burnTime}
                  atmosphere={atmosphere}
                />
              </motion.div>
            )}

          {/* Description for posts */}
          {description && !scentProfile && (
            <p className="font-serif italic text-[15px] text-candera-sage-text leading-relaxed line-clamp-2 mt-2 px-0">
              {sanitizedDescription}
            </p>
          )}
        </CardContent>
      </ShadcnCard>
    </motion.div>
  )
}
