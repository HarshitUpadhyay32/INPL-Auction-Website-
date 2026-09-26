'use client'

import React, { useEffect, useState } from 'react'
import { BarChart3, Trophy, Users, IndianRupee, TrendingUp, Award, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Team, Player } from '@/lib/types/database'

export default function StatisticsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: t } = await supabase.from('teams').select('*').order('remaining_purse')
      if (t) setTeams(t)
      const { data: p } = await supabase.from('players').select('*')
      if (p) setPlayers(p)
      setLoading(false)
    }
    load()
  }, [])

  const sold = players.filter(p => p.status === 'SOLD')
  const unsold = players.filter(p => p.status === 'UNSOLD')
  const totalSpent = teams.reduce((s, t) => s + (Number(t.initial_purse) - Number(t.remaining_purse)), 0)
  const avgPrice = sold.length > 0 ? totalSpent / sold.length : 0
  const sortedBySold = [...sold].sort((a, b) => Number(b.sold_price) - Number(a.sold_price))
  const roleBreakdown = ['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'].map(r => ({
    role: r, total: players.filter(p => p.role === r).length, sold: sold.filter(p => p.role === r).length,
  }))

  if (loading) return <main className="min-h-screen pt-24 px-4"><div className="h-64 shimmer rounded-2xl" /></main>

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display text-text-primary mb-2">Statistics</h1>
          <p className="text-text-secondary">PW IOI Premier League Auction Analytics</p>
        </div>

        {/* Tournament Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard label="Total Players" value={players.length} icon={<Users size={18} />} color="blue" />
          <StatCard label="Sold" value={sold.length} icon={<Trophy size={18} />} color="emerald" />
          <StatCard label="Unsold" value={unsold.length} icon={<Target size={18} />} color="red" />
          <StatCard label="Total Spent" value={formatCurrency(totalSpent)} icon={<IndianRupee size={18} />} color="gold" />
          <StatCard label="Avg. Price" value={avgPrice > 0 ? formatCurrency(avgPrice) : '—'} icon={<TrendingUp size={18} />} color="purple" />
          <StatCard label="Highest Bid" value={sortedBySold[0] ? formatCurrency(Number(sortedBySold[0].sold_price)) : '—'} icon={<Award size={18} />} color="gold" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Breakdown */}
          <Card glass>
            <CardHeader><CardTitle>By Role</CardTitle></CardHeader>
            <div className="space-y-4">
              {roleBreakdown.map(r => (
                <div key={r.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{getRoleEmoji(r.role)}</span>
                      <span className="text-text-primary font-medium">{r.role}</span>
                    </div>
                    <span className="text-text-muted">{r.sold}/{r.total} sold</span>
                  </div>
                  <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                    <div className="h-full bg-inpl-neon rounded-full transition-all" style={{ width: `${r.total > 0 ? (r.sold / r.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Spending */}
          <Card glass>
            <CardHeader><CardTitle>Team Spending</CardTitle></CardHeader>
            <div className="space-y-3">
              {[...teams].sort((a, b) => (Number(b.initial_purse) - Number(b.remaining_purse)) - (Number(a.initial_purse) - Number(a.remaining_purse))).map((team, i) => {
                const spent = Number(team.initial_purse) - Number(team.remaining_purse)
                return (
                  <div key={team.id} className="flex items-center gap-3">
                    <span className={`text-xs font-display font-bold w-5 ${i < 3 ? 'text-inpl-neon' : 'text-text-muted'}`}>{i + 1}</span>
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: team.color }}>
                      {team.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{team.name}</p>
                      <div className="h-1.5 bg-surface-elevated rounded-full mt-1">
                        <div className="h-full rounded-full" style={{ width: `${(spent / Number(team.initial_purse)) * 100}%`, background: team.color }} />
                      </div>
                    </div>
                    <span className="text-xs font-display font-semibold text-inpl-neon">{formatCurrency(spent)}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
