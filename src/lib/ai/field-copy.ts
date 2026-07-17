import { z } from 'zod'

/**
 * Single-field AI copy generation, powering the "Generate with AI" loop that
 * every text/textarea field in the admin panel exposes (see
 * `src/plugins/aiTextFields.ts` and `src/components/admin/AITextField.tsx`).
 */

export const fieldGenerationInputSchema = z.object({
  /** Collection or global slug the field belongs to, e.g. "products". */
  entity: z.string().min(1),
  /** Human-readable field label shown in the admin, e.g. "Tagline". */
  fieldLabel: z.string().min(1),
  /** Form-state path of the field, e.g. "scentProfile.top". */
  fieldPath: z.string().min(1),
  fieldType: z.enum(['text', 'textarea']),
  /** Editor-facing field description, used as guidance for the model. */
  description: z.string().optional(),
  /** Title of the document being edited, for context. */
  documentTitle: z.string().optional(),
  /** Current field value — the model refines or replaces it. */
  currentValue: z.string().optional(),
  tone: z.enum(['poetic', 'minimal', 'bold']).default('poetic'),
})

export const fieldGenerationOutputSchema = z.object({
  suggestion: z.string().min(1),
})

export type FieldGenerationInput = z.infer<typeof fieldGenerationInputSchema>
export type FieldGenerationOutput = z.infer<typeof fieldGenerationOutputSchema>

export function buildFieldGenerationPrompt(input: FieldGenerationInput): string {
  const parts: string[] = [
    `You are writing the value for a single CMS field on the Candera Candles website.`,
    `Content type: ${input.entity}`,
  ]

  if (input.documentTitle) parts.push(`Document: ${input.documentTitle}`)

  parts.push(`Field: ${input.fieldLabel} (${input.fieldPath})`)

  if (input.description) parts.push(`Field guidance: ${input.description}`)

  if (input.currentValue) {
    parts.push(
      `Current value: ${input.currentValue}`,
      'Write an improved alternative to the current value.',
    )
  }

  parts.push(
    '',
    input.fieldType === 'textarea'
      ? 'Respond with only the new field value: 1-3 sentences of plain text, no markdown.'
      : 'Respond with only the new field value: a single short line (max 12 words), no markdown, no surrounding quotes.',
  )

  return parts.join('\n')
}
