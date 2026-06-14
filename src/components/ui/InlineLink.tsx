import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

interface InlineLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  dark?: boolean
  newTab?: boolean
}

export const InlineLink: React.FC<InlineLinkProps> = ({
  href,
  children,
  className,
  dark = false,
  newTab,
}) => {
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  return (
    <Link
      href={href}
      className={cn(
        'underline underline-offset-4 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-sm',
        dark
          ? 'text-candera-obsidian decoration-candera-obsidian/30 hover:decoration-candera-obsidian'
          : 'text-candera-vellum decoration-candera-vellum/40 hover:decoration-candera-vellum',
        className,
      )}
      {...newTabProps}
    >
      {children}
    </Link>
  )
}
