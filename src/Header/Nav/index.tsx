'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType; transparent?: boolean }> = ({
  data,
  transparent,
}) => {
  const navItems = data?.navItems || []

  const linkClass = [
    'text-[10px] font-bold uppercase tracking-[.3em] transition-all duration-200 hover:text-candera-ember-strong px-4 py-2 rounded-md hover:bg-black/5 min-h-[44px] inline-flex items-center',
    transparent ? 'text-white/90 hover:bg-white/10' : 'text-candera-sage-text',
  ].join(' ')

  const iconBtnClass = [
    'inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-full transition-colors hover:text-candera-ember-strong hover:bg-black/5',
    transparent ? 'text-white/90 hover:bg-white/10' : 'text-candera-sage-text',
  ].join(' ')

  return (
    <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" className={linkClass} />
      })}

      <div className="flex items-center gap-1 ml-4 pl-4 border-l border-current/10">
        <Link aria-label="Search" className={iconBtnClass} href="/search">
          <span className="sr-only">Search</span>
          <SearchIcon aria-hidden="true" className="w-[18px] h-[18px]" />
        </Link>
      </div>
    </nav>
  )
}
