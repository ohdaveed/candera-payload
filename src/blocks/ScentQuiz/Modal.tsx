'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { ScentQuizBlock } from './Component'
import type { ScentQuizBlock as ScentQuizBlockType } from '@/payload-types'

export const ScentQuizModal: React.FC<ScentQuizBlockType> = (props) => {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => {
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
    // Remove the hash and quiz state param without a page jump
    try {
      const params = new URLSearchParams(window.location.search)
      params.delete('q')
      const search = params.toString()
      history.replaceState(null, '', window.location.pathname + (search ? `?${search}` : ''))
    } catch {
      window.location.hash = ''
    }
  }, [])

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#scent-quiz') {
        open()
      }
    }

    // Check on mount (handles direct link / back navigation)
    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Scent Quiz"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-candera-obsidian/80 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[1100px] max-h-[90dvh] overflow-y-auto mx-4 rounded-[2px] shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label="Close quiz"
          className="absolute top-5 right-5 z-20 flex items-center justify-center w-10 h-10 text-white/60 hover:text-white transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <ScentQuizBlock {...props} />
      </div>
    </div>
  )
}
