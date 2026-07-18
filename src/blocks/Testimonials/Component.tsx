import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = TestimonialsBlockType

/*
 * NOTE TO FUTURE CONTRIBUTORS:
 * The TestimonialsBlock is designed to be theme-adaptable. It responds to the
 * page's data-section-mood setting via CSS variables (--mood-bg, --mood-fg,
 * and --mood-accent). The default 'light-editorial' mood declares --mood-fg
 * as the literal keyword `inherit` on the <html> root, which — having no
 * parent to inherit from — resolves to the CSS guaranteed-invalid value. That
 * silently defeats `var(--mood-fg, ...)` and falls through to the fallback
 * color below, so the fallback must itself be a legible dark tone (matching
 * --foreground), not the old off-white value that was tuned for a dark card
 * and left text invisible against this section's actual (light/transparent)
 * background. --mood-bg validly resolves to `transparent` for this mood, so
 * it is left as-is. Do not hardcode a dark section background here — other
 * moods (rose-wash, noir-contrast) rely on these vars resolving correctly.
 */
// Column span is keyed to the visible item count so a sparse grid (1-2
// testimonials) doesn't leave a large unbalanced gap in the 12-col layout.
// Tailwind's JIT can't see interpolated class names, so spans are literal.
const COL_SPAN_BY_COUNT: Record<number, string> = {
  1: 'lg:col-span-8 lg:col-start-3',
  2: 'lg:col-span-6',
  3: 'lg:col-span-4',
}

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  const visibleItems = items.slice(0, 3)
  const colSpanClass = COL_SPAN_BY_COUNT[visibleItems.length] ?? COL_SPAN_BY_COUNT[3]

  return (
    <Section
      padding="none"
      style={{
        backgroundColor: 'var(--mood-bg, transparent)',
        color: 'var(--mood-fg, #141412)',
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
            <p className="eyebrow" style={{ color: 'var(--mood-fg, #141412)' }}>
              {eyebrow}
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {visibleItems.map((item, idx) => (
            <figure
              key={idx}
              className={`${colSpanClass} flex flex-col items-start text-left gap-0 m-0`}
            >
              <blockquote className="m-0 max-w-[70ch]">
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
