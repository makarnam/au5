-- Compliance Module Migration
-- This script is intended to be run on Supabase/Postgres.
-- It introduces core compliance entities and aligns with existing GRC tables.

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compliance_status') THEN
    CREATE TYPE compliance_status AS ENUM ('unknown','compliant','partially_compliant','non_compliant','not_applicable');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attestation_status') THEN
    CREATE TYPE attestation_status AS ENUM ('draft','in_progress','submitted','approved','rejected','expired');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exception_status') THEN
    CREATE TYPE exception_status AS ENUM ('proposed','approved','rejected','in_effect','expired','withdrawn');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidence_type') THEN
    CREATE TYPE evidence_type AS ENUM ('document','screenshot','ticket','system_export','url','other');
  END IF;
END$$;

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code varchar NOT NULL UNIQUE,
  name varchar NOT NULL,
  version varchar,
  description text,
  authority varchar,
  category varchar,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  parent_section_id uuid REFERENCES public.compliance_sections(id) ON DELETE SET NULL,
  code varchar,
  title varchar NOT NULL,
  description text,
  sort_order int DEFAULT 0,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_requirements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.compliance_sections(id) ON DELETE SET NULL,
  requirement_code varchar NOT NULL,
  title varchar NOT NULL,
  text text NOT NULL,
  guidance text,
  priority public.priority_level DEFAULT 'medium',
  is_active boolean DEFAULT true,
  UNIQUE (framework_id, requirement_code),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  business_unit_id uuid REFERENCES public.business_units(id),
  owner_id uuid REFERENCES public.users(id),
  is_active boolean DEFAULT true,
  tags text[] DEFAULT ARRAY[]::text[],
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_profile_requirements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL REFERENCES public.compliance_profiles(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  applicable boolean DEFAULT true,
  applicability_notes text,
  UNIQUE (profile_id, requirement_id),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requirement_controls_map (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  mapping_strength varchar DEFAULT 'direct',
  notes text,
  UNIQUE (requirement_id, control_id),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.requirement_policies_map (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  policy_id uuid,
  policy_name varchar,
  mapping_notes text,
  UNIQUE (requirement_id, policy_id, policy_name),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  evidence_source evidence_type DEFAULT 'document',
  title varchar NOT NULL,
  description text,
  evidence_file_id uuid REFERENCES public.evidence_files(id) ON DELETE SET NULL,
  external_url text,
  collected_at timestamptz DEFAULT now(),
  collected_by uuid REFERENCES public.users(id),
  expires_at timestamptz,
  is_current boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  status compliance_status NOT NULL DEFAULT 'unknown',
  justification text,
  target_remediation_date date,
  owner_id uuid REFERENCES public.users(id),
  reviewer_id uuid REFERENCES public.users(id),
  last_evaluated_at timestamptz DEFAULT now(),
  score integer CHECK (score IS NULL OR (score BETWEEN 0 AND 100)),
  ai_generated boolean DEFAULT false,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (requirement_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.compliance_attestations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status attestation_status DEFAULT 'draft',
  attestor_id uuid REFERENCES public.users(id),
  statement text,
  attachments jsonb DEFAULT '[]'::jsonb,
  submitted_at timestamptz,
  approved_by uuid REFERENCES public.users(id),
  approved_at timestamptz,
  rejection_reason text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (framework_id, profile_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS public.compliance_exceptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  title varchar NOT NULL,
  description text,
  compensating_controls text,
  risk_acceptance text,
  status exception_status DEFAULT 'proposed',
  requested_by uuid REFERENCES public.users(id),
  approver_id uuid REFERENCES public.users(id),
  effective_from date,
  effective_to date,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_certification_cycles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  name varchar NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status varchar DEFAULT 'planning' CHECK (status IN ('planning','in_progress','submitted','completed','cancelled','on_hold')),
  external_auditor varchar,
  notes text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_posture_snapshots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  compliant_count integer DEFAULT 0 CHECK (compliant_count >= 0),
  partial_count integer DEFAULT 0 CHECK (partial_count >= 0),
  non_compliant_count integer DEFAULT 0 CHECK (non_compliant_count >= 0),
  not_applicable_count integer DEFAULT 0 CHECK (not_applicable_count >= 0),
  unknown_count integer DEFAULT 0 CHECK (unknown_count >= 0),
  overall_score integer CHECK (overall_score IS NULL OR (overall_score BETWEEN 0 AND 100)),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (framework_id, profile_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS public.compliance_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id uuid REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.compliance_profiles(id) ON DELETE SET NULL,
  requirement_id uuid REFERENCES public.compliance_requirements(id) ON DELETE CASCADE,
  title varchar NOT NULL,
  description text,
  status varchar DEFAULT 'open' CHECK (status IN ('open','in_progress','blocked','completed','cancelled')),
  priority public.priority_level DEFAULT 'medium',
  assignee_id uuid REFERENCES public.users(id),
  due_date date,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Views
CREATE OR REPLACE VIEW public.v_requirement_posture AS
SELECT
  r.id AS requirement_id,
  r.framework_id,
  a.profile_id,
  a.status,
  a.score,
  COALESCE(
    (SELECT bool_or(e.status IN ('approved','in_effect'))
     FROM public.compliance_exceptions e
     WHERE e.requirement_id = r.id
       AND (e.profile_id = a.profile_id OR a.profile_id IS NULL)),
    false
  ) AS has_active_exception,
  a.last_evaluated_at
FROM public.compliance_requirements r
LEFT JOIN public.compliance_assessments a
  ON a.requirement_id = r.id;

-- 4) Optional CHECK extension for approvals to support 'compliance'
-- Uncomment and run if you need approval_requests to track compliance items
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.constraint_column_usage
--     WHERE constraint_name = 'approval_requests_entity_type_check'
--   ) THEN
--     ALTER TABLE public.approval_requests
--       DROP CONSTRAINT approval_requests_entity_type_check;
--   END IF;
--   ALTER TABLE public.approval_requests
--     ADD CONSTRAINT approval_requests_entity_type_check
--     CHECK (entity_type IN ('audit','finding','control','risk','compliance'));
-- END $$;

-- 5) Basic helper function to compute snapshot for a given framework/profile/day
CREATE OR REPLACE FUNCTION public.compute_compliance_snapshot(p_framework uuid, p_profile uuid, p_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_compliant int;
  v_partial int;
  v_non int;
  v_na int;
  v_unknown int;
  v_total int;
  v_score int;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN status = 'partially_compliant' THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN status = 'non_compliant' THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN status = 'not_applicable' THEN 1 ELSE 0 END),0),
    COALESCE(SUM(CASE WHEN status = 'unknown' THEN 1 ELSE 0 END),0)
  INTO v_compliant, v_partial, v_non, v_na, v_unknown
  FROM public.compliance_assessments
  WHERE framework_id = p_framework
    AND (profile_id = p_profile OR p_profile IS NULL);

  v_total := v_compliant + v_partial + v_non + v_na + v_unknown;
  IF v_total > 0 THEN
    v_score := round(((v_compliant + 0.5 * v_partial)::numeric / v_total::numeric) * 100)::int;
  ELSE
    v_score := NULL;
  END IF;

  INSERT INTO public.compliance_posture_snapshots (
    framework_id, profile_id, snapshot_date,
    compliant_count, partial_count, non_compliant_count, not_applicable_count, unknown_count,
    overall_score
  ) VALUES (
    p_framework, p_profile, p_date,
    v_compliant, v_partial, v_non, v_na, v_unknown,
    v_score
  )
  ON CONFLICT (framework_id, profile_id, snapshot_date)
  DO UPDATE SET
    compliant_count = EXCLUDED.compliant_count,
    partial_count = EXCLUDED.partial_count,
    non_compliant_count = EXCLUDED.non_compliant_count,
    not_applicable_count = EXCLUDED.not_applicable_count,
    unknown_count = EXCLUDED.unknown_count,
    overall_score = EXCLUDED.overall_score,
    updated_at = now();
END;
$$;

-- 6) RLS enablement (policies should be added separately to match your org model)
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_profile_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_controls_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirement_policies_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_attestations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_certification_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_posture_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;