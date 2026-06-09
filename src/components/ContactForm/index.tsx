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
import { Section } from '@/components/ui/section'
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
      <Section padding="none" className="py-12 text-center">
        <p className="font-display text-2xl text-candera-obsidian mb-3 italic">
          Your note has been received.
        </p>
        <p className="font-sans text-sm text-candera-sage-text">
          We respond with intention — expect a reply within 48 hours.
        </p>
      </Section>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <Section
            padding="none"
            className="mb-6 p-4 bg-candera-rose/10 text-candera-rose text-[13px] font-medium"
            role="alert"
            aria-live="polite"
          >
            {error}
          </Section>
        )}

        <Section padding="none" className="flex flex-col gap-6">
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
                  <Input placeholder="Your Name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
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
                  <Input placeholder="email@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-candera-sage-text">
                  Phone{' '}
                  <span className="text-candera-stone/60 text-[10px] normal-case tracking-normal font-normal ml-1">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="(555) 000-0000" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
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
                <FormMessage className="mt-1.5 text-[12px] text-candera-rose" />
              </FormItem>
            )}
          />
        </Section>

        <Section padding="none" className="mt-8">
          <Button type="submit" variant="cta-ember" size="cta" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send Correspondence'}
          </Button>
        </Section>
      </form>
    </Form>
  )
}
