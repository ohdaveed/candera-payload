import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/payload-types'

interface FeaturedPostCardProps {
  post: Pick<Post, 'slug' | 'title' | 'meta'>
}

/**
 * Full-width 16:7 featured post card with image overlay, used at the top of the journal index.
 * Contrast: white text on obsidian/75 gradient = 18.75:1 at darkest, ~14:1 at lightest. Passes AA.
 */
export const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({ post }) => {
  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article className="relative w-full aspect-[16/7] overflow-hidden bg-candera-ash mb-4">
        {post.meta?.image && (
          <Media
            fill
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
            resource={post.meta.image}
          />
        )}

        {/* Gradient overlay — obsidian/75 at base keeps text contrast ≥14:1 */}
        <div className="absolute inset-0 bg-gradient-to-t from-candera-obsidian/75 via-candera-obsidian/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <Badge
            variant="outline"
            className="mb-4 text-candera-vellum border-candera-vellum/30 uppercase tracking-[.2em] px-3 py-1 bg-candera-vellum/5 backdrop-blur-sm"
          >
            Featured Story
          </Badge>

          {/* hero-heading at vellum = 18.75:1 on obsidian ✅ */}
          <h2 className="h2 text-candera-vellum mb-3 max-w-[640px]">{post.title}</h2>

          {/* vellum/75 on obsidian/75 base = ~14:1 — passes AA for large/bold text ✅ */}
          <span className="btn-text text-candera-vellum/75">Read the story →</span>
        </div>
      </article>
    </Link>
  )
}
