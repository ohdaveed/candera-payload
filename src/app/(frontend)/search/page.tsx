import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  return (
    <div className="min-h-screen bg-candera-vellum">
      <PageClient />

      <div className="container pt-32 pb-16">
        <PageHeader
          align="center"
          eyebrow="Explore"
          title="Search the Collection"
          description="Discover your next ritual scent."
          maxWidthClassName="max-w-[560px]"
          className="mb-20"
        >
          <Search />
        </PageHeader>
      </div>

      {/* Results section */}
      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : query ? (
        /* Empty state — searched but no results */
        <div className="container pb-32 text-center">
          <p className="editorial text-[24px] italic text-candera-sage-text mb-8">
            Nothing found for &ldquo;{query}&rdquo;
          </p>
          <Link
            href="/products"
            className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
          >
            ← Return to the Collection
          </Link>
        </div>
      ) : (
        /* No-query state — page first loaded */
        <div className="container pb-32 text-center">
          <Link
            href="/products"
            className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
          >
            Explore the full collection →
          </Link>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Search — Candera`,
  }
}
