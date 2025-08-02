-- Controls Module Database Setup Script (Fixed Version)
-- This script creates all necessary tables, enums, and configurations for the AU5 Controls Module
-- Run this script in your Supabase SQL editor or PostgreSQL database

-- =============================================================================
-- STEP 1: Drop existing objects if they exist (for clean setup)
-- =============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS control_tests CASCADE;
DROP TABLE IF EXISTS ai_generation_logs CASCADE;
DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS ai_configurations CASCADE;
DROP TABLE IF EXISTS control_sets CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_control_set_counts() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop enums (only if not used elsewhere)
DROP TYPE IF EXISTS control_type_enum CASCADE;
DROP TYPE IF EXISTS control_frequency_enum CASCADE;
DROP TYPE IF EXISTS control_effectiveness_enum CASCADE;
DROP TYPE IF EXISTS ai_provider_enum CASCADE;

-- =============================================================================
-- STEP 2: Create ENUM types first
-- =============================================================================

-- Create control type enumeration
CREATE TYPE control_type_enum AS ENUM ('preventive', 'detective', 'corrective', 'directive');

-- Create control frequency enumeration
CREATE TYPE control_frequency_enum AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'adhoc');

-- Create control effectiveness enumeration
CREATE TYPE control_effectiveness_enum AS ENUM ('not_tested', 'effective', 'partially_effective', 'ineffective');

-- Create AI provider enumeration
CREATE TYPE ai_provider_enum AS ENUM ('ollama', 'openai', 'claude', 'gemini');

-- =============================================================================
-- STEP 3: Create Tables in proper dependency order
-- =============================================================================

-- 1. Control Sets Table (no dependencies)
CREATE TABLE control_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID, -- Remove REFERENCES for now, add later if audits table exists
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(100) NOT NULL,
    controls_count INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by UUID, -- Remove REFERENCES for now, add later if users table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Constraints
    CONSTRAINT control_sets_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT control_sets_framework_not_empty CHECK (LENGTH(TRIM(framework)) > 0),
    CONSTRAINT control_sets_controls_count_positive CHECK (controls_count >= 0)
);

-- 2. Controls Table (depends on control_sets)
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_set_id UUID NOT NULL REFERENCES control_sets(id) ON DELETE CASCADE,
    audit_id UUID, -- Remove REFERENCES for now, add later if audits table exists
    control_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    control_type control_type_enum NOT NULL,
    frequency control_frequency_enum NOT NULL,
    process_area VARCHAR(255) NOT NULL,
    owner_id UUID, -- Remove REFERENCES for now, add later if users table exists
    testing_procedure TEXT NOT NULL,
    evidence_requirements TEXT NOT NULL,
    effectiveness control_effectiveness_enum DEFAULT 'not_tested',
    last_tested_date DATE,
    next_test_date DATE,
    is_automated BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by UUID, -- Remove REFERENCES for now, add later if users table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Constraints
    CONSTRAINT controls_code_not_empty CHECK (LENGTH(TRIM(control_code)) > 0),
    CONSTRAINT controls_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT controls_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
    CONSTRAINT controls_process_area_not_empty CHECK (LENGTH(TRIM(process_area)) > 0),
    CONSTRAINT controls_testing_procedure_not_empty CHECK (LENGTH(TRIM(testing_procedure)) > 0),
    CONSTRAINT controls_evidence_requirements_not_empty CHECK (LENGTH(TRIM(evidence_requirements)) > 0),
    CONSTRAINT controls_test_dates_logical CHECK (
        (last_tested_date IS NULL AND next_test_date IS NULL) OR
        (last_tested_date IS NOT NULL AND next_test_date IS NOT NULL AND next_test_date >= last_tested_date) OR
        (last_tested_date IS NULL AND next_test_date IS NOT NULL) OR
        (last_tested_date IS NOT NULL AND next_test_date IS NULL)
    ),

    -- Unique constraint for control code within control set
    CONSTRAINT controls_unique_code_per_set UNIQUE (control_set_id, control_code)
);

-- 3. AI Configurations Table (no dependencies)
CREATE TABLE ai_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider ai_provider_enum NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(500),
    api_key TEXT,
    max_tokens INTEGER DEFAULT 2000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID, -- Remove REFERENCES for now, add later if users table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ai_config_model_name_not_empty CHECK (LENGTH(TRIM(model_name)) > 0),
    CONSTRAINT ai_config_max_tokens_range CHECK (max_tokens >= 100 AND max_tokens <= 10000),
    CONSTRAINT ai_config_temperature_range CHECK (temperature >= 0.0 AND temperature <= 2.0)
);

-- 4. AI Generation Logs Table (no strong dependencies)
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Remove REFERENCES for now, add later if users table exists
    provider ai_provider_enum NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER DEFAULT 0,
    request_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50), -- 'control_set', 'control', etc.
    entity_id UUID,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ai_logs_tokens_positive CHECK (tokens_used >= 0),
    CONSTRAINT ai_logs_execution_time_positive CHECK (execution_time_ms IS NULL OR execution_time_ms >= 0)
);

-- 5. Control Tests Table (depends on controls)
CREATE TABLE control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    audit_id UUID, -- Remove REFERENCES for now, add later if audits table exists
    tester_id UUID, -- Remove REFERENCES for now, add later if users table exists
    test_date DATE NOT NULL,
    test_result VARCHAR(20) NOT NULL CHECK (test_result IN ('passed', 'failed', 'not_applicable', 'not_tested')),
    sample_size INTEGER,
    exceptions_noted INTEGER DEFAULT 0,
    testing_notes TEXT,
    evidence_files TEXT[], -- Array of file URLs/paths
    created_by UUID, -- Remove REFERENCES for now, add later if users table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT control_tests_sample_size_positive CHECK (sample_size IS NULL OR sample_size > 0),
    CONSTRAINT control_tests_exceptions_positive CHECK (exceptions_noted >= 0),
    CONSTRAINT control_tests_exceptions_logical CHECK (
        sample_size IS NULL OR exceptions_noted <= sample_size
    )
);

-- =============================================================================
-- STEP 4: Add Foreign Key Constraints (if referenced tables exist)
-- =============================================================================

-- Add foreign key constraints only if the referenced tables exist
DO $$
BEGIN
    -- Check if audits table exists and add foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audits') THEN
        ALTER TABLE control_sets ADD CONSTRAINT fk_control_sets_audit_id
            FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE;
        ALTER TABLE controls ADD CONSTRAINT fk_controls_audit_id
            FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE;
        ALTER TABLE control_tests ADD CONSTRAINT fk_control_tests_audit_id
            FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraints for audits table';
    ELSE
        RAISE NOTICE 'Audits table not found - skipping foreign key constraints';
    END IF;

    -- Check if users table exists and add foreign key
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE control_sets ADD CONSTRAINT fk_control_sets_created_by
            FOREIGN KEY (created_by) REFERENCES users(id);
        ALTER TABLE controls ADD CONSTRAINT fk_controls_owner_id
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE controls ADD CONSTRAINT fk_controls_created_by
            FOREIGN KEY (created_by) REFERENCES users(id);
        ALTER TABLE ai_configurations ADD CONSTRAINT fk_ai_config_created_by
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
        ALTER TABLE ai_generation_logs ADD CONSTRAINT fk_ai_logs_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE control_tests ADD CONSTRAINT fk_control_tests_tester_id
            FOREIGN KEY (tester_id) REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE control_tests ADD CONSTRAINT fk_control_tests_created_by
            FOREIGN KEY (created_by) REFERENCES users(id);
        RAISE NOTICE 'Added foreign key constraints for users table';
    ELSE
        RAISE NOTICE 'Users table not found - skipping foreign key constraints';
    END IF;
END $$;

-- =============================================================================
-- STEP 5: Create Indexes for Performance
-- =============================================================================

-- Control Sets Indexes
CREATE INDEX idx_control_sets_audit_id ON control_sets(audit_id);
CREATE INDEX idx_control_sets_created_by ON control_sets(created_by);
CREATE INDEX idx_control_sets_framework ON control_sets(framework);
CREATE INDEX idx_control_sets_active ON control_sets(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_control_sets_name_search ON control_sets USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Controls Indexes
CREATE INDEX idx_controls_control_set_id ON controls(control_set_id);
CREATE INDEX idx_controls_audit_id ON controls(audit_id);
CREATE INDEX idx_controls_owner_id ON controls(owner_id);
CREATE INDEX idx_controls_control_type ON controls(control_type);
CREATE INDEX idx_controls_effectiveness ON controls(effectiveness);
CREATE INDEX idx_controls_frequency ON controls(frequency);
CREATE INDEX idx_controls_active ON controls(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX idx_controls_code_search ON controls USING gin (to_tsvector('english', control_code || ' ' || title || ' ' || description));
CREATE INDEX idx_controls_next_test_date ON controls(next_test_date) WHERE next_test_date IS NOT NULL;
CREATE INDEX idx_controls_process_area ON controls(process_area);

-- AI Configurations Indexes
CREATE INDEX idx_ai_config_created_by ON ai_configurations(created_by);
CREATE INDEX idx_ai_config_provider ON ai_configurations(provider);
CREATE INDEX idx_ai_config_active ON ai_configurations(is_active) WHERE is_active = TRUE;

-- AI Generation Logs Indexes
CREATE INDEX idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_logs_provider ON ai_generation_logs(provider);
CREATE INDEX idx_ai_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX idx_ai_logs_entity ON ai_generation_logs(entity_type, entity_id);
CREATE INDEX idx_ai_logs_success ON ai_generation_logs(success);

-- Control Tests Indexes
CREATE INDEX idx_control_tests_control_id ON control_tests(control_id);
CREATE INDEX idx_control_tests_audit_id ON control_tests(audit_id);
CREATE INDEX idx_control_tests_tester_id ON control_tests(tester_id);
CREATE INDEX idx_control_tests_test_date ON control_tests(test_date);
CREATE INDEX idx_control_tests_result ON control_tests(test_result);

-- =============================================================================
-- STEP 6: Create Functions and Triggers
-- =============================================================================

-- Function to update control set counts
CREATE OR REPLACE FUNCTION update_control_set_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE control_sets
        SET controls_count = (
            SELECT COUNT(*) FROM controls
            WHERE control_set_id = NEW.control_set_id
            AND is_deleted = FALSE
        ),
        updated_at = NOW()
        WHERE id = NEW.control_set_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE control_sets
        SET controls_count = (
            SELECT COUNT(*) FROM controls
            WHERE control_set_id = OLD.control_set_id
            AND is_deleted = FALSE
        ),
        updated_at = NOW()
        WHERE id = OLD.control_set_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle soft delete changes
        IF OLD.is_deleted != NEW.is_deleted THEN
            UPDATE control_sets
            SET controls_count = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = NEW.control_set_id
                AND is_deleted = FALSE
            ),
            updated_at = NOW()
            WHERE id = NEW.control_set_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update control set counts
CREATE TRIGGER trigger_update_control_set_counts
    AFTER INSERT OR DELETE OR UPDATE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_control_set_counts();

-- Triggers for updated_at timestamps
CREATE TRIGGER trigger_control_sets_updated_at
    BEFORE UPDATE ON control_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_controls_updated_at
    BEFORE UPDATE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_ai_configurations_updated_at
    BEFORE UPDATE ON ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_control_tests_updated_at
    BEFORE UPDATE ON control_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 7: Insert Sample Data (Optional)
-- =============================================================================

-- Insert sample control sets for testing
INSERT INTO control_sets (name, description, framework, ai_generated) VALUES
('ISO 27001 Information Security Controls', 'Control set based on ISO 27001 standard for information security management', 'ISO 27001', FALSE),
('SOX Financial Controls', 'Financial controls required by Sarbanes-Oxley Act', 'SOX', FALSE),
('GDPR Privacy Controls', 'Controls for General Data Protection Regulation compliance', 'GDPR', FALSE);

-- Get the ID of the first control set for sample controls
DO $$
DECLARE
    sample_control_set_id UUID;
BEGIN
    SELECT id INTO sample_control_set_id FROM control_sets WHERE framework = 'ISO 27001' LIMIT 1;

    IF sample_control_set_id IS NOT NULL THEN
        -- Insert sample controls
        INSERT INTO controls (
            control_set_id, control_code, title, description, control_type,
            frequency, process_area, testing_procedure, evidence_requirements
        ) VALUES
        (sample_control_set_id, 'AC-001', 'User Access Management',
         'Controls for managing user access to information systems',
         'preventive', 'monthly', 'Access Control',
         'Review user access lists and permissions monthly',
         'User access reports, permission matrices'),
        (sample_control_set_id, 'AC-002', 'Password Policy Enforcement',
         'Enforce strong password policies across all systems',
         'preventive', 'continuous', 'Access Control',
         'Monitor password policy compliance through system logs',
         'Password policy configuration, compliance reports'),
        (sample_control_set_id, 'IN-001', 'Incident Response',
         'Procedures for responding to security incidents',
         'corrective', 'adhoc', 'Incident Management',
         'Test incident response procedures quarterly',
         'Incident response plan, test results, response logs');

        RAISE NOTICE 'Sample data inserted successfully';
    END IF;
END $$;

-- =============================================================================
-- STEP 8: Grant Permissions
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================================
-- STEP 9: Enable Row Level Security (Optional - Enable if using Supabase Auth)
-- =============================================================================

-- Uncomment the following section if you want to enable RLS
/*
-- Enable RLS on all tables
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_tests ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize as needed)
CREATE POLICY "Enable read access for authenticated users" ON control_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON control_sets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON control_sets FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON controls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON controls FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON controls FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can manage their own AI configs" ON ai_configurations FOR ALL TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Users can view their own AI logs" ON ai_generation_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users" ON control_tests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for authenticated users" ON control_tests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON control_tests FOR UPDATE TO authenticated USING (true);
*/

-- =============================================================================
-- STEP 10: Verification and Summary
-- =============================================================================

-- Verify tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
    enum_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
BEGIN
    -- Count created tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('control_sets', 'controls', 'ai_configurations', 'ai_generation_logs', 'control_tests');

    -- Count created enums
    SELECT COUNT(*) INTO enum_count
    FROM pg_type
    WHERE typname IN ('control_type_enum', 'control_frequency_enum', 'control_effectiveness_enum', 'ai_provider_enum');

    -- Count created indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';

    -- Count created functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('update_control_set_counts', 'update_updated_at_column');

    -- Report results
    RAISE NOTICE '=== CONTROLS MODULE SETUP COMPLETED ===';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Enums created: %', enum_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Functions created: %', function_count;

    IF table_count = 5 AND enum_count = 4 THEN
        RAISE NOTICE '✓ All core objects created successfully!';
        RAISE NOTICE 'You can now use the Controls Module in AU5.';
    ELSE
        RAISE WARNING '⚠ Some objects may not have been created correctly.';
        RAISE WARNING 'Expected: 5 tables, 4 enums';
        RAISE WARNING 'Created: % tables, % enums', table_count, enum_count;
    END IF;
END $$;

-- Show final summary
SELECT
    'control_sets' as table_name,
    (SELECT COUNT(*) FROM control_sets) as row_count,
    'Control set definitions' as description
UNION ALL
SELECT
    'controls' as table_name,
    (SELECT COUNT(*) FROM controls) as row_count,
    'Individual controls' as description
UNION ALL
SELECT
    'ai_configurations' as table_name,
    (SELECT COUNT(*) FROM ai_configurations) as row_count,
    'AI provider configurations' as description
UNION ALL
SELECT
    'ai_generation_logs' as table_name,
    (SELECT COUNT(*) FROM ai_generation_logs) as row_count,
    'AI usage logs' as description
UNION ALL
SELECT
    'control_tests' as table_name,
    (SELECT COUNT(*) FROM control_tests) as row_count,
    'Control testing results' as description;

-- Success message
SELECT 'Controls Module database setup completed successfully!' as status;

/*
=== NEXT STEPS ===

1. Configure AI providers in the application UI
2. Create your first control sets using the Controls Module
3. Set up user permissions as needed
4. Test the AI generation functionality
5. Import or create your organization's controls

For detailed usage instructions, see:
- CONTROLS_MODULE_DOCUMENTATION.md
- CONTROLS_SETUP.md

=== TROUBLESHOOTING ===

If you encounter issues:
1. Check that all required tables exist: control_sets, controls, ai_configurations, ai_generation_logs, control_tests
2. Verify enums are created: control_type_enum, control_frequency_enum, control_effectiveness_enum, ai_provider_enum
3. Ensure your user has proper permissions on the database
4. Check the application logs for specific error messages

=== SUPPORT ===

For technical support:
- Review the documentation files
- Check the database logs for error details
- Verify your database connection and permissions
*/
