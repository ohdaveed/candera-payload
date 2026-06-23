import type { Page } from '@/payload-types'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

export const legalPage = (title: string): Partial<Page> => ({
  title,
  slug: title.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-'),
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: createRichText([createHeading(title, 'h1')]),
  },
  layout: [
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: createRichText([
            createParagraph(`This is the ${title} page. Content coming soon.`),
          ]),
        },
      ],
    },
  ],
})
