'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
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
import { useFormSubmission } from '@/hooks/useFormSubmission'
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
  const { isLoading, hasSubmitted, error, submit } = useFormSubmission()
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
  const successRef = useRef<HTMLOutputElement>(null)

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
      void submit(
        formId,
        [
          { field: 'full-name', value: data['full-name'] },
          { field: 'email', value: data.email },
          { field: 'phone', value: data.phone || '' },
          { field: 'message', value: data.message },
        ],
        turnstileToken,
        data._gotcha,
      )
    },
    [formId, submit, turnstileToken],
  )

  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.focus()
    }
  }, [hasSubmitted])

  if (hasSubmitted) {
    return (
      <output
        ref={successRef}
        aria-live="polite"
        tabIndex={-1}
        className="block py-12 text-center outline-none focus-visible:ring-4 focus-visible:ring-candera-ember/50 focus-visible:ring-offset-2 rounded-sm"
      >
        <p className="h3 mb-3 m-0">Your note has been received.</p>
        <p className="body text-candera-sage-text m-0 mt-2">
          We respond with intention — expect a reply within 48 hours.
        </p>
      </output>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <div
            className="mb-6 p-4 border border-candera-ember-strong/30 bg-candera-vellum text-candera-ember-strong text-sm font-medium"
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

        <p className="caption text-candera-sage-text mb-6">
          Fields marked{' '}
          <span className="text-candera-ember" aria-hidden="true">
            *
          </span>{' '}
          are required.
        </p>

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
                  <MinimalInput
                    placeholder="Your name"
                    autoComplete="name"
                    aria-required="true"
                    {...field}
                  />
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
                    aria-required="true"
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
                  <MinimalTextarea
                    placeholder="How can we help?"
                    rows={5}
                    aria-required="true"
                    {...field}
                  />
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
          <SubmitButton
            disabled={isLoading || !turnstileToken}
            aria-describedby={!turnstileToken ? 'contact-turnstile-pending' : undefined}
          >
            {isLoading ? 'Sending…' : 'Send Correspondence'}
          </SubmitButton>
          {!turnstileToken && (
            <p
              id="contact-turnstile-pending"
              className="caption text-candera-sage-text mt-3"
              aria-live="polite"
            >
              Verifying you&rsquo;re human…
            </p>
          )}
        </div>
      </form>
    </Form>
  )
}
