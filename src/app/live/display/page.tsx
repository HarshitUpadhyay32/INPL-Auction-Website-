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
  const [topBuy, setTopBuy] = useState<Player | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const { data: teamsData } = await supabase.from('teams').select('*').order('name')
    if (teamsData) setTeams(teamsData)

    const { data: latestAuction } = await supabase.from('auctions').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle()
    
    if (latestAuction && ['ACTIVE', 'PAUSED', 'SOLD'].includes(latestAuction.status)) {
      setCurrentAuction(latestAuction)
      const { data: player } = await supabase.from('players').select('*').eq('id', latestAuction.player_id).single()
      if (player) setCurrentPlayer(player)
    } else {
      setCurrentPlayer(null)
      setCurrentAuction(null)
    }

    const { count: sold } = await supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'SOLD')
    setSoldCount(sold || 0)

    const { data: topBuyData, error: topBuyError } = await supabase.from('players').select('*').eq('status', 'SOLD').order('sold_price', { ascending: false, nullsFirst: false }).limit(1)
    if (topBuyError) console.error("Error fetching top buy:", topBuyError)
    if (topBuyData && topBuyData.length > 0) {
      setTopBuy(topBuyData[0])
    } else {
      setTopBuy(null)
    }
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
            PW IOI PREMIER LEAGUE
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
              <div className="flex flex-col items-center gap-4 relative">
                {currentAuction.status === 'SOLD' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 3, rotate: -20, x: "-50%", y: "-50%" }}
                    animate={{ opacity: 1, scale: 1, rotate: -10, x: "-50%", y: "-50%" }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="absolute z-50 pointer-events-none top-1/2 left-1/2"
                  >
                    <div className="border-[8px] border-inpl-red text-inpl-red font-display font-black text-6xl py-2 px-8 uppercase tracking-widest bg-surface-primary/80 backdrop-blur-sm shadow-[0_0_40px_rgba(239,68,68,0.5)] whitespace-nowrap overflow-visible stamp-mask" style={{ textShadow: '0 0 10px rgba(239,68,68,0.8)' }}>
                      SOLD
                    </div>
                  </motion.div>
                )}
                
                <div className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-surface-elevated flex items-center justify-center text-7xl sm:text-8xl transition-all duration-500 ${currentAuction.status === 'SOLD' ? 'opacity-50 grayscale' : 'glow-gold'}`}>
                  {getRoleEmoji(currentPlayer.role)}
                </div>
                <div>
                  <p className="player-name text-text-primary">{currentPlayer.name}</p>
                  <p className="text-2xl sm:text-3xl text-text-secondary font-display">{currentPlayer.role}</p>
                </div>
              </div>

              {/* Highest Sold Player Banner */}
              {topBuy && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-[#0a1128] border border-white/5 rounded-2xl p-4 sm:p-6 mb-8 relative overflow-hidden text-left"
                >
                  <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    {topBuy.photo_url ? (
                      <img src={topBuy.photo_url} alt={topBuy.name} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl object-cover shadow-md" />
                    ) : (
                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                        {getRoleEmoji(topBuy.role)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white/80 tracking-widest uppercase mb-1">Highest Sold Player</p>
                      <div className="flex items-baseline gap-3 sm:gap-5 flex-wrap">
                        <p className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-wide">{topBuy.name}</p>
                        <p className="text-3xl sm:text-5xl font-black font-display text-inpl-neon">{formatCurrency(topBuy.sold_price || 0)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {topBuy.sold_to_team_id && (
                    <div className="flex items-center gap-4 relative z-10">
                      <p className="text-lg sm:text-2xl font-bold text-white font-display uppercase tracking-wider hidden md:block text-right">
                        {teams.find(t => t.id === topBuy.sold_to_team_id)?.name || ''}
                      </p>
                      {teams.find(t => t.id === topBuy.sold_to_team_id)?.logo_url ? (
                        <img 
                          src={teams.find(t => t.id === topBuy.sold_to_team_id)!.logo_url!} 
                          alt="Team Logo" 
                          className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-xl" 
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-white/5 flex items-center justify-center">
                           <span className="text-xs text-white/50">No Logo</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

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
          <span className="text-sm text-text-muted">PW IOI Premier League • Player Auction</span>
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
