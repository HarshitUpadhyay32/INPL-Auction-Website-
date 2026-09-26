import React from 'react'
import { Sidebar } from '@/components/layout/sidebar'

export const metadata = {
  title: 'Team Dashboard | PW IOI Premier League',
  description: 'Team bidding dashboard for PW IOI Premier League',
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar type="team" teamName="My Team" />
      <main className="ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
