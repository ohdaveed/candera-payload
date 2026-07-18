import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'
import { SmoothScrollLink } from './SmoothScrollLink'

type Props = StorefrontHeroBlockType

// CTA labels occasionally carry a trailing arrow glyph from the CMS; the button
// renders its own <ArrowRight/>, so strip any glyph to avoid a doubled arrow.
const stripTrailingArrow = (label: string) => label.replace(/\s*[→›»>]+\s*$/u, '')

export const StorefrontHeroBlock: React.FC<Props> = ({
  heroTag,
  headline,
  subheading,
  media,
  primaryCtaLabel,
  showStatusCard,
  ethosCardEyebrow,
  ethosCardBody,
  ethosCardFooterLabel,
  ethosCardLinkLabel,
}) => {
  return (
    <Section
      padding="none"
      className="relative flex min-h-[85svh] sm:min-h-[90svh] md:min-h-[100svh] items-end overflow-hidden bg-candera-obsidian"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <div className="absolute inset-0" aria-hidden="true">
          <Media fill imgClassName="object-cover brightness-[0.38]" priority resource={media} />
          <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
        </div>
      )}

      {/* Gradient overlay — heavier left-side scrim keeps subheading legible
          against textured background imagery */}
      <span
        className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,6,4,0.97)_0%,rgba(8,6,4,0.88)_30%,rgba(8,6,4,0.62)_55%,rgba(8,6,4,0.10)_80%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Soft warm bottom fade — primes the eye for the cream palette of the
          section that follows without muddying the obsidian hero. */}
      <span
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-candera-linen/10"
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Content */}
      <Container className="relative z-10 pb-20 md:pb-28 pt-32 md:pt-44 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 items-end justify-between gap-12 md:gap-16">
          <header className="md:col-span-8 flex flex-col items-start text-left max-w-[640px]">
            {heroTag && (
              <div className="flex items-center gap-3 mb-6">
                <span className="block w-7 h-[1px] bg-candera-ember" aria-hidden="true" />
                <Eyebrow className="text-candera-linen/70">{heroTag}</Eyebrow>
              </div>
            )}

            <h1 className="hero-heading text-candera-vellum m-0 drop-shadow-[0_2px_16px_rgba(8,6,4,0.45)]">
              {headline}
            </h1>

            <span className="block w-10 h-[1px] bg-candera-ember mt-5 mb-4" aria-hidden="true" />

            {subheading && (
              <p className="editorial text-candera-vellum/90 max-w-[420px] m-0 drop-shadow-[0_1px_10px_rgba(8,6,4,0.4)]">
                {subheading}
              </p>
            )}

            {/* Primary action + secondary text link */}
            {primaryCtaLabel && (
              <div className="mt-10 flex flex-col gap-3 w-full sm:w-auto">
                <Button
                  asChild
                  variant="cta-ember"
                  size="cta"
                  className="w-full justify-center px-4 tracking-[0.1em] sm:w-auto sm:px-10 sm:tracking-[.3em]"
                >
                  <Link href="/products">{stripTrailingArrow(primaryCtaLabel)}</Link>
                </Button>
                <Link
                  href="/posts"
                  className="text-xs font-bold uppercase tracking-[.2em] text-candera-vellum/80 hover:text-candera-vellum transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-sm"
                >
                  Explore the Journal →
                </Link>
              </div>
            )}
          </header>

          {/* Right — Maker Ethos card: brand authority anchor that foreshadows
              the Journal. Opaque flat card over the dark hero imagery. */}
          {showStatusCard && (
            <div className="md:col-span-4 w-full flex justify-end">
              <aside className="bg-card p-6 rounded-card w-full sm:max-w-sm text-card-foreground shadow-card">
                <p className="font-mono text-[0.64rem] tracking-[0.2em] text-card-foreground/55 uppercase m-0">
                  {ethosCardEyebrow || 'The Slow Pour'}
                </p>

                <p className="font-editorial italic text-sm text-card-foreground/90 mt-2 leading-relaxed m-0">
                  {ethosCardBody ||
                    'No factories. No white labeling. Just real pressed botanicals and slow light.'}
                </p>

                <div className="pt-4 mt-4 border-t border-card-foreground/10 flex items-center justify-between gap-4">
                  <span className="font-mono text-[0.64rem] tracking-[0.12em] text-card-foreground/45 uppercase">
                    {ethosCardFooterLabel || 'Exclusively on Etsy'}
                  </span>
                  <SmoothScrollLink
                    targetId="journal"
                    className="inline-flex items-center gap-1 text-xs tracking-[0.18em] uppercase text-card-foreground hover:text-card-foreground/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-sm"
                  >
                    {ethosCardLinkLabel || 'Read Journal'}
                    <span aria-hidden="true">↓</span>
                  </SmoothScrollLink>
                </div>
              </aside>
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
