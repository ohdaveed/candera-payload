'use client'

import React from 'react'
import Link from 'next/link'

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
  <section className="bg-candera-obsidian border-b border-candera-stone/10">
    <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-10 py-20 md:py-28">
      <div className="flex flex-col gap-2">
        {eyebrow && <p className="eyebrow text-candera-stone">{eyebrow}</p>}
        {headline && <h2 className="h3 text-candera-vellum m-0">{headline}</h2>}
        {body && <p className="body text-candera-sage-text max-w-[440px] m-0 mt-1">{body}</p>}
      </div>
      <Link
        href="#scent-quiz"
        className="btn-text bg-candera-ember text-candera-obsidian px-8 py-4 no-underline whitespace-nowrap hover:bg-candera-vellum transition-colors"
      >
        Take the Scent Quiz →
      </Link>
    </div>
  </section>
)
