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
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <Section padding="large">
      <Container>
        <article className="grid grid-cols-4 lg:grid-cols-12 gap-y-12 gap-x-16 lg:gap-x-24">
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
                    },
                    'flex flex-col gap-8',
                  )}
                  key={index}
                >
                  {richText && (
                    <Section padding="none" className="editorial">
                      <RichText data={richText} enableGutter={false} />
                    </Section>
                  )}

                  {enableLink && (
                    <Section padding="none" className="mt-4">
                      <CMSLink {...link} />
                    </Section>
                  )}
                </Section>
              )
            })}
        </article>
      </Container>
    </Section>
  )
}
