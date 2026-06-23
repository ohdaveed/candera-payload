import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Search } from '@/search/Component'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import type { CardPostData } from '@/components/Card'
import type { Media } from '@/payload-types'
import Link from 'next/link'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { searchContent } from '@/lib/queries/search'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

const FALLBACK_SUGGESTIONS = ['Sandalwood', 'Citrus', 'Smoke', 'Woodland', 'Lavender', 'Ember']

type Args = {
  searchParams: Promise<{
    q: string
  }>
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise

  const [results, studioInfo] = await Promise.all([
    searchContent(query ?? ''),
    getCachedGlobal('studio-info')(),
  ])

  const suggestions = Array.from(
    new Set(
      studioInfo?.searchSuggestions && studioInfo.searchSuggestions.length > 0
        ? studioInfo.searchSuggestions.map((s) => s.term)
        : FALLBACK_SUGGESTIONS,
    ),
  )

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
    <main className="min-h-screen bg-candera-vellum" data-page="search">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="The Collection"
        title="Search the Collection"
        description="Discover your next ritual scent by note, atmosphere, or mood."
        decorativeWord="Search"
      />

      <Section padding="large" data-section="search-input">
        <Container>
          <div className="max-w-[560px] mx-auto">
            <Search />
          </div>
        </Container>
      </Section>

      {posts.length > 0 ? (
        <CollectionArchive posts={posts} />
      ) : query ? (
        <div className="container pb-32 text-center">
          <p className="h3 text-candera-sage-text mb-4">Nothing found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-candera-sage-text mb-6">
            Try exploring one of our signature profiles:
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-[500px] mx-auto mb-12">
            {suggestions.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="px-3.5 py-1.5 bg-candera-stone/25 hover:bg-candera-stone/40 text-xs font-bold uppercase tracking-[.15em] text-candera-obsidian transition-colors duration-200"
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
            {suggestions.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="px-3.5 py-1.5 bg-candera-stone/25 hover:bg-candera-stone/40 text-xs font-bold uppercase tracking-[.15em] text-candera-obsidian transition-colors duration-200"
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
    </main>
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
