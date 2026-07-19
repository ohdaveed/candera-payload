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
      className="absolute top-2 right-2 flex gap-1 rounded-none"
      size="sm"
      variant="cta-ghost-dark"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        } catch {
          setText('Copy failed')
          setTimeout(() => {
            setText('Copy')
          }, 1500)
        }
      }}
    >
      <output aria-live="polite" className="sr-only">
        {text}
      </output>
      <p aria-hidden="true">{text}</p>
      <CopyIcon />
    </Button>
  )
}
