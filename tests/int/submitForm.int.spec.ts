import { describe, it, expect, beforeAll } from 'vite-plus/test'
import { submitForm } from '@/app/actions/submitForm'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { InMemoryFormRelayAdapter } from '@/services/formRelay'

let payload: Payload

describe('submitForm action validation', () => {
  it('returns error for invalid formId (0)', async () => {
    const result = await submitForm(0, [{ field: 'email', value: 'test@test.com' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid form.')
    }
  })

  it('returns error for negative formId', async () => {
    const result = await submitForm(-1, [{ field: 'email', value: 'test@test.com' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Invalid form.')
    }
  })

  it('returns error for empty submissionData', async () => {
    const result = await submitForm(1, [])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('No submission data.')
    }
  })

  it('returns error when there are too many fields', async () => {
    const tooManyFields = Array.from({ length: 51 }, (_, i) => ({
      field: `field-${i}`,
      value: 'x',
    }))
    const result = await submitForm(1, tooManyFields)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Too many fields.')
    }
  })

  it('returns error when a field value is too long', async () => {
    const result = await submitForm(1, [{ field: 'message', value: 'x'.repeat(5001) }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('A field is too long.')
    }
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
