import type { Page } from '@/payload-types'
import { createHeading, createParagraph, createRichText } from '@/utilities/lexicalHelpers'

// -------------------------------------------------------------------------
// Content builders (reuse the shared Lexical helpers)
// -------------------------------------------------------------------------

type ContentNode = ReturnType<typeof createHeading> | ReturnType<typeof createParagraph>

// A clearly-marked banner so an unreviewed legal page is never mistaken for final
// copy. Bold (format: 1) to stand out in the rendered page.
const draftBanner = (): ContentNode =>
  createParagraph(
    'DRAFT — placeholder content pending legal review. Replace this page with counsel-reviewed copy before launch.',
    1,
  )

type Section = { heading: string; body: string[] }

const sectionsToContent = (sections: Section[]): ContentNode[] => {
  const children: ContentNode[] = [draftBanner()]
  for (const section of sections) {
    children.push(createHeading(section.heading))
    for (const para of section.body) {
      children.push(createParagraph(para))
    }
  }
  return children
}

// -------------------------------------------------------------------------
// Per-page boilerplate (generic, non-binding — for review)
// -------------------------------------------------------------------------

const PRIVACY: Section[] = [
  {
    heading: 'Information We Collect',
    body: [
      'When you contact us, join the Inner Circle, or take the scent quiz, we collect the information you provide — typically your email address and any message or preferences you share.',
      'When you purchase a candle, the transaction is completed on Etsy. Etsy collects and processes your order and payment information under its own privacy policy.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    body: [
      'We use your information to respond to enquiries, send studio updates you have asked to receive, and improve the products and experiences we offer. We do not sell your personal information.',
    ],
  },
  {
    heading: 'Service Providers',
    body: [
      'We share limited information with third parties that help us operate, including Etsy (orders), our email and form-handling providers, and our hosting and database providers. Each processes data on our behalf under their own terms.',
    ],
  },
  {
    heading: 'Your Choices',
    body: [
      'You can unsubscribe from studio emails at any time using the link in any message, and you may contact us to request access to or deletion of the information we hold about you.',
    ],
  },
  {
    heading: 'Contact',
    body: [
      'Questions about this policy can be sent to the studio using the details on our Contact page.',
    ],
  },
]

const TERMS: Section[] = [
  {
    heading: 'Use of This Site',
    body: [
      'By using this website you agree to use it lawfully and not to interfere with its operation or security. Product availability, batch numbers, and pricing are subject to change.',
    ],
  },
  {
    heading: 'Orders & Purchases',
    body: [
      'Purchases are fulfilled through our Etsy storefront and are governed by Etsy’s policies in addition to these terms. We make every effort to describe scents and materials accurately, but small variations are part of hand-poured, micro-batch craft.',
    ],
  },
  {
    heading: 'Intellectual Property',
    body: [
      'All content on this site — including text, imagery, branding, and design — is owned by the studio or its licensors and may not be reused without permission.',
    ],
  },
  {
    heading: 'Limitation of Liability',
    body: [
      'This site and its content are provided “as is.” To the fullest extent permitted by law, we are not liable for indirect or incidental damages arising from its use.',
    ],
  },
  {
    heading: 'Governing Law',
    body: [
      'These terms are governed by the laws of the studio’s jurisdiction. _Confirm jurisdiction before launch._',
    ],
  },
]

const SHIPPING: Section[] = [
  {
    heading: 'Processing & Shipping',
    body: [
      'Because each candle is hand-poured in numbered batches, orders may require a short curing and preparation window before they ship. Estimated processing and delivery times are shown at checkout on Etsy.',
    ],
  },
  {
    heading: 'Returns & Exchanges',
    body: [
      'If something arrives damaged or not as described, contact us promptly and we will make it right. Because candles are personal-care goods, used items may not be eligible for return except where required by law.',
    ],
  },
  {
    heading: 'Questions',
    body: [
      'For help with an order, reach the studio via our Contact page with your Etsy order number.',
    ],
  },
]

const WHOLESALE: Section[] = [
  {
    heading: 'Stock Candera',
    body: [
      'We partner with a small number of considered retailers who share our commitment to intentional craft. Wholesale is offered on selected collections subject to availability.',
    ],
  },
  {
    heading: 'How It Works',
    body: [
      'Get in touch with details about your shop and the collections you are interested in. We will follow up with current availability, minimums, and lead times for upcoming batches.',
    ],
  },
  {
    heading: 'Enquire',
    body: ['Start a wholesale conversation through our Contact page.'],
  },
]

const CONTENT_BY_TITLE: Record<string, Section[]> = {
  'Privacy Policy': PRIVACY,
  'Terms of Service': TERMS,
  'Shipping & Returns': SHIPPING,
  Wholesale: WHOLESALE,
}

export const legalPage = (title: string): Partial<Page> => {
  const sections = CONTENT_BY_TITLE[title]
  const contentChildren = sections
    ? sectionsToContent(sections)
    : [draftBanner(), createParagraph(`This is the ${title} page. Content pending.`)]

  return {
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
            richText: createRichText(contentChildren),
          },
        ],
      },
    ],
  }
}
