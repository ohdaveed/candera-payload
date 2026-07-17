import { describe, it, expect } from 'vite-plus/test'
import {
  buildFieldGenerationPrompt,
  fieldGenerationInputSchema,
  fieldGenerationOutputSchema,
} from '@/lib/ai/field-copy'

describe('buildFieldGenerationPrompt', () => {
  it('includes entity, field label, and path', () => {
    const prompt = buildFieldGenerationPrompt({
      entity: 'products',
      fieldLabel: 'Tagline',
      fieldPath: 'tagline',
      fieldType: 'text',
      tone: 'poetic',
    })
    expect(prompt).toContain('Content type: products')
    expect(prompt).toContain('Field: Tagline (tagline)')
  })

  it('includes document title, description, and current value when provided', () => {
    const prompt = buildFieldGenerationPrompt({
      entity: 'products',
      fieldLabel: 'Tagline',
      fieldPath: 'tagline',
      fieldType: 'text',
      documentTitle: 'Cedar & Smoke',
      description: 'Short poetic tagline shown on product cards.',
      currentValue: 'A cozy candle',
      tone: 'poetic',
    })
    expect(prompt).toContain('Document: Cedar & Smoke')
    expect(prompt).toContain('Field guidance: Short poetic tagline shown on product cards.')
    expect(prompt).toContain('Current value: A cozy candle')
    expect(prompt).toContain('improved alternative')
  })

  it('omits optional lines when not provided', () => {
    const prompt = buildFieldGenerationPrompt({
      entity: 'pages',
      fieldLabel: 'Title',
      fieldPath: 'title',
      fieldType: 'text',
      tone: 'minimal',
    })
    expect(prompt).not.toContain('Document:')
    expect(prompt).not.toContain('Field guidance:')
    expect(prompt).not.toContain('Current value:')
  })

  it('adjusts the output instruction per field type', () => {
    const short = buildFieldGenerationPrompt({
      entity: 'products',
      fieldLabel: 'Vessel',
      fieldPath: 'vessel',
      fieldType: 'text',
      tone: 'bold',
    })
    const long = buildFieldGenerationPrompt({
      entity: 'products',
      fieldLabel: 'Notes',
      fieldPath: 'notes',
      fieldType: 'textarea',
      tone: 'bold',
    })
    expect(short).toContain('single short line')
    expect(long).toContain('1-3 sentences')
  })
})

describe('fieldGenerationInputSchema', () => {
  it('rejects missing required fields', () => {
    expect(fieldGenerationInputSchema.safeParse({ fieldLabel: 'X' }).success).toBe(false)
  })

  it('rejects an invalid field type', () => {
    const result = fieldGenerationInputSchema.safeParse({
      entity: 'products',
      fieldLabel: 'Tagline',
      fieldPath: 'tagline',
      fieldType: 'richText',
    })
    expect(result.success).toBe(false)
  })

  it('defaults tone to poetic', () => {
    const result = fieldGenerationInputSchema.safeParse({
      entity: 'products',
      fieldLabel: 'Tagline',
      fieldPath: 'tagline',
      fieldType: 'text',
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.tone).toBe('poetic')
  })
})

describe('fieldGenerationOutputSchema', () => {
  it('accepts a non-empty suggestion', () => {
    expect(
      fieldGenerationOutputSchema.safeParse({ suggestion: 'Warmth that lingers' }).success,
    ).toBe(true)
  })

  it('rejects an empty suggestion', () => {
    expect(fieldGenerationOutputSchema.safeParse({ suggestion: '' }).success).toBe(false)
  })
})
