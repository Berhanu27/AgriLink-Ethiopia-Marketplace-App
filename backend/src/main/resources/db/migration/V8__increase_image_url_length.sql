-- Increase image_url column size to support larger base64 encoded images
ALTER TABLE broadcast_messages ALTER COLUMN image_url TYPE VARCHAR(10000);
