import type { Post, Product, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CardPostData } from '@/components/Card'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const {
    id,
    categories,
    introContent,
    limit: limitFromProps,
    populateBy,
    selectedDocs,
    relationTo,
  } = props

  const limit = limitFromProps || 3

  let data: (Post | Product)[] = []
  let totalDocs = 0

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedDocs = await payload.find({
      collection: relationTo || 'posts',
      depth: 1,
      limit,
      // Enforce collection read access (anonymous → published only) instead of
      // the Local API default (overrideAccess: true), so this public-facing
      // archive can never surface drafts/unpublished docs on the live page.
      overrideAccess: false,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    data = fetchedDocs.docs as (Post | Product)[]
    totalDocs = fetchedDocs.totalDocs
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      data = filteredSelectedPosts
      totalDocs = data.length
    }
  }

  // Support dynamic count interpolation in intro content
  const serializedIntroContent = introContent ? JSON.parse(JSON.stringify(introContent)) : null
  if (serializedIntroContent?.root?.children) {
    const traverseAndReplace = (node: unknown) => {
      if (typeof node !== 'object' || node === null) return
      const n = node as Record<string, unknown>
      if (typeof n.text === 'string') {
        n.text = n.text.replace('{{count}}', totalDocs.toString())
      }
      if (Array.isArray(n.children)) {
        n.children.forEach(traverseAndReplace)
      }
    }
    traverseAndReplace(serializedIntroContent.root)
  }

  const isPosts = relationTo === 'posts'

  if (!data.length) {
    const empty = isPosts
      ? {
          eyebrow: 'The Journal',
          heading: 'Quiet in the studio.',
          body: 'Studio notes, scent stories, and slow-living rituals are on their way. Join 2,400+ intentional living readers and we’ll let you know when the next story drops.',
          cta: { href: '/inner-circle', label: 'Get notified' },
        }
      : {
          eyebrow: 'Between Pours',
          heading: 'Nothing pouring right now.',
          body: 'Every Candera candle is hand-poured in small, numbered batches — and they often sell out within days. Join the Inner Circle for first access to the next pour.',
          cta: { href: '/inner-circle', label: 'Join the Inner Circle' },
        }

    return (
      <Section id={`block-${id}`} padding="none" className="my-16 md:my-24">
        <Container>
          <div className="mx-auto flex max-w-[520px] flex-col items-center gap-5 py-16 text-center md:py-24">
            <div className="flex items-center gap-2">
              <span className="block h-px w-6 bg-candera-ember" aria-hidden="true" />
              <p className="eyebrow text-candera-sage-text m-0">{empty.eyebrow}</p>
              <span className="block h-px w-6 bg-candera-ember" aria-hidden="true" />
            </div>
            <h3 className="font-display font-normal italic text-candera-obsidian text-2xl md:text-3xl m-0 leading-tight text-balance">
              {empty.heading}
            </h3>
            <p className="font-sans font-light text-candera-sage-text max-w-[440px] m-0 text-sm md:text-base leading-relaxed text-pretty">
              {empty.body}
            </p>
            {empty.cta && (
              <Link
                href={empty.cta.href}
                className="group mt-1 inline-flex min-h-11 w-fit items-center text-xs font-bold uppercase tracking-[.2em] text-candera-obsidian transition-colors hover:text-candera-ember-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-sm"
              >
                <span className="border-b border-candera-obsidian/40 pb-px transition-colors group-hover:border-candera-ember-strong">
                  {empty.cta.label} →
                </span>
              </Link>
            )}
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section id={`block-${id}`} padding="none" className="my-16 md:my-24">
      {isPosts ? (
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-12">
            {/* Left — sticky editorial sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 flex flex-col gap-4">
                {serializedIntroContent && (
                  <RichText
                    className="ms-0
                      [&_h3]:h2 [&_h3]:mb-4
                      [&_p]:editorial [&_p]:text-candera-sage-text"
                    data={serializedIntroContent}
                    enableGutter={false}
                  />
                )}
              </div>
            </div>

            {/* Right — 3-column card grid */}
            <div className="md:col-span-3">
              <CollectionArchive posts={data as CardPostData[]} relationTo="posts" hideSidebar />
            </div>
          </div>
        </Container>
      ) : (
        <Container>
          <CollectionArchive posts={data as CardPostData[]} relationTo={relationTo || 'products'} />
        </Container>
      )}
    </Section>
  )
}
