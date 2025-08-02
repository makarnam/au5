-- Enhanced AI Control Generator Migration Verification Script
-- Run this script after applying the migration to verify all changes were applied correctly
-- Version: 1.0
-- Date: 2024-12-19

-- =============================================================================
-- VERIFICATION SCRIPT FOR ENHANCED AI CONTROL GENERATOR MIGRATION
-- =============================================================================

-- Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    RAISE NOTICE 'Checking for required tables...';

    -- Check for control_sets table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'control_sets') THEN
        missing_tables := array_append(missing_tables, 'control_sets');
    END IF;

    -- Check for ai_control_templates table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_control_templates') THEN
        missing_tables := array_append(missing_tables, 'ai_control_templates');
    END IF;

    -- Check for ai_generation_logs table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_generation_logs') THEN
        missing_tables := array_append(missing_tables, 'ai_generation_logs');
    END IF;

    -- Check for migration_history table
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migration_history') THEN
        missing_tables := array_append(missing_tables, 'migration_history');
    END IF;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ All required tables exist';
    END IF;
END $$;

-- Check if all required columns exist in controls table
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking controls table columns...';

    -- Check for control_code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'control_code'
    ) THEN
        missing_columns := array_append(missing_columns, 'control_code');
    END IF;

    -- Check for process_area column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'process_area'
    ) THEN
        missing_columns := array_append(missing_columns, 'process_area');
    END IF;

    -- Check for testing_procedure column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'testing_procedure'
    ) THEN
        missing_columns := array_append(missing_columns, 'testing_procedure');
    END IF;

    -- Check for evidence_requirements_text column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) THEN
        missing_columns := array_append(missing_columns, 'evidence_requirements_text');
    END IF;

    -- Check for effectiveness column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'effectiveness'
    ) THEN
        missing_columns := array_append(missing_columns, 'effectiveness');
    END IF;

    -- Check for is_automated column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'is_automated'
    ) THEN
        missing_columns := array_append(missing_columns, 'is_automated');
    END IF;

    -- Check for framework column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'framework'
    ) THEN
        missing_columns := array_append(missing_columns, 'framework');
    END IF;

    -- Check for industry column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'industry'
    ) THEN
        missing_columns := array_append(missing_columns, 'industry');
    END IF;

    -- Check for risk_level column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'risk_level'
    ) THEN
        missing_columns := array_append(missing_columns, 'risk_level');
    END IF;

    -- Check for control_set_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'control_set_id'
    ) THEN
        missing_columns := array_append(missing_columns, 'control_set_id');
    END IF;

    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns in controls table: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✓ All required columns exist in controls table';
    END IF;
END $$;

-- Check if all required indexes exist
DO $$
DECLARE
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking for required indexes...';

    -- Check control_sets indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_control_sets_audit_id') THEN
        missing_indexes := array_append(missing_indexes, 'idx_control_sets_audit_id');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_control_sets_framework') THEN
        missing_indexes := array_append(missing_indexes, 'idx_control_sets_framework');
    END IF;

    -- Check controls indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_controls_control_set_id') THEN
        missing_indexes := array_append(missing_indexes, 'idx_controls_control_set_id');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_controls_framework') THEN
        missing_indexes := array_append(missing_indexes, 'idx_controls_framework');
    END IF;

    -- Check ai_control_templates indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_control_templates_framework') THEN
        missing_indexes := array_append(missing_indexes, 'idx_ai_control_templates_framework');
    END IF;

    -- Check ai_generation_logs indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_generation_logs_user_id') THEN
        missing_indexes := array_append(missing_indexes, 'idx_ai_generation_logs_user_id');
    END IF;

    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING 'Missing indexes (performance may be affected): %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '✓ All required indexes exist';
    END IF;
END $$;

-- Check if triggers exist
DO $$
DECLARE
    missing_triggers TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking for required triggers...';

    -- Check for control_sets updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_control_sets_updated_at'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'update_control_sets_updated_at');
    END IF;

    -- Check for ai_control_templates updated_at trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_ai_control_templates_updated_at'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'update_ai_control_templates_updated_at');
    END IF;

    -- Check for control_set_counts trigger
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers
        WHERE trigger_name = 'update_control_set_counts_trigger'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'update_control_set_counts_trigger');
    END IF;

    IF array_length(missing_triggers, 1) > 0 THEN
        RAISE WARNING 'Missing triggers (automatic updates may not work): %', array_to_string(missing_triggers, ', ');
    ELSE
        RAISE NOTICE '✓ All required triggers exist';
    END IF;
END $$;

-- Check if functions exist
DO $$
DECLARE
    missing_functions TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking for required functions...';

    -- Check for update_control_set_counts function
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'update_control_set_counts'
    ) THEN
        missing_functions := array_append(missing_functions, 'update_control_set_counts');
    END IF;

    -- Check for increment_template_usage function
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'increment_template_usage'
    ) THEN
        missing_functions := array_append(missing_functions, 'increment_template_usage');
    END IF;

    -- Check for update_ai_config_stats function
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'update_ai_config_stats'
    ) THEN
        missing_functions := array_append(missing_functions, 'update_ai_config_stats');
    END IF;

    IF array_length(missing_functions, 1) > 0 THEN
        RAISE WARNING 'Missing functions (some features may not work): %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE '✓ All required functions exist';
    END IF;
END $$;

-- Check if views exist
DO $$
DECLARE
    missing_views TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking for required views...';

    -- Check for control_set_stats view
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'control_set_stats'
    ) THEN
        missing_views := array_append(missing_views, 'control_set_stats');
    END IF;

    -- Check for ai_generation_analytics view
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.views
        WHERE table_name = 'ai_generation_analytics'
    ) THEN
        missing_views := array_append(missing_views, 'ai_generation_analytics');
    END IF;

    IF array_length(missing_views, 1) > 0 THEN
        RAISE WARNING 'Missing views (analytics features may not work): %', array_to_string(missing_views, ', ');
    ELSE
        RAISE NOTICE '✓ All required views exist';
    END IF;
END $$;

-- Check if Row Level Security is enabled
DO $$
DECLARE
    tables_without_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Checking Row Level Security settings...';

    -- Check control_sets RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'control_sets' AND c.relrowsecurity = true
    ) THEN
        tables_without_rls := array_append(tables_without_rls, 'control_sets');
    END IF;

    -- Check ai_control_templates RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'ai_control_templates' AND c.relrowsecurity = true
    ) THEN
        tables_without_rls := array_append(tables_without_rls, 'ai_control_templates');
    END IF;

    -- Check ai_generation_logs RLS
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'ai_generation_logs' AND c.relrowsecurity = true
    ) THEN
        tables_without_rls := array_append(tables_without_rls, 'ai_generation_logs');
    END IF;

    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE WARNING 'Tables without RLS enabled (security may be compromised): %', array_to_string(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE '✓ Row Level Security is properly configured';
    END IF;
END $$;

-- Display sample data counts
DO $$
DECLARE
    control_sets_count INTEGER;
    ai_templates_count INTEGER;
    controls_with_sets INTEGER;
    enhanced_controls INTEGER;
BEGIN
    RAISE NOTICE 'Checking sample data...';

    SELECT COUNT(*) INTO control_sets_count FROM control_sets;
    SELECT COUNT(*) INTO ai_templates_count FROM ai_control_templates;
    SELECT COUNT(*) INTO controls_with_sets FROM controls WHERE control_set_id IS NOT NULL;
    SELECT COUNT(*) INTO enhanced_controls FROM controls WHERE effectiveness IS NOT NULL;

    RAISE NOTICE 'Sample data statistics:';
    RAISE NOTICE '- Control sets: %', control_sets_count;
    RAISE NOTICE '- AI templates: %', ai_templates_count;
    RAISE NOTICE '- Controls linked to sets: %', controls_with_sets;
    RAISE NOTICE '- Controls with enhanced fields: %', enhanced_controls;
END $$;

-- Test basic functionality
DO $$
DECLARE
    test_result BOOLEAN;
BEGIN
    RAISE NOTICE 'Testing basic functionality...';

    -- Test control_set_stats view
    BEGIN
        PERFORM 1 FROM control_set_stats LIMIT 1;
        RAISE NOTICE '✓ control_set_stats view is working';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'control_set_stats view test failed: %', SQLERRM;
    END;

    -- Test ai_generation_analytics view
    BEGIN
        PERFORM 1 FROM ai_generation_analytics LIMIT 1;
        RAISE NOTICE '✓ ai_generation_analytics view is working';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'ai_generation_analytics view test failed: %', SQLERRM;
    END;

    -- Test increment_template_usage function (if templates exist)
    BEGIN
        IF EXISTS (SELECT 1 FROM ai_control_templates LIMIT 1) THEN
            PERFORM increment_template_usage((SELECT id FROM ai_control_templates LIMIT 1));
            RAISE NOTICE '✓ increment_template_usage function is working';
        ELSE
            RAISE NOTICE '- increment_template_usage function not tested (no templates)';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'increment_template_usage function test failed: %', SQLERRM;
    END;

    RAISE NOTICE '✓ Basic functionality tests completed';
END $$;

-- Check migration history
DO $$
DECLARE
    migration_record RECORD;
BEGIN
    RAISE NOTICE 'Checking migration history...';

    SELECT migration_name, applied_at INTO migration_record
    FROM migration_history
    WHERE migration_name = 'enhanced_ai_control_generator_v1.0'
    ORDER BY applied_at DESC
    LIMIT 1;

    IF FOUND THEN
        RAISE NOTICE '✓ Migration record found: % applied at %', migration_record.migration_name, migration_record.applied_at;
    ELSE
        RAISE WARNING 'Migration record not found in migration_history table';
    END IF;
END $$;

-- Final verification summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'ENHANCED AI CONTROL GENERATOR MIGRATION VERIFICATION COMPLETE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see this message without any ERRORs above, the migration was successful!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Restart your application server to pick up schema changes';
    RAISE NOTICE '2. Test the Enhanced AI Control Generator in the UI';
    RAISE NOTICE '3. Visit /controls/enhanced-ai-demo to try the new features';
    RAISE NOTICE '4. Configure AI providers in your application settings';
    RAISE NOTICE '';
    RAISE NOTICE 'New features available:';
    RAISE NOTICE '- Enhanced AI control generation with context awareness';
    RAISE NOTICE '- Control sets for organizing related controls';
    RAISE NOTICE '- Custom AI control templates';
    RAISE NOTICE '- Improved control metadata and tracking';
    RAISE NOTICE '- Advanced analytics and reporting views';
    RAISE NOTICE '';
END $$;
