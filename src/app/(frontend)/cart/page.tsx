import React from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export const metadata = {
  title: 'Shopping Bag — Candera',
  description: 'Your curated selection of botanical artisanry.',
}

export default function CartPage() {
  return (
    <div className="pt-48 pb-32 bg-candera-linen min-h-screen">
      <div className="container max-w-2xl text-center">
        <div className="mb-10 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-candera-ash/50 flex items-center justify-center text-candera-stone">
            <ShoppingBag className="w-10 h-10" strokeWidth={1} />
          </div>
        </div>

        <h1 className="text-[32px] md:text-[44px] font-display font-normal italic leading-tight text-candera-obsidian mb-6 text-balance">
          Your bag is currently empty
        </h1>

        <p className="editorial text-[18px] text-candera-sage-text mb-12 max-w-md mx-auto leading-relaxed">
          It seems you haven’t added any botanical vessels to your collection yet. Our pieces are
          poured in limited batches and often sell out quickly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center h-[56px] px-10 text-[11px] font-bold uppercase tracking-[.3em] bg-candera-obsidian text-white hover:bg-candera-ember-strong transition-all duration-300 shadow-xl"
          >
            Explore Collection
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-[56px] px-10 text-[11px] font-bold uppercase tracking-[.3em] border border-candera-stone/30 text-candera-obsidian hover:bg-white transition-all duration-300"
          >
            Return Home
          </Link>
        </div>

        <div className="mt-24 pt-12 border-t border-candera-stone/10">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-candera-sage-text mb-4">
            A note on our checkout
          </p>
          <p className="text-[13px] text-candera-sage-text/80 max-w-sm mx-auto leading-relaxed">
            Candera currently processes all transactions securely through our Etsy Boutique. This
            ensures your data is protected and your shipping is carbon-neutral.
          </p>
        </div>
      </div>
    </div>
  )
}
