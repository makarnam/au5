-- Risk Related RLS: Enable UPDATE/DELETE for authenticated users with proper ownership/role checks
-- Scope: risk_assessments, risk_treatments, risk_incidents, risk_reviews
-- Principle: Allow UPDATE/DELETE if user is creator/assignee of the row OR privileged role (super_admin/admin/cro/supervisor_auditor)

-- Ensure RLS is enabled (idempotent)
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_reviews ENABLE ROW LEVEL SECURITY;

-- Add created_by columns if they don't exist; default to auth.uid() to bind ownership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'risk_assessments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE risk_assessments ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'risk_treatments' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE risk_treatments ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'risk_incidents' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE risk_incidents ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'risk_reviews' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE risk_reviews ADD COLUMN created_by UUID DEFAULT auth.uid();
  END IF;
END$$;

-- Backfill created_by for existing rows to the risk owner or created_by in risks if available
-- This is optional, comment out if not needed or if you maintain ownership elsewhere.
-- UPDATE risk_assessments ra SET created_by = r.created_by FROM risks r WHERE ra.created_by IS NULL AND ra.risk_id = r.id;
-- UPDATE risk_treatments rt SET created_by = r.created_by FROM risks r WHERE rt.created_by IS NULL AND rt.risk_id = r.id;
-- UPDATE risk_incidents ri SET created_by = r.created_by FROM risks r WHERE ri.created_by IS NULL AND ri.risk_id = r.id;
-- UPDATE risk_reviews rr SET created_by = r.created_by FROM risks r WHERE rr.created_by IS NULL AND rr.risk_id = r.id;

-- Drop existing conflicting UPDATE/DELETE policies to avoid duplication
DO $$
BEGIN
  -- risk_assessments
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_assessments' AND policyname='risk_assessments_update_policy') THEN
    DROP POLICY "risk_assessments_update_policy" ON risk_assessments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_assessments' AND policyname='risk_assessments_delete_policy') THEN
    DROP POLICY "risk_assessments_delete_policy" ON risk_assessments;
  END IF;

  -- risk_treatments
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_treatments' AND policyname='risk_treatments_update_policy') THEN
    DROP POLICY "risk_treatments_update_policy" ON risk_treatments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_treatments' AND policyname='risk_treatments_delete_policy') THEN
    DROP POLICY "risk_treatments_delete_policy" ON risk_treatments;
  END IF;

  -- risk_incidents
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_incidents' AND policyname='risk_incidents_update_policy') THEN
    DROP POLICY "risk_incidents_update_policy" ON risk_incidents;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_incidents' AND policyname='risk_incidents_delete_policy') THEN
    DROP POLICY "risk_incidents_delete_policy" ON risk_incidents;
  END IF;

  -- risk_reviews
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_reviews' AND policyname='risk_reviews_update_policy') THEN
    DROP POLICY "risk_reviews_update_policy" ON risk_reviews;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='risk_reviews' AND policyname='risk_reviews_delete_policy') THEN
    DROP POLICY "risk_reviews_delete_policy" ON risk_reviews;
  END IF;
END$$;

-- Role helper: privileged roles
CREATE OR REPLACE FUNCTION is_privileged_role(p_user UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  r TEXT;
BEGIN
  SELECT role INTO r FROM users WHERE id = p_user;
  RETURN r IN ('super_admin','admin','cro','supervisor_auditor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- UPDATE/DELETE policies: owner or privileged
-- risk_assessments
CREATE POLICY risk_assessments_update_policy ON risk_assessments
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

CREATE POLICY risk_assessments_delete_policy ON risk_assessments
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

-- risk_treatments
CREATE POLICY risk_treatments_update_policy ON risk_treatments
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

CREATE POLICY risk_treatments_delete_policy ON risk_treatments
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

-- risk_incidents
CREATE POLICY risk_incidents_update_policy ON risk_incidents
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

CREATE POLICY risk_incidents_delete_policy ON risk_incidents
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

-- risk_reviews
CREATE POLICY risk_reviews_update_policy ON risk_reviews
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

CREATE POLICY risk_reviews_delete_policy ON risk_reviews
FOR DELETE
USING (
  auth.role() = 'authenticated' AND (
    created_by = auth.uid() OR is_privileged_role(auth.uid())
  )
);

-- Optional: ensure reviewer_id, assessor_id, assigned_to integrity
-- You can add additional WITH CHECK constraints tying reviewer_id/assessor_id to auth.uid() or privileged roles, if desired.

-- Run order reminder:
-- 1) Run risk-related-rls-fixes.sql (INSERT/SELECT) first (already done)
-- 2) Run this file to add UPDATE/DELETE and created_by defaults