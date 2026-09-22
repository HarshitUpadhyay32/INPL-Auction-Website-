import { create } from 'zustand'
import type { Player, Team, Auction, Bid, AuctionConfig, GlobalAuctionStatus } from '@/lib/types/database'

interface AuctionState {
  // Global auction state
  config: AuctionConfig | null
  globalStatus: GlobalAuctionStatus

  // Current auction state
  currentPlayer: Player | null
  currentAuction: Auction | null
  currentBids: Bid[]
  
  // Teams data
  teams: Team[]

  // Statistics
  soldCount: number
  unsoldCount: number
  totalSpent: number

  // Actions
  setConfig: (config: AuctionConfig) => void
  setGlobalStatus: (status: GlobalAuctionStatus) => void
  setCurrentPlayer: (player: Player | null) => void
  setCurrentAuction: (auction: Auction | null) => void
  addBid: (bid: Bid) => void
  setCurrentBids: (bids: Bid[]) => void
  setTeams: (teams: Team[]) => void
  updateTeam: (teamId: string, updates: Partial<Team>) => void
  setSoldCount: (count: number) => void
  setUnsoldCount: (count: number) => void
  setTotalSpent: (amount: number) => void
  reset: () => void
}

const initialState = {
  config: null,
  globalStatus: 'DRAFT' as GlobalAuctionStatus,
  currentPlayer: null,
  currentAuction: null,
  currentBids: [],
  teams: [],
  soldCount: 0,
  unsoldCount: 0,
  totalSpent: 0,
}

export const useAuctionStore = create<AuctionState>((set) => ({
  ...initialState,

  setConfig: (config) => set({ config, globalStatus: config.auction_status }),
  setGlobalStatus: (status) => set({ globalStatus: status }),
  
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setCurrentAuction: (auction) => set({ currentAuction: auction }),
  
  addBid: (bid) => set((state) => ({ 
    currentBids: [bid, ...state.currentBids] 
  })),
  setCurrentBids: (bids) => set({ currentBids: bids }),
  
  setTeams: (teams) => set({ teams }),
  updateTeam: (teamId, updates) => set((state) => ({
    teams: state.teams.map(t => t.id === teamId ? { ...t, ...updates } : t)
  })),
  
  setSoldCount: (count) => set({ soldCount: count }),
  setUnsoldCount: (count) => set({ unsoldCount: count }),
  setTotalSpent: (amount) => set({ totalSpent: amount }),
  
  reset: () => set(initialState),
}))
