-- AI Auditor GRC - Audit Tables and Core Schema
-- File: 01_audit_tables.sql
-- Description: Core audit tables with comprehensive audit trail functionality

-- Enable necessary extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create audit-specific types only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_type_enum') THEN
        CREATE TYPE audit_type_enum AS ENUM (
            'internal',
            'external',
            'compliance',
            'operational',
            'financial',
            'it',
            'quality',
            'environmental',
            'sox',
            'iso',
            'privacy'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_status_enum') THEN
        CREATE TYPE audit_status_enum AS ENUM (
            'draft',
            'planning',
            'approved',
            'in_progress',
            'fieldwork',
            'testing',
            'reporting',
            'review',
            'completed',
            'cancelled',
            'on_hold'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status_enum') THEN
        CREATE TYPE approval_status_enum AS ENUM (
            'draft',
            'pending_approval',
            'approved',
            'rejected',
            'revision_required'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM (
            'low',
            'medium',
            'high',
            'critical'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_level') THEN
        CREATE TYPE risk_level AS ENUM (
            'low',
            'medium',
            'high',
            'critical'
        );
    END IF;
END
$$;

-- Function to safely add columns to existing tables
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    target_table text,
    target_column text,
    column_definition text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = target_table
        AND c.column_name = target_column
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', target_table, target_column, column_definition);
        RAISE NOTICE 'Added column % to table %', target_column, target_table;
    ELSE
        RAISE NOTICE 'Column % already exists in table %', target_column, target_table;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Enhance existing audits table with additional columns
DO $$
BEGIN
    -- Add new columns that don't exist in the current schema
    PERFORM add_column_if_not_exists('audits', 'audit_number', 'VARCHAR(50)');
    PERFORM add_column_if_not_exists('audits', 'priority', 'priority_level DEFAULT ''medium''');
    PERFORM add_column_if_not_exists('audits', 'department', 'VARCHAR(255)');
    PERFORM add_column_if_not_exists('audits', 'location', 'VARCHAR(255)');
    PERFORM add_column_if_not_exists('audits', 'supervisor_auditor_id', 'UUID REFERENCES users(id)');
    PERFORM add_column_if_not_exists('audits', 'assigned_by', 'UUID REFERENCES users(id)');
    PERFORM add_column_if_not_exists('audits', 'audit_criteria', 'TEXT');
    PERFORM add_column_if_not_exists('audits', 'exclusions', 'TEXT');
    PERFORM add_column_if_not_exists('audits', 'ai_confidence_score', 'DECIMAL(3,2)');
    PERFORM add_column_if_not_exists('audits', 'approval_notes', 'TEXT');
    PERFORM add_column_if_not_exists('audits', 'inherent_risk', 'risk_level');
    PERFORM add_column_if_not_exists('audits', 'residual_risk', 'risk_level');
    PERFORM add_column_if_not_exists('audits', 'control_risk', 'risk_level');
    PERFORM add_column_if_not_exists('audits', 'version', 'INTEGER DEFAULT 1');
    PERFORM add_column_if_not_exists('audits', 'is_deleted', 'BOOLEAN DEFAULT false');
    PERFORM add_column_if_not_exists('audits', 'parent_audit_id', 'UUID REFERENCES audits(id)');
    PERFORM add_column_if_not_exists('audits', 'audit_program_id', 'UUID');
    PERFORM add_column_if_not_exists('audits', 'external_audit_firm', 'VARCHAR(255)');
    PERFORM add_column_if_not_exists('audits', 'external_reference', 'VARCHAR(255)');
    PERFORM add_column_if_not_exists('audits', 'regulatory_requirement', 'VARCHAR(255)');
    PERFORM add_column_if_not_exists('audits', 'deleted_at', 'TIMESTAMPTZ');
    PERFORM add_column_if_not_exists('audits', 'approved_by', 'UUID REFERENCES users(id)');
    PERFORM add_column_if_not_exists('audits', 'approved_at', 'TIMESTAMPTZ');

    -- Map existing columns for consistency (create aliases/views if needed)
    -- start_date maps to planned_start_date
    -- end_date maps to planned_end_date
    PERFORM add_column_if_not_exists('audits', 'actual_start_date', 'DATE');
    PERFORM add_column_if_not_exists('audits', 'actual_end_date', 'DATE');
END
$$;

-- Update data types for existing columns if needed
DO $$
BEGIN
    -- Change planned_hours from INTEGER to DECIMAL if it exists as INTEGER
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = 'audits'
        AND c.column_name = 'planned_hours'
        AND c.data_type = 'integer'
    ) THEN
        ALTER TABLE audits ALTER COLUMN planned_hours TYPE DECIMAL(8,2);
        RAISE NOTICE 'Changed planned_hours data type to DECIMAL(8,2)';
    END IF;

    -- Change actual_hours from INTEGER to DECIMAL if it exists as INTEGER
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = 'audits'
        AND c.column_name = 'actual_hours'
        AND c.data_type = 'integer'
    ) THEN
        ALTER TABLE audits ALTER COLUMN actual_hours TYPE DECIMAL(8,2);
        RAISE NOTICE 'Changed actual_hours data type to DECIMAL(8,2)';
    END IF;

    -- Expand title length if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = 'audits'
        AND c.column_name = 'title'
        AND c.character_maximum_length < 500
    ) THEN
        ALTER TABLE audits ALTER COLUMN title TYPE VARCHAR(500);
        RAISE NOTICE 'Expanded title column to VARCHAR(500)';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error updating column types: %', SQLERRM;
END
$$;

-- Audit Team Members table
CREATE TABLE IF NOT EXISTS audit_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(100) NOT NULL, -- 'auditor', 'senior_auditor', 'specialist', 'observer'
    responsibilities TEXT,
    allocated_hours DECIMAL(8,2) DEFAULT 0,
    actual_hours DECIMAL(8,2) DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID NOT NULL REFERENCES users(id),
    removed_at TIMESTAMPTZ,
    removed_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,

    CONSTRAINT check_allocated_hours CHECK (allocated_hours >= 0),
    CONSTRAINT check_actual_hours_team CHECK (actual_hours >= 0)
);

-- Audit Objectives table
CREATE TABLE IF NOT EXISTS audit_objectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    objective_text TEXT NOT NULL,
    objective_order INTEGER NOT NULL,
    ai_generated BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(3,2),
    completion_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'not_applicable'
    completion_notes TEXT,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_objective_order CHECK (objective_order > 0)
);

-- Audit Planning Documents table
CREATE TABLE IF NOT EXISTS audit_planning_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- 'audit_plan', 'risk_assessment', 'control_matrix', 'testing_plan'
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    is_current_version BOOLEAN DEFAULT true,

    CONSTRAINT check_file_size CHECK (file_size >= 0),
    CONSTRAINT check_doc_version CHECK (version > 0)
);

-- Audit Phases table
CREATE TABLE IF NOT EXISTS audit_phases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    phase_name VARCHAR(255) NOT NULL,
    phase_description TEXT,
    phase_order INTEGER NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    phase_lead_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_phase_order CHECK (phase_order > 0),
    CONSTRAINT check_completion_percentage CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT check_planned_phase_dates CHECK (planned_end_date IS NULL OR planned_start_date IS NULL OR planned_end_date >= planned_start_date),
    CONSTRAINT check_actual_phase_dates CHECK (actual_end_date IS NULL OR actual_start_date IS NULL OR actual_end_date >= actual_start_date)
);

-- Audit Time Tracking table
CREATE TABLE IF NOT EXISTS audit_time_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    audit_phase_id UUID REFERENCES audit_phases(id),
    entry_date DATE NOT NULL,
    hours_worked DECIMAL(4,2) NOT NULL,
    activity_description TEXT NOT NULL,
    billable BOOLEAN DEFAULT true,
    approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_hours_worked CHECK (hours_worked > 0 AND hours_worked <= 24)
);

-- Audit Status History table
CREATE TABLE IF NOT EXISTS audit_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_reason TEXT,
    additional_notes TEXT
);

-- Audit Comments table
CREATE TABLE IF NOT EXISTS audit_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES audit_comments(id), -- For threaded comments
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'general', -- 'general', 'issue', 'recommendation', 'follow_up'
    is_internal BOOLEAN DEFAULT true, -- Internal vs external stakeholder comments
    priority priority_level DEFAULT 'low',
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'addressed', 'closed'
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id)
);

-- Audit Notifications table
CREATE TABLE IF NOT EXISTS audit_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id),
    notification_type VARCHAR(100) NOT NULL, -- 'status_change', 'assignment', 'deadline_reminder', 'approval_request'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Add unique constraints safely
DO $$
BEGIN
    BEGIN
        ALTER TABLE audit_team_members ADD CONSTRAINT audit_team_members_unique UNIQUE(audit_id, user_id, role);
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint already exists on audit_team_members';
    END;

    BEGIN
        ALTER TABLE audit_objectives ADD CONSTRAINT audit_objectives_unique UNIQUE(audit_id, objective_order);
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint already exists on audit_objectives';
    END;

    BEGIN
        ALTER TABLE audit_phases ADD CONSTRAINT audit_phases_unique UNIQUE(audit_id, phase_order);
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint already exists on audit_phases';
    END;

    BEGIN
        ALTER TABLE audits ADD CONSTRAINT audits_audit_number_unique UNIQUE (audit_number);
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Unique constraint on audit_number already exists';
    END;
END
$$;

-- Create indexes for performance optimization (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status) WHERE COALESCE(is_deleted, false) = false;
CREATE INDEX IF NOT EXISTS idx_audits_lead_auditor ON audits(lead_auditor_id) WHERE COALESCE(is_deleted, false) = false;
CREATE INDEX IF NOT EXISTS idx_audits_business_unit ON audits(business_unit_id) WHERE COALESCE(is_deleted, false) = false;
CREATE INDEX IF NOT EXISTS idx_audits_created_by ON audits(created_by);
CREATE INDEX IF NOT EXISTS idx_audits_dates ON audits(start_date, end_date) WHERE COALESCE(is_deleted, false) = false;
CREATE INDEX IF NOT EXISTS idx_audits_audit_type ON audits(audit_type) WHERE COALESCE(is_deleted, false) = false;
CREATE INDEX IF NOT EXISTS idx_audits_audit_number ON audits(audit_number) WHERE COALESCE(is_deleted, false) = false;

-- Text search indexes (conditional creation)
DO $$
BEGIN
    BEGIN
        CREATE INDEX idx_audits_title_search ON audits USING gin(to_tsvector('english', title)) WHERE COALESCE(is_deleted, false) = false;
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Index idx_audits_title_search already exists';
    END;

    BEGIN
        CREATE INDEX idx_audits_description_search ON audits USING gin(to_tsvector('english', COALESCE(description, ''))) WHERE COALESCE(is_deleted, false) = false;
    EXCEPTION
        WHEN duplicate_table THEN
            RAISE NOTICE 'Index idx_audits_description_search already exists';
    END;
END
$$;

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_audit_team_members_audit_id ON audit_team_members(audit_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_team_members_user_id ON audit_team_members(user_id) WHERE is_active = true;

-- Time tracking indexes
CREATE INDEX IF NOT EXISTS idx_audit_time_entries_audit_id ON audit_time_entries(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_time_entries_user_id ON audit_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time_entries_date ON audit_time_entries(entry_date);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_audit_comments_audit_id ON audit_comments(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_comments_created_by ON audit_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_comments_parent ON audit_comments(parent_comment_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_audit_notifications_recipient ON audit_notifications(recipient_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_notifications_audit ON audit_notifications(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_notifications_type ON audit_notifications(notification_type);

-- Status history indexes
CREATE INDEX IF NOT EXISTS idx_audit_status_history_audit_id ON audit_status_history(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_status_history_changed_at ON audit_status_history(changed_at);

-- Objectives indexes
CREATE INDEX IF NOT EXISTS idx_audit_objectives_audit_id ON audit_objectives(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_objectives_order ON audit_objectives(audit_id, objective_order);

-- Create view to handle column name mapping for backward compatibility
CREATE OR REPLACE VIEW v_audits_enhanced AS
SELECT
    id,
    COALESCE(audit_number, id::text) as audit_number,
    title,
    description,
    audit_type,
    status,
    COALESCE(priority, 'medium') as priority,
    business_unit_id,
    lead_auditor_id,
    supervisor_auditor_id,
    created_by,
    assigned_by,
    department,
    location,
    start_date as planned_start_date,
    end_date as planned_end_date,
    actual_start_date,
    actual_end_date,
    planned_hours,
    actual_hours,
    objectives,
    scope,
    methodology,
    audit_criteria,
    exclusions,
    ai_generated,
    ai_model_used,
    ai_confidence_score,
    approval_status,
    approved_by,
    approved_at,
    approval_notes,
    inherent_risk,
    residual_risk,
    control_risk,
    COALESCE(version, 1) as version,
    COALESCE(is_deleted, false) as is_deleted,
    parent_audit_id,
    audit_program_id,
    external_audit_firm,
    external_reference,
    regulatory_requirement,
    created_at,
    updated_at,
    deleted_at
FROM audits;

-- Add comments on tables
COMMENT ON TABLE audits IS 'Main audit records with comprehensive metadata and AI integration';
COMMENT ON TABLE audit_team_members IS 'Team assignment tracking with role-based responsibilities';
COMMENT ON TABLE audit_objectives IS 'Detailed audit objectives with AI generation support';
COMMENT ON TABLE audit_planning_documents IS 'Document management for audit planning materials';
COMMENT ON TABLE audit_phases IS 'Multi-phase audit support for complex engagements';
COMMENT ON TABLE audit_time_entries IS 'Time tracking for audit activities and billing';
COMMENT ON TABLE audit_status_history IS 'Complete audit status change history';
COMMENT ON TABLE audit_comments IS 'Threaded comment system for audit collaboration';
COMMENT ON TABLE audit_notifications IS 'Notification system for audit events';

-- Enable Row Level Security (RLS) setup
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_planning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_notifications ENABLE ROW LEVEL SECURITY;

-- Clean up helper function
DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);
