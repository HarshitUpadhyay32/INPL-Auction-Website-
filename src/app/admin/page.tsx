'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Users, UserCircle, Gavel, IndianRupee, TrendingUp, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Team, AuctionConfig } from '@/lib/types/database'

export default function AdminDashboardPage() {
  const [config, setConfig] = useState<AuctionConfig | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [playerStats, setPlayerStats] = useState({ total: 0, sold: 0, unsold: 0, available: 0, live: 0 })
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    const supabase = createClient()

    // Load config
    const { data: configData } = await supabase.from('auction_config').select('*').limit(1).single()
    if (configData) setConfig(configData)

    // Load teams
    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData)

    // Load player stats
    const { count: total } = await supabase.from('players').select('*', { count: 'exact', head: true })
    const { count: sold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'SOLD')
    const { count: unsold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'UNSOLD')
    const { count: live } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'LIVE')

    setPlayerStats({
      total: total || 0,
      sold: sold || 0,
      unsold: unsold || 0,
      available: (total || 0) - (sold || 0) - (unsold || 0) - (live || 0),
      live: live || 0,
    })

    // Calculate total spent
    const { data: transactions } = await supabase.from('transactions').select('amount').eq('transaction_type', 'PURCHASE')
    const spent = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0
    setTotalSpent(spent)

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 shimmer rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">PW IOI Premier League Auction Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={
            config?.auction_status === 'LIVE' ? 'live' :
            config?.auction_status === 'COMPLETED' ? 'sold' :
            config?.auction_status === 'PAUSED' ? 'gold' : 'available'
          } size="lg" pulse={config?.auction_status === 'LIVE'}>
            {config?.auction_status || 'DRAFT'}
          </Badge>
          <Link href="/admin/auction">
            <Button variant="gold" icon={<Gavel size={16} />}>
              Auction Control
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Players"
          value={playerStats.total}
          sublabel={`${playerStats.available} available`}
          icon={<UserCircle size={22} />}
          color="blue"
        />
        <StatCard
          label="Players Sold"
          value={playerStats.sold}
          sublabel={`${playerStats.unsold} unsold`}
          icon={<ShoppingCart size={22} />}
          color="emerald"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          sublabel={`of ₹${(config?.purse_per_team || 25) * (config?.total_teams || 15)} Cr`}
          icon={<IndianRupee size={22} />}
          color="gold"
        />
        <StatCard
          label="Teams"
          value={teams.length}
          sublabel={`Max ${config?.max_squad_size || 12} players each`}
          icon={<Users size={22} />}
          color="purple"
        />
      </div>

      {/* Quick Actions + Team Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card glass className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <Link href="/admin/auction" className="block">
              <Button variant="gold" className="w-full justify-start" icon={<Gavel size={16} />}>
                Open Auction Control
              </Button>
            </Link>
            <Link href="/admin/players" className="block">
              <Button variant="secondary" className="w-full justify-start" icon={<UserCircle size={16} />}>
                Manage Players
              </Button>
            </Link>
            <Link href="/admin/teams" className="block">
              <Button variant="secondary" className="w-full justify-start" icon={<Users size={16} />}>
                Manage Teams
              </Button>
            </Link>
            <Link href="/admin/settings" className="block">
              <Button variant="secondary" className="w-full justify-start" icon={<TrendingUp size={16} />}>
                Auction Settings
              </Button>
            </Link>
            <Link href="/admin/reports" className="block">
              <Button variant="secondary" className="w-full justify-start" icon={<TrendingUp size={16} />}>
                Export Reports
              </Button>
            </Link>
          </div>
        </Card>

        {/* Team Purse Overview */}
        <Card glass className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team Purse Overview</CardTitle>
            <Link href="/admin/teams">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          {teams.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No teams created yet</p>
              <Link href="/admin/teams">
                <Button variant="secondary" size="sm" className="mt-3">
                  Add Teams
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {teams.map(team => {
                const spent = Number(team.initial_purse) - Number(team.remaining_purse)
                const percentage = (spent / Number(team.initial_purse)) * 100
                return (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold font-display flex-shrink-0"
                      style={{ background: team.color || '#3b82f6' }}
                    >
                      {team.short_name?.[0] || team.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary truncate">{team.name}</span>
                        <span className="text-sm font-semibold font-display text-inpl-emerald">
                          {formatCurrency(Number(team.remaining_purse))}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              background: percentage > 80 ? '#ef4444' : percentage > 50 ? '#f5a623' : '#10b981',
                            }}
                          />
                        </div>
                        <span className="text-xs text-text-muted flex-shrink-0">
                          {team.players_count}/{team.max_players}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
