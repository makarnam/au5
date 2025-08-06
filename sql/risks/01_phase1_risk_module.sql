-- Phase 1 Risk Module Migration
-- Objective: Implement core schema, helpers, seeds, and minimal RLS/RPCs aligned with docs/RISK_MODULE_REQUIREMENTS.md (P1 scope)
-- Safe/idempotent where feasible.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper: update_updated_at_column()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pg_function_is_visible(oid)
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
-- Core lookup tables
-- =========================

-- Risk matrices (5x5 default)
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

-- Risk categories (taxonomy incl. frameworks)
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

-- Appetite thresholds (R-ASM-005)
CREATE TABLE IF NOT EXISTS public.risk_appetite_thresholds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope varchar NOT NULL, -- 'org', 'business_unit:{id}', 'category:{id}'
  min int NOT NULL,
  max int NOT NULL,
  color varchar NOT NULL CHECK (color IN ('green','amber','red')),
  description text,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (min >= 1 AND max <= 25 AND min <= max)
);

-- =========================
-- Core entities
-- =========================

-- Risks register (aligning, adding nullable FKs to categories/matrix)
CREATE TABLE IF NOT EXISTS public.risks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar NOT NULL,
  description text,
  category varchar NOT NULL,
  business_unit_id uuid REFERENCES public.business_units(id),
  probability int CHECK (probability BETWEEN 1 AND 5),
  impact int CHECK (impact BETWEEN 1 AND 5),
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

-- Assessments (historical) (R-ASM-001, R-ASM-004)
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

-- Treatments (R-TRT-003, R-TRT-004)
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

-- Risk to Controls mapping (R-TRT-001 reuse)
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
-- Indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_risks_business_unit ON public.risks(business_unit_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON public.risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_level ON public.risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_risks_next_review ON public.risks(next_review_date);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk ON public.risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_treatments_risk ON public.risk_treatments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_controls_risk ON public.risk_controls(risk_id);

-- =========================
-- Scoring functions (R-ASM-001, R-ASM-005)
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

-- Appetite color mapping
CREATE OR REPLACE FUNCTION public.map_score_to_appetite(p_score int, p_scope varchar)
RETURNS varchar AS $$
DECLARE
  v_color varchar;
BEGIN
  SELECT color INTO v_color
  FROM public.risk_appetite_thresholds
  WHERE scope = p_scope
    AND p_score BETWEEN min AND max
  ORDER BY min ASC
  LIMIT 1;

  RETURN COALESCE(v_color, CASE
    WHEN p_score <= 5 THEN 'green'
    WHEN p_score <= 15 THEN 'amber'
    ELSE 'red'
  END);
END;
$$ LANGUAGE plpgsql;

-- Auto-calculation trigger
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

-- Triggers
DROP TRIGGER IF EXISTS tr_risk_updated_at ON public.risks;
CREATE TRIGGER tr_risk_updated_at
BEFORE UPDATE ON public.risks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_risk_assessment_updated_at ON public.risk_assessments;
CREATE TRIGGER tr_risk_assessment_updated_at
BEFORE UPDATE ON public.risk_assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_risk_treatment_updated_at ON public.risk_treatments;
CREATE TRIGGER tr_risk_treatment_updated_at
BEFORE UPDATE ON public.risk_treatments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_risk_control_updated_at ON public.risk_controls;
CREATE TRIGGER tr_risk_control_updated_at
BEFORE UPDATE ON public.risk_controls
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_risk_scoring ON public.risks;
CREATE TRIGGER tr_risk_scoring
BEFORE INSERT OR UPDATE ON public.risks
FOR EACH ROW
EXECUTE FUNCTION public.update_risk_scores();

-- =========================
-- Minimal RLS (read for authenticated; write by creator)
-- =========================
ALTER TABLE public.risk_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_appetite_thresholds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- SELECT policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_matrices_min' AND tablename = 'risk_matrices') THEN
    CREATE POLICY select_risk_matrices_min ON public.risk_matrices FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_categories_min' AND tablename = 'risk_categories') THEN
    CREATE POLICY select_risk_categories_min ON public.risk_categories FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY select_risks_min ON public.risks FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY select_risk_assessments_min ON public.risk_assessments FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY select_risk_treatments_min ON public.risk_treatments FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY select_risk_controls_min ON public.risk_controls FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'select_risk_appetite_thresholds_min' AND tablename = 'risk_appetite_thresholds') THEN
    CREATE POLICY select_risk_appetite_thresholds_min ON public.risk_appetite_thresholds FOR SELECT TO authenticated USING (true);
  END IF;

  -- INSERT policies (creator)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY insert_risks_min ON public.risks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY insert_risk_assessments_min ON public.risk_assessments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY insert_risk_treatments_min ON public.risk_treatments FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY insert_risk_controls_min ON public.risk_controls FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'insert_risk_appetite_thresholds_min' AND tablename = 'risk_appetite_thresholds') THEN
    CREATE POLICY insert_risk_appetite_thresholds_min ON public.risk_appetite_thresholds FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
  END IF;

  -- UPDATE policies (owner)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risks_min' AND tablename = 'risks') THEN
    CREATE POLICY update_risks_min ON public.risks FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_assessments_min' AND tablename = 'risk_assessments') THEN
    CREATE POLICY update_risk_assessments_min ON public.risk_assessments FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_treatments_min' AND tablename = 'risk_treatments') THEN
    CREATE POLICY update_risk_treatments_min ON public.risk_treatments FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_controls_min' AND tablename = 'risk_controls') THEN
    CREATE POLICY update_risk_controls_min ON public.risk_controls FOR UPDATE TO authenticated USING (created_by = auth.uid() OR created_by IS NULL) WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'update_risk_appetite_thresholds_min' AND tablename = 'risk_appetite_thresholds') THEN
    CREATE POLICY update_risk_appetite_thresholds_min ON public.risk_appetite_thresholds FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
  END IF;
END$$;

-- =========================
-- Seeds
-- =========================

-- Default risk matrix
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.risk_matrices WHERE is_default = true) THEN
    INSERT INTO public.risk_matrices (name, description, is_default, is_active)
    VALUES ('Standard 5x5 Risk Matrix', 'Default 5x5 probability/impact matrix', true, true);
  END IF;
END$$;

-- Seed risk categories for frameworks (R-REG-002)
DO $$
BEGIN
  -- COSO examples
  INSERT INTO public.risk_categories(name, description, color, sort_order)
  VALUES
    ('COSO: Control Environment', 'COSO component - Control Environment', '#1F2937', 1),
    ('COSO: Risk Assessment', 'COSO component - Risk Assessment', '#4B5563', 2),
    ('COSO: Control Activities', 'COSO component - Control Activities', '#6B7280', 3),
    ('COSO: Information & Communication', 'COSO component - Info & Comm', '#9CA3AF', 4),
    ('COSO: Monitoring Activities', 'COSO component - Monitoring', '#111827', 5)
  ON CONFLICT (name) DO NOTHING;

  -- ISO 31000 examples
  INSERT INTO public.risk_categories(name, description, color, sort_order)
  VALUES
    ('ISO 31000: Strategic', 'Strategic risks per ISO 31000', '#8B5CF6', 10),
    ('ISO 31000: Operational', 'Operational risks per ISO 31000', '#F59E0B', 11),
    ('ISO 31000: Financial', 'Financial risks per ISO 31000', '#10B981', 12),
    ('ISO 31000: Compliance', 'Compliance risks per ISO 31000', '#3B82F6', 13),
    ('ISO 31000: Reputational', 'Reputational risks per ISO 31000', '#EF4444', 14)
  ON CONFLICT (name) DO NOTHING;

  -- NIST examples
  INSERT INTO public.risk_categories(name, description, color, sort_order)
  VALUES
    ('NIST: Identify', 'NIST CSF - Identify', '#7C3AED', 20),
    ('NIST: Protect', 'NIST CSF - Protect', '#10B981', 21),
    ('NIST: Detect', 'NIST CSF - Detect', '#06B6D4', 22),
    ('NIST: Respond', 'NIST CSF - Respond', '#F97316', 23),
    ('NIST: Recover', 'NIST CSF - Recover', '#22C55E', 24)
  ON CONFLICT (name) DO NOTHING;
END$$;

-- Default appetite thresholds (org scope)
DO $$
BEGIN
  -- green 1-8, amber 9-16, red 17-25 as a sensible default
  IF NOT EXISTS (SELECT 1 FROM public.risk_appetite_thresholds WHERE scope = 'org' AND color = 'green') THEN
    INSERT INTO public.risk_appetite_thresholds(scope, min, max, color, description)
    VALUES ('org', 1, 8, 'green', 'Within appetite');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.risk_appetite_thresholds WHERE scope = 'org' AND color = 'amber') THEN
    INSERT INTO public.risk_appetite_thresholds(scope, min, max, color, description)
    VALUES ('org', 9, 16, 'amber', 'Monitor/mitigate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.risk_appetite_thresholds WHERE scope = 'org' AND color = 'red') THEN
    INSERT INTO public.risk_appetite_thresholds(scope, min, max, color, description)
    VALUES ('org', 17, 25, 'red', 'Above appetite - urgent action');
  END IF;
END$$;

-- =========================
-- RPC helpers for UI
-- =========================

-- Start treatment (R-TRT-003/004)
CREATE OR REPLACE FUNCTION public.start_risk_treatment(p_risk_id uuid, p_treatment_type varchar, p_title varchar, p_description text)
RETURNS uuid AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.risk_treatments(risk_id, treatment_type, title, description, status, created_by)
  VALUES (p_risk_id, p_treatment_type, p_title, p_description, 'planned', auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create assessment and compute score/level (R-ASM-001, R-ASM-004)
CREATE OR REPLACE FUNCTION public.create_risk_assessment(
  p_risk_id uuid,
  p_probability int,
  p_impact int,
  p_assessment_type varchar DEFAULT 'periodic',
  p_notes text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_level varchar;
  v_score int;
  v_id uuid;
  v_matrix uuid;
BEGIN
  SELECT risk_matrix_id INTO v_matrix FROM public.risks WHERE id = p_risk_id;
  v_score := public.calculate_risk_score(p_probability, p_impact, v_matrix);
  v_level := public.calculate_risk_level(p_probability, p_impact, v_matrix);

  INSERT INTO public.risk_assessments(
    risk_id, probability, impact, risk_score, risk_level, assessment_type, assessment_notes, created_by
  ) VALUES (
    p_risk_id, p_probability, p_impact, v_score, v_level, p_assessment_type, p_notes, auth.uid()
  )
  RETURNING id INTO v_id;

  -- update residual score on risk as last known (simple P1 approach)
  UPDATE public.risks SET residual_risk_score = v_score, updated_at = now() WHERE id = p_risk_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Read-friendly view for heatmap (R-MON-002 scope P2 later) - provide minimal P1 support
CREATE OR REPLACE VIEW public.v_risk_heatmap_min AS
SELECT
  r.probability,
  r.impact,
  COUNT(*) AS risk_count,
  calculate_risk_level(r.probability, r.impact, r.risk_matrix_id) AS risk_level
FROM public.risks r
WHERE r.status <> 'closed'
GROUP BY r.probability, r.impact, r.risk_matrix_id;

-- Grants
GRANT EXECUTE ON FUNCTION public.start_risk_treatment(uuid, varchar, varchar, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_risk_assessment(uuid, int, int, varchar, text) TO anon, authenticated, service_role;

-- End of Phase 1 migration