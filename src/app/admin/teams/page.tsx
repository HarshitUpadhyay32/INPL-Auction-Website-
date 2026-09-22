'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users, IndianRupee } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Team } from '@/lib/types/database'

const TEAM_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
  '#6366f1', '#84cc16', '#e11d48', '#0ea5e9', '#d946ef',
]

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    name: '', short_name: '', color: '#3b82f6', owner_name: '',
    initial_purse: '25.00', max_players: '12',
  })

  useEffect(() => { loadTeams() }, [])

  async function loadTeams() {
    const supabase = createClient()
    const { data } = await supabase.from('teams').select('*').order('created_at')
    if (data) setTeams(data)
    setLoading(false)
  }

  function openAddDialog() {
    setEditingTeam(null)
    const nextColor = TEAM_COLORS[teams.length % TEAM_COLORS.length]
    setFormData({ name: '', short_name: '', color: nextColor, owner_name: '', initial_purse: '25.00', max_players: '12' })
    setDialogOpen(true)
  }

  function openEditDialog(team: Team) {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      short_name: team.short_name || '',
      color: team.color || '#3b82f6',
      owner_name: team.owner_name || '',
      initial_purse: String(team.initial_purse),
      max_players: String(team.max_players),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    const supabase = createClient()
    const data = {
      name: formData.name,
      short_name: formData.short_name || null,
      color: formData.color,
      owner_name: formData.owner_name || null,
      initial_purse: parseFloat(formData.initial_purse),
      remaining_purse: editingTeam ? undefined : parseFloat(formData.initial_purse),
      max_players: parseInt(formData.max_players),
    }

    if (editingTeam) {
      const { error } = await supabase.from('teams').update(data).eq('id', editingTeam.id)
      if (error) { toast.error(error.message); return }
      toast.success('Team updated')
    } else {
      const { error } = await supabase.from('teams').insert({ ...data, remaining_purse: parseFloat(formData.initial_purse) })
      if (error) { toast.error(error.message); return }
      toast.success('Team created')
    }
    setDialogOpen(false)
    loadTeams()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Team deleted')
    setDeleteDialog(null)
    loadTeams()
  }

  async function generateDefaultTeams() {
    const supabase = createClient()
    const defaultTeams = Array.from({ length: 15 }, (_, i) => ({
      name: `Team ${String(i + 1).padStart(2, '0')}`,
      short_name: `T${String(i + 1).padStart(2, '0')}`,
      color: TEAM_COLORS[i],
      initial_purse: 25.00,
      remaining_purse: 25.00,
      max_players: 12,
    }))
    const { error } = await supabase.from('teams').insert(defaultTeams)
    if (error) { toast.error(error.message); return }
    toast.success('15 default teams created')
    loadTeams()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Teams</h1>
          <p className="text-sm text-text-secondary mt-1">{teams.length} teams registered</p>
        </div>
        <div className="flex gap-2">
          {teams.length === 0 && (
            <Button variant="secondary" onClick={generateDefaultTeams} icon={<Users size={16} />}>
              Generate 15 Teams
            </Button>
          )}
          <Button variant="gold" onClick={openAddDialog} icon={<Plus size={16} />}>
            Add Team
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 shimmer rounded-2xl" />)}
        </div>
      ) : teams.length === 0 ? (
        <Card glass className="text-center !p-12">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">No Teams Yet</h3>
          <p className="text-sm text-text-secondary mb-4">Create 15 teams to get started with the auction</p>
          <Button variant="gold" onClick={generateDefaultTeams} icon={<Users size={16} />}>
            Generate 15 Default Teams
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => {
            const spent = Number(team.initial_purse) - Number(team.remaining_purse)
            return (
              <Card key={team.id} glass hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold font-display text-lg"
                      style={{ background: `linear-gradient(135deg, ${team.color}, ${team.color}88)` }}
                    >
                      {team.short_name?.[0] || team.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{team.name}</h3>
                      {team.short_name && <p className="text-xs text-text-muted">{team.short_name}</p>}
                    </div>
                  </div>
                  <Badge variant={team.status === 'ACTIVE' ? 'emerald' : 'default'} size="sm">
                    {team.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface-elevated/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                      <IndianRupee size={12} />
                      Purse
                    </div>
                    <p className="text-sm font-semibold font-display text-inpl-emerald">
                      {formatCurrency(Number(team.remaining_purse))}
                    </p>
                    {spent > 0 && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Spent: {formatCurrency(spent)}
                      </p>
                    )}
                  </div>
                  <div className="bg-surface-elevated/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
                      <Users size={12} />
                      Squad
                    </div>
                    <p className="text-sm font-semibold font-display text-text-primary">
                      {team.players_count} / {team.max_players}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {team.max_players - team.players_count} slots left
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => openEditDialog(team)} icon={<Pencil size={14} />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-inpl-red hover:text-inpl-red-light" onClick={() => setDeleteDialog(team.id)} icon={<Trash2 size={14} />}>
                    Delete
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingTeam ? 'Edit Team' : 'Add Team'}>
        <div className="space-y-4">
          <Input label="Team Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Team Titans" required />
          <Input label="Short Name" value={formData.short_name} onChange={e => setFormData(f => ({ ...f, short_name: e.target.value }))} placeholder="e.g. TIT" />
          <Input label="Owner Name" value={formData.owner_name} onChange={e => setFormData(f => ({ ...f, owner_name: e.target.value }))} placeholder="e.g. Rahul Kumar" />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Team Color</label>
            <div className="flex gap-2 flex-wrap">
              {TEAM_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${formData.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-primary scale-110' : 'opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Initial Purse (Cr)" type="number" step="0.01" value={formData.initial_purse} onChange={e => setFormData(f => ({ ...f, initial_purse: e.target.value }))} />
            <Input label="Max Players" type="number" value={formData.max_players} onChange={e => setFormData(f => ({ ...f, max_players: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" className="flex-1" onClick={handleSave} disabled={!formData.name}>Save</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog && handleDelete(deleteDialog)}
        title="Delete Team"
        description="Are you sure? This will remove the team and all associated squad records. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
