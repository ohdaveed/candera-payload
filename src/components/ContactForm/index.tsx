'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { MinimalInput } from '@/components/ui/MinimalInput'
import { MinimalTextarea } from '@/components/ui/MinimalTextarea'
import { SubmitButton } from '@/components/ui/SubmitButton'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { submitForm } from '@/app/actions/submitForm'
import { EMAIL_PATTERN } from '@/constants/validation'
import { TurnstileWidget } from '@/components/TurnstileWidget'

type FormValues = {
  'full-name': string
  email: string
  phone?: string
  message: string
  _gotcha?: string
}

type Props = {
  formId: number
}

export const ContactForm: React.FC<Props> = ({ formId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()

  const form = useForm<FormValues>({
    defaultValues: {
      'full-name': '',
      email: '',
      phone: '',
      message: '',
      _gotcha: '',
    },
  })

  const { control, handleSubmit, register } = form

  const onSubmit = useCallback(
    (data: FormValues) => {
      const submit = async () => {
        setError(undefined)
        setIsLoading(true)

        try {
          const result = await submitForm(
            formId,
            [
              { field: 'full-name', value: data['full-name'] },
              { field: 'email', value: data.email },
              { field: 'phone', value: data.phone || '' },
              { field: 'message', value: data.message },
            ],
            { turnstileToken, honeypot: data._gotcha },
          )

          setIsLoading(false)

          if (!result.ok) {
            setError(result.error)
            return
          }

          setHasSubmitted(true)
        } catch (err) {
          console.error('[ContactForm] Server Action failed:', err)
          setIsLoading(false)
          setError('Something went wrong. Please try again.')
        }
      }

      void submit()
    },
    [formId, turnstileToken],
  )

  if (hasSubmitted) {
    return (
      <div className="py-12 text-center">
        <p className="h3 mb-3 m-0">Your note has been received.</p>
        <p className="body text-candera-sage-text m-0 mt-2">
          We respond with intention — expect a reply within 48 hours.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <div
            className="mb-6 p-4 border border-candera-ember-strong/30 bg-candera-ember-strong/5 text-candera-ember-strong text-sm font-medium"
            role="alert"
          >
            {error}
          </div>
        )}

        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          {...register('_gotcha')}
        />

        <div className="flex flex-col gap-8">
          <FormField
            control={control}
            name="full-name"
            rules={{ required: 'Full name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">
                  Full Name{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <MinimalInput placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-sm text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Please enter a valid email' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">
                  Email{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <MinimalInput
                    placeholder="email@example.com"
                    autoComplete="email"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1.5 text-sm text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">
                  Phone
                  <span className="text-candera-sage-text text-xs normal-case tracking-normal font-normal ml-1">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <MinimalInput
                    placeholder="(555) 000-0000"
                    autoComplete="tel"
                    inputMode="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1.5 text-sm text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="message"
            rules={{ required: 'Message is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label">
                  Message{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <MinimalTextarea placeholder="How can we help?" rows={5} {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-sm text-candera-ember-strong" />
              </FormItem>
            )}
          />
        </div>

        <TurnstileWidget
          className="mt-6"
          onSuccess={setTurnstileToken}
          onExpire={() => setTurnstileToken(undefined)}
        />

        <div className="mt-8">
          <SubmitButton disabled={isLoading || !turnstileToken}>
            {isLoading ? 'Sending…' : 'Send Correspondence'}
          </SubmitButton>
        </div>
      </form>
    </Form>
  )
}
