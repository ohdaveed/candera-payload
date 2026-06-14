import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Search } from '@/search/Component'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import type { CardPostData } from '@/components/Card'
import type { Media } from '@/payload-types'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'
import { searchContent } from '@/lib/queries/search'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

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
      <SetHeaderTheme theme="light" />

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
          <p className="h3 text-candera-sage-text mb-4">Nothing found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-candera-sage-text mb-6">
            Try exploring one of our signature profiles:
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[500px] mx-auto mb-12">
            {['Sandalwood', 'Citrus', 'Smoke', 'Woodland', 'Lavender', 'Ember'].map((s) => (
              <Link
                key={s}
                href={`/search?q=${s}`}
                className="px-3.5 py-1.5 bg-candera-stone/25 hover:bg-candera-stone/40 text-[10px] font-bold uppercase tracking-[.15em] text-candera-obsidian transition-colors duration-200"
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href="/products"
            className="btn-text text-candera-obsidian hover:text-candera-ember-strong"
          >
            ← Return to the Collection
          </Link>
        </div>
      ) : (
        <div className="container pb-32 text-center">
          <p className="h3 text-candera-sage-text mx-auto mb-6 max-w-[280px] sm:max-w-[440px]">
            Try a note, atmosphere, or ritual mood.
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[500px] mx-auto mb-12">
            {['Sandalwood', 'Citrus', 'Smoke', 'Woodland', 'Lavender', 'Ember'].map((s) => (
              <Link
                key={s}
                href={`/search?q=${s}`}
                className="px-3.5 py-1.5 bg-candera-stone/25 hover:bg-candera-stone/40 text-[10px] font-bold uppercase tracking-[.15em] text-candera-obsidian transition-colors duration-200"
              >
                {s}
              </Link>
            ))}
          </div>
          <Link
            href="/products"
            className="btn-text text-candera-obsidian hover:text-candera-ember-strong"
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
    title: 'Search — Candera',
    description: 'Search the Candera collection by scent note, atmosphere, or ritual mood.',
    alternates: { canonical: '/search' },
    openGraph: mergeOpenGraph({
      title: 'Search — Candera',
      description: 'Search the Candera collection by scent note, atmosphere, or ritual mood.',
      url: '/search',
    }),
  }
}
