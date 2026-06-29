import type { Quiz, ScentProfile } from '@/payload-types'

export type QuizQuestions = NonNullable<Quiz['questions']>

export interface ScentRecommendation {
  scores: Record<string, number>
  result: ScentProfile | null
}

export class ScentRecommendationEngine {
  /**
   * Derives scores for each scent profile based on the selected answers and quiz questions.
   */
  public static deriveScores(answers: number[], questions: QuizQuestions): Record<string, number> {
    return answers.reduce(
      (acc, optionIdx, qIdx) => {
        const option = questions[qIdx]?.options?.[optionIdx]
        option?.scores?.forEach((s) => {
          const profileId = String(
            s.profile && typeof s.profile === 'object' ? s.profile.id : s.profile,
          )
          acc[profileId] = (acc[profileId] ?? 0) + (s.points || 0)
        })
        return acc
      },
      {} as Record<string, number>,
    )
  }

  /**
   * Determines the matching ScentProfile based on the accumulated scores.
   */
  public static deriveResultFromScores(
    scoreMap: Record<string, number>,
    questions: QuizQuestions,
  ): ScentProfile | null {
    let topId = ''
    let topScore = -1
    for (const [id, score] of Object.entries(scoreMap)) {
      if (score > topScore) {
        topScore = score
        topId = id
      }
    }

    const foundProfile = questions
      .flatMap((q) => q.options.flatMap((o) => o.scores || []))
      .find(
        (s) =>
          String(s.profile && typeof s.profile === 'object' ? s.profile.id : s.profile) ===
          String(topId),
      )?.profile as ScentProfile | undefined

    return foundProfile || null
  }

  /**
   * A single minimal interface that takes answers and quiz questions, returning both the scores and the derived ScentProfile if complete.
   */
  public static getRecommendation(
    answers: number[],
    questions: QuizQuestions,
    isComplete: boolean,
  ): ScentRecommendation {
    const scores = this.deriveScores(answers, questions)
    const result = isComplete ? this.deriveResultFromScores(scores, questions) : null
    return { scores, result }
  }
}
