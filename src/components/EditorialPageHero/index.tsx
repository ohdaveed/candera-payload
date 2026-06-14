import React from 'react'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Container } from '@/components/ui/container'
import { FilmGrain } from '@/components/FilmGrain'

interface EditorialPageHeroProps {
  /** Short uppercase label shown above the title */
  eyebrow: string
  /** Main display headline */
  title: string
  /** Optional italic subheading below the title */
  description?: string
  /** Large ghost word rendered as atmospheric background decoration */
  decorativeWord?: string
  /** Tailwind min-height class for the hero. Defaults to 'min-h-[48vh]'. */
  minHeightClass?: string
  /** Slot for additional content rendered below the description */
  children?: React.ReactNode
}

/**
 * Full-bleed obsidian editorial hero used on interior pages (products, contact, etc.).
 * Slides under the fixed nav via negative margin. All foreground text passes WCAG AA.
 *
 * For post/article heroes with a background photo, use PostHero instead.
 */
export const EditorialPageHero: React.FC<EditorialPageHeroProps> = ({
  eyebrow,
  title,
  description,
  decorativeWord,
  minHeightClass = 'min-h-[48vh]',
  children,
}) => {
  return (
    <header
      className={`relative flex flex-col items-center justify-end overflow-hidden bg-candera-obsidian -mt-[var(--nav-height)] ${minHeightClass}`}
    >
      {/* Radial depth scrim */}
      <span
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_75%,rgba(20,20,18,0)_0%,rgba(20,20,18,0.65)_100%)]"
        aria-hidden="true"
      />

      {/* Atmospheric decorative word — white/4 = ~0.7:1, purely decorative */}
      {decorativeWord && (
        <div
          className="absolute right-[-0.05em] bottom-[-0.1em] leading-none select-none pointer-events-none font-display italic text-white/[0.04] text-[clamp(8rem,18vw,16rem)]"
          aria-hidden="true"
        >
          {decorativeWord}
        </div>
      )}

      {/* Bottom fade to page background (vellum) */}
      <span
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none bg-[linear-gradient(to_top,rgba(245,242,237,0.12)_0%,rgba(20,20,18,0)_100%)]"
        aria-hidden="true"
      />

      <FilmGrain />

      {/* Slot for absolute-positioned decorative content anchored to the header */}
      {children}

      <Container className="relative z-10 pb-16 pt-40 max-w-[860px] w-full">
        {/* Eyebrow with leading ember rule */}
        <div className="flex items-center gap-4 mb-8">
          <span className="w-8 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          {/* candera-ember (#dd7d52) on obsidian (#141412) = ~6.4:1 — passes AA */}
          <Eyebrow className="text-candera-ember">{eyebrow}</Eyebrow>
        </div>

        {/* Title — white on obsidian = 18.75:1 */}
        <h1 className="hero-heading text-white m-0 relative z-10">{title}</h1>

        {/* Description — eb garamond italic */}
        {description && <p className="editorial text-white/75 mt-6 max-w-[48ch]">{description}</p>}
      </Container>
    </header>
  )
}
