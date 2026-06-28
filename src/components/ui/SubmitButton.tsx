import { cn } from '@/utilities/ui'
import React from 'react'
import { Button, type ButtonProps } from './button'

export const SubmitButton: React.FC<ButtonProps> = ({ className, children, ...props }) => {
  return (
    <Button
      type="submit"
      variant="cta-ember"
      size="cta"
      className={cn('w-full sm:w-auto', className)}
      {...props}
    >
      {children}
    </Button>
  )
}
