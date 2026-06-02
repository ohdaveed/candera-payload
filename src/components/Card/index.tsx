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
        'group flex flex-col h-full bg-white transition-all duration-500',
        className,
      )}
      ref={cardRef}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-candera-ash">
        {!imageToUse ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-candera-sage">
            Image unavailable
          </div>
        ) : null}
        {imageToUse && typeof imageToUse !== 'string' ? (
          <Media 
            fill 
            imgClassName="object-cover transition-transform duration-1000 group-hover:scale-105" 
            resource={imageToUse} 
            size="33vw" 
          />
        ) : null}
        
        {/* Product tag badge */}
        {productTag ? (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-[.25em] px-3 py-1.5',
                productTag === 'Limited Batch' && 'bg-candera-ember-strong text-white',
                productTag === 'Bestseller' && 'bg-candera-obsidian text-white',
                productTag === 'New Release' && 'bg-candera-rose text-white',
              )}
            >
              {productTag}
            </span>
          </div>
        ) : null}
        
        {vessel ? (
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[9px] font-bold uppercase tracking-[.18em] px-2.5 py-1 bg-white/90 text-candera-obsidian backdrop-blur-sm">
              Batch {vessel}
            </span>
          </div>
        ) : null}

        {/* Hover overlay for button */}
        <div className="absolute inset-0 bg-candera-obsidian/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
           <div className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <Link
                href={href}
                className="flex items-center justify-center w-full h-[48px] text-[10px] font-bold uppercase tracking-[.3em] bg-white text-candera-obsidian shadow-xl"
                style={{ borderRadius: 0 }}
              >
                View Details
              </Link>
           </div>
        </div>
      </div>
      
      <div className="pt-6 pb-2 flex flex-col flex-grow">
        {/* Product header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-col gap-1.5">
            {vessel ? (
              <span className="text-[9px] font-bold uppercase tracking-[.22em] text-candera-sage">
                Vessel {vessel}
              </span>
            ) : null}
            {titleToUse ? (
              <h3 className="m-0 text-balance text-[18px] font-medium leading-tight text-candera-obsidian transition-colors group-hover:text-candera-ember">
                <Link href={href} ref={linkRef}>
                  {titleToUse}
                </Link>
              </h3>
            ) : null}
          </div>
          {price != null && (
            <span className="price text-[15px] font-medium shrink-0 pt-4">
              ${Number(price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Categories fallback for posts */}
        {showCategories && hasCategories && !scentProfile && (
          <div className="uppercase text-[10px] font-bold tracking-widest text-candera-sage mt-auto">
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

        {/* Fragrance profile for products */}
        {scentProfile && (
          <div className="mt-auto">
            <FragranceProfile
              profile={scentProfile}
              burnTime={burnTime}
              atmosphere={atmosphere}
            />
          </div>
        )}

        {/* Description for posts */}
        {description && !scentProfile && (
          <p className="text-[14px] text-candera-sage-text leading-relaxed line-clamp-2 mt-2">{sanitizedDescription}</p>
        )}
      </div>
    </article>
  )
}
