'use client'

import React, { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eyebrow } from '@/components/ui/eyebrow'
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

export const ScentQuizBlock: React.FC<ScentQuizBlockType> = ({ quiz: quizData, formId }) => {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [result, setResult] = useState<ScentProfile | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()

  const quiz = quizData as Quiz | null
  const questions = useMemo(() => quiz?.questions || [], [quiz])
  const isEmailStep = step === questions.length

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>()

  const deriveResult = useCallback(() => {
    let topId: string | number = ''
    let topScore = -1
    for (const [id, score] of Object.entries(scores)) {
      if (score > topScore) {
        topScore = score
        topId = id
      }
    }

    // Find the actual profile from the quiz data
    // We assume the profile relationship was populated
    const foundProfile = questions
      .flatMap((q) => q.options.flatMap((o) => o.scores || []))
      .find(
        (s) => String(typeof s.profile === 'object' ? s.profile.id : s.profile) === String(topId),
      )?.profile as ScentProfile | undefined

    return foundProfile || null
  }, [scores, questions])

  const handleOptionSelect = useCallback(
    (option: NonNullable<Quiz['questions']>[number]['options'][number]) => {
      const newScores = { ...scores }
      option.scores?.forEach((s) => {
        const profileId = typeof s.profile === 'object' ? s.profile.id : s.profile
        if (profileId) {
          const profileIdStr = String(profileId)
          newScores[profileIdStr] = (newScores[profileIdStr] ?? 0) + (s.points || 0)
        }
      })
      setScores(newScores)

      if (step < questions.length - 1) {
        setStep((s) => s + 1)
      } else {
        const derived = deriveResult()
        setResult(derived)
        setIsRevealing(true)
        setTimeout(() => {
          setIsRevealing(false)
          setStep(questions.length)
        }, 2800)
      }
    },
    [step, scores, questions, deriveResult],
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
  const progress = (step / questions.length) * 100

  if (!quiz) return null

  return (
    <Section
      padding="large"
      className="relative w-full overflow-hidden min-h-[800px] flex items-center justify-center"
      style={{ background: 'var(--candera-obsidian)' }}
    >
      {/* Ambient Background Transition */}
      <AnimatePresence>
        {result?.ambientImage && (
          <motion.div
            key={
              typeof result.ambientImage === 'object' ? result.ambientImage.id : result.ambientImage
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Media fill resource={result.ambientImage} imgClassName="object-cover" />
          </motion.div>
        )}
      </AnimatePresence>

      <Container className="relative z-10 max-w-[900px]">
        {/* Header (Hidden when result is revealing or revealed) */}
        {!isRevealing && !isEmailStep && !hasSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <Eyebrow className="text-candera-ember/80 mb-4">{quiz.title}</Eyebrow>
            <div className="relative w-full h-[1px] bg-candera-stone/20 mt-8 max-w-[300px] mx-auto overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-candera-ember"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
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
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-2 border border-candera-ember/40 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
                />
                <motion.div
                  className="absolute inset-4 border border-candera-ember rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ borderLeftColor: 'transparent', borderTopColor: 'transparent' }}
                />
              </div>
              <p className="font-display text-3xl text-candera-linen italic tracking-wide">
                Synthesizing your ritual...
              </p>
            </motion.div>
          ) : !isEmailStep && currentQuestion ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <h2 className="font-display text-3xl md:text-5xl text-candera-linen italic text-center mb-16 leading-tight max-w-3xl">
                {currentQuestion.prompt}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {currentQuestion.options.map((option, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    className="group relative flex flex-col items-start p-10 border border-candera-stone/10 bg-white/[0.01] text-left transition-all duration-500 hover:border-candera-ember/40 hover:bg-white/[0.03] rounded-[2px] overflow-hidden"
                  >
                    {option.image && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                        <Media fill resource={option.image} imgClassName="object-cover" />
                      </div>
                    )}
                    <div className="absolute top-0 left-0 w-[1px] h-0 bg-candera-ember/60 transition-all duration-700 group-hover:h-full shadow-[0_0_15px_rgba(191,155,103,0.5)]" />
                    <span className="font-sans text-[16px] leading-relaxed text-candera-linen/60 group-hover:text-candera-linen transition-colors duration-500 tracking-wide">
                      {option.label}
                    </span>
                  </button>
                ))}
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
                <p className="font-sans text-[15px] text-candera-linen/50 leading-relaxed mb-12 tracking-wide">
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
                    className="h-16 bg-transparent border-0 border-b border-candera-stone/30 text-candera-linen placeholder:text-candera-linen/20 text-center text-xl focus:border-candera-ember/50 transition-all duration-700 rounded-none px-0"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S[^\s@]*@\S+$/, message: 'Please enter a valid email' },
                    })}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-[11px] text-candera-rose text-center font-bold uppercase tracking-[0.2em]"
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
                  {isLoading ? 'Sending Invitation…' : 'Unlock My Profile'}
                </Button>
                {submitError && (
                  <p className="text-[11px] text-candera-rose text-center font-bold uppercase tracking-[0.2em]">
                    {submitError}
                  </p>
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
                className="editorial text-candera-linen/90 text-[20px] md:text-[24px] leading-relaxed mb-12 italic max-w-2xl mx-auto"
              >
                &ldquo;{result.editorial}&rdquo;
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col gap-12 items-center"
              >
                <div className="flex flex-col gap-4">
                  <p className="font-sans text-[12px] font-bold uppercase tracking-[0.5em] text-candera-ember">
                    Botanical Composition
                  </p>
                  <p className="font-sans text-[16px] text-candera-linen/50 tracking-[0.2em] font-light">
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
