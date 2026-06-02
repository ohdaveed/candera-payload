'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])

  return (
    <div
      className="relative isolate -mt-[10.4rem] flex min-h-[80vh] items-center justify-center overflow-hidden bg-linen"
      data-theme="light"
    >
      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[36.5rem] md:text-center">
          {richText && (
            <RichText
              className="mb-6 [&_h1]:font-serif [&_h1]:tracking-tight [&_h1]:text-obsidian [&_h2]:font-serif [&_h2]:tracking-tight [&_h2]:text-obsidian [&_p]:text-candera-sage-text"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex md:justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      className="inline-flex items-center justify-center h-[46px] px-7 text-[11px] font-bold uppercase tracking-[.2em] border border-obsidian text-obsidian bg-transparent hover:bg-obsidian hover:text-linen transition-colors !rounded-none"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
      {media && typeof media === 'object' && (
        <div className="absolute inset-0 -z-10">
          <Media
            fallbackLabel={false}
            fill
            imgClassName="object-cover opacity-20"
            priority
            resource={media}
          />
        </div>
      )}
    </div>
  )
}
