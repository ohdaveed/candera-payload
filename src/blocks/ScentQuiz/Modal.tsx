'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ScentQuizBlock } from './Component'
import type { ScentQuizBlock as ScentQuizBlockType } from '@/payload-types'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const ScentQuizModal: React.FC<ScentQuizBlockType> = (props) => {
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<Element | null>(null)

  const open = useCallback(() => {
    triggerRef.current = document.activeElement
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
    // Return focus to the element that opened the dialog
    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus()
    }
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

  // Move focus into the dialog when it opens
  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return
    const first = panel.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
  }, [isOpen])

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }

      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, close])

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
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-[1100px] max-h-[90dvh] overflow-y-auto mx-4 rounded-[2px] shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label="Close quiz"
          className="absolute top-5 right-5 z-20 flex items-center justify-center w-10 h-10 text-candera-vellum/60 hover:text-candera-vellum transition-colors"
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
