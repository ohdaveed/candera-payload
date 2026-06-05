import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Media } from '@/components/Media'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { generateMeta } from '@/utilities/generateMeta'
import RichText from '@/components/RichText'
import ProductPageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return products.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/products/' + decodedSlug
  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) return <PayloadRedirects url={url} />

  const {
    title,
    etsyListingId,
    description,
    extraPhotos,
    price,
    size,
    waxBlend,
    craftsmanship,
    origin,
    fragranceNotes,
    burnTime,
    atmosphere,
  } = product

  const etsyUrl = `https://www.etsy.com/listing/${etsyListingId}`
  const mainPhoto = extraPhotos && extraPhotos.length > 0 ? extraPhotos[0] : null

  const specs = [
    size || waxBlend
      ? { label: 'Size & Wax', value: [size, waxBlend].filter(Boolean).join(' · ') }
      : null,
    craftsmanship ? { label: 'Craftsmanship', value: craftsmanship } : null,
    origin ? { label: 'Origin', value: origin } : null,
  ].filter(Boolean) as { label: string; value: string }[]

  const hasFragrance =
    fragranceNotes?.top || fragranceNotes?.heart || fragranceNotes?.base

  return (
    <article className="min-h-screen bg-candera-vellum">
      <ProductPageClient />
      <PayloadRedirects disableNotFound url={url} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left — product image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-candera-ash group">
            {mainPhoto && typeof mainPhoto !== 'string' && typeof mainPhoto !== 'number' ? (
              <Media
                resource={mainPhoto}
                fill
                imgClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-candera-sage text-sm uppercase tracking-widest">
                No image
              </div>
            )}

            {/* GPU-composited hover overlay — will-change promotes to compositor layer so
                opacity changes never block the main-thread paint path (keeps INP < 50ms) */}
            <div
              className="
                absolute inset-0
                bg-candera-obsidian/10
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                [will-change:opacity] translate-z-0
                motion-reduce:transition-none
                flex items-center justify-center p-6
              "
            />
          </div>

          {/* Right — specs + CTA */}
          <div className="space-y-10 lg:pt-4">

            {/* Title + price */}
            <div className="space-y-2">
              <h1 className="font-display text-3xl italic leading-tight text-candera-obsidian">
                {title}
              </h1>
              {price != null && (
                <p className="text-candera-sage text-sm uppercase tracking-widest font-semibold">
                  ${price}
                </p>
              )}
            </div>

            {/* Specifications */}
            {specs.length > 0 && (
              <div className="border-t border-candera-field pt-8 space-y-6">
                {specs.map(({ label, value }) => (
                  <div key={label} className="grid grid-cols-2 gap-4">
                    <span className="text-xs uppercase tracking-widest font-semibold text-candera-sage">
                      {label}
                    </span>
                    <span className="text-sm text-candera-obsidian font-light">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fragrance profile */}
            {hasFragrance && (
              <div className="border-t border-candera-field pt-8 space-y-4">
                <p className="text-xs uppercase tracking-widest font-semibold text-candera-sage">
                  Fragrance Profile
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {fragranceNotes?.top && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-candera-ember font-bold block">
                        Top
                      </span>
                      <span className="text-sm text-candera-obsidian font-light">
                        {fragranceNotes.top}
                      </span>
                    </div>
                  )}
                  {fragranceNotes?.heart && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-candera-ember font-bold block">
                        Heart
                      </span>
                      <span className="text-sm text-candera-obsidian font-light">
                        {fragranceNotes.heart}
                      </span>
                    </div>
                  )}
                  {fragranceNotes?.base && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-candera-ember font-bold block">
                        Base
                      </span>
                      <span className="text-sm text-candera-obsidian font-light">
                        {fragranceNotes.base}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Burn time + atmosphere */}
            {(burnTime || atmosphere) && (
              <div className="border-t border-candera-field pt-8 grid grid-cols-2 gap-4">
                {burnTime && (
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-candera-sage block mb-1">
                      Burn Time
                    </span>
                    <span className="text-sm text-candera-obsidian font-light">{burnTime}</span>
                  </div>
                )}
                {atmosphere && (
                  <div>
                    <span className="text-xs uppercase tracking-widest font-semibold text-candera-sage block mb-1">
                      Atmosphere
                    </span>
                    <span className="text-sm text-candera-obsidian font-light">{atmosphere}</span>
                  </div>
                )}
              </div>
            )}

            {/* CTAs — plain anchor tags, zero JS in click path */}
            <div className="border-t border-candera-field pt-8 space-y-3">
              <a
                href={etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center gap-3
                  h-[52px] w-full px-10
                  text-[11px] font-bold uppercase tracking-widest
                  bg-candera-ember text-white
                  hover:bg-candera-ember-strong
                  transition-colors duration-200
                  shadow-lg
                "
              >
                Add to the Ritual
              </a>
              <a
                href={etsyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center
                  w-full h-[48px]
                  text-[10px] font-bold uppercase tracking-widest
                  bg-white text-candera-obsidian
                  shadow-sm
                  hover:bg-candera-vellum
                  transition-colors duration-200
                "
              >
                View on Etsy
              </a>
            </div>

            {/* Rich text description */}
            {description && (
              <div className="border-t border-candera-field pt-8">
                <RichText
                  data={description}
                  enableGutter={false}
                  className="text-sm text-candera-obsidian/80 font-light leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })
  return generateMeta({ doc: product })
}

const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})
