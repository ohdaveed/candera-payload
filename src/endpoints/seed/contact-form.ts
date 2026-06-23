import { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'
import { FORM_TITLES } from '@/constants/forms'
import { BRAND } from '@/constants/brand'

export const contactForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: createRichText([
    createHeading(
      'Your correspondence has reached the studio. We respond with intention — expect a reply within 48 hours.',
      'h2',
    ),
  ]),
  confirmationType: 'message',
  createdAt: '2023-01-12T21:47:41.374Z',
  emails: [
    {
      emailFrom: `"Candera Studio" <${BRAND.email}>`,
      emailTo: '{{email}}',
      message: createRichText([
        createParagraph('Your contact form submission was successfully received.'),
      ]),
      subject: "You've received a new message.",
    },
  ],
  fields: [
    {
      name: 'full-name',
      blockName: 'full-name',
      blockType: 'text',
      label: 'Full Name',
      required: true,
      width: 100,
    },
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
    {
      name: 'phone',
      blockName: 'phone',
      blockType: 'number',
      label: 'Phone',
      required: false,
      width: 100,
    },
    {
      name: 'message',
      blockName: 'message',
      blockType: 'textarea',
      label: 'Message',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Send Correspondence',
  title: FORM_TITLES.CONTACT,
  updatedAt: '2023-01-12T21:47:41.374Z',
}
