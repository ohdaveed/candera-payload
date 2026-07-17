/**
 * Read-time estimation for Lexical rich-text content — the single
 * implementation shared by the post and how-to detail pages (FE-07 in
 * docs/tech-debt-remediation-2026-07-16.md). Counting words on
 * `JSON.stringify(content)` output mixes structural keys and syntax into the
 * count, so we walk the Lexical node tree and count only text nodes.
 */

const AVERAGE_WORDS_PER_MINUTE = 200

/** Recursively concatenates the text nodes of a Lexical editor state. */
export function extractLexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const n = node as Record<string, unknown>

  if (typeof n.text === 'string') return n.text
  if (Array.isArray(n.children)) return n.children.map(extractLexicalText).join(' ')
  if (n.root) return extractLexicalText(n.root)

  return ''
}

/** Whitespace-delimited word count; empty/blank text counts as zero words. */
export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

/** Estimated minutes to read a Lexical `content` value, with a floor of 1. */
export function calculateReadTime(
  content: unknown,
  wordsPerMinute: number = AVERAGE_WORDS_PER_MINUTE,
): number {
  const wordCount = countWords(extractLexicalText(content))
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}
