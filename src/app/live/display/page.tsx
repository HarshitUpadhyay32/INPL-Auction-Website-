'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getRoleEmoji } from '@/lib/utils'
import type { Player, Team, Auction, Bid } from '@/lib/types/database'
import { TeamAvatar } from '@/components/team-avatar'

export default function DisplayModePage() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [soldCount, setSoldCount] = useState(0)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData)

    const { data: activeAuction } = await supabase.from('auctions').select('*').in('status', ['ACTIVE', 'PAUSED']).limit(1).single()
    if (activeAuction) {
      setCurrentAuction(activeAuction)
      const { data: player } = await supabase.from('players').select('*').eq('id', activeAuction.player_id).single()
      if (player) setCurrentPlayer(player)
    } else {
      setCurrentPlayer(null)
      setCurrentAuction(null)
    }

    const { count: sold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'SOLD')
    setSoldCount(sold || 0)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('display-mode')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => { loadData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, (payload) => {
        if (payload.eventType === 'INSERT' && currentAuction) {
          const newBid = payload.new as Bid
          if (newBid.auction_id === currentAuction.id) {
            setCurrentAuction(prev => prev ? {
              ...prev,
              current_bid: newBid.amount,
              highest_bid_team_id: newBid.team_id,
              bid_count: prev.bid_count + 1,
            } : null)
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => { loadData() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentAuction, loadData])

  const highestBidder = currentAuction?.highest_bid_team_id
    ? teams.find(t => t.id === currentAuction.highest_bid_team_id)
    : null

  return (
    <div className="display-mode min-h-screen flex flex-col items-center justify-center p-8 bg-surface-primary relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-inpl-neon via-inpl-neon-light to-inpl-neon" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-inpl-neon/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-inpl-electric/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Tournament Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display gradient-text tracking-tight">
            INPL SEASON 3
          </h1>
          <p className="text-xl text-text-secondary font-display mt-1">LIVE AUCTION</p>
        </div>

        {currentPlayer && currentAuction ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-8"
            >
              {/* Player */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-surface-elevated flex items-center justify-center text-7xl sm:text-8xl glow-gold">
                  {getRoleEmoji(currentPlayer.role)}
                </div>
                <div>
                  <p className="player-name text-text-primary">{currentPlayer.name}</p>
                  <p className="text-2xl sm:text-3xl text-text-secondary font-display">{currentPlayer.role}</p>
                </div>
              </div>

              {/* Bid Amount */}
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={String(currentAuction.current_bid)}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    className="bid-amount gradient-text"
                  >
                    {formatCurrency(Number(currentAuction.current_bid))}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Highest Bidder */}
              {highestBidder && (
                <motion.div
                  key={highestBidder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-4"
                >
                  <TeamAvatar team={highestBidder} size="2xl" />
                  <span className="text-3xl font-bold font-display text-text-primary">{highestBidder.name}</span>
                </motion.div>
              )}

              {/* Base Price */}
              <p className="text-lg text-text-muted">
                Base Price: {formatCurrency(Number(currentPlayer.base_price))}
              </p>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="text-8xl mb-8"
            >
              🏏
            </motion.div>
            <p className="text-3xl font-display font-bold text-text-secondary">
              Auction Paused
            </p>
            <p className="text-lg text-text-muted mt-2">
              {soldCount > 0 ? `${soldCount} players sold` : 'Waiting for auction to begin'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 glass p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm text-text-muted">INPL Season 3 • Player Auction</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-inpl-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-inpl-red" />
            </span>
            <span className="text-sm text-text-secondary">LIVE</span>
          </div>
          <span className="text-sm text-text-muted">{soldCount} players sold</span>
        </div>
      </div>
    </div>
  )
}
