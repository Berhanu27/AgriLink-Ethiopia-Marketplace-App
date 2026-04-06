-- Add missing columns to delivery_requests table
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS request_id BIGSERIAL UNIQUE;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(200);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS destination VARCHAR(200);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS cargo_type VARCHAR(100);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS weight_value NUMERIC(12,2);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(20);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(100);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS price_offer NUMERIC(12,2);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending';
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS reject_reason VARCHAR(300);
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE delivery_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Set request_id as primary key if not already set
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'delivery_requests' AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE delivery_requests ADD PRIMARY KEY (request_id);
    END IF;
END $$;
