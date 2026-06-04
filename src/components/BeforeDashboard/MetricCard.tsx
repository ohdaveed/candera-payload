'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

type MetricCardProps = {
  label: string
  value: number
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <Card className="flex flex-col gap-1 p-4 bg-card border-border">
      <CardContent className="p-0 flex flex-col gap-1">
        <span className="text-[1.75rem] font-medium leading-none tabular-nums text-foreground">
          {value}
        </span>
        <span className="text-[0.75rem] text-muted-foreground uppercase tracking-[0.06em]">
          {label}
        </span>
      </CardContent>
    </Card>
  )
}
