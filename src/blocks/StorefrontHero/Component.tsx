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
    <section className="relative flex min-h-[760px] items-center justify-center overflow-hidden">
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0">
          <Media
            fill
            imgClassName="object-cover brightness-[0.58]"
            priority
            resource={media}
          />
        </div>
      )}

      {/* Radial scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(20,20,18,.15), rgba(20,20,18,.55))',
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white max-w-[760px] px-6 pt-32 pb-16">
        {heroTag && (
          <span
            className="block mb-7 text-[11px] font-bold uppercase tracking-[.42em]"
            style={{ color: 'rgba(245,242,237,.85)' }}
          >
            {heroTag}
          </span>
        )}

        <h1
          className="font-display font-thin italic m-0 leading-[1.05] tracking-tight text-white"
          style={{ fontSize: 'clamp(3rem, 8vw, 6.5rem)' }}
        >
          {headline}
        </h1>

        {subheading && (
          <p
            className="font-editorial italic mt-5 max-w-[30rem] leading-[1.7] text-[18px]"
            style={{ color: 'rgba(245,242,237,.8)' }}
          >
            {subheading}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {primaryCtaLabel && primaryCtaUrl && (
            <Link
              href={primaryCtaUrl}
              className="inline-flex items-center justify-center gap-2 h-[46px] px-7 text-[11px] font-bold uppercase tracking-[.2em] bg-white text-candera-obsidian transition-colors hover:bg-candera-vellum"
              style={{ borderRadius: 0, boxShadow: '0 18px 40px -12px rgba(0,0,0,.4)' }}
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
