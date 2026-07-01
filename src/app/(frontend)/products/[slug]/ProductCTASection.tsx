'use client'

import { useRef } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'
import { etsyListingUrl } from '@/lib/etsy'
import type { Product } from '@/payload-types'
import { StickyCTABar } from './StickyCTABar'

type Props = {
  title: string
  price: number | null | undefined
  currency: Product['currency']
  vessel: string | null | undefined
  etsyListingId: number | null | undefined
}

export function ProductCTASection({ title, price, currency, vessel, etsyListingId }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Section padding="none" className="flex flex-col gap-2">
        <Button
          asChild
          variant="cta-ember"
          size="cta"
          className="w-full py-5 text-xs font-bold tracking-[.2em] uppercase bg-candera-ember-strong hover:bg-candera-obsidian transition-colors"
        >
          <BoutiqueLink
            href={etsyListingUrl(etsyListingId)}
            location="product-cta"
            className="inline-flex items-center justify-center gap-2"
          >
            Purchase via Etsy
            <ExternalLink width={13} height={13} strokeWidth={2} aria-hidden="true" />
          </BoutiqueLink>
        </Button>
        <p className="text-center text-xs text-candera-sage-text tracking-[.1em]">
          Checkout hosted securely on our official Etsy storefront. 14-day returns. Ships from
          California.
        </p>
      </Section>

      {/* Sentinel sits right after the buy button — bar appears when this scrolls out of view */}
      <div ref={sentinelRef} aria-hidden="true" />

      <StickyCTABar
        title={title}
        price={price}
        currency={currency}
        vessel={vessel}
        etsyListingId={etsyListingId}
        sentinelRef={sentinelRef}
      />
    </>
  )
}
