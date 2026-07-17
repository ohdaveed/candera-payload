import React from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Eyebrow } from '@/components/ui/eyebrow'
import { NEWSLETTER_MICROCOPY } from '@/constants/innerCircle'

/**
 * Full-bleed editorial dark strip inviting readers into the Inner Circle.
 * The single source for the centered CTA that closes posts and how-to guides
 * (the products purchase page and the InnerCircleCTA block are deliberate,
 * differently-designed variants).
 */
export function InnerCircleStrip({
  headline = 'Be the first to know about new batches, scent notes, and studio moments.',
}: {
  headline?: string
}) {
  return (
    <aside className="bg-candera-obsidian grain" data-section="inner-circle-cta">
      <Container className="py-20 md:py-28 flex flex-col items-center text-center gap-8">
        {/* Eyebrow with flanking rules */}
        <div className="flex items-center gap-4">
          <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          <Eyebrow className="text-candera-ember">The Inner Circle</Eyebrow>
          <span className="w-10 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
        </div>

        <h2 className="h2 text-candera-vellum leading-[1.15] max-w-[36rem] m-0">{headline}</h2>

        <Button asChild variant="cta-ember" size="cta" className="mt-2">
          <Link href="/contact">Join the Circle</Link>
        </Button>

        <p className="caption text-candera-vellum/50 m-0">{NEWSLETTER_MICROCOPY}</p>
      </Container>
    </aside>
  )
}
