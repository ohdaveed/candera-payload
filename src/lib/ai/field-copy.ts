import { z } from 'zod'
import { SYSTEM_PROMPTS } from './product-copy'

/**
 * Single-field AI copy generation, shared by the generic
 * `/next/ai/generate-field` endpoint and the admin field components.
 * Complements `product-copy.ts`, which generates a fixed trio of product
 * fields — this generates a value for any one text/textarea field from
 * whatever document context the admin form can provide.
 */

const FIELD_TASK_PROMPT =
  'You are asked to write the value of a single CMS field. Respond with the field value only — plain text, no surrounding quotes, no markdown, no explanation.'

/** Brand voice (per tone, from product-copy) plus the single-field task framing. */
export function fieldSystemPrompt(tone: FieldCopyData['tone']): string {
  return `${SYSTEM_PROMPTS[tone]} ${FIELD_TASK_PROMPT}`
}

const MAX_CONTEXT_ENTRIES = 40

export const fieldCopyInputSchema = z.object({
  fieldLabel: z.string().min(1).max(200),
  fieldName: z.string().min(1).max(200),
  fieldDescription: z.string().max(500).optional(),
  entityLabel: z.string().max(200).optional(),
  variant: z.enum(['text', 'textarea']),
  tone: z.enum(['poetic', 'minimal', 'bold']).default('poetic'),
  maxLength: z.number().int().positive().max(100_000).optional(),
  currentValue: z.string().max(5_000).optional(),
  context: z
    .record(z.string().max(200), z.string().max(500))
    .refine((ctx) => Object.keys(ctx).length <= MAX_CONTEXT_ENTRIES, {
      message: `Context must have at most ${MAX_CONTEXT_ENTRIES} entries`,
    })
    .optional(),
})

export const fieldCopyOutputSchema = z.object({
  suggestion: z.string(),
})

/** Request-body shape (pre-parse: `tone` optional, defaults to poetic). */
export type FieldCopyInput = z.input<typeof fieldCopyInputSchema>
/** Parsed shape the server works with (defaults applied). */
export type FieldCopyData = z.output<typeof fieldCopyInputSchema>
export type FieldCopyOutput = z.infer<typeof fieldCopyOutputSchema>

export function buildFieldCopyPrompt(input: FieldCopyData): string {
  const parts: string[] = []

  parts.push(
    `Write the value for the "${input.fieldLabel}" field` +
      (input.entityLabel ? ` of a "${input.entityLabel}" document` : '') +
      ' in the Candera CMS.',
  )

  if (input.fieldDescription) parts.push(`Field hint: ${input.fieldDescription}`)

  if (input.variant === 'textarea') {
    parts.push('The field holds a short paragraph of copy (1–3 sentences).')
  } else {
    parts.push('The field holds a single short line of copy — no line breaks.')
  }

  if (input.maxLength) parts.push(`Hard limit: at most ${input.maxLength} characters.`)

  const contextEntries = Object.entries(input.context ?? {})
  if (contextEntries.length > 0) {
    parts.push(
      '',
      'Current document content for context:',
      ...contextEntries.map(([key, value]) => `- ${key}: ${value}`),
    )
  }

  if (input.currentValue) {
    parts.push('', `The field currently contains: "${input.currentValue}" — improve on it.`)
  }

  return parts.join('\n')
}
