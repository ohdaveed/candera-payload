import type { Metadata } from 'next'

import Link from 'next/link'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'

import type { Media, Product } from '@/payload-types'

import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedFormByTitle } from '@/utilities/getForms'
import { getServerSideURL } from '@/utilities/getURL'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ProductDetailSections } from './ProductDetailSections'
import { ProductCTASection } from './ProductCTASection'
import { ImageGallery } from './ImageGallery'
import { InnerCircleEmailForm } from '@/blocks/InnerCircleCTA/EmailForm'
import { Eyebrow } from '@/components/ui/eyebrow'
import { ArrowRight } from 'lucide-react'
import { FORM_TITLES } from '@/constants/forms'

export async function generateStaticParams() {
  return []
}

type Args = { params: Promise<{ slug?: string }> }

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/products/' + decodedSlug

  const productPromise = queryProductBySlug({ slug: decodedSlug })
  const formPromise = getCachedFormByTitle(FORM_TITLES.INNER_CIRCLE)()

  const product = await productPromise
  if (!product) return <PayloadRedirects url={url} />

  const serverUrl = getServerSideURL()

  const innerCircleForm = await formPromise
  const innerCircleFormId = innerCircleForm?.id?.toString() ?? ''

  const productImageUrl = resolveProductImageUrl(product, serverUrl)

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: productImageUrl,
    description: product.meta?.description || product.tagline,
    sku: product.vessel || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Candera',
    },
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
      padding="none"
      className="bg-candera-vellum min-h-screen grain pt-32 md:pt-40 pb-20"
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
        {/* Breadcrumb */}
        <Breadcrumbs
          className="mb-16 text-candera-sage-text"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Collection', href: '/products' },
            { label: product.title },
          ]}
        />

        <Section
          as="article"
          padding="none"
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mt-10"
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
            />
          </Section>

          {/* Right: details */}
          <Section
            as="aside"
            padding="none"
            className="lg:col-span-5 flex flex-col gap-10 py-4 lg:min-h-[calc(100vh-var(--nav-height)-120px)]"
            data-section="product-details"
          >
            {/* Identity block */}
            <Section padding="none" className="flex flex-col gap-4">
              <h1 className="h1 text-candera-obsidian">{product.title}</h1>
              {product.tagline && (
                <p className="editorial text-candera-sage-text max-w-[40ch]">{product.tagline}</p>
              )}
            </Section>

            {/* Price row */}
            <Section
              padding="none"
              className="flex items-baseline gap-4 border-t border-b border-candera-stone/20 py-5"
            >
              {product.price != null && (
                <p className="price text-2xl">${Number(product.price).toFixed(2)}</p>
              )}
              <Badge
                variant="outline"
                className="text-xs font-bold uppercase tracking-[.2em] text-candera-sage-text border-candera-sage-text/40 rounded-none px-2 py-1"
              >
                In Stock
              </Badge>
            </Section>

            {/* Customization note */}
            {product.isCustomizable && (
              <aside className="border-l-2 border-candera-ember-strong pl-4 flex flex-col gap-1">
                <p className="eyebrow text-candera-obsidian">
                  {product.customizationLabel || 'Personalization Available'}
                </p>
                <p className="editorial text-candera-sage-text">
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
          <h2 className="h3 text-candera-vellum">Made with intention, in small batches</h2>
          <p className="body text-candera-vellum/80">
            Every Candera candle is hand-poured in California using a soy and beeswax blend, pressed
            botanicals, and clean fragrance oils chosen for how they feel in a room — not just how
            they smell in the jar.
          </p>
        </div>
        <Link
          href="/products"
          className="btn-text text-candera-vellum border-b border-candera-vellum/30 pb-0.5 hover:border-candera-vellum transition-colors shrink-0 self-start lg:self-auto inline-flex items-center gap-2"
        >
          Explore the collection
          <ArrowRight width={11} height={11} strokeWidth={2} aria-hidden="true" />
        </Link>
      </aside>

      <aside
        className="bg-candera-obsidian mt-px px-8 py-14 lg:px-16 lg:py-16"
        data-section="join-the-circle"
      >
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-8">
          <div className="flex flex-col gap-3">
            <Eyebrow className="text-candera-ember/80">Inner Circle</Eyebrow>
            <h2 className="h2 text-candera-vellum m-0">Join the Circle</h2>
            <p className="body text-candera-vellum/70">
              Batches sell out in days. Get first access to new pours, studio notes, and limited
              releases.
            </p>
          </div>
          <div className="w-full max-w-md">
            <InnerCircleEmailForm formId={innerCircleFormId} />
          </div>
        </div>
      </aside>
    </Section>
  )
}

// Resolves the best available image URL for a product, preferring the SEO
// meta image (og size) and falling back to the first gallery photo so social
// shares never default to the generic template OG image.
function resolveProductImageUrl(product: Product, serverUrl: string): string | undefined {
  // Payload serves media via relative paths (/api/media/file/...), but external
  // storage adapters (e.g. Vercel Blob) can return absolute URLs — only prepend
  // serverUrl when the URL isn't already absolute.
  const toAbsolute = (url?: string | null): string | undefined =>
    !url ? undefined : url.startsWith('http') ? url : serverUrl + url

  const fromMedia = (media: unknown): string | undefined => {
    if (media && typeof media === 'object' && 'url' in media) {
      const m = media as Media
      return toAbsolute(m.sizes?.og?.url) ?? toAbsolute(m.url)
    }
    return undefined
  }

  return fromMedia(product.meta?.image) ?? fromMedia(product.extraPhotos?.[0])
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const product = await queryProductBySlug({ slug: decodeURIComponent(slug) })

  const meta = await generateMeta({ doc: product as unknown as Product, pathPrefix: 'products' })

  if (product?.title) {
    meta.title = `${product.title} — Candera`
  }

  // Fall back to a real product photo when no SEO meta image is set, so the
  // product's social preview shows the candle rather than the template OG.
  if (product) {
    // Twitter image is inherited from openGraph.images by Next.js when not
    // explicitly set, so overriding openGraph alone updates both.
    const imageUrl = resolveProductImageUrl(product, getServerSideURL())
    if (imageUrl && meta.openGraph) {
      meta.openGraph.images = [{ url: imageUrl }]
    }
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
