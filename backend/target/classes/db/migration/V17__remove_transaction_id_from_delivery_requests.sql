-- Remove transaction_id column from delivery_requests table as it's not used in the entity model
ALTER TABLE delivery_requests DROP COLUMN IF EXISTS transaction_id;
