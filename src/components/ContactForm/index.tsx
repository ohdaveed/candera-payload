'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getClientSideURL } from '@/utilities/getURL'

type FormValues = {
  'full-name': string
  email: string
  phone?: string
  message: string
}

type Props = {
  formId: string
}

export const ContactForm: React.FC<Props> = ({ formId }) => {
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
              submissionData: [
                { field: 'full-name', value: data['full-name'] },
                { field: 'email', value: data.email },
                { field: 'phone', value: data.phone || '' },
                { field: 'message', value: data.message },
              ],
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
      <section className="py-12 text-center">
        <p className="font-display text-2xl text-candera-obsidian mb-3 italic">
          Your note has been received.
        </p>
        <p className="font-sans text-sm text-candera-sage-text">
          We respond with intention — expect a reply within 48 hours.
        </p>
      </section>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <section
          className="mb-6 p-4 bg-candera-rose/10 text-candera-rose text-[13px] font-medium"
          role="alert"
          aria-live="polite"
        >
          {error}
        </section>
      )}

      <section className="flex flex-col gap-6">
        <section>
          <Label
            htmlFor="full-name"
            className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text"
          >
            Full Name{' '}
            <span className="text-candera-ember" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="full-name"
            type="text"
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!errors['full-name']}
            aria-describedby={errors['full-name'] ? 'full-name-error' : undefined}
            {...register('full-name', { required: 'Full name is required' })}
          />
          {errors['full-name'] && (
            <p id="full-name-error" className="mt-1.5 text-[12px] text-candera-rose">
              {errors['full-name'].message}
            </p>
          )}
        </section>

        <section>
          <Label
            htmlFor="contact-email"
            className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text"
          >
            Email{' '}
            <span className="text-candera-ember" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            })}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-[12px] text-candera-rose">
              {errors.email.message}
            </p>
          )}
        </section>

        <section>
          <Label
            htmlFor="phone"
            className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text"
          >
            Phone{' '}
            <span className="text-candera-stone/60 text-[10px] normal-case tracking-normal font-normal ml-1">
              (optional)
            </span>
          </Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            {...register('phone')}
          />
        </section>

        <section>
          <Label
            htmlFor="message"
            className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text"
          >
            Message{' '}
            <span className="text-candera-ember" aria-hidden="true">
              *
            </span>
          </Label>
          <Textarea
            id="message"
            rows={5}
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
            {...register('message', { required: 'Message is required' })}
          />
          {errors.message && (
            <p id="message-error" className="mt-1.5 text-[12px] text-candera-rose">
              {errors.message.message}
            </p>
          )}
        </section>
      </section>

      <section className="mt-8">
        <Button type="submit" variant="cta" size="cta" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send Correspondence'}
        </Button>
      </section>
    </form>
  )
}
