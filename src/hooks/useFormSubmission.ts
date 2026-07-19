'use client'

import { useCallback, useState } from 'react'
import { submitFormAction } from '@/app/actions/submitForm'

export type SubmissionField = { field: string; value: string }

type UseFormSubmission = {
  isLoading: boolean
  hasSubmitted: boolean
  error: string | undefined
  setError: (error: string | undefined) => void
  /** Clears loading/submitted/error state (e.g. when a multi-step form restarts). */
  reset: () => void
  /** Invokes the type-safe submitFormAction server action; returns true on success. */
  submit: (
    formId: string | number | null | undefined,
    submissionData: SubmissionField[],
    turnstileToken?: string,
    honeypot?: string,
  ) => Promise<boolean>
}

/**
 * Shared submit flow for every storefront form (Contact form, form-builder
 * block, Inner Circle email capture, Scent Quiz email step). Encapsulates the
 * isLoading/hasSubmitted/error state, invoking the submitFormAction server
 * action, and handling errors.
 */
export function useFormSubmission(): UseFormSubmission {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const reset = useCallback(() => {
    setIsLoading(false)
    setHasSubmitted(false)
    setError(undefined)
  }, [])

  const submit = useCallback(
    async (
      formId: string | number | null | undefined,
      submissionData: SubmissionField[],
      turnstileToken?: string,
      honeypot?: string,
    ) => {
      setError(undefined)

      if (!formId) {
        setError('Form unavailable — please reach out to us directly.')
        return false
      }

      setIsLoading(true)

      // Coerce formId to a number since the relationship uses numeric IDs in the Postgres database schema
      const numericFormId = typeof formId === 'string' ? Number(formId) : formId

      try {
        const result = await submitFormAction({
          formId: numericFormId,
          submissionData,
          turnstileToken,
          honeypot,
        })

        if (!result || result.validationErrors) {
          setError('Invalid form submission data. Please check your entries.')
          setIsLoading(false)
          return false
        }

        if (result.serverError) {
          setError(result.serverError)
          setIsLoading(false)
          return false
        }

        if (result.data?.success) {
          setIsLoading(false)
          setHasSubmitted(true)
          return true
        }

        setError('An unexpected error occurred. Please try again.')
        setIsLoading(false)
        return false
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        setIsLoading(false)
        return false
      }
    },
    [],
  )

  return { isLoading, hasSubmitted, error, setError, reset, submit }
}
