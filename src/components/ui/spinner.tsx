import { Loader2Icon } from 'lucide-react'

import { cn } from '@/utilities/ui'

/**
 * A semantic loading spinner component.
 * Uses an 'output' tag for screen readers and an SVG icon for visual feedback.
 */
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <span className="inline-flex items-center">
      <Loader2Icon aria-hidden="true" className={cn('size-4 animate-spin', className)} {...props} />
      <output className="sr-only" aria-live="polite">
        Loading
      </output>
    </span>
  )
}

export { Spinner }
