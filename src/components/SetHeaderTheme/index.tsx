'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'

export function SetHeaderTheme({ theme }: { theme: 'light' | 'dark' }) {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme(theme)
  }, [setHeaderTheme, theme])
  return null
}
