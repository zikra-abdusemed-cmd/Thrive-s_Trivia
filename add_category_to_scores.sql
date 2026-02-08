-- ============================================
-- Add category_id to scores table
-- ============================================
-- This allows us to track which categories users have played
-- ============================================

-- Add category_id column to scores table
ALTER TABLE scores 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS scores_category_id_idx ON scores(category_id);
CREATE INDEX IF NOT EXISTS scores_user_category_idx ON scores(user_id, category_id);

-- ============================================
-- After running this, update your play page code
-- to save category_id when saving scores
-- ============================================

