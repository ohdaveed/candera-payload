import React from 'react'

type MetricCardProps = {
  label: string
  value: number
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '1rem',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '6px',
        background: 'var(--theme-elevation-0)',
      }}
    >
      <span
        style={{
          fontSize: '1.75rem',
          fontWeight: 500,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--theme-text)',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--theme-elevation-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </span>
    </div>
  )
}
