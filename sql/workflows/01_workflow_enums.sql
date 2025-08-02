-- Workflow enums for approvals
-- This migration is executable on Supabase/Postgres

-- 1) Enum: workflow_entity_type (limited to audits and findings for now)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_entity_type') THEN
    CREATE TYPE public.workflow_entity_type AS ENUM ('audit', 'finding');
  END IF;
END$$;

-- 2) Enum: approval_request_status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_request_status') THEN
    CREATE TYPE public.approval_request_status AS ENUM (
      'pending_approval',
      'in_progress',
      'approved',
      'rejected',
      'revision_required',
      'cancelled'
    );
  END IF;
END$$;

-- 3) Enum: approval_step_status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_step_status') THEN
    CREATE TYPE public.approval_step_status AS ENUM ('pending', 'completed', 'skipped', 'rejected', 'revision_required');
  END IF;
END$$;

-- 4) Enum: approval_action
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_action') THEN
    CREATE TYPE public.approval_action AS ENUM ('approve', 'reject', 'request_revision', 'skip');
  END IF;
END$$;