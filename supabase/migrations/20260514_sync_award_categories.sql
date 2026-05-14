-- ============================================================
-- Sync award_categories with current frontend AWARD_GROUPS
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Step 1: Remove old categories that no longer match any frontend name.
-- This will CASCADE-delete any nominations linked to them.
-- If you want to keep old nominations, skip this step (but IDs will still mismatch).
DELETE FROM award_categories
WHERE name NOT IN (
  'Brand of the Year',
  'Innovation of the Year',
  'Entrepreneur of the Year',
  'Freshest Fresher of the Year',
  'Most Fashionable (Female)',
  'Most Fashionable (Male)',
  'Rookie of the Year',
  'Most Influential (Female)',
  'Most Influential (Male)',
  'Most Popular (Male)',
  'Most Popular (Female)',
  'Spotlight Award',
  'Most Sociable (Male)',
  'Most Sociable (Female)',
  'Clique of the Year',
  'Talent of the Year',
  'Content Creator of the Year',
  'Artiste of the Year',
  'DJ / Music Producer of the Year',
  'Icon 360',
  'Next Rated',
  'Sports Personality (Male)',
  'Sports Personality (Female)',
  'Footballer of the Year (Male)',
  'Footballer of the Year (Female)',
  'Basketball Player of the Year (Female)',
  'Basketball Player of the Year (Male)',
  'Graphic Designer of the Year',
  'Videographer of the Year',
  'Photographer of the Year',
  'Academic Excellence Award',
  'Most Outstanding Student of the Year',
  'Distinguished Executive (Female)',
  'Distinguished Executive (Male)',
  'Lecturer of the Year'
);

-- Step 2: Insert all current categories.
-- ON CONFLICT (name) DO NOTHING ensures existing matches are kept.
INSERT INTO award_categories (name, category_type, description, display_order) VALUES
  -- Innovation Awards
  ('Brand of the Year',                  'innovation',    'Awarded to the most impactful and recognized student brand or business on campus.', 1),
  ('Innovation of the Year',             'innovation',    'This award acknowledges the individual with the best invention, creation or discovery that solves a problem in our immediate community.', 2),
  ('Entrepreneur of the Year',           'innovation',    'Recognizing a student who has shown excellence in business, leadership, and entrepreneurship.', 3),

  -- Social Awards
  ('Freshest Fresher of the Year',       'social',        'Awarded to the most admired and outstanding fresher on campus.', 4),
  ('Most Fashionable (Female)',          'social',        'Recognizing the female student with the best sense of style and fashion presence.', 5),
  ('Most Fashionable (Male)',            'social',        'Recognizing the male student with the best sense of style and fashion presence.', 6),
  ('Rookie of the Year',                 'social',        'Awarded to a fresher who made a strong impact within a short period.', 7),
  ('Most Influential (Female)',          'social',        'For a female student whose presence, voice, and actions positively influence others.', 8),
  ('Most Influential (Male)',            'social',        'For a male student whose presence, voice, and actions positively influence others.', 9),
  ('Most Popular (Male)',                'social',        'Awarded to the male student widely known and admired across campus.', 10),
  ('Most Popular (Female)',              'social',        'Awarded to the female student widely known and admired across campus.', 11),
  ('Spotlight Award',                    'social',        'Given to a student who consistently stands out and captures attention positively.', 12),
  ('Most Sociable (Male)',               'social',        'Recognizing a male student known for friendliness, connections, and social engagement.', 13),
  ('Most Sociable (Female)',             'social',        'Recognizing a female student known for friendliness, connections, and social engagement.', 14),
  ('Clique of the Year',                 'social',        'An award given to the most recognized, influential, talked about, active, and admired friend group or social circle in the school.', 15),

  -- Entertainment Awards
  ('Talent of the Year',                 'entertainment', 'Recognizing the most outstanding and gifted talent in any entertainment field.', 16),
  ('Content Creator of the Year',        'entertainment', 'This award celebrates the creator who effectively leveraged resources to deliver significant value through the creation of content.', 17),
  ('Artiste of the Year',                'entertainment', 'Given to the most outstanding music artiste on campus.', 18),
  ('DJ / Music Producer of the Year',    'entertainment', 'From mere sounds to revolutionary music. This award celebrates the music wizard, possessing the talent to craft and innovate delightful melodies.', 19),
  ('Icon 360',                           'entertainment', 'This award recognizes the individual who has demonstrated exceptional involvement in campus activities, excluding executives, and has made outstanding contributions to the university community.', 20),
  ('Next Rated',                         'entertainment', 'Given to a promising fresher showing great entertainment potential.', 21),

  -- Sports Awards
  ('Sports Personality (Male)',          'sports',        'Recognizing a male student with exceptional impact in sports and fitness activities.', 22),
  ('Sports Personality (Female)',        'sports',        'Recognizing a female student with exceptional impact in sports and fitness activities.', 23),
  ('Footballer of the Year (Male)',      'sports',        'Awarded to the best performing male football player on campus.', 24),
  ('Footballer of the Year (Female)',    'sports',        'Awarded to the best performing female football player on campus.', 25),
  ('Basketball Player of the Year (Female)', 'sports',   'Recognizing the most outstanding female basketball player.', 26),
  ('Basketball Player of the Year (Male)',   'sports',   'Recognizing the most outstanding male basketball player.', 27),

  -- Creative Awards
  ('Graphic Designer of the Year',       'creative',     'Awarded to the most creative and impactful graphic designer on campus.', 28),
  ('Videographer of the Year',           'creative',     'Recognizing excellence in video creation, editing, and storytelling.', 29),
  ('Photographer of the Year',           'creative',     'Given to the student with exceptional photography skills and creativity.', 30),

  -- Leadership Awards
  ('Academic Excellence Award',          'leadership',   'Awarded to a student with outstanding academic performance and consistency.', 31),
  ('Most Outstanding Student of the Year', 'leadership', 'Recognizing an exceptional student with overall excellence and impact.', 32),
  ('Distinguished Executive (Female)',   'leadership',   'This award honors the commitment and diligence demonstrated in serving the student body and the school community as a whole.', 33),
  ('Distinguished Executive (Male)',     'leadership',   'This award honors the commitment and diligence demonstrated in serving the student body and the school community as a whole.', 34),
  ('Lecturer of the Year',              'leadership',   'Recognizing the lecturer who made the greatest impact on students academically and personally.', 35)
ON CONFLICT (name) DO NOTHING;
