'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { getRoleEmoji } from '@/lib/utils'
import type { Player } from '@/lib/types/database'

interface PlayerAuctionCardProps {
  player: Player
  size?: 'sm' | 'md' | 'lg'
  showStats?: boolean
  className?: string
}

export function PlayerAuctionCard({ player, size = 'md', showStats = true, className = '' }: PlayerAuctionCardProps) {
  const photoSize = size === 'lg' ? 'w-32 h-32' : size === 'md' ? 'w-20 h-20' : 'w-14 h-14'
  const nameSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg'
  const statIconSize = size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {/* Player Photo */}
      {player.photo_url ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className={`${photoSize} rounded-2xl overflow-hidden border-2 border-inpl-neon/30 shadow-lg shadow-inpl-neon/10 flex-shrink-0`}
        >
          <img
            src={player.photo_url}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ) : (
        <div className={`${photoSize} rounded-2xl bg-surface-elevated flex items-center justify-center flex-shrink-0 border border-border-default`}>
          <span className={size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-4xl' : 'text-2xl'}>
            {getRoleEmoji(player.role)}
          </span>
        </div>
      )}

      {/* Player Details */}
      <div className="flex-1 min-w-0">
        <h2 className={`${nameSize} font-bold font-display text-text-primary truncate`}>
          {player.name}
        </h2>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <Badge variant={
            player.role === 'Batter' ? 'blue' :
            player.role === 'Bowler' ? 'red' :
            player.role === 'All-Rounder' ? 'gold' : 'purple'
          }>{player.role}</Badge>
          {player.department && (
            <span className="text-sm text-text-secondary">{player.department}</span>
          )}
          {player.year && (
            <span className="text-sm text-text-muted">• {player.year}</span>
          )}
        </div>

        {/* Stats Bar */}
        {showStats && (player.matches > 0 || player.runs > 0 || player.wickets > 0) && (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-default">
              <span className={statIconSize}>🏏</span>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">Matches</p>
                <p className="text-sm font-bold font-display text-text-primary leading-tight">{player.matches}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-default">
              <span className={statIconSize}>🔥</span>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">Runs</p>
                <p className="text-sm font-bold font-display text-text-primary leading-tight">{player.runs}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-default">
              <span className={statIconSize}>🎯</span>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">Wickets</p>
                <p className="text-sm font-bold font-display text-text-primary leading-tight">{player.wickets}</p>
              </div>
            </div>
            {player.batting_style && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-default">
                <span className={statIconSize}>🏑</span>
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">Bat Style</p>
                  <p className="text-xs font-medium text-text-primary leading-tight truncate max-w-[80px]">{player.batting_style}</p>
                </div>
              </div>
            )}
            {player.bowling_style && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-elevated/80 border border-border-default">
                <span className={statIconSize}>🎳</span>
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider leading-tight">Bowl Style</p>
                  <p className="text-xs font-medium text-text-primary leading-tight truncate max-w-[80px]">{player.bowling_style}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
