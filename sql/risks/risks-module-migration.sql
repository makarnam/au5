-- AI Auditor GRC - Enterprise Risk Module Migration (Minimal RLS)
-- File: sql/risks-module-migration.sql
-- Purpose: Align/augment the Risk module to the latest Supabase_Database_Schema.sql with minimal RLS
-- Notes:
--   - This migration is idempotent where feasible (CREATE IF NOT EXISTS / DO blocks).
--   - It focuses on risk domain schema updates, basic helper functions, minimal RLS enabling and baseline policies.
--   - Expand RLS granularity, views, and advanced triggers in a follow-up migration as needed.

-- =========================
-- Extensions (safe enable)
-- =========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================
-- Helper: update_updated_at_column (reused)
-- =========================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
      AND pg_function_is_visible(oid)
  ) THEN
    CREATE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $FN$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $FN$ LANGUAGE plpgsql;
  END IF;
END$$;


-- =========================
-- Risk Matrices
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_matrices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL,
  description text,
  probability_labels jsonb NOT NULL DEFAULT '[
    {"value": 1, "label": "Very Low", "description": "Less than 5% chance"},
    {"value": 2, "label": "Low", "description": "5-25% chance"},
    {"value": 3, "label": "Medium", "description": "25-50% chance"},
    {"value": 4, "label": "High", "description": "50-75% chance"},
    {"value": 5, "label": "Very High", "description": "More than 75% chance"}
  ]',
  impact_labels jsonb NOT NULL DEFAULT '[
    {"value": 1, "label": "Minimal", "description": "Minor operational impact"},
    {"value": 2, "label": "Minor", "description": "Limited operational impact"},
    {"value": 3, "label": "Moderate", "description": "Significant operational impact"},
    {"value": 4, "label": "Major", "description": "Severe operational impact"},
    {"value": 5, "label": "Catastrophic", "description": "Critical operational impact"}
  ]',
  scoring_matrix jsonb NOT NULL DEFAULT '{
    "1": {"1": {"score": 1, "level": "low"}, "2": {"score": 2, "level": "low"}, "3": {"score": 3, "level": "low"}, "4": {"score": 4, "level": "medium"}, "5": {"score": 5, "level": "medium"}},
    "2": {"1": {"score": 2, "level": "low"}, "2": {"score": 4, "level": "medium"}, "3": {"score": 6, "level": "medium"}, "4": {"score": 8, "level": "medium"}, "5": {"score": 10, "level": "high"}},
    "3": {"1": {"score": 3, "level": "low"}, "2": {"score": 6, "level": "medium"}, "3": {"score": 9, "level": "medium"}, "4": {"score": 12, "level": "high"}, "5": {"score": 15, "level": "high"}},
    "4": {"1": {"score": 4, "level": "medium"}, "2": {"score": 8, "level": "medium"}, "3": {"score": 12, "level": "high"}, "4": {"score": 16, "level": "high"}, "5": {"score": 20, "level": "critical"}},
    "5": {"1": {"score": 5, "level": "medium"}, "2": {"score": 10, "level": "high"}, "3": {"score": 15, "level": "high"}, "4": {"score": 20, "level": "critical"}, "5": {"score": 25, "level": "critical"}}
  }',
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Categories
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar NOT NULL UNIQUE,
  description text,
  color varchar DEFAULT '#6B7280',
  parent_id uuid REFERENCES public.risk_categories(id),
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risks (enterprise-wide)
-- Align with provided Supabase_Database_Schema.sql
-- =========================
CREATE TABLE IF NOT EXISTS public.risks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar NOT NULL,
  description text,
  category varchar NOT NULL,
  business_unit_id uuid REFERENCES public.business_units(id),
  probability int CHECK (probability >= 1 AND probability <= 5),
  impact int CHECK (impact >= 1 AND impact <= 5),
  risk_level varchar NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  inherent_risk_score int,
  residual_risk_score int,
  mitigation_strategy text,
  owner_id uuid REFERENCES public.users(id),
  status varchar DEFAULT 'identified' CHECK (status IN ('identified','assessed','treating','monitoring','accepted','transferred','avoided','closed')),
  ai_generated boolean DEFAULT false,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  risk_category_id uuid REFERENCES public.risk_categories(id),
  risk_matrix_id uuid REFERENCES public.risk_matrices(id),
  risk_source varchar,
  likelihood_trend varchar DEFAULT 'stable' CHECK (likelihood_trend IN ('increasing','decreasing','stable')),
  impact_trend varchar DEFAULT 'stable' CHECK (impact_trend IN ('increasing','decreasing','stable')),
  target_probability int CHECK (target_probability BETWEEN 1 AND 5),
  target_impact int CHECK (target_impact BETWEEN 1 AND 5),
  target_risk_score int,
  target_date date,
  escalation_criteria text,
  last_review_date date,
  next_review_date date,
  review_frequency varchar DEFAULT 'quarterly' CHECK (review_frequency IN ('weekly','monthly','quarterly','semi_annually','annually')),
  tags text[],
  external_reference varchar,
  attachments jsonb DEFAULT '[]'
);

-- =========================
-- Risk Appetite
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_appetite (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_unit_id uuid REFERENCES public.business_units(id),
  risk_category_id uuid REFERENCES public.risk_categories(id),
  appetite_level varchar NOT NULL CHECK (appetite_level IN ('very_low','low','medium','high','very_high')),
  tolerance_threshold int CHECK (tolerance_threshold BETWEEN 1 AND 25),
  description text,
  review_frequency varchar DEFAULT 'annually' CHECK (review_frequency IN ('monthly','quarterly','semi_annually','annually')),
  approved_by uuid REFERENCES public.users(id),
  approved_at timestamptz,
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Assessments (historical)
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  assessor_id uuid REFERENCES public.users(id),
  assessment_type varchar DEFAULT 'periodic' CHECK (assessment_type IN ('initial','periodic','triggered','ad_hoc')),
  probability int NOT NULL CHECK (probability BETWEEN 1 AND 5),
  impact int NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_score int NOT NULL,
  risk_level varchar NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  assessment_notes text,
  key_assumptions text,
  data_sources text,
  confidence_level varchar DEFAULT 'medium' CHECK (confidence_level IN ('low','medium','high')),
  review_trigger varchar,
  attachments jsonb DEFAULT '[]',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Treatments
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_treatments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  treatment_type varchar NOT NULL CHECK (treatment_type IN ('mitigate','accept','transfer','avoid','monitor')),
  title varchar NOT NULL,
  description text NOT NULL,
  treatment_strategy text,
  cost_estimate numeric,
  currency varchar DEFAULT 'USD',
  assigned_to uuid REFERENCES public.users(id),
  responsible_department varchar,
  priority varchar DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status varchar DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled','on_hold','overdue')),
  start_date date,
  target_date date,
  completed_date date,
  effectiveness_rating int CHECK (effectiveness_rating BETWEEN 1 AND 5),
  effectiveness_notes text,
  success_criteria text,
  kpis jsonb DEFAULT '[]',
  dependencies text,
  constraints_limitations text,
  attachments jsonb DEFAULT '[]',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Controls Mapping
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_controls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES public.controls(id) ON DELETE CASCADE,
  control_effectiveness varchar DEFAULT 'effective' CHECK (control_effectiveness IN ('effective','partially_effective','ineffective','not_tested')),
  coverage_level varchar DEFAULT 'full' CHECK (coverage_level IN ('full','partial','minimal')),
  control_type varchar DEFAULT 'mitigating' CHECK (control_type IN ('preventive','detective','corrective','mitigating')),
  relationship_notes text,
  last_tested_date date,
  next_test_date date,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (risk_id, control_id)
);

-- =========================
-- Risk Incidents
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  incident_title varchar NOT NULL,
  incident_description text NOT NULL,
  incident_date date NOT NULL,
  discovered_date date DEFAULT CURRENT_DATE,
  reported_by uuid REFERENCES public.users(id),
  severity varchar NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  actual_impact text,
  financial_impact numeric,
  currency varchar DEFAULT 'USD',
  lessons_learned text,
  corrective_actions text,
  preventive_measures text,
  status varchar DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','closed')),
  resolution_date date,
  attachments jsonb DEFAULT '[]',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Reviews
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  reviewer_id uuid NOT NULL REFERENCES public.users(id),
  review_type varchar DEFAULT 'periodic' CHECK (review_type IN ('periodic','triggered','incident_based','audit_based')),
  review_outcome varchar DEFAULT 'no_change' CHECK (review_outcome IN ('no_change','updated','escalated','closed','transferred')),
  risk_status_before varchar,
  risk_status_after varchar,
  probability_before int,
  probability_after int,
  impact_before int,
  impact_after int,
  changes_made text,
  review_notes text,
  recommendations text,
  next_review_date date,
  attachments jsonb DEFAULT '[]',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Risk Workflows
-- =========================
CREATE TABLE IF NOT EXISTS public.risk_workflows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id uuid NOT NULL REFERENCES public.risks(id) ON DELETE CASCADE,
  workflow_type varchar NOT NULL CHECK (workflow_type IN ('approval','review','escalation','notification')),
  current_step int DEFAULT 1,
  total_steps int NOT NULL,
  status varchar DEFAULT 'pending' CHECK (status IN ('pending','in_progress','approved','rejected','cancelled')),
  workflow_data jsonb NOT NULL DEFAULT '{}',
  initiated_by uuid REFERENCES public.users(id),
  initiated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =========================
-- Indexes (performance)
-- =========================
CREATE INDEX IF NOT EXISTS idx_risks_business_unit ON public.risks(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_level ON public.risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_risks_next_review ON public.risks(next_review_date);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk ON public.risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_treatments_risk ON public.risk_treatments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_controls_risk ON public.risk_controls(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_incidents_risk ON public.risk_incidents(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_reviews_risk ON public.risk_reviews(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_workflows_risk ON public.risk_workflows(risk_id);

-- =========================
-- Functions for scoring (calculate_risk_score/level)
-- =========================
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
  p_probability int,
  p_impact int,
  p_matrix_id uuid DEFAULT NULL
) RETURNS int AS $$
DECLARE
  v_score int;
  v_matrix_data jsonb;
BEGIN
  SELECT scoring_matrix INTO v_matrix_data
  FROM public.risk_matrices
  WHERE (p_matrix_id IS NOT NULL AND id = p_matrix_id)
     OR (p_matrix_id IS NULL AND is_default = true)
  ORDER BY is_default DESC
  LIMIT 1;

  IF v_matrix_data IS NULL THEN
    RETURN p_probability * p_impact;
  END IF;

  SELECT (v_matrix_data -> (p_probability::text) -> (p_impact::text) ->> 'score')::int
  INTO v_score;

  RETURN COALESCE(v_score, p_probability * p_impact);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.calculate_risk_level(
  p_probability int,
  p_impact int,
  p_matrix_id uuid DEFAULT NULL
) RETURNS varchar AS $$
DECLARE
  v_level varchar;
  v_matrix_data jsonb;
BEGIN
  SELECT scoring_matrix INTO v_matrix_data
  FROM public.risk_matrices
  WHERE (p_matrix_id IS NOT NULL AND id = p_matrix_id)
     OR (p_matrix_id IS NULL AND is_default = true)
  ORDER BY is_default DESC
  LIMIT 1;

  IF v_matrix_data IS NULL THEN
    CASE
      WHEN (p_probability * p_impact) <= 4 THEN RETURN 'low';
      WHEN (p_probability * p_impact) <= 9 THEN RETURN 'medium';
      WHEN (p_probability * p_impact) <= 15 THEN RETURN 'high';
      ELSE RETURN 'critical';
    END CASE;
  END IF;

  SELECT (v_matrix_data -> (p_probability::text) -> (p_impact::text) ->> 'level')
  INTO v_level;

  RETURN COALESCE(v_level, 'medium');
END;
$$ LANGUAGE plpgsql;

-- Auto-update computed scores on risks
CREATE OR REPLACE FUNCTION public.update_risk_scores()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT')
     OR (OLD.probability IS DISTINCT FROM NEW.probability)
     OR (OLD.impact IS DISTINCT FROM NEW.impact)
     OR (OLD.risk_matrix_id IS DISTINCT FROM NEW.risk_matrix_id)
  THEN
    NEW.inherent_risk_score := public.calculate_risk_score(NEW.probability, NEW.impact, NEW.risk_matrix_id);
    NEW.risk_level := public.calculate_risk_level(NEW.probability, NEW.impact, NEW.risk_matrix_id);
    IF NEW.target_probability IS NOT NULL AND NEW.target_impact IS NOT NULL THEN
      NEW.target_risk_score := public.calculate_risk_score(NEW.target_probability, NEW.target_impact, NEW.risk_matrix_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- Triggers (updated_at + scoring)
-- =========================
CREATE TRIGGER tr_risk_updated_at
BEFORE UPDATE ON public.risks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_assessment_updated_at
BEFORE UPDATE ON public.risk_assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_treatment_updated_at
BEFORE UPDATE ON public.risk_treatments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_control_updated_at
BEFORE UPDATE ON public.risk_controls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_incident_updated_at
BEFORE UPDATE ON public.risk_incidents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_review_updated_at
BEFORE UPDATE ON public.risk_reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_workflows_updated_at
BEFORE UPDATE ON public.risk_workflows
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tr_risk_scoring
BEFORE INSERT OR UPDATE ON public.risks
FOR EACH ROW
EXECUTE FUNCTION public.update_risk_scores();

-- =========================
-- Minimal RLS
-- =========================
ALTER TABLE public.risk_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_appetite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_workflows ENABLE ROW LEVEL SECURITY;

-- Policy strategy (minimal):
--  - Authenticated users can SELECT all risk objects (read)
--  - Insert/Update allowed to authenticated users. In a future migration, restrict per role/business unit ownership.
--  - Delete is omitted for now (manage via soft-delete later if needed).

DO $$
BEGIN
  -- SELECT policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_matrices_min' AND tablename = 'risk_matrices') THEN
    CREATE POLICY select_risk_matrices_min ON public.risk_matrices
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_categories_min' AND tablename = 'risk_categories') THEN
    CREATE POLICY select_risk_categories_min ON public.risk_categories
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY select_risks_min ON public.risks
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_appetite_min' AND tablename = 'risk_appetite') THEN
    CREATE POLICY select_risk_appetite_min ON public.risk_appetite
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY select_risk_assessments_min ON public.risk_assessments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY select_risk_treatments_min ON public.risk_treatments
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY select_risk_controls_min ON public.risk_controls
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_incidents_min' AND tablename = 'risk_incidents') THEN
    CREATE POLICY select_risk_incidents_min ON public.risk_incidents
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_reviews_min' AND tablename = 'risk_reviews') THEN
    CREATE POLICY select_risk_reviews_min ON public.risk_reviews
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_workflows_min' AND tablename = 'risk_workflows') THEN
    CREATE POLICY select_risk_workflows_min ON public.risk_workflows
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- INSERT policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY insert_risks_min ON public.risks
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY insert_risk_assessments_min ON public.risk_assessments
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY insert_risk_treatments_min ON public.risk_treatments
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY insert_risk_controls_min ON public.risk_controls
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_incidents_min' AND tablename = 'risk_incidents') THEN
    CREATE POLICY insert_risk_incidents_min ON public.risk_incidents
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_reviews_min' AND tablename = 'risk_reviews') THEN
    CREATE POLICY insert_risk_reviews_min ON public.risk_reviews
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_workflows_min' AND tablename = 'risk_workflows') THEN
    CREATE POLICY insert_risk_workflows_min ON public.risk_workflows
      FOR INSERT
      TO authenticated
      WITH CHECK (initiated_by = auth.uid() OR initiated_by IS NULL);
  END IF;

  -- UPDATE policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY update_risks_min ON public.risks
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY update_risk_assessments_min ON public.risk_assessments
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY update_risk_treatments_min ON public.risk_treatments
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY update_risk_controls_min ON public.risk_controls
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid() OR created_by IS NULL)
      WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_incidents_min' AND tablename = 'risk_incidents') THEN
    CREATE POLICY update_risk_incidents_min ON public.risk_incidents
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_reviews_min' AND tablename = 'risk_reviews') THEN
    CREATE POLICY update_risk_reviews_min ON public.risk_reviews
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_workflows_min' AND tablename = 'risk_workflows') THEN
    CREATE POLICY update_risk_workflows_min ON public.risk_workflows
      FOR UPDATE
      TO authenticated
      USING (initiated_by = auth.uid() OR initiated_by IS NULL)
      WITH CHECK (initiated_by = auth.uid() OR initiated_by IS NULL);
  END IF;
END$$;

-- =========================
-- Optional seed (minimal)
-- =========================
DO $$
BEGIN
  -- Seed default risk matrix if none exists as default
  IF NOT EXISTS (SELECT 1 FROM public.risk_matrices WHERE is_default = true) THEN
    INSERT INTO public.risk_matrices (name, description, is_default, is_active)
    VALUES ('Standard 5x5 Risk Matrix', 'Default 5x5 probability/impact matrix', true, true);
  END IF;
END$$;

-- End of migration