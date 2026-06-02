'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType; transparent?: boolean }> = ({ data, transparent }) => {
  const navItems = data?.navItems || []

  const linkClass = [
    'text-[11px] font-semibold uppercase tracking-[.2em] transition-colors hover:text-candera-ember',
    transparent ? 'text-white/80' : 'text-candera-sage',
  ].join(' ')

  return (
    <nav
      aria-label="Main Navigation"
      className="flex items-center gap-6"
    >
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink key={i} {...link} appearance="link" className={linkClass} />
        )
      })}
      <Link
        aria-label="Search"
        className={['inline-flex items-center justify-center transition-colors hover:text-candera-ember', transparent ? 'text-white/80' : 'text-candera-sage'].join(' ')}
        href="/search"
      >
        <span className="sr-only">Search</span>
        <SearchIcon aria-hidden="true" className="w-4" />
      </Link>
    </nav>
  )
}
