import React from 'react'

import { ArticleCard } from '@/components/ArticleCard'
import { getMetaImage } from '@/utilities/getMetaImage'
import type { Post } from '@/payload-types'

export type ArchivePost = Pick<
  Post,
  'title' | 'slug' | 'meta' | 'publishedAt' | 'heroImage' | 'categories'
>

/**
 * The journal archive section — header + article card grid. Shared by /posts
 * and /posts/page/[n] so paginating never changes the page's fundamental
 * structure (FE-10 in docs/tech-debt-remediation-2026-07-16.md).
 */
export const PostsArchiveGrid: React.FC<{ posts: ArchivePost[] }> = ({ posts }) => {
  // Match the column count to the number of cards so a short list never leaves an
  // orphaned empty grid track (which reads as "unfinished" more than whitespace does).
  const gridColsClass =
    posts.length >= 3
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : posts.length === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
        : 'grid-cols-1 max-w-md'

  return (
    <div>
      {/* Section header — full width */}
      <div className="flex flex-col gap-4 max-w-xl mb-12 md:mb-16">
        <p className="eyebrow text-candera-sage-text m-0">More from the Journal</p>
        <h2 className="text-[1.85rem] leading-none font-display font-normal italic text-candera-obsidian m-0">
          Reflections <span className="whitespace-nowrap">&amp; Rituals.</span>
        </h2>
        <p className="font-sans text-sm text-candera-sage-text leading-[1.85] m-0">
          Deep dives into botanical history, studio notes, and the philosophy of slow living.
        </p>
      </div>

      {/* Article card grid — 1/2/3 columns (Hick's Law: scannable, containerized) */}
      <ul className={`grid ${gridColsClass} gap-x-8 gap-y-12 list-none p-0 m-0`}>
        {posts.map((post) => {
          const { url: imageUrl, alt: imageAlt } = getMetaImage(post.meta?.image || post.heroImage)

          const firstCategory = post.categories?.[0]
          // Use the post's category when set; fall back to a static section
          // label so every card shows a consistent label + date eyebrow.
          const category =
            firstCategory && typeof firstCategory === 'object' ? firstCategory.title : 'Journal'

          return (
            <li key={post.slug}>
              <ArticleCard
                title={post.title}
                slug={post.slug}
                excerpt={post.meta?.description}
                date={post.publishedAt}
                category={category}
                imageUrl={imageUrl}
                imageAlt={imageAlt}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
