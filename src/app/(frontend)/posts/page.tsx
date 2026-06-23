import type { Metadata } from 'next/types'
import Link from 'next/link'

import { ArticleCard } from '@/components/ArticleCard'
import { FeaturedPostCard } from '@/components/FeaturedPostCard'
import { Pagination } from '@/components/Pagination'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { InnerCircleCTABlock } from '@/blocks/InnerCircleCTA/Component'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { getMetaImage } from '@/utilities/getMetaImage'

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
      meta: true,
      publishedAt: true,
      heroImage: true,
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
        <Section padding="none" className="mt-16 mb-28" data-section="featured-post">
          <Container>
            <FeaturedPostCard post={featuredPost} />
          </Container>
        </Section>
      )}

      <Section
        padding="large"
        className="bg-candera-vellum pt-8 md:pt-12"
        data-section="post-archive"
      >
        <Container>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mt-24 pb-16 md:pb-24">
            {/* Left sidebar — sticky */}
            <div className="lg:w-80 lg:flex-shrink-0 md:sticky md:top-28 md:self-start flex flex-col gap-4">
              <p className="eyebrow text-candera-sage-text m-0">More from the Journal</p>
              <h2 className="text-[1.85rem] leading-none font-display font-normal italic text-candera-obsidian m-0">
                Reflections <span className="whitespace-nowrap">&amp; Rituals.</span>
              </h2>
              <p className="font-sans text-sm text-candera-sage-text leading-[1.85] mt-[1.75rem] m-0">
                Deep dives into botanical history, studio notes, and the philosophy of slow living.
              </p>
              <Link
                href="/posts"
                className="btn-text text-candera-obsidian no-underline border-b border-candera-ember-strong pb-px w-fit inline-flex items-center gap-1.5 hover:text-candera-ember-strong transition-colors mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                View all stories →
              </Link>
            </div>

            {/* Right — article card grid */}
            <div className="flex-1 min-w-0">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none p-0 m-0">
                {remainingPosts.map((post) => {
                  const { url: imageUrl, alt: imageAlt } = getMetaImage(
                    post.meta?.image || post.heroImage,
                  )

                  return (
                    <li key={post.slug}>
                      <ArticleCard
                        title={post.title}
                        slug={post.slug}
                        excerpt={post.meta?.description}
                        date={post.publishedAt}
                        imageUrl={imageUrl}
                        imageAlt={imageAlt}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

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
  return {
    title: 'Journal — Candera',
  }
}
