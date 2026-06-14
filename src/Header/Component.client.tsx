'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState, startTransition } from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'
import { MobileNav } from './Nav/MobileNav'
import { Container } from '@/components/ui/container'

import { Section } from '@/components/ui/section'

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
    // oxlint-disable-next-line react-hooks/exhaustive-deps
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
    <Section
      as="header"
      padding="none"
      className={[
        'fixed top-0 left-0 right-0 z-[120] transition-[background-color,padding,box-shadow,border-color,backdrop-filter] duration-500',
        isTransparent
          ? 'bg-transparent py-[18px]'
          : 'bg-candera-linen/95 backdrop-blur-[10px] py-0 shadow-[0_1px_2px_rgba(20,20,18,.04)] border-b border-candera-ash/70',
      ].join(' ')}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <Container className="py-4 flex items-center justify-between">
        {/* Left-aligned logo with visual offset */}
        <Link
          aria-label="Candera Home"
          className={[
            'font-display font-bold text-xl tracking-[-0.04em] transition-colors pl-0.5',
            isTransparent ? 'text-candera-vellum' : 'text-candera-obsidian',
          ].join(' ')}
          href="/"
        >
          CANDERA
        </Link>

        {/* Right nav */}
        <Section as="nav" padding="none" className="flex items-center">
          <HeaderNav data={data} transparent={isTransparent} pathname={pathname} />
          <MobileNav data={data} transparent={isTransparent} />
        </Section>
      </Container>
    </Section>
  )
}
