'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Zap, Users, UserCircle, BarChart3, Trophy, ScrollText, LogIn, LogOut, LayoutDashboard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

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
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[96%] max-w-7xl z-50"
    >
      <div className="bg-[#0b1b3d]/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] relative">
          
          {/* Logo - Left */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black/60 border border-inpl-neon/20 shadow-inner">
                <span className="text-inpl-neon font-black text-sm font-display tracking-wider">INPL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white font-display leading-tight group-hover:text-inpl-neon transition-colors">
                  INPL
                </span>
                <span className="text-[10px] text-gray-400 leading-tight tracking-wider font-medium">
                  SEASON 3
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav - Center */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2" onMouseLeave={() => setHoveredTab(null)}>
            {navLinks.map(link => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredTab(link.href)}
                  className={`
                    relative px-3 py-2 rounded-xl text-sm font-medium transition-colors z-10
                    ${isActive ? 'text-inpl-neon' : 'text-gray-300 hover:text-white'}
                  `}
                >
                  {hoveredTab === link.href && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-inpl-neon rounded-full"
                    />
                  )}
                  <span className="relative z-20 flex items-center gap-1.5">
                    {link.live && <Badge variant="live" size="sm" pulse>LIVE</Badge>}
                    {!link.live && link.label}
                    {link.live && <span className="ml-0.5">{link.label.replace('Live ', '')}</span>}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Login / Auth Buttons - Right */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-3">
            {!session ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold 
                    bg-inpl-neon text-black hover:bg-inpl-neon/90 transition-all duration-200 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <LogIn size={16} />
                  Login
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-2 mr-1 border-r border-white/10 pr-4 py-1">
                  <span className="text-xs text-gray-400 font-medium">Role:</span>
                  <Badge variant={role === 'ADMIN' ? 'gold' : 'default'} size="sm" className="px-2 py-0.5 text-[10px] shadow-sm">
                    {role || 'USER'}
                  </Badge>
                </div>
                {(role === 'ADMIN' || role === 'TEAM') && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={role === 'ADMIN' ? '/admin' : '/team'}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-inpl-neon/10 text-inpl-neon hover:bg-inpl-neon/20 transition-all duration-200 border border-inpl-neon/30 hover:border-inpl-neon/50 shadow-[0_0_15px_rgba(204,255,0,0.15)]"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  </motion.div>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="lg:hidden mt-2 bg-[#0b1b3d]/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl origin-top"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-inpl-neon/10 text-inpl-neon'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
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
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-inpl-neon text-black mt-4 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              ) : (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between px-3 py-2.5 mb-2 bg-black/30 rounded-xl">
                    <span className="text-sm text-gray-400 font-medium">Current Role</span>
                    <Badge variant={role === 'ADMIN' ? 'gold' : 'default'} size="sm">
                      {role || 'USER'}
                    </Badge>
                  </div>
                  {(role === 'ADMIN' || role === 'TEAM') && (
                    <Link
                      href={role === 'ADMIN' ? '/admin' : '/team'}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium bg-inpl-neon/10 text-inpl-neon hover:bg-inpl-neon/20 border border-inpl-neon/30 transition-all mb-2 shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 text-left transition-colors border border-transparent hover:border-red-500/20"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
