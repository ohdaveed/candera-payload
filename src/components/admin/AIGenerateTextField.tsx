'use client'

import { useState } from 'react'
import type {
  TextFieldClientComponent,
  TextFieldClientProps,
  TextareaFieldClientComponent,
  TextareaFieldClientProps,
} from 'payload'
import { useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import {
  AI_ID_SUFFIX_PATTERN,
  AI_SENSITIVE_NAME_PATTERN,
  type FieldCopyInput,
  type FieldCopyOutput,
} from '@/lib/ai/field-copy'

/**
 * `afterInput` controls that add a small "Generate with AI" button beneath the
 * default text/textarea inputs. Injected across the config by
 * `src/utilities/withAIGeneration.ts` — no field opts in individually.
 * Rendered via `admin.components.afterInput` (not a `Field` replacement) so the
 * default field keeps its own root element — labels, `admin.width`, and row
 * layouts are untouched.
 */

const MAX_CONTEXT_ENTRIES = 30
const MAX_CONTEXT_VALUE_LENGTH = 400
const MAX_DESCRIPTION_LENGTH = 500 // matches fieldCopyInputSchema.fieldDescription

function labelToString(label: unknown, fallback: string): string {
  if (typeof label === 'string' && label.length > 0) return label
  if (label && typeof label === 'object') {
    const first = Object.values(label).find((v): v is string => typeof v === 'string')
    if (first) return first
  }
  return fallback
}

/** Flatten form data into `dot.path: value` string entries usable as prompt context. */
function collectContext(data: unknown, excludePath: string): Record<string, string> {
  const context: Record<string, string> = {}

  function walk(value: unknown, path: string): void {
    if (Object.keys(context).length >= MAX_CONTEXT_ENTRIES) return

    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim()
      if (
        text.length > 0 &&
        path !== excludePath &&
        !AI_SENSITIVE_NAME_PATTERN.test(path) &&
        !AI_ID_SUFFIX_PATTERN.test(path)
      ) {
        context[path.slice(0, 200)] = text.slice(0, MAX_CONTEXT_VALUE_LENGTH)
      }
      return
    }

    if (Array.isArray(value)) {
      value.slice(0, 5).forEach((item, i) => walk(item, `${path}.${i}`))
      return
    }

    if (value && typeof value === 'object') {
      // Lexical rich text values are deep trees — skip them wholesale.
      if ('root' in (value as Record<string, unknown>)) return
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, path ? `${path}.${key}` : key)
      }
    }
  }

  walk(data, '')
  return context
}

/** Minimal structural view of the client field config — shared by text and textarea. */
type AIControlsField = {
  admin?: { description?: unknown }
  label?: unknown
  maxLength?: number
  name?: string
}

type AIControlsProps = {
  path: string
  field: AIControlsField
  variant: 'text' | 'textarea'
}

function AIGenerateControls({ path, field, variant }: AIControlsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const { setValue, value } = useField<string>({ path })
  const { getData } = useForm()
  const { collectionSlug, globalSlug } = useDocumentInfo()

  const name = typeof field.name === 'string' && field.name ? field.name : path
  const fieldLabel = labelToString(field.label, name)
  const description =
    typeof field.admin?.description === 'string'
      ? field.admin.description.slice(0, MAX_DESCRIPTION_LENGTH)
      : undefined
  const maxLength = typeof field.maxLength === 'number' ? field.maxLength : undefined

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    setSuggestion(null)

    try {
      const data = typeof getData === 'function' ? getData() : {}
      const input: FieldCopyInput = {
        fieldLabel,
        fieldName: name,
        fieldDescription: description,
        entityLabel: collectionSlug ?? globalSlug ?? undefined,
        variant,
        maxLength,
        currentValue: typeof value === 'string' && value ? value.slice(0, 5_000) : undefined,
        context: collectContext(data, path),
      }

      const res = await fetch('/next/ai/generate-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        // Surface the server's human-readable error when it sends one.
        let message = `Request failed: ${res.status}`
        try {
          const errorBody = (await res.json()) as { error?: unknown }
          if (typeof errorBody?.error === 'string') message = errorBody.error
        } catch {
          // Non-JSON error body — keep the status-code message.
        }
        throw new Error(message)
      }
      const result = (await res.json()) as FieldCopyOutput
      setSuggestion(result.suggestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  function applySuggestion() {
    if (suggestion !== null) setValue(suggestion)
    setSuggestion(null)
  }

  return (
    <div style={{ marginTop: '0.25rem', fontSize: 'var(--theme-font-size-xs)' }}>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '0.15rem 0.5rem',
          fontSize: 'var(--theme-font-size-xs)',
          borderRadius: '4px',
          border: '1px solid var(--theme-elevation-150)',
          background: 'var(--theme-elevation-50)',
          color: 'var(--theme-elevation-600)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {loading ? 'Generating…' : '✦ Generate with AI'}
      </button>

      {error && (
        <span style={{ marginLeft: '0.5rem', color: 'var(--theme-error-500)' }}>
          {error}{' '}
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--theme-font-size-xs)',
              color: 'inherit',
              padding: 0,
            }}
          >
            Retry
          </button>
        </span>
      )}

      {suggestion !== null && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            border: '1px solid var(--theme-elevation-100)',
            borderRadius: '4px',
            background: 'var(--theme-elevation-50)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ whiteSpace: 'pre-wrap' }}>{suggestion}</span>
          <span style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={applySuggestion}
              style={{
                padding: '0.15rem 0.5rem',
                fontSize: 'var(--theme-font-size-xs)',
                borderRadius: '4px',
                border: '1px solid var(--theme-elevation-150)',
                background: 'var(--theme-elevation-100)',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setSuggestion(null)}
              style={{
                padding: '0.15rem 0.5rem',
                fontSize: 'var(--theme-font-size-xs)',
                borderRadius: '4px',
                border: '1px solid var(--theme-elevation-150)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Dismiss
            </button>
          </span>
        </div>
      )}
    </div>
  )
}

export const AITextAfterInput: TextFieldClientComponent = (props: TextFieldClientProps) => {
  if (!props?.path || props.readOnly) return null
  return <AIGenerateControls path={props.path} field={props.field} variant="text" />
}

export const AITextareaAfterInput: TextareaFieldClientComponent = (
  props: TextareaFieldClientProps,
) => {
  if (!props?.path || props.readOnly) return null
  return <AIGenerateControls path={props.path} field={props.field} variant="textarea" />
}
