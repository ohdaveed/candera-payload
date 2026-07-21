import type { CollectionConfig, Field, GlobalConfig, Plugin, Tab } from 'payload'
import { AI_SENSITIVE_NAME_PATTERN, AI_ID_SUFFIX_PATTERN } from '@/lib/ai/field-copy'

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

// Exact-name skips: the substring pattern below would false-positive on
// unrelated words (e.g. "alternateTitle"), so these get an exact match.
// `alt` (Media): the client only sends textual form context, never the
// image itself — AI generation here produces plausible-but-fabricated
// descriptions, which is actively harmful for screen-reader users.
// `instagramHandle` (StudioInfo): an identifier rendered as the label for a
// separately configured `instagramUrl` — AI prose here breaks the link.
// `quote`/`author`/`location` (Testimonials block items): factual customer
// attribution, not promotional copy — generating them fabricates a review.
const EXACT_SKIP_NAMES = new Set(['alt', 'instagramHandle', 'quote', 'author', 'location'])

// Superset of EXACT_SKIP_NAMES applied only to fields nested inside a
// `blocks`-type field (see the `blocks` case in mapFields). The form builder
// plugin's `forms` collection defines each form field as a block with a
// `name` subfield that's the stable submission key — overwriting it breaks
// the form or orphans existing submissions. Its `select`/`checkbox` blocks
// also carry `options[].value` and `defaultValue`, the actual submitted
// values (not display copy) — overwriting those changes what a submission
// records or leaves the default unmatched to any option. No other block
// schema in this app uses these names for display copy, so this is scoped
// to nested block fields only; `forms`' own top-level fields
// (submitButtonLabel, confirmationMessage) are untouched and stay
// AI-eligible.
const EXACT_SKIP_NAMES_IN_BLOCKS = new Set([...EXACT_SKIP_NAMES, 'name', 'value', 'defaultValue'])

function isEligible(
  field: Extract<Field, { type: 'text' | 'textarea' }>,
  exactSkipNames: Set<string>,
): boolean {
  if (field.hidden || field.virtual) return false
  if (field.admin?.hidden || field.admin?.readOnly || field.admin?.disabled) return false
  // Don't clobber fields that already provide a custom component (e.g. the
  // SEO plugin's meta fields, which ship their own generator UI).
  if (field.admin?.components?.Field) return false
  // `hasMany` text fields hold string arrays — the single-value generator
  // doesn't apply.
  if (field.type === 'text' && field.hasMany) return false
  return (
    !exactSkipNames.has(field.name) &&
    !AI_SENSITIVE_NAME_PATTERN.test(field.name) &&
    !AI_ID_SUFFIX_PATTERN.test(field.name)
  )
}

function mapFields(fields: Field[], exactSkipNames: Set<string> = EXACT_SKIP_NAMES): Field[] {
  return fields.map((field): Field => {
    switch (field.type) {
      case 'text':
        if (!isEligible(field, exactSkipNames)) return field
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
        if (!isEligible(field, exactSkipNames)) return field
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
        return { ...field, fields: mapFields(field.fields, exactSkipNames) }
      case 'tabs':
        return {
          ...field,
          tabs: field.tabs.map(
            (tab): Tab => ({
              ...tab,
              fields: mapFields(tab.fields, exactSkipNames),
            }),
          ),
        }
      case 'blocks':
        // Configs using `blockReferences` have no inline `blocks` array — leave those as-is.
        if (!field.blocks) return field
        return {
          ...field,
          blocks: field.blocks.map((block) => ({
            ...block,
            fields: mapFields(block.fields, EXACT_SKIP_NAMES_IN_BLOCKS),
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
