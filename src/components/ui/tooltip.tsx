'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const hide = () => setOpen(false)
    el.addEventListener('mouseleave', hide)
    return () => el.removeEventListener('mouseleave', hide)
  }, [])

  return (
    <span ref={ref} className="relative inline-flex">
      <span
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex"
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-[11px] leading-snug text-candera-vellum bg-candera-obsidian whitespace-nowrap z-50 pointer-events-none shadow-lg"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-candera-obsidian" />
        </span>
      )}
    </span>
  )
}
