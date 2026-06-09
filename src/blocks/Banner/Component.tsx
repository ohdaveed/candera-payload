import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <Section padding="medium" className={cn(className)}>
      <Container>
        <aside
          className={cn(
            'border py-10 px-12 flex items-center shadow-sm transition-colors duration-500',
            {
              'border-border bg-card': style === 'info',
              'border-error/20 bg-error/5 text-error': style === 'error',
              'border-success/20 bg-success/5 text-success': style === 'success',
              'border-warning/20 bg-warning/5 text-warning': style === 'warning',
            },
          )}
        >
          <div className="editorial w-full">
            <RichText data={content} enableGutter={false} enableProse={false} />
          </div>
        </aside>
      </Container>
    </Section>
  )
}
