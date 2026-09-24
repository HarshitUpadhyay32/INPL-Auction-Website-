-- =============================================
-- FIX: ADD "PAUSED" TO AUCTIONS STATUS CONSTRAINT
-- Run this in your Supabase SQL Editor
-- =============================================

ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_status_check;

ALTER TABLE auctions ADD CONSTRAINT auctions_status_check 
  CHECK (status IN ('ACTIVE', 'SOLD', 'UNSOLD', 'CANCELLED', 'PAUSED'));
