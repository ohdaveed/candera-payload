import { cn } from '@/utilities/ui'
import React from 'react'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Component = 'div', className, ...props }, ref) => {
    return (
      <Component
        className={cn('w-full max-w-[1200px] mx-auto px-[5vw]', className)}
        ref={ref}
        {...props}
      />
    )
  },
)

Container.displayName = 'Container'
