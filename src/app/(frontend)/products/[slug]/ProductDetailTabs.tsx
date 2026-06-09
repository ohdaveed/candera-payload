'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FragranceProfile } from '@/components/FragranceProfile'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Card, CardContent } from '@/components/ui/card'

import type { ScentProfile as ScentProfileType } from '@/payload-types'

type ScentProfile =
  | {
      top?: string | null
      heart?: string | null
      base?: string | null
    }
  | null
  | undefined

type ProductDetailTabsProps = {
  title?: string | null
  scentProfile?: ScentProfile
  burnTime?: string | null
  atmosphere?: string | number | ScentProfileType | null
  productType?: 'candle' | 'vintage' | 'custom'
  specifications?: Array<{ label: string; value: string }> | null
}

export function ProductDetailTabs({
  title,
  scentProfile,
  burnTime,
  atmosphere,
  productType = 'candle',
  specifications,
}: ProductDetailTabsProps) {
  const isCandle = productType === 'candle' && !title?.toLowerCase().includes('metal')
  const hasScent = scentProfile?.top || scentProfile?.heart || scentProfile?.base

  // Determine which specs to show
  const displaySpecs =
    specifications && specifications.length > 0
      ? specifications
      : isCandle
        ? [
            { label: 'Size & Wax', value: '15 oz · Soy & beeswax blend' },
            { label: 'Craftsmanship', value: 'Hand-labeled · Micro-batch cured' },
            { label: 'Origin', value: 'Ships from California' },
          ]
        : title?.toLowerCase().includes('metal') || productType === 'custom'
          ? [
              { label: 'Material', value: 'Artisan hand-cut metal' },
              { label: 'Finish', value: 'Industrial matte black' },
              { label: 'Origin', value: 'Ships from California' },
            ]
          : productType === 'vintage'
            ? [
                { label: 'Provenance', value: 'Vintage find' },
                { label: 'Condition', value: 'Excellent vintage condition' },
                { label: 'Origin', value: 'Ships from California' },
              ]
            : [
                { label: 'Craftsmanship', value: 'Artisan crafted' },
                { label: 'Origin', value: 'Ships from California' },
              ]

  return (
    <Tabs defaultValue="specs" className="mt-32">
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
        <Card className="rounded-xl border border-candera-stone/20 bg-candera-ash/40 overflow-hidden">
          <CardContent className="px-6 py-6">
            <Eyebrow as="p" className="mb-5">
              Specifications
            </Eyebrow>
            <ul className="flex flex-col gap-3.5 p-0 list-none">
              {displaySpecs.map(({ label, value }) => (
                <li key={label} className="flex justify-between items-baseline gap-4 text-[13px]">
                  <span className="font-semibold text-candera-obsidian shrink-0">{label}</span>
                  <span className="text-candera-sage-text text-right">{value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      {isCandle && hasScent && (
        <TabsContent value="scent" className="pt-4">
          <FragranceProfile profile={scentProfile} burnTime={burnTime} atmosphere={atmosphere} />
        </TabsContent>
      )}
    </Tabs>
  )
}
