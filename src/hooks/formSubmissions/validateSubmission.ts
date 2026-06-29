import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'
import { validateAndSanitizeSubmission } from '@/utilities/formValidation'

/**
 * Hard server-side caps for public form submissions.
 *
 * `form-submissions` keeps the form-builder plugin's default of public `create`
 * so the storefront forms work, but every submission is persisted by Payload and
 * relayed to an external email service. These caps blunt the cost/abuse blast radius of bulk or
 * oversized payloads. They run for *all* write paths — the `submitForm` server
 * action and direct REST `POST /api/form-submissions` alike.
 *
 * Not a substitute for bot mitigation (honeypot / CAPTCHA / rate limiting),
 * which is tracked as a follow-up requiring provisioned infrastructure.
 */
export const validateSubmission: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  const submissionData = data.submissionData

  if (submissionData == null) return data

  try {
    const sanitized = validateAndSanitizeSubmission(submissionData)
    data.submissionData = sanitized
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed.'
    throw new ValidationError({
      errors: [{ path: 'submissionData', message }],
    })
  }

  return data
}
