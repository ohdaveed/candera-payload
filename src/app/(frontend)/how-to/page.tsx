import type { Metadata } from 'next/types'

import { ArticleCard } from '@/components/ArticleCard'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { EditorialPageHero } from '@/components/EditorialPageHero'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const guides = await payload.find({
    collection: 'how-to-guides',
    depth: 1,
    limit: 24,
    overrideAccess: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      meta: true,
      publishedAt: true,
      heroImage: true,
    },
  })

  return (
    <main className="bg-candera-vellum overflow-x-hidden" data-page="how-to-listing">
      <SetHeaderTheme theme="dark" />

      <EditorialPageHero
        eyebrow="The Studio"
        title="How-To Guides"
        description="Practical guides for getting the most from your Candera candles."
        decorativeWord="Guides"
      />

      <Section
        padding="large"
        className="bg-candera-vellum pt-8 md:pt-12"
        data-section="how-to-archive"
      >
        <Container>
          {guides.docs.length === 0 ? (
            <output aria-live="polite" className="block py-24 text-center">
              <p className="text-lg text-candera-obsidian">New guides are being written.</p>
              <p className="text-sm text-candera-sage-text mt-2">
                Check back soon for studio notes on scent and care.
              </p>
            </output>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0 m-0 mt-8">
              {guides.docs.map((guide) => {
                const image = guide.meta?.image || guide.heroImage
                const imageUrl =
                  image && typeof image === 'object' && 'url' in image ? image.url : null
                const imageAlt =
                  image && typeof image === 'object' && 'alt' in image ? image.alt : null

                return (
                  <li key={guide.slug}>
                    <ArticleCard
                      title={guide.title}
                      slug={guide.slug}
                      excerpt={guide.meta?.description}
                      date={guide.publishedAt}
                      imageUrl={imageUrl}
                      imageAlt={imageAlt}
                      pathPrefix="/how-to"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </Section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  const title = 'How-To Guides — Candera'
  const description =
    'Practical guides for getting the most from your Candera candles — burning, curing, and caring for botanical scent.'
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
  }
}
