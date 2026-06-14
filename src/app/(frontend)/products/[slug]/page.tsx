import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Media, Product } from '@/payload-types'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { ProductDetailSections } from './ProductDetailSections'
import { ProductCTASection } from './ProductCTASection'
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
    <Section
      as="article"
      padding="large"
      className="bg-candera-vellum min-h-screen grain"
      data-page="product-detail"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PayloadRedirects disableNotFound url={url} />
      <SetHeaderTheme theme="light" />

      <Container>
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

        <Section
          as="article"
          padding="none"
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mt-32"
          data-section="product-layout-grid"
        >
          {/* Left: image gallery — sticky on desktop so it stays in view while scrolling details */}
          <Section
            as="aside"
            padding="none"
            className="lg:col-span-7 relative lg:sticky lg:top-[var(--nav-height)] lg:h-[calc(100vh-var(--nav-height))] lg:overflow-hidden"
            data-section="image-gallery"
          >
            <ImageGallery
              mainImage={product.extraPhotos?.[0] as Media | string | null | undefined}
              extraPhotos={product.extraPhotos as (Media | string)[] | null}
              productTag={product.productTag ?? null}
            />
          </Section>

          {/* Right: details */}
          <Section
            as="aside"
            padding="none"
            className="lg:col-span-5 flex flex-col gap-10 py-4"
            data-section="product-details"
          >
            {/* Identity block */}
            <Section padding="none" className="flex flex-col gap-4">
              {product.vessel && (
                <Eyebrow className="text-candera-sage-text tracking-[.3em]">
                  Vessel {product.vessel}
                </Eyebrow>
              )}
              <h1 className="font-display italic text-candera-obsidian leading-[1.15] text-[clamp(2rem,4vw,3.25rem)]">
                {product.title}
              </h1>
              {product.tagline && (
                <p className="font-serif italic text-[15px] leading-[1.7] text-candera-sage-text max-w-[40ch]">
                  {product.tagline}
                </p>
              )}
            </Section>

            {/* Price row */}
            <Section
              padding="none"
              className="flex items-baseline gap-4 border-t border-b border-candera-stone/20 py-5"
            >
              {product.price != null && (
                <p className="font-display text-[2.25rem] font-semibold text-candera-obsidian leading-none tracking-tight">
                  ${Number(product.price).toFixed(2)}
                </p>
              )}
              <Badge
                variant="outline"
                className="text-[9px] font-bold uppercase tracking-[.2em] text-candera-sage-text border-candera-sage-text/40 rounded-none px-2 py-1"
              >
                In Stock
              </Badge>
            </Section>

            {/* Customization note */}
            {product.isCustomizable && (
              <aside className="border-l-2 border-candera-ember-strong pl-4 flex flex-col gap-1">
                <p className="text-[9px] font-bold uppercase tracking-[.25em] text-candera-obsidian">
                  {product.customizationLabel || 'Personalization Available'}
                </p>
                <p className="text-[12px] italic text-candera-sage-text leading-relaxed">
                  This item is made to order. Include your custom text in the order notes and
                  double-check your spelling — every character is hand-lettered.
                </p>
              </aside>
            )}

            {/* CTA + sticky bar (client component owns the sentinel ref) */}
            <ProductCTASection
              title={product.title}
              price={product.price}
              vessel={product.vessel}
              etsyListingId={product.etsyListingId}
            />

            {/* Specifications + Scent Profile — collapsible sections */}
            <ProductDetailSections
              title={product.title}
              vessel={product.vessel}
              productType={product.productType}
              scentProfile={product.scentProfile}
              burnTime={product.burnTime}
              atmosphere={product.atmosphere}
              specifications={product.specifications}
            />
          </Section>
        </Section>
      </Container>

      {/* Brand story strip */}
      <aside
        className="bg-candera-obsidian mt-20 px-8 py-14 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-16"
        data-section="brand-story-strip"
      >
        <div className="flex flex-col gap-2 max-w-prose">
          <h2 className="font-display italic text-white text-2xl leading-snug">
            Made with intention, in small batches
          </h2>
          <p className="text-[13px] text-white/80 leading-relaxed">
            Every Candera candle is hand-poured in California using a soy and beeswax blend, pressed
            botanicals, and clean fragrance oils chosen for how they feel in a room — not just how
            they smell in the jar.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.25em] text-white border-b border-white/30 pb-0.5 hover:border-white transition-colors shrink-0 self-start lg:self-auto"
        >
          Explore the collection
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </aside>
    </Section>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })

  const meta = await generateMeta({ doc: product as unknown as Product })

  if (product?.title) {
    meta.title = `${product.title} — Candera`
  }

  return meta
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
