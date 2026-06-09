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
  const handleClick = () => {
    toast.info('Redirecting to Studio Boutique...', {
      description: 'Preparing your ritual transition.',
      duration: 1500,
    })
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </a>
  )
}
