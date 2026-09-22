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
    <div className={`relative w-full rounded-sm overflow-hidden bg-white shadow-2xl border border-gray-200 ${className}`}>
      {/* Background Graphic Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] opacity-80" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#cbd5e1" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
        <div className="absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-white/40 to-transparent z-0" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Top Section */}
        <div className="w-full flex p-4 pb-2 gap-4">
          
          {/* Photo Box */}
          <div className="relative w-40 h-48 bg-[#a0aec0] border-[3px] border-[#d4af37] shadow-lg flex-shrink-0 z-20">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0b1b3d] opacity-50">
                <span className="text-6xl">{getRoleEmoji(player.role)}</span>
              </div>
            )}
            
            {/* Golden corner accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#fff]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#fff]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#fff]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#fff]" />
          </div>

          {/* Name & Country */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            {/* Banner */}
            <div className="relative bg-[#0b1b3d] border-y-[3px] border-[#d4af37] py-2 px-8 shadow-md">
              <h1 className="text-4xl font-black text-[#d4af37] uppercase tracking-widest font-display truncate">
                {player.name}
              </h1>
            </div>

            {/* Sub-banner details */}
            <div className="flex items-center gap-3 pl-4">
              <div className="w-12 h-8 border-[2px] border-[#d4af37] bg-white flex items-center justify-center font-bold text-[#0b1b3d] text-xs">
                {player.player_code || 'INPL'}
              </div>
              <h2 className="text-xl font-bold text-[#0b1b3d] uppercase tracking-wider">
                {player.department || 'CRICKET'} {player.year && `• ${player.year}`}
              </h2>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        {showStats && (
          <div className="w-full px-4 pb-4 mt-2">
            <div className="w-full bg-white border-2 border-[#0b1b3d] flex items-stretch shadow-md rounded-[2px] relative z-20">
              
              {/* Stat Block: Runs */}
              <div className="flex-1 flex flex-col items-center p-2 border-r border-[#0b1b3d]/30">
                <span className="text-[10px] font-bold text-[#0b1b3d] uppercase tracking-widest mb-1">Runs</span>
                <Activity size={18} className="text-[#d4af37] mb-1.5" />
                <div className="w-full border border-[#d4af37] rounded-sm py-1 flex justify-center bg-white shadow-inner">
                  <span className="text-sm font-bold text-[#0b1b3d]">{player.runs}</span>
                </div>
              </div>

              {/* Stat Block: Matches */}
              <div className="flex-1 flex flex-col items-center p-2 border-r border-[#0b1b3d]/30">
                <span className="text-[10px] font-bold text-[#0b1b3d] uppercase tracking-widest mb-1">Matches</span>
                <Calendar size={18} className="text-[#d4af37] mb-1.5" />
                <div className="w-full border border-[#d4af37] rounded-sm py-1 flex justify-center bg-white shadow-inner">
                  <span className="text-sm font-bold text-[#0b1b3d]">{player.matches}</span>
                </div>
              </div>

              {/* Stat Block: Wickets */}
              <div className="flex-1 flex flex-col items-center p-2 border-r border-[#0b1b3d]/30">
                <span className="text-[10px] font-bold text-[#0b1b3d] uppercase tracking-widest mb-1">Wickets</span>
                <Target size={18} className="text-[#d4af37] mb-1.5" />
                <div className="w-full border border-[#d4af37] rounded-sm py-1 flex justify-center bg-white shadow-inner">
                  <span className="text-sm font-bold text-[#0b1b3d]">{player.wickets}</span>
                </div>
              </div>

              {/* Stat Block: Type */}
              <div className="flex-1 flex flex-col items-center p-2 border-r border-[#0b1b3d]/30">
                <span className="text-[10px] font-bold text-[#0b1b3d] uppercase tracking-widest mb-1">Type</span>
                <User size={18} className="text-[#d4af37] mb-1.5" />
                <div className="w-full border border-[#d4af37] rounded-sm py-1 flex justify-center bg-white shadow-inner px-1 truncate">
                  <span className="text-xs font-bold text-[#0b1b3d] uppercase truncate">{player.role}</span>
                </div>
              </div>



              {/* Base Price Block */}
              <div className="flex-[1.2] sm:flex-[1.5] bg-gradient-to-b from-[#f5df80] via-[#e2c140] to-[#c79a22] p-2 flex flex-col items-center shadow-[inset_0_0_10px_rgba(255,255,255,0.4)] relative">
                <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-[#0b1b3d]" />
                <div className="absolute -top-[1px] -right-[1px] w-2 h-2 border-t-2 border-r-2 border-[#0b1b3d]" />
                <div className="absolute -bottom-[1px] -left-[1px] w-2 h-2 border-b-2 border-l-2 border-[#0b1b3d]" />
                <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-[#0b1b3d]" />
                
                <span className="text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-1">Base Price</span>
                <div className="flex flex-col items-center justify-center flex-1 w-full">
                  <IndianRupee size={20} className="text-[#0b1b3d] mb-1" />
                  <div className="w-full border border-white rounded-sm py-1.5 flex justify-center bg-white shadow-md">
                    <span className="text-sm font-black text-[#0b1b3d]">{formatCurrency(player.base_price)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
