import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { PageHeader } from '@/components/PageHeader'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  // Out-of-range page numbers should 404 rather than render an empty grid.
  // `|| 1` keeps page 1 valid (its empty state) when the collection is empty,
  // while still 404ing page 2+ in that case.
  if (sanitizedPageNumber > (products.totalPages || 1)) notFound()

  return (
    <div className="pt-32 pb-32 bg-candera-linen min-h-screen">
      <SetHeaderTheme theme="light" />

      <div className="container mb-20">
        <PageHeader eyebrow="Limited Release" title="The Collection" />
      </div>

      <div className="container mb-8">
        <PageRange
          collection="products"
          currentPage={products.page}
          limit={12}
          totalDocs={products.totalDocs}
        />
      </div>

      <CollectionArchive posts={products.docs} relationTo="products" />

      <div className="container mt-16">
        {products?.page && products?.totalPages > 1 && (
          <Pagination basePath="/products" page={products.page} totalPages={products.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const title = `Collection — Page ${pageNumber} — Candera`
  const description =
    'Browse the Candera collection — hand-poured botanical candles in numbered, micro-batch releases.'
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}

export async function generateStaticParams() {
  return []
}
