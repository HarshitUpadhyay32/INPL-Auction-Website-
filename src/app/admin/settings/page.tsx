'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Settings, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { AuctionConfig, BidIncrement } from '@/lib/types/database'

export default function SettingsPage() {
  const [config, setConfig] = useState<AuctionConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    tournament_name: 'INPL Season 3',
    base_price: '50',
    base_price_cr: '0.50',
    purse_per_team: '25.00',
    max_squad_size: '12',
    total_teams: '15',
    bid_timer_seconds: '10',
    enforce_min_squad_affordability: false,
  })
  const [increments, setIncrements] = useState<BidIncrement[]>([
    { min: 0.50, max: 1.00, increment: 0.10 },
    { min: 1.00, max: 3.00, increment: 0.20 },
    { min: 3.00, max: 999.00, increment: 0.25 },
  ])

  const loadConfig = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('auction_config').select('*').limit(1).single()
    if (data) {
      setConfig(data)
      setForm({
        tournament_name: data.tournament_name,
        base_price: String(data.base_price),
        base_price_cr: String(data.base_price_cr),
        purse_per_team: String(data.purse_per_team),
        max_squad_size: String(data.max_squad_size),
        total_teams: String(data.total_teams),
        bid_timer_seconds: String(data.bid_timer_seconds || ''),
        enforce_min_squad_affordability: data.enforce_min_squad_affordability,
      })
      setIncrements(data.bid_increments)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConfig()
  }, [loadConfig])

  async function handleSave() {
    if (!config) return
    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from('auction_config').update({
      tournament_name: form.tournament_name,
      base_price: parseFloat(form.base_price),
      base_price_cr: parseFloat(form.base_price_cr),
      purse_per_team: parseFloat(form.purse_per_team),
      max_squad_size: parseInt(form.max_squad_size),
      total_teams: parseInt(form.total_teams),
      bid_timer_seconds: form.bid_timer_seconds ? parseInt(form.bid_timer_seconds) : null,
      enforce_min_squad_affordability: form.enforce_min_squad_affordability,
      bid_increments: increments,
      updated_at: new Date().toISOString(),
    }).eq('id', config.id)

    if (error) { toast.error(error.message) } else { toast.success('Settings saved') }
    setSaving(false)
  }

  function addIncrement() {
    const last = increments[increments.length - 1]
    setIncrements([...increments, { min: last?.max || 0, max: (last?.max || 0) + 5, increment: 0.25 }])
  }

  function removeIncrement(index: number) {
    setIncrements(increments.filter((_, i) => i !== index))
  }

  function updateIncrement(index: number, field: keyof BidIncrement, value: string) {
    setIncrements(increments.map((inc, i) => i === index ? { ...inc, [field]: parseFloat(value) || 0 } : inc))
  }

  if (loading) return <div className="h-64 shimmer rounded-2xl" />

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
            <Settings className="text-inpl-neon" size={24} />
            Auction Settings
          </h1>
          <p className="text-sm text-text-secondary mt-1">Configure auction rules and parameters</p>
        </div>
        <Button variant="gold" onClick={handleSave} loading={saving} icon={<Save size={16} />}>
          Save Changes
        </Button>
      </div>

      {/* General */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle>General</CardTitle>
            <CardDescription>Tournament name and basic configuration</CardDescription>
          </div>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Tournament Name" value={form.tournament_name} onChange={e => setForm(f => ({ ...f, tournament_name: e.target.value }))} />
          <Input label="Total Teams" type="number" value={form.total_teams} onChange={e => setForm(f => ({ ...f, total_teams: e.target.value }))} />
        </div>
      </Card>

      {/* Pricing */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Base price and purse configuration</CardDescription>
          </div>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Base Price (LPA)" type="number" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value, base_price_cr: String(parseFloat(e.target.value) / 100) }))} />
          <Input label="Base Price (Cr)" type="number" step="0.01" value={form.base_price_cr} onChange={e => setForm(f => ({ ...f, base_price_cr: e.target.value, base_price: String(parseFloat(e.target.value) * 100) }))} />
          <Input label="Purse per Team (Cr)" type="number" step="0.01" value={form.purse_per_team} onChange={e => setForm(f => ({ ...f, purse_per_team: e.target.value }))} />
          <Input label="Max Squad Size" type="number" value={form.max_squad_size} onChange={e => setForm(f => ({ ...f, max_squad_size: e.target.value }))} />
        </div>
      </Card>

      {/* Timer */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle>Bid Timer</CardTitle>
            <CardDescription>Optional countdown timer for each bid round</CardDescription>
          </div>
        </CardHeader>
        <Input label="Timer Duration (seconds, leave empty for no timer)" type="number" value={form.bid_timer_seconds} onChange={e => setForm(f => ({ ...f, bid_timer_seconds: e.target.value }))} placeholder="10" />
      </Card>

      {/* Squad Affordability */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle>Squad Rules</CardTitle>
            <CardDescription>Advanced squad management rules</CardDescription>
          </div>
        </CardHeader>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enforce_min_squad_affordability}
            onChange={e => setForm(f => ({ ...f, enforce_min_squad_affordability: e.target.checked }))}
            className="w-4 h-4 rounded border-border-default bg-surface-elevated accent-inpl-neon"
          />
          <div>
            <p className="text-sm font-medium text-text-primary">Enforce Minimum Squad Affordability</p>
            <p className="text-xs text-text-muted">Teams must keep enough purse to fill remaining slots at base price</p>
          </div>
        </label>
      </Card>

      {/* Bid Increments */}
      <Card glass>
        <CardHeader>
          <div>
            <CardTitle>Bid Increments</CardTitle>
            <CardDescription>Configure bid increment tiers based on current bid amount</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {increments.map((inc, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end">
              <Input label={i === 0 ? 'From (Cr)' : undefined} type="number" step="0.01" value={String(inc.min)} onChange={e => updateIncrement(i, 'min', e.target.value)} />
              <Input label={i === 0 ? 'To (Cr)' : undefined} type="number" step="0.01" value={String(inc.max)} onChange={e => updateIncrement(i, 'max', e.target.value)} />
              <Input label={i === 0 ? 'Increment (Cr)' : undefined} type="number" step="0.01" value={String(inc.increment)} onChange={e => updateIncrement(i, 'increment', e.target.value)} />
              <Button variant="ghost" size="sm" className="text-inpl-red" onClick={() => removeIncrement(i)} disabled={increments.length <= 1}>
                Remove
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addIncrement}>
            + Add Tier
          </Button>
        </div>
      </Card>
    </div>
  )
}
