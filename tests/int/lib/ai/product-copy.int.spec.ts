import { describe, it, expect } from 'vite-plus/test'
import { buildUserPrompt, SYSTEM_PROMPTS, inputSchema, outputSchema } from '@/lib/ai/product-copy'

describe('buildUserPrompt', () => {
  it('includes title and productType', () => {
    const prompt = buildUserPrompt({
      title: 'Cedar & Smoke',
      productType: 'candle',
      tone: 'poetic',
    })
    expect(prompt).toContain('Cedar & Smoke')
    expect(prompt).toContain('candle')
  })

  it('omits empty scent notes', () => {
    const prompt = buildUserPrompt({
      title: 'Test',
      productType: 'candle',
      scentProfile: { top: 'bergamot', heart: undefined, base: '' },
      tone: 'poetic',
    })
    expect(prompt).toContain('top — bergamot')
    expect(prompt).not.toContain('heart')
    expect(prompt).not.toContain('base')
  })

  it('omits scentProfile block when all notes are empty', () => {
    const prompt = buildUserPrompt({
      title: 'Test',
      productType: 'vintage',
      scentProfile: { top: '', heart: '', base: '' },
      tone: 'minimal',
    })
    expect(prompt).not.toContain('Scent profile')
  })

  it('includes atmosphere and burnTime when provided', () => {
    const prompt = buildUserPrompt({
      title: 'Test',
      productType: 'candle',
      atmosphere: 'Coastal & Airy',
      burnTime: '50 Hours',
      tone: 'bold',
    })
    expect(prompt).toContain('Coastal & Airy')
    expect(prompt).toContain('50 Hours')
  })

  it('always ends with the generation instruction', () => {
    const prompt = buildUserPrompt({ title: 'X', productType: 'candle', tone: 'poetic' })
    expect(prompt).toContain('Generate a tagline')
    expect(prompt).toContain('max 12 words')
    expect(prompt).toContain('max 60 characters')
    expect(prompt).toContain('max 155 characters')
  })

  it('formats every field line exactly as the model prompt expects', () => {
    const prompt = buildUserPrompt({
      title: 'Amber Forest',
      productType: 'candle',
      scentProfile: { top: 'Pine', heart: 'Cedar', base: 'Amber' },
      atmosphere: 'Quiet evening',
      burnTime: '60 Hours',
      tone: 'poetic',
    })
    expect(prompt).toContain('Product: Amber Forest (candle)')
    expect(prompt).toContain('Scent profile: top — Pine, heart — Cedar, base — Amber')
    expect(prompt).toContain('Atmosphere: Quiet evening')
    expect(prompt).toContain('Intention: 60 Hours')
  })
})

describe('SYSTEM_PROMPTS', () => {
  it('has entries for all three tones', () => {
    expect(SYSTEM_PROMPTS.poetic).toBeTruthy()
    expect(SYSTEM_PROMPTS.minimal).toBeTruthy()
    expect(SYSTEM_PROMPTS.bold).toBeTruthy()
  })
})

describe('inputSchema', () => {
  it('rejects missing title', () => {
    const result = inputSchema.safeParse({ productType: 'candle', tone: 'poetic' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tone', () => {
    const result = inputSchema.safeParse({ title: 'X', productType: 'candle', tone: 'whimsical' })
    expect(result.success).toBe(false)
  })

  it('accepts valid minimal input', () => {
    const result = inputSchema.safeParse({ title: 'Cedar', productType: 'candle', tone: 'bold' })
    expect(result.success).toBe(true)
  })

  it('accepts a complete input with all optional fields', () => {
    const result = inputSchema.safeParse({
      title: 'Amber Forest',
      productType: 'candle',
      scentProfile: { top: 'Pine', heart: 'Cedar', base: 'Amber' },
      atmosphere: 'Quiet evening',
      burnTime: '60 Hours',
      tone: 'poetic',
    })
    expect(result.success).toBe(true)
  })
})

describe('outputSchema', () => {
  it('validates correct shape', () => {
    const result = outputSchema.safeParse({
      tagline: 'Warmth that lingers',
      metaTitle: 'Cedar & Smoke Candle',
      metaDescription: 'A handcrafted candle with cedar and smoke.',
    })
    expect(result.success).toBe(true)
  })
})
