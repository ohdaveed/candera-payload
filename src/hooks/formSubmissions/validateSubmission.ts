import type { CollectionBeforeValidateHook } from 'payload'
import { ValidationError } from 'payload'

/**
 * Hard server-side caps for public form submissions.
 *
 * `form-submissions` keeps the form-builder plugin's default of public `create`
 * so the storefront forms work, but every submission fans out to Supabase and an
 * external email relay. These caps blunt the cost/abuse blast radius of bulk or
 * oversized payloads. They run for *all* write paths — the `submitForm` server
 * action and direct REST `POST /api/form-submissions` alike.
 *
 * Not a substitute for bot mitigation (honeypot / CAPTCHA / rate limiting),
 * which is tracked as a follow-up requiring provisioned infrastructure.
 */
const MAX_FIELDS = 50
const MAX_VALUE_LENGTH = 5000
const MAX_FIELD_NAME_LENGTH = 200

type SubmissionField = { field?: unknown; value?: unknown }

export const validateSubmission: CollectionBeforeValidateHook = ({ data }) => {
  if (!data) return data

  const submissionData = data.submissionData

  if (submissionData == null) return data

  if (!Array.isArray(submissionData)) {
    throw new ValidationError({
      errors: [{ path: 'submissionData', message: 'Submission data is malformed.' }],
    })
  }

  if (submissionData.length > MAX_FIELDS) {
    throw new ValidationError({
      errors: [{ path: 'submissionData', message: 'Too many fields in submission.' }],
    })
  }

  const sanitized = (submissionData as SubmissionField[])
    // Drop entries without a usable field name.
    .filter((entry) => typeof entry?.field === 'string' && entry.field.trim().length > 0)
    .map((entry) => {
      const field = String(entry.field).slice(0, MAX_FIELD_NAME_LENGTH)
      // Coerce non-string values to strings so downstream services never choke.
      const value = entry.value
      const rawValue =
        value == null
          ? ''
          : typeof value === 'string'
            ? value
            : typeof value === 'object'
              ? JSON.stringify(value)
              : String(value as number | bigint | boolean)

      if (rawValue.length > MAX_VALUE_LENGTH) {
        throw new ValidationError({
          errors: [
            { path: 'submissionData', message: `Field "${field}" exceeds the maximum length.` },
          ],
        })
      }

      return { field, value: rawValue }
    })

  data.submissionData = sanitized

  return data
}
