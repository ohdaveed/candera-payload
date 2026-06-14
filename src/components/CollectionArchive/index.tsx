import React from 'react'
import Link from 'next/link'
import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
  sidebarEyebrow?: string
  sidebarTitle?: string
  sidebarDescription?: string
  sidebarLinkText?: string
}

export const CollectionArchive: React.FC<Props> = ({
  posts,
  relationTo = 'posts',
  sidebarEyebrow,
  sidebarTitle,
  sidebarDescription,
  sidebarLinkText,
}) => {
  const isProducts = relationTo === 'products'
  const collectionPath = isProducts ? '/products' : '/posts'

  // Default sidebar content based on relation
  const defaultEyebrow = isProducts ? 'The Collection' : 'The Journal'
  const defaultTitle = isProducts ? (
    <>
      Not manufactured.
      <br />
      Made.
    </>
  ) : (
    <>
      Reflections
      <br />& Rituals.
    </>
  )
  const defaultDescription = isProducts
    ? 'Every Candera candle designed, poured, and finished by hand — by Olesia, the only maker. No two are exactly alike.'
    : 'Deep dives into botanical history, studio notes, and the philosophy of slow living.'
  const defaultLinkText = isProducts ? 'View all →' : 'View all stories →'

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] bg-candera-vellum">
      {/* Left sidebar — sticky, top-aligned with first image row */}
      <div className="p-6 md:pt-7 md:pb-7 md:pl-[52px] md:pr-9 border-b md:border-b-0 md:border-r border-[rgba(180,160,130,0.18)] md:sticky md:top-0 md:self-start bg-candera-vellum flex flex-col gap-[14px]">
        <p className="font-sans text-xs font-bold uppercase tracking-[4px] text-candera-sage-text m-0">
          {sidebarEyebrow || defaultEyebrow}
        </p>
        <h2 className="font-display text-xl text-candera-obsidian leading-[1.15] m-0">
          {sidebarTitle || defaultTitle}
        </h2>
        <p className="font-sans text-sm text-candera-sage-text leading-[1.75] m-0">
          {sidebarDescription || defaultDescription}
        </p>
        <Link
          href={collectionPath}
          className="inline-flex items-center gap-[6px] py-[13px] pr-[20px] pl-0 border-b border-candera-ember w-fit font-sans text-xs font-bold uppercase tracking-[3px] text-candera-obsidian no-underline"
        >
          {sidebarLinkText || defaultLinkText}
        </Link>
      </div>

      {/* Right — 3-column product grid */}
      <div className="p-6 md:pt-7 md:pb-7 md:pr-[52px] md:pl-0">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 list-none p-0 m-0">
          {posts?.map((result, index) => {
            if (typeof result !== 'object' || result === null) return null

            const {
              slug,
              categories,
              meta,
              title,
              tagline,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
              populatedAuthors,
              publishedAt,
            } = result

            const minimizedDoc = {
              slug,
              categories: categories?.map((cat) =>
                typeof cat === 'object' ? { title: cat.title } : cat,
              ),
              meta: { description: meta?.description, image: meta?.image },
              title,
              tagline,
              extraPhotos,
              scentProfile,
              burnTime,
              atmosphere,
              productTag,
              vessel,
              price,
              populatedAuthors,
              publishedAt,
            }

            return (
              <li key={index}>
                <Card
                  className="h-full"
                  doc={minimizedDoc as CardPostData}
                  relationTo={relationTo}
                  showCategories
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
