-- RLS policies and trigger for public.compliance_profiles
-- Purpose: Allow authenticated users to insert/update/delete only their own rows,
-- and auto-populate created_by from auth.uid() if omitted by the client.

-- Enable RLS (safe to re-run)
ALTER TABLE public.compliance_profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure a clean state
DROP POLICY IF EXISTS compliance_profiles_insert_own ON public.compliance_profiles;
DROP POLICY IF EXISTS compliance_profiles_update_own ON public.compliance_profiles;
DROP POLICY IF EXISTS compliance_profiles_delete_own ON public.compliance_profiles;

-- INSERT: allow authenticated users to insert rows they own (created_by = auth.uid())
CREATE POLICY compliance_profiles_insert_own
  ON public.compliance_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: allow authenticated users to update only their own rows
CREATE POLICY compliance_profiles_update_own
  ON public.compliance_profiles
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: allow authenticated users to delete only their own rows
CREATE POLICY compliance_profiles_delete_own
  ON public.compliance_profiles
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Helper function to auto-set created_by to auth.uid() if client omits it
CREATE OR REPLACE FUNCTION public.trg_set_created_by()
RETURNS trigger AS $func$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Recreate trigger to attach to table
DROP TRIGGER IF EXISTS trg_set_created_by_compliance_profiles ON public.compliance_profiles;
CREATE TRIGGER trg_set_created_by_compliance_profiles
  BEFORE INSERT ON public.compliance_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_set_created_by();

-- Optional extension for admin/super_admin to manage all rows:
-- Uncomment and adjust to your roles if needed.
-- DROP POLICY IF EXISTS compliance_profiles_update_own ON public.compliance_profiles;
-- DROP POLICY IF EXISTS compliance_profiles_delete_own ON public.compliance_profiles;
-- CREATE POLICY compliance_profiles_update_admin_or_own
--   ON public.compliance_profiles
--   FOR UPDATE
--   TO authenticated
--   USING (
--     created_by = auth.uid()
--     OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin'))
--   )
--   WITH CHECK (
--     created_by = auth.uid()
--     OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin'))
--   );
-- CREATE POLICY compliance_profiles_delete_admin_or_own
--   ON public.compliance_profiles
--   FOR DELETE
--   TO authenticated
--   USING (
--     created_by = auth.uid()
--     OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin'))
--   );