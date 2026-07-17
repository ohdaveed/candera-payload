import type { Metadata } from 'next/types'

import { ArticleCard } from '@/components/ArticleCard'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { Pagination } from '@/components/Pagination'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { getMetaImage } from '@/utilities/getMetaImage'
import { assertPageInRange, pagedListingMetadata, sanitizePageParam } from '@/utilities/listing'
import { queryListingPage } from '@/utilities/listingQuery'

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

  const sanitizedPageNumber = sanitizePageParam(pageNumber, '/how-to')

  const guides = await queryListingPage({
    collection: 'how-to-guides',
    page: sanitizedPageNumber,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
    },
  })

  assertPageInRange(sanitizedPageNumber, guides.totalPages)

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
              const { url: imageUrl, alt: imageAlt } = getMetaImage(
                guide.meta?.image || guide.heroImage,
              )

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

  return pagedListingMetadata({
    titlePrefix: 'How-To Guides',
    description:
      'Practical guides for getting the most from your Candera candles — burning, curing, and caring for botanical scent.',
    basePath: '/how-to',
    pageNumber,
  })
}
