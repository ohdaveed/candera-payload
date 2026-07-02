'use client'
import type { RefObject } from 'react'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

type UseClickableCardType<T extends HTMLElement> = {
  cardRef: RefObject<T | null>
  linkRef: RefObject<HTMLAnchorElement | null>
}

interface Props {
  external?: boolean
  newTab?: boolean
  scroll?: boolean
}

function isInteractiveElement(target: Element): boolean {
  return Boolean(
    target.closest('a, button, input, textarea, select, [role="button"], [role="link"]'),
  )
}

function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
}: Props): UseClickableCardType<T> {
  const router = useRouter()
  const card = useRef<T>(null)
  const link = useRef<HTMLAnchorElement>(null)
  const timeDown = useRef<number>(0)
  const hasActiveParent = useRef<boolean>(false)
  const pressedButton = useRef<number>(0)
  const spacePressed = useRef<boolean>(false)

  const navigate = useCallback(() => {
    if (!link.current?.href) return

    if (external) {
      const target = newTab ? '_blank' : '_self'
      window.open(link.current.href, target)
      return
    }

    router.push(link.current.href, { scroll })
  }, [external, newTab, router, scroll])

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.target) {
        const target = e.target as Element

        const timeNow = +new Date()
        const parent = target?.closest('a') || target?.closest('button')

        pressedButton.current = e.button

        if (!parent) {
          hasActiveParent.current = false
          timeDown.current = timeNow
        } else {
          hasActiveParent.current = true
        }
      }
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [router, card, link, timeDown],
  )

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (link.current?.href) {
        const timeNow = +new Date()
        const difference = timeNow - timeDown.current

        if (link.current?.href && difference <= 250) {
          if (!hasActiveParent.current && pressedButton.current === 0 && !e.ctrlKey) {
            navigate()
          }
        }
      }
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [navigate, card, link, timeDown],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!link.current?.href) return

      const target = e.target as Element
      const primaryLink = target.closest('a') === link.current

      if (primaryLink && e.key === ' ') {
        e.preventDefault()
        spacePressed.current = true
        return
      }

      if (isInteractiveElement(target) && target !== card.current) return

      if (e.key === 'Enter') {
        e.preventDefault()
        navigate()
      }

      if (e.key === ' ') {
        e.preventDefault()
        spacePressed.current = true
      }
    },
    [navigate, card],
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (!link.current?.href || e.key !== ' ') return

      const target = e.target as Element
      const primaryLink = target.closest('a') === link.current

      if (!primaryLink && isInteractiveElement(target) && target !== card.current) return

      if (spacePressed.current) {
        e.preventDefault()
        spacePressed.current = false
        navigate()
      }
    },
    [navigate, card],
  )

  useEffect(() => {
    const cardNode = card.current

    const abortController = new AbortController()

    if (cardNode) {
      cardNode.addEventListener('mousedown', handleMouseDown, {
        signal: abortController.signal,
      })
      cardNode.addEventListener('mouseup', handleMouseUp, {
        signal: abortController.signal,
      })
      cardNode.addEventListener('keydown', handleKeyDown, {
        signal: abortController.signal,
      })
      cardNode.addEventListener('keyup', handleKeyUp, {
        signal: abortController.signal,
      })
    }

    return () => {
      abortController.abort()
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [card, link, router, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp])

  return {
    cardRef: card,
    linkRef: link,
  }
}

export default useClickableCard
