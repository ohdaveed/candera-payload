'use client'

import React from 'react'
import Link from 'next/link'

import type { Product } from '@/payload-types'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FragranceProfile } from '@/components/FragranceProfile'
import { ProductTagBadge } from './ProductTagBadge'

type QuickViewDialogProps = {
  title?: string | null
  slug?: string | null
  extraPhotos?: Product['extraPhotos']
  price?: Product['price']
  vessel?: Product['vessel']
  tagline?: Product['tagline']
  scentProfile?: Product['scentProfile']
  burnTime?: Product['burnTime']
  atmosphere?: Product['atmosphere']
  etsyListingId?: Product['etsyListingId']
  productTag?: Product['productTag']
  children: React.ReactNode
}

export function QuickViewDialog({
  title,
  slug,
  extraPhotos,
  price,
  vessel,
  tagline,
  scentProfile,
  burnTime,
  atmosphere,
  etsyListingId,
  productTag,
  children,
}: QuickViewDialogProps) {
  const heroImage = extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[860px] p-0 bg-candera-vellum border-candera-stone/30 rounded-none overflow-hidden"
      >
        <DialogTitle className="sr-only">{title ?? 'Product Quick View'}</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: image */}
          <div className="relative aspect-[4/5] bg-candera-ash">
            {heroImage && typeof heroImage !== 'string' ? (
              <Media fill imgClassName="object-cover" resource={heroImage} />
            ) : (
              <div className="flex h-full items-center justify-center text-candera-sage-text text-sm italic">
                Image unavailable
              </div>
            )}
            {productTag && (
              <div className="absolute top-4 left-4 z-10">
                <ProductTagBadge tag={productTag} />
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6 p-8 overflow-y-auto max-h-[560px]">
            {vessel && <span className="eyebrow">Vessel {vessel}</span>}
            <h2 className="font-display text-[28px] font-normal italic leading-tight text-candera-obsidian">
              {title}
            </h2>
            {price != null && (
              <p className="price text-[24px] font-medium">${Number(price).toFixed(2)}</p>
            )}
            {tagline && (
              <p className="editorial text-[15px] leading-[1.7] text-candera-sage-text">
                {tagline}
              </p>
            )}

            <FragranceProfile profile={scentProfile} burnTime={burnTime} atmosphere={atmosphere} />

            <div className="flex flex-col gap-3 mt-auto pt-4">
              {etsyListingId && (
                <Button asChild variant="cta" size="cta">
                  <a
                    href={`https://www.etsy.com/listing/${etsyListingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Add to Cart — Add to the Ritual
                  </a>
                </Button>
              )}
              {slug && (
                <Link
                  href={`/products/${slug}`}
                  className="text-center text-[11px] font-bold uppercase tracking-[.25em] text-candera-sage-text hover:text-candera-ember-strong transition-colors"
                >
                  View Full Details →
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
