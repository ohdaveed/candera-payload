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

const ClockIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

export const FragranceProfile: React.FC<Props> = ({ profile, burnTime, atmosphere }) => {
  if (!profile?.top && !profile?.heart && !profile?.base && !burnTime) return null

  const tiers = [
    { label: 'Top', value: profile?.top },
    { label: 'Heart', value: profile?.heart },
    { label: 'Base', value: profile?.base },
  ]

  return (
    <div className="border-t border-candera-stone/40 pt-3 mt-3">
      <p className="text-[9px] font-bold uppercase tracking-[.22em] text-candera-sage mb-2">
        Fragrance Profile
      </p>
      <div className="grid grid-cols-3 gap-1 mb-2">
        {tiers.map(({ label, value }) => (
          value ? (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-candera-sage">{label}</span>
              <span className="text-[11px] text-candera-obsidian leading-tight">{value}</span>
            </div>
          ) : null
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-1">
        {burnTime && (
          <span className="flex items-center gap-1 text-[10px] text-candera-sage-text">
            <ClockIcon />
            {burnTime}
          </span>
        )}
        {atmosphere && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-candera-sage-text">
            {atmosphere}
          </span>
        )}
      </div>
    </div>
  )
}
