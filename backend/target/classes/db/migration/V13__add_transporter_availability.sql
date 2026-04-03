ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

UPDATE users
SET is_available = TRUE
WHERE is_available IS NULL;
