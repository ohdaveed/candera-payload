/**
 * Helper functions for constructing Lexical rich text nodes.
 * Reduces boilerplate in seed data files.
 */

type LexicalTextNode = {
  type: 'text'
  detail: 0
  format: 0
  mode: 'normal'
  style: ''
  text: string
  version: 1
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type LexicalHeadingNode = {
  type: 'heading'
  children: [LexicalTextNode]
  direction: 'ltr'
  format: ''
  indent: 0
  tag: HeadingTag
  version: 1
}

type LexicalParagraphNode = {
  type: 'paragraph'
  children: [LexicalTextNode]
  direction: 'ltr'
  format: ''
  indent: 0
  textFormat: 0
  version: 1
}

type LexicalRootNode = {
  type: 'root'
  children: (LexicalHeadingNode | LexicalParagraphNode)[]
  direction: 'ltr'
  format: ''
  indent: 0
  version: 1
}

type LexicalRichText = {
  root: LexicalRootNode
}

export const createTextNode = (text: string): LexicalTextNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

export const createHeading = (text: string, tag: HeadingTag = 'h2'): LexicalHeadingNode => ({
  type: 'heading',
  children: [createTextNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

export const createParagraph = (text: string): LexicalParagraphNode => ({
  type: 'paragraph',
  children: [createTextNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const createRichText = (
  children: (LexicalHeadingNode | LexicalParagraphNode)[],
): LexicalRichText => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})