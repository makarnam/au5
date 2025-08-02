-- Supabase-compatible diagnostic script to check controls table state
-- Run this in Supabase SQL Editor to understand current schema

DO $$
DECLARE
    table_exists BOOLEAN;
    column_record RECORD;
    sample_record RECORD;
    row_count INTEGER;
BEGIN
    -- Check if controls table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'controls'
    ) INTO table_exists;

    RAISE NOTICE '=== SUPABASE CONTROLS TABLE DIAGNOSTIC ===';
    RAISE NOTICE 'Controls table exists: %', table_exists;

    IF NOT table_exists THEN
        RAISE NOTICE 'Controls table does not exist. Please run the initial setup first.';
        RETURN;
    END IF;

    -- Show all columns in controls table
    RAISE NOTICE '';
    RAISE NOTICE '=== CURRENT SCHEMA ===';
    FOR column_record IN
        SELECT
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: % | Max Length: %',
            column_record.column_name,
            column_record.data_type,
            column_record.is_nullable,
            COALESCE(column_record.column_default, 'NULL'),
            COALESCE(column_record.character_maximum_length::text, 'N/A');
    END LOOP;

    -- Check specifically for evidence_requirements column
    RAISE NOTICE '';
    RAISE NOTICE '=== EVIDENCE_REQUIREMENTS ANALYSIS ===';

    SELECT data_type INTO column_record.data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements';

    IF FOUND THEN
        RAISE NOTICE 'evidence_requirements column type: %', column_record.data_type;

        -- Try to get a sample value to understand the current format
        BEGIN
            SELECT evidence_requirements INTO sample_record.evidence_requirements
            FROM controls
            WHERE evidence_requirements IS NOT NULL
            LIMIT 1;

            IF FOUND THEN
                RAISE NOTICE 'Sample evidence_requirements value: %', sample_record.evidence_requirements;
            ELSE
                RAISE NOTICE 'No non-null evidence_requirements values found';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error reading evidence_requirements sample: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'evidence_requirements column does not exist';
    END IF;

    -- Check for evidence_requirements_text column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) THEN
        RAISE NOTICE 'evidence_requirements_text column exists';

        -- Sample text value
        BEGIN
            SELECT evidence_requirements_text INTO sample_record.evidence_requirements
            FROM controls
            WHERE evidence_requirements_text IS NOT NULL
            LIMIT 1;

            IF FOUND THEN
                RAISE NOTICE 'Sample evidence_requirements_text value: %', sample_record.evidence_requirements;
            ELSE
                RAISE NOTICE 'No non-null evidence_requirements_text values found';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error reading evidence_requirements_text sample: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'evidence_requirements_text column does not exist';
    END IF;

    -- Count total records
    SELECT COUNT(*) INTO row_count FROM controls;
    RAISE NOTICE '';
    RAISE NOTICE '=== DATA SUMMARY ===';
    RAISE NOTICE 'Total controls: %', row_count;

    -- Count records with evidence_requirements
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements'
    ) THEN
        SELECT COUNT(*) INTO row_count FROM controls WHERE evidence_requirements IS NOT NULL;
        RAISE NOTICE 'Controls with evidence_requirements: %', row_count;
    END IF;

    -- Count records with evidence_requirements_text
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) THEN
        SELECT COUNT(*) INTO row_count FROM controls WHERE evidence_requirements_text IS NOT NULL;
        RAISE NOTICE 'Controls with evidence_requirements_text: %', row_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== MISSING ENHANCED AI COLUMNS ===';

    -- Check for enhanced AI generator columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'testing_procedure') THEN
        RAISE NOTICE 'MISSING: testing_procedure column';
    ELSE
        RAISE NOTICE 'EXISTS: testing_procedure column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'effectiveness') THEN
        RAISE NOTICE 'MISSING: effectiveness column';
    ELSE
        RAISE NOTICE 'EXISTS: effectiveness column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'ai_generated') THEN
        RAISE NOTICE 'MISSING: ai_generated column';
    ELSE
        RAISE NOTICE 'EXISTS: ai_generated column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'generation_prompt') THEN
        RAISE NOTICE 'MISSING: generation_prompt column';
    ELSE
        RAISE NOTICE 'EXISTS: generation_prompt column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'generated_at') THEN
        RAISE NOTICE 'MISSING: generated_at column';
    ELSE
        RAISE NOTICE 'EXISTS: generated_at column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'last_tested_date') THEN
        RAISE NOTICE 'MISSING: last_tested_date column';
    ELSE
        RAISE NOTICE 'EXISTS: last_tested_date column';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'controls' AND column_name = 'test_results') THEN
        RAISE NOTICE 'MISSING: test_results column';
    ELSE
        RAISE NOTICE 'EXISTS: test_results column';
    END IF;

    -- Check RLS status
    SELECT relrowsecurity INTO table_exists
    FROM pg_class
    WHERE relname = 'controls' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

    RAISE NOTICE '';
    RAISE NOTICE '=== SECURITY ===';
    RAISE NOTICE 'Row Level Security enabled: %', COALESCE(table_exists, false);

    RAISE NOTICE '';
    RAISE NOTICE '=== DIAGNOSTIC COMPLETE ===';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. If columns are missing, run: supabase-fix-evidence-requirements.sql';
    RAISE NOTICE '2. Check the sample values above to understand current data format';
    RAISE NOTICE '3. Verify RLS policies are configured for your application';

END $$;

-- Show a quick summary table
SELECT
    'Summary' as info,
    COUNT(*) as total_controls,
    COUNT(CASE WHEN evidence_requirements IS NOT NULL THEN 1 END) as with_evidence_reqs,
    COUNT(CASE WHEN evidence_requirements_text IS NOT NULL THEN 1 END) as with_evidence_text,
    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated_count
FROM controls;
