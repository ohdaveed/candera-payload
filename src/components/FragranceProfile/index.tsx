import React from 'react'
import type { ScentProfile as ScentProfileType } from '@/payload-types'

type ScentProfile = {
  top?: string | null
  heart?: string | null
  base?: string | null
}

type Props = {
  profile?: ScentProfile | null
  burnTime?: string | null
  atmosphere?: string | number | ScentProfileType | null
}

const tierMeta: Record<string, string> = {
  Top: 'first breath',
  Heart: 'full bloom',
  Base: 'lasting memory',
}

export const FragranceProfile: React.FC<Props> = ({ profile, burnTime, atmosphere }) => {
  if (!profile?.top && !profile?.heart && !profile?.base && !burnTime && !atmosphere) return null

  const tiers = [
    { label: 'Top', value: profile?.top },
    { label: 'Heart', value: profile?.heart },
    { label: 'Base', value: profile?.base },
  ].filter((t) => t.value)

  const atmosphereDisplay =
    typeof atmosphere === 'object' ? (atmosphere as ScentProfileType)?.name : atmosphere

  return (
    <div className="pt-5">
      {tiers.length > 0 && (
        <div className="flex flex-col">
          {tiers.map(({ label, value }, i) => (
            <div
              key={label}
              className={`grid gap-4 py-4 ${i < tiers.length - 1 ? 'border-b border-candera-stone/15' : ''}`}
              style={{ gridTemplateColumns: '64px 1fr' }}
            >
              <div className="flex flex-col gap-0.5 pt-0.5">
                <span className="text-[8px] font-bold uppercase tracking-[.3em] text-candera-sage-text">
                  {label}
                </span>
                <span className="text-[9px] italic text-candera-sage-text font-serif whitespace-nowrap">
                  {tierMeta[label]}
                </span>
              </div>
              <span className="font-serif text-[14px] leading-snug text-candera-obsidian">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {(burnTime || atmosphereDisplay) && (
        <div
          className={`grid grid-cols-2 gap-4 pt-4 ${tiers.length > 0 ? 'border-t border-candera-stone/20 mt-1' : ''}`}
        >
          {burnTime && (
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold uppercase tracking-[.3em] text-candera-sage-text">
                Intention
              </span>
              <span className="font-serif text-[13px] text-candera-obsidian">{burnTime}</span>
            </div>
          )}
          {atmosphereDisplay && (
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold uppercase tracking-[.3em] text-candera-sage-text">
                Atmosphere
              </span>
              <span className="font-serif text-[13px] text-candera-obsidian">
                {atmosphereDisplay}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
