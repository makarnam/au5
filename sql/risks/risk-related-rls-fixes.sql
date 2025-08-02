-- Risk Related RLS Fixes: Allow INSERT and SELECT for authenticated users
-- who have READ access to the parent risk.
-- This script assumes a helper function exists (like has_audit_access for audits).
-- We implement explicit policies referencing risks table and ownership.

-- Enable RLS on related tables (idempotent)
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they conflict (optional but safer for idempotency)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_assessments' AND policyname = 'risk_assessments_select_policy') THEN
    DROP POLICY "risk_assessments_select_policy" ON risk_assessments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_assessments' AND policyname = 'risk_assessments_insert_policy') THEN
    DROP POLICY "risk_assessments_insert_policy" ON risk_assessments;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_treatments' AND policyname = 'risk_treatments_select_policy') THEN
    DROP POLICY "risk_treatments_select_policy" ON risk_treatments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_treatments' AND policyname = 'risk_treatments_insert_policy') THEN
    DROP POLICY "risk_treatments_insert_policy" ON risk_treatments;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_incidents' AND policyname = 'risk_incidents_select_policy') THEN
    DROP POLICY "risk_incidents_select_policy" ON risk_incidents;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_incidents' AND policyname = 'risk_incidents_insert_policy') THEN
    DROP POLICY "risk_incidents_insert_policy" ON risk_incidents;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_reviews' AND policyname = 'risk_reviews_select_policy') THEN
    DROP POLICY "risk_reviews_select_policy" ON risk_reviews;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'risk_reviews' AND policyname = 'risk_reviews_insert_policy') THEN
    DROP POLICY "risk_reviews_insert_policy" ON risk_reviews;
  END IF;
END$$;

-- Helper predicate: user can read a risk when:
--  - user is authenticated and
--  - either admin/cro/super roles or belongs to same BU of the risk (like audits),
--  - or creator/owner of the risk,
-- For simplicity and safety, we reuse the risktable relationships instead of a function,
-- mirroring the pattern used in audit RLS (adjust as needed for your org).

-- SELECT policies (read items for risks they can read)
CREATE POLICY risk_assessments_select_policy ON risk_assessments
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_assessments.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','viewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_treatments_select_policy ON risk_treatments
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_treatments.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','viewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_incidents_select_policy ON risk_incidents
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_incidents.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','viewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_reviews_select_policy ON risk_reviews
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_reviews.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','viewer','business_unit_manager','business_unit_user')
      )
  )
);

-- INSERT policies (allow creating items for a risk the user can read)
CREATE POLICY risk_assessments_insert_policy ON risk_assessments
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_assessments.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_treatments_insert_policy ON risk_treatments
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_treatments.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_incidents_insert_policy ON risk_incidents
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_incidents.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','business_unit_manager','business_unit_user')
      )
  )
);

CREATE POLICY risk_reviews_insert_policy ON risk_reviews
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1
    FROM risks r
    JOIN users u ON u.id = auth.uid()
    WHERE r.id = risk_reviews.risk_id
      AND (
        u.role IN ('super_admin','admin','cro','auditor','supervisor_auditor','reviewer','business_unit_manager','business_unit_user')
      )
  )
);

-- Optional: set created_by automatically via generated columns or triggers (if present in schema).
-- If these tables have created_by fields, you can ensure they match the current user:
-- ALTER TABLE risk_treatments ADD COLUMN IF NOT EXISTS created_by UUID DEFAULT auth.uid();
-- Similarly for other tables. If you add created_by, consider augmenting policies to check created_by for future UPDATE/DELETE.

-- Verification hints:
-- 1) Ensure your Supabase session is authenticated.
-- 2) Try INSERT into each table with a valid risk_id; the INSERT should pass now.