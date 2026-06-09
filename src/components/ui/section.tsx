import { cn } from '@/utilities/ui'
import React from 'react'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ as: Component = 'section', className, padding = 'medium', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      small: 'py-8 md:py-12',
      medium: 'py-16 md:py-24',
      large: 'py-24 md:py-32',
    }

    return <Component className={cn(paddingClasses[padding], className)} ref={ref} {...props} />
  },
)

Section.displayName = 'Section'
