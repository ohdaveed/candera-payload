import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'

type Props = StorefrontHeroBlockType

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
  statusCardPrice = '$38',
  statusCardSubtitle,
  statusCardStatus,
  statusCardShips,
  statusCardLinkUrl = '/products/wild-lilac',
}) => {
  return (
    <Section
      padding="none"
      className="relative flex min-h-[560px] md:min-h-[700px] items-end overflow-hidden bg-candera-obsidian"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0" aria-hidden="true">
          <Media fill imgClassName="object-cover brightness-[0.38]" priority resource={media} />
          <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        </div>
      )}

      {/* Gradient overlay */}
      <span
        className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,6,4,0.95)_0%,rgba(8,6,4,0.55)_50%,transparent_100%)]"
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Content */}
      <Container className="relative z-10 pb-14 pt-32 md:pt-44 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 items-end justify-between gap-12 md:gap-16">
          <header className="md:col-span-8 flex flex-col items-start text-left max-w-[640px]">
            {heroTag && (
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-7 h-[1px] bg-candera-ember" aria-hidden="true" />
                <Eyebrow className="text-candera-linen/70">{heroTag}</Eyebrow>
              </div>
            )}

            <h1 className="hero-heading text-candera-vellum m-0">{headline}</h1>

            <span className="block w-10 h-[1px] bg-candera-ember mt-5 mb-4" aria-hidden="true" />

            {subheading && (
              <p className="editorial text-candera-vellum/80 max-w-[420px] m-0">{subheading}</p>
            )}

            <nav className="flex flex-wrap items-center gap-4 mt-8">
              {primaryCtaLabel && primaryCtaUrl && (
                <Button
                  asChild
                  variant="cta-ember"
                  size="cta"
                  className="bg-candera-ember text-candera-obsidian hover:bg-candera-vellum hover:text-candera-obsidian transition-colors"
                >
                  <Link href={primaryCtaUrl}>
                    {primaryCtaLabel}
                    <ArrowRight width={14} height={14} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </Button>
              )}
              {secondaryCtaLabel && secondaryCtaUrl && (
                <a
                  href={secondaryCtaUrl}
                  className="btn-text text-candera-vellum/85 hover:text-candera-vellum underline-offset-4 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-sm"
                >
                  {secondaryCtaLabel}
                </a>
              )}
            </nav>
          </header>

          {/* Right — Status Card */}
          {showStatusCard && (
            <div className="md:col-span-4 w-full flex justify-end">
              <div className="bg-white/[0.02] border border-candera-vellum/15 p-[1.5rem] flex flex-col gap-4 hover:border-candera-vellum/25 transition-all duration-300 rounded-none shadow-xl w-full max-w-[340px]">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-display italic text-lg text-candera-vellum">
                    {statusCardTitle || 'Featured Candle'}
                  </span>
                  {statusCardPrice && (
                    <span className="font-sans font-semibold text-lg text-candera-vellum">
                      {statusCardPrice}
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                {statusCardSubtitle && (
                  <p className="font-editorial italic text-candera-stone/85 text-sm m-0 -mt-1">
                    {statusCardSubtitle}
                  </p>
                )}

                <div className="h-px bg-candera-vellum/10" />

                {/* Status summary — single line */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-candera-vellum/70">
                    {statusCardStatus || statusCardShips
                      ? [statusCardStatus, statusCardShips].filter(Boolean).join(' · ')
                      : 'Limited Batch · 47 units total'}
                  </span>
                  <Link
                    href={statusCardLinkUrl || '/products/wild-lilac'}
                    className="text-xs font-bold uppercase tracking-[.18em] text-candera-linen/70 hover:text-white transition-colors underline decoration-1 underline-offset-4"
                  >
                    View Scent →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
