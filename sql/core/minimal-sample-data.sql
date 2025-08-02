-- Minimal sample data script - fallback option for foreign key constraint issues
-- This creates the absolute minimum data needed for audit creation

BEGIN;

-- Step 1: Create business units (these should always work)
INSERT INTO business_units (name, code, description, is_active, created_at, updated_at)
VALUES
    ('Test Department', 'TEST', 'Test department for audit creation', true, NOW(), NOW()),
    ('IT Department', 'IT', 'Information Technology', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Step 2: Check what users already exist
DO $$
DECLARE
    current_user_id UUID;
    user_count INTEGER;
BEGIN
    -- Get current authenticated user
    current_user_id := auth.uid();

    -- Count existing active users
    SELECT count(*) INTO user_count FROM users WHERE is_active = true;

    RAISE NOTICE 'Current user ID: %', current_user_id;
    RAISE NOTICE 'Existing active users: %', user_count;

    -- If we have a current user, ensure they exist in users table
    IF current_user_id IS NOT NULL THEN
        INSERT INTO users (
            id,
            email,
            first_name,
            last_name,
            role,
            is_active,
            created_at,
            updated_at
        )
        VALUES (
            current_user_id,
            COALESCE(auth.email(), 'user@company.com'),
            'Current',
            'User',
            'admin',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            is_active = true,
            role = CASE
                WHEN users.role IN ('admin', 'super_admin') THEN users.role
                ELSE 'admin'
            END,
            updated_at = NOW();

        RAISE NOTICE 'Current user added/updated in users table';
    ELSE
        RAISE NOTICE 'No authenticated user found - you may need to log in first';
    END IF;
END $$;

-- Step 3: Show what we have available
SELECT 'BUSINESS_UNITS' as table_name, count(*)::text as count FROM business_units WHERE is_active = true
UNION ALL
SELECT 'USERS' as table_name, count(*)::text as count FROM users WHERE is_active = true;

-- Show available business units for audit creation
SELECT
    'Available Business Unit:' as info,
    id::text as id,
    name,
    code
FROM business_units
WHERE is_active = true
ORDER BY name;

-- Show available users for audit creation
SELECT
    'Available User:' as info,
    id::text as id,
    (first_name || ' ' || last_name) as name,
    email,
    role
FROM users
WHERE is_active = true
ORDER BY first_name;

COMMIT;

-- SUCCESS MESSAGE
SELECT 'SUCCESS: Minimal sample data created. You can now create audits!' as message;

-- INSTRUCTIONS:
-- 1. Run this script in Supabase SQL Editor
-- 2. Make sure you're logged into your app first (so auth.uid() returns your user ID)
-- 3. This creates minimal data needed for audit creation
-- 4. If you still get foreign key errors, check the users table constraints with:
--    SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'users';
