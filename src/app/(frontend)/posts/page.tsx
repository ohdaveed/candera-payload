import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
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

  return (
    <div className="pt-32 pb-24">
      <PageClient />
      <div className="container mb-20">
        <div className="max-w-[560px]">
          <span className="eyebrow block mb-4">Candera Stories</span>
          <h1 className="hero-heading text-candera-obsidian">The Journal</h1>
          <p className="editorial mt-6 text-candera-sage-text">
            Reflections on intentional living, the art of scent, and the stories behind our seasonal batches.
          </p>
        </div>
      </div>

      <div className="container mb-12">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} relationTo="posts" />

      <div className="container mt-16">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `The Journal | Candera Candles`,
  }
}
