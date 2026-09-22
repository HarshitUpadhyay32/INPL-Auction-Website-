'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { getRoleEmoji, formatCurrency } from '@/lib/utils'
import type { Player } from '@/lib/types/database'
import { Activity, Target, User, Calendar, IndianRupee } from 'lucide-react'

interface PlayerAuctionCardProps {
  player: Player
  size?: 'sm' | 'md' | 'lg'
  showStats?: boolean
  className?: string
}

export function PlayerAuctionCard({ player, size = 'md', showStats = true, className = '' }: PlayerAuctionCardProps) {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 ${className}`}>
      {/* Background Graphic Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#f8fafc] opacity-90" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>

      {/* Left: Photo Box */}
      <div className="relative w-full sm:w-72 h-80 sm:h-[28rem] rounded-xl border-[3px] border-[#d4af37] overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0b1b3d] to-[#1a2f5c] shadow-xl z-10">
        {/* Golden stripes top-left */}
        <div className="absolute top-0 left-0 w-32 h-32 overflow-hidden pointer-events-none z-20">
          <div className="absolute top-[-10px] left-[-40px] w-48 h-10 bg-gradient-to-r from-[#d4af37] via-[#f5df80] to-[#d4af37] transform -rotate-45 shadow-md" />
          <div className="absolute top-[35px] left-[-40px] w-48 h-4 bg-gradient-to-r from-[#d4af37] via-[#f5df80] to-[#d4af37] transform -rotate-45 shadow-md" />
        </div>
        
        {/* Golden stripes bottom-right */}
        <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-20">
          <div className="absolute bottom-[-10px] right-[-40px] w-48 h-10 bg-gradient-to-r from-[#f5df80] via-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-md" />
          <div className="absolute bottom-[35px] right-[-40px] w-48 h-4 bg-gradient-to-r from-[#f5df80] via-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-md" />
        </div>

        {/* Image */}
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover relative z-10" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative z-10 opacity-60">
            <User size={140} className="text-[#d4af37]" />
          </div>
        )}
      </div>

      {/* Right: Info & Stats */}
      <div className="flex-1 flex flex-col justify-center gap-8 relative z-10 min-w-0 pr-0 sm:pr-4">
        
        {/* Name Banner & Base Price */}
        <div className="relative w-full">
          {/* Banner */}
          <div className="bg-[#0b1b3d] border-2 border-[#d4af37] rounded-xl p-5 sm:p-8 pr-32 sm:pr-48 w-full shadow-2xl relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black text-[#d4af37] uppercase tracking-wider truncate mb-3 drop-shadow-md">
              {player.name}
            </h1>
            <div className="w-full h-[3px] bg-gradient-to-r from-[#d4af37] to-transparent mb-4" />
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-white rounded border border-[#d4af37] text-[#0b1b3d] font-bold text-xs sm:text-sm shadow-sm">
                {player.player_code || 'INPL'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
                {player.department || 'CRICKET'} {player.year && `• ${player.year}`}
              </h2>
            </div>
          </div>

          {/* Base Price Overlap */}
          <div className="absolute right-0 sm:-right-4 -top-6 -bottom-6 w-32 sm:w-56 bg-gradient-to-b from-[#f5df80] via-[#e2c140] to-[#c79a22] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-2 border-white/40 z-20 flex flex-col items-center justify-center p-3 sm:p-6 transform hover:scale-[1.02] transition-transform duration-300">
            <span className="text-sm sm:text-base font-black text-[#0b1b3d] uppercase tracking-widest mb-1 sm:mb-2 text-center">Base Price</span>
            <IndianRupee size={36} className="text-[#0b1b3d] mb-2 sm:mb-4 drop-shadow-sm" />
            <div className="w-full bg-white rounded-xl py-2 sm:py-3 flex justify-center shadow-inner border border-gray-200">
              <span className="text-2xl sm:text-3xl font-black text-[#0b1b3d]">{formatCurrency(player.base_price)}</span>
            </div>
          </div>
        </div>

        {/* Stats Box */}
        {showStats && (
          <div className="w-full bg-white border-[3px] border-[#d4af37] rounded-xl p-3 sm:p-6 flex justify-between shadow-xl relative z-10 gap-2 sm:gap-4">
            {[
              { label: 'MATCHES', icon: <Calendar size={32} className="text-[#d4af37] mb-2 sm:mb-4" />, value: player.matches },
              { label: 'RUNS', icon: <Activity size={32} className="text-[#d4af37] mb-2 sm:mb-4" />, value: player.runs },
              { label: 'WICKETS', icon: <Target size={32} className="text-[#d4af37] mb-2 sm:mb-4" />, value: player.wickets },
              { label: 'TYPE', icon: <User size={32} className="text-[#d4af37] mb-2 sm:mb-4" />, value: player.role }
            ].map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-between">
                <span className="text-[10px] sm:text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-2 sm:mb-3 text-center h-8 sm:h-auto flex items-center">{stat.label}</span>
                {stat.icon}
                <div className="w-full border-[3px] border-[#d4af37] rounded-lg py-1.5 sm:py-2.5 flex justify-center bg-white shadow-sm mt-2">
                  <span className="text-xs sm:text-base font-black text-[#0b1b3d] uppercase truncate px-1">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
