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
import { useFormSubmission } from '@/hooks/useFormSubmission'
import { EMAIL_PATTERN } from '@/constants/validation'
import { TurnstileWidget } from '@/components/TurnstileWidget'
import type { ScentQuizBlock as ScentQuizBlockType, Quiz, Product } from '@/payload-types'
import { ScentRecommendationEngine } from './recommendationEngine'

type EmailFormValues = { email: string; _gotcha?: string }

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

  // Result is always derived using the pure recommendation engine
  const { result } = useMemo(
    () => ScentRecommendationEngine.getRecommendation(answers, questions, isEmailStep),
    [answers, questions, isEmailStep],
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
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>()
  const {
    isLoading,
    hasSubmitted,
    error: submitError,
    setError: setSubmitError,
    submit,
    reset,
  } = useFormSubmission()

  // Restarting the quiz (Retake / clearing answers) returns to step 0; clear the
  // prior submission so a second completion shows the email step again.
  useEffect(() => {
    if (step === 0 && (hasSubmitted || submittedEmail !== null)) {
      reset()
      setSubmittedEmail(null)
    }
  }, [step, hasSubmitted, submittedEmail, reset])

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
      const finalFormId = typeof formId === 'object' ? formId?.id : formId
      void submit(
        finalFormId,
        [
          { field: 'email', value: data.email },
          { field: 'scent-result', value: result?.name ?? '' },
        ],
        turnstileToken,
        data._gotcha,
      ).then((ok) => {
        if (ok) setSubmittedEmail(data.email)
      })
    },
    [formId, result, submit, turnstileToken],
  )

  const currentQuestion = questions[step]
  const progress = (step / Math.max(questions.length, 1)) * 100
  const questionHeadingId = 'scent-quiz-question-heading'

  // Roving tabIndex for the options radiogroup: only one option is Tab-focusable
  // at a time, per the WAI-ARIA radio pattern. Arrow keys move focus only —
  // selecting an option immediately advances to the next question (via
  // handleOptionSelect), so activation stays on Enter/Space (native button
  // click) rather than on arrow-key movement.
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0)
  useEffect(() => {
    const selectedIdx = answers[step]
    setFocusedOptionIndex(selectedIdx !== undefined ? selectedIdx : 0)
  }, [step, answers])

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, optionCount: number) => {
      let nextIndex: number | null = null
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (focusedOptionIndex + 1) % optionCount
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (focusedOptionIndex - 1 + optionCount) % optionCount
      } else if (event.key === 'Home') {
        nextIndex = 0
      } else if (event.key === 'End') {
        nextIndex = optionCount - 1
      }
      if (nextIndex !== null) {
        event.preventDefault()
        setFocusedOptionIndex(nextIndex)
        optionRefs.current[nextIndex]?.focus()
      }
    },
    [focusedOptionIndex],
  )

  if (!quiz) return null

  return (
    // Pinned (not ambient) mood: theme.css only defines --mood-* under
    // html[data-section-mood=...], and this block's light-on-dark UI can't
    // passively adapt to the light-editorial default the way Testimonials
    // does. Setting the custom properties inline here guarantees a noir
    // surface regardless of the page's ambient mood.
    <Section
      data-section-mood="noir-contrast"
      padding="large"
      style={
        {
          '--mood-bg': '#141412',
          '--mood-fg': '#f5f2ed',
          '--mood-accent': '#b28c9c',
          backgroundColor: 'var(--mood-bg, #141412)',
          color: 'var(--mood-fg, #f5f2ed)',
        } as React.CSSProperties
      }
      className="relative w-full overflow-y-auto md:overflow-hidden min-h-fit md:min-h-[800px] flex items-center justify-center"
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
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
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
              <p className="font-display text-3xl text-inherit italic tracking-wide">
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
              <h2
                id={questionHeadingId}
                className="font-display text-3xl md:text-5xl text-inherit italic text-center mb-8 leading-tight max-w-3xl"
              >
                {currentQuestion.prompt}
              </h2>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const prevAnswers = [...answers]
                    prevAnswers.pop()
                    const params = new URLSearchParams(searchParams.toString())
                    if (prevAnswers.length > 0) {
                      params.set('q', prevAnswers.join('-'))
                    } else {
                      params.delete('q')
                    }
                    router.push(`${pathname}?${params.toString()}`, { scroll: false })
                  }}
                  className="font-sans text-xs text-inherit opacity-70 hover:opacity-100 uppercase tracking-[0.2em] transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mood-bg,_#141412)]"
                >
                  ← Back
                </button>
              )}
              <div
                role="radiogroup"
                aria-labelledby={questionHeadingId}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
              >
                {currentQuestion.options.map((option, i) => {
                  // Highlight the previously-selected answer when navigating back
                  const isSelected = answers[step] === i
                  return (
                    <button
                      key={i}
                      ref={(el) => {
                        optionRefs.current[i] = el
                      }}
                      type="button"
                      onClick={() => handleOptionSelect(i)}
                      onKeyDown={(e) => handleOptionKeyDown(e, currentQuestion.options.length)}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={i === focusedOptionIndex ? 0 : -1}
                      className={[
                        'group relative flex flex-col items-start p-10 border text-left transition-all duration-500 rounded-input overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mood-bg,_#141412)]',
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
                          'font-sans text-base leading-relaxed transition-colors duration-500 tracking-wide text-inherit',
                          isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
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
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.3, delayChildren: 0.2 },
                },
              }}
              className="flex flex-col items-center max-w-3xl mx-auto"
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
                className="font-display text-6xl md:text-8xl text-inherit italic mb-10 leading-[0.9]"
              >
                {result.name}
              </motion.h3>

              <motion.div
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="h-[1px] w-24 bg-candera-ember/30 mx-auto mb-10"
              />

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="editorial text-candera-vellum/90 text-lg md:text-xl leading-relaxed mb-12 italic max-w-2xl mx-auto"
              >
                &ldquo;{result.editorial}&rdquo;
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-4 mb-16"
              >
                <p className="font-sans text-sm font-bold uppercase tracking-[0.5em] text-candera-ember">
                  <Tooltip content="The unique fragrance notes that define this scent profile">
                    Botanical Composition
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 ml-1.5 rounded-full border border-candera-ember/40 text-[9px] leading-none text-candera-ember/60 cursor-help align-super">
                      ?
                    </span>
                  </Tooltip>
                </p>
                <p className="font-sans text-base text-inherit opacity-70 tracking-[0.2em] font-light">
                  {result.notes}
                </p>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="w-full max-w-xl"
              >
                <p className="font-sans text-sm text-inherit opacity-70 leading-relaxed mb-10 tracking-wide text-center">
                  Enter your email to receive your full scent profile and discover the candle that
                  matches your atmosphere.
                </p>

                <form
                  onSubmit={handleSubmit(onEmailSubmit)}
                  noValidate
                  className="flex flex-col items-center gap-8 w-full"
                >
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                    {...register('_gotcha')}
                  />

                  <div className="w-full">
                    <Input
                      id="quiz-email"
                      type="email"
                      placeholder="your@ritual.com"
                      autoComplete="email"
                      aria-label="Email address"
                      spellCheck={false}
                      className="h-16 bg-transparent border-0 border-b border-candera-stone/50 text-inherit placeholder:text-candera-linen/70 text-center text-xl focus:border-candera-ember-strong focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mood-bg,_#141412)] transition-all duration-700 rounded-none px-0"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: EMAIL_PATTERN,
                          message: 'Please enter a valid email',
                        },
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
                  <TurnstileWidget
                    onSuccess={setTurnstileToken}
                    onExpire={() => setTurnstileToken(undefined)}
                  />
                  <Button
                    type="submit"
                    variant="cta-ember"
                    size="cta"
                    className="w-full py-10 text-lg uppercase tracking-[0.3em]"
                    disabled={isLoading || !turnstileToken}
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

                <p className="mt-6 text-[11px] text-candera-stone/70 text-center tracking-wide">
                  No spam &middot; Unsubscribe any time &middot;{' '}
                  <Link
                    href="/privacy-policy"
                    className="underline underline-offset-2 hover:text-candera-vellum transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </motion.div>
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
                className="font-display text-5xl md:text-7xl text-inherit italic mb-6 leading-[0.9]"
              >
                {result.name}
              </motion.h3>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="font-sans text-sm text-candera-vellum/70 tracking-[0.2em] font-light mb-10"
              >
                Your profile has been sent to{' '}
                {submittedEmail ? submittedEmail.replace(/(?<=.).(?=[^@]*@)/g, '*') : ''}
              </motion.p>

              {result.featuredProduct && typeof result.featuredProduct === 'object' && (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  className="flex flex-col items-center gap-8 mt-4"
                >
                  <div className="w-40 h-[1px] bg-candera-stone/20" />
                  <p className="font-sans text-xs text-inherit opacity-60 uppercase tracking-[0.3em] font-semibold">
                    Your matched candle
                  </p>
                  <Button
                    asChild
                    variant="cta-ember"
                    size="cta"
                    className="px-16 py-10 text-lg uppercase tracking-[0.2em]"
                  >
                    <Link href={`/products/${(result.featuredProduct as Product).slug}`}>
                      Explore the Ritual <span aria-hidden="true">→</span>
                    </Link>
                  </Button>
                </motion.div>
              )}
              <motion.button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('q')
                  router.push(`${pathname}?${params.toString()}`, { scroll: false })
                }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                className="font-sans text-xs text-candera-vellum/70 hover:text-candera-vellum uppercase tracking-[0.2em] mt-12 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--mood-bg,_#141412)]"
              >
                Retake the Quiz
              </motion.button>
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
        data-section-mood="noir-contrast"
        padding="large"
        style={
          {
            '--mood-bg': '#141412',
            backgroundColor: 'var(--mood-bg, #141412)',
          } as React.CSSProperties
        }
        className="relative w-full overflow-y-auto md:overflow-hidden min-h-fit md:min-h-[800px] flex items-center justify-center"
      />
    }
  >
    <ScentQuizInner {...props} />
  </Suspense>
)
