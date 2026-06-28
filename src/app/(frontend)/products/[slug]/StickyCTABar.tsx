'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'
import { etsyListingUrl } from '@/lib/etsy'

type Props = {
  title: string
  price: number | null | undefined
  vessel: string | null | undefined
  etsyListingId: number | null | undefined
  /** Ref attached to the sentinel element placed next to the main buy button in the page */
  sentinelRef: React.RefObject<HTMLDivElement | null>
}

export function StickyCTABar({ title, price, etsyListingId, sentinelRef }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    // Bottom boundary: once the closing brand-story / email region appears, the
    // bar retracts so it never overlays the page-end content.
    const endEl = document.getElementById('pdp-detail-end')

    if (!window.IntersectionObserver) {
      setVisible(true)
      return
    }

    let pastTop = false
    let atEnd = false
    const apply = () => setVisible(pastTop && !atEnd)

    const observers: IntersectionObserver[] = []
    if (sentinel) {
      const top = new IntersectionObserver(([e]) => ((pastTop = !e.isIntersecting), apply()), {
        threshold: 0,
      })
      top.observe(sentinel)
      observers.push(top)
    } else {
      pastTop = true
    }
    if (endEl) {
      const bottom = new IntersectionObserver(([e]) => ((atEnd = e.isIntersecting), apply()), {
        threshold: 0,
      })
      bottom.observe(endEl)
      observers.push(bottom)
    }
    apply()
    return () => observers.forEach((o) => o.disconnect())
  }, [sentinelRef])

  return (
    <aside
      aria-label="Quick purchase"
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-candera-obsidian text-candera-vellum
        flex items-center justify-between
        px-6 py-4 gap-4
        shadow-[0_-4px_24px_rgba(0,0,0,0.18)]
        transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-display italic text-candera-vellum text-base leading-tight truncate">
          {title}
        </span>
        <span className="text-xs text-candera-vellum/75 tracking-[.1em]">
          {price != null ? `$${Number(price).toFixed(2)}` : ''}
        </span>
      </div>

      <BoutiqueLink
        href={etsyListingUrl(etsyListingId)}
        className="shrink-0 inline-flex items-center gap-2 bg-candera-ember-strong hover:bg-candera-vellum hover:text-candera-obsidian text-candera-vellum text-xs font-bold uppercase tracking-[.2em] px-5 py-3 transition-colors duration-200"
      >
        Buy on Etsy
        <ArrowRight width={12} height={12} strokeWidth={2} aria-hidden="true" />
      </BoutiqueLink>
    </aside>
  )
}
