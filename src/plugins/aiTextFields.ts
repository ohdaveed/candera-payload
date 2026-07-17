import type { CollectionConfig, Config, Field, GlobalConfig, Plugin, Tab } from 'payload'

/**
 * Injects an "AI generate loop" (generate → review → regenerate/accept) into
 * every eligible text and textarea field across all collections and globals,
 * including fields added by other plugins (this plugin must run last).
 *
 * Fields keep Payload's default input — the custom component wraps it and adds
 * the generate control (see `src/components/admin/AITextField.tsx`).
 */

export const AI_FIELD_COMPONENTS = {
  text: '@/components/admin/AITextField#AITextField',
  textarea: '@/components/admin/AITextField#AITextareaField',
} as const

// System/auth-adjacent slugs where AI copy generation makes no sense or could
// touch sensitive values (credentials, tokens, auto-synced indexes).
export const AI_EXCLUDED_SLUGS = new Set([
  'users',
  'etsy-tokens',
  'payload-mcp-api-keys',
  'search',
  'form-submissions',
  'redirects',
])

function isEligibleTextField(field: Field): field is Extract<Field, { type: 'text' | 'textarea' }> {
  if (field.type !== 'text' && field.type !== 'textarea') return false
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  // Respect existing custom field components (slug fields, SEO plugin fields, …).
  if (field.admin?.components?.Field) return false
  // `hasMany` text fields render a multi-value input the wrapper doesn't support.
  if (field.type === 'text' && field.hasMany) return false
  return true
}

// Containers that are hidden, read-only, or disabled in the admin (e.g. Posts'
// `populatedAuthors` array) must not expose the AI control on nested fields.
function isNonEditableParent(field: Field): boolean {
  if ('hidden' in field && field.hidden) return true
  const admin = field.admin as
    { disabled?: boolean; hidden?: unknown; readOnly?: boolean } | undefined
  return Boolean(admin?.disabled || admin?.hidden || admin?.readOnly)
}

function withAIComponent(field: Extract<Field, { type: 'text' | 'textarea' }>): Field {
  if (field.type === 'text') {
    return {
      ...field,
      admin: {
        ...field.admin,
        components: {
          ...field.admin?.components,
          Field: AI_FIELD_COMPONENTS.text,
        },
      },
    }
  }
  return {
    ...field,
    admin: {
      ...field.admin,
      components: {
        ...field.admin?.components,
        Field: AI_FIELD_COMPONENTS.textarea,
      },
    },
  }
}

function mapTab(tab: Tab): Tab {
  return { ...tab, fields: injectAIGenerateOption(tab.fields) }
}

export function injectAIGenerateOption(fields: Field[]): Field[] {
  return fields.map((field): Field => {
    if (isEligibleTextField(field)) {
      return withAIComponent(field)
    }

    if (isNonEditableParent(field)) {
      return field
    }

    if (field.type === 'tabs') {
      return { ...field, tabs: field.tabs.map(mapTab) }
    }

    if (field.type === 'blocks' && field.blocks) {
      return {
        ...field,
        blocks: field.blocks.map((block) => ({
          ...block,
          fields: injectAIGenerateOption(block.fields),
        })),
      }
    }

    if ('fields' in field && Array.isArray(field.fields)) {
      return { ...field, fields: injectAIGenerateOption(field.fields) }
    }

    return field
  })
}

function mapCollection(collection: CollectionConfig): CollectionConfig {
  if (AI_EXCLUDED_SLUGS.has(collection.slug)) return collection
  return { ...collection, fields: injectAIGenerateOption(collection.fields) }
}

function mapGlobal(global: GlobalConfig): GlobalConfig {
  if (AI_EXCLUDED_SLUGS.has(global.slug)) return global
  return { ...global, fields: injectAIGenerateOption(global.fields) }
}

export const aiTextFieldsPlugin: Plugin = (config: Config): Config => {
  return {
    ...config,
    collections: (config.collections ?? []).map(mapCollection),
    globals: (config.globals ?? []).map(mapGlobal),
  }
}
