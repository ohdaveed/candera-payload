import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import { Media } from '@/components/Media'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Badge } from '@/components/ui/badge'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
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

      {/* Featured hero post */}
      {featuredPost && (
        <Section padding="none" className="mb-20">
          <Container>
            <Link href={'/posts/' + featuredPost.slug} className="block group">
              <article className="relative w-full aspect-[16/7] overflow-hidden bg-candera-ash mb-4">
                {featuredPost.meta?.image && (
                  <Media
                    fill
                    imgClassName="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                    resource={featuredPost.meta.image}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-candera-obsidian/75 via-candera-obsidian/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <Badge
                    variant="outline"
                    className="mb-4 text-white border-white/30 uppercase tracking-[.2em] px-3 py-1 bg-white/5 backdrop-blur-sm"
                  >
                    Featured Story
                  </Badge>
                  <h2 className="hero-heading text-white mb-3 max-w-[640px]">
                    {featuredPost.title}
                  </h2>
                  <span className="text-[11px] font-bold uppercase tracking-[.3em] text-white/70">
                    Read the story →
                  </span>
                </div>
              </article>
            </Link>
          </Container>
        </Section>
      )}

      {/* Grid section */}
      <Section padding="large" className="bg-white">
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
