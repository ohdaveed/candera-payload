import { describe, expect, it } from 'vitest'

import { calculateReadTime, countWords, extractLexicalText } from '@/utilities/readTime'

// Regression guard for FE-07 (tech-debt-remediation-2026-07-16): read time must
// be computed from the Lexical text nodes only — the old posts implementation
// counted whitespace-delimited chunks of JSON.stringify(content), mixing
// structural keys and syntax into the word count.

const paragraph = (text: string) => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', text, version: 1 }],
})

const lexicalFixture = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      paragraph('Botanical wax cures slowly in the studio'),
      paragraph('while ember scents settle overnight'),
    ],
  },
}

describe('extractLexicalText', () => {
  it('walks the tree and returns only text-node content', () => {
    expect(extractLexicalText(lexicalFixture)).toBe(
      'Botanical wax cures slowly in the studio while ember scents settle overnight',
    )
  })

  it('does not surface structural JSON keys or values', () => {
    const text = extractLexicalText(lexicalFixture)
    for (const structural of ['root', 'paragraph', 'type', 'children', 'version', 'format']) {
      expect(text).not.toContain(structural)
    }
  })

  it('returns empty text for null, undefined, and non-object content', () => {
    expect(extractLexicalText(null)).toBe('')
    expect(extractLexicalText(undefined)).toBe('')
    expect(extractLexicalText('a plain string')).toBe('')
  })
})

describe('countWords', () => {
  it('counts whitespace-delimited words', () => {
    expect(countWords('one two  three\n four')).toBe(4)
  })

  it('counts blank text as zero words', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   \n ')).toBe(0)
  })
})

describe('calculateReadTime', () => {
  it('counts only authored words — JSON keys are not counted', () => {
    const authoredWordCount = countWords(extractLexicalText(lexicalFixture))
    expect(authoredWordCount).toBe(12)

    // The old implementation split the serialized JSON instead — a different
    // (syntax-polluted) number for the same content.
    const stringifiedChunkCount = JSON.stringify(lexicalFixture).split(/\s+/).length
    expect(stringifiedChunkCount).not.toBe(authoredWordCount)
  })

  it('floors at one minute for short or empty content', () => {
    expect(calculateReadTime(lexicalFixture)).toBe(1)
    expect(calculateReadTime(null)).toBe(1)
    expect(calculateReadTime({ root: { type: 'root', children: [] } })).toBe(1)
  })

  it('scales with word count at 200 wpm', () => {
    const longFixture = {
      root: {
        type: 'root',
        children: [paragraph(Array.from({ length: 400 }, () => 'word').join(' '))],
      },
    }
    expect(calculateReadTime(longFixture)).toBe(2)
    expect(calculateReadTime(longFixture, 100)).toBe(4)
  })
})
