-- Migration script to add 'on_hold' status to existing audit tables
-- Run this if you already have an existing database with the audits table

-- This script is compatible with PostgreSQL 9.6+ and Supabase

BEGIN;

-- Check current constraint definition
SELECT
    conname as constraint_name,
    CASE
        WHEN pg_get_constraintdef(oid) LIKE '%on_hold%' THEN 'Already includes on_hold'
        ELSE 'Needs update'
    END as status
FROM pg_constraint
WHERE conrelid = 'audits'::regclass
AND conname = 'audits_status_check';

-- Drop existing constraint if it exists
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_status_check;

-- Add new constraint with 'on_hold' status
ALTER TABLE audits ADD CONSTRAINT audits_status_check CHECK (status IN (
    'draft', 'planning', 'in_progress', 'testing',
    'reporting', 'completed', 'cancelled', 'on_hold'
));

-- Optional: Update any existing audits that might need the new status
-- Uncomment the line below if you have audits that should be marked as on_hold
-- UPDATE audits SET status = 'on_hold' WHERE status = 'some_old_status_if_needed';

-- Verify the constraint was added successfully
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'audits'::regclass
AND conname = 'audits_status_check';

-- Test that the new status works
DO $$
BEGIN
    -- This should succeed without error
    PERFORM 1 WHERE 'on_hold'::text IN ('draft', 'planning', 'in_progress', 'testing', 'reporting', 'completed', 'cancelled', 'on_hold');
    RAISE NOTICE 'Migration completed successfully! The on_hold status is now available.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END $$;

COMMIT;

-- Instructions:
-- 1. Connect to your Supabase database
-- 2. Run this script in the SQL editor or via psql
-- 3. Check the output to confirm the constraint was updated
-- 4. The 'on_hold' status is now available for audit records
