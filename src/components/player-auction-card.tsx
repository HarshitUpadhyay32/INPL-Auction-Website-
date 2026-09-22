'use client'

import React from 'react'
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
    <div className={`@container relative w-full rounded-2xl overflow-hidden bg-white shadow-2xl border border-gray-200 p-[3cqi] flex flex-row gap-[3cqi] ${className}`} style={{ containerType: 'inline-size' }}>
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
      <div className="relative w-full w-[35cqi] h-[60cqi] h-[45cqi] rounded-xl border-[3px] border-[#d4af37] overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0b1b3d] to-[#1a2f5c] shadow-xl z-10 mx-auto">
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
      <div className="flex-1 flex flex-col justify-center gap-[4cqi] relative z-10 min-w-0 pr-0 pr-[3cqi]">
        
        {/* Name Banner & Base Price */}
        <div className="relative w-full">
          {/* Banner */}
          <div className="bg-[#0b1b3d] border-[3px] border-[#d4af37] rounded-xl p-[4cqi] pr-[15cqi] pr-[25cqi] w-full shadow-2xl relative z-10">
            <h1 className="text-[clamp(1.5rem,6cqi,3.5rem)] font-black text-[#d4af37] uppercase tracking-wider truncate mb-[1cqi] drop-shadow-md leading-tight">
              {player.name}
            </h1>
            <div className="w-full h-[3px] bg-gradient-to-r from-[#d4af37] to-transparent mb-[2cqi]" />
            <div className="flex flex-wrap items-center gap-[1.5cqi]">
              <span className="px-[2cqi] py-[0.5cqi] bg-white rounded border border-[#d4af37] text-[#0b1b3d] font-bold text-[clamp(0.6rem,2cqi,1rem)] shadow-sm">
                {player.player_code || 'INPL'}
              </span>
              <h2 className="text-[clamp(0.8rem,2.5cqi,1.5rem)] font-bold text-white uppercase tracking-wider truncate">
                {player.department || 'CRICKET'} {player.year && `• ${player.year}`}
              </h2>
            </div>
          </div>

          {/* Base Price Overlap */}
          <div className="absolute right-0 -right-[3cqi] -top-[3cqi] -bottom-[3cqi] w-[25cqi] w-[28cqi] bg-gradient-to-b from-[#f5df80] via-[#e2c140] to-[#c79a22] rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] border-[2px] border-white/40 z-20 flex flex-col items-center justify-center p-[2cqi] p-[3cqi] transform hover:scale-[1.02] transition-transform duration-300">
            <span className="text-[clamp(0.6rem,1.8cqi,1.2rem)] font-black text-[#0b1b3d] uppercase tracking-widest mb-[1cqi] text-center">Base Price</span>
            <IndianRupee size={36} className="text-[#0b1b3d] mb-[1.5cqi] drop-shadow-sm w-[clamp(1rem,4cqi,2.5rem)] h-[clamp(1rem,4cqi,2.5rem)]" />
            <div className="w-full bg-white rounded-xl py-[1.5cqi] flex justify-center shadow-inner border border-gray-200">
              <span className="text-[clamp(1rem,3.5cqi,2rem)] font-black text-[#0b1b3d] leading-none">{formatCurrency(player.base_price)}</span>
            </div>
          </div>
        </div>

        {/* Stats Box */}
        {showStats && (
          <div className="w-full bg-white border-[3px] border-[#d4af37] rounded-xl p-[2cqi] p-[3cqi] flex justify-between shadow-xl relative z-10 gap-[1.5cqi]">
            {[
              { label: 'MATCHES', icon: <Calendar size={32} className="text-[#d4af37] mb-[1.5cqi] w-[clamp(1rem,4cqi,2rem)] h-[clamp(1rem,4cqi,2rem)]" />, value: player.matches },
              { label: 'RUNS', icon: <Activity size={32} className="text-[#d4af37] mb-[1.5cqi] w-[clamp(1rem,4cqi,2rem)] h-[clamp(1rem,4cqi,2rem)]" />, value: player.runs },
              { label: 'WICKETS', icon: <Target size={32} className="text-[#d4af37] mb-[1.5cqi] w-[clamp(1rem,4cqi,2rem)] h-[clamp(1rem,4cqi,2rem)]" />, value: player.wickets },
              { label: 'TYPE', icon: <User size={32} className="text-[#d4af37] mb-[1.5cqi] w-[clamp(1rem,4cqi,2rem)] h-[clamp(1rem,4cqi,2rem)]" />, value: player.role }
            ].map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-between">
                <span className="text-[clamp(0.5rem,1.5cqi,0.85rem)] font-black text-[#0b1b3d] uppercase tracking-widest mb-[1.5cqi] text-center h-[3cqi] h-auto flex items-center">{stat.label}</span>
                {stat.icon}
                <div className="w-full border-[2px] border-[3px] border-[#d4af37] rounded-lg py-[1cqi] flex justify-center bg-white shadow-sm mt-[1cqi]">
                  <span className="text-[clamp(0.7rem,2cqi,1.2rem)] font-black text-[#0b1b3d] uppercase truncate px-1 leading-none">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
      {/* Resizer Handle (if they literally meant draggable) */}
      <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 opacity-0" style={{ resize: 'both', overflow: 'hidden' }} />
    </div>
  )
}
