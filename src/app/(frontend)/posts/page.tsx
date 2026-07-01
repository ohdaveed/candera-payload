import type { Metadata } from 'next/types'

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

import { cacheLife } from 'next/cache'

export default async function Page() {
  'use cache'
  cacheLife({ expire: 600 })

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
      categories: true,
    },
  })

  const featuredPost = posts.docs.length > 0 ? posts.docs[0] : null
  const remainingPosts = posts.docs.slice(1)

  // Match the column count to the number of cards so a short list never leaves an
  // orphaned empty grid track (which reads as "unfinished" more than whitespace does).
  const gridColsClass =
    remainingPosts.length >= 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : remainingPosts.length === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
        : 'grid-cols-1 max-w-md'

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
          <div>
            {/* Section header — full width */}
            <div className="flex flex-col gap-4 max-w-xl mb-12 md:mb-16">
              <p className="eyebrow text-candera-sage-text m-0">More from the Journal</p>
              <h2 className="text-[1.85rem] leading-none font-display font-normal italic text-candera-obsidian m-0">
                Reflections <span className="whitespace-nowrap">&amp; Rituals.</span>
              </h2>
              <p className="font-sans text-sm text-candera-sage-text leading-[1.85] m-0">
                Deep dives into botanical history, studio notes, and the philosophy of slow living.
              </p>
            </div>

            {/* Article card grid — 1/2/3 columns (Hick's Law: scannable, containerized) */}
            <ul className={`grid ${gridColsClass} gap-x-8 gap-y-12 list-none p-0 m-0`}>
              {remainingPosts.map((post) => {
                const { url: imageUrl, alt: imageAlt } = getMetaImage(
                  post.meta?.image || post.heroImage,
                )

                const firstCategory = post.categories?.[0]
                // Use the post's category when set; fall back to a static section
                // label so every card shows a consistent label + date eyebrow.
                const category =
                  firstCategory && typeof firstCategory === 'object'
                    ? firstCategory.title
                    : 'Journal'

                return (
                  <li key={post.slug}>
                    <ArticleCard
                      title={post.title}
                      slug={post.slug}
                      excerpt={post.meta?.description}
                      date={post.publishedAt}
                      category={category}
                      imageUrl={imageUrl}
                      imageAlt={imageAlt}
                    />
                  </li>
                )
              })}
            </ul>
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
  const title = 'Journal — Candera'
  const description =
    'Stories from the Candera studio — notes on scent, craft, and intentional living.'
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}
