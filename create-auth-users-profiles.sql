-- Alternative User Creation Script using Profiles Pattern
-- This version creates users in auth.users and maps them to a profiles table
-- Run this in Supabase SQL Editor

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

-- Create profiles table if it doesn't exist (alternative to users table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer',
    department TEXT,
    business_unit_id UUID REFERENCES business_units(id),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create users in auth.users table
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
    updated_at,
    confirmed_at
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
    '{"full_name":"System Admin"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"John Smith"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"Jane Johnson"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"Mike Wilson"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"Sarah Davis"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"Robert Brown"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"Lisa Martinez"}',
    false,
    NOW(),
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
    updated_at,
    confirmed_at
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
    '{"full_name":"David Garcia"}',
    false,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Now create corresponding entries in the public.profiles table
INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    role,
    department,
    business_unit_id,
    is_active,
    created_at,
    updated_at
) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'System', 'Admin', 'System Admin', 'super_admin', 'Administration', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'john.smith@company.com', 'John', 'Smith', 'John Smith', 'supervisor_auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'jane.johnson@company.com', 'Jane', 'Johnson', 'Jane Johnson', 'supervisor_auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'mike.wilson@company.com', 'Mike', 'Wilson', 'Mike Wilson', 'auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'sarah.davis@company.com', 'Sarah', 'Davis', 'Sarah Davis', 'auditor', 'IT Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('66666666-6666-6666-6666-666666666666', 'robert.brown@company.com', 'Robert', 'Brown', 'Robert Brown', 'reviewer', 'Legal & Compliance', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
    ('77777777-7777-7777-7777-777777777777', 'lisa.martinez@company.com', 'Lisa', 'Martinez', 'Lisa Martinez', 'auditor', 'Financial Audit', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
    ('88888888-8888-8888-8888-888888888888', 'david.garcia@company.com', 'David', 'Garcia', 'David Garcia', 'business_unit_manager', 'Risk Management', '550e8400-e29b-41d4-a716-446655440006', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    business_unit_id = EXCLUDED.business_unit_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update your AuditForm to query profiles instead of users
-- You'll need to change this line in your React component:
-- .from('profiles') instead of .from('users')

-- Verify the users were created successfully
DO $$
DECLARE
    auth_user_count INTEGER;
    profile_count INTEGER;
    business_unit_count INTEGER;
BEGIN
    SELECT count(*) INTO auth_user_count FROM auth.users;
    SELECT count(*) INTO profile_count FROM profiles WHERE is_active = true;
    SELECT count(*) INTO business_unit_count FROM business_units WHERE is_active = true;

    RAISE NOTICE 'Auth users created: %', auth_user_count;
    RAISE NOTICE 'Profiles created: %', profile_count;
    RAISE NOTICE 'Business units available: %', business_unit_count;

    IF profile_count >= 8 THEN
        RAISE NOTICE 'SUCCESS: Sufficient users created for audit system!';
    ELSE
        RAISE WARNING 'WARNING: Not enough users created. Expected at least 8.';
    END IF;
END $$;

-- Display created users for verification
SELECT
    'Created Profile' as type,
    p.id::text as user_id,
    p.email,
    p.full_name,
    p.role,
    p.department,
    bu.name as business_unit_name,
    bu.code as business_unit_code
FROM profiles p
LEFT JOIN business_units bu ON p.business_unit_id = bu.id
WHERE p.is_active = true
ORDER BY p.role, p.first_name;

COMMIT;

-- SUCCESS MESSAGE AND INSTRUCTIONS
SELECT 'SUCCESS: 8 users and 6 business units created using profiles pattern!' as message;

-- IMPORTANT: Update your AuditForm component to use 'profiles' table instead of 'users'
-- Change this line in au5/src/components/audit/AuditForm.tsx:
-- .from('profiles') instead of .from('users')

-- Login credentials for testing:
-- admin@company.com / AdminPass123!
-- john.smith@company.com / AuditorPass123!
-- jane.johnson@company.com / ManagerPass123!
-- mike.wilson@company.com / JuniorPass123!
-- sarah.davis@company.com / ITAuditPass123!
-- robert.brown@company.com / CompliancePass123!
-- lisa.martinez@company.com / FinAuditPass123!
-- david.garcia@company.com / RiskPass123!
