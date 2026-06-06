'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FragranceProfile } from '@/components/FragranceProfile'
import { Eyebrow } from '@/components/ui/eyebrow'

type ScentProfile =
  | {
      top?: string | null
      heart?: string | null
      base?: string | null
    }
  | null
  | undefined

type ProductDetailTabsProps = {
  scentProfile?: ScentProfile
  burnTime?: string | null
  atmosphere?: string | null
  productType?: 'candle' | 'vintage'
}

export function ProductDetailTabs({
  scentProfile,
  burnTime,
  atmosphere,
  productType = 'candle',
}: ProductDetailTabsProps) {
  const isCandle = productType === 'candle'
  const hasScent = scentProfile?.top || scentProfile?.heart || scentProfile?.base

  return (
    <Tabs defaultValue="specs">
      <TabsList className="bg-candera-ash/50 rounded-none border border-candera-stone/20 p-0 h-auto w-full">
        <TabsTrigger
          value="specs"
          className="flex-1 text-[10px] font-bold uppercase tracking-[.2em] rounded-none data-[state=active]:bg-candera-obsidian data-[state=active]:text-white data-[state=active]:shadow-none py-3"
        >
          Specifications
        </TabsTrigger>
        {isCandle && hasScent && (
          <TabsTrigger
            value="scent"
            className="flex-1 text-[10px] font-bold uppercase tracking-[.2em] rounded-none data-[state=active]:bg-candera-obsidian data-[state=active]:text-white data-[state=active]:shadow-none py-3"
          >
            Scent Profile
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="specs" className="pt-4">
        <div className="rounded-xl border border-candera-stone/20 bg-candera-ash/40 px-6 py-6">
          <Eyebrow as="p" className="mb-5">
            Specifications
          </Eyebrow>
          <ul className="flex flex-col gap-3.5 p-0 list-none">
            {(isCandle
              ? [
                  { label: 'Size & Wax', value: '15 oz · Soy & beeswax blend' },
                  { label: 'Craftsmanship', value: 'Numbered vessel · Micro-batch cured' },
                  { label: 'Origin', value: 'Ships from California' },
                ]
              : [
                  { label: 'Provenance', value: 'Vintage find' },
                  { label: 'Condition', value: 'Excellent vintage condition' },
                  { label: 'Origin', value: 'Ships from California' },
                ]
            ).map(({ label, value }) => (
              <li key={label} className="flex justify-between items-baseline gap-4 text-[13px]">
                <span className="font-semibold text-candera-obsidian shrink-0">{label}</span>
                <span className="text-candera-sage-text text-right">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>

      {isCandle && hasScent && (
        <TabsContent value="scent" className="pt-4">
          <FragranceProfile profile={scentProfile} burnTime={burnTime} atmosphere={atmosphere} />
        </TabsContent>
      )}
    </Tabs>
  )
}
