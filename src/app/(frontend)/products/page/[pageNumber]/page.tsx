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
import { notFound, redirect } from 'next/navigation'
import type { Product } from '@/payload-types'
import type { CardPostData } from '@/components/Card'

export const revalidate = 600

function toGridProduct(product: Product): CardPostData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    tagline: product.tagline,
    extraPhotos: product.extraPhotos,
    etsyPrimaryImage: product.etsyPrimaryImage,
    scentProfile: product.scentProfile,
    price: product.price,
    currency: product.currency,
    categories: product.categories?.map((cat) =>
      typeof cat === 'object' && cat !== null ? { title: cat.title } : cat,
    ),
  }
}

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  // Page 1 duplicates the canonical /products route — redirect to avoid duplicate content.
  if (sanitizedPageNumber === 1) redirect('/products')

  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    sort: '-createdAt',
  })

  // Out-of-range page numbers should 404 rather than render an empty grid.
  if (sanitizedPageNumber > (products.totalPages || 1)) notFound()

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
