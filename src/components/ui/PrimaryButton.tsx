import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

interface PrimaryButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  newTab?: boolean
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  href,
  children,
  className,
  newTab,
}) => {
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  return (
    <Button asChild variant="cta-ember" size="cta" className={cn(className)}>
      <Link href={href} {...newTabProps}>
        {children}
      </Link>
    </Button>
  )
}
