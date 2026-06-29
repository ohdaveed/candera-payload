import { describe, it, expect } from 'vite-plus/test'
import { ScentRecommendationEngine } from '../../src/blocks/ScentQuiz/recommendationEngine'
import type { QuizQuestions } from '../../src/blocks/ScentQuiz/recommendationEngine'
import type { ScentProfile } from '@/payload-types'

describe('Scent Quiz Scoring Logic', () => {
  const profile1 = { id: 1, name: 'Profile 1' } as unknown as ScentProfile
  const profile2 = { id: 2, name: 'Profile 2' } as unknown as ScentProfile

  const mockQuestions: QuizQuestions = [
    {
      prompt: 'Question 1',
      options: [
        {
          label: 'Option A',
          scores: [{ profile: profile1, points: 10 }],
        },
        {
          label: 'Option B',
          scores: [{ profile: profile2, points: 5 }],
        },
      ],
    },
  ]

  it('correctly identifies the winner with a single high score', () => {
    const scores = { '1': 10, '2': 5 }
    const result = ScentRecommendationEngine.deriveResultFromScores(scores, mockQuestions)
    expect(result).not.toBeNull()
    if (result) {
      expect(result.id).toBe(1)
      expect(result.name).toBe('Profile 1')
    }
  })

  it('handles multiple questions accumulating scores', () => {
    const questions: QuizQuestions = [
      ...mockQuestions,
      {
        prompt: 'Question 2',
        options: [
          {
            label: 'Option C',
            scores: [{ profile: profile2, points: 15 }],
          },
        ],
      },
    ]
    const scores = { '1': 5, '2': 15 }
    const result = ScentRecommendationEngine.deriveResultFromScores(scores, questions)
    expect(result).not.toBeNull()
    if (result) {
      expect(result.id).toBe(2)
    }
  })

  it('returns null if no scores are present', () => {
    const result = ScentRecommendationEngine.deriveResultFromScores({}, mockQuestions)
    expect(result).toBeNull()
  })

  it('correctly derives scores from answer indices', () => {
    const answers = [0] // Select first option
    const scores = ScentRecommendationEngine.deriveScores(answers, mockQuestions)
    expect(scores).toEqual({ '1': 10 })
  })

  it('gets correct recommendation matching both scores and result', () => {
    const answers = [0]
    const recommendation = ScentRecommendationEngine.getRecommendation(answers, mockQuestions, true)
    expect(recommendation.scores).toEqual({ '1': 10 })
    expect(recommendation.result).not.toBeNull()
    if (recommendation.result) {
      expect(recommendation.result.id).toBe(1)
    }
  })
})
