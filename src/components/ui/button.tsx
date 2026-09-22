import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-inpl-electric hover:bg-inpl-electric-light text-white shadow-lg shadow-inpl-electric/20',
  secondary: 'bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border-default',
  danger: 'bg-inpl-red hover:bg-inpl-red-light text-white shadow-lg shadow-inpl-red/20',
  ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary',
  gold: 'bg-inpl-neon hover:bg-inpl-neon-light text-surface-primary font-semibold shadow-lg shadow-inpl-neon/20',
  success: 'bg-inpl-emerald hover:bg-inpl-emerald-light text-white shadow-lg shadow-inpl-emerald/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-inpl-electric/50 focus:ring-offset-2 focus:ring-offset-surface-primary
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        hover:scale-[1.02] active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
