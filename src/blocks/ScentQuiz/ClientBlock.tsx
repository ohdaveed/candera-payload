'use client'

import dynamic from 'next/dynamic'

const ScentQuizModal = dynamic(
  () => import('@/blocks/ScentQuiz/Modal').then((m) => m.ScentQuizModal),
  { ssr: false, loading: () => null },
)

export { ScentQuizModal as ScentQuizClientBlock }
