-- AI Auditor GRC - Audit Security and Permissions
-- File: 04_audit_security_permissions.sql
-- Description: Row Level Security policies and permission management for audit system

-- Enable Row Level Security on all audit tables
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_planning_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_notifications ENABLE ROW LEVEL SECURITY;

-- Function to check if user has audit access
CREATE OR REPLACE FUNCTION has_audit_access(audit_id_param UUID, user_id_param UUID, access_type TEXT DEFAULT 'read')
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    is_team_member BOOLEAN := false;
    is_lead_auditor BOOLEAN := false;
    is_supervisor BOOLEAN := false;
    is_creator BOOLEAN := false;
    business_unit_match BOOLEAN := false;
BEGIN
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = user_id_param;

    -- Super admin and admin have access to everything
    IF user_role IN ('super_admin', 'admin', 'cro') THEN
        RETURN true;
    END IF;

    -- Check if user is associated with the audit
    SELECT
        EXISTS(SELECT 1 FROM audits WHERE id = audit_id_param AND lead_auditor_id = user_id_param),
        EXISTS(SELECT 1 FROM audits WHERE id = audit_id_param AND supervisor_auditor_id = user_id_param),
        EXISTS(SELECT 1 FROM audits WHERE id = audit_id_param AND created_by = user_id_param),
        EXISTS(SELECT 1 FROM audit_team_members WHERE audit_id = audit_id_param AND user_id = user_id_param AND is_active = true)
    INTO is_lead_auditor, is_supervisor, is_creator, is_team_member;

    -- Check business unit access for business unit managers
    IF user_role = 'business_unit_manager' THEN
        SELECT EXISTS(
            SELECT 1 FROM audits a
            JOIN users u ON u.business_unit_id = a.business_unit_id
            WHERE a.id = audit_id_param AND u.id = user_id_param
        ) INTO business_unit_match;
    END IF;

    -- Determine access based on role and relationship
    CASE access_type
        WHEN 'read' THEN
            RETURN (
                user_role IN ('reviewer', 'auditor', 'supervisor_auditor') AND
                (is_team_member OR is_lead_auditor OR is_supervisor OR is_creator)
            ) OR (
                user_role = 'business_unit_manager' AND business_unit_match
            ) OR (
                user_role = 'viewer'
            );

        WHEN 'write' THEN
            RETURN (
                user_role IN ('auditor', 'supervisor_auditor') AND
                (is_team_member OR is_lead_auditor OR is_supervisor OR is_creator)
            ) OR (
                user_role = 'supervisor_auditor' AND is_supervisor
            );

        WHEN 'delete' THEN
            RETURN (
                user_role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin') AND
                (is_lead_auditor OR is_supervisor OR is_creator)
            );

        WHEN 'approve' THEN
            RETURN user_role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin');

        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check business unit access
CREATE OR REPLACE FUNCTION has_business_unit_access(business_unit_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_business_unit UUID;
BEGIN
    SELECT role, business_unit_id INTO user_role, user_business_unit
    FROM users WHERE id = user_id_param;

    -- Super admin, admin, and CRO have access to all business units
    IF user_role IN ('super_admin', 'admin', 'cro') THEN
        RETURN true;
    END IF;

    -- Business unit managers and users can only access their own business unit
    IF user_role IN ('business_unit_manager', 'business_unit_user') THEN
        RETURN user_business_unit = business_unit_id_param;
    END IF;

    -- Auditors and supervisors can access any business unit
    IF user_role IN ('auditor', 'supervisor_auditor', 'reviewer') THEN
        RETURN true;
    END IF;

    -- Viewers can see all
    IF user_role = 'viewer' THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for audits table
CREATE POLICY audit_select_policy ON audits
    FOR SELECT
    USING (
        has_audit_access(id, auth.uid(), 'read') AND
        has_business_unit_access(business_unit_id, auth.uid())
    );

CREATE POLICY audit_insert_policy ON audits
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS(
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('auditor', 'supervisor_auditor', 'cro', 'admin', 'super_admin')
            AND is_active = true
        ) AND
        has_business_unit_access(business_unit_id, auth.uid()) AND
        created_by = auth.uid()
    );

CREATE POLICY audit_update_policy ON audits
    FOR UPDATE
    USING (
        has_audit_access(id, auth.uid(), 'write') AND
        has_business_unit_access(business_unit_id, auth.uid())
    )
    WITH CHECK (
        has_audit_access(id, auth.uid(), 'write') AND
        has_business_unit_access(business_unit_id, auth.uid())
    );

CREATE POLICY audit_delete_policy ON audits
    FOR DELETE
    USING (
        has_audit_access(id, auth.uid(), 'delete') AND
        has_business_unit_access(business_unit_id, auth.uid())
    );

-- RLS Policies for audit_team_members table
CREATE POLICY team_member_select_policy ON audit_team_members
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read') OR
        user_id = auth.uid()
    );

CREATE POLICY team_member_insert_policy ON audit_team_members
    FOR INSERT
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write') AND
        added_by = auth.uid() AND
        EXISTS(
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')
        )
    );

CREATE POLICY team_member_update_policy ON audit_team_members
    FOR UPDATE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        (user_id = auth.uid() AND is_active = true)
    )
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        (user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY team_member_delete_policy ON audit_team_members
    FOR DELETE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write') AND
        EXISTS(
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')
        )
    );

-- RLS Policies for audit_objectives table
CREATE POLICY objective_select_policy ON audit_objectives
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY objective_insert_policy ON audit_objectives
    FOR INSERT
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write')
    );

CREATE POLICY objective_update_policy ON audit_objectives
    FOR UPDATE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write')
    )
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write')
    );

CREATE POLICY objective_delete_policy ON audit_objectives
    FOR DELETE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write')
    );

-- RLS Policies for audit_planning_documents table
CREATE POLICY planning_doc_select_policy ON audit_planning_documents
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY planning_doc_insert_policy ON audit_planning_documents
    FOR INSERT
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write') AND
        uploaded_by = auth.uid()
    );

CREATE POLICY planning_doc_update_policy ON audit_planning_documents
    FOR UPDATE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        uploaded_by = auth.uid()
    )
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        uploaded_by = auth.uid()
    );

CREATE POLICY planning_doc_delete_policy ON audit_planning_documents
    FOR DELETE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        (uploaded_by = auth.uid() AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('auditor', 'supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

-- RLS Policies for audit_phases table
CREATE POLICY phase_select_policy ON audit_phases
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY phase_insert_policy ON audit_phases
    FOR INSERT
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write')
    );

CREATE POLICY phase_update_policy ON audit_phases
    FOR UPDATE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        phase_lead_id = auth.uid()
    )
    WITH CHECK (
        has_audit_access(audit_id, auth.uid(), 'write') OR
        phase_lead_id = auth.uid()
    );

CREATE POLICY phase_delete_policy ON audit_phases
    FOR DELETE
    USING (
        has_audit_access(audit_id, auth.uid(), 'write')
    );

-- RLS Policies for audit_time_entries table
CREATE POLICY time_entry_select_policy ON audit_time_entries
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY time_entry_insert_policy ON audit_time_entries
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        (has_audit_access(audit_id, auth.uid(), 'read') OR
         EXISTS(
             SELECT 1 FROM audit_team_members
             WHERE audit_id = audit_time_entries.audit_id
             AND user_id = auth.uid()
             AND is_active = true
         ))
    );

CREATE POLICY time_entry_update_policy ON audit_time_entries
    FOR UPDATE
    USING (
        user_id = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    )
    WITH CHECK (
        user_id = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

CREATE POLICY time_entry_delete_policy ON audit_time_entries
    FOR DELETE
    USING (
        user_id = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

-- RLS Policies for audit_status_history table
CREATE POLICY status_history_select_policy ON audit_status_history
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY status_history_insert_policy ON audit_status_history
    FOR INSERT
    WITH CHECK (
        changed_by = auth.uid() AND
        has_audit_access(audit_id, auth.uid(), 'write')
    );

-- No update or delete policies for status history (immutable audit trail)

-- RLS Policies for audit_comments table
CREATE POLICY comment_select_policy ON audit_comments
    FOR SELECT
    USING (
        has_audit_access(audit_id, auth.uid(), 'read') OR
        created_by = auth.uid() OR
        assigned_to = auth.uid()
    );

CREATE POLICY comment_insert_policy ON audit_comments
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid() AND
        has_audit_access(audit_id, auth.uid(), 'read')
    );

CREATE POLICY comment_update_policy ON audit_comments
    FOR UPDATE
    USING (
        created_by = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    )
    WITH CHECK (
        created_by = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

CREATE POLICY comment_delete_policy ON audit_comments
    FOR DELETE
    USING (
        created_by = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'write') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

-- RLS Policies for audit_notifications table
CREATE POLICY notification_select_policy ON audit_notifications
    FOR SELECT
    USING (
        recipient_id = auth.uid() OR
        (has_audit_access(audit_id, auth.uid(), 'read') AND
         EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')))
    );

CREATE POLICY notification_insert_policy ON audit_notifications
    FOR INSERT
    WITH CHECK (
        EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('supervisor_auditor', 'cro', 'admin', 'super_admin')) OR
        has_audit_access(audit_id, auth.uid(), 'write')
    );

CREATE POLICY notification_update_policy ON audit_notifications
    FOR UPDATE
    USING (
        recipient_id = auth.uid()
    )
    WITH CHECK (
        recipient_id = auth.uid()
    );

CREATE POLICY notification_delete_policy ON audit_notifications
    FOR DELETE
    USING (
        recipient_id = auth.uid() OR
        EXISTS(SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Create audit permission checking function for application use
CREATE OR REPLACE FUNCTION check_audit_permission(
    audit_id_param UUID,
    permission_type TEXT,
    user_id_param UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_audit_access(audit_id_param, user_id_param, permission_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's audit permissions
CREATE OR REPLACE FUNCTION get_user_audit_permissions(
    audit_id_param UUID,
    user_id_param UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
    permissions JSONB := '{}';
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_id_param;

    permissions := jsonb_build_object(
        'can_read', has_audit_access(audit_id_param, user_id_param, 'read'),
        'can_write', has_audit_access(audit_id_param, user_id_param, 'write'),
        'can_delete', has_audit_access(audit_id_param, user_id_param, 'delete'),
        'can_approve', has_audit_access(audit_id_param, user_id_param, 'approve'),
        'user_role', user_role
    );

    RETURN permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can create audits
CREATE OR REPLACE FUNCTION can_create_audit(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    is_active BOOLEAN;
BEGIN
    SELECT role, is_active INTO user_role, is_active
    FROM users WHERE id = user_id_param;

    RETURN is_active = true AND user_role IN ('auditor', 'supervisor_auditor', 'cro', 'admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get accessible business units for user
CREATE OR REPLACE FUNCTION get_accessible_business_units(user_id_param UUID DEFAULT auth.uid())
RETURNS TABLE(business_unit_id UUID, business_unit_name TEXT, business_unit_code TEXT) AS $$
DECLARE
    user_role TEXT;
    user_business_unit UUID;
BEGIN
    SELECT role, business_unit_id INTO user_role, user_business_unit
    FROM users WHERE id = user_id_param;

    IF user_role IN ('super_admin', 'admin', 'cro', 'auditor', 'supervisor_auditor', 'reviewer', 'viewer') THEN
        -- Can access all business units
        RETURN QUERY
        SELECT bu.id, bu.name, bu.code
        FROM business_units bu
        WHERE bu.is_active = true
        ORDER BY bu.name;
    ELSIF user_role IN ('business_unit_manager', 'business_unit_user') THEN
        -- Can only access their own business unit
        RETURN QUERY
        SELECT bu.id, bu.name, bu.code
        FROM business_units bu
        WHERE bu.id = user_business_unit
        AND bu.is_active = true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table for security events
CREATE TABLE audit_security_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    audit_id UUID REFERENCES audits(id),
    action VARCHAR(100) NOT NULL, -- 'access_denied', 'permission_granted', 'data_accessed', 'data_modified'
    resource_type VARCHAR(100) NOT NULL, -- 'audit', 'team_member', 'time_entry', etc.
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on security log
ALTER TABLE audit_security_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY security_log_policy ON audit_security_log
    FOR SELECT
    USING (
        EXISTS(
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    action_param VARCHAR(100),
    resource_type_param VARCHAR(100),
    resource_id_param UUID DEFAULT NULL,
    audit_id_param UUID DEFAULT NULL,
    details_param JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_security_log (
        user_id,
        audit_id,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        auth.uid(),
        audit_id_param,
        action_param,
        resource_type_param,
        resource_id_param,
        details_param
    ) RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for security log performance
CREATE INDEX idx_audit_security_log_user_id ON audit_security_log(user_id);
CREATE INDEX idx_audit_security_log_audit_id ON audit_security_log(audit_id);
CREATE INDEX idx_audit_security_log_action ON audit_security_log(action);
CREATE INDEX idx_audit_security_log_created_at ON audit_security_log(created_at);

-- Comments on security functions
COMMENT ON FUNCTION has_audit_access(UUID, UUID, TEXT) IS 'Core function to check if user has specific access to an audit';
COMMENT ON FUNCTION has_business_unit_access(UUID, UUID) IS 'Checks if user can access specific business unit data';
COMMENT ON FUNCTION check_audit_permission(UUID, TEXT, UUID) IS 'Application-friendly wrapper for permission checking';
COMMENT ON FUNCTION get_user_audit_permissions(UUID, UUID) IS 'Returns comprehensive permission object for user and audit';
COMMENT ON FUNCTION can_create_audit(UUID) IS 'Checks if user has permission to create new audits';
COMMENT ON FUNCTION get_accessible_business_units(UUID) IS 'Returns business units accessible to the user';
COMMENT ON FUNCTION log_security_event(VARCHAR, VARCHAR, UUID, UUID, JSONB) IS 'Logs security events for audit trail';

-- Grant appropriate permissions to application roles
GRANT EXECUTE ON FUNCTION has_audit_access(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_business_unit_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_audit_permission(UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_audit_permissions(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_audit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accessible_business_units(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event(VARCHAR, VARCHAR, UUID, UUID, JSONB) TO authenticated;
