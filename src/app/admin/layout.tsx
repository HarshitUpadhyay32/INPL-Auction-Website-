import React from 'react'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata = {
  title: 'Admin Dashboard | INPL Season 3',
  description: 'Auction management dashboard for INPL Season 3',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar type="admin" />
      <main className="ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
