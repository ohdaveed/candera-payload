import React from 'react'

const BeforeLogin: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '0.75rem', opacity: 0.7 }}
      >
        <rect x="10" y="2" width="4" height="20" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="7" y="4" width="10" height="16" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="10" y="4" width="4" height="12" rx="1" fill="currentColor" />
        <ellipse cx="12" cy="20" rx="3" ry="1.5" fill="currentColor" opacity="0.3" />
      </svg>
      <p
        style={{
          fontFamily: 'var(--font-header)',
          fontStyle: 'italic',
          fontSize: '1.4rem',
          color: 'var(--theme-text)',
          letterSpacing: '-0.02em',
        }}
      >
        Candera Candles — Admin
      </p>
    </div>
  )
}

export default BeforeLogin
