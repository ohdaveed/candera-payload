import React from 'react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/utilities/ui'

type PageHeaderProps = {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  titleAs?: 'h1' | 'h2'
  align?: 'left' | 'center'
  className?: string
  contentClassName?: string
  maxWidthClassName?: string
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  children?: React.ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  titleAs = 'h1',
  align = 'left',
  className,
  contentClassName,
  maxWidthClassName = 'max-w-[600px]',
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  children,
}: PageHeaderProps) {
  const TitleTag = titleAs

  return (
    <section className={cn(className)}>
      <div
        className={cn(
          'space-y-4',
          align === 'center' && 'mx-auto text-center',
          maxWidthClassName,
          contentClassName,
        )}
      >
        {eyebrow ? (
          <Eyebrow
            className={cn('block', align === 'center' && 'justify-self-center', eyebrowClassName)}
          >
            {eyebrow}
          </Eyebrow>
        ) : null}

        <TitleTag className={cn('hero-heading text-candera-obsidian', titleClassName)}>
          {title}
        </TitleTag>

        {description ? (
          <p className={cn('editorial text-candera-sage-text', descriptionClassName)}>
            {description}
          </p>
        ) : null}

        {children ? (
          <div className={cn('pt-2', align === 'center' && 'flex justify-center')}>{children}</div>
        ) : null}
      </div>
    </section>
  )
}
