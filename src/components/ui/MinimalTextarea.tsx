import { cn } from '@/utilities/ui'
import React from 'react'

type MinimalTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const MinimalTextarea: React.FC<MinimalTextareaProps> = ({ className, ...props }) => {
  return (
    <textarea
      rows={4}
      className={cn(
        'w-full bg-transparent border-b border-candera-obsidian/70 px-0 py-2',
        'text-base text-candera-obsidian placeholder:text-candera-sage-text',
        'transition-colors duration-200 resize-y',
        'focus:border-candera-obsidian focus:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
