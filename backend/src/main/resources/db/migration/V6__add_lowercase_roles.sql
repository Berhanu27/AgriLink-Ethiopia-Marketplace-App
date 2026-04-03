-- Add lowercase role names for Spring Security compatibility
INSERT INTO roles (user_name) VALUES 
    ('farmer'),
    ('buyer'),
    ('transporter'),
    ('cooperative'),
    ('admin')
ON CONFLICT DO NOTHING;

-- Assign lowercase admin role to existing admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.phone = '+251900000000' 
  AND r.user_name = 'admin'
ON CONFLICT DO NOTHING;
