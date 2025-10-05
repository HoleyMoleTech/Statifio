-- Grant admin access to the admin user
-- This script sets the is_admin flag to true for the admin@statifio.com user

UPDATE users 
SET is_admin = TRUE, updated_at = NOW()
WHERE email = 'admin@statifio.com';

-- Verify the update
SELECT id, email, username, is_admin, is_premium 
FROM users 
WHERE email = 'admin@statifio.com';
