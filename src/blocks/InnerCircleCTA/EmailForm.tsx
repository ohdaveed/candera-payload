'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      <p className="font-display text-xl text-candera-obsidian italic">
        You&apos;re in the circle.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-[400px]">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Your email address"
            autoComplete="email"
            aria-label="Email address"
            aria-required="true"
            aria-invalid={!!errors.email}
            className="bg-white border-candera-stone/40 text-candera-obsidian placeholder:text-candera-stone/60"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            })}
          />
        </div>
        <Button type="submit" variant="cta" size="cta" disabled={isLoading}>
          {isLoading ? 'Joining…' : 'Join the Circle'}
        </Button>
      </div>
      {errors.email && (
        <p className="mt-2 text-[12px] text-candera-rose" role="alert">
          {errors.email.message}
        </p>
      )}
      {error && (
        <p className="mt-2 text-[12px] text-candera-rose" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  )
}
