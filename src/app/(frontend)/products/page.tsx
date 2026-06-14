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
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description:
    'Hand-poured botanical candles. Each piece is hand-labeled and inspected for peak botanical clarity.',
}

function toGridProduct(product: Product) {
  const {
    id,
    slug,
    categories,
    title,
    tagline,
    extraPhotos,
    scentProfile,
    burnTime,
    atmosphere,
    productTag,
    vessel,
    price,
  } = product
  return {
    id,
    slug,
    categories: categories?.map((cat) =>
      typeof cat === 'object' ? { title: cat.title } : cat,
    ) as Product['categories'],
    title,
    tagline,
    extraPhotos,
    scentProfile,
    burnTime,
    atmosphere,
    productTag,
    vessel,
    price,
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
    <main className="bg-candera-vellum min-h-screen">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Botanical Study"
        title="The Collection"
        description="Small-batch botanical candles, hand-poured and cured for two weeks in stillness before each release."
        decorativeWord="Collection"
      />

      {/* ── Collection grid ─────────────────────────────────────────── */}
      <Section padding="large">
        <Container>
          {/* ProductFilters owns its own Suspense boundary */}
          <ProductFilters />

          {/* Result count — sage-text on vellum = 5.2:1 ✅ */}
          <p className="font-sans text-[10px] font-bold uppercase tracking-[.25em] text-candera-sage-text mb-8">
            {resultLabel}
          </p>

          {products.docs.length > 0 ? (
            <ProductGrid products={products.docs.map(toGridProduct)} />
          ) : (
            <div className="py-20 text-center">
              <p
                className="font-display italic text-candera-obsidian mb-4 m-0"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
              >
                {activeTag
                  ? `No vessels found for ${activeTag}.`
                  : 'The next batch is still curing.'}
              </p>
              <p className="font-sans text-[15px] text-candera-sage-text max-w-[420px] mx-auto mb-8 m-0 mt-3 leading-relaxed">
                {activeTag
                  ? 'Clear the filter to return to the full studio archive.'
                  : 'Candera releases small batches as they finish their studio rest. Check back soon.'}
              </p>
              <Link
                href="/products"
                className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
              >
                View all vessels →
              </Link>
            </div>
          )}

          {products.totalPages > 1 && products.page && (
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
    </main>
  )
}
