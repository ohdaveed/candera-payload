'use client'

import React from 'react'
import Link from 'next/link'
import { Search, ShoppingBag } from 'lucide-react'

import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'
import { ETSY_SHOP_URL } from '@/lib/etsy'
import { Section } from '@/components/ui/section'

// Utility icons anchor the right column of the header (Jakob's Law: users look
// top-right for storefront actions). There is no native cart — checkout is a
// headless Etsy outclick — so the bag deep-links to the real Etsy shop rather
// than toggling a non-existent cart.
const iconClass = (transparent?: boolean, active?: boolean) =>
  [
    'transition-[background-color,color] duration-200 p-2.5 rounded-md min-h-[44px] min-w-[44px] inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2',
    active
      ? 'text-candera-ember-strong bg-candera-ember-strong/8'
      : transparent
        ? 'text-candera-vellum/90 hover:text-candera-vellum hover:bg-candera-vellum/10'
        : 'text-candera-sage-text hover:text-candera-ember-strong hover:bg-candera-obsidian/5',
  ].join(' ')

export const HeaderUtilities: React.FC<{ transparent?: boolean; pathname?: string }> = ({
  transparent,
  pathname,
}) => (
  <Section as="div" padding="none" className="hidden md:flex items-center gap-1">
    <Link
      href="/search"
      aria-label="Search the collection"
      className={iconClass(transparent, pathname?.startsWith('/search'))}
    >
      <Search className="w-4 h-4" aria-hidden="true" />
    </Link>

    <BoutiqueLink
      href={ETSY_SHOP_URL}
      location="header-utility"
      aria-label="Shop on Etsy"
      toastTitle="Opening our Etsy shop"
      toastDescription="Browse and buy the full collection on our official Etsy storefront."
      className={iconClass(transparent)}
    >
      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
    </BoutiqueLink>
  </Section>
)
