'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wallet, Users, Gavel, Trophy, ArrowRight, IndianRupee, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Team, Player, Squad, AuctionConfig } from '@/lib/types/database'

export default function TeamDashboardPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [squad, setSquad] = useState<(Squad & { player?: Player })[]>([])
  const [config, setConfig] = useState<AuctionConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeamData() {
      const supabase = createClient()

      // Get current user's team
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()
      if (!profile?.team_id) return

      const { data: teamData } = await supabase.from('teams').select('*').eq('id', profile.team_id).single()
      if (teamData) setTeam(teamData)

      const { data: squadData } = await supabase
        .from('squads')
        .select('*, player:players(*)')
        .eq('team_id', profile.team_id)
        .order('purchased_at')
      if (squadData) setSquad(squadData as (Squad & { player?: Player })[])

      const { data: configData } = await supabase.from('auction_config').select('*').limit(1).single()
      if (configData) setConfig(configData)

      setLoading(false)
    }

    loadTeamData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const spent = team ? Number(team.initial_purse) - Number(team.remaining_purse) : 0
  const slotsLeft = team ? team.max_players - team.players_count : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {team && (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold font-display text-2xl"
              style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}88)` }}
            >
              {team.short_name?.[0] || team.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold font-display text-text-primary">{team?.name || 'Team Dashboard'}</h1>
            <p className="text-sm text-text-secondary mt-0.5">PW IOI Premier League</p>
          </div>
        </div>
        <Link href="/team/auction">
          <Button variant="gold" size="lg" icon={<Gavel size={18} />}>
            Live Auction
            <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Remaining Purse"
          value={formatCurrency(Number(team?.remaining_purse || 0))}
          sublabel={`of ${formatCurrency(Number(team?.initial_purse || 25))}`}
          icon={<Wallet size={22} />}
          color="emerald"
        />
        <StatCard
          label="Amount Spent"
          value={formatCurrency(spent)}
          icon={<ShoppingCart size={22} />}
          color="gold"
        />
        <StatCard
          label="Squad Size"
          value={`${team?.players_count || 0} / ${team?.max_players || 12}`}
          sublabel={`${slotsLeft} slots remaining`}
          icon={<Users size={22} />}
          color="blue"
        />
        <StatCard
          label="Avg. Price"
          value={squad.length > 0 ? formatCurrency(spent / squad.length) : '—'}
          icon={<IndianRupee size={22} />}
          color="purple"
        />
      </div>

      {/* Squad + Auction Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Squad */}
        <Card glass>
          <CardHeader>
            <CardTitle>My Squad ({squad.length}/{team?.max_players || 12})</CardTitle>
            <Link href="/team/squad">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          {squad.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No players purchased yet</p>
              <p className="text-xs mt-1">Head to the Live Auction to place bids</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {squad.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors">
                  <span className="text-xs text-text-muted font-mono w-5">{i + 1}.</span>
                  <span className="text-lg">{entry.player ? getRoleEmoji(entry.player.role) : '🏏'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{entry.player?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-text-muted">{entry.player?.role} • {entry.player?.department}</p>
                  </div>
                  <span className="text-sm font-display font-semibold text-inpl-neon">
                    {formatCurrency(Number(entry.purchase_price))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Auction Status */}
        <Card glass>
          <CardHeader>
            <CardTitle>Auction Status</CardTitle>
            <Badge
              variant={config?.auction_status === 'LIVE' ? 'live' : 'available'}
              pulse={config?.auction_status === 'LIVE'}
            >
              {config?.auction_status || 'DRAFT'}
            </Badge>
          </CardHeader>
          <div className="space-y-4">
            <div className="bg-surface-elevated/50 rounded-xl p-4 text-center">
              {config?.auction_status === 'LIVE' ? (
                <>
                  <Gavel className="w-8 h-8 text-inpl-neon mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-primary mb-1">Auction is LIVE!</p>
                  <p className="text-xs text-text-secondary mb-3">Head to the live auction to place bids</p>
                  <Link href="/team/auction">
                    <Button variant="gold" icon={<Gavel size={16} />}>Go to Auction</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Gavel className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium text-text-secondary">Auction has not started yet</p>
                  <p className="text-xs text-text-muted mt-1">You&apos;ll be able to bid when the auctioneer begins</p>
                </>
              )}
            </div>

            {/* Purse Bar */}
            {team && (
              <div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                  <span>Purse Used</span>
                  <span>{Math.round((spent / Number(team.initial_purse)) * 100)}%</span>
                </div>
                <div className="h-3 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(spent / Number(team.initial_purse)) * 100}%`,
                      background: `linear-gradient(90deg, ${team.color}, ${team.color}88)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
