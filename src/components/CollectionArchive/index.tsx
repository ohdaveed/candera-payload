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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        background: 'var(--candera-vellum)',
      }}
    >
      {/* Left sidebar — sticky, top-aligned with first image row */}
      <div
        style={{
          padding: '28px 36px 28px 52px',
          borderRight: '1px solid rgba(180,160,130,0.18)',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
          background: 'var(--candera-vellum)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
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
      <div style={{ padding: '28px 52px 28px 0' }}>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
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
