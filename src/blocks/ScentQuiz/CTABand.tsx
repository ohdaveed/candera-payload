'use client'

import React from 'react'
import { FilmGrain } from '@/components/FilmGrain'

type Props = {
  eyebrow?: string | null
  headline?: string | null
  body?: string | null
}

export const ScentQuizCTABand: React.FC<Props> = ({
  eyebrow = 'Find Your Scent',
  headline = 'Not sure where to start?',
  body = "Answer a few questions and we'll match you to the candle that fits your space, your mood, and your ritual — before you have to browse.",
}) => (
  <section className="bg-candera-obsidian relative">
    {/* Soft, grainy transition so the warm linen section above melts into
        the dark instead of hitting a razor-sharp "equator" line. */}
    <div
      aria-hidden="true"
      className="relative h-[150px] bg-gradient-to-b from-candera-vellum to-candera-obsidian"
    >
      <FilmGrain />
    </div>
    <div className="w-full max-w-[1200px] mx-auto px-[5vw] pt-8 md:pt-12 pb-20 md:pb-28 flex flex-col items-center text-center gap-6">
      {eyebrow && (
        <div className="flex items-center gap-2">
          <span className="block w-4 h-px bg-candera-ember" aria-hidden="true" />
          <p className="eyebrow text-candera-stone">{eyebrow}</p>
          <span className="block w-4 h-px bg-candera-ember" aria-hidden="true" />
        </div>
      )}
      {headline && (
        <h2 className="font-display font-normal italic text-candera-vellum text-3xl md:text-4xl m-0 leading-tight">
          {headline}
        </h2>
      )}
      {body && (
        <p className="font-sans font-light text-candera-vellum/80 max-w-[560px] m-0 text-sm md:text-base leading-relaxed">
          {body}
        </p>
      )}
      <a
        href="#scent-quiz"
        className="btn-text bg-candera-ember text-candera-obsidian px-12 py-5 tracking-[0.2em] no-underline whitespace-nowrap hover:bg-candera-vellum hover:text-candera-obsidian transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-none"
      >
        Take the Scent Quiz →
      </a>
    </div>
  </section>
)
