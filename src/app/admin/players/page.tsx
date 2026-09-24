'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Upload, Search, Trash2, Pencil, Filter, UserCircle, Camera, X as XIcon, BarChart3, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/dialog'
import { Badge, PlayerStatusBadge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/table'
import { formatCurrency, generatePlayerCode, getRoleEmoji } from '@/lib/utils'
import { toast } from 'sonner'
import type { Player, AuctionSet } from '@/lib/types/database'

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [sets, setSets] = useState<AuctionSet[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [deleteAllDialog, setDeleteAllDialog] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkCount, setBulkCount] = useState('50')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '', player_code: '', role: 'Batter', department: '', year: '',
    base_price: '0.50', auction_set_id: '', batting_style: '', bowling_style: '',
    matches: '0', runs: '0', wickets: '0',
  })

  const loadPlayers = useCallback(async () => {
    const supabase = createClient()
    let query = supabase.from('players').select('*').order('player_code')
    if (filterRole) query = query.eq('role', filterRole)
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    if (data) setPlayers(data)

    const { data: setsData } = await supabase.from('auction_sets').select('*').order('sort_order')
    if (setsData) setSets(setsData)
    setLoading(false)
  }, [filterRole, filterStatus])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlayers()
  }, [loadPlayers])

  function openAddDialog() {
    setEditingPlayer(null)
    const nextCode = generatePlayerCode(players.length + 1)
    setFormData({
      name: '', player_code: nextCode, role: 'Batter', department: '', year: '',
      base_price: '0.50', auction_set_id: '', batting_style: '', bowling_style: '',
      matches: '0', runs: '0', wickets: '0',
    })
    setPhotoFile(null)
    setPhotoPreview(null)
    setDialogOpen(true)
  }

  function openEditDialog(player: Player) {
    setEditingPlayer(player)
    setFormData({
      name: player.name,
      player_code: player.player_code,
      role: player.role,
      department: player.department || '',
      year: player.year || '',
      base_price: String(player.base_price),
      auction_set_id: player.auction_set_id || '',
      batting_style: player.batting_style || '',
      bowling_style: player.bowling_style || '',
      matches: String(player.matches || 0),
      runs: String(player.runs || 0),
      wickets: String(player.wickets || 0),
    })
    setPhotoFile(null)
    setPhotoPreview(player.photo_url || null)
    setDialogOpen(true)
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadPhoto(playerId: string): Promise<string | null> {
    if (!photoFile) return editingPlayer?.photo_url || null
    
    const supabase = createClient()
    const ext = photoFile.name.split('.').pop()
    const filePath = `players/${playerId}.${ext}`

    const { error } = await supabase.storage
      .from('player-photos')
      .upload(filePath, photoFile, { upsert: true })

    if (error) {
      // If bucket doesn't exist, try uploading to public storage
      console.error('Upload error:', error.message)
      toast.error('Photo upload failed — saving player without photo')
      return editingPlayer?.photo_url || null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('player-photos')
      .getPublicUrl(filePath)

    return publicUrl
  }

  async function handleSave() {
    setUploading(true)
    const supabase = createClient()

    const data: Record<string, unknown> = {
      name: formData.name,
      player_code: formData.player_code,
      role: formData.role,
      department: formData.department || null,
      year: formData.year || null,
      base_price: parseFloat(formData.base_price),
      auction_set_id: formData.auction_set_id || null,
      batting_style: formData.batting_style || null,
      bowling_style: formData.bowling_style || null,
      matches: parseInt(formData.matches) || 0,
      runs: parseInt(formData.runs) || 0,
      wickets: parseInt(formData.wickets) || 0,
    }

    if (editingPlayer) {
      // Upload photo if new one selected
      if (photoFile) {
        const photoUrl = await uploadPhoto(editingPlayer.id)
        if (photoUrl) data.photo_url = photoUrl
      }
      const { error } = await supabase.from('players').update(data).eq('id', editingPlayer.id)
      if (error) { toast.error(error.message); setUploading(false); return }
      toast.success('Player updated')
    } else {
      const { data: insertedPlayer, error } = await supabase.from('players').insert(data).select().single()
      if (error) { toast.error(error.message); setUploading(false); return }
      // Upload photo after getting the new player ID
      if (photoFile && insertedPlayer) {
        const photoUrl = await uploadPhoto(insertedPlayer.id)
        if (photoUrl) {
          await supabase.from('players').update({ photo_url: photoUrl }).eq('id', insertedPlayer.id)
        }
      }
      toast.success('Player added')
    }
    setUploading(false)
    setDialogOpen(false)
    loadPlayers()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Player deleted')
    setDeleteDialog(null)
    loadPlayers()
  }

  async function handleDeleteAll() {
    const supabase = createClient()
    const { error } = await supabase.from('players').delete().not('id', 'is', null)
    if (error) { toast.error(error.message); return }
    toast.success('All players deleted')
    setDeleteAllDialog(false)
    loadPlayers()
  }

  async function generateSamplePlayers() {
    const count = parseInt(bulkCount)
    const supabase = createClient()
    const roles = ['Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper']
    const departments = ['CSE', 'ECE', 'ME', 'EE', 'CE', 'IT', 'MBA', 'BBA']
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
    const firstNames = ['Rahul', 'Amit', 'Vikas', 'Rohit', 'Arjun', 'Karan', 'Priya', 'Neha', 'Ankit', 'Saurabh', 'Mohit', 'Deepak', 'Aditya', 'Vishal', 'Ravi', 'Sunil', 'Manoj', 'Gaurav', 'Nikhil', 'Varun']
    const lastNames = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Verma', 'Gupta', 'Joshi', 'Mishra', 'Yadav', 'Chauhan', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Das']

    const existingCount = players.length
    const newPlayers = Array.from({ length: count }, (_, i) => ({
      player_code: generatePlayerCode(existingCount + i + 1),
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      year: years[Math.floor(Math.random() * years.length)],
      base_price: 0.50,
      matches: Math.floor(Math.random() * 30),
      runs: Math.floor(Math.random() * 800),
      wickets: Math.floor(Math.random() * 40),
      auction_set_id: sets.length > 0 ? sets[Math.floor(Math.random() * sets.length)].id : null,
    }))

    // Insert in batches of 50
    for (let i = 0; i < newPlayers.length; i += 50) {
      const batch = newPlayers.slice(i, i + 50)
      const { error } = await supabase.from('players').insert(batch)
      if (error) { toast.error(`Batch error: ${error.message}`); return }
    }

    toast.success(`${count} sample players generated`)
    setBulkDialogOpen(false)
    loadPlayers()
  }

  async function handleReturnToAuction(player: Player) {
    const supabase = createClient()
    
    if (player.status === 'SOLD') {
      const { data: auction } = await supabase.from('auctions')
        .select('id').eq('player_id', player.id).eq('status', 'SOLD')
        .order('created_at', { ascending: false }).limit(1).single()
        
      if (!auction) {
        toast.error('Could not find sale record for this player')
        return
      }

      const { data, error } = await supabase.rpc('undo_player_sold', { p_auction_id: auction.id })
      if (error || !data?.success) {
        console.error(error || data?.error)
        toast.error(error?.message || data?.error || 'Failed to undo sale')
        return
      }
      toast.success('Player sale reversed! Player is now available.')
    } else {
      const { error } = await supabase.from('players').update({ status: 'AVAILABLE' }).eq('id', player.id)
      if (error) {
        console.error(error)
        toast.error('Failed to return player to auction')
        return
      }
      toast.success('Player returned to auction queue!')
    }
    loadPlayers()
  }

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.player_code.toLowerCase().includes(search.toLowerCase()) ||
    (p.department || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">Players</h1>
          <p className="text-sm text-text-secondary mt-1">{players.length} players registered</p>
        </div>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => setDeleteAllDialog(true)} icon={<Trash2 size={16} />} disabled={players.length === 0}>
            Delete All
          </Button>
          <Button variant="secondary" onClick={() => setBulkDialogOpen(true)} icon={<Upload size={16} />}>
            Generate Sample
          </Button>
          <Button variant="gold" onClick={openAddDialog} icon={<Plus size={16} />}>
            Add Player
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card glass padding="sm">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search name, ID, department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <Select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'Batter', label: '🏏 Batter' },
              { value: 'Bowler', label: '🎯 Bowler' },
              { value: 'All-Rounder', label: '⭐ All-Rounder' },
              { value: 'Wicketkeeper', label: '🧤 Wicketkeeper' },
            ]}
          />
          <Select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'AVAILABLE', label: 'Available' },
              { value: 'SOLD', label: 'Sold' },
              { value: 'UNSOLD', label: 'Unsold' },
              { value: 'LIVE', label: 'Live' },
            ]}
          />
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Filter size={14} />
            {filtered.length} results
          </div>
        </div>
      </Card>

      {/* Player Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Player</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sold Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmpty message="No players found" colSpan={8} />
            ) : (
              filtered.slice(0, 100).map(player => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {player.photo_url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border-default">
                          <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center text-lg flex-shrink-0">
                          {getRoleEmoji(player.role)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-text-primary">{player.name}</p>
                        <p className="text-xs text-text-muted font-mono">{player.player_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      player.role === 'Batter' ? 'blue' :
                      player.role === 'Bowler' ? 'red' :
                      player.role === 'All-Rounder' ? 'gold' : 'purple'
                    } size="sm">
                      {player.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span title="Matches">🏏 {player.matches || 0}</span>
                      <span title="Runs">🔥 {player.runs || 0}</span>
                      <span title="Wickets">🎯 {player.wickets || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-text-secondary">{player.department || '—'}</span></TableCell>
                  <TableCell><span className="font-display font-semibold">{formatCurrency(Number(player.base_price))}</span></TableCell>
                  <TableCell><PlayerStatusBadge status={player.status} /></TableCell>
                  <TableCell>
                    {player.sold_price ? (
                      <span className="font-display font-semibold text-inpl-emerald">{formatCurrency(Number(player.sold_price))}</span>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {(player.status === 'UNSOLD' || player.status === 'SOLD') && (
                        <button onClick={() => handleReturnToAuction(player)} title="Undo & Return to Auction queue" className="p-1.5 rounded-lg hover:bg-inpl-emerald/10 text-text-muted hover:text-inpl-emerald transition-colors">
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <button onClick={() => openEditDialog(player)} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteDialog(player.id)} className="p-1.5 rounded-lg hover:bg-inpl-red/10 text-text-muted hover:text-inpl-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {filtered.length > 100 && (
        <p className="text-sm text-text-muted text-center">Showing first 100 of {filtered.length} results</p>
      )}

      {/* Add/Edit Player Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title={editingPlayer ? 'Edit Player' : 'Add Player'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo Upload Section */}
          <div className="md:col-span-1 flex flex-col items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-border-default hover:border-inpl-neon/50 
                bg-surface-elevated cursor-pointer transition-all group overflow-hidden"
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera size={24} className="text-white" />
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPhotoFile(null); setPhotoPreview(null) }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <XIcon size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-muted group-hover:text-inpl-neon transition-colors">
                  <Camera size={28} className="mb-2" />
                  <span className="text-xs">Upload Photo</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-text-muted mt-2 text-center">Max 5MB • JPG, PNG</p>

            {/* Stats Section */}
            <div className="w-full mt-4 space-y-2">
              <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <BarChart3 size={12} /> Player Stats
              </p>
              <Input
                label="Matches"
                type="number"
                min="0"
                value={formData.matches}
                onChange={e => setFormData(f => ({ ...f, matches: e.target.value }))}
                placeholder="0"
              />
              <Input
                label="Runs"
                type="number"
                min="0"
                value={formData.runs}
                onChange={e => setFormData(f => ({ ...f, runs: e.target.value }))}
                placeholder="0"
              />
              <Input
                label="Wickets"
                type="number"
                min="0"
                value={formData.wickets}
                onChange={e => setFormData(f => ({ ...f, wickets: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Player Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Sharma" required />
              <Input label="Player Code" value={formData.player_code} onChange={e => setFormData(f => ({ ...f, player_code: e.target.value }))} placeholder="INPL-P001" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Role" value={formData.role} onChange={e => setFormData(f => ({ ...f, role: e.target.value }))} options={[
                { value: 'Batter', label: '🏏 Batter' },
                { value: 'Bowler', label: '🎯 Bowler' },
                { value: 'All-Rounder', label: '⭐ All-Rounder' },
                { value: 'Wicketkeeper', label: '🧤 Wicketkeeper' },
              ]} />
              <Select label="Category (Base Price)" value={formData.base_price} onChange={e => setFormData(f => ({ ...f, base_price: e.target.value }))} options={[
                { value: '1.00', label: 'Advanced (₹1Cr)' },
                { value: '0.50', label: 'Standard (₹50L)' },
                { value: '0.20', label: 'Emerging (₹20L)' },
              ]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Department" value={formData.department} onChange={e => setFormData(f => ({ ...f, department: e.target.value }))} placeholder="CSE" />
              <Input label="Year" value={formData.year} onChange={e => setFormData(f => ({ ...f, year: e.target.value }))} placeholder="2nd Year" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Batting Style" value={formData.batting_style} onChange={e => setFormData(f => ({ ...f, batting_style: e.target.value }))} placeholder="Right-hand bat" />
              <Input label="Bowling Style" value={formData.bowling_style} onChange={e => setFormData(f => ({ ...f, bowling_style: e.target.value }))} placeholder="Right-arm fast" />
            </div>
            {sets.length > 0 && (
              <Select label="Auction Set" value={formData.auction_set_id} onChange={e => setFormData(f => ({ ...f, auction_set_id: e.target.value }))} options={[
                { value: '', label: 'No Set' },
                ...sets.map(s => ({ value: s.id, label: s.name })),
              ]} />
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-4 mt-4 border-t border-border-default">
          <Button variant="secondary" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="gold" className="flex-1" onClick={handleSave} disabled={!formData.name || !formData.player_code || uploading} loading={uploading}>
            {uploading ? 'Saving...' : 'Save Player'}
          </Button>
        </div>
      </Dialog>

      {/* Bulk Generate Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} title="Generate Sample Players" description="Create random sample players for testing purposes">
        <div className="space-y-4">
          <Input label="Number of Players" type="number" value={bulkCount} onChange={e => setBulkCount(e.target.value)} min="1" max="400" />
          <p className="text-xs text-text-muted">This will generate {bulkCount} players with random names, roles, and departments. Player codes will be auto-assigned starting from INPL-P{String(players.length + 1).padStart(3, '0')}.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
            <Button variant="gold" className="flex-1" onClick={generateSamplePlayers} icon={<UserCircle size={16} />}>Generate</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        onConfirm={() => deleteDialog && handleDelete(deleteDialog)}
        title="Delete Player"
        description="Are you sure you want to delete this player? This cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmDialog
        open={deleteAllDialog}
        onClose={() => setDeleteAllDialog(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Players"
        description="Are you absolutely sure you want to delete ALL players? This action cannot be undone."
        confirmText="Delete All"
        variant="danger"
      />
    </div>
  )
}
