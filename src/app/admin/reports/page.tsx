'use client'

import React from 'react'
import { FileText, Download, Table } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ReportsPage() {
  async function downloadCSV(type: 'teams' | 'players' | 'bids' | 'transactions') {
    const supabase = createClient()
    let data: Record<string, unknown>[] = []
    let filename = ''

    switch (type) {
      case 'teams': {
        const { data: d } = await supabase.from('teams').select('name, short_name, initial_purse, remaining_purse, players_count, max_players, status').order('name')
        data = d || []
        filename = 'inpl_teams.csv'
        break
      }
      case 'players': {
        const { data: d } = await supabase.from('players').select('player_code, name, role, department, year, base_price, status, sold_price').order('player_code')
        data = d || []
        filename = 'inpl_players.csv'
        break
      }
      case 'bids': {
        const { data: d } = await supabase.from('bids').select('*, player:players(name, player_code), team:teams(name)').order('created_at')
        data = (d || []).map((b: Record<string, unknown>) => ({
          time: b.created_at,
          player: (b.player as Record<string, unknown>)?.name,
          player_code: (b.player as Record<string, unknown>)?.player_code,
          team: (b.team as Record<string, unknown>)?.name,
          amount: b.amount,
        }))
        filename = 'inpl_bids.csv'
        break
      }
      case 'transactions': {
        const { data: d } = await supabase.from('transactions').select('*, player:players(name, player_code), team:teams(name)').order('created_at')
        data = (d || []).map((t: Record<string, unknown>) => ({
          time: t.created_at,
          player: (t.player as Record<string, unknown>)?.name,
          team: (t.team as Record<string, unknown>)?.name,
          amount: t.amount,
          type: t.transaction_type,
        }))
        filename = 'inpl_transactions.csv'
        break
      }
    }

    if (data.length === 0) { toast.error('No data to export'); return }

    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h]
        const str = String(val ?? '')
        return str.includes(',') ? `"${str}"` : str
      }).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
          <FileText className="text-inpl-neon" />
          Reports & Export
        </h1>
        <p className="text-sm text-text-secondary mt-1">Download auction data as CSV</p>
      </div>

      <div className="grid gap-4">
        <Card glass>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-inpl-electric/10"><Table className="w-5 h-5 text-inpl-electric" /></div>
              <div>
                <h3 className="font-semibold text-text-primary">Team Report</h3>
                <p className="text-xs text-text-secondary">All teams with purse, spending, and squad data</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => downloadCSV('teams')} icon={<Download size={14} />}>Download</Button>
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-inpl-emerald/10"><Table className="w-5 h-5 text-inpl-emerald" /></div>
              <div>
                <h3 className="font-semibold text-text-primary">Player Report</h3>
                <p className="text-xs text-text-secondary">All 400 players with status and sold prices</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => downloadCSV('players')} icon={<Download size={14} />}>Download</Button>
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-inpl-neon/10"><Table className="w-5 h-5 text-inpl-neon" /></div>
              <div>
                <h3 className="font-semibold text-text-primary">Complete Bid History</h3>
                <p className="text-xs text-text-secondary">Every bid placed during the auction with timestamps</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => downloadCSV('bids')} icon={<Download size={14} />}>Download</Button>
          </div>
        </Card>

        <Card glass>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-inpl-purple/10"><Table className="w-5 h-5 text-inpl-purple" /></div>
              <div>
                <h3 className="font-semibold text-text-primary">Transactions</h3>
                <p className="text-xs text-text-secondary">All purchase, adjustment, and refund transactions</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => downloadCSV('transactions')} icon={<Download size={14} />}>Download</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
