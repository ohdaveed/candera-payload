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
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'Find Your Scent',
    },
    {
      name: 'headline',
      type: 'text',
      defaultValue: 'Which Candera ritual is calling you?',
    },
    {
      name: 'formId',
      type: 'text',
      admin: {
        description: 'The ID of the Scent Quiz form (populated by seed).',
      },
    },
  ],
}
