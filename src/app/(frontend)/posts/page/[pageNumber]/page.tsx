import type { Metadata } from 'next/types'

import { Pagination } from '@/components/Pagination'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { assertPageInRange, pagedListingMetadata, sanitizePageParam } from '@/utilities/listing'
import { queryListingPage } from '@/utilities/listingQuery'
import { PostsArchiveGrid } from '../../PostsArchiveGrid'

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

  const sanitizedPageNumber = sanitizePageParam(pageNumber, '/posts')

  const posts = await queryListingPage({
    collection: 'posts',
    page: sanitizedPageNumber,
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
      categories: true,
    },
  })

  assertPageInRange(sanitizedPageNumber, posts.totalPages)

  return (
    <main className="bg-candera-vellum overflow-x-hidden" data-page="posts-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Candera Stories"
        title="The Journal"
        description="Reflections on intentional living, the art of scent, and the stories behind our seasonal batches."
        decorativeWord="Journal"
      />

      {/* Same archive structure as page 1 (minus the featured-post treatment) —
          paginating must not change the page's fundamental layout (FE-10). */}
      <Section
        padding="none"
        className="bg-candera-vellum pt-24 md:pt-16 pb-24 md:pb-32"
        data-section="post-archive"
      >
        <Container>
          <PostsArchiveGrid posts={posts.docs} />

          {posts.totalPages > 1 && posts.page && (
            <div className="mt-16">
              <Pagination page={posts.page} totalPages={posts.totalPages} />
            </div>
          )}
        </Container>
      </Section>

      {/* Peak-End Rule: close the journey on a strong, on-brand conversion moment */}
      <InnerCircleCTABlock
        blockType="innerCircleCTA"
        headline="Stories, straight from the studio."
        description="Join the Inner Circle for new journal entries, behind-the-scenes notes, and seasonal ritual invitations."
      />
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise

  return pagedListingMetadata({
    titlePrefix: 'Journal',
    description: 'Stories from the Candera studio — notes on scent, craft, and intentional living.',
    basePath: '/posts',
    pageNumber,
  })
}
