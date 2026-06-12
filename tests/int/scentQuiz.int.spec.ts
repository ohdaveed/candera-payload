import { describe, it, expect } from 'vite-plus/test'

interface Profile {
  id: string | number
  name?: string
}

interface Question {
  options: {
    scores: {
      profile: Profile
    }[]
  }[]
}

// Standalone implementation of the scoring logic from ScentQuizBlock
function deriveResult(scores: Record<string, number>, questions: unknown[]) {
  let topId: string | number = ''
  let topScore = -1
  for (const [id, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score
      topId = id
    }
  }

  const foundProfile = (questions as Question[])
    .flatMap((q) => q.options.flatMap((o) => o.scores || []))
    .find((s) => String(s.profile.id) === String(topId))?.profile

  return foundProfile || null
}

describe('Scent Quiz Scoring Logic', () => {
  const mockQuestions = [
    {
      options: [
        {
          label: 'Option A',
          scores: [{ profile: { id: 'p1', name: 'Profile 1' } as Profile }],
        },
        {
          label: 'Option B',
          scores: [{ profile: { id: 'p2', name: 'Profile 2' } as Profile }],
        },
      ],
    },
  ]

  it('correctly identifies the winner with a single high score', () => {
    const scores = { p1: 10, p2: 5 }
    const result = deriveResult(scores, mockQuestions)
    expect(result).not.toBeNull()
    if (result) {
      expect(result.id).toBe('p1')
      expect(result.name).toBe('Profile 1')
    }
  })

  it('handles multiple questions accumulating scores', () => {
    const questions = [
      ...mockQuestions,
      {
        options: [
          {
            label: 'Option C',
            scores: [{ profile: { id: 'p2', name: 'Profile 2' } as Profile }],
          },
        ],
      },
    ]
    const scores = { p1: 5, p2: 15 }
    const result = deriveResult(scores, questions)
    expect(result).not.toBeNull()
    if (result) {
      expect(result.id).toBe('p2')
    }
  })

  it('returns null if no scores are present', () => {
    const result = deriveResult({}, mockQuestions)
    expect(result).toBeNull()
  })
})
