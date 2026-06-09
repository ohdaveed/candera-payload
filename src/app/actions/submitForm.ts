'use server'

import { sql } from '@/lib/db'

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
    const rows = await sql`
      INSERT INTO form_submissions (form_id, updated_at, created_at)
      VALUES (${formId}, NOW(), NOW())
      RETURNING id
    `

    const submissionId = (rows[0] as { id: number }).id

    await sql.transaction((tx) =>
      submissionData.map(
        (item, i) =>
          tx`
          INSERT INTO form_submissions_submission_data
            (_order, _parent_id, id, field, value)
          VALUES (${i}, ${submissionId}, ${crypto.randomUUID()}, ${item.field}, ${item.value})
        `,
      ),
    )

    return { ok: true }
  } catch (err) {
    console.error('[submitForm] DB write failed:', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}
