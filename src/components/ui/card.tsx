import { cn } from '@/utilities/ui'
import * as React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

const Card = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        data-slot="card"
        className={cn('bg-card text-card-foreground rounded-[2px] border shadow-sm', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        data-slot="card-header"
        className={cn('flex flex-col gap-1.5 p-6', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
CardHeader.displayName = 'CardHeader'

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      data-slot="card-title"
      className={cn('text-2xl leading-none font-semibold tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => {
  return (
    <p
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

const CardContent = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        data-slot="card-content"
        className={cn('p-6 pt-0', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLElement, CardProps>(
  ({ className, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        data-slot="card-footer"
        className={cn('flex items-center p-6 pt-0', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
