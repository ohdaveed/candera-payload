import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { InnerCircleStrip } from '@/components/InnerCircleStrip'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { calculateReadTime } from '@/utilities/readTime'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getServerSideURL } from '@/utilities/getURL'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const readTime = calculateReadTime(post.content)

  // Schema.org requires an absolute image URL; local uploads store relative paths.
  const rawHeroImageUrl =
    post.heroImage && typeof post.heroImage === 'object' && 'url' in post.heroImage
      ? post.heroImage.url
      : null
  const heroImageUrl = rawHeroImageUrl
    ? rawHeroImageUrl.startsWith('http')
      ? rawHeroImageUrl
      : getServerSideURL() + rawHeroImageUrl
    : null

  const authors = (post.populatedAuthors ?? [])
    .map((author) => author?.name)
    .filter((name): name is string => Boolean(name))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta?.description ?? '',
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    ...(authors.length > 0 ? { author: authors.map((name) => ({ '@type': 'Person', name })) } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Candera Candles',
      url: getServerSideURL(),
    },
    ...(heroImageUrl ? { image: [heroImageUrl] } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${getServerSideURL()}/posts/${decodedSlug}`,
    },
  }

  return (
    <article className="bg-candera-vellum min-h-screen" data-page="post-detail">
      <SetHeaderTheme theme="dark" />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* Hero — back link + title + byline integrated */}
      <PostHero post={post} readTime={readTime} />

      {/* Article body */}
      <Section padding="medium" data-section="article-body">
        <Container>
          {/*
            Heading order: PostHero renders the page's single h1. CMS-authored body content
            must stay within h2/h3 — the styles below promote h2/h3 tags directly to .h2/.h3
            visual classes with no structural guard against editors inserting h1 or skipping
            to h4+. Editors should not add h1 in body copy, and h2 should precede h3 in
            document order.
          */}
          <RichText
            className="
              !max-w-[860px] mx-auto
              [&_p]:body [&_p]:mb-7
              [&_h2]:h2 [&_h2]:mt-16 [&_h2]:mb-6
              [&_h3]:h3 [&_h3]:mt-12 [&_h3]:mb-4
              [&_blockquote]:editorial [&_blockquote]:border-l [&_blockquote]:border-candera-ember-strong [&_blockquote]:pl-8 [&_blockquote]:my-12 [&_blockquote]:mx-0
              [&_blockquote_p]:h3 [&_blockquote_p]:mb-0
              [&_ul]:list-none [&_ul]:pl-0 [&_ul_li]:flex [&_ul_li]:gap-3 [&_ul_li]:mb-3 [&_ul_li]:body
              [&_a]:text-candera-ember-strong [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-candera-obsidian [&_a]:transition-colors
            "
            data={post.content}
            enableGutter={false}
          />
        </Container>
      </Section>

      <InnerCircleStrip />

      {/* Related posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <Section padding="large" data-section="related-posts">
          <Container>
            <div className="mb-16">
              <h2 className="h3 text-candera-obsidian">Further Reflections</h2>
              <span className="block w-12 h-px bg-candera-stone/25 mt-3" aria-hidden="true" />
            </div>

            <RelatedPosts docs={post.relatedPosts.filter((p) => typeof p === 'object')} />
          </Container>
        </Section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  const meta = await generateMeta({ doc: post, pathPrefix: 'posts' })

  if (post?.title) {
    meta.title = `${post.title} — Candera`
  }

  return meta
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
