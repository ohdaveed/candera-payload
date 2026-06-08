import type { CollectionAfterChangeHook } from 'payload'
import { upsertSubscriber } from '@/services/mailchimp'
import { archiveFormSubmission } from '@/services/supabase'

// Map form title → Mailchimp tag
const FORM_TAG_MAP: Record<string, string> = {
  'Contact Form': 'contact',
  'Inner Circle Signup': 'inner-circle',
  'Scent Quiz': 'scent-quiz',
}

type SubmissionField = { field: string; value: string }

export const processFormSubmission: CollectionAfterChangeHook = async ({ doc, req }) => {
  try {
    const submissionData: SubmissionField[] = doc.submissionData ?? []

    const email = submissionData.find((f) => f.field === 'email')?.value ?? null

    // Resolve parent form title
    const formRelation = doc.form
    const formId = typeof formRelation === 'object' ? formRelation?.id : formRelation
    if (!formId) return doc

    const form = await req.payload.findByID({ collection: 'forms', id: formId, depth: 0 })
    const formTitle: string = form.title
    const tag = FORM_TAG_MAP[formTitle] ?? 'general'

    const scentResult = submissionData.find((f) => f.field === 'scent-result')?.value ?? null
    const mergeFields: Record<string, string> = scentResult ? { SCENT: scentResult } : {}

    // Run Mailchimp sync and Supabase archive in parallel — both non-fatal
    const results = await Promise.allSettled([
      email ? upsertSubscriber(email, [tag], mergeFields) : Promise.resolve(),
      archiveFormSubmission({
        form_title: formTitle,
        email,
        submission_data: submissionData,
        tags: [tag],
        scent_result: scentResult,
        payload_submission_id: String(doc.id),
      }),
    ])

    for (const result of results) {
      if (result.status === 'rejected') {
        req.payload.logger.error({
          err: result.reason,
          msg: '[processFormSubmission] service error',
        })
      }
    }
  } catch (err) {
    req.payload.logger.error({ err, msg: '[processFormSubmission] unexpected error' })
  }

  return doc
}
