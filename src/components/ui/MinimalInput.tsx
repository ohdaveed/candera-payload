import { cn } from '@/utilities/ui'
import React from 'react'

type MinimalInputProps = React.InputHTMLAttributes<HTMLInputElement>

export const MinimalInput: React.FC<MinimalInputProps> = ({ className, type, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        'w-full bg-transparent border-b border-candera-stone/40 px-0 py-2',
        'text-base text-candera-obsidian placeholder:text-candera-stone/50',
        'transition-colors duration-200',
        'focus:border-candera-obsidian focus:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
