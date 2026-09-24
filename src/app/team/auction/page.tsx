'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Gavel, Zap, Wallet, Users, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayerAuctionCard } from '@/components/player-auction-card'
import { formatCurrency, formatTime, getRoleEmoji, getNextBidAmount } from '@/lib/utils'
import { toast } from 'sonner'
import type { Player, Team, Auction, Bid, AuctionConfig } from '@/lib/types/database'

export default function TeamAuctionPage() {
  const [team, setTeam] = useState<Team | null>(null)
  const [config, setConfig] = useState<AuctionConfig | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [bidding, setBidding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('team_id').eq('id', user.id).single()
    if (!profile?.team_id) return
    setTeamId(profile.team_id)

    const { data: teamData } = await supabase.from('teams').select('*').eq('id', profile.team_id).single()
    if (teamData) setTeam(teamData)

    const { data: configData } = await supabase.from('auction_config').select('*').limit(1).single()
    if (configData) setConfig(configData)

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setAllTeams(teamsData)

    // Get active auction
    const { data: activeAuction } = await supabase.from('auctions').select('*').in('status', ['ACTIVE', 'PAUSED']).limit(1).single()
    if (activeAuction) {
      setCurrentAuction(activeAuction)
      const { data: player } = await supabase.from('players').select('*').eq('id', activeAuction.player_id).single()
      if (player) setCurrentPlayer(player)
      const { data: bidsData } = await supabase.from('bids').select('*').eq('auction_id', activeAuction.id).order('created_at', { ascending: false })
      if (bidsData) setBids(bidsData)
    } else {
      setCurrentPlayer(null)
      setCurrentAuction(null)
      setBids([])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  // Real-time subscriptions
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('team-auction')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newBid = payload.new as Bid
          setBids(prev => [newBid, ...prev])
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        loadData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadData])

  async function placeBid() {
    if (!currentAuction || !teamId || !config) return
    setBidding(true)

    const nextBid = getNextBidAmount(
      Number(currentAuction.current_bid),
      currentAuction.bid_count
    )

    const supabase = createClient()
    const { data, error } = await supabase.rpc('place_bid', {
      p_auction_id: currentAuction.id,
      p_player_id: currentAuction.player_id,
      p_team_id: teamId,
      p_amount: nextBid,
    })

    if (error) {
      toast.error(error.message)
    } else if (data && !data.success) {
      toast.error(data.error || 'Bid rejected')
    } else {
      toast.success(`Bid placed: ${formatCurrency(nextBid)}`)
    }

    setBidding(false)
    loadData()
  }

  function getTeamName(tid: string): string {
    return allTeams.find(t => t.id === tid)?.name || 'Unknown'
  }

  function getTeamColor(tid: string): string {
    return allTeams.find(t => t.id === tid)?.color || '#64748b'
  }

  const nextBid = currentAuction && config
    ? getNextBidAmount(Number(currentAuction.current_bid), currentAuction.bid_count)
    : 0

  const canBid = team && currentAuction &&
    currentAuction.status === 'ACTIVE' &&
    Number(team.remaining_purse) >= nextBid &&
    team.players_count < team.max_players &&
    currentAuction.highest_bid_team_id !== teamId

  const highestBidder = currentAuction?.highest_bid_team_id
    ? allTeams.find(t => t.id === currentAuction.highest_bid_team_id)
    : null

  const isLeading = currentAuction?.highest_bid_team_id === teamId

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-xl" />
        <div className="h-96 shimmer rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
          <Gavel className="text-inpl-neon" />
          Live Auction
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right bg-inpl-emerald/10 border border-inpl-emerald/30 px-4 py-2 rounded-xl">
            <p className="text-[10px] text-inpl-emerald uppercase font-bold tracking-wider mb-0.5">Purse Remaining</p>
            <p className="text-xl font-display font-extrabold text-inpl-emerald">{formatCurrency(Number(team?.remaining_purse || 0))}</p>
          </div>
          <div className="text-right bg-surface-elevated border border-border-default px-4 py-2 rounded-xl">
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-0.5">Squad</p>
            <p className="text-xl font-display font-bold text-text-primary">{team?.players_count || 0}/{team?.max_players || 12}</p>
          </div>
        </div>
      </div>

      {currentPlayer && currentAuction ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Bidding Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card glass glow={isLeading ? 'emerald' : 'gold'} className="relative overflow-hidden">
              {isLeading && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inpl-emerald via-inpl-emerald-light to-inpl-emerald" />
              )}

              <div className="flex items-center justify-between mb-4">
                {currentAuction.status === 'PAUSED' ? (
                  <Badge variant="warning" size="lg">PAUSED</Badge>
                ) : (
                  <Badge variant="live" pulse size="lg">LIVE</Badge>
                )}
                {isLeading && <Badge variant="emerald" size="lg">🏆 YOU ARE LEADING</Badge>}
              </div>

              {/* Player Info with Photo & Stats */}
              <div className="mb-6">
                <PlayerAuctionCard player={currentPlayer} size="md" />
              </div>

              {/* Current Bid */}
              <div className="bg-surface-elevated/50 rounded-2xl p-6 text-center mb-6">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Current Bid</p>
                <p className="text-5xl font-extrabold font-display gradient-text">
                  {formatCurrency(Number(currentAuction.current_bid))}
                </p>
                {highestBidder && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: highestBidder.color }}>
                      {highestBidder.name[0]}
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {isLeading ? 'You' : highestBidder.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Bid Button */}
              <div className="space-y-3">
                <Button
                  variant="gold"
                  size="xl"
                  className="w-full text-lg"
                  onClick={placeBid}
                  disabled={!canBid || bidding}
                  loading={bidding}
                  icon={<Zap size={22} />}
                >
                  {isLeading ? 'You are the highest bidder' : `BID ${formatCurrency(nextBid)}`}
                </Button>
                {!canBid && !isLeading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-inpl-red-light">
                    <AlertCircle size={14} />
                    {Number(team?.remaining_purse || 0) < nextBid
                      ? 'Insufficient purse'
                      : (team?.players_count || 0) >= (team?.max_players || 12)
                        ? 'Squad is full'
                        : 'Cannot bid'}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Bid History */}
          <Card glass>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
              <Badge variant="default">{bids.length}</Badge>
            </CardHeader>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {bids.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No bids yet. Be the first!</p>
              ) : (
                [...bids].sort((a, b) => Number(b.amount) - Number(a.amount)).map((bid, i) => {
                  const isMyBid = bid.team_id === teamId
                  return (
                    <div key={bid.id} className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
                      i === 0 ? 'bg-inpl-neon/10 border border-inpl-neon/30 shadow-[0_0_10px_rgba(204,255,0,0.1)]' :
                      isMyBid ? 'bg-inpl-electric/5 border border-inpl-electric/10' : 'bg-surface-elevated/50 border border-border-default'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted font-mono">{formatTime(bid.created_at)}</span>
                        <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold" style={{ background: getTeamColor(bid.team_id) }}>
                          {getTeamName(bid.team_id)[0]}
                        </div>
                        <span className="text-xs font-medium text-text-primary">
                          {isMyBid ? 'You' : getTeamName(bid.team_id)}
                        </span>
                      </div>
                      <span className={`text-sm font-display font-semibold ${i === 0 ? 'text-inpl-neon' : 'text-text-secondary'}`}>
                        {formatCurrency(Number(bid.amount))}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card glass className="text-center !p-16">
          <Gavel className="w-16 h-16 text-text-muted/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold font-display text-text-primary mb-2">Waiting for Auction</h3>
          <p className="text-sm text-text-secondary">The auctioneer will select a player to begin bidding.</p>
          <p className="text-xs text-text-muted mt-2">This page updates in real-time.</p>
        </Card>
      )}
    </div>
  )
}
