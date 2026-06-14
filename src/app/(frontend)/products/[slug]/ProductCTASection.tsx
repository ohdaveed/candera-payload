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
          Ships from California · Handmade in micro-batches
        </p>
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-candera-stone/60 flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Secure checkout
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-candera-stone/60 flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-9-9" />
              <path d="M21 3v6h-6" />
              <path d="M21 3l-9 9" />
            </svg>
            Returns within 14 days
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[.15em] text-candera-stone/60 flex items-center gap-1.5">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Authentic handcraft
          </span>
        </div>
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
