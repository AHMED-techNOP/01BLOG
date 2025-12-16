-- Add is_banned column to users table (with proper order to avoid NULL constraint errors)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
UPDATE users SET is_banned = FALSE WHERE is_banned IS NULL;
ALTER TABLE users ALTER COLUMN is_banned SET NOT NULL;

-- Add is_hidden column to posts table (with proper order to avoid NULL constraint errors)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
UPDATE posts SET is_hidden = FALSE WHERE is_hidden IS NULL;
ALTER TABLE posts ALTER COLUMN is_hidden SET NOT NULL;
