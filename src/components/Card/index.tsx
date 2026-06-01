'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'

import type { Post, Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { FragranceProfile } from '@/components/FragranceProfile'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> & {
  extraPhotos?: Product['extraPhotos']
  scentProfile?: Product['scentProfile']
  burnTime?: Product['burnTime']
  atmosphere?: Product['atmosphere']
  productTag?: Product['productTag']
  vessel?: Product['vessel']
  price?: Product['price']
}

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'products'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { cardRef, linkRef } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, extraPhotos, scentProfile, burnTime, atmosphere, productTag, vessel, price } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

  // For products, use the first extra photo as the image if meta image is missing
  const imageToUse = metaImage || (extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null)

  return (
    <article
      className={cn(
        'border border-border rounded-lg overflow-hidden bg-card hover:cursor-pointer',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-candera-ash">
        {!imageToUse && (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-candera-sage">
            Image unavailable
          </div>
        )}
        {imageToUse && typeof imageToUse !== 'string' && (
          <Media fill imgClassName="object-cover" resource={imageToUse} size="33vw" />
        )}
        {/* Product tag badge */}
        {productTag && (
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-[.18em] px-2.5 py-1.5',
                productTag === 'Limited Batch' && 'bg-candera-ember-strong text-white',
                productTag === 'Bestseller' && 'bg-candera-obsidian text-white',
                productTag === 'New Release' && 'bg-candera-rose text-white',
              )}
            >
              {productTag}
            </span>
          </div>
        )}
        {vessel && (
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-bold uppercase tracking-[.18em] px-2 py-1 bg-white/80 text-candera-obsidian">
              Batch {vessel}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        {/* Product header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            {vessel && (
              <span className="text-[9px] font-bold uppercase tracking-[.22em] text-candera-sage">
                Vessel {vessel}
              </span>
            )}
            {titleToUse && (
              <h3 className="text-[15px] font-medium leading-snug text-candera-obsidian m-0">
                <Link className="hover:text-candera-ember transition-colors" href={href} ref={linkRef}>
                  {titleToUse}
                </Link>
              </h3>
            )}
          </div>
          {price != null && (
            <span className="text-[14px] font-semibold text-candera-obsidian shrink-0">
              ${Number(price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Categories fallback for posts */}
        {showCategories && hasCategories && !scentProfile && (
          <div className="uppercase text-sm text-candera-sage">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category
                const categoryTitle = titleFromCategory || 'Untitled category'
                const isLast = index === categories.length - 1
                return (
                  <Fragment key={index}>
                    {categoryTitle}
                    {!isLast && <Fragment>, &nbsp;</Fragment>}
                  </Fragment>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Fragrance profile for products */}
        {scentProfile && (
          <FragranceProfile
            profile={scentProfile}
            burnTime={burnTime}
            atmosphere={atmosphere}
          />
        )}

        {/* Description for posts */}
        {description && !scentProfile && (
          <p className="text-sm text-candera-sage-text leading-relaxed">{sanitizedDescription}</p>
        )}

        {/* Add to ritual CTA for products */}
        {relationTo === 'products' && (
          <Link
            href={href}
            className="mt-2 flex items-center justify-center h-[40px] text-[10px] font-bold uppercase tracking-[.2em] bg-candera-obsidian text-white hover:bg-candera-ember transition-colors"
            style={{ borderRadius: 0 }}
          >
            View Product
          </Link>
        )}
      </div>
    </article>
  )
}
