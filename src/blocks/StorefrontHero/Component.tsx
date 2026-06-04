import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
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
  secondaryCtaLabel,
  secondaryCtaUrl,
  showStatusCard,
  statusCardTitle,
  statusCardSubtitle,
  statusCardStatus,
  statusCardShips,
}) => {
  return (
    <section className="relative flex min-h-[720px] md:min-h-[800px] items-center justify-center overflow-hidden bg-candera-obsidian">
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

      {/* Content Container */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end w-full max-w-[1280px] mx-auto px-10 pb-20 pt-32 md:pt-40 gap-12">
        {/* Left Side Content */}
        <div className="flex flex-col items-start text-left max-w-[580px]">
          {heroTag && (
            <Eyebrow className="block mb-6 text-candera-ember">
              {heroTag}
            </Eyebrow>
          )}

          <h1 className="hero-heading text-white m-0 text-left font-display font-normal italic leading-none">
            {headline}
          </h1>

          {subheading && (
            <p className="editorial mt-6 text-left max-w-[32rem] text-white/70">
              {subheading}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-8 mt-10">
            {primaryCtaLabel && primaryCtaUrl && (
              <Button asChild variant="cta-ember" size="cta">
                <Link href={primaryCtaUrl}>
                  {primaryCtaLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaUrl && (
              <Button asChild variant="cta-ghost-dark" size="cta">
                <Link href={secondaryCtaUrl}>
                  {secondaryCtaLabel}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right Side Status Card */}
        {showStatusCard && (
          <div className="bg-candera-vellum/95 backdrop-blur-md border border-candera-stone/30 p-6 md:p-8 w-full md:w-[260px] self-stretch md:self-auto shadow-2xl text-left transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-[1px] bg-candera-ember" />
              <p className="font-sans text-[9px] font-bold uppercase tracking-[.25em] text-candera-ember-strong m-0">
                Current Release
              </p>
            </div>
            <p className="font-display text-[30px] md:text-[34px] font-normal italic leading-none text-candera-obsidian m-0 mb-1">
              {statusCardTitle}
            </p>
            <p className="font-mono text-[11px] text-candera-sage-text m-0 mb-4 tracking-wider uppercase font-semibold">
              {statusCardSubtitle}
            </p>
            <div className="border-t border-candera-stone/20 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-candera-sage-text">
                  Status
                </span>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-candera-ember">
                  {statusCardStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-candera-sage-text">
                  Ships
                </span>
                <span className="font-sans text-[10px] font-bold uppercase tracking-[.18em] text-candera-obsidian">
                  {statusCardShips}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

