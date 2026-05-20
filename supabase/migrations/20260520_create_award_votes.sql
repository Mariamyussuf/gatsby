-- ============================================================
-- Award Votes table for the BUSA Great Gatsby Gala
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS award_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_category_name VARCHAR(255) NOT NULL,
  nominee_name VARCHAR(255) NOT NULL,
  voter_name VARCHAR(255) NOT NULL,
  voter_matric VARCHAR(50) NOT NULL,
  voter_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- One vote per category per student
  UNIQUE (voter_matric, award_category_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_votes_category ON award_votes(award_category_name);
CREATE INDEX IF NOT EXISTS idx_votes_matric ON award_votes(voter_matric);
CREATE INDEX IF NOT EXISTS idx_votes_nominee ON award_votes(nominee_name);

-- Enable RLS
ALTER TABLE award_votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert votes
CREATE POLICY "Enable insert for all users" ON award_votes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read votes (for tallying)
CREATE POLICY "Enable read access for all users" ON award_votes
  FOR SELECT USING (true);
