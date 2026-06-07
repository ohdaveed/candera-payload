'use client'

import { useState } from 'react'
import { useField, useFormFields } from '@payloadcms/ui'
import type { ProductCopyOutput } from '@/lib/ai/product-copy'

type Tone = 'poetic' | 'minimal' | 'bold'

const TONES: { value: Tone; label: string }[] = [
  { value: 'poetic', label: 'Poetic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'bold', label: 'Bold' },
]

type FieldRow = {
  label: string
  key: keyof ProductCopyOutput
  accept: (v: string) => void
  current: string
}

export function GenerateCopyButton() {
  const [tone, setTone] = useState<Tone>('poetic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<ProductCopyOutput | null>(null)
  const [accepted, setAccepted] = useState<Set<keyof ProductCopyOutput>>(new Set())

  const { title, productType, atmosphere, burnTime, top, heart, base } = useFormFields(
    ([fields]) => ({
      title: fields['title']?.value as string | undefined,
      productType: fields['productType']?.value as string | undefined,
      atmosphere: fields['atmosphere']?.value as string | undefined,
      burnTime: fields['burnTime']?.value as string | undefined,
      top: fields['scentProfile.top']?.value as string | undefined,
      heart: fields['scentProfile.heart']?.value as string | undefined,
      base: fields['scentProfile.base']?.value as string | undefined,
    }),
  )

  const taglineField = useField<string>({ path: 'tagline' })
  const metaTitleField = useField<string>({ path: 'meta.title' })
  const metaDescField = useField<string>({ path: 'meta.description' })

  const canGenerate = !!title

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setSuggestions(null)
    setAccepted(new Set())

    try {
      const res = await fetch('/next/ai/generate-product-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          productType,
          scentProfile: { top, heart, base },
          atmosphere,
          burnTime,
          tone,
        }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = (await res.json()) as ProductCopyOutput
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function acceptField(key: keyof ProductCopyOutput, value: string) {
    if (key === 'tagline') taglineField.setValue(value)
    if (key === 'metaTitle') metaTitleField.setValue(value)
    if (key === 'metaDescription') metaDescField.setValue(value)
    setAccepted((prev) => new Set([...prev, key]))
  }

  const fieldRows: FieldRow[] = suggestions
    ? [
        {
          label: 'Tagline',
          key: 'tagline',
          accept: (v) => acceptField('tagline', v),
          current: taglineField.value ?? '',
        },
        {
          label: 'Meta Title',
          key: 'metaTitle',
          accept: (v) => acceptField('metaTitle', v),
          current: metaTitleField.value ?? '',
        },
        {
          label: 'Meta Description',
          key: 'metaDescription',
          accept: (v) => acceptField('metaDescription', v),
          current: metaDescField.value ?? '',
        },
      ]
    : []

  return (
    <div
      style={{
        padding: '1rem',
        marginTop: '1rem',
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: '4px',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.75rem',
          color: 'var(--theme-text)',
        }}
      >
        AI Copy Generator
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {TONES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTone(t.value)}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              borderRadius: '4px',
              border: '1px solid var(--theme-elevation-150)',
              background: tone === t.value ? 'var(--theme-elevation-200)' : 'transparent',
              cursor: 'pointer',
              fontWeight: tone === t.value ? 700 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate || loading}
        title={!canGenerate ? 'Add a title first' : undefined}
        style={{
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-100)',
          cursor: canGenerate && !loading ? 'pointer' : 'not-allowed',
          opacity: !canGenerate || loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Generating…' : 'Generate All'}
      </button>

      {error && (
        <div style={{ marginTop: '0.75rem', color: 'var(--theme-error-500)', fontSize: '0.8rem' }}>
          {error}{' '}
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {suggestions && (
        <div
          style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          {fieldRows.map((row) => {
            const suggestion = suggestions[row.key]
            const isAccepted = accepted.has(row.key)

            if (isAccepted) {
              return (
                <div
                  key={row.key}
                  style={{ fontSize: '0.75rem', color: 'var(--theme-success-500)' }}
                >
                  ✓ {row.label} applied
                </div>
              )
            }

            return (
              <div
                key={row.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'start',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                    {row.label} (current)
                  </div>
                  <div style={{ color: 'var(--theme-elevation-500)' }}>
                    {row.current || '— empty —'}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>Suggestion</div>
                  <div>{suggestion}</div>
                </div>
                <button
                  type="button"
                  onClick={() => row.accept(suggestion)}
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid var(--theme-elevation-150)',
                    background: 'var(--theme-elevation-100)',
                    cursor: 'pointer',
                    alignSelf: 'center',
                  }}
                >
                  Accept
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
