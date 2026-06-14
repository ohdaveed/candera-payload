import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
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

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'
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
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const wordCount = post.content ? JSON.stringify(post.content).split(/\s+/).length : 0
  const readTime = Math.max(1, Math.round(wordCount / 200))

  return (
    <article className="bg-candera-vellum min-h-screen">
      <SetHeaderTheme theme="dark" />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Hero — back link + title + byline integrated */}
      <PostHero post={post} readTime={readTime} />

      {/* Article body */}
      <Section padding="large">
        <Container>
          <RichText
            className="
              max-w-[680px] mx-auto
              [&_p]:font-serif [&_p]:text-[17px] [&_p]:leading-[1.85] [&_p]:text-candera-obsidian [&_p]:mb-7
              [&_h2]:font-display [&_h2]:italic [&_h2]:text-candera-obsidian [&_h2]:text-[clamp(1.75rem,3vw,2.5rem)] [&_h2]:leading-tight [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:m-0
              [&_h3]:font-display [&_h3]:italic [&_h3]:text-candera-obsidian [&_h3]:text-[1.4rem] [&_h3]:mt-12 [&_h3]:mb-4
              [&_blockquote]:border-l-2 [&_blockquote]:border-candera-ember-strong [&_blockquote]:pl-8 [&_blockquote]:my-12 [&_blockquote]:ml-0 [&_blockquote]:mr-0
              [&_blockquote_p]:font-display [&_blockquote_p]:italic [&_blockquote_p]:text-[1.5rem] [&_blockquote_p]:leading-snug [&_blockquote_p]:text-candera-obsidian [&_blockquote_p]:mb-0
              [&_ul]:list-none [&_ul]:pl-0 [&_ul_li]:flex [&_ul_li]:gap-3 [&_ul_li]:mb-3 [&_ul_li]:text-candera-obsidian [&_ul_li]:font-serif [&_ul_li]:text-[16px] [&_ul_li]:leading-relaxed
              [&_a]:text-candera-ember-strong [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-candera-obsidian [&_a]:transition-colors
            "
            data={post.content}
            enableGutter={false}
          />
        </Container>
      </Section>

      {/* Inner Circle CTA — full-bleed editorial dark strip */}
      <aside className="bg-candera-obsidian grain">
        <Container className="py-20 md:py-28 flex flex-col items-center text-center gap-8">
          {/* Eyebrow with flanking rules */}
          <div className="flex items-center gap-4">
            <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
            <Eyebrow className="text-candera-ember">The Inner Circle</Eyebrow>
            <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          </div>

          {/* Headline */}
          <p
            className="font-display italic text-white leading-[1.15] max-w-[36rem] m-0"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            Be the first to know about new batches, scent notes, and studio moments.
          </p>

          <Button asChild variant="cta-ember" size="cta" className="mt-2">
            <Link href="/contact">Join the Circle</Link>
          </Button>

          <p className="text-[10px] uppercase tracking-[.2em] text-white/50 m-0">
            No noise. Unsubscribe anytime.
          </p>
        </Container>
      </aside>

      {/* Related posts */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <Section padding="large">
          <Container>
            {/* Ruled eyebrow */}
            <div className="flex items-center gap-4 mb-16">
              <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
              <Eyebrow as="h4" className="text-candera-sage-text">
                Further Reflections
              </Eyebrow>
              <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
            </div>

            <RelatedPosts
              className="max-w-[1280px] mx-auto"
              docs={post.relatedPosts.filter((p) => typeof p === 'object')}
            />
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
