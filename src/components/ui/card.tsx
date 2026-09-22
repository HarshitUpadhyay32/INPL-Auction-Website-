import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  glass?: boolean
  glow?: 'gold' | 'blue' | 'emerald' | 'red' | 'none'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const glowClasses = {
  gold: 'glow-gold',
  blue: 'glow-blue',
  emerald: 'glow-emerald',
  red: 'glow-red',
  none: '',
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  children,
  className = '',
  glass = true,
  glow = 'none',
  hover = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        ${glass ? 'glass' : 'bg-surface-card border border-border-default'}
        ${glowClasses[glow]}
        ${paddingClasses[padding]}
        ${hover ? 'hover:border-border-strong hover:bg-surface-hover transition-all duration-300 cursor-pointer hover:-translate-y-0.5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-text-primary font-display ${className}`}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-text-secondary ${className}`}>
      {children}
    </p>
  )
}
