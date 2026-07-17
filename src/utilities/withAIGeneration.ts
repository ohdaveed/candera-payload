import type { CollectionConfig, Field, GlobalConfig, Tab } from 'payload'

/**
 * Config transform that swaps every eligible `text`/`textarea` field's admin
 * component for the AI-enabled variant (`AIGenerateTextField.tsx`), which
 * renders the default field plus a "Generate with AI" control.
 *
 * Applied in `payload.config.ts` to all content collections and globals.
 * Machine-managed or credential-ish fields (slugs, URLs, tokens, IDs…),
 * hidden/read-only fields, and fields that already ship a custom `Field`
 * component are left untouched.
 */

const AI_TEXT_COMPONENT = '@/components/admin/AIGenerateTextField#AITextField'
const AI_TEXTAREA_COMPONENT = '@/components/admin/AIGenerateTextField#AITextareaField'

// Field names where AI-generated prose is nonsensical or dangerous.
const SKIP_NAME_PATTERN = /slug|url|href|email|phone|token|secret|password|filename|id$/i

function isEligible(field: Extract<Field, { type: 'text' | 'textarea' }>): boolean {
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  // Don't clobber fields that already provide a custom component (e.g. the
  // SEO plugin's meta fields, which ship their own generator UI).
  if (field.admin?.components?.Field) return false
  // `hasMany` text fields hold string arrays — the single-value generator
  // doesn't apply.
  if (field.type === 'text' && field.hasMany) return false
  return !SKIP_NAME_PATTERN.test(field.name)
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
            components: { ...field.admin?.components, Field: AI_TEXT_COMPONENT },
          },
        }
      case 'textarea':
        if (!isEligible(field)) return field
        return {
          ...field,
          admin: {
            ...field.admin,
            components: { ...field.admin?.components, Field: AI_TEXTAREA_COMPONENT },
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
