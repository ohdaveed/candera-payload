'use client'

import React from 'react'

type Props = Omit<React.ComponentPropsWithoutRef<'a'>, 'href'> & {
  // Element id (without the leading #) to smooth-scroll to on click.
  targetId: string
  href?: string
}

// Progressive-enhancement anchor: renders a real `<a href="#target">` so it works
// without JS and stays keyboard/screen-reader accessible, then upgrades the click to
// a smooth scroll. forwardRef + prop spreading let it slot into <Button asChild>.
export const SmoothScrollLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ targetId, href, onClick, children, ...rest }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)
      // Preserve native anchor behaviour: respect a handler that already handled the
      // event, and let modified / non-primary clicks (Cmd/Ctrl/Shift/Alt, middle-click)
      // open in a new tab/window as a normal link would.
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const target = document.getElementById(targetId)
      if (target) {
        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
        // Keep the URL hash in sync as a real anchor would, so the location is
        // shareable and back/forward navigation works.
        history.pushState(null, '', `#${targetId}`)
      }
    }

    return (
      <a ref={ref} href={href ?? `#${targetId}`} onClick={handleClick} {...rest}>
        {children}
      </a>
    )
  },
)

SmoothScrollLink.displayName = 'SmoothScrollLink'
