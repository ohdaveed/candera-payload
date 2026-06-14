'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@payloadcms/ui'
import { THEME_PRESETS } from './themePresets'
import { SectionTooltip } from './SectionTooltip'
import type { SiteThemeSettings } from '@/utilities/siteTheme'

function presetsMatch(settings: SiteThemeSettings, presetId: string): boolean {
  const preset = THEME_PRESETS.find((p) => p.id === presetId)
  if (!preset) return false
  return (
    settings.colorScheme === preset.settings.colorScheme &&
    settings.fontSet === preset.settings.fontSet &&
    settings.heroLayout === preset.settings.heroLayout &&
    settings.sectionMood === preset.settings.sectionMood &&
    settings.ctaStyle === preset.settings.ctaStyle
  )
}

export function ThemePresetSwitcher() {
  const { token } = useAuth()
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [currentProductCardDensity, setCurrentProductCardDensity] =
    useState<SiteThemeSettings['productCardDensity']>('boutique-grid')

  useEffect(() => {
    if (!token) return
    fetch('/api/globals/site-theme', {
      headers: { Authorization: `JWT ${token}` },
    })
      .then((r) => r.json())
      .then((data: SiteThemeSettings) => {
        setCurrentProductCardDensity(data.productCardDensity ?? 'boutique-grid')
        const matched = THEME_PRESETS.find((p) => presetsMatch(data, p.id))
        setActivePresetId(matched?.id ?? null)
      })
      .catch(() => {})
      .finally(() => setIsFetching(false))
  }, [token])

  async function applyPreset(presetId: string) {
    const preset = THEME_PRESETS.find((p) => p.id === presetId)
    if (!preset || !token) return

    setLoadingId(presetId)
    setError(null)

    try {
      const res = await fetch('/api/globals/site-theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify({
          ...preset.settings,
          productCardDensity: currentProductCardDensity,
        }),
      })

      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      setActivePresetId(presetId)
    } catch {
      setError('Failed to apply theme preset — try again')
    } finally {
      setLoadingId(null)
    }
  }

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
          Site Theme
        </h2>
        <SectionTooltip
          title="Site Theme"
          content={
            <>
              <p style={{ margin: '0 0 6px 0' }}>
                Apply a curated look to your storefront with one click.
              </p>
              <ul style={{ margin: '0 0 6px 0', paddingLeft: '1rem' }}>
                <li>
                  <strong>Warm Botanical</strong> — earthy tones, serif type
                </li>
                <li>
                  <strong>Ink &amp; Orchid</strong> — bold contrast, editorial feel
                </li>
                <li>
                  <strong>Lavender Noir</strong> — soft purple with dark accents
                </li>
                <li>
                  <strong>Dark Luxe</strong> — rich dark palette for premium look
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                Your product card density setting is preserved when switching presets. For granular
                control, visit{' '}
                <Link
                  href="/admin/globals/site-theme"
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Site Theme settings
                </Link>
                .
              </p>
            </>
          }
        />
      </div>

      {isFetching ? (
        <div
          style={{ padding: '12px 0', fontSize: '0.8125rem', color: 'var(--theme-elevation-500)' }}
        >
          Loading current theme…
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {THEME_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id
            const isLoading = loadingId === preset.id
            const isDisabled = loadingId !== null

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => !isDisabled && applyPreset(preset.id)}
                onKeyDown={(e) => {
                  if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    void applyPreset(preset.id)
                  }
                }}
                disabled={isDisabled}
                aria-pressed={isActive}
                aria-label={`Apply ${preset.name} theme`}
                style={{
                  position: 'relative',
                  padding: '0.875rem',
                  borderRadius: '6px',
                  border: isActive
                    ? '2px solid var(--theme-success-500, #22c55e)'
                    : '1px solid var(--theme-elevation-150)',
                  background: isActive
                    ? 'var(--theme-elevation-50)'
                    : 'var(--theme-elevation-0, transparent)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isLoading ? 0.5 : 1,
                  textAlign: 'left',
                  transition: 'border-color 0.15s, opacity 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled && !isActive) {
                    e.currentTarget.style.background = 'var(--theme-elevation-50)'
                    e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive && !isDisabled) {
                    e.currentTarget.style.background = 'var(--theme-elevation-0, transparent)'
                    e.currentTarget.style.borderColor = 'var(--theme-elevation-150)'
                  }
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid var(--theme-elevation-300)',
                        borderTopColor: 'var(--theme-text)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'payload-spin 0.7s linear infinite',
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {preset.swatchColors.map((color, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: color,
                        border: '1px solid rgba(0,0,0,0.12)',
                        display: 'inline-block',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                <p
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    marginBottom: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {preset.name}
                </p>
                <p
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--theme-elevation-500)',
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {preset.description}
                </p>

                {isActive && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      marginTop: 8,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      background:
                        'color-mix(in srgb, var(--theme-success-500, #22c55e) 12%, transparent)',
                      color: 'var(--theme-success-500, #22c55e)',
                    }}
                  >
                    ✓ Active
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--theme-error-500)',
          }}
        >
          {error}
        </p>
      )}

      <style>{`@keyframes payload-spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}
