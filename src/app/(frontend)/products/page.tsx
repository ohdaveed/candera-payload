import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Suspense } from 'react'
import { Pagination } from '@/components/Pagination'
import { Eyebrow } from '@/components/ui/eyebrow'
import PageClient from './page.client'
import { ProductFilters } from './ProductFilters'
import { ProductGrid } from './ProductGrid'
import type { Product } from '@/payload-types'
import { PageHeader } from '@/components/PageHeader'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description:
    'Hand-poured botanical candles. Each piece is hand-labeled and inspected for peak botanical clarity.',
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
    <Section padding="large" className="bg-candera-linen min-h-screen">
      <PageClient />

      <Container>
        <PageHeader
          className="mb-20"
          eyebrow="Botanical Study"
          title="The Collection"
          description="Small-batch botanical candles, hand-poured in the studio and curated for sensory depth. Each vessel is cured for two weeks in stillness—ensuring a clean, focused burn that transforms your environment."
        />

        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>

        <Eyebrow className="block mb-8">{resultLabel}</Eyebrow>

        <ProductGrid
          products={products.docs.map((product) => {
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
          })}
        />

        {products.docs.length === 0 && (
          <Section padding="medium" className="text-center">
            <p className="editorial text-[20px] italic text-candera-sage-text mb-6">
              No vessels found in this category.
            </p>
            <Link
              href="/products"
              className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
            >
              View all vessels →
            </Link>
          </Section>
        )}

        {products.totalPages > 1 && products.page && (
          <Section padding="none" className="mt-16">
            <Pagination
              basePath="/products"
              page={products.page}
              totalPages={products.totalPages}
            />
          </Section>
        )}
      </Container>
    </Section>
  )
}
