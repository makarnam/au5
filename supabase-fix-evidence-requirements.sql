-- Supabase-compatible migration script to fix evidence_requirements issue
-- Run this in Supabase SQL Editor to fix the array_length error

DO $$
DECLARE
    column_type TEXT;
    has_evidence_requirements_text BOOLEAN;
    column_exists BOOLEAN;
    rec RECORD;
BEGIN
    -- Check if controls table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'controls'
    ) INTO column_exists;

    IF NOT column_exists THEN
        RAISE NOTICE 'Controls table does not exist. Please run the initial setup first.';
        RETURN;
    END IF;

    -- Check if evidence_requirements column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements'
    ) INTO column_exists;

    -- Check if evidence_requirements_text column already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) INTO has_evidence_requirements_text;

    RAISE NOTICE '=== MIGRATION STATUS ===';
    RAISE NOTICE 'Evidence requirements column exists: %', column_exists;
    RAISE NOTICE 'Evidence requirements text column exists: %', has_evidence_requirements_text;

    -- Add evidence_requirements_text column if it doesn't exist
    IF NOT has_evidence_requirements_text THEN
        ALTER TABLE controls ADD COLUMN evidence_requirements_text TEXT;
        RAISE NOTICE 'Added evidence_requirements_text column';
    END IF;

    -- Only migrate if evidence_requirements column exists
    IF column_exists THEN
        -- Get the current data type of evidence_requirements column
        SELECT data_type INTO column_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements';

        RAISE NOTICE 'Current evidence_requirements column type: %', column_type;

        -- Handle migration based on current column type
        IF column_type = 'ARRAY' OR column_type LIKE '%[]%' THEN
            -- Current column is an array, use array functions
            RAISE NOTICE 'Migrating from array type...';

            UPDATE controls
            SET evidence_requirements_text = array_to_string(evidence_requirements, E'\n• ', '• ')
            WHERE evidence_requirements IS NOT NULL
            AND cardinality(evidence_requirements) > 0;

            RAISE NOTICE 'Migrated % rows from array format', (SELECT count(*) FROM controls WHERE evidence_requirements IS NOT NULL);

        ELSIF column_type = 'text' OR column_type = 'TEXT' OR column_type = 'character varying' THEN
            -- Current column is text, handle as string
            RAISE NOTICE 'Migrating from text type...';

            UPDATE controls
            SET evidence_requirements_text = CASE
                WHEN evidence_requirements IS NOT NULL AND trim(evidence_requirements) != ''
                THEN '• ' || evidence_requirements
                ELSE NULL
            END
            WHERE evidence_requirements IS NOT NULL AND evidence_requirements_text IS NULL;

            RAISE NOTICE 'Migrated % rows from text format', (SELECT count(*) FROM controls WHERE evidence_requirements IS NOT NULL);

        ELSE
            RAISE NOTICE 'Unknown column type: %, attempting safe migration...', column_type;

            -- Safe fallback - try to convert whatever format exists
            UPDATE controls
            SET evidence_requirements_text = CASE
                WHEN evidence_requirements IS NOT NULL
                THEN '• ' || COALESCE(evidence_requirements::text, '')
                ELSE NULL
            END
            WHERE evidence_requirements IS NOT NULL AND evidence_requirements_text IS NULL;
        END IF;
    ELSE
        RAISE NOTICE 'No evidence_requirements column found, skipping migration';
    END IF;

    -- Add other missing columns for enhanced AI generator

    -- Add testing_procedure column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'testing_procedure'
    ) THEN
        ALTER TABLE controls ADD COLUMN testing_procedure TEXT;
        RAISE NOTICE 'Added testing_procedure column';
    END IF;

    -- Add effectiveness column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'effectiveness'
    ) THEN
        ALTER TABLE controls ADD COLUMN effectiveness VARCHAR(50) DEFAULT 'not_tested';

        -- Add check constraint for effectiveness values
        ALTER TABLE controls ADD CONSTRAINT controls_effectiveness_check
        CHECK (effectiveness IN ('not_tested', 'effective', 'ineffective', 'partially_effective'));

        RAISE NOTICE 'Added effectiveness column with constraint';
    END IF;

    -- Add ai_generated column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'ai_generated'
    ) THEN
        ALTER TABLE controls ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added ai_generated column';
    END IF;

    -- Add generation_prompt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'generation_prompt'
    ) THEN
        ALTER TABLE controls ADD COLUMN generation_prompt TEXT;
        RAISE NOTICE 'Added generation_prompt column';
    END IF;

    -- Add generated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'generated_at'
    ) THEN
        ALTER TABLE controls ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added generated_at column';
    END IF;

    -- Add last_tested_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'last_tested_date'
    ) THEN
        ALTER TABLE controls ADD COLUMN last_tested_date DATE;
        RAISE NOTICE 'Added last_tested_date column';
    END IF;

    -- Add test_results column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'test_results'
    ) THEN
        ALTER TABLE controls ADD COLUMN test_results TEXT;
        RAISE NOTICE 'Added test_results column';
    END IF;

    -- Update RLS policies if needed (Supabase specific)
    -- Enable RLS if not already enabled
    ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

    RAISE NOTICE '=== MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'All required columns have been added to the controls table.';
    RAISE NOTICE 'Evidence requirements data has been migrated to the new text format.';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during migration: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
        -- Don't re-raise to avoid stopping the entire migration
        RAISE NOTICE 'Migration completed with errors. Please check the logs above.';
END $$;

-- Verify the migration results
SELECT
    'Migration Verification' as status,
    count(*) as total_controls,
    count(evidence_requirements_text) as controls_with_text_evidence,
    count(CASE WHEN ai_generated = true THEN 1 END) as ai_generated_controls
FROM controls;

-- Show the updated schema
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'controls'
AND column_name IN (
    'evidence_requirements',
    'evidence_requirements_text',
    'testing_procedure',
    'effectiveness',
    'ai_generated',
    'generation_prompt',
    'generated_at',
    'last_tested_date',
    'test_results'
)
ORDER BY column_name;
