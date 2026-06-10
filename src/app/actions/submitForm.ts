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
    const submissionRows = submissionData.map((item, order) => ({
      order,
      id: crypto.randomUUID(),
      field: item.field,
      value: item.value,
    }))

    await sql`
      WITH created_submission AS (
        INSERT INTO form_submissions (form_id, updated_at, created_at)
        VALUES (${formId}, NOW(), NOW())
        RETURNING id
      ),
      submission_data AS (
        SELECT *
        FROM jsonb_to_recordset(${JSON.stringify(submissionRows)}::jsonb)
          AS item("order" integer, id varchar, field varchar, value varchar)
      )
      INSERT INTO form_submissions_submission_data (_order, _parent_id, id, field, value)
      SELECT item."order", created_submission.id, item.id, item.field, item.value
      FROM submission_data item
      CROSS JOIN created_submission
    `

    return { ok: true }
  } catch (err) {
    console.error('[submitForm] DB write failed:', err)
    return { ok: false, error: 'Something went wrong.' }
  }
}
