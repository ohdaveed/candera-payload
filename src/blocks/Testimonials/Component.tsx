import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = TestimonialsBlockType

/*
 * NOTE TO FUTURE CONTRIBUTORS:
 * The TestimonialsBlock is designed to be fully theme-adaptable.
 * It dynamically responds to the page's data-section-mood and data-skin settings by using
 * CSS variables (--mood-bg, --mood-fg, and --mood-accent).
 * Dark Obsidian remains the default/high-contrast fallback. Do not hardcode colors.
 */
export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  return (
    <Section
      padding="none"
      style={{
        backgroundColor: 'var(--mood-bg, #141412)',
        color: 'var(--mood-fg, #fdfbf7)',
      }}
      className="transition-colors duration-300"
    >
      <Container className="py-16 md:py-24">
        {eyebrow && (
          <div className="flex items-center gap-2 mb-12">
            <span
              className="block w-6 h-px"
              style={{ backgroundColor: 'var(--mood-accent, #dd7d52)' }}
              aria-hidden="true"
            />
            <p className="eyebrow opacity-75">{eyebrow}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {items.slice(0, 3).map((item, idx) => (
            <figure
              key={idx}
              className="lg:col-span-4 flex flex-col items-start text-left gap-0 m-0"
            >
              <blockquote className="m-0">
                <p className="font-editorial italic text-base md:text-lg leading-relaxed text-inherit">
                  &ldquo;{item.quote.replace(/^["“”]+|["“”]+$/g, '')}&rdquo;
                </p>
              </blockquote>
              {/* Signed, polaroid-style attribution: pulled tight beneath the
                  quote and set in a muted, warm stone gray. */}
              <figcaption className="font-sans text-xs font-semibold uppercase tracking-widest opacity-60 mt-1">
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
