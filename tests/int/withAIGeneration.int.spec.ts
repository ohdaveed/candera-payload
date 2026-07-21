import { describe, expect, it } from 'vite-plus/test'
import type { CollectionConfig, Config, Field } from 'payload'

import { aiGenerationPlugin, withAIGeneration } from '@/utilities/withAIGeneration'
import { buildFieldCopyPrompt, fieldCopyInputSchema, fieldSystemPrompt } from '@/lib/ai/field-copy'
import { createRateLimiter } from '@/lib/ai/rate-limit'

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
        { name: 'vessel', type: 'text' },
        { name: 'skuCode', type: 'text' },
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

  it('normalizes a scalar afterInput value instead of spreading it into characters', () => {
    const existing = '@/components/CharCount#CharCount'
    const result = withAIGeneration(
      makeCollection([
        {
          name: 'tagline',
          type: 'text',
          // Untyped configs can slip a bare string through — must not be spread char-by-char.
          admin: { components: { afterInput: existing as unknown as string[] } },
        },
      ]),
    )

    const field = result.fields[0] as Extract<Field, { type: 'text' }>
    expect(field.admin?.components?.afterInput).toEqual([existing, AI_TEXT])
  })

  it('does not inject under hidden, read-only, or disabled containers', () => {
    const result = withAIGeneration(
      makeCollection([
        {
          name: 'populatedAuthors',
          type: 'array',
          admin: { disabled: true, readOnly: true },
          fields: [{ name: 'authorName', type: 'text' }],
        },
        {
          name: 'archive',
          type: 'group',
          hidden: true,
          fields: [{ name: 'note', type: 'text' }],
        },
      ]),
    )

    const authors = result.fields[0] as Extract<Field, { type: 'array' }>
    const archive = result.fields[1] as Extract<Field, { type: 'group' }>
    expect(fieldComponent(authors.fields[0])).toBeUndefined()
    expect(fieldComponent(archive.fields[0])).toBeUndefined()
  })

  it('passes hidden, locked, and relationship paths to the control as contextExcludePaths', () => {
    const result = withAIGeneration(
      makeCollection([
        { name: 'title', type: 'text' },
        { name: 'etsyTitle', type: 'text', hidden: true },
        { name: 'rawEtsyDescription', type: 'textarea', hidden: true },
        {
          name: 'internal',
          type: 'group',
          fields: [{ name: 'syncNotes', type: 'textarea', admin: { hidden: true } }],
        },
        {
          name: 'populatedAuthors',
          type: 'array',
          admin: { disabled: true, readOnly: true },
          fields: [{ name: 'authorName', type: 'text' }],
        },
        // Relationship/upload values are machine IDs — never prompt context.
        { name: 'authors', type: 'relationship', relationTo: 'users', hasMany: true },
        { name: 'heroImage', type: 'upload', relationTo: 'media' },
      ]),
    )

    const entry = fieldComponent(result.fields[0]) as {
      path: string
      clientProps: { contextExcludePaths: string[] }
    }
    expect(entry.path).toBe(AI_TEXT)
    expect(entry.clientProps.contextExcludePaths).toEqual([
      'etsyTitle',
      'rawEtsyDescription',
      'internal.syncNotes',
      'populatedAuthors',
      'authors',
      'heroImage',
    ])
  })

  it('as a plugin, covers plugin-added collections but not excluded ones', async () => {
    // Runs last in the plugin chain, so collections added by earlier plugins
    // (like the form builder's `forms`) are present by the time it executes.
    const config = {
      collections: [
        makeCollection([{ name: 'title', type: 'text' }]),
        {
          slug: 'forms',
          fields: [
            // Lookup key used by getCachedFormByTitle — never AI-generated.
            { name: 'title', type: 'text' },
            { name: 'submitButtonLabel', type: 'text' },
            {
              name: 'fields',
              type: 'blocks',
              blocks: [
                {
                  slug: 'text',
                  fields: [
                    // Machine key react-hook-form registers and submissions store under.
                    { name: 'name', type: 'text' },
                    { name: 'label', type: 'text' },
                    // Must exactly match an option value on selects — not prose.
                    { name: 'defaultValue', type: 'text' },
                  ],
                },
              ],
            },
          ],
        },
        {
          slug: 'products',
          fields: [
            { name: 'tagline', type: 'text' },
            {
              name: 'specifications',
              type: 'array',
              fields: [
                { name: 'label', type: 'text' },
                // Factual measurements rendered verbatim on the product page.
                { name: 'value', type: 'text' },
              ],
            },
          ],
        },
        { slug: 'redirects', fields: [{ name: 'from', type: 'text' }] },
        { slug: 'search', fields: [{ name: 'title', type: 'text' }] },
        { slug: 'form-submissions', fields: [{ name: 'value', type: 'text' }] },
        { slug: 'users', fields: [{ name: 'name', type: 'text' }] },
        { slug: 'etsy-tokens', fields: [{ name: 'label', type: 'text' }] },
        { slug: 'payload-mcp-api-keys', fields: [{ name: 'label', type: 'text' }] },
      ],
      globals: [{ slug: 'header', fields: [{ name: 'tagline', type: 'text' }] }],
    } as unknown as Config

    const result = await aiGenerationPlugin(config)

    const bySlug = Object.fromEntries((result.collections ?? []).map((c) => [c.slug, c]))
    expect(fieldComponent(bySlug['test']?.fields[0])).toBe(AI_TEXT)
    // The form title is a lookup key; the submit button label is copy.
    expect(fieldComponent(bySlug['forms']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['forms']?.fields[1])).toBe(AI_TEXT)

    // Copy fields in form-builder blocks get the control; schema keys don't.
    const formFieldBlocks = bySlug['forms']?.fields[2] as Extract<Field, { type: 'blocks' }>
    const textBlockFields = formFieldBlocks.blocks?.[0]?.fields ?? []
    expect(fieldComponent(textBlockFields[0])).toBeUndefined()
    expect(fieldComponent(textBlockFields[1])).toBe(AI_TEXT)
    expect(fieldComponent(textBlockFields[2])).toBeUndefined()
    // Product copy stays eligible; factual spec values don't.
    expect(fieldComponent(bySlug['products']?.fields[0])).toBe(AI_TEXT)
    const specs = bySlug['products']?.fields[1] as Extract<Field, { type: 'array' }>
    expect(fieldComponent(specs.fields[0])).toBe(AI_TEXT)
    expect(fieldComponent(specs.fields[1])).toBeUndefined()

    expect(fieldComponent(bySlug['redirects']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['search']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['form-submissions']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['users']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['etsy-tokens']?.fields[0])).toBeUndefined()
    expect(fieldComponent(bySlug['payload-mcp-api-keys']?.fields[0])).toBeUndefined()
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

describe('rate limiter', () => {
  it('allows up to the limit within the window, then blocks and recovers', () => {
    const isAllowed = createRateLimiter({ limit: 3, windowMs: 60_000 })
    const t0 = 1_000_000

    expect(isAllowed('user-1', t0)).toBe(true)
    expect(isAllowed('user-1', t0 + 1_000)).toBe(true)
    expect(isAllowed('user-1', t0 + 2_000)).toBe(true)
    expect(isAllowed('user-1', t0 + 3_000)).toBe(false)

    // Other keys are unaffected.
    expect(isAllowed('user-2', t0 + 3_000)).toBe(true)

    // Once the window slides past the first hits, requests flow again.
    expect(isAllowed('user-1', t0 + 61_500)).toBe(true)
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

  it('defaults tone to poetic and folds the tone voice into the system prompt', () => {
    const parsed = fieldCopyInputSchema.parse({
      fieldLabel: 'Tagline',
      fieldName: 'tagline',
      variant: 'text',
    })
    expect(parsed.tone).toBe('poetic')
    expect(fieldSystemPrompt('minimal')).toContain('clean and direct')
    expect(fieldSystemPrompt('poetic')).toContain('single CMS field')
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
