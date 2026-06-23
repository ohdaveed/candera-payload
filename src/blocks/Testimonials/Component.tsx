import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = TestimonialsBlockType

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  return (
    <Section padding="none" className="bg-candera-obsidian">
      <Container className="py-16 md:py-24">
        {eyebrow && (
          <div className="flex items-center gap-2 mb-12">
            <span className="block w-6 h-px bg-candera-ember" aria-hidden="true" />
            <p className="eyebrow text-candera-stone">{eyebrow}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {items.slice(0, 3).map((item, idx) => (
            <figure
              key={idx}
              className="lg:col-span-4 flex flex-col items-start text-left gap-0 m-0"
            >
              <blockquote className="m-0">
                <p className="font-editorial italic text-base md:text-lg text-candera-vellum leading-relaxed">
                  &ldquo;{item.quote.replace(/^["“”]+|["“”]+$/g, '')}&rdquo;
                </p>
              </blockquote>
              {/* Signed, polaroid-style attribution: pulled tight beneath the
                  quote and set in a muted, warm stone gray. */}
              <figcaption className="font-sans text-xs font-semibold uppercase tracking-widest text-candera-stone-muted mt-1">
                {item.author}
                {item.location ? ` — ${item.location}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  )
}
