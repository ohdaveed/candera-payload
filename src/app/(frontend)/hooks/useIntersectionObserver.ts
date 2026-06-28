// src/app/(frontend)/hooks/useIntersectionObserver.ts
import { useEffect, useState } from 'react'

interface Args extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver<T extends Element = Element>({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: Args = {}) {
  const [node, setNode] = useState<T | null>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
  }

  const thresholdString = JSON.stringify(threshold)

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, thresholdString, root, rootMargin, frozen])

  return { ref: setNode, entry, isIntersecting: !!entry?.isIntersecting }
}
