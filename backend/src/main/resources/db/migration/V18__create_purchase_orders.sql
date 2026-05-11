-- Create purchase_orders table for buyer-farmer purchase workflow
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    listing_id BIGINT,
    crop_name VARCHAR(255) NOT NULL,
    requested_quantity VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    offered_price DECIMAL(10, 2),
    buyer_message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    farmer_response TEXT,
    available_quantity VARCHAR(255),
    payment_screenshot_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_order_buyer FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_seller FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_listing FOREIGN KEY (listing_id) REFERENCES produce_listings(listing_id) ON DELETE SET NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_purchase_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_orders_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_purchase_orders_buyer ON purchase_orders(buyer_id);
CREATE INDEX idx_purchase_orders_seller ON purchase_orders(seller_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at);
