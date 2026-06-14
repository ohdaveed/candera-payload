import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { FeaturedPostCard } from '@/components/FeaturedPostCard'
import { Pagination } from '@/components/Pagination'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      populatedAuthors: true,
      publishedAt: true,
      heroImage: true,
    },
  })

  const featuredPost = posts.docs.length > 0 ? posts.docs[0] : null
  const remainingPosts = posts.docs.slice(1)

  return (
    <main className="bg-candera-vellum" data-page="posts-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="Candera Stories"
        title="The Journal"
        description="Reflections on intentional living, the art of scent, and the stories behind our seasonal batches."
        decorativeWord="Journal"
      />

      {featuredPost && (
        <Section padding="none" className="mt-16 mb-20" data-section="featured-post">
          <Container>
            <FeaturedPostCard post={featuredPost} />
          </Container>
        </Section>
      )}

      <Section padding="large" className="bg-candera-vellum" data-section="post-archive">
        {featuredPost && remainingPosts.length > 0 && (
          <Container>
            <Eyebrow className="block mb-8">More from the Journal</Eyebrow>
          </Container>
        )}

        <CollectionArchive posts={remainingPosts} relationTo="posts" />

        {posts.totalPages > 1 && posts.page && (
          <Container className="mt-16">
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          </Container>
        )}
      </Section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Journal — Candera',
  }
}
