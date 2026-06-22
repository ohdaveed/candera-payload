import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'
import Link from 'next/link'

import type { Post } from '@/payload-types'
import { PostHero } from '@/heros/PostHero'
import type { PostHeroDoc } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getServerSideURL } from '@/utilities/getURL'

export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function HowToPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/how-to/' + decodedSlug
  const guide = await queryGuideBySlug({ slug: decodedSlug })

  if (!guide) return <PayloadRedirects url={url} />

  const extractText = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const n = node as Record<string, unknown>
    if (typeof n.text === 'string') return n.text
    if (Array.isArray(n.children)) return n.children.map(extractText).join(' ')
    if (n.root) return extractText(n.root)
    return ''
  }
  const plainText = guide.content ? extractText(guide.content) : ''
  const wordCount = plainText ? plainText.trim().split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  const heroImageUrl =
    guide.heroImage && typeof guide.heroImage === 'object' && 'url' in guide.heroImage
      ? guide.heroImage.url
      : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.meta?.description ?? '',
    datePublished: guide.publishedAt ?? guide.createdAt,
    dateModified: guide.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Candera Candles',
      url: getServerSideURL(),
    },
    ...(heroImageUrl ? { image: [heroImageUrl] } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${getServerSideURL()}/how-to/${decodedSlug}`,
    },
  }

  return (
    <article className="bg-candera-vellum min-h-screen" data-page="how-to-detail">
      <SetHeaderTheme theme="dark" />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PostHero
        post={guide as PostHeroDoc}
        readTime={readTime}
        breadcrumbLabel="How-To Guides"
        breadcrumbHref="/how-to"
      />

      <Section padding="medium" data-section="article-body">
        <Container>
          <RichText
            className="
              !max-w-[860px] mx-auto
              [&_p]:body [&_p]:mb-7
              [&_h2]:h2 [&_h2]:mt-16 [&_h2]:mb-6
              [&_h3]:h3 [&_h3]:mt-12 [&_h3]:mb-4
              [&_blockquote]:editorial [&_blockquote]:border-l-2 [&_blockquote]:border-candera-ember-strong [&_blockquote]:pl-8 [&_blockquote]:my-12 [&_blockquote]:mx-0
              [&_blockquote_p]:h3 [&_blockquote_p]:mb-0
              [&_ul]:list-none [&_ul]:pl-0 [&_ul_li]:flex [&_ul_li]:gap-3 [&_ul_li]:mb-3 [&_ul_li]:body
              [&_a]:text-candera-ember-strong [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-candera-obsidian [&_a]:transition-colors
            "
            data={guide.content}
            enableGutter={false}
          />
        </Container>
      </Section>

      <aside className="bg-candera-obsidian grain" data-section="inner-circle-cta">
        <Container className="py-20 md:py-28 flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-4">
            <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
            <Eyebrow className="text-candera-ember">The Inner Circle</Eyebrow>
            <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          </div>
          <h2 className="h2 text-candera-vellum leading-[1.15] max-w-[36rem] m-0">
            Be the first to know about new batches, scent notes, and studio moments.
          </h2>
          <Button asChild variant="cta-ember" size="cta" className="mt-2">
            <Link href="/contact">Join the Circle</Link>
          </Button>
          <p className="caption text-candera-vellum/50 m-0">No noise. Unsubscribe anytime.</p>
        </Container>
      </aside>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const guide = await queryGuideBySlug({ slug: decodedSlug })

  if (!guide) return { title: 'Guide Not Found — Candera' }

  const meta = await generateMeta({ doc: guide as unknown as Partial<Post>, pathPrefix: 'how-to' })
  meta.title = `${guide.title} — Candera`
  return meta
}

const queryGuideBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'how-to-guides',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})
