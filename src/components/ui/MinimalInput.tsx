import { cn } from '@/utilities/ui'
import React from 'react'

type MinimalInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const MinimalInput: React.FC<MinimalInputProps> = ({ className, type, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full bg-transparent border-b border-candera-obsidian/70 px-0 py-2',
        'text-base text-candera-obsidian placeholder:text-candera-sage-text',
        'transition-colors duration-200',
        'focus-visible:border-candera-obsidian outline-none focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 rounded-sm',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
