import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { Eyebrow } from '@/components/ui/eyebrow'
import PageClient from './page.client'
import { ProductFilters } from './ProductFilters'

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description:
    'Hand-poured micro-batch candles. Each vessel is numbered and inspected for peak botanical clarity.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; sort?: string }>
}) {
  const { tag, sort } = await searchParams

  const sortField = sort === 'price-asc' ? 'price' : sort === 'price-desc' ? '-price' : '-createdAt'

  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    sort: sortField,
    ...(tag && tag !== 'All' ? { where: { productTag: { equals: tag } } } : {}),
  })

  const activeTag = tag && tag !== 'All' ? tag : null
  const resultLabel = activeTag
    ? `${products.totalDocs} results for '${activeTag}'`
    : `${products.totalDocs} vessels in this batch`

  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <PageClient />
      <div className="container">
        <div className="mb-20 max-w-[600px]">
          <Eyebrow className="block mb-4">Limited Release</Eyebrow>
          <h1 className="hero-heading text-candera-obsidian">The Collection</h1>
          <p className="editorial mt-6 text-candera-sage-text">
            Small-batch botanical candles, hand-poured in the studio and numbered for authenticity.
            Each vessel is cured for two weeks in stillness—ensuring a clean, focused burn that
            transforms your environment.
          </p>
        </div>

        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>

        <Eyebrow className="block mb-8">{resultLabel}</Eyebrow>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
          {products.docs.map((product) => {
            const {
              slug,
              categories,
              title,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
            } = product

            const minimizedDoc: Partial<Product> = {
              slug,
              categories: categories?.map((cat) =>
                typeof cat === 'object' ? { title: cat.title } : cat,
              ) as Product['categories'],
              title,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
            }

            return <Card key={product.id} doc={minimizedDoc as any} relationTo="products" />
          })}
        </div>

        {products.docs.length === 0 && (
          <div className="text-center py-24">
            <p className="editorial text-[20px] italic text-candera-sage-text mb-6">
              No vessels found in this category.
            </p>
            <a
              href="/products"
              className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
            >
              View all vessels →
            </a>
          </div>
        )}

        <div className="mt-16">
          {products.totalPages > 1 && products.page && (
            <Pagination
              basePath="/products"
              page={products.page}
              totalPages={products.totalPages}
            />
          )}
        </div>
      </div>
    </div>
  )
}
