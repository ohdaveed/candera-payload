import React from 'react'
import type { CallToActionBlock as CTABlockProps } from '@/payload-types'
import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="relative overflow-hidden bg-candera-vellum grain">
      {/* Decorative horizontal rule with ember accent */}
      <div className="container">
        <div className="flex items-center gap-4 pt-16 pb-12">
          <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
          <span className="w-6 h-[1px] bg-candera-ember-strong" aria-hidden="true" />
          <span className="flex-1 h-[1px] bg-candera-stone/25" aria-hidden="true" />
        </div>
      </div>

      <div className="container pb-20 md:pb-28">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          {/* Rich text — large editorial display */}
          <div className="max-w-[36rem]">
            {richText && (
              <RichText
                className="
                  [&_h2]:font-display [&_h2]:italic [&_h2]:text-candera-obsidian [&_h2]:leading-tight [&_h2]:m-0
                  [&_h2]:text-[clamp(2rem,4vw,3.5rem)]
                  [&_p]:font-editorial [&_p]:italic [&_p]:leading-[1.75] [&_p]:text-candera-sage-text [&_p]:mt-5 [&_p]:m-0
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
                <CMSLink key={i} {...link} appearance={i === 0 ? 'default' : 'outline'} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
