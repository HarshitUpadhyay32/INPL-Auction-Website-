'use client'

import React from 'react'
import { getRoleEmoji, formatCurrency } from '@/lib/utils'
import type { Player } from '@/lib/types/database'
import { Activity, Target, User, Calendar, IndianRupee } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlayerAuctionCardProps {
  player: Player
  size?: 'sm' | 'md' | 'lg'
  showStats?: boolean
  className?: string
}

export function PlayerAuctionCard({ player, size = 'md', showStats = true, className = '' }: PlayerAuctionCardProps) {
  return (
    <div className={`relative w-full bg-white shadow-2xl rounded-2xl border-2 border-gray-200 p-4 flex flex-col sm:flex-row gap-6 ${className}`}>
      
      {/* Background Graphic Pattern */}
      <div className="absolute inset-0 z-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] opacity-80" />
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diagonal-lines" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#cbd5e1" strokeWidth="1" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>
      
      {/* SOLD Stamp Overlay */}
      {player.status === 'SOLD' && (
        <motion.div
          initial={{ opacity: 0, scale: 3, rotate: -20, x: "-50%", y: "-50%" }}
          animate={{ opacity: 1, scale: 1, rotate: -10, x: "-50%", y: "-50%" }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="absolute z-50 pointer-events-none top-[35%] left-[45%]"
        >
          <div className="border-[6px] sm:border-[8px] border-inpl-red text-inpl-red font-display font-black text-4xl sm:text-6xl py-2 px-6 sm:px-8 uppercase tracking-widest bg-white/80 backdrop-blur-sm shadow-[0_0_30px_rgba(239,68,68,0.4)] whitespace-nowrap stamp-mask" style={{ textShadow: '0 0 10px rgba(239,68,68,0.6)' }}>
            SOLD
          </div>
        </motion.div>
      )}

      {/* Left: Player Photo Section */}
      <div className="relative w-full sm:w-[240px] h-[320px] rounded-xl bg-gradient-to-br from-[#0b1b3d] to-[#1e293b] shadow-lg flex-shrink-0 z-20 overflow-hidden flex flex-col justify-end mx-auto sm:mx-0">
        
        {/* Abstract Gold Slashes (Top Left) */}
        <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-32 h-6 bg-gradient-to-r from-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-sm" />
          <div className="absolute top-3 -left-4 w-32 h-2 bg-gradient-to-r from-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-sm" />
        </div>

        {/* Abstract Gold Slashes (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-4 -right-4 w-32 h-6 bg-gradient-to-r from-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-sm" />
          <div className="absolute bottom-3 -right-4 w-32 h-2 bg-gradient-to-r from-[#d4af37] to-[#f5df80] transform -rotate-45 shadow-sm" />
        </div>

        {/* Player Image */}
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.name} className={`relative z-10 w-full h-full object-cover object-center drop-shadow-2xl transition-all duration-500 ${player.status === 'SOLD' ? 'grayscale opacity-70' : ''}`} />
        ) : (
          <div className={`relative z-10 w-full h-full flex items-center justify-center opacity-50 transition-all duration-500 ${player.status === 'SOLD' ? 'grayscale opacity-30' : ''}`}>
            <span className="text-8xl">{getRoleEmoji(player.role)}</span>
          </div>
        )}
      </div>

      {/* Right: Info & Stats */}
      <div className="flex-1 min-w-0 flex flex-col justify-center z-20 gap-6 sm:gap-8 relative">
        
        {/* Top Banner Row */}
        <div className="relative flex items-center justify-between w-full">
          
          {/* Main Blue Banner */}
          <div className="relative flex-1 bg-[#0b1b3d] border-[3px] border-[#d4af37] rounded-xl pt-4 pb-4 px-4 sm:px-6 shadow-md mr-14 sm:mr-24 flex flex-col justify-center">
            <h1 className="text-2xl sm:text-4xl font-black text-[#d4af37] uppercase tracking-widest font-display leading-tight line-clamp-2">
              {player.name}
            </h1>
            <div className="w-[85%] h-1 bg-[#d4af37] my-3 rounded-full" />
            <div className="flex items-center gap-3">
              <span className="text-[#0b1b3d] bg-[#d4af37] px-2 py-0.5 text-xs sm:text-sm font-bold uppercase rounded">
                {player.player_code}
              </span>
              <span className="text-gray-300 text-xs sm:text-sm font-bold tracking-wider uppercase">
                {player.department} • {player.year}
              </span>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 to-transparent pointer-events-none rounded-xl" />
          </div>

          {/* Overlapping Base Price Box */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-28 sm:w-40 bg-gradient-to-b from-[#f5df80] via-[#e2c140] to-[#c79a22] p-2.5 sm:p-4 rounded-xl shadow-xl flex flex-col items-center border-[3px] border-[#0b1b3d] z-30">
            <span className="text-[10px] sm:text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-1">Base Price</span>
            <IndianRupee size={20} className="text-[#0b1b3d] mb-1.5 sm:mb-2" />
            <div className="w-full bg-white rounded-lg py-1.5 flex justify-center shadow-inner border border-[#d4af37]/30">
              <span className="text-sm sm:text-lg font-black text-[#0b1b3d]">{formatCurrency(player.base_price)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Stats Row */}
        {showStats && (
          <div className="w-full bg-white border-[3px] border-[#d4af37] rounded-xl flex items-stretch p-3 shadow-md relative z-10">
            
            {/* Stat: Matches */}
            <div className="flex-1 flex flex-col items-center border-r border-gray-300 px-1 sm:px-3">
              <span className="text-[10px] sm:text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-2">Matches</span>
              <Calendar size={28} className="text-[#d4af37] mb-3 stroke-[1.5]" />
              <div className="w-full border-2 border-[#d4af37] rounded-lg py-1.5 flex justify-center bg-white shadow-sm">
                <span className="text-sm sm:text-lg font-bold text-[#0b1b3d]">{player.matches}</span>
              </div>
            </div>

            {/* Stat: Runs */}
            <div className="flex-1 flex flex-col items-center border-r border-gray-300 px-1 sm:px-3">
              <span className="text-[10px] sm:text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-2">Runs</span>
              <Activity size={28} className="text-[#d4af37] mb-3 stroke-[1.5]" />
              <div className="w-full border-2 border-[#d4af37] rounded-lg py-1.5 flex justify-center bg-white shadow-sm">
                <span className="text-sm sm:text-lg font-bold text-[#0b1b3d]">{player.runs}</span>
              </div>
            </div>

            {/* Stat: Wickets */}
            <div className="flex-1 flex flex-col items-center border-r border-gray-300 px-1 sm:px-3">
              <span className="text-[10px] sm:text-xs font-black text-[#0b1b3d] uppercase tracking-widest mb-2">Wickets</span>
              <Target size={28} className="text-[#d4af37] mb-3 stroke-[1.5]" />
              <div className="w-full border-2 border-[#d4af37] rounded-lg py-1.5 flex justify-center bg-white shadow-sm">
                <span className="text-sm sm:text-lg font-bold text-[#0b1b3d]">{player.wickets}</span>
              </div>
            </div>

            {/* Stat: Type */}
            <div className="flex-1 flex flex-col items-center px-1 sm:px-2 min-w-0">
              <span className="text-[10px] sm:text-[11px] font-black text-[#0b1b3d] uppercase tracking-widest mb-2 truncate max-w-full">Type</span>
              <User size={24} className="text-[#d4af37] mb-3 stroke-[1.5]" />
              <div className="w-full border-2 border-[#d4af37] rounded-lg py-1.5 px-1 flex justify-center items-center bg-white shadow-sm overflow-hidden">
                <span className="text-[10px] sm:text-xs font-bold text-[#0b1b3d] uppercase truncate">{player.role}</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
