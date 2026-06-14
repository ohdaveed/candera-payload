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
    <div className="flex flex-col gap-6 w-full">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
        <div className="flex items-center border border-candera-stone/30 bg-[#171717]/40 p-1 focus-within:border-candera-vellum transition-all duration-300">
          <input
            id="ic-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-label="Email address"
            className="flex-1 bg-transparent px-6 py-2.5 text-candera-vellum placeholder-candera-stone/50 font-sans text-sm outline-none border-none focus:outline-none focus:ring-0"
            spellCheck={false}
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
            className={`text-xs font-bold uppercase tracking-widest py-3 px-8 bg-candera-vellum text-candera-obsidian hover:bg-candera-ember hover:text-candera-obsidian transition-all ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
          >
            {isLoading ? '…' : 'Join'}
          </button>
        </div>
        {errors.email && (
          <p role="alert" className="font-sans text-xs text-candera-rose m-0 mt-2 px-4">
            {errors.email.message}
          </p>
        )}
        {error && (
          <p role="alert" className="font-sans text-xs text-candera-rose m-0 mt-2 px-4">
            {error}
          </p>
        )}
      </form>

      {/* All microcopy consolidated directly below the input */}
      <p className="font-sans text-xs m-0 text-candera-stone/50 px-4">
        Early access · Studio notes · No spam · Unsubscribe any time
      </p>
    </div>
  )
}
