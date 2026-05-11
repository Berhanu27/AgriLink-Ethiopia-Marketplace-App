-- Add column to track when admin last viewed verifications
ALTER TABLE users ADD COLUMN last_verification_view TIMESTAMP;

-- Create index for efficient querying
CREATE INDEX idx_users_verification_status ON users(verification_status);
