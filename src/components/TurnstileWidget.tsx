'use client'

import { Turnstile } from '@marsidev/react-turnstile'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'

type Props = {
  onSuccess: (token: string) => void
  onExpire?: () => void
  className?: string
}

export function TurnstileWidget({ onSuccess, onExpire, className }: Props) {
  return (
    <div className={className}>
      <Turnstile siteKey={SITE_KEY} onSuccess={onSuccess} onExpire={onExpire} />
    </div>
  )
}
