import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { Eyebrow } from '@/components/ui/eyebrow'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative -mt-[10.4rem] flex min-h-[70vh] items-center justify-center overflow-hidden bg-candera-obsidian">
      {/* Background image */}
      {heroImage && typeof heroImage !== 'string' && (
        <div className="absolute inset-0 -z-10">
          <Media
            fallbackLabel={false}
            fill
            priority
            imgClassName="object-cover brightness-[0.45]"
            resource={heroImage}
          />
        </div>
      )}

      {/* Radial scrim */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(20,20,18,0.2) 0%, rgba(20,20,18,0.7) 100%)',
        }}
      />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container z-10 relative text-center max-w-[800px] px-6 pt-32 pb-16">
        <div className="flex flex-col items-center">
          <div className="mb-8">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category
                const titleToUse = categoryTitle || 'Untitled category'
                const isLast = index === categories.length - 1
                return (
                  <Eyebrow key={index} className="text-white/90">
                    {titleToUse}
                    {!isLast && <span className="mx-3 opacity-40">·</span>}
                  </Eyebrow>
                )
              }
              return null
            })}
          </div>

          <h1 className="hero-heading text-white mb-10">{title}</h1>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/70">
            {hasAuthors && (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[.25em]">Written By</span>
                <span className="editorial text-[15px] italic">
                  {formatAuthors(populatedAuthors)}
                </span>
              </div>
            )}
            {publishedAt && (
              <div className="flex items-center gap-3 border-l border-white/20 pl-8">
                <span className="text-[10px] font-bold uppercase tracking-[.25em]">Published</span>
                <time className="editorial text-[15px] italic" dateTime={publishedAt}>
                  {formatDateTime(publishedAt)}
                </time>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
