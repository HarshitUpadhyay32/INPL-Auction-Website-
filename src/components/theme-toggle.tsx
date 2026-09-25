'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting until mounted
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className={`w-10 h-10 rounded-xl transition-colors hover:bg-surface-hover flex items-center justify-center opacity-0 ${className}`}>
        <span className="w-5 h-5"></span>
      </button>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-colors hover:bg-surface-hover hover:border hover:border-border-default ${className}`}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun className="absolute w-5 h-5 transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0 text-text-primary" />
        <Moon className="absolute w-5 h-5 transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100 text-text-primary" />
      </div>
    </button>
  )
}
