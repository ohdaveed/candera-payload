import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'

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
        </div>
      )}

      {/* 110deg directional gradient — left heavy, fades to transparent */}
      <span
        className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,6,4,0.95)_0%,rgba(8,6,4,0.55)_50%,transparent_100%)]"
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Content */}
      <Container className="relative z-10 pb-14 pt-32 md:pt-44 max-w-[600px]">
        <header className="flex flex-col items-start text-left">
          {heroTag && (
            <div className="flex items-center gap-3 mb-6">
              <span className="w-7 h-[1px] bg-candera-ember" aria-hidden="true" />
              <Eyebrow className="text-candera-ember">{heroTag}</Eyebrow>
            </div>
          )}

          <h1 className="hero-heading text-candera-vellum m-0">{headline}</h1>

          {/* Ember rule between headline and subheading */}
          <span className="block w-10 h-[1px] bg-candera-ember mt-5 mb-4" aria-hidden="true" />

          {subheading && <p className="editorial text-white/65 max-w-[360px] m-0">{subheading}</p>}

          <nav className="flex flex-wrap items-center gap-4 mt-8">
            {primaryCtaLabel && primaryCtaUrl && (
              <Button asChild variant="cta-ember" size="cta">
                <Link href={primaryCtaUrl}>
                  {primaryCtaLabel}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </Button>
            )}
            {secondaryCtaLabel && secondaryCtaUrl && (
              <Link
                href={secondaryCtaUrl}
                className="btn-text text-candera-vellum border border-white/40 px-6 py-3.5 hover:border-white/70 transition-colors focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 outline-none rounded-none"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </nav>
        </header>
      </Container>
    </Section>
  )
}
