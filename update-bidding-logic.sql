-- =============================================
-- UPDATE: NEW BIDDING LOGIC
-- Run this in your Supabase SQL Editor
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
