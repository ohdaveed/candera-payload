import type { CollectionConfig, CustomComponent, Field, GlobalConfig, Plugin, Tab } from 'payload'

/**
 * Config transform that appends a "Generate with AI" `afterInput` control
 * (`AIGenerateTextField.tsx`) to every eligible `text`/`textarea` field. The
 * default field component stays in place, so labels, `admin.width`, and row
 * layouts are unaffected.
 *
 * Registered in `payload.config.ts` via `aiGenerationPlugin`.
 * Machine-managed or credential-ish fields (slugs, URLs, tokens, IDs…),
 * hidden/read-only fields (including those under hidden/read-only containers),
 * and fields that already ship a custom `Field` component are left untouched.
 * Each control also receives the entity's hidden-field paths so the client
 * never sends hidden data (e.g. raw Etsy backups) to the model as context.
 */

const AI_TEXT_COMPONENT = '@/components/admin/AIGenerateTextField#AITextAfterInput'
const AI_TEXTAREA_COMPONENT = '@/components/admin/AIGenerateTextField#AITextareaAfterInput'

// Field names where AI-generated prose is nonsensical or dangerous. `vessel`
// is exact-match: Products uses it as the SKU in structured data and as the
// candle/decor guard value.
const SKIP_NAME_PATTERN = /slug|url|href|email|phone|token|secret|password|filename|sku|^vessel$/i
// ID endings only (`id`, `ID`, `foo_id`, `fooId`) — deliberately case-sensitive on
// the second alternative so words that merely end in "id" (orchid, liquid,
// hybrid) stay eligible.
const ID_SUFFIX_PATTERN = /(^|_)[iI][dD]$|I[Dd]$/

/** Admin flags shared across field variants, read structurally — the union's
 * `admin` types don't all declare them. */
function adminFlags(field: Field): { disabled?: unknown; hidden?: unknown; readOnly?: unknown } {
  return (field.admin ?? {}) as { disabled?: unknown; hidden?: unknown; readOnly?: unknown }
}

/** True when a container field hides or locks everything beneath it. */
function blocksDescendants(field: Field): boolean {
  if ('hidden' in field && field.hidden) return true
  if ('virtual' in field && field.virtual) return true
  const admin = adminFlags(field)
  return Boolean(admin.hidden || admin.readOnly || admin.disabled)
}

function isEligible(
  field: Extract<Field, { type: 'text' | 'textarea' }>,
  extraSkip?: RegExp,
): boolean {
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  // Don't clobber fields that already provide a custom component (e.g. the
  // SEO plugin's meta fields, which ship their own generator UI).
  if (field.admin?.components?.Field) return false
  // `hasMany` text fields hold string arrays — the single-value generator
  // doesn't apply.
  if (field.type === 'text' && field.hasMany) return false
  if (extraSkip?.test(field.name)) return false
  return !SKIP_NAME_PATTERN.test(field.name) && !ID_SUFFIX_PATTERN.test(field.name)
}

/**
 * Dot paths (by field name, without array indices) of fields the admin never
 * shows or the editor cannot author — hidden, disabled, read-only, or virtual.
 * Their values must not be sent to the model as prompt context.
 */
function collectHiddenPaths(fields: Field[], prefix: string, out: string[]): void {
  for (const field of fields) {
    const name = 'name' in field && typeof field.name === 'string' ? field.name : undefined

    if (
      name &&
      (('hidden' in field && field.hidden) ||
        ('virtual' in field && field.virtual) ||
        adminFlags(field).hidden ||
        adminFlags(field).disabled ||
        adminFlags(field).readOnly)
    ) {
      out.push(`${prefix}${name}`)
      continue // everything beneath is covered by the prefix
    }

    switch (field.type) {
      case 'group':
      case 'array':
        collectHiddenPaths(field.fields, name ? `${prefix}${name}.` : prefix, out)
        break
      case 'row':
      case 'collapsible':
        collectHiddenPaths(field.fields, prefix, out)
        break
      case 'tabs':
        for (const tab of field.tabs) {
          const tabName = 'name' in tab && typeof tab.name === 'string' ? tab.name : undefined
          collectHiddenPaths(tab.fields, tabName ? `${prefix}${tabName}.` : prefix, out)
        }
        break
      case 'blocks':
        if (name && field.blocks) {
          for (const block of field.blocks) {
            collectHiddenPaths(block.fields, `${prefix}${name}.`, out)
          }
        }
        break
      default:
        break
    }
  }
}

function appendAIControl(
  existing: CustomComponent[] | undefined,
  component: string,
  contextExcludePaths: string[],
): CustomComponent[] {
  // The type says array, but normalize defensively in case an untyped config
  // supplies a single component.
  const current = existing == null ? [] : Array.isArray(existing) ? existing : [existing]
  const entry: CustomComponent =
    contextExcludePaths.length > 0
      ? { path: component, clientProps: { contextExcludePaths } }
      : component
  return [...current, entry]
}

function mapFields(fields: Field[], contextExcludePaths: string[], extraSkip?: RegExp): Field[] {
  return fields.map((field): Field => {
    switch (field.type) {
      case 'text':
        if (!isEligible(field, extraSkip)) return field
        return {
          ...field,
          admin: {
            ...field.admin,
            components: {
              ...field.admin?.components,
              afterInput: appendAIControl(
                field.admin?.components?.afterInput,
                AI_TEXT_COMPONENT,
                contextExcludePaths,
              ),
            },
          },
        }
      case 'textarea':
        if (!isEligible(field, extraSkip)) return field
        return {
          ...field,
          admin: {
            ...field.admin,
            components: {
              ...field.admin?.components,
              afterInput: appendAIControl(
                field.admin?.components?.afterInput,
                AI_TEXTAREA_COMPONENT,
                contextExcludePaths,
              ),
            },
          },
        }
      case 'group':
      case 'array':
      case 'row':
      case 'collapsible':
        // A hidden/read-only/disabled container locks its whole subtree — no
        // field inside it should offer AI generation.
        if (blocksDescendants(field)) return field
        return { ...field, fields: mapFields(field.fields, contextExcludePaths, extraSkip) }
      case 'tabs':
        return {
          ...field,
          tabs: field.tabs.map(
            (tab): Tab => ({
              ...tab,
              fields: mapFields(tab.fields, contextExcludePaths, extraSkip),
            }),
          ),
        }
      case 'blocks':
        // Configs using `blockReferences` have no inline `blocks` array — leave those as-is.
        if (!field.blocks) return field
        if (blocksDescendants(field)) return field
        return {
          ...field,
          blocks: field.blocks.map((block) => ({
            ...block,
            fields: mapFields(block.fields, contextExcludePaths, extraSkip),
          })),
        }
      default:
        return field
    }
  })
}

export function withAIGeneration<T extends CollectionConfig | GlobalConfig>(
  config: T,
  extraSkip?: RegExp,
): T {
  const hiddenPaths: string[] = []
  collectHiddenPaths(config.fields, '', hiddenPaths)
  return { ...config, fields: mapFields(config.fields, hiddenPaths, extraSkip) }
}

// Collections whose text fields must never get the AI control: account data,
// credentials, and machine-managed collections added by plugins.
const AI_EXCLUDED_COLLECTIONS = new Set([
  'users', // account data
  'etsy-tokens', // OAuth credentials
  'payload-mcp-api-keys', // MCP API keys (plugin-mcp)
  'redirects', // machine-managed paths (redirects plugin)
  'search', // machine-managed index (search plugin)
  'form-submissions', // visitor-submitted data (form builder plugin)
])

// In the form builder's Forms collection, each field block's `name` (and
// option `value`) is the machine key that submissions are stored and
// forwarded under; a select's `defaultValue` must exactly match an option
// value; and `cc`/`bcc`/`replyTo` are email routing (emailTo/emailFrom are
// already caught by the `email` substring). Prose in any of these breaks
// submissions or notifications. Labels, subjects, and messages stay eligible.
const FORM_SCHEMA_KEY_PATTERN = /^(name|value|defaultValue|cc|bcc|replyTo)$/

/**
 * Registered LAST in the plugin chain so it also sees collections added by
 * earlier plugins (e.g. the form builder's Forms) — a plain `.map` over the
 * `collections` array would run before plugins and miss them.
 */
export const aiGenerationPlugin: Plugin = (config) => ({
  ...config,
  collections: (config.collections ?? []).map((collection) => {
    if (AI_EXCLUDED_COLLECTIONS.has(collection.slug)) return collection
    if (collection.slug === 'forms') return withAIGeneration(collection, FORM_SCHEMA_KEY_PATTERN)
    return withAIGeneration(collection)
  }),
  globals: (config.globals ?? []).map((global) => withAIGeneration(global)),
})
