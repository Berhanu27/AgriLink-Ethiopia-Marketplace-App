-- Add updated_at and is_edited columns to delivery_messages table
ALTER TABLE delivery_messages
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT FALSE;

-- Add updated_at and is_edited columns to order_messages table
ALTER TABLE order_messages
ADD COLUMN updated_at TIMESTAMP,
ADD COLUMN is_edited BOOLEAN NOT NULL DEFAULT FALSE;
