-- AI Auditor GRC - Audit Triggers and Functions
-- File: 02_audit_triggers_functions.sql
-- Description: Triggers, functions, and stored procedures for audit management

-- Function to generate audit numbers
CREATE OR REPLACE FUNCTION generate_audit_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    audit_num TEXT;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CASE
            WHEN audit_number LIKE year_part || '-%'
            THEN CAST(SPLIT_PART(audit_number, '-', 2) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO sequence_num
    FROM audits
    WHERE audit_number LIKE year_part || '-%';

    -- Format: YYYY-NNNN (e.g., 2024-0001)
    audit_num := year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

    RETURN audit_num;
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

-- Function to validate audit dates
CREATE OR REPLACE FUNCTION validate_audit_dates()
RETURNS TRIGGER AS $$
BEGIN
    -- Check planned dates (using existing column names)
    IF NEW.end_date < NEW.start_date THEN
        RAISE EXCEPTION 'End date cannot be before start date';
    END IF;

    -- Check actual dates if both are provided
    IF NEW.actual_start_date IS NOT NULL AND NEW.actual_end_date IS NOT NULL THEN
        IF NEW.actual_end_date < NEW.actual_start_date THEN
            RAISE EXCEPTION 'Actual end date cannot be before actual start date';
        END IF;
    END IF;

    -- Check if actual start date is reasonable (not too far in past or future)
    IF NEW.actual_start_date IS NOT NULL THEN
        IF NEW.actual_start_date < NEW.start_date - INTERVAL '90 days' THEN
            RAISE EXCEPTION 'Actual start date is too far before planned start date';
        END IF;
        IF NEW.actual_start_date > NOW()::DATE + INTERVAL '30 days' THEN
            RAISE EXCEPTION 'Actual start date cannot be more than 30 days in the future';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit status changes
CREATE OR REPLACE FUNCTION log_audit_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO audit_status_history (
            audit_id,
            old_status,
            new_status,
            changed_by,
            changed_at,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            COALESCE(NEW.created_by, auth.uid()),
            NOW(),
            'Status changed via audit update'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign audit number
CREATE OR REPLACE FUNCTION auto_assign_audit_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only assign if not already provided
    IF NEW.audit_number IS NULL OR NEW.audit_number = '' THEN
        NEW.audit_number := generate_audit_number();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate audit progress
CREATE OR REPLACE FUNCTION calculate_audit_progress(audit_id_param UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_objectives INTEGER;
    completed_objectives INTEGER;
    progress_percentage DECIMAL(5,2);
BEGIN
    -- Count total objectives
    SELECT COUNT(*)
    INTO total_objectives
    FROM audit_objectives
    WHERE audit_id = audit_id_param;

    -- Count completed objectives
    SELECT COUNT(*)
    INTO completed_objectives
    FROM audit_objectives
    WHERE audit_id = audit_id_param
    AND completion_status = 'completed';

    -- Calculate percentage
    IF total_objectives = 0 THEN
        progress_percentage := 0;
    ELSE
        progress_percentage := (completed_objectives::DECIMAL / total_objectives::DECIMAL) * 100;
    END IF;

    RETURN ROUND(progress_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to validate team member assignments
CREATE OR REPLACE FUNCTION validate_team_assignment()
RETURNS TRIGGER AS $$
DECLARE
    user_exists BOOLEAN;
    audit_exists BOOLEAN;
    duplicate_exists BOOLEAN;
BEGIN
    -- Check if user exists and is active
    SELECT EXISTS(
        SELECT 1 FROM users
        WHERE id = NEW.user_id AND is_active = true
    ) INTO user_exists;

    IF NOT user_exists THEN
        RAISE EXCEPTION 'User does not exist or is not active';
    END IF;

    -- Check if audit exists
    SELECT EXISTS(
        SELECT 1 FROM audits
        WHERE id = NEW.audit_id AND COALESCE(is_deleted, false) = false
    ) INTO audit_exists;

    IF NOT audit_exists THEN
        RAISE EXCEPTION 'Audit does not exist or has been deleted';
    END IF;

    -- Check for duplicate active assignments for same role
    SELECT EXISTS(
        SELECT 1 FROM audit_team_members
        WHERE audit_id = NEW.audit_id
        AND user_id = NEW.user_id
        AND role = NEW.role
        AND is_active = true
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) INTO duplicate_exists;

    IF duplicate_exists THEN
        RAISE EXCEPTION 'User is already assigned to this audit with the same role';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit notification
CREATE OR REPLACE FUNCTION create_audit_notification(
    audit_id_param UUID,
    recipient_id_param UUID,
    notification_type_param VARCHAR(100),
    title_param VARCHAR(255),
    message_param TEXT,
    priority_param priority_level DEFAULT 'medium',
    action_required_param BOOLEAN DEFAULT false,
    action_url_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO audit_notifications (
        audit_id,
        recipient_id,
        notification_type,
        title,
        message,
        priority,
        action_required,
        action_url
    ) VALUES (
        audit_id_param,
        recipient_id_param,
        notification_type_param,
        title_param,
        message_param,
        priority_param,
        action_required_param,
        action_url_param
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to notify team on audit creation
CREATE OR REPLACE FUNCTION notify_team_on_audit_creation()
RETURNS TRIGGER AS $$
DECLARE
    team_member RECORD;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    notification_title := 'New Audit Assignment: ' || NEW.title;

    -- Notify lead auditor
    notification_message := 'You have been assigned as the lead auditor for: ' || NEW.title;
    PERFORM create_audit_notification(
        NEW.id,
        NEW.lead_auditor_id,
        'assignment',
        notification_title,
        notification_message,
        'high',
        true,
        '/audits/' || NEW.id
    );

    -- Notify supervisor if assigned
    IF NEW.supervisor_auditor_id IS NOT NULL THEN
        notification_message := 'You have been assigned as the supervisor for audit: ' || NEW.title;
        PERFORM create_audit_notification(
            NEW.id,
            NEW.supervisor_auditor_id,
            'assignment',
            notification_title,
            notification_message,
            'medium',
            true,
            '/audits/' || NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify on status change
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
    team_member RECORD;
    notification_title TEXT;
    notification_message TEXT;
    notification_priority priority_level;
BEGIN
    -- Only proceed if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_title := 'Audit Status Changed: ' || NEW.title;
        notification_message := 'Audit status changed from ' || OLD.status || ' to ' || NEW.status;

        -- Set priority based on status
        CASE NEW.status
            WHEN 'completed' THEN notification_priority := 'high';
            WHEN 'cancelled' THEN notification_priority := 'high';
            WHEN 'on_hold' THEN notification_priority := 'medium';
            ELSE notification_priority := 'low';
        END CASE;

        -- Notify lead auditor
        PERFORM create_audit_notification(
            NEW.id,
            NEW.lead_auditor_id,
            'status_change',
            notification_title,
            notification_message,
            notification_priority,
            false,
            '/audits/' || NEW.id
        );

        -- Notify all active team members
        FOR team_member IN
            SELECT user_id FROM audit_team_members
            WHERE audit_id = NEW.id AND is_active = true
        LOOP
            PERFORM create_audit_notification(
                NEW.id,
                team_member.user_id,
                'status_change',
                notification_title,
                notification_message,
                notification_priority,
                false,
                '/audits/' || NEW.id
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate time entries
CREATE OR REPLACE FUNCTION validate_time_entry()
RETURNS TRIGGER AS $$
DECLARE
    is_team_member BOOLEAN;
    audit_status_check VARCHAR(50);
BEGIN
    -- Check if user is assigned to the audit
    SELECT EXISTS(
        SELECT 1 FROM audit_team_members
        WHERE audit_id = NEW.audit_id
        AND user_id = NEW.user_id
        AND is_active = true
    ) OR EXISTS(
        SELECT 1 FROM audits
        WHERE id = NEW.audit_id
        AND (lead_auditor_id = NEW.user_id OR supervisor_auditor_id = NEW.user_id)
    ) INTO is_team_member;

    IF NOT is_team_member THEN
        RAISE EXCEPTION 'User is not assigned to this audit';
    END IF;

    -- Check if audit allows time entry (not completed or cancelled)
    SELECT status INTO audit_status_check
    FROM audits
    WHERE id = NEW.audit_id;

    IF audit_status_check IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot add time entries to completed or cancelled audits';
    END IF;

    -- Validate entry date is not in the future
    IF NEW.entry_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Time entry date cannot be in the future';
    END IF;

    -- Validate entry date is not too old (configurable, default 90 days)
    IF NEW.entry_date < CURRENT_DATE - INTERVAL '90 days' THEN
        RAISE EXCEPTION 'Time entry date cannot be more than 90 days old';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update actual hours on audit
CREATE OR REPLACE FUNCTION update_audit_actual_hours()
RETURNS TRIGGER AS $$
DECLARE
    total_hours DECIMAL(8,2);
BEGIN
    -- Calculate total actual hours for the audit
    SELECT COALESCE(SUM(hours_worked), 0)
    INTO total_hours
    FROM audit_time_entries
    WHERE audit_id = COALESCE(NEW.audit_id, OLD.audit_id);

    -- Update the audit record
    UPDATE audits
    SET
        actual_hours = total_hours,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.audit_id, OLD.audit_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to archive old notifications
CREATE OR REPLACE FUNCTION archive_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Archive notifications older than 90 days that have been read
    WITH archived AS (
        DELETE FROM audit_notifications
        WHERE sent_at < NOW() - INTERVAL '90 days'
        AND is_read = true
        AND expires_at IS NULL
        RETURNING id
    )
    SELECT COUNT(*) INTO archived_count FROM archived;

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete audit (sets is_deleted flag)
CREATE OR REPLACE FUNCTION soft_delete_audit(audit_id_param UUID, deleted_by_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    audit_found BOOLEAN;
BEGIN
    -- Check if audit exists and is not already deleted
    SELECT EXISTS(
        SELECT 1 FROM audits
        WHERE id = audit_id_param AND COALESCE(is_deleted, false) = false
    ) INTO audit_found;

    IF NOT audit_found THEN
        RAISE EXCEPTION 'Audit not found or already deleted';
    END IF;

    -- Soft delete the audit
    UPDATE audits
    SET
        is_deleted = true,
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = audit_id_param;

    -- Create notification for team members
    INSERT INTO audit_notifications (
        audit_id,
        recipient_id,
        notification_type,
        title,
        message,
        priority
    )
    SELECT
        audit_id_param,
        user_id,
        'audit_deleted',
        'Audit Deleted: ' || a.title,
        'The audit "' || a.title || '" has been deleted.',
        'medium'
    FROM audit_team_members atm
    JOIN audits a ON a.id = atm.audit_id
    WHERE atm.audit_id = audit_id_param
    AND atm.is_active = true;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create triggers

-- Trigger to auto-assign audit number on insert
CREATE OR REPLACE TRIGGER tr_audit_auto_number
    BEFORE INSERT ON audits
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_audit_number();

-- Trigger to validate audit dates
CREATE OR REPLACE TRIGGER tr_audit_validate_dates
    BEFORE INSERT OR UPDATE ON audits
    FOR EACH ROW
    EXECUTE FUNCTION validate_audit_dates();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER tr_audit_updated_at
    BEFORE UPDATE ON audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER tr_audit_objectives_updated_at
    BEFORE UPDATE ON audit_objectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER tr_audit_comments_updated_at
    BEFORE UPDATE ON audit_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER tr_audit_time_entries_updated_at
    BEFORE UPDATE ON audit_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to log status changes
CREATE OR REPLACE TRIGGER tr_audit_status_change
    AFTER UPDATE ON audits
    FOR EACH ROW
    EXECUTE FUNCTION log_audit_status_change();

-- Trigger to validate team member assignments
CREATE OR REPLACE TRIGGER tr_validate_team_assignment
    BEFORE INSERT OR UPDATE ON audit_team_members
    FOR EACH ROW
    EXECUTE FUNCTION validate_team_assignment();

-- Trigger to validate time entries
CREATE OR REPLACE TRIGGER tr_validate_time_entry
    BEFORE INSERT OR UPDATE ON audit_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION validate_time_entry();

-- Trigger to update actual hours on time entry changes
CREATE OR REPLACE TRIGGER tr_update_actual_hours_insert
    AFTER INSERT ON audit_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_actual_hours();

CREATE OR REPLACE TRIGGER tr_update_actual_hours_update
    AFTER UPDATE ON audit_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_actual_hours();

CREATE OR REPLACE TRIGGER tr_update_actual_hours_delete
    AFTER DELETE ON audit_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_actual_hours();

-- Trigger to notify team on audit creation
CREATE OR REPLACE TRIGGER tr_notify_audit_creation
    AFTER INSERT ON audits
    FOR EACH ROW
    EXECUTE FUNCTION notify_team_on_audit_creation();

-- Trigger to notify on status changes
CREATE OR REPLACE TRIGGER tr_notify_status_change
    AFTER UPDATE ON audits
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_status_change();

-- Comments on functions
COMMENT ON FUNCTION generate_audit_number() IS 'Generates unique audit numbers in format YYYY-NNNN';
COMMENT ON FUNCTION calculate_audit_progress(UUID) IS 'Calculates audit progress based on completed objectives';
COMMENT ON FUNCTION validate_audit_dates() IS 'Validates audit date ranges and constraints';
COMMENT ON FUNCTION create_audit_notification(UUID, UUID, VARCHAR, VARCHAR, TEXT, priority_level, BOOLEAN, TEXT) IS 'Creates standardized audit notifications';
COMMENT ON FUNCTION soft_delete_audit(UUID, UUID) IS 'Safely deletes audit with proper notifications';
COMMENT ON FUNCTION archive_old_notifications() IS 'Archives old read notifications to maintain performance';
