import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Section } from '@/components/ui/section'

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <header className="relative -mt-[10.4rem] flex min-h-[70vh] items-center justify-center overflow-hidden bg-candera-obsidian">
      {/* Background image */}
      {heroImage && typeof heroImage !== 'string' && (
        <figure className="absolute inset-0 -z-10 m-0">
          <Media
            fallbackLabel={false}
            fill
            priority
            imgClassName="object-cover brightness-[0.45]"
            resource={heroImage}
          />
        </figure>
      )}

      {/* Radial scrim */}
      <span
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at center, rgba(20,20,18,0.2) 0%, rgba(20,20,18,0.7) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Film grain texture */}
      <span
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <Container className="z-10 relative text-center max-w-[800px] px-6 pt-32 pb-16">
        <article className="flex flex-col items-center">
          <nav className="flex flex-wrap justify-center gap-3 mb-8">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category
                const titleToUse = categoryTitle || 'Untitled category'
                return (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-white border-white/30 uppercase tracking-[.2em] px-3 py-1 bg-white/5 backdrop-blur-sm"
                  >
                    {titleToUse}
                  </Badge>
                )
              }
              return null
            })}
          </nav>

          <h1 className="hero-heading text-white mb-10">{title}</h1>

          <Section
            padding="none"
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-white/70"
          >
            {hasAuthors && (
              <span className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[.25em]">Written By</span>
                <span className="editorial text-[15px] italic">
                  {formatAuthors(populatedAuthors)}
                </span>
              </span>
            )}
            {publishedAt && (
              <span className="flex items-center gap-8">
                <Separator
                  orientation="vertical"
                  className="h-4 bg-white/20 hidden md:block"
                  aria-hidden="true"
                />
                <span className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[.25em]">
                    Published
                  </span>
                  <time className="editorial text-[15px] italic" dateTime={publishedAt}>
                    {formatDateTime(publishedAt)}
                  </time>
                </span>
              </span>
            )}
          </Section>
        </article>
      </Container>
    </header>
  )
}
