'use client'

import React, { useState, useRef, useEffect } from 'react'

type Props = {
  title: string
  content: React.ReactNode
}

export const SectionTooltip: React.FC<Props> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const open = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const scheduleClose = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 300)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Help: ${title}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '1.5px solid var(--theme-elevation-500)',
          background: 'var(--theme-elevation-100)',
          color: 'var(--theme-elevation-800)',
          fontSize: '10px',
          fontWeight: 600,
          lineHeight: 1,
          cursor: 'pointer',
          flexShrink: 0,
          padding: 0,
          transition: 'border-color 150ms, color 150ms',
        }}
      >
        ?
      </button>

      {isOpen && (
        <div
          onMouseEnter={open}
          onMouseLeave={scheduleClose}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '0',
            zIndex: 50,
            minWidth: '260px',
            maxWidth: '320px',
            background: 'var(--theme-elevation-0)',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: '12px 14px',
            pointerEvents: 'auto',
          }}
        >
          {/* caret */}
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              left: '6px',
              transform: 'rotate(45deg)',
              width: '8px',
              height: '8px',
              background: 'var(--theme-elevation-0)',
              border: '1px solid var(--theme-elevation-150)',
              borderBottom: 'none',
              borderRight: 'none',
            }}
          />
          <p
            style={{
              margin: '0 0 6px 0',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--theme-elevation-800)',
            }}
          >
            {title}
          </p>
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--theme-text)',
              lineHeight: 1.55,
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
