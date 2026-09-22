/* eslint-disable @typescript-eslint/no-explicit-any */
export type PlayerRole = 'Batter' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper'
export type PlayerStatus = 'AVAILABLE' | 'LIVE' | 'SOLD' | 'UNSOLD'
export type AuctionStatus = 'ACTIVE' | 'SOLD' | 'UNSOLD' | 'CANCELLED'
export type GlobalAuctionStatus = 'DRAFT' | 'UPCOMING' | 'LIVE' | 'PAUSED' | 'COMPLETED'
export type TransactionType = 'PURCHASE' | 'ADJUSTMENT' | 'REFUND'
export type UserRole = 'ADMIN' | 'TEAM' | 'PUBLIC'
export type TeamStatus = 'ACTIVE' | 'INACTIVE'
export type AuctionSetStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED'

export interface BidIncrement {
  min: number
  max: number
  increment: number
}

export interface Team {
  id: string
  name: string
  short_name: string | null
  logo_url: string | null
  color: string
  initial_purse: number
  remaining_purse: number
  max_players: number
  players_count: number
  status: TeamStatus
  owner_name: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  team_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  player_code: string
  name: string
  photo_url: string | null
  role: PlayerRole
  department: string | null
  year: string | null
  batting_style: string | null
  bowling_style: string | null
  matches: number
  runs: number
  wickets: number
  base_price: number
  status: PlayerStatus
  auction_set_id: string | null
  sold_to_team_id: string | null
  sold_price: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Auction {
  id: string
  player_id: string
  status: AuctionStatus
  current_bid: number
  highest_bid_team_id: string | null
  bid_count: number
  started_at: string
  ended_at: string | null
  created_at: string
}

export interface Bid {
  id: string
  auction_id: string
  player_id: string
  team_id: string
  amount: number
  is_valid: boolean
  created_at: string
}

export interface Transaction {
  id: string
  player_id: string
  team_id: string
  auction_id: string | null
  amount: number
  transaction_type: TransactionType
  notes: string | null
  created_at: string
}

export interface Squad {
  id: string
  team_id: string
  player_id: string
  purchase_price: number
  purchased_at: string
}

export interface AuctionSet {
  id: string
  name: string
  description: string | null
  sort_order: number
  status: AuctionSetStatus
  created_at: string
}

export interface AuctionConfig {
  id: string
  tournament_name: string
  base_price: number
  base_price_cr: number
  purse_per_team: number
  max_squad_size: number
  total_teams: number
  bid_timer_seconds: number | null
  enforce_min_squad_affordability: boolean
  bid_increments: BidIncrement[]
  auction_status: GlobalAuctionStatus
  auction_start_time: string | null
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

// Supabase Database type for the client
export interface Database {
  public: {
    Tables: {
      auction_config: {
        Row: AuctionConfig
        Insert: Partial<AuctionConfig> & { tournament_name?: string }
        Update: Partial<AuctionConfig>
        Relationships: any[]
      }
      teams: {
        Row: Team
        Insert: Partial<Team> & { name: string }
        Update: Partial<Team>
        Relationships: any[]
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
        Relationships: any[]
      }
      players: {
        Row: Player
        Insert: Partial<Player> & { player_code: string; name: string }
        Update: Partial<Player>
        Relationships: any[]
      }
      auctions: {
        Row: Auction
        Insert: Partial<Auction> & { player_id: string }
        Update: Partial<Auction>
        Relationships: any[]
      }
      bids: {
        Row: Bid
        Insert: Partial<Bid> & { auction_id: string; player_id: string; team_id: string; amount: number }
        Update: Partial<Bid>
        Relationships: any[]
      }
      transactions: {
        Row: Transaction
        Insert: Partial<Transaction> & { player_id: string; team_id: string; amount: number }
        Update: Partial<Transaction>
        Relationships: any[]
      }
      squads: {
        Row: Squad
        Insert: Partial<Squad> & { team_id: string; player_id: string; purchase_price: number }
        Update: Partial<Squad>
        Relationships: any[]
      }
      auction_sets: {
        Row: AuctionSet
        Insert: Partial<AuctionSet> & { name: string }
        Update: Partial<AuctionSet>
        Relationships: any[]
      }
      audit_logs: {
        Row: AuditLog
        Insert: Partial<AuditLog> & { action: string }
        Update: Partial<AuditLog>
        Relationships: any[]
      }
    }
    Functions: {
      place_bid: {
        Args: {
          p_auction_id: string
          p_player_id: string
          p_team_id: string
          p_amount: number
        }
        Returns: {
          success: boolean
          error?: string
          bid_amount?: number
          team_id?: string
          auction_id?: string
        }
      }
      mark_player_sold: {
        Args: { p_auction_id: string }
        Returns: {
          success: boolean
          error?: string
          player_id?: string
          team_id?: string
          amount?: number
        }
      }
      undo_player_sold: {
        Args: { p_auction_id: string }
        Returns: {
          success: boolean
          error?: string
          player_id?: string
          refunded?: number
        }
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
      get_user_team_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
