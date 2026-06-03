import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import PageClient from './page.client'

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description: 'Hand-poured micro-batch candles. Each vessel is numbered and inspected for peak botanical clarity.',
}

export default async function ProductsPage() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    overrideAccess: false,
  })

  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <PageClient />
      <div className="container">
        <div className="mb-20 max-w-[600px]">
          <span className="eyebrow block mb-4">Limited Release</span>
          <h1 className="hero-heading text-candera-obsidian">The Collection</h1>
          <p className="editorial mt-6 text-candera-sage-text">
            Small-batch botanical candles, hand-poured in the studio and numbered for authenticity. Each vessel is cured for two weeks in stillness—ensuring a clean, focused burn that transforms your environment.
          </p>
        </div>

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

            const minimizedDoc: any = {
              slug,
              categories: categories?.map((cat) =>
                typeof cat === 'object' ? { title: cat.title } : cat,
              ),
              title,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
            }

            return (
              <Card
                key={product.id}
                doc={minimizedDoc}
                relationTo="products"
              />
            )
          })}
        </div>

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
