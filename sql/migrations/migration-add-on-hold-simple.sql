-- Simple migration script to add 'on_hold' status to existing audit tables
-- Run this if you already have an existing database with the audits table

BEGIN;

-- First, check if the constraint already allows 'on_hold'
DO $$
DECLARE
    constraint_def text;
BEGIN
    -- Get the current constraint definition
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conrelid = 'audits'::regclass
    AND conname = 'audits_status_check';

    -- Check if 'on_hold' is already in the constraint
    IF constraint_def IS NOT NULL AND constraint_def LIKE '%on_hold%' THEN
        RAISE NOTICE 'Constraint already includes on_hold status. No changes needed.';
    ELSE
        -- Drop the existing constraint
        RAISE NOTICE 'Updating audit status constraint to include on_hold...';
        ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_status_check;

        -- Add the new constraint with 'on_hold'
        ALTER TABLE audits ADD CONSTRAINT audits_status_check CHECK (status IN (
            'draft', 'planning', 'in_progress', 'testing',
            'reporting', 'completed', 'cancelled', 'on_hold'
        ));

        RAISE NOTICE 'Constraint updated successfully!';
    END IF;
END $$;

-- Verify the constraint exists and shows the correct definition
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'audits'::regclass
AND conname = 'audits_status_check';

COMMIT;
