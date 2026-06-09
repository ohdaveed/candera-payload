import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import type { Media, Product } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ProductTagBadge } from '@/components/Card/ProductTagBadge'
import { Separator } from '@/components/ui/separator'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import PageClient from './page.client'
import { ProductDetailTabs } from './ProductDetailTabs'
import { ImageGallery } from './ImageGallery'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'

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

  const serverUrl = getServerSideURL()
  const productImageUrl =
    product.meta?.image && typeof product.meta.image === 'object' && 'url' in product.meta.image
      ? serverUrl + (product.meta.image as Media).url
      : undefined

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: productImageUrl,
    description: product.meta?.description || product.tagline,
    sku: product.vessel || undefined,
    offers: {
      '@type': 'Offer',
      url: `${serverUrl}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Collection',
        item: `${serverUrl}/products`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.title,
        item: `${serverUrl}/products/${product.slug}`,
      },
    ],
  }

  return (
    <article className="pt-32 pb-32 bg-candera-vellum min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
              mainImage={product.extraPhotos?.[0] as Media | string | null | undefined}
              extraPhotos={product.extraPhotos as (Media | string)[] | null}
            />
          </div>

          {/* Right: details */}
          <div className="lg:col-span-5 flex flex-col gap-8 py-4">
            {/* Actionable Cluster */}
            <div className="flex flex-col gap-6 p-8 rounded-2xl border border-candera-stone/20 bg-white/50 backdrop-blur-sm shadow-sm">
              <div className="flex flex-col gap-3">
                {product.vessel && <Eyebrow>Vessel {product.vessel}</Eyebrow>}
                <h1 className="text-candera-obsidian text-3xl lg:text-4xl font-display italic leading-tight">
                  {product.title}
                </h1>
                {product.tagline && (
                  <p className="editorial text-[18px] leading-relaxed text-candera-sage-text">
                    {product.tagline}
                  </p>
                )}
              </div>

              <div className="flex items-baseline gap-4">
                {product.price != null && (
                  <p className="price text-[32px] font-semibold text-candera-obsidian">
                    ${Number(product.price).toFixed(2)}
                  </p>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-candera-stone">
                  In Stock
                </span>
              </div>

              <Separator className="bg-candera-stone/10" />

              {/* Customization Field */}
              {product.isCustomizable && (
                <div className="flex flex-col gap-2 rounded-lg border border-candera-stone/20 bg-candera-ash/30 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-candera-obsidian">
                    {product.customizationLabel || 'Personalization'}
                  </p>
                  <p className="text-[11px] italic text-candera-sage-text">
                    This item is made to order. Please include your custom text in the order notes
                    and double-check your spelling.
                  </p>
                </div>
              )}

              {/* CTA */}
              {product.etsyListingId && (
                <Button asChild variant="cta" size="cta" className="w-full py-7 text-base">
                  <BoutiqueLink href={`https://www.etsy.com/listing/${product.etsyListingId}`}>
                    Buy on Etsy
                  </BoutiqueLink>
                </Button>
              )}
            </div>

            {/* Specifications + Scent Profile Tabs */}
            <ProductDetailTabs
              title={product.title}
              productType={product.productType}
              scentProfile={product.scentProfile}
              burnTime={product.burnTime}
              atmosphere={product.atmosphere}
              specifications={product.specifications}
            />
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
