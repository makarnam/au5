-- Promote First User to Super Admin
-- Run this script after the first user signs up to make them a super admin

-- This will promote the first user in the users table to super_admin role
-- Replace 'your-email@example.com' with the actual email of the user you want to promote

-- Option 1: Promote by email (recommended)
UPDATE users
SET role = 'super_admin',
    department = 'Administration',
    business_unit_id = '550e8400-e29b-41d4-a716-446655440001'
WHERE email = 'your-email@example.com';

-- Option 2: Promote the first user that signed up (if you don't know the email)
-- Uncomment the lines below and comment the above if needed
-- UPDATE users
-- SET role = 'super_admin',
--     department = 'Administration',
--     business_unit_id = '550e8400-e29b-41d4-a716-446655440001'
-- WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);

-- Verify the update
SELECT id, email, first_name, last_name, role, department
FROM users
WHERE role = 'super_admin';
