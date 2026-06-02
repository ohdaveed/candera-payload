import React from 'react'

export const DashboardHeader: React.FC<{ user: { email?: string; name?: string } }> = ({ user }) => {
  const displayName = user?.name || user?.email || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="candera-dashboard__header">
      <h1 className="candera-dashboard__greeting">
        {greeting}, {displayName.split(' ')[0]}
      </h1>
      <p className="candera-dashboard__subtitle">Candera Candles — Store Dashboard</p>
    </div>
  )
}
