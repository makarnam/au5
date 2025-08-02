-- Controls Module Database Setup Script
-- This script creates all necessary tables, enums, and configurations for the AU5 Controls Module
-- Run this script in your Supabase SQL editor or PostgreSQL database

-- =============================================================================
-- STEP 1: Create ENUM types first (before tables that reference them)
-- =============================================================================

-- Create control type enumeration
DO $$ BEGIN
    CREATE TYPE control_type_enum AS ENUM ('preventive', 'detective', 'corrective', 'directive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create control frequency enumeration
DO $$ BEGIN
    CREATE TYPE control_frequency_enum AS ENUM ('continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'adhoc');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create control effectiveness enumeration
DO $$ BEGIN
    CREATE TYPE control_effectiveness_enum AS ENUM ('not_tested', 'effective', 'partially_effective', 'ineffective');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AI provider enumeration
DO $$ BEGIN
    CREATE TYPE ai_provider_enum AS ENUM ('ollama', 'openai', 'claude', 'gemini');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- STEP 2: Create Tables
-- =============================================================================

-- Control Sets Table
CREATE TABLE IF NOT EXISTS control_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(100) NOT NULL,
    controls_count INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,

    -- Constraints
    CONSTRAINT control_sets_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT control_sets_framework_not_empty CHECK (LENGTH(TRIM(framework)) > 0),
    CONSTRAINT control_sets_controls_count_positive CHECK (controls_count >= 0)
);

-- Controls Table
CREATE TABLE IF NOT EXISTS controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_set_id UUID REFERENCES control_sets(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    control_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    control_type control_type_enum NOT NULL,
    frequency control_frequency_enum NOT NULL,
    process_area VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    testing_procedure TEXT NOT NULL,
    evidence_requirements TEXT NOT NULL,
    effectiveness control_effectiveness_enum DEFAULT 'not_tested',
    last_tested_date DATE,
    next_test_date DATE,
    is_automated BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
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

-- AI Configurations Table
CREATE TABLE IF NOT EXISTS ai_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider ai_provider_enum NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(500),
    api_key TEXT,
    max_tokens INTEGER DEFAULT 2000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ai_config_model_name_not_empty CHECK (LENGTH(TRIM(model_name)) > 0),
    CONSTRAINT ai_config_max_tokens_range CHECK (max_tokens >= 100 AND max_tokens <= 10000),
    CONSTRAINT ai_config_temperature_range CHECK (temperature >= 0.0 AND temperature <= 2.0),

    -- Unique constraint for provider per user
    CONSTRAINT ai_config_unique_provider_per_user UNIQUE (created_by, provider)
);

-- AI Generation Logs Table (for tracking AI usage)
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

-- Control Tests Table (for tracking control testing results)
CREATE TABLE IF NOT EXISTS control_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES controls(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    tester_id UUID REFERENCES users(id) ON DELETE SET NULL,
    test_date DATE NOT NULL,
    test_result VARCHAR(20) NOT NULL CHECK (test_result IN ('passed', 'failed', 'not_applicable', 'not_tested')),
    sample_size INTEGER,
    exceptions_noted INTEGER DEFAULT 0,
    testing_notes TEXT,
    evidence_files TEXT[], -- Array of file URLs/paths
    created_by UUID REFERENCES users(id),
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
-- STEP 3: Create Indexes for Performance
-- =============================================================================

-- Control Sets Indexes
CREATE INDEX IF NOT EXISTS idx_control_sets_audit_id ON control_sets(audit_id);
CREATE INDEX IF NOT EXISTS idx_control_sets_created_by ON control_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_control_sets_framework ON control_sets(framework);
CREATE INDEX IF NOT EXISTS idx_control_sets_active ON control_sets(is_deleted) WHERE is_deleted = FALSE;

-- Controls Indexes
CREATE INDEX IF NOT EXISTS idx_controls_control_set_id ON controls(control_set_id);
CREATE INDEX IF NOT EXISTS idx_controls_audit_id ON controls(audit_id);
CREATE INDEX IF NOT EXISTS idx_controls_owner_id ON controls(owner_id);
CREATE INDEX IF NOT EXISTS idx_controls_control_type ON controls(control_type);
CREATE INDEX IF NOT EXISTS idx_controls_effectiveness ON controls(effectiveness);
CREATE INDEX IF NOT EXISTS idx_controls_frequency ON controls(frequency);
CREATE INDEX IF NOT EXISTS idx_controls_active ON controls(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_controls_code_search ON controls USING gin (to_tsvector('english', control_code || ' ' || title));
CREATE INDEX IF NOT EXISTS idx_controls_next_test_date ON controls(next_test_date) WHERE next_test_date IS NOT NULL;

-- AI Configurations Indexes
CREATE INDEX IF NOT EXISTS idx_ai_config_user_id ON ai_configurations(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_config_provider ON ai_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_ai_config_active ON ai_configurations(is_active) WHERE is_active = TRUE;

-- AI Generation Logs Indexes
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_provider ON ai_generation_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_entity ON ai_generation_logs(entity_type, entity_id);

-- Control Tests Indexes
CREATE INDEX IF NOT EXISTS idx_control_tests_control_id ON control_tests(control_id);
CREATE INDEX IF NOT EXISTS idx_control_tests_audit_id ON control_tests(audit_id);
CREATE INDEX IF NOT EXISTS idx_control_tests_tester_id ON control_tests(tester_id);
CREATE INDEX IF NOT EXISTS idx_control_tests_test_date ON control_tests(test_date);

-- =============================================================================
-- STEP 4: Create Functions and Triggers
-- =============================================================================

-- Function to update control set counts
CREATE OR REPLACE FUNCTION update_control_set_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE control_sets
        SET controls_count = controls_count + 1,
            updated_at = NOW()
        WHERE id = NEW.control_set_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE control_sets
        SET controls_count = GREATEST(controls_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.control_set_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update control set counts
DROP TRIGGER IF EXISTS trigger_update_control_set_counts ON controls;
CREATE TRIGGER trigger_update_control_set_counts
    AFTER INSERT OR DELETE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_control_set_counts();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS trigger_control_sets_updated_at ON control_sets;
CREATE TRIGGER trigger_control_sets_updated_at
    BEFORE UPDATE ON control_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_controls_updated_at ON controls;
CREATE TRIGGER trigger_controls_updated_at
    BEFORE UPDATE ON controls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_ai_configurations_updated_at ON ai_configurations;
CREATE TRIGGER trigger_ai_configurations_updated_at
    BEFORE UPDATE ON ai_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_control_tests_updated_at ON control_tests;
CREATE TRIGGER trigger_control_tests_updated_at
    BEFORE UPDATE ON control_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 5: Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_tests ENABLE ROW LEVEL SECURITY;

-- Control Sets Policies
CREATE POLICY "Users can view control sets they have access to" ON control_sets
    FOR SELECT USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM audit_team_members
            WHERE audit_id = control_sets.audit_id
        )
    );

CREATE POLICY "Users can create control sets" ON control_sets
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own control sets" ON control_sets
    FOR UPDATE USING (
        auth.uid() = created_by OR
        auth.uid() IN (
            SELECT user_id FROM audit_team_members
            WHERE audit_id = control_sets.audit_id
            AND role IN ('lead_auditor', 'supervisor_auditor')
        )
    );

CREATE POLICY "Users can delete their own control sets" ON control_sets
    FOR DELETE USING (auth.uid() = created_by);

-- Controls Policies
CREATE POLICY "Users can view controls they have access to" ON controls
    FOR SELECT USING (
        auth.uid() = created_by OR
        auth.uid() = owner_id OR
        auth.uid() IN (
            SELECT user_id FROM audit_team_members
            WHERE audit_id = controls.audit_id
        )
    );

CREATE POLICY "Users can create controls" ON controls
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update controls they own or created" ON controls
    FOR UPDATE USING (
        auth.uid() = created_by OR
        auth.uid() = owner_id OR
        auth.uid() IN (
            SELECT user_id FROM audit_team_members
            WHERE audit_id = controls.audit_id
            AND role IN ('lead_auditor', 'supervisor_auditor')
        )
    );

CREATE POLICY "Users can delete controls they created" ON controls
    FOR DELETE USING (auth.uid() = created_by);

-- AI Configurations Policies
CREATE POLICY "Users can only access their own AI configurations" ON ai_configurations
    FOR ALL USING (auth.uid() = created_by);

-- AI Generation Logs Policies
CREATE POLICY "Users can only view their own AI generation logs" ON ai_generation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI generation logs" ON ai_generation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Control Tests Policies
CREATE POLICY "Users can view control tests they have access to" ON control_tests
    FOR SELECT USING (
        auth.uid() = created_by OR
        auth.uid() = tester_id OR
        auth.uid() IN (
            SELECT user_id FROM audit_team_members
            WHERE audit_id = control_tests.audit_id
        )
    );

CREATE POLICY "Users can create control tests" ON control_tests
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update control tests they created" ON control_tests
    FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = tester_id);

-- =============================================================================
-- STEP 6: Sample Data and Default Configurations
-- =============================================================================

-- Insert sample frameworks (optional)
INSERT INTO control_sets (
    name, description, framework, controls_count, ai_generated, created_by
) VALUES (
    'Sample ISO 27001 Controls',
    'Sample control set based on ISO 27001 Information Security Management',
    'ISO 27001',
    0,
    FALSE,
    auth.uid()
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 7: Grant Permissions
-- =============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role for background operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================================
-- STEP 8: Verification Queries
-- =============================================================================

-- Verify tables were created successfully
DO $$
BEGIN
    RAISE NOTICE 'Verifying table creation...';

    -- Check if all tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'control_sets') THEN
        RAISE NOTICE '✓ control_sets table created successfully';
    ELSE
        RAISE EXCEPTION '✗ control_sets table not found';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'controls') THEN
        RAISE NOTICE '✓ controls table created successfully';
    ELSE
        RAISE EXCEPTION '✗ controls table not found';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_configurations') THEN
        RAISE NOTICE '✓ ai_configurations table created successfully';
    ELSE
        RAISE EXCEPTION '✗ ai_configurations table not found';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_generation_logs') THEN
        RAISE NOTICE '✓ ai_generation_logs table created successfully';
    ELSE
        RAISE EXCEPTION '✗ ai_generation_logs table not found';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'control_tests') THEN
        RAISE NOTICE '✓ control_tests table created successfully';
    ELSE
        RAISE EXCEPTION '✗ control_tests table not found';
    END IF;

    RAISE NOTICE 'All tables created successfully!';
    RAISE NOTICE 'Controls module database setup completed.';
END $$;

-- Show summary of created objects
SELECT
    'Tables' as object_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('control_sets', 'controls', 'ai_configurations', 'ai_generation_logs', 'control_tests')

UNION ALL

SELECT
    'Indexes' as object_type,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'

UNION ALL

SELECT
    'Enums' as object_type,
    COUNT(*) as count
FROM pg_type
WHERE typname LIKE '%_enum';

-- =============================================================================
-- SCRIPT COMPLETION
-- =============================================================================

/*
CONTROLS MODULE SETUP COMPLETED SUCCESSFULLY!

Next Steps:
1. Update user roles and permissions as needed
2. Configure AI providers in the application
3. Test the controls module functionality
4. Create sample control sets and controls

Tables Created:
- control_sets: Store control set information
- controls: Store individual control details
- ai_configurations: Store AI provider configurations
- ai_generation_logs: Track AI usage and requests
- control_tests: Store control testing results

Features Enabled:
- Row Level Security (RLS) for data isolation
- Automatic timestamp updates
- Control set count maintenance
- Performance indexes
- Data validation constraints

For troubleshooting or additional setup, refer to:
- CONTROLS_MODULE_DOCUMENTATION.md
- CONTROLS_SETUP.md
*/
