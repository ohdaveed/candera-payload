import { MAX_FIELDS, MAX_VALUE_LENGTH, MAX_FIELD_NAME_LENGTH } from '@/constants/validation'

// Re-exported for existing importers; the canonical home is @/constants/validation.
export { MAX_FIELDS, MAX_VALUE_LENGTH, MAX_FIELD_NAME_LENGTH }

export interface ValidationField {
  field?: unknown
  value?: unknown
}

/**
 * Validates and sanitizes a form submission payload.
 * Throws an error with a user-friendly message on validation failure.
 */
export function validateAndSanitizeSubmission(
  submissionData: unknown,
): Array<{ field: string; value: string }> {
  if (submissionData == null) {
    throw new Error('No submission data.')
  }

  if (!Array.isArray(submissionData)) {
    throw new Error('Submission data is malformed.')
  }

  if (submissionData.length === 0) {
    throw new Error('No submission data.')
  }

  if (submissionData.length > MAX_FIELDS) {
    throw new Error('Too many fields.')
  }

  const sanitized = (submissionData as ValidationField[])
    // Drop entries without a usable field name.
    .filter((entry) => typeof entry?.field === 'string' && entry.field.trim().length > 0)
    .map((entry) => {
      const field = String(entry.field).slice(0, MAX_FIELD_NAME_LENGTH)
      const value = entry.value
      const rawValue =
        value == null
          ? ''
          : typeof value === 'string'
            ? value
            : typeof value === 'object'
              ? JSON.stringify(value)
              : typeof value === 'boolean' || typeof value === 'number' || typeof value === 'bigint'
                ? String(value)
                : ''

      if (rawValue.length > MAX_VALUE_LENGTH) {
        throw new Error('A field is too long.')
      }

      return { field, value: rawValue }
    })

  if (sanitized.length === 0) {
    throw new Error('Submission contained no valid fields.')
  }

  return sanitized
}
