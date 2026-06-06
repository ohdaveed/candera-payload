import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

const StarIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  return (
    <section className="py-32 px-6 bg-white border-t border-candera-stone/20">
      <div className="max-w-[1280px] mx-auto">
        {eyebrow && (
          <Eyebrow as="p" className="text-center mb-20">
            {eyebrow}
          </Eyebrow>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {items.map((t, i) => (
            <Card
              key={i}
              className="flex flex-col items-center text-center gap-6 bg-transparent border-none shadow-none"
            >
              <CardContent className="p-0 flex flex-col items-center gap-6">
                <div className="flex gap-1 text-candera-ember-strong/60 transition-colors group-hover:text-candera-ember-strong">
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>
                <p className="editorial text-[18px] text-candera-obsidian leading-[1.8]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex flex-col gap-1.5 items-center mt-2">
                  <p className="text-[11px] text-candera-obsidian font-bold uppercase tracking-[.2em]">
                    {t.author}
                  </p>
                  {t.badge && (
                    <Badge
                      variant="outline"
                      className="text-[9px] tracking-[.18em] uppercase text-candera-sage-text border-candera-stone/30 rounded-none"
                    >
                      {t.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
