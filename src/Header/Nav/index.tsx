'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav
      aria-label="Main Navigation"
      className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm md:text-base"
    >
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link
        aria-label="Search"
        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-primary/10 focus-visible:outline-1 focus-visible:ring-4 focus-visible:ring-ring/20"
        href="/search"
      >
        <span className="sr-only">Search</span>
        <SearchIcon aria-hidden="true" className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
