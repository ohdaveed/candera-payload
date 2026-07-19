import React from 'react'
import Link from 'next/link'
import { Card, CardPostData } from '@/components/Card'
import { ProductGrid } from '@/components/ProductGrid'

export type Props = {
  posts: CardPostData[]
  relationTo?: 'posts' | 'products'
  hideSidebar?: boolean
  sidebarEyebrow?: string
  sidebarTitle?: string
  sidebarDescription?: string
  sidebarLinkText?: string
  /** Overrides the default eyebrow/title/description/link sidebar with custom content (e.g. CMS-authored RichText intro). */
  sidebarContent?: React.ReactNode
}

/**
 * Strips a doc down to the fields the Card actually renders, so full Payload
 * docs never get serialized across the client-component boundary.
 */
const minimizeDoc = (result: CardPostData): CardPostData => {
  const {
    slug,
    categories,
    meta,
    title,
    tagline,
    extraPhotos,
    etsyPrimaryImage,
    scentProfile,
    burnTime,
    atmosphere,
    productTag,
    vessel,
    price,
    currency,
    populatedAuthors,
    publishedAt,
    heroImage,
  } = result

  return {
    slug,
    categories: categories?.map((cat) => (typeof cat === 'object' ? { title: cat.title } : cat)),
    meta: { description: meta?.description, image: meta?.image },
    title,
    tagline,
    extraPhotos,
    etsyPrimaryImage,
    scentProfile,
    burnTime,
    atmosphere,
    productTag,
    vessel,
    price,
    currency,
    populatedAuthors,
    publishedAt,
    heroImage,
  } as CardPostData
}

const PostCardList: React.FC<{
  posts: CardPostData[]
  className?: string
}> = ({ posts, className = 'grid grid-cols-1 lg:grid-cols-2 gap-8' }) => (
  <ul className={`${className} list-none p-0 m-0`}>
    {posts?.map((result, index) => {
      if (typeof result !== 'object' || result === null) return null

      return (
        <li key={index}>
          <Card className="h-full" doc={minimizeDoc(result)} relationTo="posts" showCategories />
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
  sidebarContent,
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

  // FE-09 convergence: product cards always render through the canonical
  // ProductGrid (same grid, motion, and Card variants as /products listings).
  const grid = isProducts ? (
    <ProductGrid
      products={posts
        .filter((result) => typeof result === 'object' && result !== null)
        .map(minimizeDoc)}
    />
  ) : (
    <PostCardList posts={posts} />
  )

  if (hideSidebar) {
    return grid
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mt-24 bg-candera-vellum pb-16 md:pb-24">
      {/* Left sidebar — sticky */}
      <div className="lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-28 lg:self-start flex flex-col gap-4">
        {sidebarContent ?? (
          <>
            <p className="eyebrow text-candera-sage-text m-0">{sidebarEyebrow || defaultEyebrow}</p>
            <h2 className="h3 text-candera-obsidian m-0">{sidebarTitle || defaultTitle}</h2>
            <p className="font-sans text-sm text-candera-sage-text leading-[1.85] mt-[1.75rem] m-0">
              {sidebarDescription || defaultDescription}
            </p>
            <Link
              href={collectionPath}
              className="btn-text text-candera-obsidian no-underline border-b border-candera-ember-strong pb-px w-fit inline-flex items-center gap-1.5 hover:text-candera-ember-strong transition-colors mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              {sidebarLinkText || defaultLinkText}
            </Link>
          </>
        )}
      </div>

      {/* Right — card grid */}
      <div className="flex-1 min-w-0">{grid}</div>
    </div>
  )
}
