-- Debug script to check database state for audit creation issues
-- Run this in Supabase SQL Editor to diagnose problems

-- ==============================================
-- 1. Check if audits table exists and structure
-- ==============================================
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'audits'
ORDER BY ordinal_position;

-- ==============================================
-- 2. Check audit status constraint
-- ==============================================
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'audits'::regclass
AND conname = 'audits_status_check';

-- ==============================================
-- 3. Check if required reference tables exist
-- ==============================================
-- Check business_units table
SELECT 'business_units' as table_name, count(*) as record_count
FROM business_units
UNION ALL
-- Check users table
SELECT 'users' as table_name, count(*) as record_count
FROM users;

-- ==============================================
-- 4. Check sample business units (needed for audit creation)
-- ==============================================
SELECT
    id,
    name,
    code,
    is_active
FROM business_units
WHERE is_active = true
LIMIT 5;

-- ==============================================
-- 5. Check sample users (needed for lead_auditor_id)
-- ==============================================
SELECT
    id,
    first_name,
    last_name,
    email,
    role,
    is_active
FROM users
WHERE is_active = true
LIMIT 5;

-- ==============================================
-- 6. Check current user authentication
-- ==============================================
SELECT
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    auth.role() as current_user_role;

-- ==============================================
-- 7. Check RLS policies on audits table
-- ==============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'audits';

-- ==============================================
-- 8. Test a simple insert (will show exact error)
-- ==============================================
-- This will attempt to insert a test audit
-- Replace the UUIDs below with actual IDs from your database

DO $$
DECLARE
    test_business_unit_id UUID;
    test_user_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user
    SELECT auth.uid() INTO current_user_id;

    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No authenticated user found';
    END IF;

    -- Get a business unit ID
    SELECT id INTO test_business_unit_id
    FROM business_units
    WHERE is_active = true
    LIMIT 1;

    IF test_business_unit_id IS NULL THEN
        RAISE EXCEPTION 'No active business units found';
    END IF;

    -- Get a user ID for lead auditor
    SELECT id INTO test_user_id
    FROM users
    WHERE is_active = true
    LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'No active users found';
    END IF;

    RAISE NOTICE 'Current user ID: %', current_user_id;
    RAISE NOTICE 'Test business unit ID: %', test_business_unit_id;
    RAISE NOTICE 'Test user ID: %', test_user_id;

    -- Attempt the insert
    INSERT INTO audits (
        title,
        description,
        audit_type,
        status,
        business_unit_id,
        lead_auditor_id,
        start_date,
        end_date,
        planned_hours,
        objectives,
        scope,
        methodology,
        created_by
    ) VALUES (
        'DEBUG TEST AUDIT - DELETE ME',
        'This is a test audit created by debug script',
        'internal',
        'draft',
        test_business_unit_id,
        test_user_id,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        40,
        ARRAY['Test objective'],
        'Test scope',
        'Test methodology',
        current_user_id
    );

    RAISE NOTICE 'SUCCESS: Test audit inserted successfully!';

    -- Clean up the test record
    DELETE FROM audits WHERE title = 'DEBUG TEST AUDIT - DELETE ME';
    RAISE NOTICE 'Test audit cleaned up';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
        RAISE NOTICE 'ERROR CODE: %', SQLSTATE;
END $$;

-- ==============================================
-- 9. Check for missing indexes that might cause issues
-- ==============================================
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('audits', 'business_units', 'users')
ORDER BY tablename, indexname;

-- ==============================================
-- 10. Summary of potential issues
-- ==============================================
SELECT
    CASE
        WHEN (SELECT count(*) FROM business_units WHERE is_active = true) = 0
        THEN 'ERROR: No active business units found'
        WHEN (SELECT count(*) FROM users WHERE is_active = true) = 0
        THEN 'ERROR: No active users found'
        WHEN auth.uid() IS NULL
        THEN 'ERROR: User not authenticated'
        WHEN (SELECT count(*) FROM pg_constraint WHERE conrelid = 'audits'::regclass AND conname = 'audits_status_check') = 0
        THEN 'ERROR: Missing audit status constraint'
        ELSE 'OK: Basic requirements met'
    END as status_check;
