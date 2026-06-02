'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
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
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
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
          console.warn(err)
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
    <div className="container lg:max-w-[50rem] py-32">
      {enableIntro && introContent && !hasSubmitted ? (
        <RichText 
          className="mb-16 
            [&_h1]:hero-heading [&_h1]:mb-8
            [&_p]:editorial [&_p]:text-candera-sage-text [&_p]:max-w-[420px]" 
          data={introContent} 
          enableGutter={false} 
        />
      ) : null}
      <div className="p-0 border-t border-candera-stone/20 pt-16">
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' ? (
            <div className="py-12 text-center">
               <RichText className="editorial" data={confirmationMessage} />
            </div>
          ) : null}
          {isLoading && !hasSubmitted ? <p className="editorial animate-pulse" aria-live="polite">Preparing correspondence…</p> : null}
          {error ? (
            <div className="mb-8 p-4 bg-candera-rose/10 text-candera-rose text-[13px] font-medium" aria-live="polite" role="alert">
              {`${error.status || '500'}: ${error.message || ''}`}
            </div>
          ) : null}
          {!hasSubmitted ? (
            <form id={formID} onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-10 last:mb-0">
                {formFromProps &&
                formFromProps.fields
                  ? formFromProps.fields?.map((field, index) => {
                      const Field = fields?.[
                        field.blockType as keyof typeof fields
                      ] as React.ElementType
                      if (Field) {
                        return (
                          <div className="mb-8 last:mb-0" key={index}>
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        )
                      }
                      return null
                    })
                  : null}
              </div>

              <Button 
                disabled={isLoading} 
                form={formID} 
                type="submit" 
                variant="default"
                className="h-[52px] px-12 text-[11px] font-bold uppercase tracking-[.3em] bg-candera-obsidian text-white transition-all duration-300 hover:bg-candera-ember !rounded-none shadow-lg w-full md:w-auto"
              >
                {isLoading ? 'Sending…' : (submitButtonLabel || 'Send Correspondence')}
              </Button>
            </form>
          ) : null}
        </FormProvider>
      </div>
    </div>
  )
}
