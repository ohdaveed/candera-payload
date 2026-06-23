'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'
import { StickyCTABar } from './StickyCTABar'

type Props = {
  title: string
  price: number | null | undefined
  vessel: string | null | undefined
  etsyListingId: number | null | undefined
}

export function ProductCTASection({ title, price, vessel, etsyListingId }: Props) {
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
            href={
              etsyListingId
                ? `https://www.etsy.com/listing/${etsyListingId}`
                : 'https://www.etsy.com/shop/candera'
            }
          >
            Buy on Etsy
          </BoutiqueLink>
        </Button>
        <p className="text-center text-xs text-candera-sage-text tracking-[.1em]">
          Secure checkout · 14-day returns · Ships from California · Handmade in micro-batches
        </p>
      </Section>

      {/* Sentinel sits right after the buy button — bar appears when this scrolls out of view */}
      <div ref={sentinelRef} aria-hidden="true" />

      <StickyCTABar
        title={title}
        price={price}
        vessel={vessel}
        etsyListingId={etsyListingId}
        sentinelRef={sentinelRef}
      />
    </>
  )
}
