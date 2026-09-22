'use client'

import React, { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTime, formatDate } from '@/lib/utils'
import type { AuditLog } from '@/lib/types/database'

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
      if (data) setLogs(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-text-primary flex items-center gap-3">
          <ClipboardList className="text-inpl-neon" />
          Audit Log
        </h1>
        <p className="text-sm text-text-secondary mt-1">Complete action history</p>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 shimmer rounded-xl" />)}</div>
      ) : logs.length === 0 ? (
        <Card glass className="text-center !p-12">
          <ClipboardList className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No audit logs yet</p>
        </Card>
      ) : (
        <Card glass>
          <div className="space-y-1">
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className="text-center flex-shrink-0 w-16">
                  <p className="text-xs text-text-muted font-mono">{formatTime(log.created_at)}</p>
                  <p className="text-[10px] text-text-muted">{formatDate(log.created_at)}</p>
                </div>
                <Badge variant={
                  log.entity_type === 'AUCTION' ? 'gold' :
                  log.entity_type === 'PLAYER' ? 'blue' :
                  log.entity_type === 'TEAM' ? 'emerald' : 'default'
                } size="sm">
                  {log.entity_type || 'SYSTEM'}
                </Badge>
                <p className="text-sm text-text-primary flex-1">{log.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
