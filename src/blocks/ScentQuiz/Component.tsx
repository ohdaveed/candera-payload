'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
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
    prompt: 'Where does your mind wander when the room is quiet?',
    options: [
      { label: 'The coast — open air, salt, and distance', scores: { coastal: 3 } },
      { label: 'A wildflower meadow in full sun', scores: { fresh: 3 } },
      { label: 'A darkened library, candlelit and still', scores: { moody: 3 } },
      { label: 'A garden in soft, morning bloom', scores: { romantic: 2, contemplative: 1 } },
      { label: 'A quiet woodland path in late autumn', scores: { contemplative: 3 } },
      { label: 'A hothouse full of architectural florals', scores: { bold: 3 } },
    ],
  },
  {
    prompt: 'How do you want the air in your room to feel?',
    options: [
      { label: 'Clear and expansive, like an open window', scores: { coastal: 2, fresh: 1 } },
      { label: 'Soft and still, inviting deep breaths', scores: { contemplative: 2, romantic: 1 } },
      { label: 'Deep and intriguing, a layer of shadow', scores: { moody: 2, bold: 1 } },
      {
        label: 'Tender and luminous, like a shared secret',
        scores: { romantic: 2, contemplative: 1 },
      },
    ],
  },
  {
    prompt: 'Which sensory memory lingers the longest?',
    options: [
      { label: 'The bite of salt air and green stems', scores: { coastal: 3 } },
      { label: 'Sun-warmed herbs and wild botanicals', scores: { fresh: 3 } },
      { label: 'Dark fruit, aged wood, and velvet', scores: { moody: 3 } },
      {
        label: 'Powdered petals and soft, elegant musk',
        scores: { romantic: 2, contemplative: 1 },
      },
      { label: 'Bold, heady blooms grounded in earth', scores: { bold: 3 } },
    ],
  },
]

type AtmosphereProfile = {
  name: string
  tagline: string
  notes: string
  slug: string
  editorial: string
}

const ATMOSPHERE_PROFILES: Record<Atmosphere, AtmosphereProfile> = {
  coastal: {
    name: 'Coastal & Airy',
    tagline: 'Gathered from the tide. A practice in coastal stillness.',
    notes: 'Sea Breeze · Driftwood · Salt Air',
    slug: 'seashell-garden-glow',
    editorial:
      'Your ritual is one of expansion and clarity. You seek the vastness of the horizon and the sharp, clean bite of the Pacific air to clear your path.',
  },
  fresh: {
    name: 'Fresh & Botanical',
    tagline: 'Sunlight through wildflowers. A ritual of spring emergence.',
    notes: 'Fresh Green · Lily of the Valley · Morning Dew',
    slug: 'meadowlight-botanical',
    editorial:
      'You are drawn to the vibrant energy of growth. Your space is a sanctuary for new beginnings, filled with the sun-drenched scent of a meadow in bloom.',
  },
  moody: {
    name: 'Moody & Intimate',
    tagline: 'Dusk in the sensory revolution. A deeper, more intimate practice.',
    notes: 'Dark Berry · Merlot · Vetiver',
    slug: 'crimson-noir',
    editorial:
      'You embrace the shadows and the depth of the evening. Your ritual is intimate and layered, seeking the complex notes of dark fruit and ancient woods.',
  },
  romantic: {
    name: 'Romantic & Soft',
    tagline: 'A garden in full bloom. Radiating elegance and ritual serenity.',
    notes: 'White Lilac · Blue Hydrangea · Soft Musk',
    slug: 'ever-after-glow',
    editorial:
      'You find beauty in tenderness and tradition. Your ritual is an act of elegance, surrounding yourself with the soft, luminous fragrance of a garden at dusk.',
  },
  contemplative: {
    name: 'Gentle & Contemplative',
    tagline: 'The quiet beauty of pansies. A contemplative botanical study.',
    notes: 'Lilac · Pressed Pansy · Soft Powder',
    slug: 'anyas-eyes',
    editorial:
      'Your practice is one of stillness and introspection. You seek the gentle, powdered scents that invite quiet thought and the slow passage of time.',
  },
  bold: {
    name: 'Bold & Floral',
    tagline: 'Botanical architecture. Bold florals grounded in ritual.',
    notes: 'Fresh Florals · Botanical Rose · Green Stem',
    slug: 'scarlet-bloom',
    editorial:
      'You are moved by the architectural power of nature. Your ritual is confident and striking, centered around the heady, unyielding blooms of the botanical world.',
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
  const [isRevealing, setIsRevealing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>()

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
        setIsRevealing(true)
        setTimeout(() => {
          setIsRevealing(false)
          setStep(QUESTIONS.length)
        }, 2400)
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
  const progress = (step / QUESTIONS.length) * 100

  return (
    <section
      className="w-full py-32 px-4 overflow-hidden"
      style={{ background: 'var(--candera-obsidian)' }}
    >
      <div className="container max-w-[800px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {eyebrow && <Eyebrow className="text-candera-ember/80 mb-4">{eyebrow}</Eyebrow>}
          <h2 className="h2 text-candera-linen max-w-xl mx-auto">{headline}</h2>
        </div>

        {/* Minimal Progress Bar */}
        <div className="relative w-full h-[1px] bg-candera-stone/20 mb-20 max-w-[400px] mx-auto overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-candera-ember"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {isRevealing ? (
            <motion.div
              key="revealing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-16 h-16 mb-8">
                <motion.div
                  className="absolute inset-0 border border-candera-ember/30 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-0 border border-candera-ember rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
                />
              </div>
              <p className="font-display text-2xl text-candera-linen italic animate-pulse">
                Curating your atmosphere...
              </p>
            </motion.div>
          ) : !isEmailStep && currentQuestion ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <p className="font-display text-2xl md:text-4xl text-candera-linen italic text-center mb-12 leading-tight max-w-2xl">
                {currentQuestion.prompt}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className="group relative flex flex-col items-start p-8 border border-candera-stone/20 bg-white/[0.02] text-left transition-all duration-300 hover:border-candera-ember/50 hover:bg-white/[0.05] rounded-none overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-[2px] h-0 bg-candera-ember transition-all duration-500 group-hover:h-full" />
                    <span className="font-sans text-[15px] leading-relaxed text-candera-linen/80 group-hover:text-candera-linen transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : isEmailStep && resultProfile && !hasSubmitted ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-center mb-12 p-12 border border-candera-ember/20 bg-candera-ember/[0.03] backdrop-blur-sm w-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-candera-obsidian px-6">
                  <Eyebrow className="text-candera-ember">The Reveal</Eyebrow>
                </div>
                <h3 className="font-display text-4xl md:text-5xl text-candera-linen italic mb-6">
                  {resultProfile.name}
                </h3>
                <p className="editorial text-candera-linen/70 text-[17px] leading-relaxed mb-6 max-w-md mx-auto">
                  {resultProfile.tagline}
                </p>
                <div className="h-[1px] w-12 bg-candera-ember/30 mx-auto mb-6" />
                <p className="font-sans text-[12px] font-bold uppercase tracking-[0.3em] text-candera-ember">
                  {resultProfile.notes}
                </p>
              </div>

              <div className="text-center mb-12 max-w-md">
                <p className="font-display text-xl text-candera-linen italic mb-4">
                  Let us keep this ritual close.
                </p>
                <p className="font-sans text-[14px] text-candera-linen/40 leading-relaxed">
                  Join our inner circle to unlock your full atmosphere study and receive early
                  access to the next numbered batch.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onEmailSubmit)}
                noValidate
                className="flex flex-col items-center gap-6 w-full max-w-[440px]"
              >
                <div className="w-full">
                  <Label htmlFor="quiz-email" className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id="quiz-email"
                    type="email"
                    placeholder="your@ritual.com"
                    autoComplete="email"
                    className="h-14 bg-white/[0.03] border-candera-stone/30 text-candera-linen placeholder:text-candera-linen/20 text-center text-lg focus:border-candera-ember/50 transition-colors rounded-none"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
                    })}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-[12px] text-candera-rose text-center font-bold uppercase tracking-wider"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="cta-ember"
                  size="cta"
                  className="w-full py-8 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Invitation…' : 'Unlock My Profile'}
                </Button>
                {submitError && (
                  <p className="text-[12px] text-candera-rose text-center font-bold uppercase tracking-wider">
                    {submitError}
                  </p>
                )}
              </form>
            </motion.div>
          ) : hasSubmitted && resultProfile ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="p-16 border border-candera-ember/30 bg-candera-ember/[0.05] relative mb-12">
                <div className="absolute top-8 left-8">
                  <div className="w-6 h-6 border-t border-l border-candera-ember/40" />
                </div>
                <div className="absolute bottom-8 right-8 rotate-180">
                  <div className="w-6 h-6 border-t border-l border-candera-ember/40" />
                </div>

                <Eyebrow className="text-candera-ember mb-6">Your Atmosphere Study</Eyebrow>
                <h3 className="font-display text-5xl md:text-6xl text-candera-linen italic mb-8">
                  {resultProfile.name}
                </h3>
                <p className="editorial text-candera-linen/80 text-[19px] leading-relaxed mb-8 max-w-lg mx-auto italic">
                  &ldquo;{resultProfile.editorial}&rdquo;
                </p>
                <div className="flex flex-col gap-8 items-center">
                  <div className="flex flex-col gap-2">
                    <p className="font-sans text-[11px] font-bold uppercase tracking-[0.4em] text-candera-ember">
                      Botanical Composition
                    </p>
                    <p className="font-sans text-[14px] text-candera-linen/60 tracking-widest">
                      {resultProfile.notes}
                    </p>
                  </div>
                  <Button asChild variant="cta-ember" size="cta" className="px-12 py-8 text-base">
                    <Link href={`/products/${resultProfile.slug}`}>Explore the Ritual</Link>
                  </Button>
                </div>
              </div>
              <p className="font-sans text-[13px] text-candera-linen/30 tracking-widest uppercase font-bold">
                Profile sent to your inbox.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
