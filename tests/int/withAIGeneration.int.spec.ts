import { describe, expect, it } from 'vite-plus/test'
import type { CollectionConfig, Config, Field } from 'payload'

import { aiGenerationPlugin, withAIGeneration } from '@/utilities/withAIGeneration'
import { buildFieldCopyPrompt, fieldCopyInputSchema } from '@/lib/ai/field-copy'

const AI_TEXT = '@/components/admin/AIGenerateTextField#AITextAfterInput'
const AI_TEXTAREA = '@/components/admin/AIGenerateTextField#AITextareaAfterInput'

function makeCollection(fields: Field[]): CollectionConfig {
  return { slug: 'test', fields }
}

/** The last afterInput entry on the field, i.e. the injected AI control (if any). */
function fieldComponent(field: Field | undefined): unknown {
  if (!field || (field.type !== 'text' && field.type !== 'textarea')) return undefined
  const afterInput = field.admin?.components?.afterInput
  return Array.isArray(afterInput) ? afterInput[afterInput.length - 1] : undefined
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

  it('skips identifiers and factual attribution fields (instagramHandle, testimonial quote/author/location)', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'instagramHandle', type: 'text' },
        { name: 'quote', type: 'textarea' },
        { name: 'author', type: 'text' },
        { name: 'location', type: 'text' },
      ]),
    )

    for (const field of result.fields) {
      expect(fieldComponent(field)).toBeUndefined()
    }
  })

  it('skips form-field block machine values (name, value, defaultValue) only inside blocks', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'value', type: 'text' },
        { name: 'defaultValue', type: 'text' },
        {
          name: 'fields',
          type: 'blocks',
          blocks: [
            {
              slug: 'select',
              fields: [
                { name: 'name', type: 'text' },
                { name: 'defaultValue', type: 'text' },
                {
                  name: 'options',
                  type: 'array',
                  fields: [
                    { name: 'label', type: 'text' },
                    { name: 'value', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
      ]),
    )

    // Top-level fields sharing these names are ordinary display copy.
    expect(fieldComponent(result.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(result.fields[1])).toBe(AI_TEXT)

    const blockFields = (result.fields[2] as Extract<Field, { type: 'blocks' }>).blocks?.[0]
      ?.fields as Field[]
    const [name, defaultValue, options] = blockFields as [
      Field,
      Field,
      Extract<Field, { type: 'array' }>,
    ]
    expect(fieldComponent(name)).toBeUndefined()
    expect(fieldComponent(defaultValue)).toBeUndefined()
    expect(fieldComponent(options.fields[0])).toBe(AI_TEXT) // label stays eligible
    expect(fieldComponent(options.fields[1])).toBeUndefined() // value is the submitted machine value
  })

  it('leaves fields with a custom Field component alone', () => {
    const custom = '@/components/Custom#Custom'
    const result = withAIGeneration(
      makeCollection([{ name: 'fancy', type: 'text', admin: { components: { Field: custom } } }]),
    )

    const field = result.fields[0] as Extract<Field, { type: 'text' }>
    expect(field.admin?.components?.Field).toBe(custom)
    expect(fieldComponent(field)).toBeUndefined()
  })

  it('appends to existing afterInput components instead of replacing them', () => {
    const existing = '@/components/CharCount#CharCount'
    const result = withAIGeneration(
      makeCollection([
        { name: 'tagline', type: 'text', admin: { components: { afterInput: [existing] } } },
      ]),
    )

    const field = result.fields[0] as Extract<Field, { type: 'text' }>
    expect(field.admin?.components?.afterInput).toEqual([existing, AI_TEXT])
  })

  it('as a plugin, covers plugin-added collections but not excluded ones', async () => {
    // Runs last in the plugin chain, so collections added by earlier plugins
    // (like the form builder's `forms`) are present by the time it executes.
    const config = {
      collections: [
        makeCollection([{ name: 'title', type: 'text' }]),
        { slug: 'forms', fields: [{ name: 'submitButtonLabel', type: 'text' }] },
        { slug: 'redirects', fields: [{ name: 'from', type: 'text' }] },
        { slug: 'search', fields: [{ name: 'title', type: 'text' }] },
        { slug: 'form-submissions', fields: [{ name: 'value', type: 'text' }] },
        { slug: 'users', fields: [{ name: 'name', type: 'text' }] },
        { slug: 'etsy-tokens', fields: [{ name: 'label', type: 'text' }] },
      ],
      globals: [{ slug: 'header', fields: [{ name: 'tagline', type: 'text' }] }],
    } as unknown as Config

    const result = await aiGenerationPlugin(config)

    const bySlug = Object.fromEntries((result.collections ?? []).map((c) => [c.slug, c]))
    expect(fieldComponent(bySlug['test']?.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(bySlug['forms']?.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(bySlug['redirects']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['search']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['form-submissions']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['users']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['etsy-tokens']?.fields[0])).toBeUndefined()
    expect(fieldComponent(result.globals?.[0]?.fields[0])).toBe(AI_TEXT)
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
    const context = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`key${i}`, 'value']))
    const parsed = fieldCopyInputSchema.safeParse({
      fieldLabel: 'Tagline',
      fieldName: 'tagline',
      variant: 'text',
      context,
    })
    expect(parsed.success).toBe(false)
  })
})
