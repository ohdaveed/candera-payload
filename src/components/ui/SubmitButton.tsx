import { cn } from '@/utilities/ui'
import React from 'react'

type SubmitButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const SubmitButton: React.FC<SubmitButtonProps> = ({ className, children, ...props }) => {
  return (
    <button
      type="submit"
      className={cn(
        'bg-candera-ember-strong text-white hover:bg-candera-obsidian',
        'transition-colors duration-300 px-6 py-3',
        'tracking-wide uppercase text-sm font-bold',
        'disabled:pointer-events-none disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
