-- AI Auditor GRC Complete Database Setup
-- This script creates the complete database schema and demo users
-- Run this entire script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- First, let's create the auth users (this must come first)
-- These will be referenced by our application tables

-- Super Admin User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'admin@aiauditor.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "System", "last_name": "Administrator"}'
) ON CONFLICT (id) DO NOTHING;

-- Auditor User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'auditor@aiauditor.com',
    crypt('auditor123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "John", "last_name": "Smith"}'
) ON CONFLICT (id) DO NOTHING;

-- Viewer User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated',
    'authenticated',
    'viewer@aiauditor.com',
    crypt('viewer123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Jane", "last_name": "Doe"}'
) ON CONFLICT (id) DO NOTHING;

-- CRO User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated',
    'authenticated',
    'cro@aiauditor.com',
    crypt('cro123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Michael", "last_name": "Johnson"}'
) ON CONFLICT (id) DO NOTHING;

-- Business Unit Manager User
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '55555555-5555-5555-5555-555555555555',
    'authenticated',
    'authenticated',
    'manager@aiauditor.com',
    crypt('manager123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Sarah", "last_name": "Wilson"}'
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding identities
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES
    ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "admin@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "auditor@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "viewer@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub": "44444444-4444-4444-4444-444444444444", "email": "cro@aiauditor.com"}', 'email', NOW(), NOW(), NOW()),
    ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '{"sub": "55555555-5555-5555-5555-555555555555", "email": "manager@aiauditor.com"}', 'email', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Now create the application tables
-- Business Units table (no dependencies)
CREATE TABLE IF NOT EXISTS business_units (
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
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
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

-- Add foreign key constraint for business_units.manager_id after users table exists
ALTER TABLE business_units ADD CONSTRAINT fk_business_units_manager
    FOREIGN KEY (manager_id) REFERENCES users(id);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audit_type VARCHAR(50) NOT NULL CHECK (audit_type IN (
        'internal', 'external', 'compliance', 'operational',
        'financial', 'it', 'quality', 'environmental'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'planning', 'in_progress', 'testing',
        'reporting', 'completed', 'cancelled', 'on_hold'
    )),
    business_unit_id UUID NOT NULL REFERENCES business_units(id),
    lead_auditor_id UUID NOT NULL REFERENCES users(id),
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
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'operational', 'financial', 'compliance', 'strategic',
        'reputation', 'technology', 'human_resources'
    )),
    business_unit_id UUID NOT NULL REFERENCES business_units(id),
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER CHECK (impact >= 1 AND impact <= 5),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    inherent_risk_score INTEGER,
    residual_risk_score INTEGER,
    mitigation_strategy TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'identified' CHECK (status IN (
        'identified', 'assessed', 'mitigated', 'accepted', 'transferred'
    )),
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controls table
CREATE TABLE IF NOT EXISTS controls (
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
    business_unit_id UUID NOT NULL REFERENCES business_units(id),
    process_area VARCHAR(100),
    owner_id UUID NOT NULL REFERENCES users(id),
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
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Control Tests table
CREATE TABLE IF NOT EXISTS control_tests (
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
CREATE TABLE IF NOT EXISTS findings (
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
    assigned_to UUID NOT NULL REFERENCES users(id),
    due_date DATE,
    evidence_files TEXT[],
    ai_generated BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TABLE IF NOT EXISTS workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'risk')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
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
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('audit', 'finding', 'control', 'risk')),
    entity_id UUID NOT NULL,
    workflow_id UUID NOT NULL REFERENCES workflows(id),
    current_step INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending_approval' CHECK (status IN (
        'pending_approval', 'approved', 'rejected', 'revision_required'
    )),
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Configurations table
CREATE TABLE IF NOT EXISTS ai_configurations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('ollama', 'openai', 'claude', 'gemini')),
    model_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT,
    api_key TEXT,
    max_tokens INTEGER DEFAULT 2000,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Requests table
CREATE TABLE IF NOT EXISTS ai_requests (
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
CREATE TABLE IF NOT EXISTS comments (
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
CREATE TABLE IF NOT EXISTS evidence_files (
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
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS audit_logs (
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_business_unit ON users(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_business_unit ON audits(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_audits_lead_auditor ON audits(lead_auditor_id);
CREATE INDEX IF NOT EXISTS idx_risks_business_unit ON risks(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_risks_owner ON risks(owner_id);
CREATE INDEX IF NOT EXISTS idx_controls_business_unit ON controls(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_controls_owner ON controls(owner_id);
CREATE INDEX IF NOT EXISTS idx_findings_audit ON findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_findings_assigned_to ON findings(assigned_to);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

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

-- Basic RLS policies
-- Users can read their own profile and others based on role
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
);

-- Business units visibility based on role and assignment
CREATE POLICY "Users can view their business unit" ON business_units FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND business_unit_id = business_units.id
    ) OR
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'cro')
    )
);

-- Audits visibility based on role and assignment
CREATE POLICY "Users can view assigned audits" ON audits FOR SELECT USING (
    lead_auditor_id = auth.uid() OR
    auth.uid() = ANY(team_members) OR
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'cro', 'supervisor_auditor')
    )
);

-- Insert sample data
INSERT INTO business_units (id, name, code, description, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Information Technology', 'IT', 'IT Department', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Finance', 'FIN', 'Finance Department', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Human Resources', 'HR', 'Human Resources Department', true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Operations', 'OPS', 'Operations Department', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, role, department, business_unit_id, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@aiauditor.com', 'System', 'Administrator', 'super_admin', 'IT', '550e8400-e29b-41d4-a716-446655440001', true),
    ('22222222-2222-2222-2222-222222222222', 'auditor@aiauditor.com', 'John', 'Smith', 'auditor', 'Audit', '550e8400-e29b-41d4-a716-446655440001', true),
    ('33333333-3333-3333-3333-333333333333', 'viewer@aiauditor.com', 'Jane', 'Doe', 'viewer', 'Finance', '550e8400-e29b-41d4-a716-446655440002', true),
    ('44444444-4444-4444-4444-444444444444', 'cro@aiauditor.com', 'Michael', 'Johnson', 'cro', 'Risk Management', '550e8400-e29b-41d4-a716-446655440001', true),
    ('55555555-5555-5555-5555-555555555555', 'manager@aiauditor.com', 'Sarah', 'Wilson', 'business_unit_manager', 'IT', '550e8400-e29b-41d4-a716-446655440001', true)
ON CONFLICT (id) DO NOTHING;

-- Update business units with managers
UPDATE business_units SET manager_id = '55555555-5555-5555-5555-555555555555' WHERE code = 'IT';
UPDATE business_units SET manager_id = '33333333-3333-3333-3333-333333333333' WHERE code = 'FIN';

-- Insert sample risks
INSERT INTO risks (title, description, category, business_unit_id, probability, impact, risk_level, inherent_risk_score, residual_risk_score, mitigation_strategy, owner_id, created_by) VALUES
    ('Data Breach Risk', 'Risk of unauthorized access to sensitive customer data', 'technology', '550e8400-e29b-41d4-a716-446655440001', 4, 5, 'high', 20, 12, 'Implement multi-factor authentication and encryption', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111'),
    ('Regulatory Compliance Risk', 'Risk of non-compliance with financial regulations', 'compliance', '550e8400-e29b-41d4-a716-446655440002', 3, 4, 'medium', 12, 8, 'Regular compliance training and monitoring', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
    ('System Downtime Risk', 'Risk of critical system failures affecting operations', 'operational', '550e8400-e29b-41d4-a716-446655440001', 2, 4, 'medium', 8, 6, 'Implement redundancy and backup systems', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Insert sample controls
INSERT INTO controls (code, title, description, control_type, frequency, business_unit_id, process_area, owner_id, testing_procedure, evidence_requirements, created_by) VALUES
    ('IT-001', 'Password Policy Control', 'Ensures strong password requirements are enforced', 'preventive', 'continuous', '550e8400-e29b-41d4-a716-446655440001', 'Access Management', '55555555-5555-5555-5555-555555555555', 'Review password policy settings and test password creation', ARRAY['Password policy documentation', 'System configuration screenshots'], '11111111-1111-1111-1111-111111111111'),
    ('FIN-001', 'Monthly Financial Reconciliation', 'Monthly reconciliation of financial accounts', 'detective', 'monthly', '550e8400-e29b-41d4-a716-446655440002', 'Financial Reporting', '33333333-3333-3333-3333-333333333333', 'Review reconciliation reports and supporting documentation', ARRAY['Reconciliation reports', 'Bank statements', 'Journal entries'], '11111111-1111-1111-1111-111111111111'),
    ('IT-002', 'Data Backup Verification', 'Verification of data backup completeness and integrity', 'detective', 'weekly', '550e8400-e29b-41d4-a716-446655440001', 'Data Management', '55555555-5555-5555-5555-555555555555', 'Test backup restoration and verify data integrity', ARRAY['Backup logs', 'Restoration test results'], '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code) DO NOTHING;

-- Insert sample audits
INSERT INTO audits (title, description, audit_type, status, business_unit_id, lead_auditor_id, team_members, start_date, end_date, planned_hours, objectives, scope, methodology, created_by) VALUES
    ('Annual IT Security Audit', 'Comprehensive review of IT security controls and procedures', 'it', 'in_progress', '550e8400-e29b-41d4-a716-446655440001', '22222222-2222-2222-2222-222222222222', ARRAY['22222222-2222-2222-2222-222222222222'], '2024-01-01', '2024-01-31', 120, ARRAY['Assess IT security controls', 'Review access management', 'Evaluate data protection measures'], 'IT security infrastructure and processes', 'Risk-based audit approach with sampling', '11111111-1111-1111-1111-111111111111'),
    ('Financial Controls Review', 'Review of financial reporting controls and processes', 'financial', 'planning', '550e8400-e29b-41d4-a716-446655440002', '22222222-2222-2222-2222-222222222222', ARRAY['22222222-2222-2222-2222-222222222222'], '2024-02-01', '2024-02-28', 80, ARRAY['Test financial controls', 'Review reconciliation processes', 'Assess SOX compliance'], 'Financial reporting and controls', 'Substantive testing and control evaluation', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Insert sample findings
INSERT INTO findings (audit_id, control_id, title, description, severity, risk_rating, business_impact, root_cause, recommendation, assigned_to, due_date, created_by) VALUES
    ((SELECT id FROM audits WHERE title = 'Annual IT Security Audit'), (SELECT id FROM controls WHERE code = 'IT-001'), 'Weak Password Requirements', 'Current password policy does not meet industry standards for complexity', 'high', 'high', 'Increased risk of unauthorized access to systems', 'Password policy configuration is outdated', 'Update password policy to require minimum 12 characters with complexity requirements', '55555555-5555-5555-5555-555555555555', '2024-01-30', '22222222-2222-2222-2222-222222222222'),
    ((SELECT id FROM audits WHERE title = 'Annual IT Security Audit'), (SELECT id FROM controls WHERE code = 'IT-002'), 'Incomplete Backup Testing', 'Backup restoration testing is not performed regularly', 'medium', 'medium', 'Risk of data loss in case of system failure', 'Lack of formal backup testing procedures', 'Implement monthly backup restoration testing with documented procedures', '55555555-5555-5555-5555-555555555555', '2024-02-15', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- Insert sample workflows
INSERT INTO workflows (name, description, entity_type, created_by) VALUES
    ('Standard Audit Approval', 'Standard workflow for audit approval process', 'audit', '11111111-1111-1111-1111-111111111111'),
    ('Finding Resolution Process', 'Workflow for finding resolution and closure', 'finding', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Insert sample workflow steps
INSERT INTO workflow_steps (workflow_id, step_order, step_name, assignee_role, required) VALUES
    ((SELECT id FROM workflows WHERE name = 'Standard Audit Approval'), 1, 'Initial Review', 'supervisor_auditor', true),
    ((SELECT id FROM workflows WHERE name = 'Standard Audit Approval'), 2, 'CRO Approval', 'cro', true),
    ((SELECT id FROM workflows WHERE name = 'Standard Audit Approval'), 3, 'Final Approval', 'admin', true),
    ((SELECT id FROM workflows WHERE name = 'Finding Resolution Process'), 1, 'Management Response', 'business_unit_manager', true),
    ((SELECT id FROM workflows WHERE name = 'Finding Resolution Process'), 2, 'Remediation Plan', 'business_unit_manager', true),
    ((SELECT id FROM workflows WHERE name = 'Finding Resolution Process'), 3, 'Implementation Verification', 'auditor', true)
ON CONFLICT DO NOTHING;

-- Insert sample AI configuration
INSERT INTO ai_configurations (provider, model_name, api_endpoint, max_tokens, temperature, created_by) VALUES
    ('ollama', 'llama2', 'http://localhost:11434', 2000, 0.7, '11111111-1111-1111-1111-111111111111'),
    ('openai', 'gpt-4', 'https://api.openai.com/v1', 4000, 0.7, '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Create a function to get user permissions
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = user_id;

    -- Define role hierarchy
    role_hierarchy := CASE user_role
        WHEN 'super_admin' THEN 9
        WHEN 'admin' THEN 8
        WHEN 'cro' THEN 7
        WHEN 'supervisor_auditor' THEN 6
        WHEN 'auditor' THEN 5
        WHEN 'reviewer' THEN 4
        WHEN 'business_unit_manager' THEN 3
        WHEN 'business_unit_user' THEN 2
        WHEN 'viewer' THEN 1
        ELSE 0
    END;

    required_hierarchy := CASE required_role
        WHEN 'super_admin' THEN 9
        WHEN 'admin' THEN 8
        WHEN 'cro' THEN 7
        WHEN 'supervisor_auditor' THEN 6
        WHEN 'auditor' THEN 5
        WHEN 'reviewer' THEN 4
        WHEN 'business_unit_manager' THEN 3
        WHEN 'business_unit_user' THEN 2
        WHEN 'viewer' THEN 1
        ELSE 0
    END;

    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Set up storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at)
VALUES ('evidence-files', 'evidence-files', false, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for evidence files
DROP POLICY IF EXISTS "Users can upload evidence files" ON storage.objects;
CREATE POLICY "Users can upload evidence files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view evidence files they have access to" ON storage.objects;
CREATE POLICY "Users can view evidence files they have access to"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their evidence files" ON storage.objects;
CREATE POLICY "Users can update their evidence files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete their evidence files" ON storage.objects;
CREATE POLICY "Users can delete their evidence files"
ON storage.objects FOR DELETE
USING (bucket_id = 'evidence-files' AND auth.role() = 'authenticated');

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
-- You can now run: npm run dev
-- Login with: admin@aiauditor.com / admin123
