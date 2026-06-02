'use client'

import React from 'react'

type MetricCardProps = {
  label: string
  value: number
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <div className="candera-metric">
      <span className="candera-metric__value">{value}</span>
      <span className="candera-metric__label">{label}</span>
    </div>
  )
}
