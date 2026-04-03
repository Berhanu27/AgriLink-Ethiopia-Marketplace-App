-- Insert default roles
INSERT INTO roles (user_name) VALUES 
    ('farmer'),
    ('buyer'),
    ('transporter'),
    ('cooperative'),
    ('admin')
ON CONFLICT DO NOTHING;

-- Also insert uppercase versions for backward compatibility
INSERT INTO roles (user_name) VALUES 
    ('FARMER'),
    ('BUYER'),
    ('TRANSPORTER'),
    ('COOPERATIVE'),
    ('ADMIN')
ON CONFLICT DO NOTHING;

-- Create default admin user
-- Password: admin123456 (hashed with BCrypt)
-- You should change this password after first login!
INSERT INTO users (full_name, phone, email, verification_status, password_hash)
VALUES (
    'System Administrator',
    '+251900000000',
    'admin@agrilink.et',
    'verified',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
)
ON CONFLICT (phone) DO NOTHING;

-- Assign ADMIN role to the admin user (uppercase)
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.phone = '+251900000000' 
  AND r.user_name = 'ADMIN'
ON CONFLICT DO NOTHING;

-- Also assign lowercase admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.phone = '+251900000000' 
  AND r.user_name = 'admin'
ON CONFLICT DO NOTHING;
