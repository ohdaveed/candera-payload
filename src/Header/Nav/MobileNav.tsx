'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import type { Header } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MobileNavProps {
  data: Header
  transparent: boolean
}

export const MobileNav: React.FC<MobileNavProps> = ({ data, transparent }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation menu"
            className={[
              'inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] transition-colors',
              transparent ? 'text-white' : 'text-candera-obsidian',
            ].join(' ')}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </SheetTrigger>
        <SheetContent
          aria-describedby={undefined}
          side="right"
          className="bg-candera-linen border-candera-stone/30 w-[280px] pt-12"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="flex flex-col gap-2 px-6">
            {navItems.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance="inline"
                className="text-[11px] font-bold uppercase tracking-[.3em] text-candera-sage-text hover:text-candera-ember-strong transition-colors py-3 border-b border-candera-stone/20 last:border-0"
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
