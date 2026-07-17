'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { verifyTurnstileToken } from '@/utilities/turnstile'
import { checkFormRateLimit, getClientIpFromHeaders } from '@/utilities/formRateLimit'
import { validateAndSanitizeSubmission } from '@/utilities/formValidation'

const HONEYPOT_FIELD = '_gotcha'

/**
 * Shape-only input schema. Field-level limits (row count, name/value length)
 * are enforced by validateAndSanitizeSubmission inside the action — the single
 * validation boundary for every storefront submission path (all client forms
 * go through the useFormSubmission hook, which invokes this action).
 *
 * Defense-in-depth for non-action writes (e.g. trusted server-side creates)
 * remains in the form-submissions beforeValidate hook (validateSubmission).
 */
const submitFormSchema = z.object({
  formId: z.number().int().positive({ message: 'Invalid form.' }),
  submissionData: z.array(
    z.object({
      field: z.string(),
      value: z.string(),
    }),
  ),
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

    // Single validation boundary: throws user-facing messages (surfaced to
    // clients via serverError) and returns the sanitized rows to persist.
    // Runs before the rate-limit check so invalid payloads don't consume quota.
    const sanitizedData = validateAndSanitizeSubmission(
      submissionData.filter((row) => row.field !== HONEYPOT_FIELD),
    )

    const requestHeaders = await headers()
    const clientIp = getClientIpFromHeaders(requestHeaders)
    if (!(await checkFormRateLimit(clientIp))) {
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
        submissionData: sanitizedData,
      },
      overrideAccess: true,
    })

    return { success: true, submissionId: submission.id }
  })
