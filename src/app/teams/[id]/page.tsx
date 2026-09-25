'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, IndianRupee, Users, Trophy, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Team, Squad, Player } from '@/lib/types/database'
import { TeamAvatar } from '@/components/team-avatar'

export default function TeamDetailPage() {
  const params = useParams()
  const [team, setTeam] = useState<Team | null>(null)
  const [squad, setSquad] = useState<(Squad & { player?: Player })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: teamData } = await supabase.from('teams').select('*').eq('id', params.id).single()
      if (teamData) setTeam(teamData)

      const { data: squadData } = await supabase
        .from('squads')
        .select('*, player:players(*)')
        .eq('team_id', params.id as string)
        .order('purchased_at')
      if (squadData) setSquad(squadData as (Squad & { player?: Player })[])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div className="min-h-screen pt-24 px-4"><div className="max-w-4xl mx-auto h-64 shimmer rounded-2xl" /></div>
  if (!team) return <div className="min-h-screen pt-24 px-4 text-center text-text-muted">Team not found</div>

  const spent = Number(team.initial_purse) - Number(team.remaining_purse)
  const avgPrice = squad.length > 0 ? spent / squad.length : 0
  const highestPurchase = squad.length > 0 ? Math.max(...squad.map(s => Number(s.purchase_price))) : 0

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/teams" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Teams
        </Link>

        {/* Team Header */}
        <div className="flex items-center gap-5 mb-8">
          <TeamAvatar team={team} size="2xl" />
          <div>
            <h1 className="text-3xl font-bold font-display text-text-primary">{team.name}</h1>
            {team.owner_name && <p className="text-sm text-text-secondary mt-1">{team.owner_name}</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Remaining Purse" value={formatCurrency(Number(team.remaining_purse))} icon={<IndianRupee size={18} />} color="emerald" />
          <StatCard label="Total Spent" value={formatCurrency(spent)} icon={<TrendingUp size={18} />} color="gold" />
          <StatCard label="Squad Size" value={`${team.players_count}/${team.max_players}`} icon={<Users size={18} />} color="blue" />
          <StatCard label="Avg. Price" value={avgPrice > 0 ? formatCurrency(avgPrice) : '—'} icon={<Trophy size={18} />} color="purple" />
        </div>

        {/* Squad */}
        <Card glass>
          <CardHeader>
            <CardTitle>Squad ({squad.length}/{team.max_players})</CardTitle>
          </CardHeader>
          {squad.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No players purchased yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {squad.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                  <span className="text-sm text-text-muted font-mono w-6 text-right">{i + 1}.</span>
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-xl">
                    {entry.player ? getRoleEmoji(entry.player.role) : '🏏'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary">{entry.player?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={
                        entry.player?.role === 'Batter' ? 'blue' :
                        entry.player?.role === 'Bowler' ? 'red' :
                        entry.player?.role === 'All-Rounder' ? 'gold' : 'purple'
                      } size="sm">{entry.player?.role}</Badge>
                      {entry.player?.department && <span className="text-xs text-text-muted">{entry.player.department}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-inpl-neon">{formatCurrency(Number(entry.purchase_price))}</p>
                    <p className="text-[10px] text-text-muted font-mono">{entry.player?.player_code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
