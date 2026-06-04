import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Pagination } from '@/components/Pagination'
import { Media } from '@/components/Media'
import { Eyebrow } from '@/components/ui/eyebrow'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import PageClient from './page.client'

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
    <div className="bg-candera-vellum">
      <PageClient />

      {/* Page header */}
      <section className="bg-candera-vellum pt-32 pb-16">
        <div className="container">
          <div className="max-w-[560px]">
            <Eyebrow className="block mb-4">Candera Stories</Eyebrow>
            <h1 className="hero-heading text-candera-obsidian">The Journal</h1>
            <p className="editorial mt-6 text-candera-sage-text">
              Reflections on intentional living, the art of scent, and the stories behind our seasonal batches.
            </p>
          </div>
        </div>
      </section>

      {/* Featured hero post */}
      {featuredPost && (
        <div className="container mb-20">
          <Link href={'/posts/' + featuredPost.slug}>
            <div className="relative w-full aspect-[16/7] overflow-hidden bg-candera-ash mb-4 group">
              {featuredPost.meta?.image && (
                <Media
                  fill
                  imgClassName="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  resource={featuredPost.meta.image}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-candera-obsidian/75 via-candera-obsidian/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <Eyebrow className="block mb-3 text-candera-ember">Featured</Eyebrow>
                <h2 className="hero-heading text-white mb-3 max-w-[640px]">{featuredPost.title}</h2>
                <span className="text-[11px] font-bold uppercase tracking-[.3em] text-white/70">
                  Read the story →
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid section */}
      <div className="bg-white pb-24">
        <div className="container pt-20">
          {featuredPost && remainingPosts.length > 0 && (
            <Eyebrow className="block mb-8">More from the Journal</Eyebrow>
          )}
        </div>

        <CollectionArchive posts={remainingPosts} relationTo="posts" />

        <div className="container mt-16">
          {posts.totalPages > 1 && posts.page && (
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `The Journal | Candera Candles`,
  }
}
