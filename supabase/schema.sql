-- =============================================
-- INPL SEASON 3 — DATABASE SCHEMA
-- =============================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. AUCTION CONFIG (singleton settings table)
-- =============================================
CREATE TABLE auction_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_name TEXT NOT NULL DEFAULT 'INPL Season 3',
  base_price NUMERIC(12,2) NOT NULL DEFAULT 50, -- in LPA
  base_price_cr NUMERIC(12,4) NOT NULL DEFAULT 0.50, -- in Cr
  purse_per_team NUMERIC(12,2) NOT NULL DEFAULT 25.00, -- in Cr
  max_squad_size INT NOT NULL DEFAULT 12,
  total_teams INT NOT NULL DEFAULT 15,
  bid_timer_seconds INT DEFAULT 10, -- NULL = no timer
  enforce_min_squad_affordability BOOLEAN NOT NULL DEFAULT false,
  bid_increments JSONB NOT NULL DEFAULT '[
    {"min": 0.50, "max": 1.00, "increment": 0.10},
    {"min": 1.00, "max": 3.00, "increment": 0.20},
    {"min": 3.00, "max": 999.00, "increment": 0.25}
  ]'::jsonb,
  auction_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (auction_status IN ('DRAFT', 'UPCOMING', 'LIVE', 'PAUSED', 'COMPLETED')),
  auction_start_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config
INSERT INTO auction_config (tournament_name) VALUES ('INPL Season 3');

-- =============================================
-- 2. TEAMS
-- =============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT,
  logo_url TEXT,
  color TEXT DEFAULT '#3b82f6',
  initial_purse NUMERIC(12,4) NOT NULL DEFAULT 25.00, -- in Cr
  remaining_purse NUMERIC(12,4) NOT NULL DEFAULT 25.00, -- in Cr
  max_players INT NOT NULL DEFAULT 12,
  players_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  owner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. PROFILES (extends Supabase Auth users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'PUBLIC' CHECK (role IN ('ADMIN', 'TEAM', 'PUBLIC')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 4. AUCTION SETS
-- =============================================
CREATE TABLE auction_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default sets
INSERT INTO auction_sets (name, description, sort_order) VALUES
  ('Batters', 'Specialist batting players', 1),
  ('Bowlers', 'Specialist bowling players', 2),
  ('All-Rounders', 'Versatile all-round players', 3),
  ('Wicketkeepers', 'Wicketkeeper-batters', 4);

-- =============================================
-- 5. PLAYERS
-- =============================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_code TEXT UNIQUE NOT NULL, -- e.g., INPL-P001
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT DEFAULT 'Batter' CHECK (role IN ('Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper')),
  department TEXT,
  year TEXT,
  batting_style TEXT,
  bowling_style TEXT,
  matches INT DEFAULT 0,
  runs INT DEFAULT 0,
  wickets INT DEFAULT 0,
  base_price NUMERIC(12,4) NOT NULL DEFAULT 0.50, -- in Cr
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LIVE', 'SOLD', 'UNSOLD')),
  auction_set_id UUID REFERENCES auction_sets(id) ON DELETE SET NULL,
  sold_to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  sold_price NUMERIC(12,4),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. AUCTIONS (per-player auction sessions)
-- =============================================
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD', 'UNSOLD', 'CANCELLED')),
  current_bid NUMERIC(12,4) NOT NULL DEFAULT 0.50, -- in Cr
  highest_bid_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  bid_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 7. BIDS
-- =============================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  amount NUMERIC(12,4) NOT NULL, -- in Cr
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 8. TRANSACTIONS
-- =============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  auction_id UUID REFERENCES auctions(id) ON DELETE SET NULL,
  amount NUMERIC(12,4) NOT NULL, -- in Cr
  transaction_type TEXT NOT NULL DEFAULT 'PURCHASE' CHECK (transaction_type IN ('PURCHASE', 'ADJUSTMENT', 'REFUND')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 9. SQUADS (team-player assignments)
-- =============================================
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  purchase_price NUMERIC(12,4) NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- =============================================
-- 10. AUDIT LOGS
-- =============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT, -- 'PLAYER', 'TEAM', 'AUCTION', 'BID', 'CONFIG'
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_auction_set ON players(auction_set_id);
CREATE INDEX idx_players_sold_to ON players(sold_to_team_id);
CREATE INDEX idx_players_player_code ON players(player_code);
CREATE INDEX idx_auctions_player ON auctions(player_id);
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_bids_auction ON bids(auction_id);
CREATE INDEX idx_bids_team ON bids(team_id);
CREATE INDEX idx_bids_player ON bids(player_id);
CREATE INDEX idx_bids_created ON bids(created_at);
CREATE INDEX idx_transactions_team ON transactions(team_id);
CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_squads_team ON squads(team_id);
CREATE INDEX idx_squads_player ON squads(player_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE auction_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get user team_id
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
  SELECT team_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- AUCTION_CONFIG: everyone reads, only admin writes
CREATE POLICY "Anyone can read config" ON auction_config FOR SELECT USING (true);
CREATE POLICY "Admin can update config" ON auction_config FOR UPDATE USING (get_user_role() = 'ADMIN');
CREATE POLICY "Admin can insert config" ON auction_config FOR INSERT WITH CHECK (get_user_role() = 'ADMIN');

-- TEAMS: everyone reads, only admin writes
CREATE POLICY "Anyone can read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Admin can manage teams" ON teams FOR ALL USING (get_user_role() = 'ADMIN');

-- PROFILES: users read own, admin reads all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR get_user_role() = 'ADMIN');
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can manage profiles" ON profiles FOR ALL USING (get_user_role() = 'ADMIN');

-- AUCTION_SETS: everyone reads, admin writes
CREATE POLICY "Anyone can read sets" ON auction_sets FOR SELECT USING (true);
CREATE POLICY "Admin can manage sets" ON auction_sets FOR ALL USING (get_user_role() = 'ADMIN');

-- PLAYERS: everyone reads, admin writes
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Admin can manage players" ON players FOR ALL USING (get_user_role() = 'ADMIN');

-- AUCTIONS: everyone reads, admin manages
CREATE POLICY "Anyone can read auctions" ON auctions FOR SELECT USING (true);
CREATE POLICY "Admin can manage auctions" ON auctions FOR ALL USING (get_user_role() = 'ADMIN');

-- BIDS: everyone reads, authenticated teams can insert
CREATE POLICY "Anyone can read bids" ON bids FOR SELECT USING (true);
CREATE POLICY "Teams can place bids" ON bids FOR INSERT WITH CHECK (
  get_user_role() IN ('TEAM', 'ADMIN') AND team_id = get_user_team_id()
);

-- TRANSACTIONS: everyone reads, admin manages
CREATE POLICY "Anyone can read transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Admin can manage transactions" ON transactions FOR ALL USING (get_user_role() = 'ADMIN');

-- SQUADS: everyone reads, admin manages
CREATE POLICY "Anyone can read squads" ON squads FOR SELECT USING (true);
CREATE POLICY "Admin can manage squads" ON squads FOR ALL USING (get_user_role() = 'ADMIN');

-- AUDIT_LOGS: admin only
CREATE POLICY "Admin can read audit logs" ON audit_logs FOR SELECT USING (get_user_role() = 'ADMIN');
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- =============================================
-- REALTIME PUBLICATION
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE squads;
ALTER PUBLICATION supabase_realtime ADD TABLE auction_config;

-- =============================================
-- ATOMIC BID FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION place_bid(
  p_auction_id UUID,
  p_player_id UUID,
  p_team_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_auction RECORD;
  v_team RECORD;
  v_config RECORD;
  v_increment NUMERIC;
  v_min_bid NUMERIC;
  v_bid_increments JSONB;
  v_inc RECORD;
  v_remaining_slots INT;
  v_min_required NUMERIC;
BEGIN
  -- Lock the auction row
  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Auction not found');
  END IF;
  
  IF v_auction.status != 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Auction is not active');
  END IF;
  
  IF v_auction.player_id != p_player_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player mismatch');
  END IF;

  -- Lock the team row
  SELECT * INTO v_team FROM teams WHERE id = p_team_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found');
  END IF;

  -- Get config
  SELECT * INTO v_config FROM auction_config LIMIT 1;

  -- Check squad limit
  IF v_team.players_count >= v_team.max_players THEN
    RETURN jsonb_build_object('success', false, 'error', 'Squad is full. Maximum ' || v_team.max_players || ' players allowed.');
  END IF;

  -- Calculate valid bid increment
  IF v_auction.current_bid < 3.00 THEN
    v_increment := 0.20;
  ELSE
    v_increment := 0.50;
  END IF;

  -- Calculate minimum valid bid
  IF v_auction.bid_count = 0 THEN
    v_min_bid := v_auction.current_bid; -- First bid can be at base price
  ELSE
    v_min_bid := v_auction.current_bid + v_increment;
  END IF;

  -- Validate bid amount
  IF p_amount < v_min_bid AND v_auction.current_bid < 25.00 THEN
    RETURN jsonb_build_object('success', false, 'error', 
      'Bid must be at least ₹' || v_min_bid || ' Cr. Current bid: ₹' || v_auction.current_bid || ' Cr, Increment: ₹' || v_increment || ' Cr');
  END IF;

  -- Enforce Maximum Bid
  IF p_amount > 25.00 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum bid allowed is ₹25 Cr.');
  END IF;

  -- Check purse
  IF p_amount > v_team.remaining_purse THEN
    RETURN jsonb_build_object('success', false, 'error', 
      'Insufficient purse. Required: ₹' || p_amount || ' Cr, Available: ₹' || v_team.remaining_purse || ' Cr');
  END IF;

  -- Check minimum squad affordability if enabled
  IF v_config.enforce_min_squad_affordability THEN
    v_remaining_slots := v_team.max_players - v_team.players_count - 1; -- -1 for this potential purchase
    v_min_required := v_remaining_slots * v_config.base_price_cr;
    
    IF (v_team.remaining_purse - p_amount) < v_min_required THEN
      RETURN jsonb_build_object('success', false, 'error',
        'Cannot afford remaining squad. You need ₹' || v_min_required || ' Cr for ' || v_remaining_slots || ' more players at base price.');
    END IF;
  END IF;

  -- All validations passed — insert bid
  INSERT INTO bids (auction_id, player_id, team_id, amount)
  VALUES (p_auction_id, p_player_id, p_team_id, p_amount);

  -- Update auction
  UPDATE auctions 
  SET current_bid = p_amount,
      highest_bid_team_id = p_team_id,
      bid_count = bid_count + 1
  WHERE id = p_auction_id;

  RETURN jsonb_build_object(
    'success', true, 
    'bid_amount', p_amount,
    'team_id', p_team_id,
    'auction_id', p_auction_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SOLD PLAYER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION mark_player_sold(
  p_auction_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_auction RECORD;
  v_team RECORD;
BEGIN
  -- Lock auction
  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Auction not found');
  END IF;
  
  IF v_auction.status != 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Auction is not active');
  END IF;
  
  IF v_auction.highest_bid_team_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No bids placed yet');
  END IF;

  -- Lock team
  SELECT * INTO v_team FROM teams WHERE id = v_auction.highest_bid_team_id FOR UPDATE;

  -- Mark auction as SOLD
  UPDATE auctions SET status = 'SOLD', ended_at = NOW() WHERE id = p_auction_id;

  -- Update player
  UPDATE players 
  SET status = 'SOLD', 
      sold_to_team_id = v_auction.highest_bid_team_id,
      sold_price = v_auction.current_bid,
      updated_at = NOW()
  WHERE id = v_auction.player_id;

  -- Deduct purse
  UPDATE teams 
  SET remaining_purse = remaining_purse - v_auction.current_bid,
      players_count = players_count + 1,
      updated_at = NOW()
  WHERE id = v_auction.highest_bid_team_id;

  -- Insert squad record
  INSERT INTO squads (team_id, player_id, purchase_price)
  VALUES (v_auction.highest_bid_team_id, v_auction.player_id, v_auction.current_bid);

  -- Insert transaction
  INSERT INTO transactions (player_id, team_id, auction_id, amount, transaction_type)
  VALUES (v_auction.player_id, v_auction.highest_bid_team_id, p_auction_id, v_auction.current_bid, 'PURCHASE');

  RETURN jsonb_build_object(
    'success', true,
    'player_id', v_auction.player_id,
    'team_id', v_auction.highest_bid_team_id,
    'amount', v_auction.current_bid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UNDO SOLD FUNCTION (Admin Override)
-- =============================================
CREATE OR REPLACE FUNCTION undo_player_sold(
  p_auction_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_auction RECORD;
  v_transaction RECORD;
BEGIN
  SELECT * INTO v_auction FROM auctions WHERE id = p_auction_id FOR UPDATE;
  
  IF NOT FOUND OR v_auction.status != 'SOLD' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Auction not found or not in SOLD state');
  END IF;

  -- Get the transaction
  SELECT * INTO v_transaction FROM transactions 
  WHERE auction_id = p_auction_id AND transaction_type = 'PURCHASE' LIMIT 1;

  -- Restore team purse and count
  UPDATE teams 
  SET remaining_purse = remaining_purse + v_transaction.amount,
      players_count = players_count - 1,
      updated_at = NOW()
  WHERE id = v_transaction.team_id;

  -- Remove squad entry
  DELETE FROM squads WHERE team_id = v_transaction.team_id AND player_id = v_auction.player_id;

  -- Insert refund transaction
  INSERT INTO transactions (player_id, team_id, auction_id, amount, transaction_type, notes)
  VALUES (v_auction.player_id, v_transaction.team_id, p_auction_id, v_transaction.amount, 'REFUND', 'Admin override: undo sold');

  -- Reset player
  UPDATE players 
  SET status = 'AVAILABLE', sold_to_team_id = NULL, sold_price = NULL, updated_at = NOW()
  WHERE id = v_auction.player_id;

  -- Reset auction
  UPDATE auctions SET status = 'CANCELLED', ended_at = NOW() WHERE id = p_auction_id;

  RETURN jsonb_build_object('success', true, 'player_id', v_auction.player_id, 'refunded', v_transaction.amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MANUAL ASSIGN PLAYER FUNCTION (Admin Override)
-- =============================================
CREATE OR REPLACE FUNCTION manual_assign_player(
  p_player_id UUID,
  p_team_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_player RECORD;
  v_team RECORD;
BEGIN
  -- Lock player
  SELECT * INTO v_player FROM players WHERE id = p_player_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player not found');
  END IF;
  
  IF v_player.status = 'SOLD' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Player is already sold. Undo the sale first.');
  END IF;

  -- Lock team
  SELECT * INTO v_team FROM teams WHERE id = p_team_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Team not found');
  END IF;

  -- Update player
  UPDATE players 
  SET status = 'SOLD', 
      sold_to_team_id = p_team_id,
      sold_price = p_amount,
      updated_at = NOW()
  WHERE id = p_player_id;

  -- Deduct purse
  UPDATE teams 
  SET remaining_purse = remaining_purse - p_amount,
      players_count = players_count + 1,
      updated_at = NOW()
  WHERE id = p_team_id;

  -- Insert squad record
  INSERT INTO squads (team_id, player_id, purchase_price)
  VALUES (p_team_id, p_player_id, p_amount);

  -- Insert transaction
  INSERT INTO transactions (player_id, team_id, amount, transaction_type, notes)
  VALUES (p_player_id, p_team_id, p_amount, 'PURCHASE', 'Admin manual assignment');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PUBLIC')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
