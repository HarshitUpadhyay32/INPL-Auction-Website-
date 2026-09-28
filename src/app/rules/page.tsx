'use client'

import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default function RulesPage() {
  const rules = [
    { title: "Minimum Squad Size", desc: "Every team must have a minimum of 12 players." },
    { title: "Auction Purse", desc: "Every team will receive a fixed auction purse that is 25 cr.\n\nTeams cannot bid beyond their available purse." },
    { title: "Base Price", desc: "Every player will have a predetermined base price.\n\nBidding will start from the player's base price." },
    { title: "Bidding Process", desc: "Teams can bid against each other during the auction.\n\nThe highest valid bid will secure the player." },
    { title: "Final Bid", desc: "Once the auctioneer declares a player SOLD, the decision will be final." },
    { title: "No Withdrawal", desc: "A team cannot withdraw from a purchase after the player has been declared SOLD." },
    { title: "Budget Management", desc: "Each captain is responsible for managing their team's remaining purse throughout the auction." },
    { title: "Unsold Players", desc: "Players who remain unsold may be brought back in a later round, subject to the auction management's decision." },
    { title: "Re-Auction", desc: "Unsold players can be re-auctioned in the designated re-auction round." },
    { title: "Captain's Responsibility", desc: "The captain/team representative is responsible for all bids made on behalf of their team." },
    { title: "Auctioneer's Decision", desc: "The auctioneer's decision regarding bids, SOLD/UNSOLD status, and auction proceedings will be final." },
    { title: "Auction Discipline", desc: "All captains and participants must maintain proper discipline and follow the instructions of the auctioneer and INPL management." },
    { title: "No Unofficial Transfers", desc: "Players cannot be exchanged or transferred between teams during the auction unless specifically permitted by INPL management." },
    { title: "Squad Completion", desc: "Teams must use the auction to complete their required squad of at least 12 players." },
    { title: "Final Squad Lock", desc: "Once the auction is officially concluded, all team squads will be finalized and locked." },
    { title: "Disputes", desc: "Any dispute regarding the auction will be reviewed by INPL management, whose decision will be final." },
    { title: "Auction Conduct", desc: "Any intentional disruption, fake bidding, misbehavior, or violation of auction rules may result in disciplinary action." },
    { title: "Rule Amendments", desc: "INPL management reserves the right to make necessary changes or clarifications to the auction rules if required for the smooth conduct of the auction." },
    { title: "Squad Completion & Highest-Priced Player Rule", desc: "If a team exhausts its entire auction purse but still fails to complete the minimum 12-player squad, the most expensive player purchased by that team will be removed from its squad.\n\nThe removed player cannot be bought back by the same team during the auction.\n\nThe removed player will be made available for bidding among the other teams.\n\nThe affected team will not be allowed to participate in the bidding for that player.\n\nThe affected team will complete its remaining squad spots only after the auction ends.\n\nThe affected team will be allowed to select players only from the players who remain unsold at the end of the auction, using its remaining purse, if any.\n\nThis selection will not be allowed during the ongoing auction.\n\nThe team must ultimately complete the required minimum squad of 12 players." }
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-display text-text-primary mb-2">Mega Auction Rules</h1>
          <p className="text-text-secondary uppercase tracking-widest text-sm">INPL Season 3 Player Auction Guidelines</p>
        </div>

        <div className="space-y-6">
          <Card glass>
            <CardHeader><CardTitle>Official Rules</CardTitle></CardHeader>
            <div className="px-6 pb-8">
              <div className="space-y-8">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-elevated border border-white/5 flex items-center justify-center font-display font-bold text-inpl-neon mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-lg mb-1">{rule.title}</h3>
                      <p className="text-[15px] text-text-secondary leading-relaxed whitespace-pre-line">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
