import { describe, it, expect, beforeAll } from 'vite-plus/test'
import { submitFormAction } from '@/app/actions/submitForm'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { InMemoryFormRelayAdapter } from '@/services/formRelay'

let payload: Payload

describe('submitFormAction validation', () => {
  it('rejects invalid formId (0) via the input schema', async () => {
    const result = await submitFormAction({
      formId: 0,
      submissionData: [{ field: 'email', value: 'test@test.com' }],
    })
    expect(result?.validationErrors).toBeDefined()
    expect(result?.data).toBeUndefined()
  })

  it('rejects negative formId via the input schema', async () => {
    const result = await submitFormAction({
      formId: -1,
      submissionData: [{ field: 'email', value: 'test@test.com' }],
    })
    expect(result?.validationErrors).toBeDefined()
    expect(result?.data).toBeUndefined()
  })

  it('rejects empty submissionData', async () => {
    const result = await submitFormAction({ formId: 1, submissionData: [] })
    expect(result?.serverError).toBe('No submission data.')
    expect(result?.data).toBeUndefined()
  })

  it('rejects too many fields', async () => {
    const tooManyFields = Array.from({ length: 51 }, (_, i) => ({
      field: `field-${i}`,
      value: 'x',
    }))
    const result = await submitFormAction({ formId: 1, submissionData: tooManyFields })
    expect(result?.serverError).toBe('Too many fields.')
    expect(result?.data).toBeUndefined()
  })

  it('rejects a field value that is too long', async () => {
    const result = await submitFormAction({
      formId: 1,
      submissionData: [{ field: 'message', value: 'x'.repeat(5001) }],
    })
    expect(result?.serverError).toBe('A field is too long.')
    expect(result?.data).toBeUndefined()
  })

  it('rejects submissions with a filled honeypot', async () => {
    const result = await submitFormAction({
      formId: 1,
      submissionData: [{ field: 'email', value: 'test@test.com' }],
      honeypot: 'bot-filled-this',
    })
    expect(result?.serverError).toBe('Submission rejected.')
    expect(result?.data).toBeUndefined()
  })

  it('rejects submissions whose only rows are honeypot fields', async () => {
    const result = await submitFormAction({
      formId: 1,
      submissionData: [{ field: '_gotcha', value: '' }],
    })
    expect(result?.serverError).toBe('No submission data.')
    expect(result?.data).toBeUndefined()
  })
})

describe('submitForm hook integration', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('triggers processFormSubmission and calls the FormRelayPort adapter', async () => {
    // 1. Create a test form
    const form = await payload.create({
      collection: 'forms',
      data: {
        title: 'Integration Test Form',
        submitButtonLabel: 'Submit',
        confirmationType: 'message',
        confirmationMessage: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Thank you!',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    })

    let submissionId: number | string | undefined = undefined

    try {
      const fakeRelay = new InMemoryFormRelayAdapter()

      // 2. Write a submission using payload.create with context
      const submission = await payload.create({
        collection: 'form-submissions',
        data: {
          form: form.id,
          submissionData: [
            { field: 'email', value: 'tester@example.com' },
            { field: 'message', value: 'This is an integration test.' },
          ],
        },
        context: {
          formRelay: fakeRelay,
        },
      })
      submissionId = submission.id

      // 3. Verify that the fake relay was called with the correct data
      expect(fakeRelay.calls).toHaveLength(1)
      expect(fakeRelay.calls[0].formTitle).toBe('Integration Test Form')
      expect(fakeRelay.calls[0].email).toBe('tester@example.com')
      expect(
        fakeRelay.calls[0].submissionData.map((d) => ({ field: d.field, value: d.value })),
      ).toEqual([
        { field: 'email', value: 'tester@example.com' },
        { field: 'message', value: 'This is an integration test.' },
      ])
    } finally {
      // Clean up submission first
      if (submissionId) {
        try {
          await payload.delete({
            collection: 'form-submissions',
            id: submissionId,
          })
        } catch (err) {
          console.error('Failed to clean up submission in test:', err)
        }
      }
      // Clean up form second
      try {
        await payload.delete({
          collection: 'forms',
          id: form.id,
        })
      } catch (err) {
        console.error('Failed to clean up form in test:', err)
      }
    }
  })
})
