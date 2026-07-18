import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import { Pagination } from '@/components/Pagination'
import { activeProductSort, resolveProductSort } from '@/lib/productSort'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { ProductFilters } from './ProductFilters'
import { ProductGrid } from '@/components/ProductGrid'
import { toGridProduct } from '@/components/Card/toGridProduct'
import { assertPageInRange } from '@/utilities/listing'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'

// Filtered/sorted/paginated query variants all canonicalize to the plain
// collection page, so the query-string URLs never compete with /products
// or /products/page/N in search indexes.
export const metadata: Metadata = {
  title: 'Collection — Candera',
  description:
    'Hand-poured botanical candles, each one embedded with real pressed flowers — no two pieces alike.',
  alternates: { canonical: '/products' },
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string; page?: string }>
}) {
  const { tag, sort, page } = await searchParams

  const pageNumber = page ? Number(page) : 1
  if (!Number.isInteger(pageNumber) || pageNumber < 1) notFound()

  // Repeated query params arrive as arrays at runtime — only a plain string is
  // a valid tag filter (an array passed to Payload's `equals` throws a 500).
  const activeTag = typeof tag === 'string' && tag !== 'All' ? tag : null
  const activeSort = activeProductSort(sort)

  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    page: pageNumber,
    sort: resolveProductSort(sort),
    ...(activeTag ? { where: { productTag: { equals: activeTag } } } : {}),
  })

  assertPageInRange(pageNumber, products.totalPages)
  const resultLabel = activeTag
    ? `${products.totalDocs} pieces tagged ‘${activeTag}’`
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
          <p className="caption text-candera-sage-text mb-8">{resultLabel}</p>

          {products.docs.length > 0 ? (
            <ProductGrid products={products.docs.map(toGridProduct)} />
          ) : (
            <output aria-live="polite" className="col-span-full py-24 text-center block">
              {activeTag ? (
                <>
                  <p className="h3 text-candera-obsidian mb-2">
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
                <>
                  <p className="h3 text-candera-obsidian mb-2">The next batch is still curing.</p>
                  <p className="text-sm text-candera-sage-text">
                    Join the Inner Circle below and we&apos;ll tell you the moment it&apos;s ready.
                  </p>
                </>
              )}
            </output>
          )}

          {products.docs.length > 0 && products.totalPages > 1 && products.page && (
            <div className="mt-16">
              {/* With active filters/sort, paginate via query string so they survive;
                  otherwise use the cached /products/page/N routes. */}
              <Pagination
                basePath="/products"
                page={products.page}
                totalPages={products.totalPages}
                query={{ tag: activeTag ?? undefined, sort: activeSort ?? undefined }}
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
