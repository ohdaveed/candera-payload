import type { CollectionAfterChangeHook } from 'payload'
import { type FormRelayPort, defaultFormRelay } from '@/services/formRelay'

type SubmissionField = { field: string; value: string }

export const processFormSubmission: CollectionAfterChangeHook = async ({ doc, req }) => {
  try {
    const submissionData: SubmissionField[] = doc.submissionData ?? []

    const email = submissionData.find((f) => f.field === 'email')?.value ?? null

    const formRelation = doc.form
    const formId = typeof formRelation === 'object' ? formRelation?.id : formRelation
    if (!formId) return doc

    const form = await req.payload.findByID({ collection: 'forms', id: formId, depth: 0 })
    const formTitle: string = form.title

    const relay = (req.context.formRelay as FormRelayPort) || defaultFormRelay

    const results = await Promise.allSettled([
      relay.send({
        formTitle,
        email,
        submissionData,
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
