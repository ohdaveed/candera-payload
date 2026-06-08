'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eyebrow } from '@/components/ui/eyebrow'
import { getClientSideURL } from '@/utilities/getURL'

type Atmosphere = 'coastal' | 'fresh' | 'moody' | 'romantic' | 'contemplative' | 'bold'

type QuizOption = {
  label: string
  scores: Partial<Record<Atmosphere, number>>
}

type QuizQuestion = {
  prompt: string
  options: QuizOption[]
}

const QUESTIONS: QuizQuestion[] = [
  {
    prompt: 'When does your ritual most often unfold?',
    options: [
      { label: 'Morning light, before the day begins', scores: { fresh: 2, coastal: 1 } },
      { label: 'The slow afternoon, between tasks', scores: { contemplative: 2, romantic: 1 } },
      { label: 'Evening, as the world quiets', scores: { moody: 2, romantic: 1 } },
      { label: 'Late night, in the dark hours', scores: { moody: 2, bold: 1 } },
    ],
  },
  {
    prompt: 'Which landscape calls you?',
    options: [
      { label: 'The coast — open air, salt, distance', scores: { coastal: 3 } },
      { label: 'A wildflower meadow in full sun', scores: { fresh: 3 } },
      { label: 'A darkened library, candlelit', scores: { moody: 3 } },
      { label: 'A garden in soft morning bloom', scores: { romantic: 2, contemplative: 1 } },
      { label: 'A quiet woodland path in autumn', scores: { contemplative: 3 } },
      { label: 'A hothouse full of bold, heady blooms', scores: { bold: 3 } },
    ],
  },
  {
    prompt: 'What should this candle do for your space?',
    options: [
      { label: 'Clear the air, open the mind', scores: { coastal: 2, fresh: 1 } },
      { label: 'Slow down time, invite stillness', scores: { contemplative: 2, romantic: 1 } },
      { label: 'Deepen the evening, add intrigue', scores: { moody: 2, bold: 1 } },
      { label: 'Soften the room, make it tender', scores: { romantic: 2, contemplative: 1 } },
    ],
  },
  {
    prompt: 'If you had to reach for one scent family—',
    options: [
      { label: 'Sea air, green, and the outdoors', scores: { coastal: 3 } },
      { label: 'Botanical, herbal, sun-warmed', scores: { fresh: 3 } },
      { label: 'Dark fruit, wine, deep woods', scores: { moody: 3 } },
      { label: 'Soft florals, powder, elegance', scores: { romantic: 2, contemplative: 1 } },
      { label: 'Bold blooms, architectural florals', scores: { bold: 3 } },
    ],
  },
]

type AtmosphereProfile = {
  name: string
  tagline: string
  notes: string
  slug: string
}

const ATMOSPHERE_PROFILES: Record<Atmosphere, AtmosphereProfile> = {
  coastal: {
    name: 'Coastal & Airy',
    tagline: 'Gathered from the tide. A practice in coastal stillness.',
    notes: 'Sea Breeze · Driftwood · Salt Air',
    slug: 'seashell-garden-glow',
  },
  fresh: {
    name: 'Fresh & Botanical',
    tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
    notes: 'Fresh Green · Lily of the Valley · Morning Dew',
    slug: 'meadowlight-botanical',
  },
  moody: {
    name: 'Moody & Intimate',
    tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
    notes: 'Dark Berry · Merlot · Vetiver',
    slug: 'crimson-noir',
  },
  romantic: {
    name: 'Romantic & Soft',
    tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
    notes: 'White Lilac · Blue Hydrangea · Soft Musk',
    slug: 'ever-after-glow',
  },
  contemplative: {
    name: 'Gentle & Contemplative',
    tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
    notes: 'Lilac · Pressed Pansy · Soft Powder',
    slug: 'anyas-eyes',
  },
  bold: {
    name: 'Bold & Floral',
    tagline: 'Botanical architecture. Bold florals grounded in ritual.',
    notes: 'Fresh Florals · Botanical Rose · Green Stem',
    slug: 'scarlet-bloom',
  },
}

function deriveResult(scores: Partial<Record<Atmosphere, number>>): Atmosphere {
  const atmospheres: Atmosphere[] = [
    'coastal',
    'fresh',
    'moody',
    'romantic',
    'contemplative',
    'bold',
  ]
  let top: Atmosphere = 'coastal'
  let topScore = -1
  for (const key of atmospheres) {
    const score = scores[key] ?? 0
    if (score > topScore) {
      topScore = score
      top = key
    }
  }
  return top
}

type EmailFormValues = { email: string }

type ScentQuizBlockProps = {
  eyebrow?: string | null
  headline?: string | null
  formId?: string | null
  blockType?: 'scentQuiz'
  blockName?: string | null
  id?: string | null
}

export const ScentQuizBlock: React.FC<ScentQuizBlockProps> = ({
  eyebrow = 'Find Your Scent',
  headline = 'Which Candera ritual is calling you?',
  formId,
}) => {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Partial<Record<Atmosphere, number>>>({})
  const [result, setResult] = useState<Atmosphere | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>()

  const totalSteps = QUESTIONS.length + 1
  const isEmailStep = step === QUESTIONS.length

  const handleOptionSelect = useCallback(
    (option: QuizOption) => {
      const newScores = { ...scores }
      for (const [key, val] of Object.entries(option.scores) as [Atmosphere, number][]) {
        newScores[key] = (newScores[key] ?? 0) + val
      }
      setScores(newScores)

      if (step < QUESTIONS.length - 1) {
        setStep((s) => s + 1)
      } else {
        const derived = deriveResult(newScores)
        setResult(derived)
        setStep(QUESTIONS.length)
      }
    },
    [step, scores],
  )

  const onEmailSubmit = useCallback(
    (data: EmailFormValues) => {
      const submit = async () => {
        setSubmitError(undefined)
        setIsLoading(true)

        if (!formId) {
          setSubmitError('Form unavailable — please reach out to us directly.')
          setIsLoading(false)
          return
        }

        try {
          const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              form: formId,
              submissionData: [
                { field: 'email', value: data.email },
                { field: 'scent-result', value: result ?? '' },
              ],
            }),
          })

          if (res.status >= 400) {
            const json = await res.json()
            setSubmitError(json.errors?.[0]?.message || 'Something went wrong. Please try again.')
            setIsLoading(false)
            return
          }

          setIsLoading(false)
          setHasSubmitted(true)
        } catch {
          setSubmitError('Something went wrong. Please try again.')
          setIsLoading(false)
        }
      }

      void submit()
    },
    [formId, result],
  )

  const currentQuestion = QUESTIONS[step]
  const resultProfile = result ? ATMOSPHERE_PROFILES[result] : null

  return (
    <section className="w-full py-24 px-4" style={{ background: 'var(--candera-obsidian)' }}>
      <div className="container max-w-[680px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {eyebrow && <Eyebrow className="text-candera-ember/80 mb-4">{eyebrow}</Eyebrow>}
          <h2 className="h2 text-candera-linen">{headline}</h2>
        </div>

        {/* Progress dots */}
        <div
          className="flex justify-center gap-2 mb-12"
          aria-label={`Step ${step + 1} of ${totalSteps}`}
        >
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < step
                  ? 'bg-candera-ember'
                  : i === step
                    ? 'bg-candera-linen scale-125'
                    : 'bg-candera-stone/30'
              }`}
            />
          ))}
        </div>

        {/* Question step */}
        {!isEmailStep && currentQuestion && (
          <div key={step} className="animate-in fade-in duration-300">
            <p className="font-display text-2xl md:text-3xl text-candera-linen italic text-center mb-10 leading-snug">
              {currentQuestion.prompt}
            </p>
            <div className="flex flex-col gap-3">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionSelect(option)}
                  className="w-full text-left px-6 py-4 border border-candera-stone/30 text-candera-linen/80 font-sans text-[15px] leading-relaxed hover:border-candera-ember hover:text-candera-linen hover:bg-white/5 transition-all duration-200 rounded-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Email step */}
        {isEmailStep && resultProfile && !hasSubmitted && (
          <div key="email" className="animate-in fade-in duration-300">
            {/* Scent reveal teaser */}
            <div className="text-center mb-10 p-8 border border-candera-ember/30 bg-candera-ember/5 rounded-sm">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-candera-ember mb-3">
                Your Scent Profile
              </p>
              <h3 className="font-display text-3xl text-candera-linen italic mb-3">
                {resultProfile.name}
              </h3>
              <p className="editorial text-candera-linen/60 text-[15px] mb-4">
                {resultProfile.tagline}
              </p>
              <p className="font-sans text-[12px] text-candera-stone/60 tracking-wide">
                {resultProfile.notes}
              </p>
            </div>

            <p className="font-display text-xl text-candera-linen italic text-center mb-8">
              Your scent has been revealed. Let us keep it close.
            </p>
            <p className="font-sans text-[14px] text-candera-linen/50 text-center mb-8">
              Enter your email to receive your scent profile and early access to its next batch.
            </p>

            <form
              onSubmit={handleSubmit(onEmailSubmit)}
              noValidate
              className="flex flex-col items-center gap-4"
            >
              <div className="w-full max-w-[440px]">
                <Label htmlFor="quiz-email" className="sr-only">
                  Email address
                </Label>
                <Input
                  id="quiz-email"
                  type="email"
                  placeholder="Your email address"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  className="bg-white/10 border-candera-stone/40 text-candera-linen placeholder:text-candera-linen/40 text-center"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-[12px] text-candera-rose text-center" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" variant="cta" size="cta" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send My Scent Profile'}
              </Button>
              {submitError && (
                <p
                  className="text-[12px] text-candera-rose text-center"
                  role="alert"
                  aria-live="polite"
                >
                  {submitError}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Result card after submission */}
        {hasSubmitted && resultProfile && (
          <div key="result" className="animate-in fade-in duration-500 text-center">
            <div className="p-10 border border-candera-ember/40 bg-candera-ember/5 rounded-sm mb-8">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-candera-ember mb-4">
                Your Scent
              </p>
              <h3 className="font-display text-4xl text-candera-linen italic mb-4">
                {resultProfile.name}
              </h3>
              <p className="editorial text-candera-linen/70 text-[17px] leading-relaxed mb-4 max-w-[400px] mx-auto">
                {resultProfile.tagline}
              </p>
              <p className="font-sans text-[12px] text-candera-stone/50 tracking-wide mb-8">
                {resultProfile.notes}
              </p>
              <Button asChild variant="cta" size="cta">
                <Link href="/products">Explore This Scent</Link>
              </Button>
            </div>
            <p className="font-sans text-[13px] text-candera-linen/40">
              Your scent profile has been sent to your inbox.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
