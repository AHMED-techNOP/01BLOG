-- Add is_banned column to users table (with proper order to avoid NULL constraint errors)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
UPDATE users SET is_banned = FALSE WHERE is_banned IS NULL;
ALTER TABLE users ALTER COLUMN is_banned SET NOT NULL;
