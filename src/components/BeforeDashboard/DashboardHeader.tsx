import React from 'react'

export const DashboardHeader: React.FC = () => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="candera-dashboard__header">
      <h1 className="candera-dashboard__greeting">
        {greeting}
      </h1>
      <p className="candera-dashboard__subtitle">Candera Candles — Store Dashboard</p>
    </div>
  )
}
