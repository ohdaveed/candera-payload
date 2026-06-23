import { RequiredDataFromCollectionSlug } from 'payload'
import { createRichText, createHeading, createParagraph } from '@/utilities/lexicalHelpers'
import { FORM_TITLES } from '@/constants/forms'
import { BRAND } from '@/constants/brand'

export const scentQuizForm: RequiredDataFromCollectionSlug<'forms'> = {
  confirmationMessage: createRichText([
    createHeading('Your scent profile is on its way.', 'h2'),
    createParagraph("We'll send your full scent profile and early access details to your inbox."),
  ]),
  confirmationType: 'message',
  createdAt: new Date().toISOString(),
  emails: [
    {
      emailFrom: `"Candera Studio" <${BRAND.email}>`,
      emailTo: '{{email}}',
      message: createRichText([
        createParagraph(
          "Thank you for completing the Candera Scent Quiz. Your scent profile has been noted — we'll be in touch with early access to its next batch.",
        ),
      ]),
      subject: 'Your Candera Scent Profile',
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
    {
      name: 'scent-result',
      blockName: 'scent-result',
      blockType: 'text',
      label: 'Scent Result',
      required: false,
      width: 100,
    },
  ],
  redirect: undefined,
  submitButtonLabel: 'Send My Scent Profile',
  title: FORM_TITLES.SCENT_QUIZ,
  updatedAt: new Date().toISOString(),
}
