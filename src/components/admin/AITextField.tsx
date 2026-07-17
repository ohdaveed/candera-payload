'use client'

import { useCallback, useState } from 'react'
import { TextField, TextareaField, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps, TextareaFieldClientProps } from 'payload'
import type { FieldGenerationOutput } from '@/lib/ai/field-copy'

/**
 * Wraps Payload's default text/textarea fields with an AI generate loop:
 * generate → review the suggestion → regenerate or accept. Injected into
 * every eligible text field by `src/plugins/aiTextFields.ts`.
 */

type SharedProps = TextFieldClientProps | TextareaFieldClientProps

function toPlainString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function AIGenerateLoop({
  props,
  fieldType,
}: {
  props: SharedProps
  fieldType: 'text' | 'textarea'
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const { path, field } = props
  const { collectionSlug, globalSlug } = useDocumentInfo()
  const { setValue, value } = useField<string>({ path })
  const documentTitle = useFormFields(([fields]) => toPlainString(fields?.['title']?.value))

  const fieldLabel = typeof field.label === 'string' ? field.label : field.name || path
  const description = typeof field.admin?.description === 'string' ? field.admin.description : ''

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/next/ai/generate-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: collectionSlug || globalSlug || 'document',
          fieldLabel,
          fieldPath: path,
          fieldType,
          description: description || undefined,
          documentTitle: documentTitle || undefined,
          currentValue: value || undefined,
          tone: 'poetic',
        }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Request failed: ${res.status}`)
      }

      const data = (await res.json()) as FieldGenerationOutput
      setSuggestion(data.suggestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }, [collectionSlug, globalSlug, fieldLabel, path, fieldType, description, documentTitle, value])

  function acceptSuggestion() {
    if (suggestion) setValue(suggestion)
    setSuggestion(null)
  }

  const smallButtonStyle: React.CSSProperties = {
    padding: '0.15rem 0.6rem',
    fontSize: '0.7rem',
    borderRadius: '4px',
    border: '1px solid var(--theme-elevation-150)',
    background: 'var(--theme-elevation-100)',
    cursor: 'pointer',
  }

  return (
    <div style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
      {!suggestion && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            aria-label={`Generate ${fieldLabel} with AI`}
            style={{
              ...smallButtonStyle,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Generating…' : '✨ Generate with AI'}
          </button>
          {error && (
            <span style={{ color: 'var(--theme-error-500)' }}>
              {error}{' '}
              <button
                type="button"
                onClick={handleGenerate}
                style={{
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  padding: 0,
                }}
              >
                Retry
              </button>
            </span>
          )}
        </div>
      )}

      {suggestion && (
        <div
          style={{
            padding: '0.5rem 0.65rem',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            background: 'var(--theme-elevation-50)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}
        >
          <div style={{ color: 'var(--theme-text)' }}>{suggestion}</div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={acceptSuggestion}
              style={{ ...smallButtonStyle, fontWeight: 700 }}
            >
              Accept
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              style={{
                ...smallButtonStyle,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Regenerating…' : 'Regenerate'}
            </button>
            <button type="button" onClick={() => setSuggestion(null)} style={smallButtonStyle}>
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AITextField(props: TextFieldClientProps) {
  return (
    <div>
      <TextField {...props} />
      {!props.readOnly && <AIGenerateLoop props={props} fieldType="text" />}
    </div>
  )
}

export function AITextareaField(props: TextareaFieldClientProps) {
  return (
    <div>
      <TextareaField {...props} />
      {!props.readOnly && <AIGenerateLoop props={props} fieldType="textarea" />}
    </div>
  )
}
