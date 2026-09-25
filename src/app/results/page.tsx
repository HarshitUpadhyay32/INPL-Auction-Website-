'use client'

import React, { useEffect, useState } from 'react'
import { Trophy, Users, IndianRupee, TrendingUp, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Team, Player, Squad } from '@/lib/types/database'
import { TeamAvatar } from '@/components/team-avatar'

export default function ResultsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: teamsData } = await supabase.from('teams').select('*').order('remaining_purse')
      if (teamsData) setTeams(teamsData)

      const { data: soldData } = await supabase.from('players').select('*').eq('status', 'SOLD').order('sold_price', { ascending: false })
      if (soldData) setSoldPlayers(soldData)

      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true })
      setTotalPlayers(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  const totalSpent = teams.reduce((sum, t) => sum + (Number(t.initial_purse) - Number(t.remaining_purse)), 0)
  const unsoldCount = totalPlayers - soldPlayers.length
  const highestBid = soldPlayers.length > 0 ? Number(soldPlayers[0].sold_price) : 0
  const avgPrice = soldPlayers.length > 0 ? totalSpent / soldPlayers.length : 0

  function getTeamName(tid: string | null): string {
    if (!tid) return ''
    return teams.find(t => t.id === tid)?.name || ''
  }
  function getTeamColor(tid: string | null): string {
    if (!tid) return '#64748b'
    return teams.find(t => t.id === tid)?.color || '#64748b'
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display gradient-text mb-2">Auction Results</h1>
          <p className="text-text-secondary">INPL Season 3 Final Summary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Players Sold" value={soldPlayers.length} sublabel={`of ${totalPlayers}`} icon={<Trophy size={22} />} color="emerald" />
          <StatCard label="Players Unsold" value={unsoldCount} icon={<Users size={22} />} color="red" />
          <StatCard label="Total Spent" value={formatCurrency(totalSpent)} icon={<IndianRupee size={22} />} color="gold" />
          <StatCard label="Highest Bid" value={highestBid > 0 ? formatCurrency(highestBid) : '—'} sublabel={soldPlayers[0]?.name} icon={<Award size={22} />} color="purple" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Purchases */}
          <Card glass>
            <CardHeader>
              <CardTitle>🏆 Top 10 Purchases</CardTitle>
            </CardHeader>
            {soldPlayers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No players sold yet</p>
            ) : (
              <div className="space-y-2">
                {soldPlayers.slice(0, 10).map((player, i) => (
                  <div key={player.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                    <span className={`text-sm font-display font-bold w-6 text-center ${i < 3 ? 'text-inpl-neon' : 'text-text-muted'}`}>{i + 1}</span>
                    <span className="text-lg">{getRoleEmoji(player.role)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{player.name}</p>
                      <div className="flex items-center gap-2">
                        {teams.find(t => t.id === player.sold_to_team_id) && (
                          <TeamAvatar team={teams.find(t => t.id === player.sold_to_team_id)!} size="sm" className="w-4 h-4 text-[8px]" />
                        )}
                        <span className="text-xs text-text-muted">{getTeamName(player.sold_to_team_id)}</span>
                      </div>
                    </div>
                    <span className="font-display font-bold text-inpl-neon">{formatCurrency(Number(player.sold_price))}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Team Summary */}
          <Card glass>
            <CardHeader>
              <CardTitle>Team Summary</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {teams.map(team => {
                const spent = Number(team.initial_purse) - Number(team.remaining_purse)
                return (
                  <div key={team.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-hover transition-colors">
                    <TeamAvatar team={team} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{team.name}</p>
                      <p className="text-[10px] text-text-muted">{team.players_count} players</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-display font-semibold text-inpl-neon">{formatCurrency(spent)}</p>
                      <p className="text-[10px] text-text-muted">{formatCurrency(Number(team.remaining_purse))} left</p>
                    </div>
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
