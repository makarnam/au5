-- Corrected User Creation Script for Audit System
-- Creates users in auth.users table and maps them to public users table
-- Run this in Supabase SQL Editor with appropriate permissions

BEGIN;

-- First, ensure business units exist
INSERT INTO business_units (id, name, code, description, is_active, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'IT', 'IT Department managing technology infrastructure', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Finance', 'FIN', 'Finance Department managing financial operations', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Human Resources', 'HR', 'HR Department managing human capital', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'OPS', 'Operations Department managing day-to-day activities', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Legal & Compliance', 'LEGAL', 'Legal and Compliance Department', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'Risk Management', 'RISK', 'Risk Management Department', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- User 1: System Admin
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@company.com',
    crypt('AdminPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"System Admin","department":"Administration"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 2: Senior Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'john.smith@company.com',
    crypt('AuditorPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"John Smith","department":"Internal Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 3: Audit Manager
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'jane.johnson@company.com',
    crypt('ManagerPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Jane Johnson","department":"Internal Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 4: Junior Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'mike.wilson@company.com',
    crypt('JuniorPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mike Wilson","department":"Internal Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 5: IT Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'sarah.davis@company.com',
    crypt('ITAuditPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sarah Davis","department":"IT Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 6: Compliance Officer
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '66666666-6666-6666-6666-666666666666',
    'authenticated',
    'authenticated',
    'robert.brown@company.com',
    crypt('CompliancePass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Robert Brown","department":"Legal & Compliance"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 7: Financial Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '77777777-7777-7777-7777-777777777777',
    'authenticated',
    'authenticated',
    'lisa.martinez@company.com',
    crypt('FinAuditPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Lisa Martinez","department":"Financial Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 8: Risk Manager
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '88888888-8888-8888-8888-888888888888',
    'authenticated',
    'authenticated',
    'david.garcia@company.com',
    crypt('RiskPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"David Garcia","department":"Risk Management"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 9: Operations Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '99999999-9999-9999-9999-999999999999',
    'authenticated',
    'authenticated',
    'emily.anderson@company.com',
    crypt('OpsAuditPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Emily Anderson","department":"Operations Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- User 10: External Auditor
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated',
    'authenticated',
    'thomas.white@external.com',
    crypt('ExtAuditPass123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Thomas White","department":"External Audit"}',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Now create corresponding entries in the public.users table
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    role,
    department,
    business_unit_id,
    is_active,
    created_at,
    updated_at
) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'System', 'Admin', 'super_admin', 'Administration', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'john.smith@company.com', 'John', 'Smith', 'supervisor_auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'jane.johnson@company.com', 'Jane', 'Johnson', 'supervisor_auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'mike.wilson@company.com', 'Mike', 'Wilson', 'auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'sarah.davis@company.com', 'Sarah', 'Davis', 'auditor', 'IT Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', 'robert.brown@company.com', 'Robert', 'Brown', 'reviewer', 'Legal & Compliance', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
    ('77777777-7777-7777-7777-777777777777', 'lisa.martinez@company.com', 'Lisa', 'Martinez', 'auditor', 'Financial Audit', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
    ('88888888-8888-8888-8888-888888888888', 'david.garcia@company.com', 'David', 'Garcia', 'business_unit_manager', 'Risk Management', '550e8400-e29b-41d4-a716-446655440006', true, NOW(), NOW()),
    ('99999999-9999-9999-9999-999999999999', 'emily.anderson@company.com', 'Emily', 'Anderson', 'auditor', 'Operations Audit', '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'thomas.white@external.com', 'Thomas', 'White', 'auditor', 'External Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    business_unit_id = EXCLUDED.business_unit_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verify the users were created successfully
DO $$
DECLARE
    auth_user_count INTEGER;
    public_user_count INTEGER;
    business_unit_count INTEGER;
BEGIN
    SELECT count(*) INTO auth_user_count FROM auth.users WHERE email LIKE '%@company.com' OR email LIKE '%@external.com';
    SELECT count(*) INTO public_user_count FROM users WHERE is_active = true;
    SELECT count(*) INTO business_unit_count FROM business_units WHERE is_active = true;

    RAISE NOTICE 'Auth users created: %', auth_user_count;
    RAISE NOTICE 'Public users created: %', public_user_count;
    RAISE NOTICE 'Business units available: %', business_unit_count;

    IF public_user_count >= 10 THEN
        RAISE NOTICE 'SUCCESS: All 10 users created for audit system!';
    ELSE
        RAISE WARNING 'WARNING: Not all users were created. Expected 10, got %.', public_user_count;
    END IF;
END $$;

-- Display created users for verification
SELECT
    'Created User' as type,
    u.id::text as user_id,
    u.email,
    u.first_name || ' ' || u.last_name as full_name,
    u.role,
    u.department,
    bu.name as business_unit_name,
    bu.code as business_unit_code
FROM users u
LEFT JOIN business_units bu ON u.business_unit_id = bu.id
WHERE u.is_active = true
ORDER BY
    CASE u.role
        WHEN 'super_admin' THEN 1
        WHEN 'supervisor_auditor' THEN 2
        WHEN 'auditor' THEN 3
        WHEN 'reviewer' THEN 4
        WHEN 'business_unit_manager' THEN 5
        ELSE 6
    END,
    u.first_name;

-- Display available business units
SELECT
    'Business Unit' as type,
    id::text as id,
    name,
    code,
    description
FROM business_units
WHERE is_active = true
ORDER BY name;

COMMIT;

-- SUCCESS MESSAGE AND LOGIN CREDENTIALS
SELECT 'SUCCESS: 10 users and 6 business units created successfully!' as message;

-- Login credentials for testing (password format: [Role]Pass123!)
-- admin@company.com / AdminPass123!
-- john.smith@company.com / AuditorPass123!
-- jane.johnson@company.com / ManagerPass123!
-- mike.wilson@company.com / JuniorPass123!
-- sarah.davis@company.com / ITAuditPass123!
-- robert.brown@company.com / CompliancePass123!
-- lisa.martinez@company.com / FinAuditPass123!
-- david.garcia@company.com / RiskPass123!
-- emily.anderson@company.com / OpsAuditPass123!
-- thomas.white@external.com / ExtAuditPass123!

-- INSTRUCTIONS:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Users are created in both auth.users and public.users tables
-- 3. Business units are created with proper UUIDs
-- 4. You can now log in with any of the above credentials
-- 5. The audit creation form will now show real users and business units
-- 6. No more UUID syntax errors should occur
