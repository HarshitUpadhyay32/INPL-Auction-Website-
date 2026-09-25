'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Team } from '@/lib/types/database'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'ADMIN' | 'TEAM' | 'PUBLIC'
  team_id: string | null
  created_at: string
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const supabase = createClient()
    const [profilesRes, teamsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('teams').select('*').order('name')
    ])

    if (profilesRes.data) setProfiles(profilesRes.data)
    if (teamsRes.data) setTeams(teamsRes.data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    loadData()
  }, [])

  async function updateUser(userId: string, field: 'role' | 'team_id', value: string | null) {
    const supabase = createClient()
    
    // Optimistic UI update
    setProfiles(prev => prev.map(p => {
      if (p.id === userId) {
        return { ...p, [field]: value }
      }
      return p
    }))

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value })
      .eq('id', userId)

    if (error) {
      toast.error('Failed to update user')
      loadData() // Revert on failure
    } else {
      toast.success('User updated successfully!')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-primary">User Management</h1>
        <p className="text-text-muted mt-1">Assign users to teams instantly.</p>
      </div>

      <Card className="glass-panel border-border-default">
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-text-muted bg-surface-hover/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Assigned Team</th>
                  <th className="px-6 py-4 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/50">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{profile.full_name}</div>
                      <div className="text-text-muted text-xs">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-surface-secondary border border-border-default text-text-primary text-sm rounded-lg focus:ring-inpl-neon focus:border-inpl-neon block w-full p-2.5"
                        value={profile.role}
                        onChange={(e) => {
                          const newRole = e.target.value as 'ADMIN' | 'TEAM' | 'PUBLIC'
                          updateUser(profile.id, 'role', newRole)
                          if (newRole !== 'TEAM' && profile.team_id) {
                            updateUser(profile.id, 'team_id', null)
                          }
                        }}
                      >
                        <option value="PUBLIC">PUBLIC</option>
                        <option value="TEAM">TEAM</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="bg-surface-secondary border border-border-default text-text-primary text-sm rounded-lg focus:ring-inpl-neon focus:border-inpl-neon block w-full p-2.5 disabled:opacity-50"
                        value={profile.team_id || ''}
                        disabled={profile.role !== 'TEAM'}
                        onChange={(e) => {
                          updateUser(profile.id, 'team_id', e.target.value || null)
                        }}
                      >
                        <option value="">-- No Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right text-text-muted">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
