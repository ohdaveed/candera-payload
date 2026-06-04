'use client'
import { Button } from '@/components/ui/button'
import { CopyIcon } from '@payloadcms/ui/icons/Copy'
import { useState } from 'react'

/**
 * Renders a button that copies the provided code string to the clipboard.
 * Shows a temporary "Copied!" confirmation label after a successful copy.
 */
export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState('Copy')

  /** Temporarily changes the button label to "Copied!" and resets it after 1 second. */
  function updateCopyStatus() {
    if (text === 'Copy') {
      setText(() => 'Copied!')
      setTimeout(() => {
        setText(() => 'Copy')
      }, 1000)
    }
  }

  return (
    <div className="flex justify-end align-middle">
      <Button
        className="flex gap-1"
        variant={'secondary'}
        onClick={async () => {
          await navigator.clipboard.writeText(code)
          updateCopyStatus()
        }}
      >
        <p>{text}</p>
        <CopyIcon />
      </Button>
    </div>
  )
}
