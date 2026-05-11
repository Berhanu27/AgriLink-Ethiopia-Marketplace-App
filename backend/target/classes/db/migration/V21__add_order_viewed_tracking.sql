-- Add tracking for when seller last viewed an order
ALTER TABLE purchase_orders ADD COLUMN seller_viewed_at TIMESTAMP;

-- Create index for faster queries
CREATE INDEX idx_purchase_orders_seller_viewed ON purchase_orders(seller_id, seller_viewed_at);
