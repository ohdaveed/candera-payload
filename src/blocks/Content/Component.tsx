import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: 'lg:col-span-12',
    half: 'lg:col-span-6',
    oneThird: 'lg:col-span-4',
    twoThirds: 'lg:col-span-8',
  }

  return (
    <Section padding="medium">
      <Container>
        <article className="grid grid-cols-4 lg:grid-cols-12 gap-y-16 gap-x-16 lg:gap-x-24 items-start">
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col
              const columnSize = size ?? 'full'

              return (
                <Section
                  as="aside"
                  padding="none"
                  className={cn(
                    'col-span-4',
                    colsSpanClasses[columnSize],
                    {
                      'md:col-span-2': columnSize !== 'full',
                      'lg:sticky lg:top-32': columnSize !== 'full' && columns.length > 1,
                    },
                    'flex flex-col gap-10',
                  )}
                  key={index}
                >
                  {richText && (
                    <Section
                      padding="none"
                      className="[&_h2]:mb-8 [&_p]:mb-6 [&_p:last-child]:mb-0"
                    >
                      <span
                        className="block h-px w-16 mb-8 bg-candera-stone/20"
                        aria-hidden="true"
                      />
                      <RichText data={richText} enableGutter={false} enableProse={false} />
                    </Section>
                  )}

                  {enableLink && (
                    <Section padding="none" className="mt-2">
                      <CMSLink
                        {...link}
                        className="hover:translate-x-1 transition-transform duration-300"
                      />
                    </Section>
                  )}

                  {index < columns.length - 1 && (
                    <span
                      className="block h-px lg:hidden bg-candera-stone/20 my-4"
                      aria-hidden="true"
                    />
                  )}
                </Section>
              )
            })}
        </article>
      </Container>
    </Section>
  )
}
