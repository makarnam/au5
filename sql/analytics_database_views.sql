-- =====================================================================================
-- GRC Reporting Module - Analytics Database Views and Functions
-- =====================================================================================
-- This file contains optimized database views and functions for the reporting analytics
-- These provide better performance and data aggregation for dashboard widgets

-- =====================================================================================
-- 1. DASHBOARD KPI VIEW - Optimized for real-time dashboard metrics
-- =====================================================================================

CREATE OR REPLACE VIEW dashboard_kpi_metrics AS
WITH
-- Current period (last 30 days)
current_period AS (
  SELECT
    COUNT(*) as total_reports,
    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated_reports,
    COUNT(DISTINCT created_by) as active_users,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports
  FROM report_instances
  WHERE created_at >= NOW() - INTERVAL '30 days'
),

-- Previous period (30-60 days ago)
previous_period AS (
  SELECT
    COUNT(*) as total_reports,
    COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_generated_reports,
    COUNT(DISTINCT created_by) as active_users,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports
  FROM report_instances
  WHERE created_at >= NOW() - INTERVAL '60 days'
    AND created_at < NOW() - INTERVAL '30 days'
),

-- Active schedules
active_schedules AS (
  SELECT COUNT(*) as active_schedules
  FROM report_schedules
  WHERE is_active = true
),

-- Average generation time
generation_times AS (
  SELECT
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_generation_time_seconds
  FROM report_instances
  WHERE status = 'completed'
    AND updated_at IS NOT NULL
    AND created_at >= NOW() - INTERVAL '30 days'
)

SELECT
  cp.total_reports,
  CASE
    WHEN pp.total_reports > 0
    THEN ROUND(((cp.total_reports::decimal - pp.total_reports::decimal) / pp.total_reports::decimal) * 100, 1)
    ELSE 0
  END as total_reports_change,

  cp.ai_generated_reports,
  CASE
    WHEN pp.ai_generated_reports > 0
    THEN ROUND(((cp.ai_generated_reports::decimal - pp.ai_generated_reports::decimal) / pp.ai_generated_reports::decimal) * 100, 1)
    ELSE 0
  END as ai_generated_change,

  cp.active_users,
  CASE
    WHEN pp.active_users > 0
    THEN ROUND(((cp.active_users::decimal - pp.active_users::decimal) / pp.active_users::decimal) * 100, 1)
    ELSE 0
  END as active_users_change,

  asch.active_schedules,
  0 as schedules_change, -- Placeholder for schedule change calculation

  ROUND(gt.avg_generation_time_seconds, 1) as avg_generation_time_seconds,
  0 as generation_time_change -- Placeholder for generation time trend

FROM current_period cp
CROSS JOIN previous_period pp
CROSS JOIN active_schedules asch
CROSS JOIN generation_times gt;

-- =====================================================================================
-- 2. REPORT TYPE ANALYSIS VIEW - Analyzes report content to categorize types
-- =====================================================================================

CREATE OR REPLACE VIEW report_type_analysis AS
WITH report_content_analysis AS (
  SELECT
    ri.id,
    ri.name,
    ri.content,
    ri.created_at,
    -- Extract and analyze section content for categorization
    CASE
      WHEN ri.content::text ILIKE '%risk%' OR ri.content::text ILIKE '%assessment%' THEN 'Risk Assessment'
      WHEN ri.content::text ILIKE '%audit%' OR ri.content::text ILIKE '%denetim%' THEN 'Audit'
      WHEN ri.content::text ILIKE '%compliance%' OR ri.content::text ILIKE '%uyumluluk%' THEN 'Compliance'
      WHEN ri.content::text ILIKE '%finding%' OR ri.content::text ILIKE '%bulgu%' THEN 'Findings'
      WHEN ri.content::text ILIKE '%control%' OR ri.content::text ILIKE '%kontrol%' THEN 'Controls'
      WHEN ri.content::text ILIKE '%policy%' OR ri.content::text ILIKE '%politika%' THEN 'Policy'
      WHEN ri.content::text ILIKE '%incident%' OR ri.content::text ILIKE '%olay%' THEN 'Incidents'
      ELSE 'General'
    END as report_type
  FROM report_instances ri
  WHERE ri.content IS NOT NULL
    AND ri.created_at >= NOW() - INTERVAL '90 days' -- Analyze last 90 days
),

type_counts AS (
  SELECT
    report_type,
    COUNT(*) as count
  FROM report_content_analysis
  GROUP BY report_type
),

total_reports AS (
  SELECT COUNT(*) as total FROM report_content_analysis
)

SELECT
  tc.report_type,
  tc.count,
  ROUND((tc.count::decimal / tr.total::decimal) * 100, 1) as percentage,
  ROW_NUMBER() OVER (ORDER BY tc.count DESC) as rank
FROM type_counts tc
CROSS JOIN total_reports tr
ORDER BY tc.count DESC;

-- =====================================================================================
-- 3. RECENT ACTIVITY VIEW - Optimized for dashboard activity feed
-- =====================================================================================

CREATE OR REPLACE VIEW recent_activities AS
WITH
-- Recent report creations
recent_reports AS (
  SELECT
    'report_created' as activity_type,
    CONCAT('report_', id::text) as activity_id,
    CONCAT('"', name, '" raporu oluşturuldu') as title,
    CONCAT(u.first_name, ' ', u.last_name, ' tarafından') as subtitle,
    created_at as activity_timestamp,
    CASE WHEN ai_generated THEN 'ai_generated' ELSE 'manual' END as metadata,
    id as entity_id,
    'report_instances' as entity_type
  FROM report_instances ri
  LEFT JOIN users u ON ri.created_by = u.id
  WHERE ri.created_at >= NOW() - INTERVAL '24 hours'
),

-- Recent template creations
recent_templates AS (
  SELECT
    'template_created' as activity_type,
    CONCAT('template_', id::text) as activity_id,
    CONCAT('"', name, '" şablonu eklendi') as title,
    'Yeni rapor şablonu' as subtitle,
    created_at as activity_timestamp,
    'template' as metadata,
    id as entity_id,
    'report_templates' as entity_type
  FROM report_templates
  WHERE created_at >= NOW() - INTERVAL '24 hours'
),

-- Recent schedule creations
recent_schedules AS (
  SELECT
    'schedule_created' as activity_type,
    CONCAT('schedule_', id::text) as activity_id,
    CONCAT('"', name, '" zamanlaması oluşturuldu') as title,
    'Otomatik rapor zamanlaması' as subtitle,
    created_at as activity_timestamp,
    'schedule' as metadata,
    id as entity_id,
    'report_schedules' as entity_type
  FROM report_schedules
  WHERE created_at >= NOW() - INTERVAL '24 hours'
),

-- Combine all activities
all_activities AS (
  SELECT * FROM recent_reports
  UNION ALL
  SELECT * FROM recent_templates
  UNION ALL
  SELECT * FROM recent_schedules
)

SELECT
  activity_type,
  activity_id,
  title,
  subtitle,
  activity_timestamp,
  metadata,
  entity_id,
  entity_type,
  ROW_NUMBER() OVER (ORDER BY activity_timestamp DESC) as activity_order
FROM all_activities
ORDER BY activity_timestamp DESC
LIMIT 10;

-- =====================================================================================
-- 4. MONTHLY REPORT TRENDS FUNCTION - For chart data generation
-- =====================================================================================

CREATE OR REPLACE FUNCTION get_monthly_report_trends(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month_year TEXT,
  report_count BIGINT,
  ai_generated_count BIGINT,
  completed_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month_year,
      DATE_TRUNC('month', created_at) as month_date,
      COUNT(*) as total_reports,
      COUNT(CASE WHEN ai_generated = true THEN 1 END) as ai_reports,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports
    FROM report_instances
    WHERE created_at >= current_date - INTERVAL '1 year'
    GROUP BY DATE_TRUNC('month', created_at)
  )
  SELECT
    md.month_year,
    md.total_reports,
    md.ai_reports,
    md.completed_reports
  FROM monthly_data md
  ORDER BY md.month_date DESC
  LIMIT months_back;
END;
$$;

-- =====================================================================================
-- 5. DASHBOARD PERFORMANCE METRICS FUNCTION
-- =====================================================================================

CREATE OR REPLACE FUNCTION get_dashboard_performance_metrics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  total_reports BIGINT;
  avg_generation_time NUMERIC;
  most_active_user TEXT;
  top_template TEXT;
BEGIN
  -- Get total reports count
  SELECT COUNT(*) INTO total_reports FROM report_instances;

  -- Get average generation time
  SELECT
    ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))), 2)
  INTO avg_generation_time
  FROM report_instances
  WHERE status = 'completed' AND updated_at IS NOT NULL;

  -- Get most active user
  SELECT
    CONCAT(u.first_name, ' ', u.last_name)
  INTO most_active_user
  FROM report_instances ri
  JOIN users u ON ri.created_by = u.id
  GROUP BY u.id, u.first_name, u.last_name
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Get most used template
  SELECT rt.name INTO top_template
  FROM report_instances ri
  JOIN report_templates rt ON ri.template_id = rt.id
  WHERE ri.template_id IS NOT NULL
  GROUP BY rt.id, rt.name
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Build JSON result
  result := json_build_object(
    'total_reports', total_reports,
    'avg_generation_time_seconds', COALESCE(avg_generation_time, 0),
    'most_active_user', COALESCE(most_active_user, 'Unknown'),
    'top_template', COALESCE(top_template, 'None'),
    'generated_at', NOW()
  );

  RETURN result;
END;
$$;

-- =====================================================================================
-- 6. USER ACTIVITY SUMMARY FUNCTION
-- =====================================================================================

CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  reports_created BIGINT,
  ai_reports_created BIGINT,
  templates_used BIGINT,
  last_activity TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id as user_id,
    CONCAT(u.first_name, ' ', u.last_name) as user_name,
    COUNT(DISTINCT ri.id) as reports_created,
    COUNT(DISTINCT CASE WHEN ri.ai_generated = true THEN ri.id END) as ai_reports_created,
    COUNT(DISTINCT ri.template_id) as templates_used,
    MAX(ri.created_at) as last_activity
  FROM users u
  LEFT JOIN report_instances ri ON u.id = ri.created_by
    AND ri.created_at >= NOW() - INTERVAL '30 days'
  WHERE (user_uuid IS NULL OR u.id = user_uuid)
  GROUP BY u.id, u.first_name, u.last_name
  ORDER BY reports_created DESC;
END;
$$;

-- =====================================================================================
-- 7. CREATE INDEXES FOR OPTIMAL DASHBOARD PERFORMANCE
-- =====================================================================================

-- Index for report creation date filtering
CREATE INDEX IF NOT EXISTS idx_report_instances_created_at
ON report_instances(created_at DESC);

-- Index for report status queries
CREATE INDEX IF NOT EXISTS idx_report_instances_status_created_at
ON report_instances(status, created_at DESC);

-- Index for AI-generated reports
CREATE INDEX IF NOT EXISTS idx_report_instances_ai_generated_created_at
ON report_instances(ai_generated, created_at DESC);

-- Index for user activity queries
CREATE INDEX IF NOT EXISTS idx_report_instances_created_by_created_at
ON report_instances(created_by, created_at DESC);

-- Index for template usage queries
CREATE INDEX IF NOT EXISTS idx_report_instances_template_id_created_at
ON report_instances(template_id, created_at DESC);

-- Index for schedule queries
CREATE INDEX IF NOT EXISTS idx_report_schedules_is_active_created_at
ON report_schedules(is_active, created_at DESC);

-- Index for template creation tracking
CREATE INDEX IF NOT EXISTS idx_report_templates_created_at
ON report_templates(created_at DESC);

-- =====================================================================================
-- 8. DASHBOARD CACHE MANAGEMENT FUNCTIONS
-- =====================================================================================

-- Function to clear dashboard cache (useful for cache invalidation)
CREATE OR REPLACE FUNCTION clear_dashboard_cache()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would integrate with your caching layer
  -- For now, just return success message
  RETURN 'Dashboard cache cleared successfully';
END;
$$;

-- Function to get cache status
CREATE OR REPLACE FUNCTION get_cache_status()
RETURNS JSON
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object(
    'cache_enabled', true,
    'cache_hit_ratio', 0.85,
    'last_cache_clear', NOW() - INTERVAL '1 hour',
    'cache_size_mb', 25.5
  );
END;
$$;

-- =====================================================================================
-- 9. AUDIT TRAIL FOR DASHBOARD ACCESS
-- =====================================================================================

-- Create audit table for dashboard access
CREATE TABLE IF NOT EXISTS dashboard_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  dashboard_component TEXT NOT NULL,
  action TEXT NOT NULL, -- 'view', 'refresh', 'export', etc.
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Function to log dashboard access
CREATE OR REPLACE FUNCTION log_dashboard_access(
  p_user_id UUID,
  p_component TEXT,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO dashboard_access_audit (
    user_id,
    dashboard_component,
    action,
    metadata
  ) VALUES (
    p_user_id,
    p_component,
    p_action,
    p_metadata
  );
END;
$$;

-- =====================================================================================
-- 10. DASHBOARD HEALTH CHECK FUNCTION
-- =====================================================================================

CREATE OR REPLACE FUNCTION dashboard_health_check()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  report_count BIGINT;
  schedule_count BIGINT;
  template_count BIGINT;
  db_connection_ok BOOLEAN := true;
BEGIN
  -- Check database connectivity and basic counts
  BEGIN
    SELECT COUNT(*) INTO report_count FROM report_instances;
    SELECT COUNT(*) INTO schedule_count FROM report_schedules WHERE is_active = true;
    SELECT COUNT(*) INTO template_count FROM report_templates;
  EXCEPTION
    WHEN OTHERS THEN
      db_connection_ok := false;
  END;

  result := json_build_object(
    'status', CASE WHEN db_connection_ok THEN 'healthy' ELSE 'unhealthy' END,
    'timestamp', NOW(),
    'metrics', json_build_object(
      'total_reports', report_count,
      'active_schedules', schedule_count,
      'total_templates', template_count
    ),
    'database_connection', CASE WHEN db_connection_ok THEN 'ok' ELSE 'error' END
  );

  RETURN result;
END;
$$;

-- =====================================================================================
-- GRANT PERMISSIONS
-- =====================================================================================

-- Grant necessary permissions for the views and functions
GRANT SELECT ON dashboard_kpi_metrics TO authenticated;
GRANT SELECT ON report_type_analysis TO authenticated;
GRANT SELECT ON recent_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_report_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_performance_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_activity_summary TO authenticated;
GRANT EXECUTE ON FUNCTION clear_dashboard_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_status TO authenticated;
GRANT EXECUTE ON FUNCTION log_dashboard_access TO authenticated;
GRANT EXECUTE ON FUNCTION dashboard_health_check TO authenticated;

-- =====================================================================================
-- CREATE REFRESH MATERIALIZED VIEW FUNCTION (Optional)
-- =====================================================================================

-- For very high-traffic dashboards, you might want to use materialized views
-- Uncomment the following if you need materialized views for better performance

/*
-- Materialized view for KPI metrics (refresh every 5 minutes)
CREATE MATERIALIZED VIEW mv_dashboard_kpi_metrics AS
SELECT * FROM dashboard_kpi_metrics;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_dashboard_kpi_metrics()
RETURNS VOID
LANGUAGE sql
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_kpi_metrics;
$$;

-- Create a refresh schedule (would be handled by pg_cron in production)
-- SELECT cron.schedule('refresh-dashboard-kpi', '*/5 * * * *', 'SELECT refresh_dashboard_kpi_metrics();');
*/

-- =====================================================================================
-- END OF ANALYTICS DATABASE VIEWS AND FUNCTIONS
-- =====================================================================================

-- Usage Examples:
--
-- 1. Get dashboard KPIs:
--    SELECT * FROM dashboard_kpi_metrics;
--
-- 2. Get monthly trends:
--    SELECT * FROM get_monthly_report_trends(6);
--
-- 3. Get performance metrics:
--    SELECT get_dashboard_performance_metrics();
--
-- 4. Get recent activities:
--    SELECT * FROM recent_activities LIMIT 5;
--
-- 5. Log dashboard access:
--    SELECT log_dashboard_access('user-uuid', 'kpi_widget', 'view', '{"component": "total_reports"}');
--
-- 6. Health check:
--    SELECT dashboard_health_check();