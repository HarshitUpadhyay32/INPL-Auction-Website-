'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Gavel,
  Settings,
  BarChart3,
  FileText,
  Layers,
  ClipboardList,
  LogOut,
  Wallet,
  History,
  Trophy,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useState } from 'react'

function TeamQuickStats() {
  const [stats, setStats] = useState({ purse: 250000000, max: 12, count: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let teamId: string | null = null

    async function loadStats() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('No user')

        const { data: profile, error: profileError } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()
        if (profileError || !profile?.team_id) throw new Error('No profile or team_id')
        
        teamId = profile.team_id

        const { data: team, error: teamError } = await supabase.from('teams').select('remaining_purse, max_players, players_count').eq('id', teamId).single()
        if (teamError || !team) throw new Error('No team found')

        setStats({ purse: Number(team.remaining_purse), max: team.max_players, count: team.players_count })
      } catch (e) {
        console.error("Sidebar loadStats error:", e)
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    const subscription = supabase
      .channel('team_stats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        if (payload.new && (payload.new as any).id === teamId) {
          const updated = payload.new as any
          setStats({
            purse: Number(updated.remaining_purse),
            max: updated.max_players,
            count: updated.players_count
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  if (loading) return <div className="animate-pulse h-12 bg-surface-hover rounded-xl w-full" />

  return (
    <div className="glass-light rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted flex items-center gap-1.5">
          <Wallet size={12} />
          Purse
        </span>
        <span className="text-inpl-emerald font-semibold font-display">
          {formatCurrency(stats.purse)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted flex items-center gap-1.5">
          <Users size={12} />
          Squad
        </span>
        <span className="text-text-primary font-semibold">{stats.count} / {stats.max}</span>
      </div>
    </div>
  )
}

interface SidebarLink {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
}

const adminLinks: SidebarLink[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/auction', label: 'Auction Control', icon: Gavel, badge: 'LIVE' },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/teams', label: 'Teams', icon: Users },
  { href: '/admin/players', label: 'Players', icon: UserCircle },
  { href: '/admin/auction-sets', label: 'Auction Sets', icon: Layers },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit-log', label: 'Audit Log', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
]

const teamLinks: SidebarLink[] = [
  { href: '/team', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/team/auction', label: 'Live Auction', icon: Gavel, badge: 'BID' },
  { href: '/team/squad', label: 'My Squad', icon: Trophy },
  { href: '/team/history', label: 'Bid History', icon: History },
]

interface SidebarProps {
  type: 'admin' | 'team'
  teamName?: string
  teamColor?: string
}

export function Sidebar({ type, teamName, teamColor }: SidebarProps) {
  const pathname = usePathname()
  const links = type === 'admin' ? adminLinks : teamLinks

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface-secondary border-r border-border-default z-30 flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border-default">
        <Link href={type === 'admin' ? '/admin' : '/team'} className="flex items-center gap-3">
          {type === 'admin' ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-black border border-inpl-neon/20">
              <span className="text-inpl-neon font-black text-sm font-display tracking-wider">INPL</span>
            </div>
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: teamColor
                  ? `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}88 100%)`
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              <span className="text-white font-bold text-sm font-display">
                {teamName?.[0] || 'T'}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-bold text-text-primary font-display leading-tight">
              {type === 'admin' ? 'Admin Panel' : teamName || 'Team'}
            </span>
            <span className="text-[10px] text-text-muted leading-tight tracking-wider uppercase">
              {type === 'admin' ? 'INPL Season 3' : 'Team Dashboard'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {links.map(link => {
          const isActive = pathname === link.href ||
            (link.href !== '/admin' && link.href !== '/team' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-inpl-neon/10 dark:text-inpl-neon'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }
              `}
            >
              <link.icon size={18} />
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider
                  ${link.badge === 'LIVE'
                    ? 'bg-inpl-red/15 text-inpl-red-light'
                    : 'bg-inpl-emerald/15 text-inpl-emerald'
                  }
                `}>
                  {link.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats (Team only) */}
      {type === 'team' && (
        <div className="p-3 border-t border-border-default">
          <TeamQuickStats />
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-border-default">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <BarChart3 size={16} />
            Public Site
          </Link>
          <ThemeToggle />
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center justify-center p-2 rounded-xl text-text-muted hover:text-inpl-red hover:bg-inpl-red/10 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
