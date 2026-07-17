'use client'
import { Button } from '@/components/ui/button'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'
import { useState } from 'react'

export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState('Copy')

  function updateCopyStatus() {
    if (text === 'Copy') {
      setText(() => 'Copied!')
      setTimeout(() => {
        setText(() => 'Copy')
      }, 1000)
    }
  }

  return (
    <Button
      className="absolute top-2 right-2 flex gap-1"
      size="sm"
      variant="cta-ghost-dark"
      onClick={async () => {
        await navigator.clipboard.writeText(code)
        updateCopyStatus()
      }}
    >
      <p>{text}</p>
      <CopyIcon />
    </Button>
  )
}
