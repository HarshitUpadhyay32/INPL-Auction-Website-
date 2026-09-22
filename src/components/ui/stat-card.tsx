import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'gold' | 'blue' | 'emerald' | 'red' | 'purple' | 'default'
  className?: string
}

const colorClasses = {
  gold: 'from-inpl-neon/10 to-transparent border-inpl-neon/20',
  blue: 'from-inpl-electric/10 to-transparent border-inpl-electric/20',
  emerald: 'from-inpl-emerald/10 to-transparent border-inpl-emerald/20',
  red: 'from-inpl-red/10 to-transparent border-inpl-red/20',
  purple: 'from-inpl-purple/10 to-transparent border-inpl-purple/20',
  default: 'from-surface-elevated to-transparent border-border-default',
}

const iconColorClasses = {
  gold: 'text-inpl-neon bg-inpl-neon/10',
  blue: 'text-inpl-electric bg-inpl-electric/10',
  emerald: 'text-inpl-emerald bg-inpl-emerald/10',
  red: 'text-inpl-red bg-inpl-red/10',
  purple: 'text-inpl-purple bg-inpl-purple/10',
  default: 'text-text-secondary bg-surface-elevated',
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  trendValue,
  color = 'default',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border p-5
        bg-gradient-to-br ${colorClasses[color]}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-text-muted font-medium">{label}</p>
          <p className="text-3xl font-bold font-display text-text-primary tracking-tight">
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-text-muted">{sublabel}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend === 'up' ? 'text-inpl-emerald' : trend === 'down' ? 'text-inpl-red' : 'text-text-muted'
            }`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
