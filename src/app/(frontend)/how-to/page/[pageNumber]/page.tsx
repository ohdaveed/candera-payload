import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/ArticleCard'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { Pagination } from '@/components/Pagination'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

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

  const guides = await payload.find({
    collection: 'how-to-guides',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
    },
  })

  if (guides.docs.length === 0) notFound()

  return (
    <main className="bg-candera-vellum overflow-x-hidden" data-page="how-to-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="The Studio"
        title="How-To Guides"
        description="Practical guides for getting the most from your Candera candles."
        decorativeWord="Guides"
      />

      <Section
        padding="large"
        className="bg-candera-vellum pt-8 md:pt-12"
        data-section="how-to-archive"
      >
        <Container>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0 m-0 mt-8">
            {guides.docs.map((guide) => {
              const image = guide.meta?.image || guide.heroImage
              const imageUrl =
                image && typeof image === 'object' && 'url' in image ? image.url : null
              const imageAlt =
                image && typeof image === 'object' && 'alt' in image ? image.alt : null

              return (
                <li key={guide.slug}>
                  <ArticleCard
                    title={guide.title}
                    slug={guide.slug}
                    excerpt={guide.meta?.description}
                    date={guide.publishedAt}
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    pathPrefix="/how-to"
                  />
                </li>
              )
            })}
          </ul>

          {guides.totalPages > 1 && guides.page && (
            <div className="mt-16">
              <Pagination basePath="/how-to" page={guides.page} totalPages={guides.totalPages} />
            </div>
          )}
        </Container>
      </Section>

      {/* Peak-End Rule: close the journey on a strong, on-brand conversion moment */}
      <InnerCircleCTABlock
        blockType="innerCircleCTA"
        headline="Make every ritual count."
        description="Join the Inner Circle for studio notes, new-batch previews, and seasonal how-to guides before anyone else."
      />
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `How-To Guides — Page ${pageNumber} — Candera`,
  }
}

export async function generateStaticParams() {
  return []
}
