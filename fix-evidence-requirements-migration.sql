-- Fix evidence_requirements migration to handle both text and array types
-- This script safely migrates evidence_requirements regardless of current column type

DO $$
DECLARE
    column_type TEXT;
    has_evidence_requirements_text BOOLEAN;
BEGIN
    -- Check if evidence_requirements_text column already exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) INTO has_evidence_requirements_text;

    -- Get the current data type of evidence_requirements column
    SELECT data_type INTO column_type
    FROM information_schema.columns
    WHERE table_name = 'controls' AND column_name = 'evidence_requirements';

    RAISE NOTICE 'Current evidence_requirements column type: %', column_type;
    RAISE NOTICE 'evidence_requirements_text exists: %', has_evidence_requirements_text;

    -- Add evidence_requirements_text column if it doesn't exist
    IF NOT has_evidence_requirements_text THEN
        ALTER TABLE controls ADD COLUMN evidence_requirements_text TEXT;
        RAISE NOTICE 'Added evidence_requirements_text column';
    END IF;

    -- Handle migration based on current column type
    IF column_type = 'ARRAY' OR column_type = 'text[]' THEN
        -- Current column is an array, use array functions
        RAISE NOTICE 'Migrating from array type...';
        UPDATE controls
        SET evidence_requirements_text = array_to_string(evidence_requirements, E'\n• ', '• ')
        WHERE evidence_requirements IS NOT NULL
        AND array_length(evidence_requirements, 1) > 0;

    ELSIF column_type = 'text' OR column_type = 'TEXT' THEN
        -- Current column is text, handle as string
        RAISE NOTICE 'Migrating from text type...';
        UPDATE controls
        SET evidence_requirements_text = CASE
            WHEN evidence_requirements IS NOT NULL AND trim(evidence_requirements) != ''
            THEN '• ' || evidence_requirements
            ELSE NULL
        END
        WHERE evidence_requirements IS NOT NULL;

    ELSE
        RAISE NOTICE 'Unknown column type: %, skipping migration', column_type;
    END IF;

    -- Add testing_procedure column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'testing_procedure'
    ) THEN
        ALTER TABLE controls ADD COLUMN testing_procedure TEXT;
        RAISE NOTICE 'Added testing_procedure column';
    END IF;

    -- Add effectiveness column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'effectiveness'
    ) THEN
        ALTER TABLE controls ADD COLUMN effectiveness VARCHAR(50) DEFAULT 'not_tested'
        CHECK (effectiveness IN ('not_tested', 'effective', 'ineffective', 'partially_effective'));
        RAISE NOTICE 'Added effectiveness column';
    END IF;

    -- Add ai_generated column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'ai_generated'
    ) THEN
        ALTER TABLE controls ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added ai_generated column';
    END IF;

    -- Add generation_prompt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'generation_prompt'
    ) THEN
        ALTER TABLE controls ADD COLUMN generation_prompt TEXT;
        RAISE NOTICE 'Added generation_prompt column';
    END IF;

    -- Add generated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'generated_at'
    ) THEN
        ALTER TABLE controls ADD COLUMN generated_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added generated_at column';
    END IF;

    -- Add last_tested_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'last_tested_date'
    ) THEN
        ALTER TABLE controls ADD COLUMN last_tested_date DATE;
        RAISE NOTICE 'Added last_tested_date column';
    END IF;

    -- Add test_results column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'test_results'
    ) THEN
        ALTER TABLE controls ADD COLUMN test_results TEXT;
        RAISE NOTICE 'Added test_results column';
    END IF;

    RAISE NOTICE 'Migration completed successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during migration: %', SQLERRM;
        RAISE;
END $$;

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'controls'
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
