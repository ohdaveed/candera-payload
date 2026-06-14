'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { getClientSideURL } from '@/utilities/getURL'

type FormValues = { email: string }

type Props = {
  formId: string
}

export const InnerCircleEmailForm: React.FC<Props> = ({ formId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = useCallback(
    (data: FormValues) => {
      const submit = async () => {
        setError(undefined)
        setIsLoading(true)

        try {
          const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              form: formId,
              submissionData: [{ field: 'email', value: data.email }],
            }),
          })

          if (res.status >= 400) {
            const json = await res.json()
            setError(json.errors?.[0]?.message || 'Something went wrong. Please try again.')
            setIsLoading(false)
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)
        } catch {
          setError('Something went wrong. Please try again.')
          setIsLoading(false)
        }
      }

      void submit()
    },
    [formId],
  )

  if (hasSubmitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p className="font-sans text-[13px] text-candera-vellum m-0">
          You&apos;re in. We&apos;ll be in touch before the next batch.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'flex' }}>
          <input
            id="ic-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-label="Email address"
            className="ic-email-input"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            })}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '13px 24px',
              background: '#f5f5f5',
              color: '#0a0a0a',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? '…' : 'Join'}
          </button>
        </div>
        {errors.email && (
          <p className="font-sans text-[10px] text-red-400 m-0 mt-1">{errors.email.message}</p>
        )}
        {error && <p className="font-sans text-[10px] text-red-400 m-0 mt-1">{error}</p>}
      </form>

      {/* All microcopy consolidated directly below the input */}
      <p className="font-sans text-[10px] m-0" style={{ color: '#525252' }}>
        Early access · Studio notes · No spam · Unsubscribe any time
      </p>
    </div>
  )
}
