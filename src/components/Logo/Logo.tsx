import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    <svg
      width="140"
      height="28"
      viewBox="0 0 140 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('max-w-[9.375rem] w-full', className)}
      aria-label="Candera Candles"
    >
      <text
        x="0"
        y="22"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="20"
        fontStyle="italic"
        fontWeight="400"
        fill="currentColor"
        letterSpacing="0.05em"
      >
        Candera
      </text>
    </svg>
  )
}

export const LogoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="C"
  >
    <rect x="10" y="2" width="4" height="20" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="7" y="4" width="10" height="16" rx="2" fill="currentColor" opacity="0.7" />
    <rect x="10" y="4" width="4" height="12" rx="1" fill="currentColor" />
    <ellipse cx="12" cy="20" rx="3" ry="1.5" fill="currentColor" opacity="0.3" />
  </svg>
)
