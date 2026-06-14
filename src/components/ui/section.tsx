import { cn } from '@/utilities/ui'
import React from 'react'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  padding?: 'none' | 'small' | 'medium' | 'large'
  tinted?: boolean
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ as: Component = 'section', className, padding = 'medium', tinted, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      small: 'py-12 md:py-16',
      medium: 'py-24 md:py-32',
      large: 'py-32 md:py-48',
    }

    return (
      <Component
        className={cn(paddingClasses[padding], tinted && 'bg-candera-linen', className)}
        ref={ref}
        {...props}
      />
    )
  },
)

Section.displayName = 'Section'
