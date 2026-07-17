import { describe, expect, it } from 'vite-plus/test'
import type { CollectionConfig, Field } from 'payload'

import { withAIGeneration } from '@/utilities/withAIGeneration'
import { buildFieldCopyPrompt, fieldCopyInputSchema } from '@/lib/ai/field-copy'

const AI_TEXT = '@/components/admin/AIGenerateTextField#AITextField'
const AI_TEXTAREA = '@/components/admin/AIGenerateTextField#AITextareaField'

function makeCollection(fields: Field[]): CollectionConfig {
  return { slug: 'test', fields }
}

function fieldComponent(field: Field | undefined): unknown {
  return field && 'admin' in field ? field.admin?.components?.Field : undefined
}

describe('withAIGeneration', () => {
  it('injects the AI component into plain text and textarea fields', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'title', type: 'text' },
        { name: 'summary', type: 'textarea' },
      ]),
    )

    expect(fieldComponent(result.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(result.fields[1])).toBe(AI_TEXTAREA)
  })

  it('recurses into tabs, groups, rows, arrays, and blocks', () => {
    const result = withAIGeneration(
      makeCollection([
        {
          type: 'tabs',
          tabs: [
            {
              label: 'Content',
              fields: [
                {
                  name: 'specs',
                  type: 'array',
                  fields: [
                    {
                      type: 'row',
                      fields: [{ name: 'label', type: 'text' }],
                    },
                  ],
                },
                {
                  name: 'scent',
                  type: 'group',
                  fields: [{ name: 'top', type: 'text' }],
                },
                {
                  name: 'layout',
                  type: 'blocks',
                  blocks: [
                    {
                      slug: 'banner',
                      fields: [{ name: 'headline', type: 'text' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]),
    )

    const tabs = result.fields[0] as Extract<Field, { type: 'tabs' }>
    const [specs, scent, layout] = tabs.tabs[0].fields as [
      Extract<Field, { type: 'array' }>,
      Extract<Field, { type: 'group' }>,
      Extract<Field, { type: 'blocks' }>,
    ]

    const row = specs.fields[0] as Extract<Field, { type: 'row' }>
    expect(fieldComponent(row.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(scent.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(layout.blocks?.[0]?.fields[0])).toBe(AI_TEXT)
  })

  it('skips hidden, read-only, machine-managed, and hasMany fields', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'etsyTitle', type: 'text', hidden: true },
        { name: 'notes', type: 'textarea', admin: { readOnly: true } },
        { name: 'slug', type: 'text' },
        { name: 'canonicalUrl', type: 'text' },
        { name: 'apiToken', type: 'text' },
        { name: 'keywords', type: 'text', hasMany: true },
        { name: 'etsyImageId', type: 'text' },
        { name: 'listing_id', type: 'text' },
        { name: 'id', type: 'text' },
      ]),
    )

    for (const field of result.fields) {
      expect(fieldComponent(field)).toBeUndefined()
    }
  })

  it('does not skip words that merely end in "id" (orchid, liquid, hybrid)', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'orchid', type: 'text' },
        { name: 'liquid', type: 'text' },
        { name: 'hybrid', type: 'textarea' },
      ]),
    )

    expect(fieldComponent(result.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(result.fields[1])).toBe(AI_TEXT)
    expect(fieldComponent(result.fields[2])).toBe(AI_TEXTAREA)
  })

  it('does not clobber fields that already have a custom Field component', () => {
    const custom = '@/components/Custom#Custom'
    const result = withAIGeneration(
      makeCollection([
        { name: 'fancy', type: 'text', admin: { components: { Field: custom } } },
      ]),
    )

    expect(fieldComponent(result.fields[0])).toBe(custom)
  })

  it('leaves non-text fields untouched', () => {
    const original = makeCollection([
      { name: 'count', type: 'number' },
      { name: 'published', type: 'checkbox' },
    ])
    const result = withAIGeneration(original)
    expect(result.fields).toEqual(original.fields)
  })
})

describe('field-copy prompt', () => {
  it('validates input and builds a prompt containing field metadata and context', () => {
    const input = fieldCopyInputSchema.parse({
      fieldLabel: 'Tagline',
      fieldName: 'tagline',
      fieldDescription: 'Short poetic tagline shown on product cards.',
      entityLabel: 'products',
      variant: 'text',
      maxLength: 120,
      currentValue: 'A candle',
      context: { title: 'Amber Noir', 'scentProfile.top': 'Bergamot' },
    })

    const prompt = buildFieldCopyPrompt(input)
    expect(prompt).toContain('"Tagline"')
    expect(prompt).toContain('products')
    expect(prompt).toContain('at most 120 characters')
    expect(prompt).toContain('- title: Amber Noir')
    expect(prompt).toContain('- scentProfile.top: Bergamot')
    expect(prompt).toContain('improve on it')
  })

  it('rejects oversized context payloads', () => {
    const context = Object.fromEntries(
      Array.from({ length: 60 }, (_, i) => [`key${i}`, 'value']),
    )
    const parsed = fieldCopyInputSchema.safeParse({
      fieldLabel: 'Tagline',
      fieldName: 'tagline',
      variant: 'text',
      context,
    })
    expect(parsed.success).toBe(false)
  })
})
