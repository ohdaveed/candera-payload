'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

type SubmitFormResult = { ok: true } | { ok: false; error: string }

export async function submitForm(
  formId: number,
  submissionData: { field: string; value: string }[],
): Promise<SubmitFormResult> {
  if (!Number.isInteger(formId) || formId <= 0) {
    return { ok: false, error: 'Invalid form.' }
  }

  if (!submissionData.length) {
    return { ok: false, error: 'No submission data.' }
  }

  // Defense-in-depth caps (the `form-submissions` beforeValidate hook enforces the
  // same limits for every write path; these reject obvious abuse early).
  if (submissionData.length > 50) {
    return { ok: false, error: 'Too many fields.' }
  }

  if (
    submissionData.some((entry) => typeof entry?.value === 'string' && entry.value.length > 5000)
  ) {
    return { ok: false, error: 'A field is too long.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'form-submissions',
      data: {
        form: formId,
        submissionData,
      },
    })

    return { ok: true }
  } catch (err) {
    console.error('[submitForm] submission failed:', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}
