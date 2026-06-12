import React from 'react'
import type { TestimonialsBlock as TestimonialsBlockType } from '@/payload-types'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = TestimonialsBlockType & { disableInnerContainer?: boolean }

const StarIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const TestimonialsBlock: React.FC<Props> = ({ eyebrow, items }) => {
  if (!items?.length) return null

  return (
    <Section padding="large" className="bg-candera-linen/50 border-t border-candera-stone/10">
      <Container>
        {eyebrow && (
          <Eyebrow as="p" className="text-center mb-24">
            {eyebrow}
          </Eyebrow>
        )}
        <Section
          as="ul"
          padding="none"
          className="grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-32 list-none p-0 m-0"
        >
          {items.map((t, i) => (
            <Card
              key={i}
              as="li"
              className="flex flex-col items-center text-center gap-8 bg-transparent border-none shadow-none group"
            >
              <CardContent as="article" className="p-0 flex flex-col items-center gap-8">
                <Section
                  as="header"
                  padding="none"
                  className="flex gap-1.5 text-candera-ember-strong/40 transition-colors duration-700 group-hover:text-candera-ember-strong/80"
                >
                  {[...Array(5)].map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </Section>
                <blockquote className="m-0">
                  <p className="editorial text-[20px] text-candera-obsidian leading-[1.8] italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <Section
                  as="footer"
                  padding="none"
                  className="flex flex-col gap-3 items-center mt-4"
                >
                  <p className="text-[12px] text-candera-obsidian font-bold uppercase tracking-[.3em]">
                    {t.author}
                  </p>
                  {t.badge && (
                    <Badge
                      variant="outline"
                      as="span"
                      className="text-[10px] tracking-[.2em] uppercase text-candera-sage-text border-candera-stone/20 rounded-none px-4 py-1"
                    >
                      {t.badge}
                    </Badge>
                  )}
                </Section>
              </CardContent>
            </Card>
          ))}
        </Section>
      </Container>
    </Section>
  )
}
