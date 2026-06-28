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
      if (event.defaultPrevented) return

      const target = document.getElementById(targetId)
      if (target) {
        event.preventDefault()
        target.scrollIntoView({ behavior: 'smooth' })
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
