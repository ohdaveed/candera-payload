import React from 'react'
import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <Section padding="medium" className="relative overflow-hidden bg-candera-vellum grain">
      <Container>
        {/* Decorative horizontal rule with ember accent */}
        <div className="flex items-center gap-4 mb-12">
          <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
          <span className="w-6 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          {/* Rich text — large editorial display */}
          <div className="max-w-[36rem]">
            {richText && (
              <RichText
                className="
                  [&_h2]:font-display [&_h2]:italic [&_h2]:text-candera-obsidian [&_h2]:leading-[var(--leading-h2)] [&_h2]:m-0
                  [&_p]:font-editorial [&_p]:italic [&_p]:leading-relaxed [&_p]:text-candera-sage-text [&_p]:mt-5 [&_p]:m-0
                "
                data={richText}
                enableGutter={false}
              />
            )}
          </div>

          {/* CTAs — stacked, right-anchored */}
          {links && links.length > 0 && (
            <div className="flex flex-col gap-3 shrink-0 md:items-end">
              {links.map(({ link }, i) => (
                <CMSLink key={i} {...link} appearance={i === 0 ? 'cta' : 'outline'} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
