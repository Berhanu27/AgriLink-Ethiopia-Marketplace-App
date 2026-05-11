-- Create delivery_messages table for chat between buyers and transporters
CREATE TABLE delivery_messages (
    id BIGSERIAL PRIMARY KEY,
    delivery_request_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_messages_request FOREIGN KEY (delivery_request_id) REFERENCES delivery_requests(request_id) ON DELETE CASCADE,
    CONSTRAINT fk_delivery_messages_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_delivery_messages_request ON delivery_messages(delivery_request_id);
CREATE INDEX idx_delivery_messages_sender ON delivery_messages(sender_id);
CREATE INDEX idx_delivery_messages_read ON delivery_messages(is_read);
CREATE INDEX idx_delivery_messages_created ON delivery_messages(created_at);
