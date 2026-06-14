import { formatDateTime } from '@/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'
import Link from 'next/link'

export const PostHero: React.FC<{
  post: Post
  readTime?: number
}> = ({ post, readTime }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const categoryLabels = categories
    ?.filter((c): c is Extract<typeof c, { title?: string }> => typeof c === 'object' && c !== null)
    .map((c) => c.title || 'Untitled')

  return (
    <header className="relative flex min-h-[80vh] flex-col items-center justify-end overflow-hidden bg-candera-obsidian -mt-[var(--nav-height)]">
      {/* Background image */}
      {heroImage && typeof heroImage !== 'string' && (
        <figure className="absolute inset-0 m-0">
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
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,18,0.15)_0%,rgba(20,20,18,0.65)_100%)]"
        aria-hidden="true"
      />

      {/* Bottom gradient — fades to page background */}
      <span
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none bg-[linear-gradient(to_top,color-mix(in_oklch,var(--color-candera-vellum)_18%,transparent)_0%,transparent_100%)]"
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Back link — top left */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-8">
        <Container>
          <Link
            href="/posts"
            className="eyebrow inline-flex items-center gap-2 text-candera-vellum/70 hover:text-candera-ember transition-colors"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            The Journal
          </Link>
        </Container>
      </div>

      {/* Content — pinned to bottom of hero */}
      <Container className="relative z-10 max-w-[860px] w-full pb-16 pt-40">
        {/* Category pills */}
        {categoryLabels && categoryLabels.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8">
            {categoryLabels.map((label, i) => (
              <span
                key={i}
                className="text-xs font-bold uppercase tracking-[.3em] text-candera-ember border border-candera-ember/30 px-3 py-1.5"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="hero-heading text-candera-vellum m-0">{title}</h1>

        {/* Byline */}
        {(hasAuthors || publishedAt || readTime) && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8">
            {hasAuthors && (
              <span className="flex items-center gap-2.5">
                <span className="label text-candera-vellum/75">By</span>
                <span className="editorial text-candera-vellum/80">
                  {formatAuthors(populatedAuthors)}
                </span>
              </span>
            )}

            {publishedAt && (
              <>
                {hasAuthors && (
                  <span
                    className="w-[1px] h-3 bg-candera-vellum/20 hidden md:block"
                    aria-hidden="true"
                  />
                )}
                <span className="flex items-center gap-2.5">
                  <span className="label text-candera-vellum/75">Published</span>
                  <time className="editorial text-candera-vellum/80" dateTime={publishedAt}>
                    {formatDateTime(publishedAt)}
                  </time>
                </span>
              </>
            )}

            {readTime && (
              <>
                <span
                  className="w-[1px] h-3 bg-candera-vellum/20 hidden md:block"
                  aria-hidden="true"
                />
                <span className="label text-candera-vellum/75">{readTime} min read</span>
              </>
            )}
          </div>
        )}
      </Container>
    </header>
  )
}
