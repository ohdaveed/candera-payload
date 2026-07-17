import type { Metadata } from 'next/types'

import { FeaturedPostCard } from '@/components/FeaturedPostCard'
import { Pagination } from '@/components/Pagination'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { listingMetadata } from '@/utilities/listing'
import { queryListingPage } from '@/utilities/listingQuery'
import { PostsArchiveGrid } from './PostsArchiveGrid'

import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife({ expire: 600 })

  const posts = await queryListingPage({
    collection: 'posts',
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
      categories: true,
    },
  })

  const featuredPost = posts.docs.length > 0 ? posts.docs[0] : null
  const remainingPosts = posts.docs.slice(1)

  return (
    <main className="bg-candera-vellum overflow-x-hidden" data-page="posts-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Candera Stories"
        title="The Journal"
        description="Reflections on intentional living, the art of scent, and the stories behind our seasonal batches."
        decorativeWord="Journal"
      />

      {featuredPost && (
        <Section padding="none" className="mt-24 md:mt-16 mb-20" data-section="featured-post">
          <Container>
            <FeaturedPostCard post={featuredPost} />
          </Container>
        </Section>
      )}

      <Section
        padding="none"
        className="bg-candera-vellum pb-24 md:pb-32"
        data-section="post-archive"
      >
        <Container>
          <PostsArchiveGrid posts={remainingPosts} />

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

export function generateMetadata(): Metadata {
  return listingMetadata({
    titlePrefix: 'Journal',
    description: 'Stories from the Candera studio — notes on scent, craft, and intentional living.',
    basePath: '/posts',
  })
}
