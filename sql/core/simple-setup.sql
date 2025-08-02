-- AI Auditor GRC Simple Database Setup
-- This script creates only the database tables and schema
-- Users will sign up normally through the application UI

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS evidence_files CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS ai_requests CASCADE;
DROP TABLE IF EXISTS ai_configurations CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS control_tests CASCADE;
DROP TABLE IF EXISTS findings CASCADE;
DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS risks CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS business_units CASCADE;

-- Business Units table (no dependencies)
CREATE TABLE business_units (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID,
    parent_id UUID REFERENCES business_units(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN (
        'super_admin', 'admin', 'cro', 'supervisor_auditor',
        'auditor', 'reviewer', 'viewer', 'business_unit_manager', 'business_unit_user'
    )),
    department VARCHAR(100),
    business_unit_id UUID REFERENCES business_units(id),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audits table
CREATE TABLE audits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN (
        'internal', 'external', 'compliance', 'operational',
        'financial', 'it', 'quality', 'environmental'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'planning', 'in_progress', 'testing',
        'reporting', 'completed', 'cancelled'
    )),
    business_unit_id UUID REFERENCES business_units(id),
    lead_auditor_id UUID REFERENCES users(id),
    team_members UUID[] DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    planned_hours INTEGER,
    actual_hours INTEGER,
    objectives TEXT[],
    scope TEXT,
    methodology TEXT,
    ai_generated BOOLEAN DEFAULT false,
    ai_model_used VARCHAR(100),
    approval_status VARCHAR(50) DEFAULT 'draft' CHECK (approval_status IN (
        'draft', 'pending_approval', 'approved', 'rejected', 'revision_required'
    )),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risks table
CREATE TABLE risks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'operational', 'financial', 'compliance', 'strategic',
        'reputation', 'technology', 'human_resources'
    )),
    business_unit_id UUID REFERENCES business_units(id),
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER CHECK (impact >= 1 AND impact <= 5),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    inherent_risk_score INTEGER,
    residual_risk_score INTEGER,
    mitigation_strategy TEXT,
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'identified' CHECK (status IN (
        'identified', 'assessed', 'mitigated', 'accepted', 'transferred'
    )),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controls table
CREATE TABLE controls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    control_type VARCHAR(50) NOT NULL CHECK (control_type IN (
        'preventive', 'detective', 'corrective', 'directive'
    )),
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN (
        'continuous', 'daily', 'weekly', 'monthly', 'quarterly', 'annually', 'ad_hoc'
    )),
    business_unit_id UUID REFERENCES business_units(id),
    process_area VARCHAR(100),
    owner_id UUID REFERENCES users(id),
    risk_ids UUID[],
    testing_procedure TEXT,
    evidence_requirements TEXT[],
    effectiveness VARCHAR(50) DEFAULT 'not_tested' CHECK (effectiveness IN (
        'not_tested', 'effective', 'partially_effective', 'ineffective'
    )),
    last_tested_date DATE,
    next_test_date DATE,
    automated BOOLEAN DEFAULT false,
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Control Tests table
CREATE TABLE control_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    control_id UUID NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    tester_id UUID NOT NULL REFERENCES users(id),
    test_date DATE NOT NULL,
    test_result VARCHAR(50) NOT NULL CHECK (test_result IN (
        'passed', 'failed', 'not_applicable', 'not_tested'
    )),
    sample_size INTEGER,
    exceptions_noted INTEGER DEFAULT 0,
    testing_notes TEXT,
    evidence_files TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Findings table
CREATE TABLE findings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    control_id UUID REFERENCES controls(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN (
        'open', 'in_progress', 'resolved', 'closed', 'deferred'
    )),
    risk_rating VARCHAR(20) NOT NULL CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')),
    business_impact TEXT,
    root_cause TEXT,
    recommendation TEXT,
    management_response TEXT,
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    evidence_files TEXT[],
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'risk')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Steps table
CREATE TABLE workflow_steps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    assignee_role VARCHAR(50) NOT NULL,
    assignee_id UUID REFERENCES users(id),
    required BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Requests table
CREATE TABLE approval_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'risk')),
    entity_id UUID NOT NULL,
    workflow_id UUID REFERENCES workflows(id),
    current_step INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN (
        'pending_approval', 'approved', 'rejected', 'revision_required'
    )),
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Configurations table
CREATE TABLE ai_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('ollama', 'openai', 'claude', 'gemini')),
    model_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT,
    api_key TEXT,
    max_tokens INTEGER DEFAULT 2000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Requests table
CREATE TABLE ai_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    response TEXT,
    tokens_used INTEGER,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'control_generation', 'risk_assessment', 'audit_plan', 'finding_analysis'
    )),
    entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'risk')),
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    attachments TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence Files table
CREATE TABLE evidence_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'test')),
    entity_id UUID NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'audit_assigned', 'finding_created', 'approval_required',
        'due_date_reminder', 'test_overdue', 'comment_added'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_business_unit ON users(business_unit_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_business_unit ON audits(business_unit_id);
CREATE INDEX idx_audits_lead_auditor ON audits(lead_auditor_id);
CREATE INDEX idx_risks_business_unit ON risks(business_unit_id);
CREATE INDEX idx_risks_owner ON risks(owner_id);
CREATE INDEX idx_controls_business_unit ON controls(business_unit_id);
CREATE INDEX idx_controls_owner ON controls(owner_id);
CREATE INDEX idx_findings_audit ON findings(audit_id);
CREATE INDEX idx_findings_assigned_to ON findings(assigned_to);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_business_units_updated_at BEFORE UPDATE ON business_units FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_control_tests_updated_at BEFORE UPDATE ON control_tests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON ai_configurations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies - allow all authenticated users to read/write for now
-- In production, you would want more restrictive policies

-- Users policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Business units policies
CREATE POLICY "Users can view business units" ON business_units FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage business units" ON business_units FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
);

-- Audits policies
CREATE POLICY "Users can view audits" ON audits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auditors can manage audits" ON audits FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'auditor', 'supervisor_auditor')
    )
);

-- Risks policies
CREATE POLICY "Users can view risks" ON risks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage risks" ON risks FOR ALL USING (auth.role() = 'authenticated');

-- Controls policies
CREATE POLICY "Users can view controls" ON controls FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage controls" ON controls FOR ALL USING (auth.role() = 'authenticated');

-- Findings policies
CREATE POLICY "Users can view findings" ON findings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage findings" ON findings FOR ALL USING (auth.role() = 'authenticated');

-- Other tables - allow all for authenticated users (adjust as needed)
CREATE POLICY "Users can manage control_tests" ON control_tests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage workflows" ON workflows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage workflow_steps" ON workflow_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage approval_requests" ON approval_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage ai_configurations" ON ai_configurations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage ai_requests" ON ai_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage comments" ON comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage evidence_files" ON evidence_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view audit_logs" ON audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Add the foreign key constraint for business_units.manager_id after users table exists
ALTER TABLE business_units ADD CONSTRAINT fk_business_units_manager
    FOREIGN KEY (manager_id) REFERENCES users(id);

-- Insert sample business units
INSERT INTO business_units (id, name, code, description, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'IT', 'IT Department', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Finance', 'FIN', 'Finance Department', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Human Resources', 'HR', 'Human Resources Department', true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'OPS', 'Operations Department', true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-files', 'evidence-files', false)
ON CONFLICT (id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE users IS 'Extended user profiles with role-based access control';
COMMENT ON TABLE business_units IS 'Organizational units for audit scope and assignment';
COMMENT ON TABLE audits IS 'Main audit records with lifecycle management';
COMMENT ON TABLE risks IS 'Risk register with assessment and mitigation tracking';
COMMENT ON TABLE controls IS 'Control library with testing procedures and effectiveness tracking';
COMMENT ON TABLE findings IS 'Audit findings with severity and remediation tracking';
COMMENT ON TABLE workflows IS 'Configurable approval workflows for various entities';
COMMENT ON TABLE ai_configurations IS 'AI model configurations for different providers';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system activities';

-- Setup complete!
-- Database schema is ready. Users can now sign up through the application.
-- First user to sign up should manually update their role to 'super_admin' in the users table.
