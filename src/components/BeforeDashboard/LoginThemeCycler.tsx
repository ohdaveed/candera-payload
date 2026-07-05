'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@payloadcms/ui'
import { SectionTooltip } from './SectionTooltip'
import {
  LOGIN_THEME_COLORS,
  getLoginThemeColor,
  getNextLoginThemeIndex,
  normalizeLoginThemeIndex,
} from '@/utilities/loginTheme'

export function LoginThemeCycler() {
  const { token } = useAuth()
  const [colorIndex, setColorIndex] = useState(0)
  const [isFetching, setIsFetching] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetch('/api/globals/login-theme', {
      headers: { Authorization: `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data: { colorIndex?: number }) => {
        setColorIndex(normalizeLoginThemeIndex(data.colorIndex))
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [token])

  async function cycleToNextColor() {
    if (!token) return
    const nextIndex = getNextLoginThemeIndex(colorIndex)

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/globals/login-theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({ colorIndex: nextIndex }),
      })

      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      setColorIndex(nextIndex)
    } catch {
      setError('Failed to update login page color — try again')
    } finally {
      setIsLoading(false)
    }
  }

  const currentColor = getLoginThemeColor(colorIndex)
  const isDisabled = isFetching || isLoading

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
      >
        <h2
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--theme-elevation-700)',
            margin: 0,
          }}
        >
          Login Page Color
        </h2>
        <SectionTooltip
          title="Login Page Color"
          content={
            <p style={{ margin: 0 }}>
              Cycles the background color of the admin login page (the screen visitors see before
              signing in). Click &quot;Next color&quot; to advance through the{' '}
              {LOGIN_THEME_COLORS.length} preset colors.
            </p>
          }
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: currentColor,
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          onClick={cycleToNextColor}
          disabled={isDisabled}
          aria-label="Cycle to the next login page color"
          style={{
            padding: '0.5rem 0.875rem',
            borderRadius: '6px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0, transparent)',
            color: 'var(--theme-text)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Applying…' : 'Next color'}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--theme-error-500)' }}>
          {error}
        </p>
      )}
    </section>
  )
}
