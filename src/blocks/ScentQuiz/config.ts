import type { Block } from 'payload'

export const ScentQuiz: Block = {
  slug: 'scentQuiz',
  interfaceName: 'ScentQuizBlock',
  labels: {
    plural: 'Scent Quizzes',
    singular: 'Scent Quiz',
  },
  fields: [
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      required: true,
    },
    {
      name: 'formId',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        description: 'The ID of the Scent Quiz form (populated by seed).',
      },
    },
  ],
}
