'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { verifyTurnstileToken } from '@/utilities/turnstile'
import { checkFormRateLimit, getClientIpFromHeaders } from '@/utilities/formRateLimit'
import {
  MAX_FIELDS,
  MAX_VALUE_LENGTH,
  validateAndSanitizeSubmission,
} from '@/utilities/formValidation'

const HONEYPOT_FIELD = '_gotcha'

const submitFormSchema = z.object({
  formId: z.number().int().positive({ message: 'Invalid form.' }),
  submissionData: z
    .array(
      z.object({
        field: z.string(),
        value: z.string().max(MAX_VALUE_LENGTH, { message: 'A field is too long.' }),
      }),
    )
    .min(1, { message: 'No submission data.' })
    .max(MAX_FIELDS, { message: 'Too many fields.' }),
  turnstileToken: z.string().optional(),
  honeypot: z.string().optional(),
})

export const submitFormAction = actionClient
  .inputSchema(submitFormSchema)
  .action(async ({ parsedInput }) => {
    const { formId, submissionData, turnstileToken, honeypot } = parsedInput

    if (honeypot) {
      throw new Error('Submission rejected.')
    }

    const requestHeaders = await headers()
    const clientIp = getClientIpFromHeaders(requestHeaders)
    if (!checkFormRateLimit(clientIp)) {
      throw new Error('Too many submissions. Please wait a moment and try again.')
    }

    if (turnstileToken || process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        throw new Error('Security verification token is missing.')
      }
      const isValid = await verifyTurnstileToken(turnstileToken, clientIp)
      if (!isValid) {
        throw new Error('Security verification failed. Please try again.')
      }
    }

    const payload = await getPayload({ config })
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData: submissionData.filter((row) => row.field !== HONEYPOT_FIELD),
      },
      overrideAccess: true,
    })

    return { success: true, submissionId: submission.id }
  })

export async function submitForm(
  formId: number,
  submissionData: { field: string; value: string }[],
  options?: { turnstileToken?: string; honeypot?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!Number.isInteger(formId) || formId <= 0) {
    return { ok: false, error: 'Invalid form.' }
  }

  try {
    validateAndSanitizeSubmission(submissionData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed.'
    return { ok: false, error: message }
  }

  try {
    const result = await submitFormAction({
      formId,
      submissionData,
      turnstileToken: options?.turnstileToken,
      honeypot: options?.honeypot,
    })
    if (result?.validationErrors) {
      return { ok: false, error: 'Validation failed.' }
    }
    if (result?.serverError) {
      return { ok: false, error: result.serverError }
    }
    return { ok: true }
  } catch (err) {
    console.error('[submitForm] submission failed:', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}
