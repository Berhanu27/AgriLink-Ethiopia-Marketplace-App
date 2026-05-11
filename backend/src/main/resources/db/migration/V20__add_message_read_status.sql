-- Add read status tracking to order_messages
ALTER TABLE order_messages ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for faster unread message queries
CREATE INDEX idx_order_messages_read_status ON order_messages(order_id, is_read);
