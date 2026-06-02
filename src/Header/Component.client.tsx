'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, startTransition } from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    startTransition(() => {
      setTheme(headerTheme || null)
    })
  }, [headerTheme])

  // Scroll-based transparent → solid transition
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isDark = theme === 'dark'
  const isTransparent = isDark && !scrolled

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-[120] transition-all duration-500',
        isTransparent
          ? 'bg-transparent py-[18px]'
          : 'bg-white/95 backdrop-blur-[10px] py-0 shadow-[0_1px_2px_rgba(20,20,18,.04)] border-b border-[#f0ede7]',
      ].join(' ')}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="max-w-[1280px] mx-auto px-10 py-4 grid grid-cols-[1fr_auto_1fr] items-center">
        {/* Left nav placeholder — filled by HeaderNav left slot if needed */}
        <div />

        {/* Centered logo */}
        <Link
          aria-label="Candera Home"
          className={[
            'font-display font-bold text-[23px] tracking-[-0.02em] justify-self-center transition-colors',
            isTransparent ? 'text-white' : 'text-candera-obsidian',
          ].join(' ')}
          href="/"
        >
          CANDERA
        </Link>

        {/* Right nav */}
        <div className="justify-self-end">
          <HeaderNav data={data} transparent={isTransparent} />
        </div>
      </div>
    </header>
  )
}
