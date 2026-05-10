-- Add is_locked column to gala_tables for physical ticket coordination
ALTER TABLE gala_tables ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false;

-- Update all ticket tiers to have uniform pricing of 470 naira (47000 kobo)
UPDATE ticket_tiers SET price_kobo = 47000;
