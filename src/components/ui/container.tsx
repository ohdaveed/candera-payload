import { cn } from '@/utilities/ui'
import React from 'react'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Component = 'div', className, ...props }, ref) => {
    return (
      <Component className={cn('container mx-auto px-4 md:px-8', className)} ref={ref} {...props} />
    )
  },
)

Container.displayName = 'Container'
