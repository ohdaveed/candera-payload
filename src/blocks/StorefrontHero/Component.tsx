import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { StorefrontHeroBlock as StorefrontHeroBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

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
    <Section
      padding="none"
      className="relative flex min-h-[720px] md:min-h-[800px] items-center justify-center overflow-hidden bg-candera-obsidian"
    >
      {/* Background image */}
      {media && typeof media === 'object' && (
        <figure className="absolute inset-0 m-0">
          <Media
            fill
            imgClassName="object-cover brightness-[0.55] transition-transform duration-[5s] hover:scale-105"
            priority
            resource={media}
          />
        </figure>
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

      {/* Bottom transition gradient fade */}
      <span
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-candera-linen to-transparent pointer-events-none z-[5] opacity-100"
        aria-hidden="true"
      />

      {/* Film grain texture */}
      <span
        className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Content Container */}
      <Container className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end w-full pb-20 pt-32 md:pt-40 gap-12">
        {/* Left Side Content */}
        <header className="flex flex-col items-start text-left max-w-[580px]">
          {heroTag && <Eyebrow className="block mb-6 text-candera-ember">{heroTag}</Eyebrow>}

          <h1 className="text-white m-0 text-left font-display font-normal italic leading-[0.95] tracking-tight text-[clamp(2.5rem,8vw,5rem)] md:text-[clamp(4rem,10vw,8rem)]">
            {headline}
          </h1>

          {subheading && (
            <p className="editorial mt-6 text-left max-w-[32rem] text-white/90 font-medium leading-relaxed">
              {subheading}
            </p>
          )}

          <nav className="flex flex-wrap items-center gap-10 mt-10">
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

        {/* Right Side Status Card */}
        {showStatusCard && (
          <article className="bg-candera-vellum/95 backdrop-blur-md border border-candera-stone/30 p-8 md:p-10 w-full md:w-[280px] self-stretch md:self-auto shadow-2xl text-left transition-all duration-300 rounded-[2px]">
            <header className="flex items-center gap-3 mb-5">
              <span className="w-5 h-[1px] bg-candera-ember" aria-hidden="true" />
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-candera-ember-strong m-0">
                Current Release
              </p>
            </header>
            <p className="font-display text-[30px] md:text-[34px] font-normal italic leading-none text-candera-obsidian m-0 mb-1">
              {statusCardTitle}
            </p>
            <p className="font-mono text-[12px] text-candera-sage-text m-0 mb-6 tracking-wider uppercase font-semibold">
              {statusCardSubtitle}
            </p>
            <section className="border-t border-candera-stone/20 pt-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-sage-text">
                  Status
                </span>
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-ember">
                  {statusCardStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-sage-text">
                  Ships
                </span>
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-candera-obsidian">
                  {statusCardShips}
                </span>
              </div>
            </section>
          </article>
        )}
      </Container>
    </Section>
  )
}
