import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

import { Separator } from '@/components/ui/separator'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <Section padding="large" className="bg-candera-linen/20">
      <Container>
        <article className="grid grid-cols-4 lg:grid-cols-12 gap-y-16 gap-x-16 lg:gap-x-24 items-start">
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <Section
                  as="aside"
                  padding="none"
                  className={cn(
                    `col-span-4 lg:col-span-${colsSpanClasses[size!]}`,
                    {
                      'md:col-span-2': size !== 'full',
                      'lg:sticky lg:top-32': size !== 'full' && columns.length > 1,
                    },
                    'flex flex-col gap-10',
                  )}
                  key={index}
                >
                  {richText && (
                    <Section padding="none" className="editorial-prose">
                      <RichText data={richText} enableGutter={false} />
                    </Section>
                  )}

                  {enableLink && (
                    <Section padding="none" className="mt-2">
                      <CMSLink
                        {...link}
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      />
                    </Section>
                  )}

                  {index < columns.length - 1 && (
                    <Separator className="lg:hidden bg-candera-stone/20 my-4" />
                  )}
                </Section>
              )
            })}
        </article>
      </Container>
    </Section>
  )
}
