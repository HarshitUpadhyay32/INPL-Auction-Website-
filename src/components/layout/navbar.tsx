'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Zap, Users, UserCircle, BarChart3, Trophy, ScrollText, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

const navLinks = [
  { href: '/', label: 'Home', icon: Zap },
  { href: '/live', label: 'Live Auction', icon: Zap, live: true },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/players', label: 'Players', icon: UserCircle },
  { href: '/results', label: 'Results', icon: Trophy },
  { href: '/statistics', label: 'Statistics', icon: BarChart3 },
  { href: '/rules', label: 'Rules', icon: ScrollText },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const fetchRole = async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
    if (data) {
      setRole(data.role)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    setMobileOpen(false)
  }

  // Don't show navbar on admin/team dashboards or display mode
  if (pathname.startsWith('/admin') || pathname.startsWith('/team') || pathname === '/live/display') {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/50 border border-inpl-neon/20">
              <span className="text-inpl-neon font-black text-sm font-display tracking-wider">INPL</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary font-display leading-tight group-hover:text-inpl-neon transition-colors">
                INPL
              </span>
              <span className="text-[10px] text-text-muted leading-tight tracking-wider">
                SEASON 3
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-inpl-neon/10 text-inpl-neon'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }
                  `}
                >
                  {link.live && (
                    <Badge variant="live" size="sm" pulse>LIVE</Badge>
                  )}
                  {!link.live && link.label}
                  {link.live && <span className="ml-0.5">{link.label.replace('Live ', '')}</span>}
                </Link>
              )
            })}
          </div>

          {/* Login / Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {!session ? (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
                  bg-inpl-neon/10 text-inpl-neon hover:bg-inpl-neon/20 transition-all duration-200
                  border border-inpl-neon/20"
              >
                <LogIn size={16} />
                Login
              </Link>
            ) : (
              <>
                <div className="flex items-center gap-2 mr-2 border-r border-border-default pr-4 py-1">
                  <span className="text-xs text-text-muted font-medium">Role:</span>
                  <Badge variant={role === 'ADMIN' ? 'gold' : 'default'} size="sm" className="px-2 py-0.5 text-[10px]">
                    {role || 'USER'}
                  </Badge>
                </div>
                {(role === 'ADMIN' || role === 'TEAM') && (
                  <Link
                    href={role === 'ADMIN' ? '/admin' : '/team'}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-inpl-neon/10 text-inpl-neon hover:bg-inpl-neon/20 transition-all duration-200 border border-inpl-neon/30 hover:border-inpl-neon/50 shadow-[0_0_10px_rgba(204,255,0,0.1)]"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border-default">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-inpl-neon/10 text-inpl-neon'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }
                  `}
                >
                  <link.icon size={18} />
                  {link.label}
                  {link.live && <Badge variant="live" size="sm" pulse>LIVE</Badge>}
                </Link>
              )
            })}
            {!session ? (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-inpl-neon hover:bg-inpl-neon/10"
              >
                <LogIn size={18} />
                Login
              </Link>
            ) : (
              <>
                <div className="flex items-center justify-between px-3 py-2.5 mb-2 bg-surface-hover/50 rounded-xl">
                  <span className="text-sm text-text-secondary font-medium">Current Role</span>
                  <Badge variant={role === 'ADMIN' ? 'gold' : 'default'} size="sm">
                    {role || 'USER'}
                  </Badge>
                </div>
                {(role === 'ADMIN' || role === 'TEAM') && (
                  <Link
                    href={role === 'ADMIN' ? '/admin' : '/team'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-inpl-neon/10 text-inpl-neon hover:bg-inpl-neon/20 border border-inpl-neon/30 transition-all"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 text-left"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
