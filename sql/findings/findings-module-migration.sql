-- Findings Module Migration
-- This migration extends the schema to support a complete, auditable Findings workflow.
-- It follows conventions used in risk-related migrations in this repo.
-- NOTE: Review RLS policies file and triggers file that accompany this migration.

-- 1) Enumerations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'finding_status') THEN
    CREATE TYPE finding_status AS ENUM ('draft','under_review','open','remediated','closed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_rating_level') THEN
    CREATE TYPE risk_rating_level AS ENUM ('low','medium','high','critical');
  END IF;
END $$;

-- 2) Table: findings (augment existing if needed)
-- Existing table public.findings already exists in Supabase_Database_Schema.sql with some columns.
-- We normalize/extend to meet module requirements. Add missing columns if they do not exist.

-- Helper: add column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='control_failure'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN control_failure boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='audit_reference'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN audit_reference character varying;
  END IF;

  -- status workflow alignment
  -- If existing status doesn't match new enum, keep original but add computed column for new workflow, else align type.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='status'
  ) THEN
    -- Create canonical_status using enum if status not already the canonical enum
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='findings' AND column_name='workflow_status'
    ) THEN
      ALTER TABLE public.findings ADD COLUMN workflow_status finding_status DEFAULT 'draft';
      -- Attempt to map existing statuses into workflow_status
      UPDATE public.findings
      SET workflow_status = CASE LOWER(status)
        WHEN 'open' THEN 'open'::finding_status
        WHEN 'in_progress' THEN 'open'::finding_status
        WHEN 'resolved' THEN 'remediated'::finding_status
        WHEN 'closed' THEN 'closed'::finding_status
        WHEN 'deferred' THEN 'under_review'::finding_status
        ELSE 'draft'::finding_status
      END;
    END IF;
  ELSE
    -- If there is no status column, add workflow_status as the primary
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='findings' AND column_name='workflow_status'
    ) THEN
      ALTER TABLE public.findings ADD COLUMN workflow_status finding_status DEFAULT 'draft';
    END IF;
  END IF;

  -- risk_rating should be constrained to levels; if present as varchar, keep but add check compatible
  -- If missing, add typed column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='risk_rating'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN risk_rating risk_rating_level NOT NULL DEFAULT 'medium';
  ELSE
    -- Ensure values comply, but do not force cast in migration to avoid failures; enforce via trigger later if needed.
    -- No-op here for safety.
    NULL;
  END IF;

  -- tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='tags'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];
  END IF;

  -- attachments (jsonb to allow metadata)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='attachments'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- ownership fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='internal_owner_id'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN internal_owner_id uuid;
    ALTER TABLE public.findings ADD CONSTRAINT findings_internal_owner_id_fkey FOREIGN KEY (internal_owner_id) REFERENCES public.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='remediation_owner_id'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN remediation_owner_id uuid;
    ALTER TABLE public.findings ADD CONSTRAINT findings_remediation_owner_id_fkey FOREIGN KEY (remediation_owner_id) REFERENCES public.users(id);
  END IF;

  -- due date (remediation_due_date)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='remediation_due_date'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN remediation_due_date date;
  END IF;

  -- updated_by
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='updated_by'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN updated_by uuid;
    ALTER TABLE public.findings ADD CONSTRAINT findings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);
  END IF;

  -- workflow timestamps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='submitted_at'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN submitted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='reviewed_at'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN reviewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='opened_at'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN opened_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='remediated_at'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN remediated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='findings' AND column_name='closed_at'
  ) THEN
    ALTER TABLE public.findings ADD COLUMN closed_at timestamptz;
  END IF;

END $$;

-- 3) Versioning: immutable snapshots
CREATE TABLE IF NOT EXISTS public.findings_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  finding_id uuid NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  version integer NOT NULL,
  changed_by uuid REFERENCES public.users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  diff jsonb,             -- optional computed differences
  snapshot jsonb NOT NULL -- full row snapshot excluding volatile fields
);

-- Maintain unique version per finding
CREATE UNIQUE INDEX IF NOT EXISTS ux_findings_versions_finding_version
  ON public.findings_versions (finding_id, version);

-- 4) Status history
CREATE TABLE IF NOT EXISTS public.findings_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  finding_id uuid NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  old_status finding_status,
  new_status finding_status NOT NULL,
  changed_by uuid REFERENCES public.users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  change_reason text
);

CREATE INDEX IF NOT EXISTS ix_findings_status_history_finding_id
  ON public.findings_status_history (finding_id, changed_at DESC);

-- 5) Saved filter views
CREATE TABLE IF NOT EXISTS public.findings_saved_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_findings_saved_views_user_name
  ON public.findings_saved_views (user_id, name);

-- 6) Convenience view: comments for findings
CREATE OR REPLACE VIEW public.findings_comments_v AS
SELECT c.*
FROM public.comments c
WHERE c.entity_type = 'finding';

-- 7) Convenience view: evidence files for findings
CREATE OR REPLACE VIEW public.findings_evidence_v AS
SELECT e.*
FROM public.evidence_files e
WHERE e.entity_type = 'finding';

-- 8) Validation constraints on findings
-- Title length and not blank
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_findings_title_nonempty'
  ) THEN
    ALTER TABLE public.findings
      ADD CONSTRAINT chk_findings_title_nonempty
      CHECK (length(TRIM(BOTH FROM title)) > 0);
  END IF;
END $$;

-- Optional: max lengths
DO $$
BEGIN
  -- Ensure title reasonable length
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_findings_title_length'
  ) THEN
    ALTER TABLE public.findings
      ADD CONSTRAINT chk_findings_title_length CHECK (char_length(title) <= 200);
  END IF;

  -- Audit reference max length
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_findings_audit_reference_length'
  ) THEN
    ALTER TABLE public.findings
      ADD CONSTRAINT chk_findings_audit_reference_length CHECK (audit_reference IS NULL OR char_length(audit_reference) <= 120);
  END IF;
END $$;

-- 9) Helpful indexes
CREATE INDEX IF NOT EXISTS ix_findings_audit_id ON public.findings (audit_id);
CREATE INDEX IF NOT EXISTS ix_findings_workflow_status ON public.findings (workflow_status);
CREATE INDEX IF NOT EXISTS ix_findings_risk_rating ON public.findings (risk_rating);
CREATE INDEX IF NOT EXISTS ix_findings_remediation_due_date ON public.findings (remediation_due_date);
CREATE INDEX IF NOT EXISTS ix_findings_tags_gin ON public.findings USING GIN (tags);
CREATE INDEX IF NOT EXISTS ix_findings_attachments_gin ON public.findings USING GIN (attachments);

-- 10) RPC stubs (to be implemented in triggers/functions file)
-- get_finding_versions, get_finding_diff, set_finding_status, assign_finding_owners, search_findings

-- This migration focuses on structure. See:
--  - sql/findings-triggers-functions.sql
--  - sql/findings-rls-policies.sql