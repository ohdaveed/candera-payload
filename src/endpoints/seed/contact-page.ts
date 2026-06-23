import type { Form } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'

type ContactArgs = {
  contactForm: Form
}

export const contact: (args: ContactArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  contactForm,
}) => {
  return {
    slug: 'contact',
    _status: 'published',
    hero: {
      type: 'none',
    },
    layout: [
      {
        blockType: 'formBlock',
        enableIntro: true,
        form: contactForm,
        introContent: createRichText([
          createHeading('A Correspondence with the Studio.', 'h1'),
          createParagraph(
            'For inquiries regarding current batches, wholesale, or personal ritual recommendations. We respond with intention.',
          ),
        ]),
      },
    ],
    title: 'Contact',
  }
}
