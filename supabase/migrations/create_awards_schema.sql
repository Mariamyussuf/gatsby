-- Create awards categories table
CREATE TABLE IF NOT EXISTS award_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  category_type VARCHAR(50) NOT NULL, -- 'social', 'creative', 'sports', 'entertainment', 'innovation'
  description TEXT,
  display_order INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create nominations table
CREATE TABLE IF NOT EXISTS award_nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_category_id UUID NOT NULL REFERENCES award_categories(id) ON DELETE CASCADE,
  nominee_name VARCHAR(255) NOT NULL,
  nominee_email VARCHAR(255),
  nominee_phone VARCHAR(20),
  nominator_name VARCHAR(255) NOT NULL,
  nominator_email VARCHAR(255) NOT NULL,
  nominator_phone VARCHAR(20),
  nomination_reason TEXT NOT NULL,
  evidence_link VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nominations_category ON award_nominations(award_category_id);
CREATE INDEX IF NOT EXISTS idx_nominations_created_at ON award_nominations(created_at);
CREATE INDEX IF NOT EXISTS idx_nominations_status ON award_nominations(status);

-- Enable RLS
ALTER TABLE award_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_nominations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow anyone to view categories
CREATE POLICY "Enable read access for all users" ON award_categories
  FOR SELECT USING (true);

-- Create RLS policy to allow anyone to insert nominations
CREATE POLICY "Enable insert for all users" ON award_nominations
  FOR INSERT WITH CHECK (true);

-- Create RLS policy to view all nominations (for admin/public view)
CREATE POLICY "Enable read access for all users" ON award_nominations
  FOR SELECT USING (true);

-- Insert award categories
INSERT INTO award_categories (name, category_type, description, display_order) VALUES
-- Social Awards
('Most Influential Male', 'social', 'The male with the most influence in the community', 1),
('Most Influential Female', 'social', 'The female with the most influence in the community', 2),
('Most Popular Male', 'social', 'The most popular male at BUSA', 3),
('Most Popular Female', 'social', 'The most popular female at BUSA', 4),
('Most Fashionable Male', 'social', 'The best-dressed male', 5),
('Most Fashionable Female', 'social', 'The best-dressed female', 6),

-- Creative Awards
('Photographer of the Year', 'creative', 'Outstanding photography work', 7),
('Graphics Designer of the Year', 'creative', 'Best graphics design work', 8),
('Video Editor of the Year', 'creative', 'Best video editing work', 9),

-- Sports Awards
('Male Footballer of the Year', 'sports', 'Best male football player', 10),
('Female Footballer of the Year', 'sports', 'Best female football player', 11),
('Male Basketballer of the Year', 'sports', 'Best male basketball player', 12),
('Female Basketballer of the Year', 'sports', 'Best female basketball player', 13),

-- Entertainment Awards
('Artiste of the Year', 'entertainment', 'Outstanding music artist', 14),
('Dancer of the Year', 'entertainment', 'Best dancer', 15),
('Male Model of the Year', 'entertainment', 'Best male model', 16),
('Female Model of the Year', 'entertainment', 'Best female model', 17),
('Content Creator of the Year', 'entertainment', 'Best content creator', 18),
('Music Producer of the Year', 'entertainment', 'Best music producer', 19),
('DJ of the Year', 'entertainment', 'Best DJ', 20),

-- Innovation Awards
('Entrepreneur of the Year', 'innovation', 'Best entrepreneur', 21),
('Innovation of the Year', 'innovation', 'Best innovation or idea', 22),
('Brand of the Year', 'innovation', 'Best brand', 23),
('Academic Excellence Award', 'innovation', 'Outstanding academic achievement', 24)
ON CONFLICT (name) DO NOTHING;
