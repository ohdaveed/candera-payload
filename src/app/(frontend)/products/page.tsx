import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import { ProductFilters } from '@/components/ProductFilters'

export const revalidate = 600

export const metadata: Metadata = {
  title: 'Collection — Candera',
  description: 'Hand-poured micro-batch candles. Each vessel is numbered and inspected for peak botanical clarity.',
}

export default async function ProductsPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs: products } = await payload.find({
    collection: 'products',
    limit: 24,
    overrideAccess: false,
    pagination: false,
  })

  const minimized = products.map((p) => ({
    id: String(p.id),
    slug: p.slug,
    title: p.title,
    extraPhotos: p.extraPhotos,
    scentProfile: p.scentProfile,
    burnTime: p.burnTime,
    atmosphere: p.atmosphere,
    productTag: p.productTag,
    vessel: p.vessel,
    price: p.price,
    tagline: p.tagline,
  }))

  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <div className="container">
        <div className="mb-20 max-w-[600px]">
          <span className="eyebrow block mb-4">Limited Release</span>
          <h1 className="hero-heading text-candera-obsidian">The Collection</h1>
          <p className="editorial mt-6 text-candera-sage-text">
            Small-batch botanical candles, hand-poured in the studio and numbered for authenticity. Each vessel is part of a finite batch, cured for two weeks in stillness.
          </p>
        </div>

        <Suspense>
          <ProductFilters products={minimized} />
        </Suspense>
      </div>
    </div>
  )
}
