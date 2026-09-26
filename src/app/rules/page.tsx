'use client'

import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RulesPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display text-text-primary mb-2">Auction Rules</h1>
          <p className="text-text-secondary">PW IOI Premier League Player Auction Guidelines</p>
        </div>

        <div className="space-y-6">
          <Card glass>
            <CardHeader><CardTitle>General</CardTitle></CardHeader>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Total teams: <Badge variant="blue" size="sm">15</Badge></li>
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Total registered players: <Badge variant="blue" size="sm">400</Badge></li>
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Maximum squad size per team: <Badge variant="blue" size="sm">12 players</Badge></li>
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Maximum total purchased players: <Badge variant="blue" size="sm">180</Badge></li>
            </ul>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Purse & Pricing</CardTitle></CardHeader>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Starting purse per team: <Badge variant="emerald" size="sm">₹25 Cr</Badge></li>
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Total auction purse: <Badge variant="emerald" size="sm">₹250 Cr</Badge></li>
              <li className="flex gap-2"><span className="text-inpl-neon">•</span>Base price per player: <Badge variant="gold" size="sm">₹50 Lakhs (₹0.50 Cr)</Badge></li>
            </ul>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Bid Increments</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-text-muted text-xs uppercase">
                    <th className="text-left py-2">Current Bid Range</th>
                    <th className="text-left py-2">Minimum Increment</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-t border-border-default">
                    <td className="py-2">₹0.50 Cr – ₹1.00 Cr</td>
                    <td className="py-2 font-display font-semibold text-inpl-neon">₹0.10 Cr</td>
                  </tr>
                  <tr className="border-t border-border-default">
                    <td className="py-2">₹1.00 Cr – ₹3.00 Cr</td>
                    <td className="py-2 font-display font-semibold text-inpl-neon">₹0.20 Cr</td>
                  </tr>
                  <tr className="border-t border-border-default">
                    <td className="py-2">₹3.00 Cr+</td>
                    <td className="py-2 font-display font-semibold text-inpl-neon">₹0.25 Cr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted mt-3">Increments are configurable and may be adjusted by organizers.</p>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Bidding Rules</CardTitle></CardHeader>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-2"><span className="text-inpl-neon">1.</span>Only registered team accounts can place bids.</li>
              <li className="flex gap-2"><span className="text-inpl-neon">2.</span>Bids must be higher than the current highest bid by at least the minimum increment.</li>
              <li className="flex gap-2"><span className="text-inpl-neon">3.</span>Teams must have sufficient remaining purse to place a bid.</li>
              <li className="flex gap-2"><span className="text-inpl-neon">4.</span>Teams cannot bid if their squad has reached maximum capacity (12 players).</li>
              <li className="flex gap-2"><span className="text-inpl-neon">5.</span>All bids are validated on the server. Client-side manipulation is not possible.</li>
              <li className="flex gap-2"><span className="text-inpl-neon">6.</span>The auctioneer has final authority on all auction decisions.</li>
            </ul>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>SOLD / UNSOLD</CardTitle></CardHeader>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex gap-2"><span className="text-inpl-emerald">✓</span><strong>SOLD:</strong> The player is assigned to the highest bidding team. The bid amount is deducted from the team&apos;s purse.</li>
              <li className="flex gap-2"><span className="text-inpl-red">✗</span><strong>UNSOLD:</strong> If no team bids, the player is marked as unsold and may be re-entered in a later round.</li>
            </ul>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Player Categories</CardTitle></CardHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><span className="text-xl">🏏</span><Badge variant="blue">Batter</Badge></div>
              <div className="flex items-center gap-2"><span className="text-xl">🎯</span><Badge variant="red">Bowler</Badge></div>
              <div className="flex items-center gap-2"><span className="text-xl">⭐</span><Badge variant="gold">All-Rounder</Badge></div>
              <div className="flex items-center gap-2"><span className="text-xl">🧤</span><Badge variant="purple">Wicketkeeper</Badge></div>
            </div>
          </Card>

          <Card glass>
            <CardHeader><CardTitle>Dispute Resolution</CardTitle></CardHeader>
            <p className="text-sm text-text-secondary">
              All bids are recorded with timestamps and team identification. A complete audit trail is maintained
              for transparency. In case of disputes, the tournament organizers will review the bid history and 
              make a final decision. The auctioneer&apos;s decision is final and binding.
            </p>
          </Card>
        </div>
      </div>
    </main>
  )
}
