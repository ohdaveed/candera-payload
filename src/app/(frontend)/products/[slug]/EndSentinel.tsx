'use client'

import { useEffect, useRef } from 'react'
import { setEndSentinel } from './EndSentinelStore'

export function EndSentinel() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEndSentinel(ref.current)
    return () => {
      setEndSentinel(null)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" />
}
