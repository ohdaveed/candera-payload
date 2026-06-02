import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'

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
    <div className="pt-32 pb-24 bg-candera-linen min-h-screen">
      <PageClient />
      <div className="container mb-16">
        <div className="max-w-[560px] mb-12">
          <span className="eyebrow block mb-4">Explore the Studio</span>
          <h1 className="hero-heading text-candera-obsidian">Search</h1>
          <p className="editorial mt-6 text-candera-sage-text">
            Find candles, stories, and studio notes by keyword.
          </p>
        </div>
        <div className="max-w-[50rem]">
          <Search />
        </div>
      </div>

      {posts.docs.length > 0 ? (
        <CollectionArchive posts={posts.docs as CardPostData[]} />
      ) : (
        <div className="container py-16">
          <span className="eyebrow block mb-3">No results</span>
          <p className="editorial text-candera-sage-text">
            {query ? `Nothing matched "${query}" — try a different term.` : 'Enter a keyword above to begin.'}
          </p>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search the Studio | Candera Candles',
    description: 'Search candles, journal entries, and studio notes from Candera.',
  }
}
