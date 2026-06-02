import React from 'react'

type ScentProfile = {
  top?: string | null
  heart?: string | null
  base?: string | null
}

type Props = {
  profile?: ScentProfile | null
  burnTime?: string | null
  atmosphere?: string | null
}

export const FragranceProfile: React.FC<Props> = ({ profile, burnTime, atmosphere }) => {
  if (!profile?.top && !profile?.heart && !profile?.base && !burnTime) return null

  const tiers = [
    { label: 'Top', value: profile?.top },
    { label: 'Heart', value: profile?.heart },
    { label: 'Base', value: profile?.base },
  ].filter((t) => t.value)

  return (
    <div className="border-t border-candera-stone/40 pt-8 mt-2">
      <p className="text-[9px] font-bold uppercase tracking-[.28em] text-candera-sage-text mb-5">
        Fragrance Profile
      </p>

      {/* Notes grid */}
      {tiers.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {tiers.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-candera-ash/60 border border-candera-stone/20 px-3 py-3 flex flex-col gap-1 text-center"
            >
              <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
                {label}
              </span>
              <span className="text-[12px] font-medium text-candera-obsidian leading-tight">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Meta row: burn time + atmosphere */}
      <div className="flex items-center gap-3">
        {burnTime && (
          <div className="flex-1 rounded-lg bg-candera-ash/60 border border-candera-stone/20 px-3 py-3 flex flex-col gap-1 text-center">
            <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
              Burn Time
            </span>
            <span className="text-[12px] font-medium text-candera-obsidian">
              {burnTime}
            </span>
          </div>
        )}
        {atmosphere && (
          <div className="flex-1 rounded-lg bg-candera-ash/60 border border-candera-stone/20 px-3 py-3 flex flex-col gap-1 text-center">
            <span className="text-[8px] font-bold uppercase tracking-[.2em] text-candera-sage-text">
              Atmosphere
            </span>
            <span className="text-[12px] font-medium text-candera-obsidian leading-tight">
              {atmosphere}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
