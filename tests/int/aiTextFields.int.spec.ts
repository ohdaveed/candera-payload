import { describe, it, expect, beforeAll } from 'vite-plus/test'
import type { Field, SanitizedConfig } from 'payload'
import {
  AI_EXCLUDED_SLUGS,
  AI_FIELD_COMPONENTS,
  injectAIGenerateOption,
} from '@/plugins/aiTextFields'
import config from '@/payload.config'

type TextLikeField = Extract<Field, { type: 'text' | 'textarea' }>

type FoundField = {
  field: TextLikeField
  name: string
  component: unknown
}

// Recursively collects every text/textarea field, mirroring the plugin's traversal.
function collectTextFields(fields: Field[], found: FoundField[] = []): FoundField[] {
  for (const field of fields) {
    if (field.type === 'text' || field.type === 'textarea') {
      found.push({
        field,
        name: 'name' in field ? field.name : '(unnamed)',
        component: field.admin?.components?.Field,
      })
    } else if (field.type === 'tabs') {
      for (const tab of field.tabs) collectTextFields(tab.fields, found)
    } else if (field.type === 'blocks' && Array.isArray(field.blocks)) {
      for (const block of field.blocks) collectTextFields(block.fields, found)
    } else if ('fields' in field && Array.isArray(field.fields)) {
      collectTextFields(field.fields, found)
    }
  }
  return found
}

// Same eligibility rules the plugin applies. A field with a non-AI custom
// component counts as ineligible (the plugin must not override it).
function isEligible(found: FoundField): boolean {
  const { field } = found
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  if (field.type === 'text' && field.hasMany) return false
  if (found.component !== undefined && !isAIComponent(found.component)) return false
  return true
}

function isAIComponent(component: unknown): boolean {
  return component === AI_FIELD_COMPONENTS.text || component === AI_FIELD_COMPONENTS.textarea
}

describe('injectAIGenerateOption', () => {
  it('adds the AI component to plain text and textarea fields', () => {
    const result = injectAIGenerateOption([
      { name: 'title', type: 'text' },
      { name: 'summary', type: 'textarea' },
    ])
    const [title, summary] = collectTextFields(result)
    expect(title.component).toBe(AI_FIELD_COMPONENTS.text)
    expect(summary.component).toBe(AI_FIELD_COMPONENTS.textarea)
  })

  it('reaches fields nested in tabs, blocks, groups, arrays, and rows', () => {
    const result = injectAIGenerateOption([
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Content',
            fields: [
              {
                name: 'layout',
                type: 'blocks',
                blocks: [
                  {
                    slug: 'cta',
                    fields: [
                      {
                        name: 'inner',
                        type: 'group',
                        fields: [
                          {
                            name: 'items',
                            type: 'array',
                            fields: [
                              {
                                type: 'row',
                                fields: [{ name: 'deep', type: 'text' }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ])
    const found = collectTextFields(result)
    expect(found).toHaveLength(1)
    expect(found[0].name).toBe('deep')
    expect(found[0].component).toBe(AI_FIELD_COMPONENTS.text)
  })

  it('skips hidden, read-only, virtual, hasMany, and custom-component fields', () => {
    const result = injectAIGenerateOption([
      { name: 'hiddenField', type: 'text', hidden: true },
      { name: 'adminHidden', type: 'text', admin: { hidden: true } },
      { name: 'readOnly', type: 'text', admin: { readOnly: true } },
      { name: 'disabled', type: 'text', admin: { disabled: true } },
      { name: 'virtualField', type: 'text', virtual: true },
      { name: 'many', type: 'text', hasMany: true },
      {
        name: 'custom',
        type: 'text',
        admin: { components: { Field: '@/some/Custom#Custom' } },
      },
    ])
    const found = collectTextFields(result)
    expect(found.every((f) => !isAIComponent(f.component))).toBe(true)
    // The pre-existing custom component must be preserved.
    expect(found.find((f) => f.name === 'custom')?.component).toBe('@/some/Custom#Custom')
  })

  it('does not mutate the input field configs', () => {
    const input: Field[] = [{ name: 'title', type: 'text' }]
    injectAIGenerateOption(input)
    expect(input[0].admin?.components?.Field).toBeUndefined()
  })
})

describe('payload config wiring', () => {
  let payloadConfig: SanitizedConfig

  // Field names Payload itself appends during sanitization (upload/auth/folder
  // internals). These are added AFTER plugins run, so the plugin never sees
  // them — and none of them are editor-authored copy.
  const sanitizeAdded = new Set([
    'filename',
    'mimeType',
    'url',
    'thumbnailURL',
    'email',
    'salt',
    'hash',
    'prefix',
    '_folderSearch',
    'focalX',
    'focalY',
  ])

  beforeAll(async () => {
    payloadConfig = await config
  })

  it('gives every eligible text field in every non-excluded collection the AI component', () => {
    let checked = 0
    for (const collection of payloadConfig.collections) {
      if (AI_EXCLUDED_SLUGS.has(collection.slug)) continue
      // Internal payload-* collections (jobs, preferences, …) are created at
      // sanitize time, after plugins run.
      if (collection.slug.startsWith('payload-')) continue

      for (const found of collectTextFields(collection.fields)) {
        if (sanitizeAdded.has(found.name)) continue
        if (!isEligible(found)) continue
        checked += 1
        expect(
          isAIComponent(found.component),
          `${collection.slug}.${found.name} should have the AI generate component`,
        ).toBe(true)
      }
    }
    // Guard against the traversal silently matching nothing.
    expect(checked).toBeGreaterThan(20)
  })

  it('gives every eligible text field in every global the AI component', () => {
    let checked = 0
    for (const global of payloadConfig.globals) {
      if (AI_EXCLUDED_SLUGS.has(global.slug)) continue
      for (const found of collectTextFields(global.fields)) {
        if (!isEligible(found)) continue
        checked += 1
        expect(
          isAIComponent(found.component),
          `${global.slug}.${found.name} should have the AI generate component`,
        ).toBe(true)
      }
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('wires known editor-facing fields in products and pages', () => {
    const products = payloadConfig.collections.find((c) => c.slug === 'products')!
    const productFields = collectTextFields(products.fields)
    for (const name of ['title', 'tagline', 'customizationLabel', 'burnTime', 'vessel']) {
      const field = productFields.find((f) => f.name === name)
      expect(field, `products.${name} should exist`).toBeDefined()
      expect(isAIComponent(field!.component), `products.${name} should have AI component`).toBe(
        true,
      )
    }
    // Hidden Etsy backup fields must NOT get the component.
    for (const name of ['etsyTitle', 'rawEtsyDescription']) {
      const field = productFields.find((f) => f.name === name)
      expect(field).toBeDefined()
      expect(isAIComponent(field!.component)).toBe(false)
    }

    const pages = payloadConfig.collections.find((c) => c.slug === 'pages')!
    const pageTitle = collectTextFields(pages.fields).find((f) => f.name === 'title')
    expect(isAIComponent(pageTitle?.component)).toBe(true)
  })

  it('leaves excluded system collections untouched', () => {
    let sawExcluded = 0
    for (const collection of payloadConfig.collections) {
      if (!AI_EXCLUDED_SLUGS.has(collection.slug)) continue
      sawExcluded += 1
      const found = collectTextFields(collection.fields)
      expect(
        found.every((f) => !isAIComponent(f.component)),
        `${collection.slug} should have no AI components`,
      ).toBe(true)
    }
    expect(sawExcluded).toBeGreaterThan(0)
  })
})
