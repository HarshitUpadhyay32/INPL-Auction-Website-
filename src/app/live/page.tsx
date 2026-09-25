'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatTime, getRoleEmoji } from '@/lib/utils'
import { PlayerAuctionCard } from '@/components/player-auction-card'
import type { Player, Team, Auction, Bid } from '@/lib/types/database'
import { TeamAvatar } from '@/components/team-avatar'
import { Gavel } from 'lucide-react'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } }
}

export default function LiveAuctionPage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [soldCount, setSoldCount] = useState(0)
  const [unsoldCount, setUnsoldCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [lastSold, setLastSold] = useState<{ player: Player; team: Team; amount: number } | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData)

    const { data: activeAuction } = await supabase.from('auctions').select('*').eq('status', 'ACTIVE').limit(1).single()
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

    const { count: sold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'SOLD')
    const { count: unsold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'UNSOLD')
    setSoldCount(sold || 0)
    setUnsoldCount(unsold || 0)

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('live-auction')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, (payload) => {
        const newBid = payload.new as Bid
        setBids(prev => [newBid, ...prev])
        if (currentAuction && newBid.auction_id === currentAuction.id) {
          setCurrentAuction(prev => prev ? { ...prev, current_bid: newBid.amount, highest_bid_team_id: newBid.team_id, bid_count: prev.bid_count + 1 } : null)
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => { loadData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => { loadData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => { loadData() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentAuction, loadData])

  function getTeamName(tid: string | null): string {
    if (!tid) return ''
    return teams.find(t => t.id === tid)?.name || ''
  }
  function getTeamColor(tid: string | null): string {
    if (!tid) return '#64748b'
    return teams.find(t => t.id === tid)?.color || '#64748b'
  }

  const highestBidder = currentAuction?.highest_bid_team_id ? teams.find(t => t.id === currentAuction.highest_bid_team_id) : null

  return (
    <main className="min-h-screen pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold font-display gradient-text mb-1">INPL SEASON 3</h1>
          <p className="text-text-secondary">LIVE AUCTION</p>
        </motion.div>

        {currentPlayer && currentAuction ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Main Player Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div
                className="glass rounded-3xl p-8 glow-gold relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inpl-neon via-inpl-neon-light to-inpl-neon" />

                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-inpl-red/15 text-inpl-red-light text-sm font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-inpl-red opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-inpl-red" />
                    </span>
                    LIVE
                  </span>
                  <span className="text-sm text-text-muted font-mono">{currentPlayer.player_code}</span>
                </div>

                {/* Player with Photo & Stats */}
                <div className="my-8">
                  <PlayerAuctionCard player={currentPlayer} size="lg" />
                </div>

                {/* Bid Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-elevated/50 rounded-2xl p-5">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Base Price</p>
                    <p className="text-xl font-bold font-display text-text-secondary">{formatCurrency(Number(currentPlayer.base_price))}</p>
                  </div>
                  <div className="bg-surface-elevated/50 rounded-2xl p-5 border border-inpl-neon/20">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Current Bid</p>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={String(currentAuction.current_bid)}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl font-bold font-display gradient-text"
                      >
                        {formatCurrency(Number(currentAuction.current_bid))}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Highest Bidder */}
                {highestBidder && (
                  <motion.div
                    key={highestBidder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 py-4 border-t border-border-default"
                  >
                    <p className="text-sm text-text-muted">Highest Bidder:</p>
                    <div className="flex items-center gap-2">
                      <TeamAvatar team={highestBidder} size="sm" />
                      <span className="font-semibold font-display text-text-primary">{highestBidder.name}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Bid Feed */}
              <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Recent Bids</h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {bids.map((bid, i) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-2 rounded-xl ${i === 0 ? 'bg-inpl-neon/5 border border-inpl-neon/20' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {teams.find(t => t.id === bid.team_id) && (
                          <TeamAvatar team={teams.find(t => t.id === bid.team_id)!} size="sm" className="w-5 h-5 text-[9px]" />
                        )}
                        <span className="text-xs text-text-primary">{getTeamName(bid.team_id)}</span>
                      </div>
                      <span className="text-xs font-display font-semibold text-inpl-neon">{formatCurrency(Number(bid.amount))}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Auction Progress</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display text-inpl-emerald">{soldCount}</p>
                    <p className="text-xs text-text-muted">Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display text-inpl-red">{unsoldCount}</p>
                    <p className="text-xs text-text-muted">Unsold</p>
                  </div>
                </div>
              </motion.div>

              {/* Team Purses */}
              <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Teams</h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {teams.map(t => (
                    <div key={t.id} className="flex items-center gap-2 py-1">
                      <TeamAvatar team={t} size="sm" className="w-5 h-5 text-[9px]" />
                      <span className="text-xs text-text-primary flex-1 truncate">{t.name}</span>
                      <span className="text-[10px] text-text-muted">{t.players_count}/{t.max_players}</span>
                      <span className="text-xs font-display font-semibold text-inpl-emerald">{formatCurrency(Number(t.remaining_purse))}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-32">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Gavel className="w-20 h-20 text-inpl-neon/30 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-bold font-display text-text-primary mb-2">Auction Not Active</h2>
            <p className="text-text-secondary">The auctioneer will start the next player auction shortly.</p>
            <p className="text-xs text-text-muted mt-2">This page updates automatically.</p>
          </div>
        )}
      </div>
    </main>
  )
}
