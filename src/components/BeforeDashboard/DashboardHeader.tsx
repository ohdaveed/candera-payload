import React from 'react'

export const DashboardHeader: React.FC = () => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h1
        suppressHydrationWarning
        style={{
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: '1.75rem',
          color: 'var(--theme-text)',
          margin: '0 0 0.25rem 0',
          lineHeight: 1.2,
        }}
      >
        {greeting}
      </h1>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--theme-elevation-700)',
          margin: 0,
          letterSpacing: '0.02em',
        }}
      >
        Candera Candles — Store Dashboard
      </p>
    </div>
  )
}
