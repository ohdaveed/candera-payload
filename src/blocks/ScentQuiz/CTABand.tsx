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
  <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-10 px-6 py-12 md:px-[52px] md:py-12 bg-candera-obsidian border-b border-[rgba(196,168,130,0.12)]">
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <p className="font-sans text-[9px] font-bold uppercase tracking-[4px] text-[#6b5e50] m-0">
          {eyebrow}
        </p>
      )}
      {headline && (
        <h2 className="font-display italic text-[26px] text-candera-vellum leading-[1.2] m-0">
          {headline}
        </h2>
      )}
      {body && (
        <p className="font-sans text-[13px] text-candera-sage-text leading-[1.6] max-w-[440px] m-0 mt-1">
          {body}
        </p>
      )}
    </div>
    <Link
      href="#scent-quiz"
      className="font-sans text-[10px] font-bold uppercase tracking-[3px] px-8 py-4 no-underline whitespace-nowrap"
      style={{ background: 'var(--candera-ember)', color: '#0a0806' }}
    >
      Take the Scent Quiz →
    </Link>
  </section>
)
