'use client'
import { Highlight, type PrismTheme } from 'prism-react-renderer'
import React from 'react'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

// Candera-branded syntax palette: vellum/stone text tones on an obsidian
// ground, with ember accents standing in for keywords/strings. See DESIGN.md
// Colors + typography for the source palette.
const canderaCodeTheme: PrismTheme = {
  plain: {
    color: '#dacbb8', // candera-stone
    backgroundColor: '#141412', // candera-obsidian
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: '#5f6459', fontStyle: 'italic' }, // sage-text
    },
    {
      types: ['punctuation'],
      style: { color: '#dacbb8' }, // stone
    },
    {
      types: ['property', 'tag', 'constant', 'symbol', 'deleted'],
      style: { color: '#b28c9c' }, // rose
    },
    {
      types: ['boolean', 'number'],
      style: { color: '#dd7d52' }, // ember
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: { color: '#dd7d52' }, // ember
    },
    {
      types: ['operator', 'entity', 'url'],
      style: { color: '#dacbb8' }, // stone
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: { color: '#a8502b' }, // ember-strong
    },
    {
      types: ['function', 'class-name'],
      style: { color: '#f5f2ed' }, // vellum
    },
    {
      types: ['regex', 'important', 'variable'],
      style: { color: '#a8502b' }, // ember-strong
    },
  ],
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  if (!code) return null

  return (
    <Highlight code={code} language={language} theme={canderaCodeTheme}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <div className="relative">
          <pre className="bg-candera-obsidian text-candera-stone p-4 border text-xs border-border rounded-card overflow-x-auto">
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ className: 'table-row', line })}>
                <span className="table-cell select-none text-right text-candera-vellum/25">
                  {i + 1}
                </span>
                <span className="table-cell pl-4">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
          <CopyButton code={code} />
        </div>
      )}
    </Highlight>
  )
}
