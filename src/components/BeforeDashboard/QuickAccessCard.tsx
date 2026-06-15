import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

type QuickAccessCardProps = {
  label: string
  icon: LucideIcon
  count?: number
  href: string
  createHref?: string
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  label,
  icon: Icon,
  count,
  href,
  createHref,
}) => {
  return (
    <div className="quick-access-card">
      <Link href={href} className="quick-access-card__main">
        <div className="quick-access-card__icon">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="quick-access-card__text">
          <span className="quick-access-card__label">{label}</span>
          {typeof count !== 'undefined' && (
            <span className="quick-access-card__count">{count}</span>
          )}
        </div>
      </Link>
      {createHref && (
        <Link
          href={createHref}
          aria-label={`Create new ${label.toLowerCase()}`}
          className="quick-access-card__create"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
        </Link>
      )}
    </div>
  )
}
