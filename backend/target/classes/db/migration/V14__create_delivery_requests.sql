CREATE TABLE IF NOT EXISTS delivery_requests (
    request_id BIGSERIAL PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    transporter_id BIGINT NOT NULL,
    pickup_location VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    cargo_type VARCHAR(100) NOT NULL,
    weight_value NUMERIC(12,2),
    weight_unit VARCHAR(20),
    preferred_time VARCHAR(100),
    price_offer NUMERIC(12,2),
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    reject_reason VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='delivery_requests' AND column_name='buyer_id') THEN
        ALTER TABLE delivery_requests ADD COLUMN buyer_id BIGINT NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='delivery_requests' AND column_name='transporter_id') THEN
        ALTER TABLE delivery_requests ADD COLUMN transporter_id BIGINT NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_delivery_requests_buyer_id ON delivery_requests (buyer_id);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_transporter_id ON delivery_requests (transporter_id);
