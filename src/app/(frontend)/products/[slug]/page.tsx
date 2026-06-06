import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Product } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ProductTagBadge } from '@/components/Card/ProductTagBadge'
import { Separator } from '@/components/ui/separator'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { ProductDetailTabs } from './ProductDetailTabs'
import { ImageGallery } from './ImageGallery'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return products.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/products/' + decodedSlug
  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) return <PayloadRedirects url={url} />

  return (
    <article className="pt-32 pb-32 bg-candera-vellum min-h-screen">
      <PayloadRedirects disableNotFound url={url} />
      <PageClient />

      <div className="container">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-candera-sage-text hover:text-candera-ember-strong transition-colors mb-16 group"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Return to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left: image gallery */}
          <div className="lg:col-span-7 relative">
            {product.productTag && (
              <div className="absolute top-6 left-6 z-10">
                <ProductTagBadge tag={product.productTag} />
              </div>
            )}
            <ImageGallery
              mainImage={product.extraPhotos?.[0]}
              extraPhotos={product.extraPhotos ?? undefined}
            />
          </div>

          {/* Right: details */}
          <div className="lg:col-span-5 flex flex-col gap-10 py-4">
            {/* Header zone */}
            <div className="flex flex-col gap-4 pb-8">
              {product.vessel && <Eyebrow>Vessel {product.vessel}</Eyebrow>}

              <h1 className="hero-heading text-candera-obsidian">{product.title}</h1>

              {product.tagline && (
                <p className="editorial text-[20px] leading-[1.7] text-candera-sage-text">
                  {product.tagline}
                </p>
              )}
            </div>
            <Separator className="bg-candera-stone/20" />

            {product.price != null && (
              <p className="price text-[28px] font-medium">${Number(product.price).toFixed(2)}</p>
            )}

            {/* Specifications + Scent Profile Tabs */}
            <ProductDetailTabs
              productType={product.productType}
              scentProfile={product.scentProfile}
              burnTime={product.burnTime}
              atmosphere={product.atmosphere}
            />

            {/* CTA — below specifications */}
            {product.etsyListingId && (
              <Button asChild variant="cta" size="cta">
                <a
                  href={`https://www.etsy.com/listing/${product.etsyListingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to Cart — Add to the Ritual
                </a>
              </Button>
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
  return generateMeta({ doc: product as unknown as Product })
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
