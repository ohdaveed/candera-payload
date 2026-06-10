import { describe, it, expect } from 'vite-plus/test'
import { buildUserPrompt, inputSchema, outputSchema } from '@/lib/ai/product-copy'

describe('Product Copy AI Generator', () => {
  describe('Input Schema', () => {
    it('validates a complete input', () => {
      const input = {
        title: 'Amber Forest',
        productType: 'candle',
        scentProfile: {
          top: 'Pine',
          heart: 'Cedar',
          base: 'Amber',
        },
        atmosphere: 'Quiet evening',
        burnTime: '60 Hours',
        tone: 'poetic',
      }
      const result = inputSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('requires a title', () => {
      const input = {
        title: '',
        productType: 'candle',
        tone: 'minimal',
      }
      const result = inputSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('User Prompt Builder', () => {
    it('builds a prompt with all fields', () => {
      const input = {
        title: 'Amber Forest',
        productType: 'candle',
        scentProfile: {
          top: 'Pine',
          heart: 'Cedar',
          base: 'Amber',
        },
        atmosphere: 'Quiet evening',
        burnTime: '60 Hours',
        tone: 'poetic' as const,
      }
      const prompt = buildUserPrompt(input)
      expect(prompt).toContain('Product: Amber Forest (candle)')
      expect(prompt).toContain('Scent profile: top — Pine, heart — Cedar, base — Amber')
      expect(prompt).toContain('Atmosphere: Quiet evening')
      expect(prompt).toContain('Intention: 60 Hours')
    })

    it('omits empty fields from the prompt', () => {
      const input = {
        title: 'Minimal Candle',
        productType: 'candle',
        tone: 'minimal' as const,
      }
      const prompt = buildUserPrompt(input)
      expect(prompt).toContain('Product: Minimal Candle (candle)')
      expect(prompt).not.toContain('Scent profile:')
      expect(prompt).not.toContain('Atmosphere:')
    })
  })

  describe('Output Schema', () => {
    it('validates correct AI output', () => {
      const output = {
        tagline: 'A whisper of cedar in the winter night.',
        metaTitle: 'Amber Forest Botanical Candle | Candera',
        metaDescription: 'Experience the ritual of stillness with our Amber Forest candle.',
      }
      const result = outputSchema.safeParse(output)
      expect(result.success).toBe(true)
    })
  })
})
