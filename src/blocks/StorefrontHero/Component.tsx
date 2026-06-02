import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'

type Props = StorefrontHeroBlockType & {
  disableInnerContainer?: boolean
}

export const StorefrontHeroBlock: React.FC<Props> = ({
  heroTag,
  headline,
  subheading,
  media,
  primaryCtaLabel,
  primaryCtaUrl,
}) => {
  return (
    <section className="relative flex min-h-[800px] items-center justify-center overflow-hidden bg-candera-obsidian">
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0">
          <Media
            fill
            imgClassName="object-cover brightness-[0.55] transition-transform duration-[5s] hover:scale-105"
            priority
            resource={media}
          />
        </div>
      )}

      {/* Radial scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(20,20,18,0.2) 0%, rgba(20,20,18,0.7) 100%)',
        }}
      />

      {/* Film grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-[800px] px-6 pt-32 pb-16">
        {heroTag && (
          <span
            className="eyebrow block mb-8 text-white/90"
          >
            {heroTag}
          </span>
        )}

        <h1
          className="hero-heading text-white m-0"
        >
          {headline}
        </h1>

        {subheading && (
          <p
            className="editorial mt-8 max-w-[32rem] text-white/80"
          >
            {subheading}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
          {primaryCtaLabel && primaryCtaUrl && (
            <Link
              href={primaryCtaUrl}
              className="inline-flex items-center justify-center gap-3 h-[52px] px-10 text-[11px] font-bold uppercase tracking-[.3em] bg-white text-candera-obsidian transition-all duration-300 hover:bg-candera-vellum shadow-2xl"
              style={{ borderRadius: 0 }}
            >
              {primaryCtaLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
