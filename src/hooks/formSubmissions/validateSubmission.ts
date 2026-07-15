import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'
import { validateAndSanitizeSubmission } from '@/utilities/formValidation'
import { checkFormRateLimit, getClientIpFromHeaders } from '@/utilities/formRateLimit'

const HONEYPOT_FIELD = '_gotcha'

/**
 * Hard server-side caps for form submissions.
 *
 * Public REST `create` is disabled in the form-builder plugin override; this hook
 * still guards any trusted server-side writes and legacy paths.
 */
export const validateSubmission: CollectionBeforeValidateHook = ({ data, req }) => {
  if (!data) return data

  const submissionData = data.submissionData

  if (submissionData == null) return data

  const honeypot = submissionData.find(
    (row: { field: string; value: string }) => row.field === HONEYPOT_FIELD,
  )
  if (honeypot?.value) {
    throw new ValidationError({
      errors: [{ path: 'submissionData', message: 'Submission rejected.' }],
    })
  }

  if (req?.headers) {
    const clientIp = getClientIpFromHeaders(req.headers as Headers)
    if (!checkFormRateLimit(clientIp)) {
      throw new ValidationError({
        errors: [
          {
            path: 'submissionData',
            message: 'Too many submissions. Please wait a moment and try again.',
          },
        ],
      })
    }
  }

  try {
    const sanitized = validateAndSanitizeSubmission(
      submissionData.filter(
        (row: { field: string; value: string }) => row.field !== HONEYPOT_FIELD,
      ),
    )
    data.submissionData = sanitized
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed.'
    throw new ValidationError({
      errors: [{ path: 'submissionData', message }],
    })
  }

  return data
}
