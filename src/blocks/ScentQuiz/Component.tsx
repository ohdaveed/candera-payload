'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Tooltip } from '@/components/ui/tooltip'
import { Media } from '@/components/Media'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { getClientSideURL } from '@/utilities/getURL'
import type {
  ScentQuizBlock as ScentQuizBlockType,
  Quiz,
  ScentProfile,
  Product,
} from '@/payload-types'

type EmailFormValues = { email: string }

// Derive scores from recorded answer indices so the URL is the single source of truth.
function deriveScores(
  answers: number[],
  questions: NonNullable<Quiz['questions']>,
): Record<string, number> {
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

function deriveResultFromScores(
  scoreMap: Record<string, number>,
  questions: NonNullable<Quiz['questions']>,
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

// Parse "1-0-2" from the URL into [1, 0, 2]
function parseAnswers(raw: string | null): number[] {
  if (!raw) return []
  return raw
    .split('-')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n >= 0)
}

type InnerProps = ScentQuizBlockType

const ScentQuizInner: React.FC<InnerProps> = ({ quiz: quizData, formId }) => {
  const shouldReduceMotion = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL-driven state — answers and step are derived from the `q` param
  const answers = useMemo(() => parseAnswers(searchParams.get('q')), [searchParams])

  const quiz = quizData as Quiz | null
  const questions = useMemo(() => quiz?.questions || [], [quiz])

  const step = Math.min(answers.length, questions.length)
  const isEmailStep = answers.length >= questions.length

  // Scores and result are always derived — no stale useState mirrors
  const scores = useMemo(() => deriveScores(answers, questions), [answers, questions])
  const result = useMemo(
    () => (isEmailStep ? deriveResultFromScores(scores, questions) : null),
    [isEmailStep, scores, questions],
  )

  const revealTimerRef = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current)
    },
    [],
  )

  // Transient UI state only (not shareable / not needed after refresh)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>()

  const handleOptionSelect = useCallback(
    (optionIdx: number) => {
      const newAnswers = [...answers, optionIdx]
      const params = new URLSearchParams(searchParams.toString())
      params.set('q', newAnswers.join('-'))
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      // Trigger reveal animation only when user actively completes the last question
      if (newAnswers.length === questions.length) {
        setIsRevealing(true)
        revealTimerRef.current = window.setTimeout(() => setIsRevealing(false), 2800)
      }
    },
    [answers, questions.length, router, pathname, searchParams],
  )

  const onEmailSubmit = useCallback(
    (data: EmailFormValues) => {
      const submit = async () => {
        setSubmitError(undefined)
        setIsLoading(true)

        const finalFormId = typeof formId === 'object' ? formId?.id : formId

        if (!finalFormId) {
          setSubmitError('Form unavailable — please reach out to us directly.')
          setIsLoading(false)
          return
        }

        try {
          const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              form: finalFormId,
              submissionData: [
                { field: 'email', value: data.email },
                { field: 'scent-result', value: result?.name ?? '' },
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

  const currentQuestion = questions[step]
  const progress = (step / Math.max(questions.length, 1)) * 100

  if (!quiz) return null

  return (
    <Section
      padding="large"
      className="relative w-full overflow-hidden min-h-[800px] flex items-center justify-center bg-candera-obsidian"
    >
      {/* Ambient background when result is known */}
      <AnimatePresence>
        {result?.ambientImage && (
          <motion.div
            key={
              typeof result.ambientImage === 'object' ? result.ambientImage.id : result.ambientImage
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Media fill resource={result.ambientImage} imgClassName="object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      <Container className="relative z-10 max-w-[900px]">
        {/* Progress header */}
        {!isRevealing && !isEmailStep && !hasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <Eyebrow className="text-candera-ember/80 mb-4">{quiz.title}</Eyebrow>
            <div
              role="status"
              aria-live="polite"
              aria-label={`Question ${step + 1} of ${questions.length}`}
              className="relative w-full h-[1px] bg-candera-stone/20 mt-8 max-w-[300px] mx-auto overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 h-full bg-candera-ember"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 50, damping: 20 }
                }
              />
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {isRevealing ? (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-24 h-24 mb-12">
                <motion.div
                  className="absolute inset-0 border border-candera-ember/20 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 3,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute inset-2 border border-candera-ember/40 rounded-full border-r-transparent border-b-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 4,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'linear',
                  }}
                />
                <motion.div
                  className="absolute inset-4 border border-candera-ember rounded-full border-l-transparent border-t-transparent"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 2,
                    repeat: shouldReduceMotion ? 0 : Infinity,
                    ease: 'linear',
                  }}
                />
              </div>
              <p className="font-display text-3xl text-candera-linen italic tracking-wide">
                Synthesizing your ritual…
              </p>
            </motion.div>
          ) : !isEmailStep && currentQuestion ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display text-3xl md:text-5xl text-candera-linen italic text-center mb-16 leading-tight max-w-3xl">
                {currentQuestion.prompt}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {currentQuestion.options.map((option, i) => {
                  // Highlight the previously-selected answer when navigating back
                  const isSelected = answers[step] === i
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleOptionSelect(i)}
                      aria-pressed={isSelected}
                      className={[
                        'group relative flex flex-col items-start p-10 border text-left transition-all duration-500 rounded-input overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-candera-obsidian',
                        isSelected
                          ? 'border-candera-ember/60 bg-white/[0.05]'
                          : 'border-candera-stone/10 bg-white/[0.01] hover:border-candera-ember-strong/50 hover:bg-white/[0.03]',
                      ].join(' ')}
                    >
                      {option.image && (
                        <div
                          className={[
                            'absolute inset-0 transition-opacity duration-700 pointer-events-none',
                            isSelected ? 'opacity-10' : 'opacity-0 group-hover:opacity-10',
                          ].join(' ')}
                        >
                          <Media fill resource={option.image} imgClassName="object-cover" />
                        </div>
                      )}
                      <div
                        className={[
                          'absolute top-0 left-0 w-[1px] bg-candera-ember/60 transition-all duration-700 shadow-[0_0_15px_rgba(191,155,103,0.5)]',
                          isSelected ? 'h-full' : 'h-0 group-hover:h-full',
                        ].join(' ')}
                      />
                      <span
                        className={[
                          'font-sans text-base leading-relaxed transition-colors duration-500 tracking-wide',
                          isSelected
                            ? 'text-candera-linen'
                            : 'text-candera-linen/60 group-hover:text-candera-linen',
                        ].join(' ')}
                      >
                        {option.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          ) : isEmailStep && result && !hasSubmitted ? (
            <motion.div
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center max-w-xl mx-auto"
            >
              <div className="text-center mb-12">
                <Eyebrow className="text-candera-ember mb-6">Discovery Awaits</Eyebrow>
                <h3 className="font-display text-4xl text-candera-linen italic mb-8">
                  Your atmosphere study is complete.
                </h3>
                <p className="font-sans text-base text-candera-linen/50 leading-relaxed mb-12 tracking-wide">
                  To preserve this ritual and receive your full botanical profile, join our inner
                  circle. We will send the results and early access to the next numbered batch
                  directly to your inbox.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onEmailSubmit)}
                noValidate
                className="flex flex-col items-center gap-8 w-full"
              >
                <div className="w-full">
                  <Input
                    id="quiz-email"
                    type="email"
                    placeholder="your@ritual.com"
                    autoComplete="email"
                    aria-label="Email address"
                    spellCheck={false}
                    className="h-16 bg-transparent border-0 border-b border-candera-stone/50 text-candera-linen placeholder:text-candera-linen/40 text-center text-xl focus:border-candera-ember-strong focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-candera-obsidian transition-all duration-700 rounded-none px-0"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
                    })}
                  />
                  {errors.email && (
                    <motion.p
                      role="alert"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-xs text-candera-rose text-center font-bold uppercase tracking-[0.2em]"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="cta-ember"
                  size="cta"
                  className="w-full py-10 text-lg uppercase tracking-[0.3em]"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Sending Invitation…'
                    : submitError
                      ? 'Try Again'
                      : 'Unlock My Profile'}
                </Button>
                {submitError && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span
                        role="alert"
                        className="text-xs text-candera-rose text-center font-bold uppercase tracking-[0.2em]"
                      >
                        {submitError}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSubmitError(undefined)}
                        className="text-candera-stone/40 hover:text-candera-vellum transition-colors"
                        aria-label="Dismiss error"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </motion.div>
          ) : hasSubmitted && result ? (
            <motion.div
              key="result"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.3, delayChildren: 0.2 },
                },
              }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <Eyebrow className="text-candera-ember mb-8">Your Atmosphere Study</Eyebrow>
              </motion.div>

              <motion.h3
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-6xl md:text-8xl text-candera-linen italic mb-10 leading-[0.9]"
              >
                {result.name}
              </motion.h3>

              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="h-[1px] w-24 bg-candera-ember/30 mx-auto mb-10"
              />

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="editorial text-candera-linen/90 text-lg md:text-xl leading-relaxed mb-12 italic max-w-2xl mx-auto"
              >
                &ldquo;{result.editorial}&rdquo;
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-12 items-center"
              >
                <div className="flex flex-col gap-4">
                  <p className="font-sans text-sm font-bold uppercase tracking-[0.5em] text-candera-ember">
                    <Tooltip content="The unique fragrance notes that define this scent profile">
                      Botanical Composition
                      <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1.5 rounded-full border border-candera-ember/40 text-[9px] leading-none text-candera-ember/60 cursor-help align-super">
                        ?
                      </span>
                    </Tooltip>
                  </p>
                  <p className="font-sans text-base text-candera-linen/50 tracking-[0.2em] font-light">
                    {result.notes}
                  </p>
                </div>

                {result.featuredProduct && typeof result.featuredProduct === 'object' && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.9 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    className="flex flex-col items-center gap-8 mt-4"
                  >
                    <div className="w-40 h-[1px] bg-candera-stone/20" />
                    <Button
                      asChild
                      variant="cta-ember"
                      size="cta"
                      className="px-16 py-10 text-lg uppercase tracking-[0.2em]"
                    >
                      <Link href={`/products/${(result.featuredProduct as Product).slug}`}>
                        Explore the Ritual
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>
    </Section>
  )
}

// Suspense boundary required by Next.js App Router for useSearchParams()
export const ScentQuizBlock: React.FC<ScentQuizBlockType> = (props) => (
  <Suspense
    fallback={
      <Section
        padding="large"
        className="relative w-full min-h-[800px] flex items-center justify-center bg-candera-obsidian"
      />
    }
  >
    <ScentQuizInner {...props} />
  </Suspense>
)
