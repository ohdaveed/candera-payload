'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { FilmGrain } from '@/components/FilmGrain'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  // Pages render <SetHeaderTheme theme="light" /> before the hero (e.g. [slug]/page.tsx),
  // so two effects set the header theme. React runs sibling effects in tree order: the
  // page's effect fires first, then this one — so 'dark' deliberately wins whenever this
  // hero is present (the header sits over the dark hero image). Do not remove this call:
  // pages using HighImpact rely on it to override their default 'light' theme.
  useEffect(() => {
    setHeaderTheme('dark')
    return () => setHeaderTheme(null)
  }, [setHeaderTheme])

  return (
    <div
      className="relative isolate flex min-h-[90vh] items-center justify-center overflow-hidden bg-candera-obsidian -mt-[var(--nav-height)]"
      data-theme="dark"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0 -z-10">
          <Media
            fallbackLabel={false}
            fill
            imgClassName="object-cover brightness-[0.55]"
            priority
            resource={media}
          />
          {/* Fail-safe overlay for dynamic image contrast */}
          <div className="absolute inset-0 bg-candera-obsidian/30" aria-hidden="true" />
        </div>
      )}

      {/* Radial scrim */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(20,20,18,0.2)_0%,rgba(20,20,18,0.7)_100%)]" />

      <FilmGrain />

      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[50rem] md:text-center flex flex-col items-center">
          {richText && (
            <RichText
              className="mb-10 
                [&_h1]:hero-heading [&_h1]:text-candera-vellum [&_h1]:mb-6 [&_h1]:text-balance
                [&_h2]:h1 [&_h2]:text-candera-vellum [&_h2]:mb-6 [&_h2]:text-balance
                [&_p]:editorial [&_p]:text-candera-vellum/80 [&_p]:max-w-[32rem] [&_p]:mx-auto"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap md:justify-center gap-6">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} appearance={i === 0 ? 'cta-inverse' : 'cta-ghost-dark'} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
