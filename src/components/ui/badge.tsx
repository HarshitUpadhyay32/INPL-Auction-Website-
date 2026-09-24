import React from 'react'

type BadgeVariant = 'available' | 'live' | 'sold' | 'unsold' | 'default' | 'gold' | 'blue' | 'red' | 'emerald' | 'purple' | 'warning'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const variantClasses: Record<BadgeVariant, string> = {
  available: 'bg-inpl-electric text-white border-transparent dark:bg-inpl-electric/15 dark:text-inpl-electric-light dark:border-inpl-electric/30',
  live: 'bg-inpl-red text-white border-transparent dark:bg-inpl-red/15 dark:text-inpl-red-light dark:border-inpl-red/30',
  sold: 'bg-inpl-emerald text-white border-transparent dark:bg-inpl-emerald/15 dark:text-inpl-emerald-light dark:border-inpl-emerald/30',
  unsold: 'bg-surface-elevated text-text-muted border-border-default',
  default: 'bg-surface-elevated text-text-secondary border-border-default',
  gold: 'bg-inpl-neon-dark text-black border-transparent dark:bg-inpl-neon/15 dark:text-inpl-neon dark:border-inpl-neon/30',
  blue: 'bg-inpl-electric text-white border-transparent dark:bg-inpl-electric/15 dark:text-inpl-electric-light dark:border-inpl-electric/30',
  red: 'bg-inpl-red text-white border-transparent dark:bg-inpl-red/15 dark:text-inpl-red-light dark:border-inpl-red/30',
  emerald: 'bg-inpl-emerald text-white border-transparent dark:bg-inpl-emerald/15 dark:text-inpl-emerald-light dark:border-inpl-emerald/30',
  purple: 'bg-inpl-purple text-white border-transparent dark:bg-inpl-purple/15 dark:text-inpl-purple dark:border-inpl-purple/30',
  warning: 'bg-orange-500 text-white border-transparent dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
}

export function Badge({ variant = 'default', children, className = '', pulse = false, size = 'md' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full border
        uppercase tracking-wider
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'live' ? 'bg-inpl-red' : variant === 'sold' ? 'bg-inpl-emerald' : 'bg-inpl-electric'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            variant === 'live' ? 'bg-inpl-red' : variant === 'sold' ? 'bg-inpl-emerald' : 'bg-inpl-electric'
          }`} />
        </span>
      )}
      {children}
    </span>
  )
}

export function PlayerStatusBadge({ status }: { status: string }) {
  const variant = status.toLowerCase() as BadgeVariant
  const validVariant = ['available', 'live', 'sold', 'unsold'].includes(variant) ? variant : 'default'
  return (
    <Badge variant={validVariant} pulse={validVariant === 'live'}>
      {status}
    </Badge>
  )
}
