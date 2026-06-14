import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'

type StatusCardProps = Pick<
  StorefrontHeroBlockType,
  'statusCardTitle' | 'statusCardSubtitle' | 'statusCardStatus' | 'statusCardShips'
>

type Props = StorefrontHeroBlockType & {
  disableInnerContainer?: boolean
}

const StudioStatusStrip: React.FC<StatusCardProps> = ({
  statusCardTitle,
  statusCardSubtitle,
  statusCardStatus,
  statusCardShips,
}) => (
  <div className="bg-candera-vellum border-b border-candera-stone/20">
    <Container className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
      <div className="flex items-center gap-3">
        <span className="w-5 h-[1px] bg-candera-ember" aria-hidden="true" />
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-ember-strong m-0">
          Current Release
        </p>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 min-w-0">
        <p className="font-display text-[22px] font-normal italic leading-none text-candera-obsidian m-0">
          {statusCardTitle}
        </p>
        {statusCardSubtitle && (
          <p className="font-mono text-[11px] text-candera-sage-text m-0 tracking-[0.12em] uppercase font-semibold">
            {statusCardSubtitle}
          </p>
        )}
      </div>
      <div className="sm:ml-auto flex items-center gap-8">
        {statusCardStatus && (
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-sage-text">
              Status
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-ember">
              {statusCardStatus}
            </span>
          </div>
        )}
        {statusCardShips && (
          <div className="flex items-center gap-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-sage-text">
              Ships
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-obsidian">
              {statusCardShips}
            </span>
          </div>
        )}
      </div>
    </Container>
  </div>
)

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
    <>
      <Section
        padding="none"
        className="relative flex min-h-[720px] md:min-h-[800px] items-center justify-center overflow-hidden bg-candera-obsidian"
      >
        {/* Background image */}
        {media && typeof media === 'object' && (
          <div className="absolute inset-0" aria-hidden="true">
            <Media
              fill
              imgClassName="object-cover brightness-[0.55] transition-transform duration-[5s] hover:scale-105"
              priority
              resource={media}
            />
          </div>
        )}

        {/* Radial scrim */}
        <span
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(20,20,18,0.2) 0%, rgba(20,20,18,0.7) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Left-side contrast gradient for typography legibility */}
        <span
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(20,20,18,0.88) 0%, rgba(20,20,18,0.55) 45%, rgba(20,20,18,0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Bottom transition gradient fade to page background */}
        <span
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-candera-vellum to-transparent pointer-events-none z-[5]"
          aria-hidden="true"
        />

        <FilmGrain />

        {/* Content Container */}
        <Container className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end w-full pb-20 pt-32 md:pt-40 gap-10 md:gap-12">
          {/* Left Side Content */}
          <header className="flex flex-col items-start text-left max-w-[580px]">
            {heroTag && <Eyebrow className="block mb-6 text-candera-ember">{heroTag}</Eyebrow>}

            <h1
              className="text-white m-0 text-left font-display font-normal italic tracking-tight"
              style={{ fontSize: 'clamp(2.75rem, 7vw + 0.5rem, 6rem)', lineHeight: 1.0 }}
            >
              {headline}
            </h1>

            {subheading && (
              <p className="editorial mt-6 text-left max-w-[32rem] text-white/90 font-medium leading-relaxed">
                {subheading}
              </p>
            )}

            <nav className="flex flex-wrap items-center gap-6 md:gap-10 mt-10">
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
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </Button>
              )}
              {secondaryCtaLabel && secondaryCtaUrl && (
                <Link
                  className="font-sans text-[11px] font-bold uppercase tracking-[.25em] text-white hover:text-candera-ember transition-colors flex items-center gap-2 group"
                  href={secondaryCtaUrl}
                >
                  {secondaryCtaLabel}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
            </nav>
          </header>

          {/* Right: editorial studio facts — visible on desktop only */}
          <aside
            className="hidden md:flex flex-col gap-3 items-end text-right shrink-0 pb-2"
            aria-label="Studio facts"
          >
            <dl className="flex flex-col gap-2 text-sm text-right">
              <div className="flex gap-1.5 justify-end">
                <dt className="text-white/60">Format</dt>
                <dd className="text-white font-medium">Small batch</dd>
              </div>
              <div className="flex gap-1.5 justify-end">
                <dt className="text-white/60">Made</dt>
                <dd className="text-white font-medium">Hand poured &amp; labeled</dd>
              </div>
              <div className="flex gap-1.5 justify-end">
                <dt className="text-white/60">Ships from</dt>
                <dd className="text-white font-medium">CA</dd>
              </div>
            </dl>
            <div className="w-[1px] h-16 bg-candera-ember/40 self-end mt-2" aria-hidden="true" />
          </aside>
        </Container>
      </Section>

      {showStatusCard && (
        <StudioStatusStrip
          statusCardTitle={statusCardTitle}
          statusCardSubtitle={statusCardSubtitle}
          statusCardStatus={statusCardStatus}
          statusCardShips={statusCardShips}
        />
      )}
    </>
  )
}
