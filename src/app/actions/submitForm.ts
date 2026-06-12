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
