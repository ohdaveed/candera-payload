'use client'

import * as React from 'react'
import { cn } from '@/utilities/ui'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export interface CollapsibleSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  label: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isActive?: boolean
}

export function CollapsibleSection({
  icon,
  label,
  open,
  onOpenChange,
  isActive = false,
  className,
  children,
  ...props
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'w-full rounded-lg border border-border bg-card text-card-foreground shadow-xs overflow-hidden transition-all duration-200',
        isActive && 'border-primary/50 shadow-sm',
        className,
      )}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'flex w-full items-center justify-between gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 cursor-pointer select-none',
            isActive && 'bg-muted/30',
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {icon && <div className="flex shrink-0 items-center justify-center">{icon}</div>}
            <span className="truncate text-left">{label}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t border-border bg-card">{children}</CollapsibleContent>
    </Collapsible>
  )
}
