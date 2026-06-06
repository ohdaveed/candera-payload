import React from 'react'

export const DashboardHeader: React.FC = () => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mb-8">
      <h1
        suppressHydrationWarning
        className="font-serif italic font-normal text-[1.75rem] text-foreground m-0 mb-1 leading-[1.2]"
      >
        {greeting}
      </h1>
      <p className="text-[0.875rem] text-muted-foreground m-0 tracking-[0.02em]">
        Candera Candles — Store Dashboard
      </p>
    </div>
  )
}
