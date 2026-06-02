'use client'

import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

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
    <div className="candera-card">
      <Link href={href} className="candera-card__body">
        <div className="candera-card__icon">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <div className="candera-card__info">
          <span className="candera-card__label">{label}</span>
          <span className="candera-card__count">{count}</span>
        </div>
      </Link>
      <Link
        href={createHref}
        className="candera-card__action"
        title={`Create new ${label.toLowerCase()}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </Link>
    </div>
  )
}
