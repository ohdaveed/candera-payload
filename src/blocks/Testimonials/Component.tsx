import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

const StarRow: React.FC = () => (
  <div className="flex gap-1.5 text-candera-ember-strong" aria-label="5 stars">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
)

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  const [featured, ...rest] = items

  return (
    <Section padding="none" className="bg-candera-obsidian overflow-hidden relative">
      {/* Decorative large quote mark */}
      <div
        className="absolute top-0 right-0 leading-none text-white/[0.03] select-none pointer-events-none font-display"
        style={{ fontSize: 'clamp(18rem, 30vw, 36rem)', lineHeight: 0.8 }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <Container className="relative z-10 py-28 md:py-36">
        {eyebrow && (
          <Eyebrow as="p" className="text-candera-ember mb-16 md:mb-20">
            {eyebrow}
          </Eyebrow>
        )}

        {/* Featured (first) testimonial — large editorial treatment */}
        {featured && (
          <figure className="mb-20 md:mb-28 max-w-[52rem]">
            <StarRow />
            <blockquote className="mt-8 m-0">
              <p
                className="font-display italic text-white leading-[1.25] m-0"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
              >
                &ldquo;{featured.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[.3em] text-white">
                  {featured.author}
                </span>
                {featured.badge && (
                  <span className="text-[10px] uppercase tracking-[.2em] text-candera-sage-text">
                    {featured.badge}
                  </span>
                )}
              </div>
            </figcaption>
          </figure>
        )}

        {/* Remaining testimonials — compact row */}
        {rest.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 list-none p-0 m-0 border-t border-white/10">
            {rest.map((t, i) => (
              <li
                key={i}
                className="flex flex-col gap-5 py-10 pr-0 md:pr-12 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0"
              >
                <StarRow />
                <blockquote className="m-0">
                  <p className="font-serif italic text-[15px] leading-[1.75] text-white/80 m-0">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-auto">
                  <span className="w-5 h-[1px] bg-candera-ember-strong/60" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.3em] text-white/90 m-0">
                      {t.author}
                    </p>
                    {t.badge && (
                      <p className="text-[9px] uppercase tracking-[.2em] text-candera-sage-text m-0 mt-0.5">
                        {t.badge}
                      </p>
                    )}
                  </div>
                </figcaption>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  )
}
