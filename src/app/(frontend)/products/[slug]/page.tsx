import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Product } from '@/payload-types'
import { Media } from '@/components/Media'
import { FragranceProfile } from '@/components/FragranceProfile'
import { Card } from '@/components/Card'
import { getServerSideURL } from '@/utilities/getURL'

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

  const heroImage =
    product.extraPhotos && product.extraPhotos.length > 0
      ? product.extraPhotos[0]
      : null

  const payload = await getPayload({ config: configPromise })
  const relatedProducts: Product[] = product.productTag
    ? (await payload.find({
        collection: 'products',
        limit: 3,
        overrideAccess: false,
        pagination: false,
        where: {
          and: [
            { productTag: { equals: product.productTag } },
            { slug: { not_equals: decodedSlug } },
          ],
        },
      })).docs
    : []

  return (
    <article className="pt-32 pb-32 bg-candera-vellum min-h-screen">
      <PayloadRedirects disableNotFound url={url} />

      <div className="container">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-candera-sage-text hover:text-candera-ember-strong transition-colors mb-16 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Return to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left: image */}
          <div className="lg:col-span-7 relative aspect-[4/5] overflow-hidden bg-candera-ash shadow-sm">
            {heroImage && typeof heroImage !== 'string' ? (
              <Media fill imgClassName="object-cover" resource={heroImage} priority />
            ) : (
              <div className="flex h-full items-center justify-center text-candera-sage-text text-sm italic">
                Image unavailable
              </div>
            )}
            {product.productTag && (
              <div className="absolute top-6 left-6 z-10">
                <span
                  className={[
                    'text-[10px] font-bold uppercase tracking-[.25em] px-4 py-2 shadow-xl',
                    product.productTag === 'Limited Batch' && 'bg-candera-ember-strong text-white',
                    product.productTag === 'Bestseller' && 'bg-candera-obsidian text-white',
                    product.productTag === 'New Release' && 'bg-candera-stone text-candera-obsidian',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {product.productTag}
                </span>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="lg:col-span-5 flex flex-col gap-10 py-4">
            {/* Header zone */}
            <div className="flex flex-col gap-4 border-b border-candera-stone/20 pb-8">
              {product.vessel && (
                <span className="eyebrow">
                  Vessel {product.vessel}
                </span>
              )}

              <h1 className="hero-heading text-candera-obsidian">
                {product.title}
              </h1>

              {product.tagline && (
                <p className="editorial text-[20px] leading-[1.7] text-candera-sage-text">
                  {product.tagline}
                </p>
              )}
            </div>

            {product.price != null && (
              <p className="price text-[28px] font-medium">
                ${Number(product.price).toFixed(2)}
              </p>
            )}

            {/* Specifications — above CTA per standard e-commerce hierarchy */}
            <div className="rounded-xl border border-candera-stone/20 bg-candera-ash/40 px-6 py-6">
              <p className="eyebrow mb-5">
                Specifications
              </p>
              <ul className="flex flex-col gap-3.5 p-0 list-none">
                {[
                  { label: 'Size & Wax', value: '15 oz · Soy & beeswax blend' },
                  { label: 'Craftsmanship', value: 'Numbered vessel · Micro-batch cured' },
                  { label: 'Origin', value: 'Ships from California' },
                ].map(({ label, value }) => (
                  <li key={label} className="flex justify-between items-baseline gap-4 text-[13px]">
                    <span className="font-semibold text-candera-obsidian shrink-0">{label}</span>
                    <span className="text-candera-sage-text text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <FragranceProfile
              profile={product.scentProfile}
              burnTime={product.burnTime}
              atmosphere={product.atmosphere}
            />

            {/* CTA — below specifications */}
            {product.etsyListingId && (
              <div>
                <a
                  href={`https://www.etsy.com/listing/${product.etsyListingId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-[56px] px-10 text-[11px] font-bold uppercase tracking-[.3em] bg-candera-obsidian text-white hover:bg-candera-ember-strong transition-all duration-300 shadow-xl !rounded-none"
                >
                  Shop on Etsy →
                </a>
                <p className="text-[12px] text-candera-sage-text mt-3">
                  Complete your purchase through our Etsy studio.
                </p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-candera-stone/20">
            <div className="mb-12">
              <span className="eyebrow block mb-3">From the Same Batch</span>
              <h2 className="hero-heading text-candera-obsidian" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
              {relatedProducts.map((p) => (
                <Card
                  key={p.id}
                  doc={{
                    slug: p.slug,
                    title: p.title,
                    extraPhotos: p.extraPhotos,
                    scentProfile: p.scentProfile,
                    burnTime: p.burnTime,
                    atmosphere: p.atmosphere,
                    productTag: p.productTag,
                    vessel: p.vessel,
                    price: p.price,
                  }}
                  relationTo="products"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })

  if (!product) return {}

  const serverUrl = getServerSideURL()
  const title = `${product.title} | Candera`
  const description =
    product.tagline ||
    `${product.title} — a hand-poured, small-batch botanical candle from Candera Candles.`

  // Use the first extraPhoto's OG size if available, otherwise fall back to thumbnail
  const firstPhoto =
    product.extraPhotos && product.extraPhotos.length > 0
      ? product.extraPhotos[0]
      : null
  const ogImageUrl =
    firstPhoto && typeof firstPhoto !== 'number' && typeof firstPhoto !== 'string'
      ? firstPhoto.sizes?.og?.url
        ? serverUrl + firstPhoto.sizes.og.url
        : firstPhoto.url
          ? serverUrl + firstPhoto.url
          : undefined
      : undefined

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      siteName: 'Candera Candles',
      title,
      description,
      url: `${serverUrl}/products/${slug}`,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
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
