import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import RichText from '@/components/RichText'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'

type Props = {
  className?: string
} & BannerBlockProps

const STATUS_META = {
  info: { label: 'Note', Icon: Info },
  error: { label: 'Error', Icon: AlertCircle },
  success: { label: 'Success', Icon: CheckCircle },
  warning: { label: 'Warning', Icon: AlertTriangle },
} as const

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  const status = STATUS_META[style ?? 'info']

  return (
    <Section padding="medium" className={cn(className)}>
      <Container>
        <aside
          className={cn('border py-10 px-12 flex items-start gap-4 shadow-card', {
            'border-border bg-card': style === 'info',
            'border-error/20 bg-error/5': style === 'error',
            'border-success/20 bg-success/5': style === 'success',
            'border-warning/20 bg-warning/5': style === 'warning',
          })}
        >
          <status.Icon
            aria-hidden="true"
            className={cn('size-5 shrink-0 translate-y-1', {
              'text-foreground': style === 'info',
              'text-error': style === 'error',
              'text-success': style === 'success',
              'text-warning': style === 'warning',
            })}
          />
          <div className="w-full text-foreground">
            <span className="font-sans text-xs font-bold uppercase tracking-[0.2em]">
              {status.label}
            </span>
            <div className="font-sans font-light text-foreground [&_p]:m-0">
              <RichText data={content} enableGutter={false} enableProse={false} />
            </div>
          </div>
        </aside>
      </Container>
    </Section>
  )
}
