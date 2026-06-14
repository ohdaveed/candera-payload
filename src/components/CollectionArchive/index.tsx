import React from 'react'
import Link from 'next/link'
import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
}

export const CollectionArchive: React.FC<Props> = ({ posts, relationTo = 'posts' }) => {
  const collectionPath = relationTo === 'products' ? '/products' : '/posts'

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] bg-candera-vellum">
      {/* Left sidebar — sticky, top-aligned with first image row */}
      <div className="p-6 md:pt-7 md:pb-7 md:pl-[52px] md:pr-9 border-b md:border-b-0 md:border-r border-[rgba(180,160,130,0.18)] md:sticky md:top-0 md:self-start bg-candera-vellum flex flex-col gap-[14px]">
        <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-candera-sage-text m-0">
          The Collection
        </p>
        <h2 className="font-display text-[24px] text-candera-obsidian leading-[1.15] m-0">
          Not manufactured.
          <br />
          Made.
        </h2>
        <p className="font-sans text-[12px] text-candera-sage-text leading-[1.75] m-0">
          Every Candera candle designed, poured, and finished by hand — by Olesia, the only maker.
          No two are exactly alike.
        </p>
        <Link
          href={collectionPath}
          className="font-sans text-[9px] font-bold uppercase tracking-[3px] text-candera-obsidian no-underline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '13px 20px 13px 0',
            borderBottom: '1px solid var(--candera-ember)',
            width: 'fit-content',
          }}
        >
          View all →
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
