-- Create order_messages table for buyer-farmer communication
CREATE TABLE order_messages (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_message_order FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_message_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_order_messages_order ON order_messages(order_id);
CREATE INDEX idx_order_messages_sender ON order_messages(sender_id);
CREATE INDEX idx_order_messages_created_at ON order_messages(created_at);
