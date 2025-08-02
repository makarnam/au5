-- Script to add sample users and business units for audit system
-- This version handles foreign key constraints safely
-- Run this in Supabase SQL Editor to ensure you have the required reference data

BEGIN;

-- First, let's check the users table structure to understand constraints
DO $$
BEGIN
    -- Check if users table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Users table exists, proceeding with data insertion...';
    ELSE
        RAISE EXCEPTION 'Users table does not exist. Please run the database setup first.';
    END IF;
END $$;

-- Insert sample business units first (they have no dependencies)
INSERT INTO business_units (id, name, code, description, is_active, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'IT', 'IT Department managing technology infrastructure', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Finance', 'FIN', 'Finance Department managing financial operations', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Human Resources', 'HR', 'HR Department managing human capital', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'OPS', 'Operations Department managing day-to-day activities', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Now insert users, handling potential foreign key constraints
-- We'll insert users without manager references first, then update if needed
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
)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'System', 'Admin', 'admin', 'Administration', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'auditor1@company.com', 'John', 'Smith', 'supervisor_auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'auditor2@company.com', 'Jane', 'Johnson', 'auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'auditor3@company.com', 'Mike', 'Wilson', 'auditor', 'Internal Audit', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', 'manager1@company.com', 'Sarah', 'Davis', 'business_unit_manager', 'Finance', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    business_unit_id = EXCLUDED.business_unit_id,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Alternative approach: Insert into auth.users first if the constraint is with auth.users
-- This handles the case where users table references auth.users
DO $$
BEGIN
    -- Check if we need to create entries in auth.users
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'users'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE '%auth%'
    ) THEN
        -- If there's a foreign key to auth.users, we need to handle it differently
        RAISE NOTICE 'Detected foreign key constraint to auth.users. You may need to create these users through Supabase Auth instead.';

        -- For now, we'll try to ensure the current authenticated user exists
        IF auth.uid() IS NOT NULL THEN
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
            )
            VALUES (
                auth.uid(),
                COALESCE(auth.email(), 'current-user@company.com'),
                'Current',
                'User',
                'admin',
                'Administration',
                '550e8400-e29b-41d4-a716-446655440001',
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                is_active = true,
                updated_at = NOW();

            RAISE NOTICE 'Added current authenticated user to users table';
        END IF;
    END IF;
END $$;

-- Verify the data was inserted successfully
DO $$
DECLARE
    bu_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT count(*) INTO bu_count FROM business_units WHERE is_active = true;
    SELECT count(*) INTO user_count FROM users WHERE is_active = true;

    RAISE NOTICE 'Business Units available: %', bu_count;
    RAISE NOTICE 'Users available: %', user_count;

    IF bu_count = 0 THEN
        RAISE WARNING 'No business units were created!';
    END IF;

    IF user_count = 0 THEN
        RAISE WARNING 'No users were created! You may need to create users through Supabase Auth first.';
    END IF;
END $$;

-- Show the available business units
SELECT
    'Business Unit' as type,
    id::text as id,
    name,
    code,
    is_active
FROM business_units
WHERE is_active = true
ORDER BY name;

-- Show the available users
SELECT
    'User' as type,
    id::text as id,
    (first_name || ' ' || last_name) as name,
    email,
    role,
    is_active
FROM users
WHERE is_active = true
ORDER BY first_name;

COMMIT;

-- Instructions for troubleshooting:
--
-- If you get foreign key constraint errors:
-- 1. The users table might reference auth.users - create users through Supabase Auth first
-- 2. There might be a manager_id or supervisor_id field that references other users
-- 3. Run this query to check constraints:
--    SELECT * FROM information_schema.table_constraints WHERE table_name = 'users';
--
-- Alternative minimal approach if the above fails:
-- Just ensure you have at least one business unit and use your authenticated user:
--
-- INSERT INTO business_units (name, code, description, is_active)
-- VALUES ('Test Department', 'TEST', 'Test department for audits', true);
--
-- Then create audits using your actual authenticated user ID and the business unit ID
