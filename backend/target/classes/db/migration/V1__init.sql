-- Schema inferred from provided ERD
CREATE TABLE roles (
  role_id        BIGSERIAL PRIMARY KEY,
  user_name      VARCHAR(100) NOT NULL
);

CREATE TABLE users (
  user_id             BIGSERIAL PRIMARY KEY,
  full_name           VARCHAR(200) NOT NULL,
  phone               VARCHAR(50) NOT NULL UNIQUE,
  email               VARCHAR(200),
  verification_status VARCHAR(50) DEFAULT 'unverified'
);

CREATE TABLE user_roles (
  id       BIGSERIAL PRIMARY KEY,
  user_id  BIGINT NOT NULL REFERENCES users(user_id),
  role_id  BIGINT NOT NULL REFERENCES roles(role_id)
);

CREATE TABLE crops (
  crop_id   BIGSERIAL PRIMARY KEY,
  crop_name VARCHAR(200) NOT NULL
);

CREATE TABLE markets (
  market_id   BIGSERIAL PRIMARY KEY,
  market_name VARCHAR(200) NOT NULL
);

CREATE TABLE price_records (
  price_id      BIGSERIAL PRIMARY KEY,
  crop_id       BIGINT NOT NULL REFERENCES crops(crop_id),
  market_id     BIGINT NOT NULL REFERENCES markets(market_id),
  min_price     NUMERIC(12,2),
  max_price     NUMERIC(12,2),
  average_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE demand_posts (
  demand_id BIGSERIAL PRIMARY KEY,
  buyer_id  BIGINT NOT NULL REFERENCES users(user_id),
  crop_id   BIGINT NOT NULL REFERENCES crops(crop_id)
);

CREATE TABLE produce_listings (
  listing_id   BIGSERIAL PRIMARY KEY,
  seller_id    BIGINT NOT NULL REFERENCES users(user_id),
  crop_id      BIGINT NOT NULL REFERENCES crops(crop_id),
  asking_price NUMERIC(12,2) NOT NULL
);

CREATE TABLE matches (
  match_id   BIGSERIAL PRIMARY KEY,
  listing_id BIGINT NOT NULL REFERENCES produce_listings(listing_id),
  demand_id  BIGINT NOT NULL REFERENCES demand_posts(demand_id)
);

CREATE TABLE transactions (
  transaction_id BIGSERIAL PRIMARY KEY,
  buyer_id       BIGINT NOT NULL REFERENCES users(user_id),
  seller_id      BIGINT NOT NULL REFERENCES users(user_id),
  agreed_price   NUMERIC(12,2) NOT NULL
);

CREATE TABLE delivery_requests (
  delivery_id    BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(transaction_id),
  transporter_id BIGINT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE disputes (
  dispute_id     BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(transaction_id),
  transporter_id BIGINT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE ratings (
  rating_id BIGSERIAL PRIMARY KEY,
  rater_id  BIGINT NOT NULL REFERENCES users(user_id),
  score     INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5)
);

CREATE TABLE message_threads (
  thread_id BIGSERIAL PRIMARY KEY,
  buyer_id  BIGINT NOT NULL REFERENCES users(user_id),
  seller_id BIGINT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE messages (
  message_id BIGSERIAL PRIMARY KEY,
  thread_id  BIGINT NOT NULL REFERENCES message_threads(thread_id),
  content    TEXT NOT NULL
);

CREATE TABLE notifications (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id         BIGINT NOT NULL REFERENCES users(user_id)
);

CREATE TABLE audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL
);
