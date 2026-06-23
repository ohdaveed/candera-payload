'use client'

import { useCallback, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'

export type SubmissionField = { field: string; value: string }

type UseFormSubmission = {
  isLoading: boolean
  hasSubmitted: boolean
  error: string | undefined
  setError: (error: string | undefined) => void
  /** POSTs to /api/form-submissions; returns true on success. */
  submit: (
    formId: string | number | null | undefined,
    submissionData: SubmissionField[],
  ) => Promise<boolean>
}

/**
 * Shared submit flow for the storefront's direct-fetch forms (Inner Circle
 * email capture, Scent Quiz email step). Encapsulates the isLoading/hasSubmitted/
 * error state, the POST to the Payload form-submissions endpoint, and error
 * handling that were previously duplicated across components.
 */
export function useFormSubmission(): UseFormSubmission {
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const submit = useCallback(
    async (formId: string | number | null | undefined, submissionData: SubmissionField[]) => {
      setError(undefined)

      if (!formId) {
        setError('Form unavailable — please reach out to us directly.')
        return false
      }

      setIsLoading(true)

      try {
        const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form: formId, submissionData }),
        })

        if (res.status >= 400) {
          const json = await res.json()
          setError(json.errors?.[0]?.message || 'Something went wrong. Please try again.')
          setIsLoading(false)
          return false
        }

        setIsLoading(false)
        setHasSubmitted(true)
        return true
      } catch {
        setError('Something went wrong. Please try again.')
        setIsLoading(false)
        return false
      }
    },
    [],
  )

  return { isLoading, hasSubmitted, error, setError, submit }
}
