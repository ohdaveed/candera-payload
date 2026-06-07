import { z } from 'zod'

export const SYSTEM_PROMPTS: Record<string, string> = {
  poetic:
    'You write copy for Candera, a luxury candle boutique. Your voice is evocative, sensory, and intimate — words like "ritual," "warmth," "atmosphere." Avoid generic adjectives.',
  minimal:
    'You write copy for Candera, a luxury candle boutique. Your voice is clean and direct. State the scent and mood simply. No flowery language.',
  bold: 'You write copy for Candera, a luxury candle boutique. Your voice is confident and punchy. Lead with impact. Short sentences.',
}

export const inputSchema = z.object({
  title: z.string().min(1),
  productType: z.string(),
  scentProfile: z
    .object({
      top: z.string().optional(),
      heart: z.string().optional(),
      base: z.string().optional(),
    })
    .optional(),
  atmosphere: z.string().optional(),
  burnTime: z.string().optional(),
  tone: z.enum(['poetic', 'minimal', 'bold']),
})

export const outputSchema = z.object({
  tagline: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
})

export type ProductCopyInput = z.infer<typeof inputSchema>
export type ProductCopyOutput = z.infer<typeof outputSchema>

export function buildUserPrompt(input: ProductCopyInput): string {
  const parts: string[] = [`Product: ${input.title} (${input.productType})`]

  if (input.scentProfile) {
    const notes = [
      input.scentProfile.top && `top — ${input.scentProfile.top}`,
      input.scentProfile.heart && `heart — ${input.scentProfile.heart}`,
      input.scentProfile.base && `base — ${input.scentProfile.base}`,
    ].filter(Boolean)
    if (notes.length > 0) parts.push(`Scent profile: ${notes.join(', ')}`)
  }

  if (input.atmosphere) parts.push(`Atmosphere: ${input.atmosphere}`)
  if (input.burnTime) parts.push(`Burn time: ${input.burnTime}`)

  parts.push(
    '',
    'Generate a tagline (max 12 words), SEO meta title (max 60 characters), and SEO meta description (max 155 characters).',
  )

  return parts.join('\n')
}
