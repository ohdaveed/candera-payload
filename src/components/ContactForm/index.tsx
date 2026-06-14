'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { submitForm } from '@/app/actions/submitForm'

type FormValues = {
  'full-name': string
  email: string
  phone?: string
  message: string
}

type Props = {
  formId: number
}

export const ContactForm: React.FC<Props> = ({ formId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const form = useForm<FormValues>({
    defaultValues: {
      'full-name': '',
      email: '',
      phone: '',
      message: '',
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = useCallback(
    (data: FormValues) => {
      const submit = async () => {
        setError(undefined)
        setIsLoading(true)

        try {
          const result = await submitForm(formId, [
            { field: 'full-name', value: data['full-name'] },
            { field: 'email', value: data.email },
            { field: 'phone', value: data.phone || '' },
            { field: 'message', value: data.message },
          ])

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
    [formId],
  )

  if (hasSubmitted) {
    return (
      <div className="py-12 text-center">
        <p
          className="font-display italic text-candera-obsidian mb-3 m-0"
          style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
        >
          Your note has been received.
        </p>
        <p className="font-sans text-[14px] text-candera-sage-text m-0 mt-2">
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
            className="mb-6 p-4 border border-candera-ember-strong/30 bg-candera-ember-strong/5 text-candera-ember-strong text-[13px] font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <FormField
            control={control}
            name="full-name"
            rules={{ required: 'Full name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Full Name{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                {/* ember-strong = 5.5:1 on vellum — passes AA */}
                <FormMessage className="mt-1.5 text-[12px] text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Email{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    autoComplete="email"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Phone {/* sage-text = 5.2:1 on vellum — passes AA */}
                  <span className="text-candera-sage-text text-[10px] normal-case tracking-normal font-normal ml-1">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(555) 000-0000"
                    autoComplete="tel"
                    inputMode="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-ember-strong" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="message"
            rules={{ required: 'Message is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Message{' '}
                  <span className="text-candera-ember" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="How can we help?" rows={5} {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-ember-strong" />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8">
          <Button type="submit" variant="cta-ember" size="cta" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Correspondence'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
