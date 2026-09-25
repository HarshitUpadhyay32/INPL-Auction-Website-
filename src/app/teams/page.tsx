'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, IndianRupee, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { Team } from '@/lib/types/database'
import { TeamAvatar } from '@/components/team-avatar'

export default function TeamsPublicPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('teams').select('*').order('name')
      if (data) setTeams(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-text-primary mb-2">Teams</h1>
          <p className="text-text-secondary">15 teams competing in INPL Season 3</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="h-56 shimmer rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map(team => {
              const spent = Number(team.initial_purse) - Number(team.remaining_purse)
              const pct = (spent / Number(team.initial_purse)) * 100
              return (
                <Link key={team.id} href={`/teams/${team.id}`}>
                  <Card glass hover className="h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <TeamAvatar team={team} size="xl" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold font-display text-text-primary">{team.name}</h3>
                        {team.owner_name && <p className="text-xs text-text-muted">{team.owner_name}</p>}
                      </div>
                      <ChevronRight className="text-text-muted" size={18} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-surface-elevated/50 rounded-xl p-3 text-center">
                        <IndianRupee className="w-4 h-4 text-inpl-emerald mx-auto mb-1" />
                        <p className="text-sm font-bold font-display text-inpl-emerald">{formatCurrency(Number(team.remaining_purse))}</p>
                        <p className="text-[10px] text-text-muted">Remaining</p>
                      </div>
                      <div className="bg-surface-elevated/50 rounded-xl p-3 text-center">
                        <Users className="w-4 h-4 text-inpl-electric mx-auto mb-1" />
                        <p className="text-sm font-bold font-display text-text-primary">{team.players_count} / {team.max_players}</p>
                        <p className="text-[10px] text-text-muted">Players</p>
                      </div>
                    </div>

                    <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%`, background: team.color }}
                      />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
