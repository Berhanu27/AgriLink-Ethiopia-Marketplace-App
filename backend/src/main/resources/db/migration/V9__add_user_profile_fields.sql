-- Add extended profile fields for role-specific registration details
ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_capacity VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cooperative_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_count INTEGER;
