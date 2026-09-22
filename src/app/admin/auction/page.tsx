'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Gavel, Play, Pause, SkipForward, Check, X, RotateCcw, Users, IndianRupee, Timer, AlertTriangle, ChevronDown, ChevronRight, Ban } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, PlayerStatusBadge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { StatCard } from '@/components/ui/stat-card'
import { PlayerAuctionCard } from '@/components/player-auction-card'
import { formatCurrency, formatTime, getRoleEmoji } from '@/lib/utils'
import { toast } from 'sonner'
import type { Player, Team, Auction, Bid, AuctionConfig, AuctionSet } from '@/lib/types/database'

export default function AuctionControlPage() {
  const [config, setConfig] = useState<AuctionConfig | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [sets, setSets] = useState<AuctionSet[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [currentBids, setCurrentBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [soldDialog, setSoldDialog] = useState(false)
  const [unsoldDialog, setUnsoldDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [undoDialog, setUndoDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedSetId, setSelectedSetId] = useState<string>('all')
  const [playerStats, setPlayerStats] = useState({ total: 0, sold: 0, unsold: 0, available: 0 })

  const loadData = useCallback(async () => {
    const supabase = createClient()
    
    const { data: configData } = await supabase.from('auction_config').select('*').limit(1).single()
    if (configData) setConfig(configData)

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData)

    const { data: setsData } = await supabase.from('auction_sets').select('*').order('sort_order')
    if (setsData) setSets(setsData)

    // Load available players
    const { data: playersData } = await supabase.from('players').select('*').order('sort_order').order('player_code')
    if (playersData) setPlayers(playersData)

    // Check for active auction
    const { data: activeAuction } = await supabase.from('auctions').select('*').in('status', ['ACTIVE', 'PAUSED']).limit(1).single()
    if (activeAuction) {
      setCurrentAuction(activeAuction)
      const { data: player } = await supabase.from('players').select('*').eq('id', activeAuction.player_id).single()
      if (player) setCurrentPlayer(player)
      const { data: bids } = await supabase.from('bids').select('*').eq('auction_id', activeAuction.id).order('created_at', { ascending: false })
      if (bids) setCurrentBids(bids)
    }

    // Stats
    const { count: total } = await supabase.from('players').select('*', { count: 'exact', head: true })
    const { count: sold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'SOLD')
    const { count: unsold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'UNSOLD')
    setPlayerStats({
      total: total || 0, sold: sold || 0, unsold: unsold || 0,
      available: (total || 0) - (sold || 0) - (unsold || 0),
    })

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  // Real-time subscriptions
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('auction-control')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newBid = payload.new as Bid
          if (currentAuction && newBid.auction_id === currentAuction.id) {
            setCurrentBids(prev => [newBid, ...prev])
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        loadData()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentAuction, loadData])

  // Start auction for a player
  async function startAuction(player: Player) {
    setActionLoading(true)
    const supabase = createClient()

    // Set player to LIVE
    await supabase.from('players').update({ status: 'LIVE' }).eq('id', player.id)

    // Create auction record
    const { data: auction, error } = await supabase.from('auctions').insert({
      player_id: player.id,
      current_bid: Number(player.base_price),
      status: 'ACTIVE',
    }).select().single()

    if (error) { toast.error(error.message); setActionLoading(false); return }

    // Update global status to LIVE
    await supabase.from('auction_config').update({ auction_status: 'LIVE' }).eq('id', config?.id)

    setCurrentPlayer(player)
    setCurrentAuction(auction)
    setCurrentBids([])
    toast.success(`Auction started for ${player.name}`)
    setActionLoading(false)
    loadData()
  }

  // Start auction for a random player
  async function startRandomAuction() {
    if (availablePlayers.length === 0) {
      toast.error('No available players to auction')
      return
    }
    const randomIndex = Math.floor(Math.random() * availablePlayers.length)
    const randomPlayer = availablePlayers[randomIndex]
    await startAuction(randomPlayer)
  }

  // Mark SOLD
  async function handleSold() {
    if (!currentAuction) return
    setActionLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.rpc('mark_player_sold', { p_auction_id: currentAuction.id })

    if (error || !data?.success) {
      toast.error(error?.message || data?.error || 'Failed to mark sold')
      setActionLoading(false)
      return
    }

    toast.success(`${currentPlayer?.name} SOLD to ${getTeamName(data.team_id)} for ${formatCurrency(data.amount)}`)
    setCurrentPlayer(null)
    setCurrentAuction(null)
    setCurrentBids([])
    setSoldDialog(false)
    setActionLoading(false)
    loadData()
  }

  // Mark UNSOLD
  async function handleUnsold() {
    if (!currentAuction) return
    setActionLoading(true)
    const supabase = createClient()

    await supabase.from('auctions').update({ status: 'UNSOLD', ended_at: new Date().toISOString() }).eq('id', currentAuction.id)
    await supabase.from('players').update({ status: 'UNSOLD' }).eq('id', currentAuction.player_id)

    toast.success(`${currentPlayer?.name} marked UNSOLD`)
    setCurrentPlayer(null)
    setCurrentAuction(null)
    setCurrentBids([])
    setUnsoldDialog(false)
    setActionLoading(false)
    loadData()
  }

  // Pause/Resume Auction
  async function handleTogglePause() {
    if (!currentAuction) return
    setActionLoading(true)
    const supabase = createClient()
    const newStatus = currentAuction.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED'

    await supabase.from('auctions').update({ status: newStatus }).eq('id', currentAuction.id)

    toast.success(`${currentPlayer?.name} auction ${newStatus === 'PAUSED' ? 'PAUSED' : 'RESUMED'}`)
    setCancelDialog(false)
    setActionLoading(false)
    loadData()
  }

  // Undo SOLD
  async function handleUndo() {
    if (!currentAuction) return
    setActionLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase.rpc('undo_player_sold', { p_auction_id: currentAuction.id })
    if (error || !data?.success) {
      toast.error(error?.message || data?.error || 'Failed to undo')
      setActionLoading(false)
      return
    }

    toast.success('Transaction reversed')
    setCurrentPlayer(null)
    setCurrentAuction(null)
    setUndoDialog(false)
    setActionLoading(false)
    loadData()
  }

  function getTeamName(teamId: string | null | undefined): string {
    if (!teamId) return 'Unknown'
    return teams.find(t => t.id === teamId)?.name || 'Unknown'
  }

  function getTeamColor(teamId: string | null | undefined): string {
    if (!teamId) return '#64748b'
    return teams.find(t => t.id === teamId)?.color || '#64748b'
  }

  const availablePlayers = players.filter(p => 
    p.status === 'AVAILABLE' && 
    (selectedSetId === 'all' || p.auction_set_id === selectedSetId)
  )

  const highestBidder = currentAuction?.highest_bid_team_id ? teams.find(t => t.id === currentAuction.highest_bid_team_id) : null

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 shimmer rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 shimmer rounded-2xl" />
          <div className="h-96 shimmer rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
            <Gavel className="text-inpl-neon" size={24} />
            Auction Control Room
          </h1>
          <p className="text-sm text-text-secondary mt-1">Manage the live auction</p>
        </div>
        <Badge variant={config?.auction_status === 'LIVE' ? 'live' : 'available'} size="lg" pulse={config?.auction_status === 'LIVE'}>
          {config?.auction_status || 'DRAFT'}
        </Badge>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Players" value={playerStats.total} icon={<Users size={18} />} color="blue" />
        <StatCard label="Sold" value={playerStats.sold} icon={<Check size={18} />} color="emerald" />
        <StatCard label="Unsold" value={playerStats.unsold} icon={<X size={18} />} color="red" />
        <StatCard label="Available" value={playerStats.available} icon={<Timer size={18} />} color="gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Auction Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Player Card */}
          {currentPlayer && currentAuction ? (
            <Card glass glow="gold" className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inpl-neon via-inpl-neon-light to-inpl-neon" />
              
              <div className="flex items-center justify-between mb-4">
                <Badge variant="live" pulse size="lg">BIDDING ACTIVE</Badge>
                <span className="text-xs text-text-muted font-mono">{currentPlayer.player_code}</span>
              </div>

              {/* Player Info with Photo & Stats */}
              <div className="mb-6">
                <PlayerAuctionCard player={currentPlayer} size="md" />
                <div className="text-right mt-3">
                  <p className="text-xs text-text-muted mb-1">BASE PRICE</p>
                  <p className="text-lg font-semibold font-display text-text-secondary">{formatCurrency(Number(currentPlayer.base_price))}</p>
                </div>
              </div>

              {/* Current Bid Display */}
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
                    <span className="text-sm font-medium text-text-primary">{highestBidder.name}</span>
                  </div>
                )}
                <p className="text-xs text-text-muted mt-2">{currentAuction.bid_count} bid{currentAuction.bid_count !== 1 ? 's' : ''} placed</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full"
                    onClick={() => setSoldDialog(true)}
                    disabled={!currentAuction.highest_bid_team_id}
                    icon={<Check size={20} />}
                  >
                    SOLD
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    className="w-full"
                    onClick={() => setUnsoldDialog(true)}
                    icon={<X size={20} />}
                  >
                    UNSOLD
                  </Button>
                </div>
                <Button
                  variant={currentAuction.status === 'PAUSED' ? 'success' : 'secondary'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleTogglePause()}
                  loading={actionLoading}
                  icon={currentAuction.status === 'PAUSED' ? <Play size={20} /> : <Pause size={20} />}
                >
                  {currentAuction.status === 'PAUSED' ? 'RESUME AUCTION' : 'PAUSE AUCTION'}
                </Button>
              </div>
            </Card>
          ) : (
            <Card glass className="text-center !p-12">
              <Gavel className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-display text-text-primary mb-2">No Active Auction</h3>
              <p className="text-sm text-text-secondary mb-1">Select a player from the queue to start bidding</p>
            </Card>
          )}

          {/* Bid History */}
          {currentBids.length > 0 && (
            <Card glass>
              <CardHeader>
                <CardTitle>Bid History</CardTitle>
                <Badge variant="default">{currentBids.length} bids</Badge>
              </CardHeader>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {[...currentBids].sort((a, b) => Number(b.amount) - Number(a.amount)).map((bid, i) => (
                  <div key={bid.id} className={`flex items-center justify-between p-2.5 rounded-xl ${i === 0 ? 'bg-inpl-neon/5 border border-inpl-neon/20' : 'hover:bg-surface-hover'} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted font-mono w-16">{formatTime(bid.created_at)}</span>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ background: getTeamColor(bid.team_id) }}>
                        {getTeamName(bid.team_id)[0]}
                      </div>
                      <span className="text-sm font-medium text-text-primary">{getTeamName(bid.team_id)}</span>
                    </div>
                    <span className={`font-display font-semibold ${i === 0 ? 'text-inpl-neon' : 'text-text-secondary'}`}>
                      {formatCurrency(Number(bid.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Player Queue */}
          <Card glass>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CardTitle>Player Queue</CardTitle>
                <Badge variant="default">{availablePlayers.length}</Badge>
              </div>
              <Button 
                variant="gold" 
                size="sm" 
                onClick={startRandomAuction}
                disabled={!!currentAuction || actionLoading || availablePlayers.length === 0}
              >
                Random
              </Button>
            </CardHeader>
            
            {/* Set Filter */}
            <div className="mb-3">
              <select
                value={selectedSetId}
                onChange={e => setSelectedSetId(e.target.value)}
                className="w-full bg-surface-elevated border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary"
              >
                <option value="all">All Sets</option>
                {sets.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {availablePlayers.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4">No available players</p>
              ) : (
                availablePlayers.slice(0, 30).map(player => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-hover transition-colors group"
                  >
                    {player.photo_url ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-border-default">
                        <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="text-lg">{getRoleEmoji(player.role)}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{player.name}</p>
                      <p className="text-[10px] text-text-muted">{player.player_code} • {formatCurrency(Number(player.base_price))}</p>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => startAuction(player)}
                      disabled={!!currentAuction || actionLoading}
                    >
                      <Play size={12} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Team Purses */}
          <Card glass>
            <CardHeader>
              <CardTitle>Team Purses</CardTitle>
            </CardHeader>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-hover transition-colors">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: team.color }}>
                    {team.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{team.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(Number(team.remaining_purse) / Number(team.initial_purse)) * 100}%`,
                            background: team.color,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted">{team.players_count}/{team.max_players}</span>
                    </div>
                  </div>
                  <span className="text-xs font-display font-semibold text-inpl-emerald flex-shrink-0">
                    {formatCurrency(Number(team.remaining_purse))}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={soldDialog}
        onClose={() => setSoldDialog(false)}
        onConfirm={handleSold}
        title="Confirm SOLD"
        description={`Mark ${currentPlayer?.name} as SOLD to ${highestBidder?.name} for ${formatCurrency(Number(currentAuction?.current_bid || 0))}?`}
        confirmText="SOLD"
        variant="primary"
        loading={actionLoading}
      />
      <ConfirmDialog
        open={unsoldDialog}
        onClose={() => setUnsoldDialog(false)}
        onConfirm={handleUnsold}
        title="Mark UNSOLD"
        description={`Mark ${currentPlayer?.name} as UNSOLD? No purchase will be made.`}
        confirmText="UNSOLD"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
