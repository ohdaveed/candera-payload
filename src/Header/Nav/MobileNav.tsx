'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'

import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

interface MobileNavProps {
  data: Header
  transparent: boolean
}

import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export const MobileNav: React.FC<MobileNavProps> = ({ data, transparent }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Section as="div" padding="none" className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation menu"
            className={[
              'inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] transition-colors',
              transparent ? 'text-white' : 'text-candera-obsidian',
            ].join(' ')}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent
          aria-describedby={undefined}
          side="right"
          className="bg-candera-linen border-candera-stone/30 w-[280px] pt-12"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Section as="nav" padding="none" className="flex flex-col gap-2 px-6">
            <CMSLink
              type="custom"
              url="/search"
              appearance="inline"
              className="flex items-center gap-3 py-4 border-b border-candera-stone/20 text-xs font-bold uppercase tracking-[.3em] text-candera-obsidian hover:text-candera-ember-strong transition-colors"
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              Search
            </CMSLink>
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance="inline"
                className="text-xs font-bold uppercase tracking-[.3em] text-candera-sage-text hover:text-candera-ember-strong transition-colors py-4 border-b border-candera-stone/20 last:border-0"
              />
            ))}
          </Section>
        </SheetContent>
      </Sheet>
    </Section>
  )
}
