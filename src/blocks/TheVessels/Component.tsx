import React from 'react'
import { Media } from '@/components/Media'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import type { TheVesselsBlock as TheVesselsBlockType } from '@/payload-types'

type Props = TheVesselsBlockType

export const TheVesselsBlock: React.FC<Props> = ({ eyebrow, heading, items }) => {
  if (!items?.length) return null

  return (
    <Section padding="medium" className="bg-candera-vellum">
      <Container>
        {(eyebrow || heading) && (
          <div className="flex flex-col gap-4 mb-12 md:mb-16">
            {eyebrow && (
              <div className="flex items-center gap-2">
                <span className="block w-6 h-px bg-candera-ember" aria-hidden="true" />
                <p className="eyebrow text-candera-sage-text">{eyebrow}</p>
              </div>
            )}
            {heading && (
              <h2 className="font-display font-normal italic text-candera-obsidian text-4xl md:text-5xl m-0 leading-tight max-w-[640px] text-balance">
                {heading}
              </h2>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.slice(0, 3).map((item, idx) => (
            <figure key={idx} className="m-0 flex flex-col gap-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-candera-ash">
                {item.image && typeof item.image === 'object' && (
                  <Media
                    fill
                    imgClassName="object-cover"
                    resource={item.image}
                    size="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </div>
              {(item.label || item.caption) && (
                <figcaption className="flex flex-col gap-1">
                  {item.label && (
                    <span className="font-sans text-xs font-semibold uppercase tracking-widest text-candera-obsidian">
                      {item.label}
                    </span>
                  )}
                  {item.caption && (
                    <span className="font-editorial italic text-sm text-candera-sage-text">
                      {item.caption}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  )
}
