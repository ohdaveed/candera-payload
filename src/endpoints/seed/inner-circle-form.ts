import { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'
import { FORM_TITLES } from '@/constants/forms'
import { BRAND } from '@/constants/brand'

export const innerCircleForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: createRichText([
    createHeading("You're in the circle.", 'h2'),
    createParagraph(
      'First access to every new batch will find you before the public announcement.',
    ),
  ]),
  confirmationType: 'message',
  createdAt: new Date().toISOString(),
  emails: [
    {
      emailFrom: `"Candera Studio" <${BRAND.email}>`,
      emailTo: '{{email}}',
      message: createRichText([
        createParagraph(
          "Welcome to the Inner Circle. You'll receive early access to every new batch before the public announcement. We look forward to sharing our studio work with you.",
        ),
      ]),
      subject: "You've joined the Inner Circle — Candera Studio",
    },
  ],
  fields: [
    {
      name: 'email',
      blockName: 'email',
      blockType: 'email',
      label: 'Email',
      required: true,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Join the Circle',
  title: FORM_TITLES.INNER_CIRCLE,
  updatedAt: new Date().toISOString(),
}
