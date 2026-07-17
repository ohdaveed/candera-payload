'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { EMAIL_PATTERN } from '@/constants/validation'
import { TurnstileWidget } from '@/components/TurnstileWidget'

type FormValues = { email: string; _gotcha?: string }

type Props = {
  formId: string
}

export const InnerCircleEmailForm: React.FC<Props> = ({ formId }) => {
  const { isLoading, hasSubmitted, error, submit } = useFormSubmission()
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = useCallback(
    (data: FormValues) => {
      void submit(formId, [{ field: 'email', value: data.email }], turnstileToken, data._gotcha)
    },
    [formId, submit, turnstileToken],
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
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register('_gotcha')}
        />

        <div className="flex flex-col sm:flex-row sm:items-center border border-candera-stone/50 bg-candera-obsidian/40 p-1 focus-within:border-candera-vellum transition-all duration-300">
          <input
            id="ic-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-label="Email address"
            className="flex-1 bg-transparent px-6 py-2.5 text-candera-vellum placeholder-candera-stone/50 font-sans text-sm outline-none border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-candera-obsidian"
            spellCheck={false}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Please enter a valid email' },
            })}
          />
          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            aria-label={
              isLoading ? 'Submitting…' : !turnstileToken ? 'Verifying…' : 'Join the Circle'
            }
            aria-busy={isLoading}
            className={`w-full sm:w-auto text-xs font-bold uppercase tracking-widest py-3 px-8 bg-candera-vellum text-candera-obsidian hover:bg-candera-ember hover:text-candera-obsidian transition-all focus-visible:outline-1 focus-visible:outline-candera-ember focus-visible:ring-4 focus-visible:ring-candera-ember/50 ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer opacity-100'}`}
          >
            {isLoading ? '…' : !turnstileToken ? 'Verifying…' : 'Join the Circle'}
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

        <TurnstileWidget
          className="mt-4 px-4"
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(undefined)}
        />
      </form>

      <p className="font-sans text-xs m-0 text-candera-stone/50 px-4">
        Early access · Studio notes · No spam · Unsubscribe any time ·{' '}
        <Link
          href="/privacy-policy"
          className="underline underline-offset-2 hover:text-candera-vellum/60 transition-colors"
        >
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
