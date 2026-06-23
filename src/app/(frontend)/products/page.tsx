import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Pagination } from '@/components/Pagination'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { ProductFilters } from './ProductFilters'
import { ProductGrid } from './ProductGrid'
import type { Product } from '@/payload-types'
import type { ProductCardData } from '@/components/ProductCard'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description:
    'Hand-poured botanical candles. Each piece is hand-labeled and inspected for peak botanical clarity.',
}

function toGridProduct(product: Product): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    tagline: product.tagline,
    extraPhotos: product.extraPhotos,
    scentProfile: product.scentProfile,
    price: product.price,
    currency: product.currency,
    categories: product.categories?.map((cat) =>
      typeof cat === 'object' && cat !== null ? { title: cat.title } : cat,
    ),
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string; page?: string }>
}) {
  const { tag, sort, page } = await searchParams

  const sortField = sort === 'price-asc' ? 'price' : sort === 'price-desc' ? '-price' : '-createdAt'

  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    page: page ? parseInt(page) : 1,
    sort: sortField,
    ...(tag && tag !== 'All' ? { where: { productTag: { equals: tag } } } : {}),
  })

  const activeTag = tag && tag !== 'All' ? tag : null
  const resultLabel = activeTag
    ? `${products.totalDocs} results for '${activeTag}'`
    : `${products.totalDocs} pieces in the collection`

  return (
    <main className="bg-candera-vellum min-h-screen" data-page="products-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Botanical Study"
        title="The Collection"
        description="Small-batch botanical candles, hand-poured and cured for two weeks in stillness before each release."
        decorativeWord="Collection"
      />

      {/* ── Collection grid ─────────────────────────────────────────── */}
      <Section padding="large" data-section="collection-grid">
        <Container>
          {/* ProductFilters owns its own Suspense boundary */}
          <ProductFilters />

          {/* Result count — sage-text on vellum = 5.2:1 ✅ */}
          <p className="eyebrow text-candera-sage-text mb-8">{resultLabel}</p>

          {products.docs.length > 0 ? (
            <ProductGrid products={products.docs.map(toGridProduct)} />
          ) : (
            <output aria-live="polite" className="col-span-full py-24 text-center block">
              {activeTag ? (
                <>
                  <p className="text-lg text-candera-obsidian mb-2">
                    No products found for &quot;{activeTag}&quot;.
                  </p>
                  <p className="text-sm text-candera-sage-text">
                    <Link
                      href="/products"
                      className="underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
                    >
                      Clear the filter
                    </Link>
                  </p>
                </>
              ) : (
                <p className="text-lg text-candera-obsidian">The next batch is still curing.</p>
              )}
            </output>
          )}

          {products.docs.length > 0 && products.totalPages > 1 && products.page && (
            <div className="mt-16">
              <Pagination
                basePath="/products"
                page={products.page}
                totalPages={products.totalPages}
              />
            </div>
          )}
        </Container>
      </Section>

      {/* Peak-End Rule: close the journey on a strong, on-brand conversion moment */}
      <InnerCircleCTABlock
        blockType="innerCircleCTA"
        headline="First access to every new batch."
        description="Our batches often sell out in days. Join the Inner Circle for advance notice before each release goes public."
      />
    </main>
  )
}
