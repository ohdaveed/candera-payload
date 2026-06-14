'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

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

  const iconBtnClass = [
    'inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] transition-colors hover:text-candera-ember-strong hover:bg-candera-obsidian/5',
    transparent ? 'text-candera-vellum/90 hover:bg-candera-vellum/10' : 'text-candera-sage-text',
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

      <Section
        as="span"
        padding="none"
        className="flex items-center gap-1 ml-4 pl-4 border-l border-current/10"
      >
        <Button asChild variant="ghost" size="icon" className={iconBtnClass} aria-label="Search">
          <Link href="/search">
            <span className="sr-only">Search</span>
            <SearchIcon aria-hidden="true" className="w-[18px] h-[18px]" />
          </Link>
        </Button>
      </Section>
    </Section>
  )
}
