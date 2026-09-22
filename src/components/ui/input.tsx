import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-surface-elevated border border-border-default rounded-xl
            px-4 py-2.5 text-sm text-text-primary placeholder-text-muted
            focus:outline-none focus:ring-2 focus:ring-inpl-electric/50 focus:border-inpl-electric/50
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-inpl-red/50 focus:ring-inpl-red/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-inpl-red-light">{error}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-surface-elevated border border-border-default rounded-xl
          px-4 py-2.5 text-sm text-text-primary
          focus:outline-none focus:ring-2 focus:ring-inpl-electric/50 focus:border-inpl-electric/50
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          appearance-none cursor-pointer
          ${error ? 'border-inpl-red/50 focus:ring-inpl-red/50' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-inpl-red-light">{error}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-surface-elevated border border-border-default rounded-xl
          px-4 py-2.5 text-sm text-text-primary placeholder-text-muted
          focus:outline-none focus:ring-2 focus:ring-inpl-electric/50 focus:border-inpl-electric/50
          transition-all duration-200 resize-vertical min-h-[80px]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-inpl-red/50 focus:ring-inpl-red/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-inpl-red-light">{error}</p>
      )}
    </div>
  )
}
