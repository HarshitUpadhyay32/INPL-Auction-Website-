'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Badge, PlayerStatusBadge } from '@/components/ui/badge'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Player, Team } from '@/lib/types/database'

export default function PlayersPublicPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadData = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('players').select('*').order('player_code')
    if (filterRole) query = query.eq('role', filterRole)
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    if (data) setPlayers(data)

    const { data: teamsData } = await supabase.from('teams').select('*')
    if (teamsData) setTeams(teamsData)
    setLoading(false)
  }, [filterRole, filterStatus])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  function getTeamName(tid: string | null): string {
    if (!tid) return ''
    return teams.find(t => t.id === tid)?.name || ''
  }

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.player_code.toLowerCase().includes(search.toLowerCase()) ||
    (p.department || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-display text-text-primary mb-2">Players</h1>
          <p className="text-text-secondary">{players.length} registered players</p>
        </div>

        {/* Filters */}
        <Card glass padding="sm" className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[200px]">
              <Input placeholder="Search name, ID, dept..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search size={16} />} />
            </div>
            <Select value={filterRole} onChange={e => setFilterRole(e.target.value)} options={[
              { value: '', label: 'All Roles' },
              { value: 'Batter', label: '🏏 Batter' },
              { value: 'Bowler', label: '🎯 Bowler' },
              { value: 'All-Rounder', label: '⭐ All-Rounder' },
              { value: 'Wicketkeeper', label: '🧤 Wicketkeeper' },
            ]} />
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[
              { value: '', label: 'All Status' },
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'SOLD', label: 'Sold' },
              { value: 'UNSOLD', label: 'Unsold' },
            ]} />
            <span className="text-xs text-text-muted">{filtered.length} results</span>
          </div>
        </Card>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-44 shimmer rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.slice(0, 100).map(player => (
              <Card key={player.id} glass hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-xl">
                      {getRoleEmoji(player.role)}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{player.name}</p>
                      <p className="text-[10px] text-text-muted font-mono">{player.player_code}</p>
                    </div>
                  </div>
                  <PlayerStatusBadge status={player.status} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={
                    player.role === 'Batter' ? 'blue' :
                    player.role === 'Bowler' ? 'red' :
                    player.role === 'All-Rounder' ? 'gold' : 'purple'
                  } size="sm">{player.role}</Badge>
                  {player.department && <span className="text-xs text-text-muted">{player.department}</span>}
                  {player.year && <span className="text-xs text-text-muted">• {player.year}</span>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-default">
                  <div>
                    <p className="text-[10px] text-text-muted">Base Price</p>
                    <p className="text-sm font-display font-semibold text-text-secondary">{formatCurrency(Number(player.base_price))}</p>
                  </div>
                  {player.status === 'SOLD' && player.sold_price && (
                    <div className="text-right">
                      <p className="text-[10px] text-text-muted">Sold For</p>
                      <p className="text-sm font-display font-bold text-inpl-emerald">{formatCurrency(Number(player.sold_price))}</p>
                      <p className="text-[10px] text-text-muted">{getTeamName(player.sold_to_team_id)}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
        {filtered.length > 100 && <p className="text-sm text-text-muted text-center mt-6">Showing first 100 results</p>}
      </div>
    </main>
  )
}
