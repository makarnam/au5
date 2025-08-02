-- AI Auditor GRC - Audit Views and Reporting (Fixed Date Functions)
-- File: 03_audit_views_reporting.sql
-- Description: Views, reporting queries, and analytics for audit management

-- Comprehensive audit overview view
CREATE OR REPLACE VIEW v_audit_overview AS
SELECT
    a.id,
    COALESCE(a.audit_number, a.id::text) as audit_number,
    a.title,
    a.description,
    a.audit_type,
    a.status,
    COALESCE(a.priority, 'medium') as priority,
    a.start_date as planned_start_date,
    a.end_date as planned_end_date,
    a.actual_start_date,
    a.actual_end_date,
    a.planned_hours,
    a.actual_hours,
    a.scope,
    a.methodology,
    COALESCE(a.ai_generated, false) as ai_generated,
    a.ai_model_used,
    COALESCE(a.ai_confidence_score, 0) as ai_confidence_score,
    COALESCE(a.approval_status, 'draft') as approval_status,
    a.inherent_risk,
    a.residual_risk,
    a.control_risk,
    a.created_at,
    a.updated_at,

    -- Business unit information
    bu.name AS business_unit_name,
    bu.code AS business_unit_code,

    -- Lead auditor information
    la.first_name || ' ' || la.last_name AS lead_auditor_name,
    la.email AS lead_auditor_email,

    -- Supervisor information
    sa.first_name || ' ' || sa.last_name AS supervisor_name,
    sa.email AS supervisor_email,

    -- Creator information
    cr.first_name || ' ' || cr.last_name AS created_by_name,
    cr.email AS created_by_email,

    -- Approver information
    ap.first_name || ' ' || ap.last_name AS approved_by_name,
    ap.email AS approved_by_email,
    a.approved_at,

    -- Calculated fields with proper date handling
    CASE
        WHEN a.actual_end_date IS NOT NULL THEN 100.0
        WHEN a.actual_start_date IS NULL THEN 0.0
        WHEN a.end_date::date < CURRENT_DATE THEN 100.0
        WHEN a.start_date::date > CURRENT_DATE THEN 0.0
        WHEN a.start_date::date = a.end_date::date THEN 50.0
        ELSE ROUND(
            (CURRENT_DATE - a.start_date::date)::numeric /
            NULLIF((a.end_date::date - a.start_date::date)::numeric, 0) * 100.0, 2
        )
    END AS progress_percentage,

    CASE
        WHEN a.end_date::date < CURRENT_DATE AND a.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END AS is_overdue,

    CASE
        WHEN (a.end_date::date - CURRENT_DATE) <= 7 AND a.end_date::date >= CURRENT_DATE AND a.status NOT IN ('completed', 'cancelled') THEN true
        ELSE false
    END AS is_due_soon,

    -- Days calculations with safe casting
    (a.end_date::date - a.start_date::date) AS planned_duration_days,
    CASE
        WHEN a.actual_start_date IS NOT NULL AND a.actual_end_date IS NOT NULL THEN
            (a.actual_end_date::date - a.actual_start_date::date)
        ELSE NULL
    END AS actual_duration_days,

    CASE
        WHEN a.end_date::date >= CURRENT_DATE THEN (a.end_date::date - CURRENT_DATE)
        ELSE 0
    END AS days_remaining,

    -- Team count
    (SELECT COUNT(*) FROM audit_team_members atm WHERE atm.audit_id = a.id AND atm.is_active = true) AS team_member_count,

    -- Objectives count
    (SELECT COUNT(*) FROM audit_objectives ao WHERE ao.audit_id = a.id) AS total_objectives,
    (SELECT COUNT(*) FROM audit_objectives ao WHERE ao.audit_id = a.id AND ao.completion_status = 'completed') AS completed_objectives,

    -- Comments count
    (SELECT COUNT(*) FROM audit_comments ac WHERE ac.audit_id = a.id) AS comments_count,

    -- Hours variance
    CASE
        WHEN a.actual_hours > 0 AND a.planned_hours > 0 THEN
            ROUND(((a.actual_hours::numeric - a.planned_hours::numeric) / a.planned_hours::numeric) * 100.0, 2)
        ELSE NULL
    END AS hours_variance_percentage

FROM audits a
LEFT JOIN business_units bu ON a.business_unit_id = bu.id
LEFT JOIN users la ON a.lead_auditor_id = la.id
LEFT JOIN users sa ON a.supervisor_auditor_id = sa.id
LEFT JOIN users cr ON a.created_by = cr.id
LEFT JOIN users ap ON a.approved_by = ap.id
WHERE COALESCE(a.is_deleted, false) = false;

-- Active audits view
CREATE OR REPLACE VIEW v_active_audits AS
SELECT *
FROM v_audit_overview
WHERE status NOT IN ('completed', 'cancelled', 'draft');

-- Overdue audits view
CREATE OR REPLACE VIEW v_overdue_audits AS
SELECT *
FROM v_audit_overview
WHERE is_overdue = true;

-- Team workload view
CREATE OR REPLACE VIEW v_team_workload AS
SELECT
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    u.email,
    u.role,
    u.department,
    bu.name AS business_unit_name,

    -- Lead auditor statistics
    COUNT(DISTINCT CASE WHEN a.lead_auditor_id = u.id AND a.status NOT IN ('completed', 'cancelled') THEN a.id END) AS active_audits_as_lead,
    COUNT(DISTINCT CASE WHEN a.supervisor_auditor_id = u.id AND a.status NOT IN ('completed', 'cancelled') THEN a.id END) AS active_audits_as_supervisor,

    -- Team member statistics
    COUNT(DISTINCT CASE WHEN atm.user_id = u.id AND atm.is_active = true AND a2.status NOT IN ('completed', 'cancelled') THEN a2.id END) AS active_audits_as_member,

    -- Total active audits
    COUNT(DISTINCT CASE
        WHEN (a.lead_auditor_id = u.id OR a.supervisor_auditor_id = u.id OR atm.user_id = u.id)
        AND COALESCE(a.status, a2.status) NOT IN ('completed', 'cancelled')
        THEN COALESCE(a.id, a2.id)
    END) AS total_active_audits,

    -- Hours statistics
    COALESCE(SUM(CASE WHEN a.lead_auditor_id = u.id AND a.status NOT IN ('completed', 'cancelled') THEN a.planned_hours::numeric END), 0) AS planned_hours_as_lead,
    COALESCE(SUM(CASE WHEN atm.user_id = u.id AND atm.is_active = true AND a2.status NOT IN ('completed', 'cancelled') THEN atm.allocated_hours::numeric END), 0) AS allocated_hours_as_member,

    -- Time tracking
    COALESCE(SUM(ate.hours_worked::numeric), 0) AS total_hours_logged,

    -- Current month hours
    COALESCE(SUM(CASE
        WHEN ate.entry_date >= DATE_TRUNC('month', CURRENT_DATE)::date
        AND ate.entry_date < (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month')::date
        THEN ate.hours_worked::numeric
    END), 0) AS current_month_hours

FROM users u
LEFT JOIN business_units bu ON u.business_unit_id = bu.id
LEFT JOIN audits a ON (a.lead_auditor_id = u.id OR a.supervisor_auditor_id = u.id) AND COALESCE(a.is_deleted, false) = false
LEFT JOIN audit_team_members atm ON atm.user_id = u.id AND atm.is_active = true
LEFT JOIN audits a2 ON atm.audit_id = a2.id AND COALESCE(a2.is_deleted, false) = false
LEFT JOIN audit_time_entries ate ON ate.user_id = u.id
WHERE u.is_active = true
GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.department, bu.name;

-- Audit status dashboard view
CREATE OR REPLACE VIEW v_audit_status_dashboard AS
SELECT
    status,
    COUNT(*) AS audit_count,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage,
    AVG(planned_hours::numeric) AS avg_planned_hours,
    AVG(CASE WHEN actual_hours > 0 THEN actual_hours::numeric END) AS avg_actual_hours,
    COUNT(CASE WHEN is_overdue THEN 1 END) AS overdue_count,
    COUNT(CASE WHEN is_due_soon THEN 1 END) AS due_soon_count
FROM v_audit_overview
GROUP BY status
ORDER BY
    CASE status
        WHEN 'draft' THEN 1
        WHEN 'planning' THEN 2
        WHEN 'approved' THEN 3
        WHEN 'in_progress' THEN 4
        WHEN 'fieldwork' THEN 5
        WHEN 'testing' THEN 6
        WHEN 'reporting' THEN 7
        WHEN 'review' THEN 8
        WHEN 'completed' THEN 9
        WHEN 'cancelled' THEN 10
        WHEN 'on_hold' THEN 11
    END;

-- Monthly audit metrics view
CREATE OR REPLACE VIEW v_monthly_audit_metrics AS
SELECT
    DATE_TRUNC('month', created_at)::date AS month_year,
    EXTRACT(YEAR FROM created_at)::integer AS year,
    EXTRACT(MONTH FROM created_at)::integer AS month,
    COUNT(*) AS audits_created,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS audits_completed,
    COUNT(CASE WHEN COALESCE(ai_generated, false) = true THEN 1 END) AS ai_generated_audits,
    AVG(planned_hours::numeric) AS avg_planned_hours,
    AVG(CASE WHEN actual_hours > 0 THEN actual_hours::numeric END) AS avg_actual_hours,
    COUNT(DISTINCT lead_auditor_id) AS unique_lead_auditors,
    COUNT(DISTINCT business_unit_id) AS unique_business_units
FROM audits
WHERE COALESCE(is_deleted, false) = false
GROUP BY DATE_TRUNC('month', created_at), EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at)
ORDER BY month_year DESC;

-- Business unit audit summary view
CREATE OR REPLACE VIEW v_business_unit_audit_summary AS
SELECT
    bu.id AS business_unit_id,
    bu.name AS business_unit_name,
    bu.code AS business_unit_code,
    COUNT(a.id) AS total_audits,
    COUNT(CASE WHEN a.status NOT IN ('completed', 'cancelled') THEN 1 END) AS active_audits,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_audits,
    COUNT(CASE WHEN ao.is_overdue THEN 1 END) AS overdue_audits,
    AVG(a.planned_hours::numeric) AS avg_planned_hours,
    AVG(CASE WHEN a.actual_hours > 0 THEN a.actual_hours::numeric END) AS avg_actual_hours,
    MIN(a.start_date::date) AS earliest_audit_date,
    MAX(a.end_date::date) AS latest_audit_date,
    COUNT(CASE WHEN COALESCE(a.priority, 'medium') = 'critical' THEN 1 END) AS critical_priority_audits,
    COUNT(CASE WHEN COALESCE(a.priority, 'medium') = 'high' THEN 1 END) AS high_priority_audits,
    ROUND(AVG(CASE WHEN a.actual_end_date IS NOT NULL AND a.end_date IS NOT NULL THEN
        (a.actual_end_date::date - a.end_date::date)::numeric
    END), 2) AS avg_days_variance
FROM business_units bu
LEFT JOIN audits a ON bu.id = a.business_unit_id AND COALESCE(a.is_deleted, false) = false
LEFT JOIN v_audit_overview ao ON a.id = ao.id
GROUP BY bu.id, bu.name, bu.code
ORDER BY total_audits DESC;

-- Audit type analysis view
CREATE OR REPLACE VIEW v_audit_type_analysis AS
SELECT
    audit_type,
    COUNT(*) AS total_audits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_audits,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS completion_rate,
    AVG(planned_hours::numeric) AS avg_planned_hours,
    AVG(CASE WHEN actual_hours > 0 THEN actual_hours::numeric END) AS avg_actual_hours,
    ROUND(AVG(CASE
        WHEN actual_hours > 0 AND planned_hours > 0 THEN
            ((actual_hours::numeric - planned_hours::numeric) / planned_hours::numeric) * 100.0
    END), 2) AS avg_hours_variance_percent,
    COUNT(CASE WHEN COALESCE(ai_generated, false) = true THEN 1 END) AS ai_generated_count,
    ROUND(COUNT(CASE WHEN COALESCE(ai_generated, false) = true THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS ai_usage_rate,
    MIN(created_at) AS first_audit_date,
    MAX(created_at) AS latest_audit_date
FROM audits
WHERE COALESCE(is_deleted, false) = false
GROUP BY audit_type
ORDER BY total_audits DESC;

-- Time tracking summary view
CREATE OR REPLACE VIEW v_time_tracking_summary AS
SELECT
    a.id AS audit_id,
    COALESCE(a.audit_number, a.id::text) as audit_number,
    a.title,
    a.status,
    a.planned_hours,
    a.actual_hours,
    COUNT(ate.id) AS time_entries_count,
    COUNT(DISTINCT ate.user_id) AS users_logged_time,
    MIN(ate.entry_date) AS first_time_entry,
    MAX(ate.entry_date) AS last_time_entry,
    SUM(ate.hours_worked::numeric) AS total_logged_hours,
    AVG(ate.hours_worked::numeric) AS avg_hours_per_entry,
    SUM(CASE WHEN ate.billable = true THEN ate.hours_worked::numeric ELSE 0 END) AS billable_hours,
    SUM(CASE WHEN ate.billable = false THEN ate.hours_worked::numeric ELSE 0 END) AS non_billable_hours,
    COUNT(CASE WHEN ate.approved = true THEN 1 END) AS approved_entries,
    COUNT(CASE WHEN ate.approved = false THEN 1 END) AS pending_entries,
    ROUND((a.actual_hours::numeric / NULLIF(a.planned_hours::numeric, 0)) * 100.0, 2) AS hours_utilization_percent
FROM audits a
LEFT JOIN audit_time_entries ate ON a.id = ate.audit_id
WHERE COALESCE(a.is_deleted, false) = false
GROUP BY a.id, a.audit_number, a.title, a.status, a.planned_hours, a.actual_hours
ORDER BY COALESCE(a.audit_number, a.id::text);

-- Risk assessment view
CREATE OR REPLACE VIEW v_audit_risk_assessment AS
SELECT
    audit_type,
    inherent_risk,
    residual_risk,
    control_risk,
    COUNT(*) AS audit_count,
    ROUND(COUNT(*)::numeric * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage_of_total,
    AVG(planned_hours::numeric) AS avg_planned_hours,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_audits,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS completion_rate
FROM audits
WHERE COALESCE(is_deleted, false) = false
AND inherent_risk IS NOT NULL
GROUP BY audit_type, inherent_risk, residual_risk, control_risk
ORDER BY
    audit_type,
    CASE inherent_risk
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- AI usage analytics view
CREATE OR REPLACE VIEW v_ai_usage_analytics AS
SELECT
    ai_model_used,
    COUNT(*) AS total_usage,
    COUNT(CASE WHEN COALESCE(ai_generated, false) = true THEN 1 END) AS successful_generations,
    ROUND(COUNT(CASE WHEN COALESCE(ai_generated, false) = true THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS success_rate,
    AVG(COALESCE(ai_confidence_score, 0)::numeric) AS avg_confidence_score,
    COUNT(CASE WHEN COALESCE(ai_confidence_score, 0) >= 0.8 THEN 1 END) AS high_confidence_count,
    COUNT(CASE WHEN COALESCE(ai_confidence_score, 0) < 0.5 THEN 1 END) AS low_confidence_count,
    MIN(created_at) AS first_usage,
    MAX(created_at) AS latest_usage,
    COUNT(DISTINCT lead_auditor_id) AS unique_users
FROM audits
WHERE ai_model_used IS NOT NULL
AND COALESCE(is_deleted, false) = false
GROUP BY ai_model_used
ORDER BY total_usage DESC;

-- Notification analytics view
CREATE OR REPLACE VIEW v_notification_analytics AS
SELECT
    notification_type,
    COUNT(*) AS total_notifications,
    COUNT(CASE WHEN is_read = true THEN 1 END) AS read_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) AS unread_notifications,
    ROUND(COUNT(CASE WHEN is_read = true THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS read_rate,
    AVG(EXTRACT(EPOCH FROM (read_at - sent_at))::numeric / 3600.0) AS avg_hours_to_read,
    COUNT(CASE WHEN action_required = true THEN 1 END) AS action_required_count,
    COUNT(CASE WHEN priority = 'critical' THEN 1 END) AS critical_notifications,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) AS high_priority_notifications
FROM audit_notifications
GROUP BY notification_type
ORDER BY total_notifications DESC;

-- Performance metrics view
CREATE OR REPLACE VIEW v_audit_performance_metrics AS
SELECT
    'Overall Performance' AS metric_category,
    COUNT(*) AS total_audits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_audits,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS completion_rate,
    COUNT(CASE WHEN actual_end_date::date <= end_date::date AND status = 'completed' THEN 1 END) AS on_time_completions,
    ROUND(COUNT(CASE WHEN actual_end_date::date <= end_date::date AND status = 'completed' THEN 1 END)::numeric * 100.0 /
          NULLIF(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric, 0), 2) AS on_time_rate,
    AVG(CASE WHEN status = 'completed' AND actual_end_date IS NOT NULL AND end_date IS NOT NULL THEN
        (actual_end_date::date - end_date::date)::numeric
    END) AS avg_days_variance,
    AVG(CASE WHEN actual_hours > 0 AND planned_hours > 0 THEN
        ((actual_hours::numeric - planned_hours::numeric) / planned_hours::numeric) * 100.0
    END) AS avg_hours_variance_percent
FROM audits
WHERE COALESCE(is_deleted, false) = false

UNION ALL

SELECT
    'Current Quarter' AS metric_category,
    COUNT(*) AS total_audits,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_audits,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric * 100.0 / COUNT(*)::numeric, 2) AS completion_rate,
    COUNT(CASE WHEN actual_end_date::date <= end_date::date AND status = 'completed' THEN 1 END) AS on_time_completions,
    ROUND(COUNT(CASE WHEN actual_end_date::date <= end_date::date AND status = 'completed' THEN 1 END)::numeric * 100.0 /
          NULLIF(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric, 0), 2) AS on_time_rate,
    AVG(CASE WHEN status = 'completed' AND actual_end_date IS NOT NULL AND end_date IS NOT NULL THEN
        (actual_end_date::date - end_date::date)::numeric
    END) AS avg_days_variance,
    AVG(CASE WHEN actual_hours > 0 AND planned_hours > 0 THEN
        ((actual_hours::numeric - planned_hours::numeric) / planned_hours::numeric) * 100.0
    END) AS avg_hours_variance_percent
FROM audits
WHERE COALESCE(is_deleted, false) = false
AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE);

-- Comments on views
COMMENT ON VIEW v_audit_overview IS 'Comprehensive audit view with calculated fields and related data';
COMMENT ON VIEW v_active_audits IS 'Currently active audits excluding completed, cancelled, and draft status';
COMMENT ON VIEW v_overdue_audits IS 'Audits that have passed their planned end date';
COMMENT ON VIEW v_team_workload IS 'Team member workload and capacity analysis';
COMMENT ON VIEW v_audit_status_dashboard IS 'Audit status distribution for dashboard reporting';
COMMENT ON VIEW v_monthly_audit_metrics IS 'Monthly trending metrics for audit creation and completion';
COMMENT ON VIEW v_business_unit_audit_summary IS 'Audit statistics grouped by business unit';
COMMENT ON VIEW v_audit_type_analysis IS 'Analysis of audit performance by audit type';
COMMENT ON VIEW v_time_tracking_summary IS 'Time tracking statistics per audit';
COMMENT ON VIEW v_audit_risk_assessment IS 'Risk level analysis across audit types';
COMMENT ON VIEW v_ai_usage_analytics IS 'AI model usage and performance metrics';
COMMENT ON VIEW v_notification_analytics IS 'Notification system performance and engagement metrics';
COMMENT ON VIEW v_audit_performance_metrics IS 'Key performance indicators for audit management';
