'use client'

import React, { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'
import type { Bid, Player, Team } from '@/lib/types/database'

export default function TeamHistoryPage() {
  const [bids, setBids] = useState<(Bid & { player?: Player })[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()
      if (!profile?.team_id) return

      const { data: bidsData } = await supabase
        .from('bids')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false })
      if (bidsData) setBids(bidsData)

      const { data: playersData } = await supabase.from('players').select('*')
      if (playersData) setPlayers(playersData)
      setLoading(false)
    }
    load()
  }, [])

  function getPlayerName(pid: string): string {
    return players.find(p => p.id === pid)?.name || 'Unknown'
  }
  function getPlayerCode(pid: string): string {
    return players.find(p => p.id === pid)?.player_code || ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary">Bid History</h1>
        <p className="text-sm text-text-secondary mt-1">{bids.length} bids placed</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
      ) : bids.length === 0 ? (
        <Card glass className="text-center !p-12">
          <History className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No Bids Yet</h3>
          <p className="text-sm text-text-secondary">Your bid history will appear here</p>
        </Card>
      ) : (
        <Card glass>
          <div className="space-y-1">
            {bids.map(bid => (
              <div key={bid.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-text-muted font-mono">{formatTime(bid.created_at)}</p>
                    <p className="text-[10px] text-text-muted">{formatDate(bid.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{getPlayerName(bid.player_id)}</p>
                    <p className="text-[10px] text-text-muted font-mono">{getPlayerCode(bid.player_id)}</p>
                  </div>
                </div>
                <span className="font-display font-semibold text-inpl-neon">{formatCurrency(Number(bid.amount))}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
