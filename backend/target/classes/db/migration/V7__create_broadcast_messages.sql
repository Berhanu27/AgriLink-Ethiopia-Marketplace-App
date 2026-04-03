CREATE TABLE IF NOT EXISTS broadcast_messages (
    broadcast_id BIGSERIAL PRIMARY KEY,
    crop_name VARCHAR(200) NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'unit',
    note TEXT,
    image_url VARCHAR(2048),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_messages_created_at ON broadcast_messages(created_at DESC);
