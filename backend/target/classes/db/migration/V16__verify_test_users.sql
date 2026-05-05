-- Verify test users so they can use the application
-- Update all users to verified status (except those already verified)
UPDATE users SET verification_status = 'verified' WHERE verification_status != 'verified';
