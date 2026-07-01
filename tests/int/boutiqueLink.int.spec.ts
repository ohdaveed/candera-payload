import 'dotenv/config'
import React from 'react'
import { render, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { track } from '@vercel/analytics'
import { BoutiqueLink } from '@/components/EtsyHandshake/BoutiqueLink'

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }))
vi.mock('sonner', () => ({ toast: { info: vi.fn() } }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('BoutiqueLink', () => {
  it('tracks an Etsy Outclick event with the listing href and click location', () => {
    const { getByText } = render(
      React.createElement(BoutiqueLink, {
        href: 'https://www.etsy.com/listing/123456789',
        location: 'product-cta',
        // oxlint-disable-next-line react/no-children-prop
        children: 'Purchase via Etsy',
      }),
    )

    fireEvent.click(getByText('Purchase via Etsy'))

    expect(track).toHaveBeenCalledWith('Etsy Outclick', {
      href: 'https://www.etsy.com/listing/123456789',
      location: 'product-cta',
    })
  })
})
