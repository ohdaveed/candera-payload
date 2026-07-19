import { cn } from '@/utilities/ui'
import React from 'react'

type EyebrowProps = React.HTMLAttributes<HTMLElement> & {
  as?: 'span' | 'p' | 'h2' | 'h3' | 'h4' | 'div'
}

export function Eyebrow({ as: Tag = 'span', className, ...props }: EyebrowProps) {
  return <Tag className={cn('eyebrow', className)} {...props} />
}
