import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

type QuickAccessCardProps = {
  label: string
  icon: LucideIcon
  count: number
  href: string
  createHref: string
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  label,
  icon: Icon,
  count,
  href,
  createHref,
}) => {
  return (
    <Card className="relative flex items-stretch hover:shadow-sm transition-shadow">
      <Link
        href={href}
        className="flex items-center gap-3.5 p-4 flex-1 text-inherit no-underline min-w-0"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-[var(--style-radius-s,4px)] bg-muted text-muted-foreground shrink-0">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[0.9375rem] font-medium text-foreground truncate">{label}</span>
          <span className="text-[0.75rem] text-muted-foreground">{count}</span>
        </div>
      </Link>
      <Link
        href={createHref}
        className="flex items-center justify-center w-10 shrink-0 text-muted-foreground border-l border-border transition-colors hover:text-foreground hover:bg-muted no-underline"
        title={`Create new ${label.toLowerCase()}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M8 3v10M3 8h10" />
        </svg>
      </Link>
    </Card>
  )
}
