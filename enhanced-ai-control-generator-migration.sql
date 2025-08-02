-- Enhanced AI Control Generator Database Migration
-- Run this script in your Supabase SQL editor to add support for enhanced AI control generation features
-- Version: 1.0
-- Date: 2024-12-19

-- =============================================================================
-- ENHANCED AI CONTROL GENERATOR MIGRATION
-- =============================================================================

-- Add enhanced fields to existing controls table if they don't exist
DO $$
BEGIN
    -- Add control_code field if it doesn't exist (for better control identification)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'control_code'
    ) THEN
        ALTER TABLE controls ADD COLUMN control_code VARCHAR(50);
        -- Update existing controls to have control codes based on their existing code
        UPDATE controls SET control_code = code WHERE control_code IS NULL;
        -- Make control_code unique
        ALTER TABLE controls ADD CONSTRAINT controls_control_code_unique UNIQUE (control_code);
    END IF;

    -- Add process_area field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'process_area'
    ) THEN
        ALTER TABLE controls ADD COLUMN process_area VARCHAR(100);
        -- Set default process areas based on existing data
        UPDATE controls SET process_area = 'General' WHERE process_area IS NULL;
    END IF;

    -- Add testing_procedure field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'testing_procedure'
    ) THEN
        ALTER TABLE controls ADD COLUMN testing_procedure TEXT;
    END IF;

    -- Add evidence_requirements field if it doesn't exist (convert from array to text)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'evidence_requirements_text'
    ) THEN
        ALTER TABLE controls ADD COLUMN evidence_requirements_text TEXT;
        -- Convert existing array evidence_requirements to text format
        UPDATE controls SET evidence_requirements_text = array_to_string(evidence_requirements, E'\n• ', '• ')
        WHERE evidence_requirements IS NOT NULL AND array_length(evidence_requirements, 1) > 0;
    END IF;

    -- Add effectiveness field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'effectiveness'
    ) THEN
        ALTER TABLE controls ADD COLUMN effectiveness VARCHAR(50) DEFAULT 'not_tested'
        CHECK (effectiveness IN ('not_tested', 'effective', 'ineffective', 'partially_effective'));
    END IF;

    -- Add is_automated field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'is_automated'
    ) THEN
        ALTER TABLE controls ADD COLUMN is_automated BOOLEAN DEFAULT false;
    END IF;

    -- Add framework field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'framework'
    ) THEN
        ALTER TABLE controls ADD COLUMN framework VARCHAR(50);
    END IF;

    -- Add industry field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'industry'
    ) THEN
        ALTER TABLE controls ADD COLUMN industry VARCHAR(50);
    END IF;

    -- Add risk_level field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'risk_level'
    ) THEN
        ALTER TABLE controls ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medium'
        CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
    END IF;
END $$;

-- =============================================================================
-- CREATE CONTROL SETS TABLE (if it doesn't exist)
-- =============================================================================

CREATE TABLE IF NOT EXISTS control_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(100),
    industry VARCHAR(100),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false,
    controls_count INTEGER DEFAULT 0,
    tested_controls INTEGER DEFAULT 0,
    effective_controls INTEGER DEFAULT 0
);

-- Add control_set_id to controls table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'controls' AND column_name = 'control_set_id'
    ) THEN
        ALTER TABLE controls ADD COLUMN control_set_id UUID REFERENCES control_sets(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================================================
-- CREATE AI CONTROL TEMPLATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_control_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(100),
    industry VARCHAR(100),
    process_area VARCHAR(100),
    risk_level VARCHAR(20) DEFAULT 'medium',
    template_data JSONB NOT NULL, -- Stores the control template structure
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- =============================================================================
-- CREATE AI GENERATION LOGS TABLE (Enhanced)
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    audit_id UUID REFERENCES audits(id),
    control_set_id UUID REFERENCES control_sets(id),
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    request_type VARCHAR(50) DEFAULT 'control_generation',
    prompt_context JSONB, -- Stores the generation configuration
    response_data JSONB, -- Stores the AI response
    generated_controls_count INTEGER DEFAULT 0,
    generation_status VARCHAR(50) DEFAULT 'success'
        CHECK (generation_status IN ('success', 'failed', 'timeout', 'error')),
    error_message TEXT,
    processing_time_ms INTEGER,
    token_usage JSONB, -- Stores token usage information
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ENHANCE AI CONFIGURATIONS TABLE
-- =============================================================================

-- Add enhanced fields to ai_configurations if they don't exist
DO $$
BEGIN
    -- Add configuration metadata
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'configuration_name'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN configuration_name VARCHAR(100);
        UPDATE ai_configurations SET configuration_name = provider || '_' || model_name WHERE configuration_name IS NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'description'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN description TEXT;
    END IF;

    -- Add usage tracking
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'usage_count'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'last_used_at'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN last_used_at TIMESTAMPTZ;
    END IF;

    -- Add rate limiting fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'rate_limit_requests_per_minute'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN rate_limit_requests_per_minute INTEGER DEFAULT 60;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'daily_request_limit'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN daily_request_limit INTEGER DEFAULT 1000;
    END IF;

    -- Add quality metrics
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'success_rate'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN success_rate DECIMAL(5,2) DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ai_configurations' AND column_name = 'average_response_time_ms'
    ) THEN
        ALTER TABLE ai_configurations ADD COLUMN average_response_time_ms INTEGER DEFAULT 0;
    END IF;
END $$;

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for control_sets
CREATE INDEX IF NOT EXISTS idx_control_sets_audit_id ON control_sets(audit_id);
CREATE INDEX IF NOT EXISTS idx_control_sets_created_by ON control_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_control_sets_framework ON control_sets(framework);
CREATE INDEX IF NOT EXISTS idx_control_sets_created_at ON control_sets(created_at);

-- Enhanced indexes for controls
CREATE INDEX IF NOT EXISTS idx_controls_control_set_id ON controls(control_set_id);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON controls(framework);
CREATE INDEX IF NOT EXISTS idx_controls_process_area ON controls(process_area);
CREATE INDEX IF NOT EXISTS idx_controls_effectiveness ON controls(effectiveness);
CREATE INDEX IF NOT EXISTS idx_controls_is_automated ON controls(is_automated);
CREATE INDEX IF NOT EXISTS idx_controls_risk_level ON controls(risk_level);

-- Indexes for ai_control_templates
CREATE INDEX IF NOT EXISTS idx_ai_control_templates_framework ON ai_control_templates(framework);
CREATE INDEX IF NOT EXISTS idx_ai_control_templates_industry ON ai_control_templates(industry);
CREATE INDEX IF NOT EXISTS idx_ai_control_templates_process_area ON ai_control_templates(process_area);
CREATE INDEX IF NOT EXISTS idx_ai_control_templates_created_by ON ai_control_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_control_templates_is_public ON ai_control_templates(is_public);

-- Indexes for ai_generation_logs
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_audit_id ON ai_generation_logs(audit_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_control_set_id ON ai_generation_logs(control_set_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_provider ON ai_generation_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_status ON ai_generation_logs(generation_status);

-- Indexes for enhanced ai_configurations
CREATE INDEX IF NOT EXISTS idx_ai_configurations_provider ON ai_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_is_active ON ai_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_configurations_last_used_at ON ai_configurations(last_used_at);

-- =============================================================================
-- CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for new tables
DROP TRIGGER IF EXISTS update_control_sets_updated_at ON control_sets;
CREATE TRIGGER update_control_sets_updated_at
    BEFORE UPDATE ON control_sets
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_control_templates_updated_at ON ai_control_templates;
CREATE TRIGGER update_ai_control_templates_updated_at
    BEFORE UPDATE ON ai_control_templates
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================================================
-- CREATE FUNCTIONS FOR CONTROL SET MANAGEMENT
-- =============================================================================

-- Function to update control set counts
CREATE OR REPLACE FUNCTION update_control_set_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the control set counts when controls are modified
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE control_sets SET
            controls_count = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = NEW.control_set_id AND is_deleted = false
            ),
            tested_controls = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = NEW.control_set_id
                AND is_deleted = false
                AND effectiveness != 'not_tested'
            ),
            effective_controls = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = NEW.control_set_id
                AND is_deleted = false
                AND effectiveness = 'effective'
            ),
            updated_at = NOW()
        WHERE id = NEW.control_set_id;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        UPDATE control_sets SET
            controls_count = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = OLD.control_set_id AND is_deleted = false
            ),
            tested_controls = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = OLD.control_set_id
                AND is_deleted = false
                AND effectiveness != 'not_tested'
            ),
            effective_controls = (
                SELECT COUNT(*) FROM controls
                WHERE control_set_id = OLD.control_set_id
                AND is_deleted = false
                AND effectiveness = 'effective'
            ),
            updated_at = NOW()
        WHERE id = OLD.control_set_id;

        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for automatic count updates
DROP TRIGGER IF EXISTS update_control_set_counts_trigger ON controls;
CREATE TRIGGER update_control_set_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON controls
    FOR EACH ROW EXECUTE FUNCTION update_control_set_counts();

-- =============================================================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE control_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_control_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Control Sets policies
CREATE POLICY "Users can view control sets they have access to" ON control_sets
    FOR SELECT USING (
        created_by = auth.uid() OR
        audit_id IN (
            SELECT id FROM audits WHERE
            lead_auditor_id = auth.uid() OR
            created_by = auth.uid() OR
            auth.uid() = ANY(team_members)
        )
    );

CREATE POLICY "Users can create control sets" ON control_sets
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own control sets" ON control_sets
    FOR UPDATE USING (
        created_by = auth.uid() OR
        audit_id IN (
            SELECT id FROM audits WHERE
            lead_auditor_id = auth.uid() OR
            created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own control sets" ON control_sets
    FOR DELETE USING (
        created_by = auth.uid() OR
        audit_id IN (
            SELECT id FROM audits WHERE
            lead_auditor_id = auth.uid() OR
            created_by = auth.uid()
        )
    );

-- AI Control Templates policies
CREATE POLICY "Users can view public templates and their own" ON ai_control_templates
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON ai_control_templates
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON ai_control_templates
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" ON ai_control_templates
    FOR DELETE USING (created_by = auth.uid());

-- AI Generation Logs policies
CREATE POLICY "Users can view their own generation logs" ON ai_generation_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create generation logs" ON ai_generation_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- INSERT SAMPLE DATA FOR ENHANCED FEATURES
-- =============================================================================

-- Insert sample control sets (only if not exists)
INSERT INTO control_sets (name, description, framework, industry, created_by)
SELECT
    'Default ISO 27001 Control Set',
    'Standard ISO 27001 information security management controls',
    'ISO 27001',
    'Technology',
    '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (
    SELECT 1 FROM control_sets WHERE name = 'Default ISO 27001 Control Set'
);

INSERT INTO control_sets (name, description, framework, industry, created_by)
SELECT
    'Default SOX Control Set',
    'Standard Sarbanes-Oxley financial reporting controls',
    'SOX',
    'Financial Services',
    '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (
    SELECT 1 FROM control_sets WHERE name = 'Default SOX Control Set'
);

-- Insert sample AI control templates
INSERT INTO ai_control_templates (name, description, framework, industry, process_area, template_data, is_public, created_by)
SELECT
    'Healthcare HIPAA Access Controls',
    'Standard access control templates for healthcare organizations',
    'HIPAA',
    'Healthcare',
    'Access Management',
    '{"controls": [{"title": "Patient Data Access Control", "description": "Implement role-based access controls for patient health information", "control_type": "preventive", "frequency": "continuous"}]}',
    true,
    '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (
    SELECT 1 FROM ai_control_templates WHERE name = 'Healthcare HIPAA Access Controls'
);

INSERT INTO ai_control_templates (name, description, framework, industry, process_area, template_data, is_public, created_by)
SELECT
    'Financial SOX Controls',
    'Standard SOX compliance controls for financial organizations',
    'SOX',
    'Financial Services',
    'Financial Reporting',
    '{"controls": [{"title": "Financial Close Process Control", "description": "Ensure proper authorization and review of financial close procedures", "control_type": "preventive", "frequency": "monthly"}]}',
    true,
    '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (
    SELECT 1 FROM ai_control_templates WHERE name = 'Financial SOX Controls'
);

-- Update existing controls to link to control sets where possible
UPDATE controls SET
    control_set_id = (
        SELECT id FROM control_sets
        WHERE framework = 'ISO 27001'
        AND name = 'Default ISO 27001 Control Set'
        LIMIT 1
    ),
    framework = 'ISO 27001',
    process_area = COALESCE(process_area, 'General'),
    effectiveness = COALESCE(effectiveness, 'not_tested'),
    is_automated = COALESCE(is_automated, false)
WHERE control_set_id IS NULL AND code LIKE 'IT-%';

UPDATE controls SET
    control_set_id = (
        SELECT id FROM control_sets
        WHERE framework = 'SOX'
        AND name = 'Default SOX Control Set'
        LIMIT 1
    ),
    framework = 'SOX',
    process_area = COALESCE(process_area, 'Financial Reporting'),
    effectiveness = COALESCE(effectiveness, 'not_tested'),
    is_automated = COALESCE(is_automated, false)
WHERE control_set_id IS NULL AND code LIKE 'FIN-%';

-- =============================================================================
-- CREATE VIEWS FOR ENHANCED REPORTING
-- =============================================================================

-- View for control set statistics
CREATE OR REPLACE VIEW control_set_stats AS
SELECT
    cs.id,
    cs.name,
    cs.framework,
    cs.industry,
    cs.controls_count,
    cs.tested_controls,
    cs.effective_controls,
    CASE
        WHEN cs.controls_count > 0 THEN
            ROUND((cs.tested_controls::decimal / cs.controls_count * 100), 2)
        ELSE 0
    END as testing_percentage,
    CASE
        WHEN cs.tested_controls > 0 THEN
            ROUND((cs.effective_controls::decimal / cs.tested_controls * 100), 2)
        ELSE 0
    END as effectiveness_percentage,
    cs.created_at,
    cs.updated_at
FROM control_sets cs
WHERE cs.is_deleted = false;

-- View for AI generation analytics
CREATE OR REPLACE VIEW ai_generation_analytics AS
SELECT
    DATE(created_at) as generation_date,
    provider,
    model,
    COUNT(*) as total_generations,
    SUM(generated_controls_count) as total_controls_generated,
    AVG(generated_controls_count) as avg_controls_per_generation,
    AVG(processing_time_ms) as avg_processing_time_ms,
    COUNT(CASE WHEN generation_status = 'success' THEN 1 END) as successful_generations,
    ROUND(
        COUNT(CASE WHEN generation_status = 'success' THEN 1 END)::decimal / COUNT(*) * 100,
        2
    ) as success_rate_percentage
FROM ai_generation_logs
GROUP BY DATE(created_at), provider, model
ORDER BY generation_date DESC, provider, model;

-- =============================================================================
-- CREATE FUNCTIONS FOR AI TEMPLATE MANAGEMENT
-- =============================================================================

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ai_control_templates
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update AI configuration statistics
CREATE OR REPLACE FUNCTION update_ai_config_stats(
    config_id UUID,
    success BOOLEAN,
    response_time_ms INTEGER
)
RETURNS void AS $$
DECLARE
    current_usage INTEGER;
    current_success_rate DECIMAL;
    current_avg_time INTEGER;
BEGIN
    -- Get current stats
    SELECT usage_count, success_rate, average_response_time_ms
    INTO current_usage, current_success_rate, current_avg_time
    FROM ai_configurations
    WHERE id = config_id;

    -- Update usage count and last used timestamp
    UPDATE ai_configurations SET
        usage_count = current_usage + 1,
        last_used_at = NOW(),
        -- Calculate new success rate
        success_rate = CASE
            WHEN success THEN
                ((current_success_rate * current_usage) + 100) / (current_usage + 1)
            ELSE
                (current_success_rate * current_usage) / (current_usage + 1)
        END,
        -- Calculate new average response time
        average_response_time_ms =
            ((current_avg_time * current_usage) + response_time_ms) / (current_usage + 1),
        updated_at = NOW()
    WHERE id = config_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON control_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_control_templates TO authenticated;
GRANT SELECT, INSERT ON ai_generation_logs TO authenticated;
GRANT SELECT ON control_set_stats TO authenticated;
GRANT SELECT ON ai_generation_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_template_usage TO authenticated;
GRANT EXECUTE ON FUNCTION update_ai_config_stats TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Add migration tracking
CREATE TABLE IF NOT EXISTS migration_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_by UUID REFERENCES users(id)
);

INSERT INTO migration_history (migration_name, applied_by)
VALUES ('enhanced_ai_control_generator_v1.0', auth.uid())
ON CONFLICT DO NOTHING;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced AI Control Generator migration completed successfully!';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '- Enhanced controls table with new fields';
    RAISE NOTICE '- Control sets table for grouping controls';
    RAISE NOTICE '- AI control templates for reusable patterns';
    RAISE NOTICE '- Enhanced AI generation logging';
    RAISE NOTICE '- Performance indexes and RLS policies';
    RAISE NOTICE '- Analytics views and management functions';
END $$;
