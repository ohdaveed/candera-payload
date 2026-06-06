'use client'

import React from 'react'
import { toast } from 'sonner'

interface BoutiqueLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export const BoutiqueLink: React.FC<BoutiqueLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    toast.info('Redirecting to Studio Boutique...', {
      description: 'Preparing your ritual transition.',
      duration: 1500,
    })

    setTimeout(() => {
      window.open(href, '_blank', 'noopener,noreferrer')
    }, 800)
  }

  return (
    <a href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}
