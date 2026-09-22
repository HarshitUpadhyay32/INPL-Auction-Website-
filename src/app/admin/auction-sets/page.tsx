'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Layers, GripVertical, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { AuctionSet } from '@/lib/types/database'

export default function AuctionSetsPage() {
  const [sets, setSets] = useState<AuctionSet[]>([])
  const [playerCounts, setPlayerCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => { loadSets() }, [])

  async function loadSets() {
    const supabase = createClient()
    const { data } = await supabase.from('auction_sets').select('*').order('sort_order')
    if (data) setSets(data)

    // Get player counts per set
    const { data: players } = await supabase.from('players').select('auction_set_id')
    if (players) {
      const counts: Record<string, number> = {}
      players.forEach(p => { if (p.auction_set_id) counts[p.auction_set_id] = (counts[p.auction_set_id] || 0) + 1 })
      setPlayerCounts(counts)
    }
    setLoading(false)
  }

  async function handleAdd() {
    const supabase = createClient()
    const { error } = await supabase.from('auction_sets').insert({
      name: formData.name,
      description: formData.description || null,
      sort_order: sets.length + 1,
    })
    if (error) { toast.error(error.message); return }
    toast.success('Auction set created')
    setDialogOpen(false)
    setFormData({ name: '', description: '' })
    loadSets()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('players').update({ auction_set_id: null }).eq('auction_set_id', id)
    const { error } = await supabase.from('auction_sets').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Set deleted')
    loadSets()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
            <Layers className="text-inpl-neon" />
            Auction Sets
          </h1>
          <p className="text-sm text-text-secondary mt-1">Organize players into auction categories</p>
        </div>
        <Button variant="gold" onClick={() => setDialogOpen(true)} icon={<Plus size={16} />}>Add Set</Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 shimmer rounded-2xl" />)}</div>
      ) : sets.length === 0 ? (
        <Card glass className="text-center !p-12">
          <Layers className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No Auction Sets</h3>
          <p className="text-sm text-text-secondary mb-4">Create sets to organize players (e.g., Marquee, Batters, Bowlers)</p>
          <Button variant="gold" onClick={() => setDialogOpen(true)} icon={<Plus size={16} />}>Create First Set</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {sets.map((set, i) => (
            <Card key={set.id} glass hover className="!p-4">
              <div className="flex items-center gap-4">
                <div className="text-text-muted cursor-grab"><GripVertical size={18} /></div>
                <div className="w-8 h-8 rounded-lg bg-inpl-neon/10 flex items-center justify-center text-inpl-neon font-bold font-display text-sm">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary">{set.name}</h3>
                  {set.description && <p className="text-xs text-text-muted mt-0.5">{set.description}</p>}
                </div>
                <Badge variant="default">{playerCounts[set.id] || 0} players</Badge>
                <Badge variant={set.status === 'ACTIVE' ? 'live' : set.status === 'COMPLETED' ? 'sold' : 'available'} size="sm">
                  {set.status}
                </Badge>
                <button onClick={() => handleDelete(set.id)} className="p-1.5 rounded-lg hover:bg-inpl-red/10 text-text-muted hover:text-inpl-red transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Add Auction Set" size="sm">
        <div className="space-y-4">
          <Input label="Set Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Marquee Players" required />
          <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} placeholder="Top-tier players" />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" className="flex-1" onClick={handleAdd} disabled={!formData.name}>Create</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
