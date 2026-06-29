'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { verifyTurnstileToken } from '@/utilities/turnstile'
import {
  MAX_FIELDS,
  MAX_VALUE_LENGTH,
  validateAndSanitizeSubmission,
} from '@/utilities/formValidation'

// Define Zod schema to mirror the validation rules.
// NOT exported: a 'use server' file may only export async functions, so this
// schema stays module-private (it's only consumed by submitFormAction below).
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
})

// Safe Action (for modern/future components)
export const submitFormAction = actionClient
  .inputSchema(submitFormSchema)
  .action(async ({ parsedInput }) => {
    const { formId, submissionData, turnstileToken } = parsedInput

    if (turnstileToken || process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        throw new Error('Security verification token is missing.')
      }
      const isValid = await verifyTurnstileToken(turnstileToken)
      if (!isValid) {
        throw new Error('Security verification failed. Please try again.')
      }
    }

    const payload = await getPayload({ config })
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData,
      },
    })

    return { success: true, submissionId: submission.id }
  })

// Classic wrapper (for backwards compatibility and existing spec tests)
export async function submitForm(
  formId: number,
  submissionData: { field: string; value: string }[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  // 1. Run local checks to mirror original error messages exactly
  if (!Number.isInteger(formId) || formId <= 0) {
    return { ok: false, error: 'Invalid form.' }
  }

  try {
    validateAndSanitizeSubmission(submissionData)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed.'
    return { ok: false, error: message }
  }

  // 2. Call the safe action
  try {
    const result = await submitFormAction({ formId, submissionData })
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
