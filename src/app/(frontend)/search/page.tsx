import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import type { CardPostData } from '@/components/Card'
import type { Media } from '@/payload-types'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { searchContent } from '@/lib/queries/search'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  const results = await searchContent(query ?? '')

  const posts: CardPostData[] = results.map((r) => ({
    title: r.title ?? '',
    slug: r.slug ?? '',
    categories: undefined,
    meta: {
      title: r.meta?.title ?? undefined,
      description: r.meta?.description ?? undefined,
      image:
        r.meta?.image && typeof r.meta.image === 'object' ? (r.meta.image as Media) : undefined,
    },
  }))

  return (
    <div className="min-h-screen bg-candera-vellum">
      <PageClient />

      <div className="container pt-40 md:pt-32 pb-16">
        <PageHeader
          align="center"
          title="Search the Collection"
          description="Discover your next ritual scent."
          maxWidthClassName="max-w-[560px]"
          className="mb-20"
        >
          <Search />
        </PageHeader>
      </div>

      {posts.length > 0 ? (
        <CollectionArchive posts={posts} />
      ) : query ? (
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
        <div className="container pb-32 text-center">
          <p className="editorial mx-auto mb-8 max-w-[280px] text-[22px] italic text-candera-sage-text sm:max-w-[440px]">
            Try a note, atmosphere, or ritual mood.
          </p>
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
