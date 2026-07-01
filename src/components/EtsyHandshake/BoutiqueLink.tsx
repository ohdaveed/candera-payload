'use client'

import React from 'react'
import { toast } from 'sonner'
import { track } from '@vercel/analytics'

interface BoutiqueLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  /** Which storefront surface triggered the click (e.g. 'product-cta', 'sticky-bar') — powers conversion-funnel breakdowns in Vercel Analytics. */
  location: string
  children: React.ReactNode
  /** Toast heading shown on outclick. Defaults to the purchase-oriented copy. */
  toastTitle?: string
  /** Toast body shown on outclick. Defaults to the purchase-oriented copy. */
  toastDescription?: string
}

export const BoutiqueLink: React.FC<BoutiqueLinkProps> = ({
  href,
  location,
  children,
  className,
  toastTitle = 'Opening Etsy',
  toastDescription = 'Completing your purchase on our official Etsy storefront.',
  ...props
}) => {
  const handleClick = () => {
    track('Etsy Outclick', { href, location })
    toast.info(toastTitle, {
      description: toastDescription,
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
