import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Separator } from '@/components/ui/separator'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Badge } from '@/components/ui/badge'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import RichText from '@/components/RichText'
import Link from 'next/link'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const wordCount = post.content ? JSON.stringify(post.content).split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <article className="bg-white min-h-screen">
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Hero section with return link */}
      <Section padding="none" className="relative">
        <Container className="absolute top-0 left-0 right-0 z-20 pt-8">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.3em] text-white/70 hover:text-candera-ember transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            The Journal
          </Link>
        </Container>

        <PostHero post={post} />
      </Section>

      {/* Reading time */}
      <Container className="pt-8">
        <Badge
          variant="secondary"
          className="bg-candera-vellum text-candera-sage-text border-candera-stone/20 uppercase tracking-[.2em] px-3"
        >
          {readTime} min read
        </Badge>
      </Container>

      <Section padding="large">
        <Container>
          <RichText
            className="max-w-[680px] mx-auto
              [&_p]:editorial [&_p]:text-candera-obsidian [&_p]:mb-8
              [&_h2]:h2 [&_h2]:mb-6
              [&_blockquote]:editorial [&_blockquote]:text-[24px] [&_blockquote]:border-l-0 [&_blockquote]:text-center [&_blockquote]:my-16 [&_blockquote]:text-candera-rose-strong"
            data={post.content}
            enableGutter={false}
          />

          {/* InnerCircle CTA */}
          <Section
            as="aside"
            padding="medium"
            className="max-w-[680px] mx-auto mt-20 bg-candera-vellum border border-candera-stone/20 text-center"
          >
            <Eyebrow className="block mb-4">The Inner Circle</Eyebrow>
            <p className="editorial text-[18px] text-candera-sage-text mb-8 leading-relaxed">
              Be the first to know about new batches, scent notes, and studio moments.
            </p>
            <Button asChild variant="cta" size="cta">
              <Link href="/contact">Join the Circle</Link>
            </Button>
          </Section>

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <Section as="nav" padding="large" className="mt-32">
              <Separator className="bg-candera-stone/20 mb-20" aria-hidden="true" />
              <Eyebrow as="h4" className="text-center mb-16">
                Further Reflections
              </Eyebrow>
              <RelatedPosts
                className="max-w-[1280px] mx-auto"
                docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              />
            </Section>
          )}
        </Container>
      </Section>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
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
