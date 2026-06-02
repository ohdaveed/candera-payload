import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Card } from '@/components/Card'

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

  return (
    <div className="pt-32 pb-24 bg-candera-linen min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10">
        <div className="mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[.35em] text-candera-sage mb-3">
            The Collection
          </p>
          <h1
            className="font-display font-thin italic text-candera-obsidian leading-[1.08] m-0"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}
          >
            Rooted in Earth, Released in Air.
          </h1>
          <p className="mt-4 font-editorial italic text-[17px] text-candera-sage-text leading-relaxed max-w-[560px]">
            Each vessel is part of a numbered micro-batch, hand-labeled and inspected for peak botanical clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              doc={product as any}
              relationTo="products"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
