import { describe, it, expect } from 'vite-plus/test'
import { submitForm } from '@/app/actions/submitForm'

describe('submitForm', () => {
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
