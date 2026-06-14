'use client'

import { useState } from 'react'
import { FragranceProfile } from '@/components/FragranceProfile'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { ScentProfile as ScentProfileType } from '@/payload-types'

type ScentProfile =
  | {
      top?: string | null
      heart?: string | null
      base?: string | null
    }
  | null
  | undefined

type Props = {
  title?: string | null
  vessel?: string | null
  scentProfile?: ScentProfile
  burnTime?: string | null
  atmosphere?: string | number | ScentProfileType | null
  productType?: 'candle' | 'vintage' | 'custom'
  specifications?: Array<{ label: string; value: string }> | null
}

function SectionToggle({
  label,
  open,
  onToggle,
}: {
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full group"
      aria-expanded={open}
    >
      <Eyebrow className="text-candera-sage-text tracking-[.28em]">{label}</Eyebrow>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-candera-sage-text transition-transform duration-300 group-hover:text-candera-obsidian ${open ? 'rotate-180' : 'rotate-0'}`}
        aria-hidden="true"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  )
}

export function ProductDetailSections({
  title: _title,
  vessel,
  scentProfile,
  burnTime,
  atmosphere,
  productType = 'candle',
  specifications,
}: Props) {
  const [specsOpen, setSpecsOpen] = useState(true)
  const [scentOpen, setScentOpen] = useState(true)

  const isCandle = productType === 'candle' && vessel !== 'metal'
  const hasScent = scentProfile?.top || scentProfile?.heart || scentProfile?.base

  const displaySpecs =
    specifications && specifications.length > 0
      ? specifications
      : isCandle
        ? [
            { label: 'Size & Wax', value: '15 oz · Soy & beeswax blend' },
            { label: 'Craftsmanship', value: 'Hand-labeled · Micro-batch cured' },
            { label: 'Origin', value: 'Ships from California' },
          ]
        : vessel === 'metal' || productType === 'custom'
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
    <div className="flex flex-col gap-0 border-t border-candera-stone/20 mt-2">
      {/* Specifications */}
      <div className="border-b border-candera-stone/20 py-5">
        <SectionToggle
          label="Specifications"
          open={specsOpen}
          onToggle={() => setSpecsOpen((v) => !v)}
        />
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${specsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <ul className="flex flex-col pt-4 list-none">
            {displaySpecs.map(({ label, value }) => (
              <li
                key={label}
                className="flex justify-between items-baseline gap-4 py-2.5 border-b border-candera-stone/10 last:border-b-0"
              >
                <span className="text-sm font-semibold text-candera-obsidian shrink-0">
                  {label}
                </span>
                <span className="text-sm text-candera-sage-text text-right">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fragrance Profile */}
      {isCandle && hasScent && (
        <div className="border-b border-candera-stone/20 py-5">
          <SectionToggle
            label="Fragrance Profile"
            open={scentOpen}
            onToggle={() => setScentOpen((v) => !v)}
          />
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${scentOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <FragranceProfile profile={scentProfile} burnTime={burnTime} atmosphere={atmosphere} />
          </div>
        </div>
      )}
    </div>
  )
}
