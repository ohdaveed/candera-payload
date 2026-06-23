'use client'

import React from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

import { Section } from '@/components/ui/section'

export const HeaderNav: React.FC<{
  data: HeaderType
  transparent?: boolean
  pathname?: string
}> = ({ data, transparent, pathname }) => {
  const navItems = data?.navItems || []

  const linkClass = (isActive?: boolean) =>
    [
      'text-xs font-bold uppercase tracking-[.3em] transition-[background-color,color] duration-200 hover:text-candera-ember-strong px-4 py-2 rounded-md hover:bg-candera-obsidian/5 min-h-[44px] inline-flex items-center',
      isActive
        ? 'text-candera-ember-strong bg-candera-ember-strong/8'
        : transparent
          ? 'text-candera-vellum/90 hover:bg-candera-vellum/10'
          : 'text-candera-sage-text',
    ].join(' ')

  return (
    <Section
      as="nav"
      padding="none"
      aria-label="Main Navigation"
      className="hidden md:flex items-center gap-1"
    >
      {navItems.map(({ link }, i) => {
        const href =
          link.type === 'reference' &&
          typeof link.reference?.value === 'object' &&
          link.reference.value.slug
            ? `${link.reference.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''}/${link.reference.value.slug}`
            : link.url

        const isActive = !!(
          pathname &&
          href &&
          (pathname === href || (href !== '/' && pathname.startsWith(href)))
        )
        return <CMSLink key={i} {...link} appearance="link" className={linkClass(isActive)} />
      })}

      {/* Persistent search affordance — Jakob's Law: users expect search in the header */}
      <Link
        href="/search"
        aria-label="Search the collection"
        className={[
          'transition-[background-color,color] duration-200 hover:text-candera-ember-strong p-2.5 rounded-md hover:bg-candera-obsidian/5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2',
          pathname?.startsWith('/search')
            ? 'text-candera-ember-strong bg-candera-ember-strong/8'
            : transparent
              ? 'text-candera-vellum/90 hover:bg-candera-vellum/10'
              : 'text-candera-sage-text',
        ].join(' ')}
      >
        <Search className="w-4 h-4" aria-hidden="true" />
      </Link>
    </Section>
  )
}
