import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { FeaturedPostCard } from '@/components/FeaturedPostCard'
import { Pagination } from '@/components/Pagination'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import PageClient from './page.client'
import { PageHeader } from '@/components/PageHeader'

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
    },
  })

  const featuredPost = posts.docs.length > 0 ? posts.docs[0] : null
  const remainingPosts = posts.docs.slice(1)

  return (
    <main className="bg-candera-vellum">
      <PageClient />

      <Section padding="large" className="pt-32 pb-16">
        <Container>
          <PageHeader
            eyebrow="Candera Stories"
            title="The Journal"
            description="Reflections on intentional living, the art of scent, and the stories behind our seasonal batches."
          />
        </Container>
      </Section>

      {featuredPost && (
        <Section padding="none" className="mb-20">
          <Container>
            <FeaturedPostCard post={featuredPost} />
          </Container>
        </Section>
      )}

      <Section padding="large" className="bg-candera-vellum">
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
    title: `The Journal | Candera Candles`,
  }
}
