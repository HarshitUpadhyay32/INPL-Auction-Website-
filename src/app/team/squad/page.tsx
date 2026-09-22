'use client'

import React, { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Player, Squad } from '@/lib/types/database'

export default function TeamSquadPage() {
  const [squad, setSquad] = useState<(Squad & { player?: Player })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()
      if (!profile?.team_id) return

      const { data } = await supabase
        .from('squads')
        .select('*, player:players(*)')
        .eq('team_id', profile.team_id)
        .order('purchased_at')
      if (data) setSquad(data as (Squad & { player?: Player })[])
      setLoading(false)
    }
    load()
  }, [])

  const totalSpent = squad.reduce((sum, s) => sum + Number(s.purchase_price), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">My Squad</h1>
          <p className="text-sm text-text-secondary mt-1">{squad.length} players • Total: {formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
      ) : squad.length === 0 ? (
        <Card glass className="text-center !p-12">
          <Trophy className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No Players Yet</h3>
          <p className="text-sm text-text-secondary">Your purchased players will appear here</p>
        </Card>
      ) : (
        <Card glass>
          <div className="space-y-1">
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
                    <span className="text-xs text-text-muted">{entry.player?.department} • {entry.player?.year}</span>
                  </div>
                </div>
                <span className="font-display font-bold text-inpl-neon">{formatCurrency(Number(entry.purchase_price))}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
