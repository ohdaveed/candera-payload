'use client'

import React, { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react'

type Props = {
  content: string
  children: React.ReactNode
}

type TooltipTriggerProps = {
  onMouseEnter?: React.MouseEventHandler
  onFocus?: React.FocusEventHandler
  onBlur?: React.FocusEventHandler
  'aria-describedby'?: string
}

export function Tooltip({ content, children }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const hide = () => setOpen(false)
    el.addEventListener('mouseleave', hide)
    return () => el.removeEventListener('mouseleave', hide)
  }, [])

  const attachHandlers = (child: React.ReactElement<TooltipTriggerProps>) =>
    cloneElement(child, {
      onMouseEnter: (event: React.MouseEvent) => {
        child.props.onMouseEnter?.(event)
        setOpen(true)
      },
      onFocus: (event: React.FocusEvent) => {
        child.props.onFocus?.(event)
        setOpen(true)
      },
      onBlur: (event: React.FocusEvent) => {
        child.props.onBlur?.(event)
        setOpen(false)
      },
      'aria-describedby': open ? tooltipId : child.props['aria-describedby'],
    })

  return (
    <span ref={ref} className="relative inline-flex">
      {isValidElement<TooltipTriggerProps>(children) ? (
        attachHandlers(children)
      ) : (
        <span
          onMouseEnter={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          aria-describedby={open ? tooltipId : undefined}
          className="inline-flex"
        >
          {children}
        </span>
      )}
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-[11px] leading-snug text-candera-vellum bg-candera-obsidian whitespace-normal z-50 pointer-events-none shadow-lg max-w-[min(100vw-2rem,20rem)]"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-candera-obsidian" />
        </span>
      )}
    </span>
  )
}
