import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
    <div className="border-t border-candera-stone/40 pt-8 mt-2">
      <p className="text-[9px] font-bold uppercase tracking-[.28em] text-candera-sage-text mb-5">
        Fragrance Profile
      </p>

      {/* Notes grid */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {tiers.map(({ label, value }) => (
            <Card key={label} className="bg-candera-ash/60 border-candera-stone/20 rounded-sm">
              <CardContent className="px-3 py-3 flex flex-col gap-1 text-center p-0">
                <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
                  {label}
                </span>
                <span className="text-[12px] font-medium text-candera-obsidian leading-tight">
                  {value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meta row: burn time + atmosphere */}
      <div className="flex items-center gap-3">
        {burnTime && (
          <Card className="flex-1 bg-candera-ash/60 border-candera-stone/20 rounded-sm">
            <CardContent className="px-3 py-3 flex flex-col gap-1 text-center p-0">
              <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
                Burn Time
              </span>
              <span className="text-[12px] font-medium text-candera-obsidian">{burnTime}</span>
            </CardContent>
          </Card>
        )}
        {atmosphereDisplay && (
          <Card className="flex-1 bg-candera-ash/60 border-candera-stone/20 rounded-sm">
            <CardContent className="px-3 py-3 flex flex-col gap-1 text-center p-0">
              <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
                Atmosphere
              </span>
              <span className="text-[12px] font-medium text-candera-obsidian leading-tight">
                {atmosphereDisplay}
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
