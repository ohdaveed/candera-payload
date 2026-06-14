'use client'

import { useEffect, useRef, useState } from 'react'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'

type Props = {
  title: string
  price: number | null | undefined
  vessel: string | null | undefined
  etsyListingId: number | null | undefined
}

const etsyListingUrl = (id: number) => `https://www.etsy.com/listing/${id}`

export function StickyCTABar({ title, price, vessel, etsyListingId }: Props) {
  const [visible, setVisible] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    // Browsers without IntersectionObserver show the bar statically
    if (!window.IntersectionObserver) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  if (!etsyListingId) return null

  return (
    <>
      {/* Invisible sentinel placed right after the main CTA button */}
      <div ref={sentinelRef} aria-hidden="true" />

      <div
        role="complementary"
        aria-label="Quick purchase"
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-candera-obsidian text-white
          flex items-center justify-between
          px-6 py-4 gap-4
          shadow-[0_-4px_24px_rgba(0,0,0,0.18)]
          transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
          ${visible ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display italic text-white text-[1rem] leading-tight truncate">
            {title}
          </span>
          <span className="text-[10px] text-white/75 tracking-[.1em]">
            {vessel ? `Vessel ${vessel} · ` : ''}
            {price != null ? `$${Number(price).toFixed(2)}` : ''}
          </span>
        </div>

        <BoutiqueLink
          href={etsyListingUrl(etsyListingId)}
          className="shrink-0 inline-flex items-center gap-2 bg-candera-ember-strong hover:bg-white hover:text-candera-obsidian text-white text-[10px] font-bold uppercase tracking-[.2em] px-5 py-3 transition-colors duration-200"
        >
          Buy on Etsy
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </BoutiqueLink>
      </div>
    </>
  )
}
