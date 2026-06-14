'use client'

import React, { useState, startTransition } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/utilities/ui'

import type { Theme } from './types'
import { useTheme } from '..'
import { themeLocalStorageKey } from './types'

type ThemeValue = Theme | 'auto'

const CYCLE: ThemeValue[] = ['auto', 'light', 'dark']

const icons: Record<ThemeValue, React.ReactNode> = {
  auto: <Monitor aria-hidden="true" className="size-[18px]" />,
  light: <Sun aria-hidden="true" className="size-[18px]" />,
  dark: <Moon aria-hidden="true" className="size-[18px]" />,
}

const labels: Record<ThemeValue, string> = {
  auto: 'Theme: Auto — click to switch',
  light: 'Theme: Light — click to switch',
  dark: 'Theme: Dark — click to switch',
}

export const ThemeSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { setTheme } = useTheme()
  const [value, setValue] = useState<ThemeValue>('auto')

  React.useEffect(() => {
    const preference = window.localStorage.getItem(themeLocalStorageKey)
    startTransition(() => {
      setValue((preference as ThemeValue) ?? 'auto')
    })
  }, [])

  const handleClick = () => {
    const next = CYCLE[(CYCLE.indexOf(value) + 1) % CYCLE.length]
    startTransition(() => {
      setValue(next)
      if (next === 'auto') {
        setTheme(null)
      } else {
        setTheme(next as Theme)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={labels[value]}
      className={cn(
        'inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] rounded-full',
        'text-candera-sage-text transition-colors duration-200',
        'hover:text-candera-obsidian hover:bg-candera-ash/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2',
        className,
      )}
    >
      {icons[value]}
    </button>
  )
}
