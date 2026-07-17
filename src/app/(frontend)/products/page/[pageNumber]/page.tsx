import type { Metadata } from 'next/types'

import { Pagination } from '@/components/Pagination'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import { ProductGrid } from '../../ProductGrid'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { toGridProduct } from '@/components/Card/toGridProduct'
import { assertPageInRange, pagedListingMetadata, sanitizePageParam } from '@/utilities/listing'

import { cacheLife } from 'next/cache'

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  'use cache'
  cacheLife({ expire: 600 })

  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = sanitizePageParam(pageNumber, '/products')

  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    sort: '-createdAt',
  })

  assertPageInRange(sanitizedPageNumber, products.totalPages)

  return (
    <main className="bg-candera-vellum min-h-screen" data-page="products-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Botanical Study"
        title="The Collection"
        description="Small-batch botanical candles, hand-poured and cured for two weeks in stillness before each release."
        decorativeWord="Collection"
      />

      <Section padding="large" data-section="collection-grid">
        <Container>
          <p className="eyebrow text-candera-sage-text mb-8">
            {products.totalDocs} pieces in the collection
          </p>

          <ProductGrid products={products.docs.map(toGridProduct)} />

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

      {/* Peak-End Rule: close the journey on a strong, on-brand conversion moment */}
      <InnerCircleCTABlock
        blockType="innerCircleCTA"
        headline="First access to every new batch."
        description="Our batches often sell out in days. Join the Inner Circle for advance notice before each release goes public."
      />
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise

  return pagedListingMetadata({
    titlePrefix: 'Collection',
    description:
      'Browse the Candera collection — hand-poured botanical candles in numbered, micro-batch releases.',
    basePath: '/products',
    pageNumber,
  })
}
