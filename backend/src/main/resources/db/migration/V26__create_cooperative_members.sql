-- Members contributed by a cooperative, pooled into bulk listings
CREATE TABLE IF NOT EXISTS cooperative_members (
    member_id BIGSERIAL PRIMARY KEY,
    cooperative_id BIGINT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    crop_name VARCHAR(200) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    price_per_unit NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cooperative_member_cooperative FOREIGN KEY (cooperative_id)
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cooperative_members_cooperative
    ON cooperative_members(cooperative_id);
