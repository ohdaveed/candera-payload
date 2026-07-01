'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

import { Section } from '@/components/ui/section'

export const HeaderNav: React.FC<{
  data: HeaderType
  transparent?: boolean
  pathname?: string
}> = ({ data, transparent, pathname }) => {
  const navItems = data?.navItems || []

  // Fitts's Law: padding + a subtle background hover expand the interactive
  // surface well beyond the glyphs, rather than confining clicks to the text.
  const linkClass = (isActive?: boolean) =>
    [
      'text-xs uppercase tracking-[.3em] transition-[color,background-color,text-decoration-color] duration-200 px-4 py-2 min-h-[44px] inline-flex items-center rounded-md underline-offset-[6px] decoration-2',
      isActive
        ? 'text-candera-ember-strong font-bold underline decoration-candera-ember-strong'
        : transparent
          ? 'text-candera-vellum/90 font-medium hover:text-candera-vellum hover:bg-candera-vellum/10 hover:underline decoration-transparent hover:decoration-candera-vellum/50'
          : 'text-candera-sage-text font-medium hover:text-candera-obsidian hover:bg-candera-obsidian/5 hover:underline decoration-transparent hover:decoration-candera-sage-text/50',
    ].join(' ')

  return (
    <Section
      as="nav"
      padding="none"
      aria-label="Main Navigation"
      className="flex items-center gap-1"
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
    </Section>
  )
}
