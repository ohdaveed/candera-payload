'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { Form } from '@/components/ui/form'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel },
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        setIsLoading(true)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn('[FormBlock] submission error:', err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <Container className="lg:max-w-[50rem] py-32">
      {enableIntro && introContent && !hasSubmitted ? (
        <RichText
          className="mb-16 
            [&_h1]:hero-heading [&_h1]:mb-8
            [&_p]:editorial [&_p]:text-candera-sage-text [&_p]:max-w-[420px]"
          data={introContent}
          enableGutter={false}
        />
      ) : null}
      <span className="block h-px bg-candera-stone/20 mb-16" aria-hidden="true" />
      <Section padding="none" className="p-0">
        <Form {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' ? (
            <Section padding="none" className="py-12 text-center">
              <RichText className="editorial" data={confirmationMessage} />
            </Section>
          ) : null}
          {isLoading && !hasSubmitted ? (
            <p className="editorial animate-pulse" aria-live="polite">
              Preparing correspondence…
            </p>
          ) : null}
          {error ? (
            <Section
              padding="none"
              className="mb-8 p-4 bg-candera-rose/10 text-candera-rose text-sm font-medium"
              aria-live="polite"
              role="alert"
            >
              {`${error.status || '500'}: ${error.message || ''}`}
            </Section>
          ) : null}
          {!hasSubmitted ? (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <Section padding="none" className="mb-10 last:mb-0">
                {formFromProps && formFromProps.fields
                  ? formFromProps.fields?.map((field, index) => {
                      const Field = fields?.[
                        field.blockType as keyof typeof fields
                      ] as React.ElementType
                      if (Field) {
                        return (
                          <Section padding="none" className="mb-8 last:mb-0" key={index}>
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </Section>
                        )
                      }
                      return null
                    })
                  : null}
              </Section>

              <Button
                disabled={isLoading}
                form={formID}
                type="submit"
                variant="cta-ember"
                size="cta"
              >
                {isLoading ? 'Sending…' : submitButtonLabel || 'Send Correspondence'}
              </Button>
            </form>
          ) : null}
        </Form>
      </Section>
    </Container>
  )
}
