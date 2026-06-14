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
      <div className="flex flex-col gap-8">
        <p className="font-sans text-sm text-candera-vellum m-0">
          You&apos;re in. We&apos;ll be in touch before the next batch.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex">
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
            aria-label={isLoading ? 'Submitting…' : 'Join the inner circle'}
            aria-busy={isLoading}
            className={`text-xs font-bold uppercase tracking-widest py-3.5 px-8 bg-candera-vellum text-candera-obsidian border-0 whitespace-nowrap transition-opacity ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
          >
            {isLoading ? '…' : 'Join'}
          </button>
        </div>
        {errors.email && (
          <p role="alert" className="font-sans text-xs text-red-400 m-0 mt-1">
            {errors.email.message}
          </p>
        )}
        {error && (
          <p role="alert" className="font-sans text-xs text-red-400 m-0 mt-1">
            {error}
          </p>
        )}
      </form>

      {/* All microcopy consolidated directly below the input */}
      <p className="font-sans text-xs m-0 text-candera-stone/50">
        Early access · Studio notes · No spam · Unsubscribe any time
      </p>
    </div>
  )
}
