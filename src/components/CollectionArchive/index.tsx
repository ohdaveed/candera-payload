import React from 'react'
import Link from 'next/link'
import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
  hideSidebar?: boolean
  sidebarEyebrow?: string
  sidebarTitle?: string
  sidebarDescription?: string
  sidebarLinkText?: string
}

const CardList: React.FC<{
  posts: CardPostData[]
  relationTo: 'posts' | 'products'
  className?: string
}> = ({
  posts,
  relationTo,
  className = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3',
}) => (
  <ul className={`${className} list-none p-0 m-0`}>
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
        heroImage,
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
        heroImage,
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
)

export const CollectionArchive: React.FC<Props> = ({
  posts,
  relationTo = 'posts',
  hideSidebar = false,
  sidebarEyebrow,
  sidebarTitle,
  sidebarDescription,
  sidebarLinkText,
}) => {
  const isProducts = relationTo === 'products'
  const collectionPath = isProducts ? '/products' : '/posts'

  const defaultEyebrow = isProducts ? 'The Collection' : 'The Journal'
  const defaultTitle = isProducts ? (
    <>
      Not manufactured.
      <br />
      Made.
    </>
  ) : (
    <>
      Reflections <span className="whitespace-nowrap">{'& Rituals.'}</span>
    </>
  )
  const defaultDescription = isProducts
    ? 'Every Candera candle designed, poured, and finished by hand — by Olesia, the only maker. No two are exactly alike.'
    : 'Deep dives into botanical history, studio notes, and the philosophy of slow living.'
  const defaultLinkText = isProducts ? 'View all →' : 'View all stories →'

  if (hideSidebar) {
    return (
      <CardList
        posts={posts}
        relationTo={relationTo}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-x-12 bg-candera-vellum py-16 md:py-24">
      {/* Left sidebar — sticky (spans columns 1-4) */}
      <div className="md:col-span-4 md:sticky md:top-28 md:self-start flex flex-col gap-4">
        <p className="eyebrow text-candera-sage-text m-0">{sidebarEyebrow || defaultEyebrow}</p>
        <h2 className="text-[1.85rem] leading-none font-display font-normal italic text-candera-obsidian m-0">
          {sidebarTitle || defaultTitle}
        </h2>
        <p className="font-sans text-sm text-candera-sage-text leading-[1.85] mt-[1.75rem] m-0">
          {sidebarDescription || defaultDescription}
        </p>
        <Link
          href={collectionPath}
          className="btn-text text-candera-obsidian no-underline border-b border-candera-ember-strong pb-px w-fit inline-flex items-center gap-1.5 hover:text-candera-ember-strong transition-colors mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          {sidebarLinkText || defaultLinkText}
        </Link>
      </div>

      {/* Right — card grid (spans columns 5-12) */}
      <div className="md:col-span-8">
        <CardList
          posts={posts}
          relationTo={relationTo}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        />
      </div>
    </div>
  )
}
