'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { useEffect } from 'react'

export default function ProductPageClient() {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme('light')
  }, [setHeaderTheme])
  return null
}
