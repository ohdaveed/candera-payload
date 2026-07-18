import type { CollectionConfig, Field, GlobalConfig, Plugin, Tab } from 'payload'

/**
 * Config transform that appends a "Generate with AI" `afterInput` control
 * (`AIGenerateTextField.tsx`) to every eligible `text`/`textarea` field. The
 * default field component stays in place, so labels, `admin.width`, and row
 * layouts are unaffected.
 *
 * Applied in `payload.config.ts` to all content collections and globals.
 * Machine-managed or credential-ish fields (slugs, URLs, tokens, IDs…),
 * hidden/read-only fields, and fields that already ship a custom `Field`
 * component are left untouched.
 */

const AI_TEXT_COMPONENT = '@/components/admin/AIGenerateTextField#AITextAfterInput'
const AI_TEXTAREA_COMPONENT = '@/components/admin/AIGenerateTextField#AITextareaAfterInput'

// Field names where AI-generated prose is nonsensical or dangerous.
const SKIP_NAME_PATTERN = /slug|url|href|email|phone|token|secret|password|filename/i
// ID endings only (`id`, `ID`, `foo_id`, `fooId`) — deliberately case-sensitive on
// the second alternative so words that merely end in "id" (orchid, liquid,
// hybrid) stay eligible.
const ID_SUFFIX_PATTERN = /(^|_)[iI][dD]$|I[Dd]$/

function isEligible(field: Extract<Field, { type: 'text' | 'textarea' }>): boolean {
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  // Don't clobber fields that already provide a custom component (e.g. the
  // SEO plugin's meta fields, which ship their own generator UI).
  if (field.admin?.components?.Field) return false
  // `hasMany` text fields hold string arrays — the single-value generator
  // doesn't apply.
  if (field.type === 'text' && field.hasMany) return false
  return !SKIP_NAME_PATTERN.test(field.name) && !ID_SUFFIX_PATTERN.test(field.name)
}

function mapFields(fields: Field[]): Field[] {
  return fields.map((field): Field => {
    switch (field.type) {
      case 'text':
        if (!isEligible(field)) return field
        return {
          ...field,
          admin: {
            ...field.admin,
            components: {
              ...field.admin?.components,
              afterInput: [...(field.admin?.components?.afterInput ?? []), AI_TEXT_COMPONENT],
            },
          },
        }
      case 'textarea':
        if (!isEligible(field)) return field
        return {
          ...field,
          admin: {
            ...field.admin,
            components: {
              ...field.admin?.components,
              afterInput: [...(field.admin?.components?.afterInput ?? []), AI_TEXTAREA_COMPONENT],
            },
          },
        }
      case 'group':
      case 'array':
      case 'row':
      case 'collapsible':
        return { ...field, fields: mapFields(field.fields) }
      case 'tabs':
        return {
          ...field,
          tabs: field.tabs.map((tab): Tab => ({ ...tab, fields: mapFields(tab.fields) })),
        }
      case 'blocks':
        // Configs using `blockReferences` have no inline `blocks` array — leave those as-is.
        if (!field.blocks) return field
        return {
          ...field,
          blocks: field.blocks.map((block) => ({
            ...block,
            fields: mapFields(block.fields),
          })),
        }
      default:
        return field
    }
  })
}

export function withAIGeneration<T extends CollectionConfig | GlobalConfig>(config: T): T {
  return { ...config, fields: mapFields(config.fields) }
}

// Collections whose text fields must never get the AI control: account data,
// credentials, and machine-managed collections added by plugins.
const AI_EXCLUDED_COLLECTIONS = new Set([
  'users', // account data
  'etsy-tokens', // OAuth credentials
  'redirects', // machine-managed paths (redirects plugin)
  'search', // machine-managed index (search plugin)
  'form-submissions', // visitor-submitted data (form builder plugin)
])

/**
 * Registered LAST in the plugin chain so it also sees collections added by
 * earlier plugins (e.g. the form builder's Forms) — a plain `.map` over the
 * `collections` array would run before plugins and miss them.
 */
export const aiGenerationPlugin: Plugin = (config) => ({
  ...config,
  collections: (config.collections ?? []).map((collection) =>
    AI_EXCLUDED_COLLECTIONS.has(collection.slug) ? collection : withAIGeneration(collection),
  ),
  globals: (config.globals ?? []).map(withAIGeneration),
})
