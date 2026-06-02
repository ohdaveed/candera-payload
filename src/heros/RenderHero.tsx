import React from 'react'
import dynamic from 'next/dynamic'

import type { Page } from '@/payload-types'

import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'

const HighImpactHero = dynamic(() => import('@/heros/HighImpact').then((m) => m.HighImpactHero), {
  ssr: true,
})

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
