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
    setHeaderTheme('dark')
    return () => setHeaderTheme(null)
  }, [setHeaderTheme])

  return (
    <div
      className="relative isolate -mt-[10.4rem] flex min-h-[90vh] items-center justify-center overflow-hidden bg-candera-obsidian"
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

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mb-8 z-10 relative flex items-center justify-center">
        <div className="max-w-[50rem] md:text-center flex flex-col items-center">
          {richText && (
            <RichText
              className="mb-10 
                [&_h1]:hero-heading [&_h1]:text-white [&_h1]:mb-6 [&_h1]:text-balance
                [&_h2]:h1 [&_h2]:text-white [&_h2]:mb-6 [&_h2]:text-balance
                [&_p]:editorial [&_p]:text-white/80 [&_p]:max-w-[32rem] [&_p]:mx-auto"
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
