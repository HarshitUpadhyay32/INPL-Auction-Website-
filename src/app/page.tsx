'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Users, UserCircle, Trophy, ArrowRight, ChevronRight, Timer, IndianRupee, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const stats = [
  { label: 'Teams', value: '15', icon: Users, color: 'text-inpl-electric' },
  { label: 'Players', value: '400', icon: UserCircle, color: 'text-inpl-emerald' },
  { label: 'Purse/Team', value: '₹25 Cr', icon: IndianRupee, color: 'text-inpl-neon' },
  { label: 'Max Squad', value: '12', icon: Shield, color: 'text-inpl-purple' },
]

const teams = [
  { name: 'Team Alpha', color: '#3b82f6' },
  { name: 'Team Bravo', color: '#ef4444' },
  { name: 'Team Charlie', color: '#10b981' },
  { name: 'Team Delta', color: '#f59e0b' },
  { name: 'Team Echo', color: '#8b5cf6' },
  { name: 'Team Foxtrot', color: '#ec4899' },
  { name: 'Team Golf', color: '#06b6d4' },
  { name: 'Team Hotel', color: '#f97316' },
  { name: 'Team India', color: '#14b8a6' },
  { name: 'Team Juliet', color: '#a855f7' },
  { name: 'Team Kilo', color: '#6366f1' },
  { name: 'Team Lima', color: '#84cc16' },
  { name: 'Team Mike', color: '#e11d48' },
  { name: 'Team November', color: '#0ea5e9' },
  { name: 'Team Oscar', color: '#d946ef' },
]

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-inpl-neon/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-inpl-electric/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-inpl-purple/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeIn}>
              <Badge variant="gold" size="lg" className="mb-2">
                🏏 Season 3 • 2024
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.div variants={fadeIn} className="space-y-3">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold font-display tracking-tight">
                <span className="gradient-text">INPL</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-text-primary">
                PLAYER AUCTION
              </h2>
              <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
                India&apos;s premier college cricket tournament.
                Live bidding. 15 teams. 400 players. One stage.
              </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                  <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl sm:text-3xl font-bold font-display text-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/live">
                <Button variant="gold" size="xl" icon={<Zap size={20} />}>
                  View Live Auction
                  <ArrowRight size={18} className="ml-1" />
                </Button>
              </Link>
              <Link href="/teams">
                <Button variant="secondary" size="xl" icon={<Users size={20} />}>
                  Explore Teams
                </Button>
              </Link>
            </motion.div>

            {/* Auction Status Indicator */}
            <motion.div variants={fadeIn} className="flex items-center justify-center gap-2">
              <Timer size={14} className="text-text-muted" />
              <span className="text-sm text-text-muted">Auction status: </span>
              <Badge variant="available">UPCOMING</Badge>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Teams Preview Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-10"
          >
            <motion.div variants={fadeIn} className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">
                15 Teams. One Championship.
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto">
                Each team enters with ₹25 Crore to build a squad of 12 players.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-4"
            >
              {teams.map((team, i) => (
                <Card key={i} hover glass className="text-center !p-4">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl mx-auto mb-2 flex items-center justify-center text-white font-bold font-display text-lg"
                    style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}88)` }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-text-primary truncate">{team.name}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">₹25 Cr</p>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={fadeIn} className="text-center">
              <Link href="/teams">
                <Button variant="ghost" size="lg">
                  View All Teams
                  <ChevronRight size={16} />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-12"
          >
            <motion.div variants={fadeIn} className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">
                How The Auction Works
              </h2>
              <p className="text-text-secondary max-w-lg mx-auto">
                A streamlined digital auction process for fair and transparent player selection.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Player Presented',
                  desc: 'A player is selected and displayed with their profile, role, and base price of ₹50 LPA.',
                  color: 'from-inpl-electric/20',
                },
                {
                  step: '02',
                  title: 'Teams Bid Live',
                  desc: 'All 15 teams can place bids in real-time. Each bid must follow the configured increment.',
                  color: 'from-inpl-neon/20',
                },
                {
                  step: '03',
                  title: 'Highest Bid Wins',
                  desc: 'When bidding ends, the highest bidder wins the player. The price is deducted from their purse.',
                  color: 'from-inpl-emerald/20',
                },
                {
                  step: '04',
                  title: 'Squad Updated',
                  desc: 'The player is automatically added to the winning team\'s squad. Everything is tracked.',
                  color: 'from-inpl-purple/20',
                },
              ].map((item, i) => (
                <Card key={i} glass className="relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b ${item.color} to-transparent opacity-50`} />
                  <div className="relative">
                    <div className="text-4xl font-extrabold font-display text-text-muted/20 mb-3">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-semibold font-display text-text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Card glass glow="gold" className="text-center !p-10 sm:!p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-inpl-neon/5 via-transparent to-inpl-electric/5" />
              <div className="relative space-y-5">
                <Trophy className="w-12 h-12 text-inpl-neon mx-auto" />
                <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">
                  Ready for the Auction?
                </h2>
                <p className="text-text-secondary max-w-lg mx-auto">
                  Watch 400 players compete for a spot in 15 teams.
                  The live auction is the most exciting event of INPL Season 3.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/live">
                    <Button variant="gold" size="lg" icon={<Zap size={18} />}>
                      Watch Live
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="secondary" size="lg">
                      Team Login
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-default py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-inpl-neon to-inpl-neon-dark flex items-center justify-center">
                <span className="text-black font-bold text-xs font-display">IN</span>
              </div>
              <span className="text-sm font-semibold text-text-primary font-display">INPL Season 3</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <Link href="/rules" className="hover:text-text-primary transition-colors">Rules</Link>
              <Link href="/teams" className="hover:text-text-primary transition-colors">Teams</Link>
              <Link href="/players" className="hover:text-text-primary transition-colors">Players</Link>
              <Link href="/results" className="hover:text-text-primary transition-colors">Results</Link>
            </div>
            <p className="text-xs text-text-muted">
              © 2024 INPL. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
