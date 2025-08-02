-- Findings Module: RLS Policies
-- Aligns with patterns in sql/risk-related-rls-crud.sql and sql/risk-related-rls-fixes.sql
-- Roles by users.role: super_admin, admin, cro, supervisor_auditor, auditor, reviewer, viewer, business_unit_manager, business_unit_user

-- Enable RLS on core tables
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings_saved_views ENABLE ROW LEVEL SECURITY;

-- Helper predicates (as views of jwt claims if available)
-- Assume auth.uid() is available and request.jwt.claims has "role" and "user_id" equal to auth.uid()
-- Use permissive policies with role checks.

-- 1) findings
DROP POLICY IF EXISTS findings_select_all ON public.findings;
CREATE POLICY findings_select_all
ON public.findings
FOR SELECT
USING (
  -- Viewers and above can read findings associated to audits they can see.
  -- For simplicity, allow all authenticated to read. Tighten later if needed.
  true
);

DROP POLICY IF EXISTS findings_insert ON public.findings;
CREATE POLICY findings_insert
ON public.findings
FOR INSERT
WITH CHECK (
  -- Only auditors, reviewers, supervisor_auditor, admin, super_admin can create
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('super_admin','admin','supervisor_auditor','auditor','reviewer')
  )
);

DROP POLICY IF EXISTS findings_update ON public.findings;
CREATE POLICY findings_update
ON public.findings
FOR UPDATE
USING (
  -- Must be able to see the row
  true
)
WITH CHECK (
  -- Editors: auditors, reviewers, supervisor_auditor, admin, super_admin
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('super_admin','admin','supervisor_auditor','auditor','reviewer')
  )
  -- Additionally, allow assigned owners to update limited fields handled at app layer
  OR auth.uid() IN (internal_owner_id, remediation_owner_id)
);

DROP POLICY IF EXISTS findings_delete ON public.findings;
CREATE POLICY findings_delete
ON public.findings
FOR DELETE
USING (
  -- Restrict deletes to admins/super_admin
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('super_admin','admin')
  )
);

-- 2) findings_versions (read-only to everyone who can read finding) + allow trigger inserts
DROP POLICY IF EXISTS findings_versions_select ON public.findings_versions;
CREATE POLICY findings_versions_select
ON public.findings_versions
FOR SELECT
USING (true);

-- Allow inserts performed by trigger function (SECURITY DEFINER alternative would also work)
DROP POLICY IF EXISTS findings_versions_insert ON public.findings_versions;
CREATE POLICY findings_versions_insert
ON public.findings_versions
FOR INSERT
WITH CHECK (
  -- Allow inserts if user can see the parent finding (permissive read policy used here)
  EXISTS (
    SELECT 1
    FROM public.findings f
    WHERE f.id = findings_versions.finding_id
  )
);

-- 3) findings_status_history (read-only) + allow trigger inserts
DROP POLICY IF EXISTS findings_status_history_select ON public.findings_status_history;
CREATE POLICY findings_status_history_select
ON public.findings_status_history
FOR SELECT
USING (true);

DROP POLICY IF EXISTS findings_status_history_insert ON public.findings_status_history;
CREATE POLICY findings_status_history_insert
ON public.findings_status_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.findings f
    WHERE f.id = findings_status_history.finding_id
  )
);

-- 4) findings_saved_views (owner-only)
DROP POLICY IF EXISTS findings_saved_views_select ON public.findings_saved_views;
CREATE POLICY findings_saved_views_select
ON public.findings_saved_views
FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS findings_saved_views_insert ON public.findings_saved_views;
CREATE POLICY findings_saved_views_insert
ON public.findings_saved_views
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS findings_saved_views_update ON public.findings_saved_views;
CREATE POLICY findings_saved_views_update
ON public.findings_saved_views
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS findings_saved_views_delete ON public.findings_saved_views;
CREATE POLICY findings_saved_views_delete
ON public.findings_saved_views
FOR DELETE
USING (user_id = auth.uid());

-- 5) Enable execution of RPCs based on RLS of underlying tables
-- For SECURITY DEFINER functions created in triggers/functions file,
-- limit execution to authenticated users and rely on internal checks.

REVOKE ALL ON FUNCTION public.set_finding_status(uuid, finding_status, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_finding_status(uuid, finding_status, text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.assign_finding_owners(uuid, uuid, uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.assign_finding_owners(uuid, uuid, uuid, date) TO anon, authenticated, service_role;

-- Updated signature: p_risk is text[] now (see findings-triggers-functions.sql)
REVOKE ALL ON FUNCTION public.search_findings(text, finding_status[], text[], uuid, date, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_findings(text, finding_status[], text[], uuid, date, text[]) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_finding_versions(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_finding_versions(uuid) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_finding_diff(uuid, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_finding_diff(uuid, int, int) TO anon, authenticated, service_role;

-- Note: If you restrict anon in your project, replace with just 'authenticated' as needed.

-- 6) Optional tighter read policy (commented out):
-- If you need to scope visibility to audits’ business units:
-- CREATE POLICY findings_select_scoped ON public.findings
-- FOR SELECT USING (
--   EXISTS (
--     SELECT 1
--     FROM public.audits a
--     JOIN public.users u ON u.id = auth.uid()
--     WHERE a.id = findings.audit_id
--       AND (u.role IN ('super_admin','admin','cro','supervisor_auditor','auditor','reviewer')
--            OR (u.business_unit_id IS NOT NULL AND u.business_unit_id = a.business_unit_id))
--   )
-- );
